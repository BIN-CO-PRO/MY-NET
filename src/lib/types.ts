export interface Profile {
  id: string;
  full_name: string;
  title: string;
  bio: string;
  avatar_url: string | null;
  location: string | null;
  email: string | null;
  phone: string | null;
  social_links: Record<string, string> | null;
  certifications: Certification[];
  skills: SkillGroup[];
  journey: JourneyEntry[];
  updated_at: string;
}

export interface Certification {
  name: string;
  issuer: string;
  year: string;
}

export interface SkillGroup {
  category: string;
  items: string[];
}

export interface JourneyEntry {
  year: string;
  title: string;
  description: string;
}

export interface Project {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  content: string | null;
  cover_image: string | null;
  tags: string[];
  technologies: string[];
  is_featured: boolean;
  status: "draft" | "published";
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface FileRecord {
  id: string;
  name: string;
  description: string | null;
  original_name: string | null;
  storage_path: string;
  file_url: string | null;
  mime_type: string | null;
  size: number;
  is_public: boolean;
  category: string | null;
  project_id: string | null;
  download_count: number;
  uploaded_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface Visitor {
  id: string;
  ip: string | null;
  country: string | null;
  device: string | null;
  browser: string | null;
  page: string;
  created_at: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  is_read: boolean;
  created_at: string;
}
