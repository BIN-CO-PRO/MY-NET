export type Profile = {
  id: string;
  full_name: string;
  tagline: string;
  bio: string;
  photo_url: string | null;
  location: string;
  email: string;
  phone: string | null;
  social_links: Record<string, string> | null;
  certifications: Certification[] | null;
  skills: SkillGroup[] | null;
  journey: JourneyItem[] | null;
  updated_at: string;
};

export type Certification = {
  name: string;
  issuer: string;
  year: string;
};

export type SkillGroup = {
  category: string;
  items: string[];
};

export type JourneyItem = {
  year: string;
  title: string;
  description: string;
};

export type Project = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  description: string;
  cover_url: string | null;
  category: string;
  tags: string[] | null;
  featured: boolean;
  live_url: string | null;
  repo_url: string | null;
  file_ids: string[] | null;
  created_at: string;
  updated_at: string;
};

export type FileRecord = {
  id: string;
  name: string;
  storage_path: string;
  mime_type: string;
  size_bytes: number;
  is_public: boolean;
  description: string | null;
  category: string | null;
  created_at: string;
  updated_at: string;
};

export type ProjectInput = {
  slug: string;
  title: string;
  summary: string;
  description: string;
  cover_url: string | null;
  category: string;
  tags: string[];
  featured: boolean;
  live_url: string | null;
  repo_url: string | null;
  file_ids: string[];
};
