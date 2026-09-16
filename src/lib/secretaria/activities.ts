import { createClient } from "@/lib/supabase/server";
import type { SecretariaActivity } from "@/types/database";

export async function getPublishedActivities(): Promise<SecretariaActivity[]> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("adae_secretaria_activities")
    .select("*")
    .eq("is_published", true)
    .order("created_at", { ascending: false });

  return (data ?? []) as SecretariaActivity[];
}

export async function getPublishedActivity(
  id: string,
): Promise<SecretariaActivity | null> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("adae_secretaria_activities")
    .select("*")
    .eq("id", id)
    .eq("is_published", true)
    .maybeSingle();

  return (data as SecretariaActivity | null) ?? null;
}

export async function getAllActivities(): Promise<SecretariaActivity[]> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("adae_secretaria_activities")
    .select("*")
    .order("created_at", { ascending: false });

  return (data ?? []) as SecretariaActivity[];
}

export async function getActivityForAdmin(
  id: string,
): Promise<SecretariaActivity | null> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("adae_secretaria_activities")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  return (data as SecretariaActivity | null) ?? null;
}
