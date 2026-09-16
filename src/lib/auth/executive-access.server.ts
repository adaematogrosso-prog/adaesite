import { createClient } from "@/lib/supabase/server";
import type { ExecutiveRole } from "@/lib/constants";
import {
  SECRETARIA_ROLES,
  TESOURARIA_ROLES,
} from "@/lib/auth/executive-roles";

async function hasExecutiveRole(userId: string, roles: ExecutiveRole[]) {
  const supabase = await createClient();

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
    .in("role", roles)
    .maybeSingle();

  return !!boardData;
}

export async function canAccessSecretaria(userId: string) {
  return hasExecutiveRole(userId, SECRETARIA_ROLES);
}

export async function canAccessTesouraria(userId: string) {
  return hasExecutiveRole(userId, TESOURARIA_ROLES);
}

export async function canManageTreasuryPix(userId: string) {
  const supabase = await createClient();

  const { data: adminData } = await supabase
    .from("adae_admin_users")
    .select("user_id")
    .eq("user_id", userId)
    .maybeSingle();

  if (adminData) return true;

  const { data: presidentData } = await supabase
    .from("adae_executive_members")
    .select("role")
    .eq("linked_user_id", userId)
    .eq("is_active", true)
    .eq("role", "presidente")
    .maybeSingle();

  return !!presidentData;
}
