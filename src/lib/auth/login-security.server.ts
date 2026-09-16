import { createHash, randomBytes } from "crypto";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendUnlockAccountEmail } from "@/lib/email/send-email.server";

export const MAX_FAILED_LOGIN_ATTEMPTS = 5;
export const UNLOCK_TOKEN_TTL_HOURS = 24;

export type MemberBlockInfo = {
  reason: string;
  blockedByName: string;
};

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export async function getMemberBlockByEmail(
  email: string,
): Promise<MemberBlockInfo | null> {
  const admin = createAdminClient();
  const normalized = normalizeEmail(email);

  const { data: profile } = await admin
    .from("adae_member_profiles")
    .select("is_blocked, block_reason, blocked_by")
    .eq("email", normalized)
    .maybeSingle();

  if (!profile?.is_blocked) {
    return null;
  }

  let blockedByName = "Administrador ADAE-MT";

  if (profile.blocked_by) {
    const { data: blockerProfile } = await admin
      .from("adae_member_profiles")
      .select("full_name")
      .eq("user_id", profile.blocked_by)
      .maybeSingle();

    if (blockerProfile?.full_name) {
      blockedByName = blockerProfile.full_name;
    } else {
      const { data: adminUser } = await admin
        .from("adae_admin_users")
        .select("user_id")
        .eq("user_id", profile.blocked_by)
        .maybeSingle();

      if (adminUser) {
        blockedByName = "Administrador ADAE-MT";
      }
    }
  }

  return {
    reason: profile.block_reason?.trim() || "Sem motivo informado.",
    blockedByName,
  };
}

export async function isLoginLocked(email: string): Promise<boolean> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("adae_login_security")
    .select("locked_at")
    .eq("login_email", normalizeEmail(email))
    .maybeSingle();

  return !!data?.locked_at;
}

export async function recordLoginFailure(email: string): Promise<{
  locked: boolean;
  attemptsRemaining: number;
}> {
  const admin = createAdminClient();
  const normalized = normalizeEmail(email);
  const now = new Date().toISOString();

  const { data: profile } = await admin
    .from("adae_member_profiles")
    .select("user_id")
    .eq("email", normalized)
    .maybeSingle();

  const { data: existing } = await admin
    .from("adae_login_security")
    .select("*")
    .eq("login_email", normalized)
    .maybeSingle();

  if (existing?.locked_at) {
    return { locked: true, attemptsRemaining: 0 };
  }

  const nextCount = (existing?.failed_login_count ?? 0) + 1;
  const shouldLock = nextCount >= MAX_FAILED_LOGIN_ATTEMPTS;

  let unlockTokenHash: string | null = existing?.unlock_token_hash ?? null;
  let unlockTokenExpiresAt: string | null =
    existing?.unlock_token_expires_at ?? null;
  let rawToken: string | null = null;

  if (shouldLock) {
    rawToken = randomBytes(32).toString("hex");
    unlockTokenHash = hashToken(rawToken);
    unlockTokenExpiresAt = new Date(
      Date.now() + UNLOCK_TOKEN_TTL_HOURS * 60 * 60 * 1000,
    ).toISOString();
  }

  const payload = {
    login_email: normalized,
    user_id: profile?.user_id ?? existing?.user_id ?? null,
    failed_login_count: shouldLock ? MAX_FAILED_LOGIN_ATTEMPTS : nextCount,
    locked_at: shouldLock ? now : null,
    unlock_token_hash: unlockTokenHash,
    unlock_token_expires_at: unlockTokenExpiresAt,
    updated_at: now,
  };

  const { error } = await admin.from("adae_login_security").upsert(payload);

  if (error) {
    console.error("recordLoginFailure error:", error);
    return {
      locked: false,
      attemptsRemaining: Math.max(0, MAX_FAILED_LOGIN_ATTEMPTS - nextCount),
    };
  }

  if (shouldLock && rawToken) {
    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
      "http://localhost:3000";
    const unlockUrl = `${siteUrl}/desbloquear-conta?token=${rawToken}`;

    await sendUnlockAccountEmail({
      to: normalized,
      unlockUrl,
    });
  }

  return {
    locked: shouldLock,
    attemptsRemaining: Math.max(0, MAX_FAILED_LOGIN_ATTEMPTS - nextCount),
  };
}

export async function recordLoginSuccess(email: string) {
  const admin = createAdminClient();
  const normalized = normalizeEmail(email);

  await admin.from("adae_login_security").delete().eq("login_email", normalized);
}

export async function unlockAccountByToken(token: string): Promise<{
  ok: boolean;
  error?: string;
}> {
  const trimmed = token.trim();
  if (!trimmed) {
    return { ok: false, error: "Link inválido." };
  }

  const admin = createAdminClient();
  const tokenHash = hashToken(trimmed);
  const now = new Date().toISOString();

  const { data: row } = await admin
    .from("adae_login_security")
    .select("login_email, unlock_token_expires_at")
    .eq("unlock_token_hash", tokenHash)
    .maybeSingle();

  if (!row) {
    return { ok: false, error: "Link inválido ou já utilizado." };
  }

  if (!row.unlock_token_expires_at || row.unlock_token_expires_at < now) {
    return { ok: false, error: "Este link expirou. Tente entrar novamente ou contate o suporte." };
  }

  const { error } = await admin
    .from("adae_login_security")
    .update({
      failed_login_count: 0,
      locked_at: null,
      unlock_token_hash: null,
      unlock_token_expires_at: null,
      updated_at: now,
    })
    .eq("login_email", row.login_email);

  if (error) {
    return { ok: false, error: "Não foi possível desbloquear a conta." };
  }

  return { ok: true };
}
