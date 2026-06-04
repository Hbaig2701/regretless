import { supabase } from "@/lib/supabase";
import { MemoryWithExperience } from "@/lib/types";

const COURAGE_CATEGORIES = new Set([2, 4, 9]);

const RECENT_WINDOW_DAYS = 30;

export const DEFAULT_CHRONOLOGICAL_AGE = 27;
export const SEDENTARY_PENALTY_YEARS = 5;
export const PEAK_BONUS_YEARS = 5;
export const WEIGHT_PER_YEAR = 12;

export interface VitalityBreakdown {
  chronologicalAge: number;
  baselineAge: number;
  peakAge: number;
  cognitiveAge: number;
  yearsAhead: number;
  reductionYears: number;
  agingRate: number;
  score: number;
  totalWeight: number;
  totalCompletions: number;
  recentCompletions: number;
  recentWeight: number;
  diversity: number;
  diversityPct: number;
  categoryCounts: Record<number, number>;
  components: {
    volume: number;
    diversity: number;
    recency: number;
  };
  tier: { label: string; description: string };
}

export async function getVitalityInputs(): Promise<MemoryWithExperience[]> {
  const { data, error } = await supabase
    .from("memories")
    .select("*, experience:experiences(*)")
    .order("completed_at", { ascending: true });

  if (error) throw error;
  return (data || []) as MemoryWithExperience[];
}

function memoryWeight(
  timeEstimate: number,
  partySize: number,
  categoryId: number,
  priorCount: number
): number {
  const base = timeEstimate;
  const partyBonus = partySize >= 2 ? 0.3 : 0;
  const noveltyBonus = priorCount === 0 ? 0.5 : priorCount === 1 ? 0.2 : 0;
  const growthBonus = COURAGE_CATEGORIES.has(categoryId) ? 0.3 : 0;
  return base * (1 + partyBonus + noveltyBonus + growthBonus);
}

function vitalityTier(yearsAhead: number): {
  label: string;
  description: string;
} {
  if (yearsAhead <= -4)
    return { label: "Luminous", description: "Your brain is years younger than your years." };
  if (yearsAhead <= -1)
    return { label: "Expanding", description: "You're growing younger than the calendar." };
  if (yearsAhead <= 1)
    return { label: "Equilibrium", description: "Cognitive age matches your real age." };
  if (yearsAhead <= 3)
    return { label: "Awakening", description: "Momentum is building. Keep going." };
  return { label: "Dormant", description: "Routine is aging your mind faster than time." };
}

export function computeVitality(
  memories: MemoryWithExperience[],
  chronologicalAge: number = DEFAULT_CHRONOLOGICAL_AGE
): VitalityBreakdown {
  const sorted = [...memories].sort(
    (a, b) =>
      new Date(a.completed_at).getTime() - new Date(b.completed_at).getTime()
  );

  const categoryCounts: Record<number, number> = {};
  let totalWeight = 0;
  let recentWeight = 0;
  let recentCompletions = 0;
  const recentCutoff = Date.now() - RECENT_WINDOW_DAYS * 86_400_000;

  for (const m of sorted) {
    if (!m.experience) continue;
    const catId = m.experience.category_id;
    const prior = categoryCounts[catId] || 0;
    const w = memoryWeight(
      m.experience.time_estimate,
      m.experience.party_size,
      catId,
      prior
    );
    totalWeight += w;
    if (new Date(m.completed_at).getTime() >= recentCutoff) {
      recentWeight += w;
      recentCompletions += 1;
    }
    categoryCounts[catId] = prior + 1;
  }

  const totalCount = sorted.length;
  let diversity = 0;
  if (totalCount > 0) {
    const entropy =
      -Object.values(categoryCounts).reduce((sum, c) => {
        const p = c / totalCount;
        return sum + (p > 0 ? p * Math.log2(p) : 0);
      }, 0);
    diversity = Math.min(1, entropy / Math.log2(12));
  }

  const maxReduction = SEDENTARY_PENALTY_YEARS + PEAK_BONUS_YEARS;
  const reductionYears = Math.min(maxReduction, totalWeight / WEIGHT_PER_YEAR);

  const baselineAge = chronologicalAge + SEDENTARY_PENALTY_YEARS;
  const peakAge = chronologicalAge - PEAK_BONUS_YEARS;
  const cognitiveAge = baselineAge - reductionYears;
  const yearsAhead = cognitiveAge - chronologicalAge;

  const volumeScore = Math.min(60, totalWeight);
  const diversityScore = diversity * 25;
  const recencyScore = Math.min(15, recentWeight);
  const score = Math.round(volumeScore + diversityScore + recencyScore);

  const agingRate = 1 - score / 200;

  return {
    chronologicalAge,
    baselineAge,
    peakAge,
    cognitiveAge: Math.round(cognitiveAge * 10) / 10,
    yearsAhead: Math.round(yearsAhead * 10) / 10,
    reductionYears: Math.round(reductionYears * 10) / 10,
    agingRate,
    score,
    totalWeight,
    totalCompletions: totalCount,
    recentCompletions,
    recentWeight,
    diversity,
    diversityPct: Math.round(diversity * 100),
    categoryCounts,
    components: {
      volume: Math.round(volumeScore * 10) / 10,
      diversity: Math.round(diversityScore * 10) / 10,
      recency: Math.round(recencyScore * 10) / 10,
    },
    tier: vitalityTier(yearsAhead),
  };
}
