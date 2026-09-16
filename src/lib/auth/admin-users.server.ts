import { createAdminClient } from "@/lib/supabase/admin";

export async function getAdminUserIds() {
  try {
    const admin = createAdminClient();
    const { data } = await admin.from("adae_admin_users").select("user_id");
    return new Set((data ?? []).map((row) => row.user_id));
  } catch {
    return new Set<string>();
  }
}

export async function isPlatformAdminUser(userId: string) {
  const adminUserIds = await getAdminUserIds();
  return adminUserIds.has(userId);
}
