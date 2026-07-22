export interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt?: string | null;
  content?: string | null;
  publishedAt?: string | null;
  coverImage?: { url: string } | null;
  category?: { name: string } | null;
  author?: string | null;
  tags?: string | null;
}

export interface Material {
  id: string;
  title: string;
  slug: string;
  description?: string | null;
  content?: string | null;
  kind: string;
  fileUrl?: string | null;
  publishedAt?: string | null;
  coverImage?: { url: string } | null;
  category?: { name: string } | null;
  downloads?: number;
  featured?: boolean;
}

export interface Testimonial {
  id: string;
  name: string;
  role?: string | null;
  company?: string | null;
  content: string;
  avatarUrl?: string | null;
  rating?: number;
  featured?: boolean;
  publishedAt?: string | null;
}

export interface MaterialCategory {
  id: string;
  name: string;
}
