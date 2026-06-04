import { supabase } from "@/lib/supabase";
import { ExperienceStatus, ExperienceStatusType } from "@/lib/types";

export async function getStatusCounts(): Promise<{
  in_progress: number;
  saved: number;
}> {
  const { data, error } = await supabase
    .from("experience_status")
    .select("status")
    .in("status", ["in_progress", "saved"]);

  if (error) throw error;

  const counts = { in_progress: 0, saved: 0 };
  data?.forEach((row) => {
    if (row.status === "in_progress") counts.in_progress++;
    if (row.status === "saved") counts.saved++;
  });
  return counts;
}

export async function getExperiencesByStatus(
  status: ExperienceStatusType
): Promise<ExperienceStatus[]> {
  const { data, error } = await supabase
    .from("experience_status")
    .select("*")
    .eq("status", status)
    .order("started_at", { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function getAllStatuses(): Promise<ExperienceStatus[]> {
  const { data, error } = await supabase
    .from("experience_status")
    .select("*");

  if (error) throw error;
  return data || [];
}

export async function setExperienceStatus(
  experienceId: string,
  status: ExperienceStatusType
): Promise<ExperienceStatus> {
  // Check if a status entry already exists for this experience
  const { data: existing } = await supabase
    .from("experience_status")
    .select("*")
    .eq("experience_id", experienceId)
    .in("status", ["in_progress", "saved", "skipped"])
    .maybeSingle();

  if (existing) {
    // Update existing status
    const { data, error } = await supabase
      .from("experience_status")
      .update({
        status,
        updated_at: new Date().toISOString(),
        ...(status === "completed"
          ? { completed_at: new Date().toISOString() }
          : {}),
      })
      .eq("id", existing.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Create new status entry
  const { data, error } = await supabase
    .from("experience_status")
    .insert({
      experience_id: experienceId,
      status,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function abandonExperience(experienceId: string): Promise<void> {
  const { error } = await supabase
    .from("experience_status")
    .delete()
    .eq("experience_id", experienceId)
    .eq("status", "in_progress");

  if (error) throw error;
}

export async function postponeExperience(
  experienceId: string
): Promise<ExperienceStatus> {
  return setExperienceStatus(experienceId, "saved");
}
