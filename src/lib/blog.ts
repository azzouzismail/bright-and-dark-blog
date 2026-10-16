import { supabase } from "@/integrations/supabase/client";

export type Category = { id: string; name: string; slug: string };
export type Post = {
  id: string;
  title: string;
  slug: string;
  cover_image_url: string | null;
  category_id: string | null;
  content: string;
  status: "draft" | "published";
  published_at: string | null;
  created_at: string;
  updated_at: string;
  categories?: Category | null;
};

export function excerpt(md: string, len = 150) {
  const text = md
    .replace(/```[\s\S]*?```/g, "")
    .replace(/[#>*_`\-[\]()!]/g, "")
    .replace(/\s+/g, " ")
    .trim();
  return text.length > len ? text.slice(0, len).trimEnd() + "…" : text;
}

export function readingTime(md: string) {
  const words = md.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

export function formatDate(d: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function slugify(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-");
}

export async function fetchCategories(): Promise<Category[]> {
  const { data, error } = await supabase.from("categories").select("id,name,slug").order("name");
  if (error) throw error;
  return data;
}

export async function fetchPublishedPosts(): Promise<Post[]> {
  const { data, error } = await supabase
    .from("posts")
    .select("*, categories(id,name,slug)")
    .eq("status", "published")
    .order("published_at", { ascending: false });
  if (error) throw error;
  return data as Post[];
}

export async function fetchPostBySlug(slug: string): Promise<Post | null> {
  const { data, error } = await supabase
    .from("posts")
    .select("*, categories(id,name,slug)")
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw error;
  return data as Post | null;
}
