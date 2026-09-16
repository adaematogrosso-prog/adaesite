import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import {
  buildProfileMap,
  resolveExecutiveDisplay,
  type ExecutiveDisplay,
} from "@/lib/members/executive-display";
import type { ExecutiveMember, MemberProfile } from "@/types/database";

export async function getPublicExecutiveBoard(): Promise<ExecutiveDisplay[]> {
  const supabase = await createClient();

  const { data: members } = await supabase
    .from("adae_executive_members")
    .select("*")
    .eq("is_active", true)
    .order("display_order", { ascending: true });

  const executives = (members ?? []) as ExecutiveMember[];
  const linkedUserIds = executives
    .map((executive) => executive.linked_user_id)
    .filter(Boolean) as string[];

  let profileMap = new Map<string, MemberProfile>();

  if (linkedUserIds.length > 0) {
    try {
      const admin = createAdminClient();
      const { data: profiles } = await admin
        .from("adae_member_profiles")
        .select("*")
        .in("user_id", linkedUserIds)
        .eq("status", "approved");

      profileMap = buildProfileMap((profiles ?? []) as MemberProfile[]);
    } catch {
      const { data: profiles } = await supabase
        .from("adae_member_profiles")
        .select("*")
        .in("user_id", linkedUserIds)
        .eq("status", "approved");

      profileMap = buildProfileMap((profiles ?? []) as MemberProfile[]);
    }
  }

  return executives.map((executive) => {
    const profile = executive.linked_user_id
      ? profileMap.get(executive.linked_user_id)
      : null;

    return resolveExecutiveDisplay(executive, profile);
  });
}
