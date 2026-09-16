import { createClient } from "@/lib/supabase/server";
import type { MemberProfile, MembershipStatus } from "@/types/database";

export async function getMemberProfile(
  userId: string,
): Promise<MemberProfile | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("adae_member_profiles")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  return (data as MemberProfile | null) ?? null;
}

export async function resolveMemberProfileForEditor(
  userId: string,
  profile: MemberProfile | null,
  hasPanelAccess: boolean,
) {
  if (profile) return profile;

  const refreshed = await getMemberProfile(userId);
  if (refreshed) return refreshed;

  if (!hasPanelAccess) return null;

  try {
    const { createAdminClient } = await import("@/lib/supabase/admin");
    const adminClient = createAdminClient();
    const { data } = await adminClient
      .from("adae_member_profiles")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    return (data as MemberProfile | null) ?? null;
  } catch {
    return null;
  }
}

export async function canApproveMemberships(userId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("adae_can_approve_memberships", {
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
      .in("role", ["presidente", "vice_presidente"])
      .maybeSingle();

    return !!boardData;
  }

  return !!data;
}

export function isMembershipApproved(profile: MemberProfile | null) {
  return profile?.status === "approved";
}

export function getMembershipBlockReason(
  profile: MemberProfile | null,
  isAdmin: boolean,
): MembershipStatus | "none" {
  if (isAdmin) return "none";
  if (!profile) return "pending";
  if (profile.status === "approved") return "none";
  return profile.status;
}
