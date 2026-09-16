import { createClient } from "@/lib/supabase/server";
import type { NewsPost } from "@/types/database";

export async function getPublishedNewsPosts(): Promise<NewsPost[]> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("adae_news_posts")
    .select("*")
    .eq("is_published", true)
    .order("created_at", { ascending: false });

  return (data ?? []) as NewsPost[];
}

export async function getPublishedNewsPost(id: string): Promise<NewsPost | null> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("adae_news_posts")
    .select("*")
    .eq("id", id)
    .eq("is_published", true)
    .maybeSingle();

  return (data as NewsPost | null) ?? null;
}

export async function getAllNewsPosts(): Promise<NewsPost[]> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("adae_news_posts")
    .select("*")
    .order("created_at", { ascending: false });

  return (data ?? []) as NewsPost[];
}

export async function getNewsPostForEdit(id: string): Promise<NewsPost | null> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("adae_news_posts")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  return (data as NewsPost | null) ?? null;
}
