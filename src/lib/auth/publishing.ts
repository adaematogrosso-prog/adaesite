import { createClient } from "@/lib/supabase/server";
import type { ExecutiveRole } from "@/lib/constants";

const PUBLISHER_ROLES: ExecutiveRole[] = [
  "presidente",
  "vice_presidente",
  "secretario",
  "secretario_adjunto",
];

export async function canPublishContent(userId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("adae_can_publish_content", {
    check_user_id: userId,
  });

  if (error) {
    const { data: adminData } = await supabase
      .from("adae_admin_users")
      .select("user_id")
      .eq("user_id", userId)
      .maybeSingle();

    if (adminData) return true;

    const { data: boardData } = await supabase
      .from("adae_executive_members")
      .select("role")
      .eq("linked_user_id", userId)
      .eq("is_active", true)
      .in("role", PUBLISHER_ROLES)
      .maybeSingle();

    return !!boardData;
  }

  return !!data;
}
