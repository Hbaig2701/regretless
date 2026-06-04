import { supabase } from "@/lib/supabase";
import { UserState } from "@/lib/types";

export async function getUserState(): Promise<UserState> {
  const { data, error } = await supabase
    .from("user_state")
    .select("*")
    .eq("id", 1)
    .single();

  if (error) throw error;
  return data;
}

export async function updateFilters(filters: {
  filter_time?: number[];
  filter_price?: number[];
  filter_party?: number[];
  filter_env?: string[];
}): Promise<UserState> {
  const { data, error } = await supabase
    .from("user_state")
    .update(filters)
    .eq("id", 1)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateProfile(patch: {
  name?: string;
  location?: string;
  age?: number;
}): Promise<UserState> {
  const { data, error } = await supabase
    .from("user_state")
    .update(patch)
    .eq("id", 1)
    .select()
    .single();

  if (error) throw error;
  return data;
}
