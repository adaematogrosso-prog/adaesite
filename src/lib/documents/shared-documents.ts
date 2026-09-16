import { createClient } from "@/lib/supabase/server";
import type { SharedDocument } from "@/types/database";

export async function getSharedDocuments(): Promise<SharedDocument[]> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("adae_shared_documents")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  return (data ?? []) as SharedDocument[];
}

export async function getSharedDocument(
  id: string,
): Promise<SharedDocument | null> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("adae_shared_documents")
    .select("*")
    .eq("id", id)
    .eq("is_active", true)
    .maybeSingle();

  return (data as SharedDocument | null) ?? null;
}
