import { supabase } from "@/lib/supabase";
import { Experience, ExperienceStatus, UserState } from "@/lib/types";

export async function getAllExperiences(): Promise<Experience[]> {
  const { data, error } = await supabase
    .from("experiences")
    .select("*");

  if (error) throw error;
  return data || [];
}

export async function getExperienceById(id: string): Promise<Experience> {
  const { data, error } = await supabase
    .from("experiences")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
}

/**
 * Invitation algorithm:
 * 1. Filter by user preferences (time, price, party size, environment)
 * 2. Exclude completed experiences
 * 3. Exclude in-progress experiences
 * 4. 20% chance to surface a saved experience (with badge)
 * 5. Category balancing: weight toward underrepresented categories
 * 6. Random selection within weights
 */
export function getNextInvitation(
  experiences: Experience[],
  statuses: ExperienceStatus[],
  userState: UserState,
  categoryCounts: Record<number, number>,
  options: {
    excludeIds?: Set<string>;
    savedReminderAllowed?: boolean;
  } = {}
): { experience: Experience; isSavedReminder: boolean } | null {
  const excludeIds = options.excludeIds ?? new Set<string>();
  const savedReminderAllowed = options.savedReminderAllowed ?? true;
  // Build lookup maps
  const statusByExpId = new Map<string, string>();
  statuses.forEach((s) => statusByExpId.set(s.experience_id, s.status));

  // 1. Filter by user preferences
  let eligible = experiences.filter((exp) => {
    // Time filter
    if (userState.filter_time.length > 0) {
      const matchesTime = userState.filter_time.some((maxHours) => {
        if (maxHours === 1) return exp.time_estimate <= 1;
        if (maxHours === 3) return exp.time_estimate <= 3;
        if (maxHours === 99) return exp.time_estimate > 3;
        return true;
      });
      if (!matchesTime) return false;
    }

    // Price filter
    if (userState.filter_price.length > 0) {
      const matchesPrice = userState.filter_price.some((maxPrice) => {
        if (maxPrice === 0) return exp.price_estimate === 0;
        if (maxPrice === 20) return exp.price_estimate <= 20;
        if (maxPrice === 99) return exp.price_estimate > 20;
        return true;
      });
      if (!matchesPrice) return false;
    }

    // Party size filter
    if (userState.filter_party.length > 0) {
      const matchesParty = userState.filter_party.some((size) => {
        if (size === 1) return exp.party_size === 1;
        if (size === 2) return exp.party_size === 2;
        if (size === 3) return exp.party_size >= 3;
        return true;
      });
      if (!matchesParty) return false;
    }

    // Environment filter
    if (userState.filter_env.length > 0 && userState.filter_env.length < 2) {
      if (!userState.filter_env.includes(exp.environment)) return false;
    }

    return true;
  });

  // 2. Exclude completed
  eligible = eligible.filter(
    (exp) => statusByExpId.get(exp.id) !== "completed"
  );

  // 3. Exclude in-progress
  eligible = eligible.filter(
    (exp) => statusByExpId.get(exp.id) !== "in_progress"
  );

  if (eligible.length === 0) return null;

  // 4. Pool partitioning by status, respecting session exclusions
  const partition = (arr: Experience[]) => ({
    unseen: arr.filter((e) => !excludeIds.has(e.id)),
    seen: arr.filter((e) => excludeIds.has(e.id)),
  });

  const fresh = partition(
    eligible.filter((e) => !statusByExpId.has(e.id))
  );
  const saved = partition(
    eligible.filter((e) => statusByExpId.get(e.id) === "saved")
  );
  const skipped = partition(
    eligible.filter((e) => statusByExpId.get(e.id) === "skipped")
  );

  // 5. Saved reminder branch — only if not recently shown
  if (savedReminderAllowed && saved.unseen.length > 0 && Math.random() < 0.2) {
    const idx = Math.floor(Math.random() * saved.unseen.length);
    return { experience: saved.unseen[idx], isSavedReminder: true };
  }

  // 6. Primary pool cascade: fresh > skipped (unseen) > saved (unseen) > recycle anything
  let pool: Experience[];
  if (fresh.unseen.length > 0) {
    pool = fresh.unseen;
  } else if (skipped.unseen.length > 0) {
    pool = skipped.unseen;
  } else if (saved.unseen.length > 0) {
    pool = saved.unseen;
  } else {
    // Everything in eligible has been shown this session — recycle, prefer non-saved
    const recyclable = [...fresh.seen, ...skipped.seen];
    pool = recyclable.length > 0 ? recyclable : saved.seen;
  }

  if (pool.length === 0) return null;

  // 7. Category balancing — weight toward underrepresented categories
  const maxCount = Math.max(...Object.values(categoryCounts), 1);
  const weights = pool.map((exp) => {
    const catCount = categoryCounts[exp.category_id] || 0;
    const weight = catCount === 0 ? 3 : Math.max(1, 3 - (catCount / maxCount) * 2);
    if (statusByExpId.get(exp.id) === "skipped") return weight * 0.5;
    return weight;
  });

  // 8. Weighted random selection
  const totalWeight = weights.reduce((sum, w) => sum + w, 0);
  let random = Math.random() * totalWeight;

  for (let i = 0; i < pool.length; i++) {
    random -= weights[i];
    if (random <= 0) {
      return {
        experience: pool[i],
        isSavedReminder: statusByExpId.get(pool[i].id) === "saved",
      };
    }
  }

  return { experience: pool[0], isSavedReminder: false };
}
