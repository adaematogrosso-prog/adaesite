import { createClient } from "@/lib/supabase/server";
import type { ExecutiveBoardSettings } from "@/types/database";

const SETTINGS_ID = "current";

const DEFAULT_SETTINGS: ExecutiveBoardSettings = {
  management_term: "2026/2027",
  slate_name: "União e Legado",
};

export async function getPublicExecutiveBoardSettings(): Promise<ExecutiveBoardSettings> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("adae_executive_board_settings")
    .select("management_term, slate_name")
    .eq("id", SETTINGS_ID)
    .maybeSingle();

  if (error || !data) {
    return DEFAULT_SETTINGS;
  }

  return {
    management_term: data.management_term?.trim() || DEFAULT_SETTINGS.management_term,
    slate_name: data.slate_name?.trim() || DEFAULT_SETTINGS.slate_name,
  };
}
