import { createAdminClient } from "@/lib/supabase/admin";
import type { ExecutiveRole } from "@/lib/constants";
import type { MembershipStatus } from "@/types/database";

export type PostLoginAccess = {
  isAdmin: boolean;
  executiveRole?: ExecutiveRole;
  profileStatus?: MembershipStatus;
  isBlocked: boolean;
  profileMissing: boolean;
  authMissing: boolean;
  emailMismatch: boolean;
  accountMismatch: boolean;
  mismatchProfileStatus?: MembershipStatus;
};

export async function resolvePostLoginAccess(
  userId: string,
): Promise<PostLoginAccess> {
  const admin = createAdminClient();

  const [{ data: adminData }, { data: profile }, { data: boardData }] =
    await Promise.all([
      admin
        .from("adae_admin_users")
        .select("user_id")
        .eq("user_id", userId)
        .maybeSingle(),
      admin
        .from("adae_member_profiles")
        .select("status, is_blocked, email")
        .eq("user_id", userId)
        .maybeSingle(),
      admin
        .from("adae_executive_members")
        .select("role")
        .eq("linked_user_id", userId)
        .eq("is_active", true)
        .maybeSingle(),
    ]);

  let authEmail: string | undefined;
  let authMissing = false;

  try {
    const { data: authUser, error } = await admin.auth.admin.getUserById(userId);
    if (error || !authUser.user) {
      authMissing = true;
    } else {
      authEmail = authUser.user.email?.trim().toLowerCase();
    }
  } catch {
    authMissing = true;
  }

  const profileEmail = profile?.email?.trim().toLowerCase();
  const emailMismatch = !!(
    authEmail &&
    profileEmail &&
    authEmail !== profileEmail
  );

  let accountMismatch = false;
  let mismatchProfileStatus: MembershipStatus | undefined;

  if (!profile && authEmail) {
    const { data: profileByEmail } = await admin
      .from("adae_member_profiles")
      .select("user_id, status")
      .eq("email", authEmail)
      .maybeSingle();

    if (profileByEmail && profileByEmail.user_id !== userId) {
      accountMismatch = true;
      mismatchProfileStatus = profileByEmail.status as MembershipStatus;
    }
  }

  return {
    isAdmin: !!adminData,
    executiveRole: boardData?.role as ExecutiveRole | undefined,
    profileStatus: profile?.status as MembershipStatus | undefined,
    isBlocked: !!profile?.is_blocked,
    profileMissing: !profile,
    authMissing,
    emailMismatch,
    accountMismatch,
    mismatchProfileStatus,
  };
}

export type MemberAuthHealth = {
  authEmail: string | null;
  authConfirmed: boolean;
  profileEmail: string | null;
  profileStatus: MembershipStatus | null;
  emailMismatch: boolean;
  authMissing: boolean;
  profileMissing: boolean;
  accountMismatch: boolean;
};

export async function getMemberAuthHealth(
  userId: string,
): Promise<MemberAuthHealth> {
  const access = await resolvePostLoginAccess(userId);
  const admin = createAdminClient();

  let authEmail: string | null = null;
  let authConfirmed = false;

  try {
    const { data: authUser } = await admin.auth.admin.getUserById(userId);
    authEmail = authUser.user?.email?.trim().toLowerCase() ?? null;
    authConfirmed = !!authUser.user?.email_confirmed_at;
  } catch {
    // handled via access.authMissing
  }

  const { data: profile } = await admin
    .from("adae_member_profiles")
    .select("email, status")
    .eq("user_id", userId)
    .maybeSingle();

  return {
    authEmail,
    authConfirmed,
    profileEmail: profile?.email?.trim().toLowerCase() ?? null,
    profileStatus: (profile?.status as MembershipStatus | undefined) ?? null,
    emailMismatch: access.emailMismatch,
    authMissing: access.authMissing,
    profileMissing: access.profileMissing,
    accountMismatch: access.accountMismatch,
  };
}
