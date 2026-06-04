import { supabase } from "@/lib/supabase";
import { Memory, MemoryWithExperience } from "@/lib/types";

export async function getMemories(): Promise<MemoryWithExperience[]> {
  const { data, error } = await supabase
    .from("memories")
    .select("*, experience:experiences(*)")
    .order("completed_at", { ascending: false });

  if (error) throw error;
  return (data || []).map((m) => ({
    ...m,
    experience: m.experience,
  }));
}

export async function createMemory(memory: {
  experience_id: string;
  reflection?: string;
  location_text?: string;
  photo_url?: string;
  shared: boolean;
}): Promise<Memory> {
  const { data, error } = await supabase
    .from("memories")
    .insert({
      experience_id: memory.experience_id,
      reflection: memory.reflection || null,
      location_text: memory.location_text || null,
      photo_url: memory.photo_url || null,
      shared: memory.shared,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function uploadPhoto(file: File): Promise<string> {
  const fileExt = file.name.split(".").pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from("memory-photos")
    .upload(fileName, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (uploadError) throw uploadError;

  const { data } = supabase.storage
    .from("memory-photos")
    .getPublicUrl(fileName);

  return data.publicUrl;
}

export async function getCategoryCompletionCounts(): Promise<
  Record<number, number>
> {
  const { data, error } = await supabase
    .from("memories")
    .select("experience:experiences(category_id)");

  if (error) throw error;

  const counts: Record<number, number> = {};
  for (let i = 1; i <= 12; i++) counts[i] = 0;

  data?.forEach((m) => {
    const catId = (m.experience as unknown as { category_id: number })
      ?.category_id;
    if (catId) counts[catId] = (counts[catId] || 0) + 1;
  });

  return counts;
}
