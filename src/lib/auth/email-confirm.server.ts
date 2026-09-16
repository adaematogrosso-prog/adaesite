import { createAdminClient } from "@/lib/supabase/admin";

export async function confirmMemberEmail(userId: string) {
  try {
    const admin = createAdminClient();
    const { error } = await admin.auth.admin.updateUserById(userId, {
      email_confirm: true,
    });

    if (error) {
      console.error("confirmMemberEmail error:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("confirmMemberEmail error:", error);
    return false;
  }
}

export async function confirmPendingMemberEmails(userIds: string[]) {
  await Promise.all(userIds.map((userId) => confirmMemberEmail(userId)));
}
