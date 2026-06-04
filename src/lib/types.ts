export interface Experience {
  id: string;
  title: string;
  description: string;
  category_id: number;
  time_estimate: number;
  price_estimate: number;
  party_size: number;
  environment: "indoor" | "outdoor";
  is_curated: boolean;
  source_skip_id: string | null;
  created_at: string;
}

export interface UserState {
  id: number;
  name: string;
  location: string;
  member_since: string;
  age: number | null;
  filter_time: number[];
  filter_price: number[];
  filter_party: number[];
  filter_env: string[];
  created_at: string;
}

export type ExperienceStatusType =
  | "in_progress"
  | "saved"
  | "skipped"
  | "completed"
  | "abandoned";

export interface ExperienceStatus {
  id: string;
  experience_id: string;
  status: ExperienceStatusType;
  started_at: string;
  completed_at: string | null;
  updated_at: string;
}

export interface Memory {
  id: string;
  experience_id: string;
  reflection: string | null;
  location_text: string | null;
  photo_url: string | null;
  shared: boolean;
  completed_at: string;
}

export interface MemoryWithExperience extends Memory {
  experience: Experience;
}

export interface ExperienceWithStatus extends Experience {
  experience_status: ExperienceStatus[];
}

export const CATEGORIES: Record<number, { name: string; short: string }> = {
  1: { name: "Creativity & Self-Expression", short: "Creativity" },
  2: { name: "Adventure & Novelty", short: "Adventure" },
  3: { name: "Food & Culture", short: "Food" },
  4: { name: "Social Courage", short: "Social" },
  5: { name: "Love & Relationships", short: "Love" },
  6: { name: "Beauty & Awe", short: "Beauty" },
  7: { name: "Knowledge & Learning", short: "Knowledge" },
  8: { name: "Health & Physicality", short: "Health" },
  9: { name: "Courage & Self-Transformation", short: "Courage" },
  10: { name: "Contribution & Purpose", short: "Purpose" },
  11: { name: "Play & Joy", short: "Play" },
  12: { name: "Career & Future Self", short: "Career" },
};
