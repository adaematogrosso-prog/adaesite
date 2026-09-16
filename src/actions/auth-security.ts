"use server";

import { resolveLoginEmail } from "@/actions/membership";
import {
  getMemberBlockByEmail,
  isLoginLocked,
  recordLoginFailure,
  recordLoginSuccess,
  unlockAccountByToken,
  MAX_FAILED_LOGIN_ATTEMPTS,
  type MemberBlockInfo,
} from "@/lib/auth/login-security.server";
import { resolvePostLoginAccess } from "@/lib/auth/post-login.server";

export type LoginPrecheckResult = {
  email?: string;
  error?: string;
  blocked?: MemberBlockInfo;
  locked?: boolean;
};

export async function precheckLogin(identifier: string): Promise<LoginPrecheckResult> {
  const resolved = await resolveLoginEmail(identifier);

  if (resolved.error || !resolved.email) {
    return { error: resolved.error ?? "Informe e-mail ou ID DeMolay." };
  }

  const blocked = await getMemberBlockByEmail(resolved.email);
  if (blocked) {
    return { email: resolved.email, blocked };
  }

  const locked = await isLoginLocked(resolved.email);
  if (locked) {
    return {
      email: resolved.email,
      locked: true,
      error:
        "Sua conta está bloqueada após várias tentativas incorretas. Verifique seu e-mail para desbloquear o acesso.",
    };
  }

  return { email: resolved.email };
}

export async function reportFailedLogin(identifier: string): Promise<{
  message: string;
  locked: boolean;
}> {
  const resolved = await resolveLoginEmail(identifier);

  if (!resolved.email) {
    return {
      message: "E-mail, ID DeMolay ou senha inválidos. Verifique suas credenciais.",
      locked: false,
    };
  }

  const result = await recordLoginFailure(resolved.email);

  if (result.locked) {
    return {
      locked: true,
      message:
        "Sua conta foi bloqueada após 5 tentativas incorretas. Enviamos um e-mail com o link para desbloquear o acesso.",
    };
  }

  if (result.attemptsRemaining <= 2) {
    return {
      locked: false,
      message: `E-mail, ID DeMolay ou senha inválidos. Restam ${result.attemptsRemaining} tentativa(s) antes do bloqueio.`,
    };
  }

  return {
    locked: false,
    message: "E-mail, ID DeMolay ou senha inválidos. Verifique suas credenciais.",
  };
}

export async function reportSuccessfulLogin(identifier: string) {
  const resolved = await resolveLoginEmail(identifier);
  if (resolved.email) {
    await recordLoginSuccess(resolved.email);
  }
}

export async function unlockAccount(token: string) {
  return unlockAccountByToken(token);
}

export async function getPostLoginAccess(userId: string) {
  return resolvePostLoginAccess(userId);
}
