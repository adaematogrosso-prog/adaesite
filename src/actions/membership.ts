"use server";

import { revalidatePath } from "next/cache";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { confirmMemberEmail } from "@/lib/auth/email-confirm.server";
import { canApproveMemberships } from "@/lib/auth/membership";
import { getAuthUser } from "@/lib/auth/admin";
import { linkExecutiveToMember } from "@/actions/executive-linking";
import { EXECUTIVE_ROLE_LABELS } from "@/lib/constants";
import type { ExecutiveRole } from "@/lib/constants";

type ActionResult = {
  error?: string;
  success?: boolean;
  linkedRoleLabel?: string;
};

type RegistrationProfilePayload = {
  user_id: string;
  member_id: string;
  full_name: string;
  email: string;
  phone: string;
  birth_date: string;
  status: "pending";
};

export async function resolveLoginEmail(
  identifier: string,
): Promise<{ email?: string; error?: string }> {
  const trimmed = identifier.trim();

  if (!trimmed) {
    return { error: "Informe e-mail ou ID DeMolay." };
  }

  if (trimmed.includes("@")) {
    return { email: trimmed.toLowerCase() };
  }

  try {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("adae_member_profiles")
      .select("email")
      .eq("member_id", trimmed.toUpperCase())
      .maybeSingle();

    if (error || !data?.email) {
      return { error: "ID DeMolay não encontrado." };
    }

    return { email: data.email.toLowerCase() };
  } catch (error) {
    console.error("resolveLoginEmail error:", error);
    return { error: "Não foi possível verificar o ID DeMolay." };
  }
}

const REGISTRATION_OPTIONAL_GROUPS = [["phone", "birth_date"]] as const;

function isSchemaColumnError(error: { code?: string; message?: string } | null) {
  if (!error) return false;

  return (
    error.code === "42703" ||
    error.code === "PGRST204" ||
    /could not find the .* column/i.test(error.message ?? "")
  );
}

function omitKeys<T extends Record<string, unknown>>(
  payload: T,
  keys: readonly string[],
): T {
  const next = { ...payload };
  for (const key of keys) {
    delete next[key];
  }
  return next;
}

async function saveRegistrationProfile(
  db: SupabaseClient,
  payload: RegistrationProfilePayload,
): Promise<{
  error: { code?: string; message?: string } | null;
  strippedKeys: string[];
}> {
  const strippedKeys: string[] = [];
  let attempt: Record<string, unknown> = { ...payload };

  while (true) {
    const { data: existing, error: lookupError } = await db
      .from("adae_member_profiles")
      .select("user_id")
      .eq("user_id", payload.user_id)
      .maybeSingle();

    if (lookupError) {
      return { error: lookupError, strippedKeys };
    }

    const writeResult = existing
      ? await db
          .from("adae_member_profiles")
          .update({
            full_name: attempt.full_name,
            email: attempt.email,
            phone: attempt.phone ?? null,
            birth_date: attempt.birth_date ?? null,
            status: "pending",
          })
          .eq("user_id", payload.user_id)
      : await db.from("adae_member_profiles").insert(attempt);

    if (!writeResult.error) {
      return { error: null, strippedKeys };
    }

    const { error } = writeResult;

    if (!existing && error.code === "23505") {
      if (error.message?.includes("member_id")) {
        return { error, strippedKeys };
      }

      const retry = await db
        .from("adae_member_profiles")
        .update({
          full_name: attempt.full_name,
          email: attempt.email,
          phone: attempt.phone ?? null,
          birth_date: attempt.birth_date ?? null,
          status: "pending",
        })
        .eq("user_id", payload.user_id);

      if (!retry.error) {
        return { error: null, strippedKeys };
      }

      if (!isSchemaColumnError(retry.error)) {
        return { error: retry.error, strippedKeys };
      }
    }

    if (error.code === "23505") {
      return { error, strippedKeys };
    }

    if (!isSchemaColumnError(error)) {
      return { error, strippedKeys };
    }

    const nextGroup = REGISTRATION_OPTIONAL_GROUPS.find((group) =>
      group.some((key) => key in payload && !strippedKeys.includes(key)),
    );

    if (!nextGroup) {
      return { error, strippedKeys };
    }

    strippedKeys.push(...nextGroup);
    attempt = omitKeys(attempt, nextGroup);
  }
}

function registrationProfileError(
  error: { code?: string; message?: string },
  strippedKeys: string[],
) {
  if (error.code === "23505") {
    return "Este ID DeMolay já está cadastrado na plataforma.";
  }

  console.error("registerMember profile error:", error);

  if (strippedKeys.length > 0) {
    return "Conta criada, mas telefone e data de aniversário não puderam ser salvos. Peça à diretoria para completar seu cadastro.";
  }

  return "Conta criada, mas não foi possível registrar a solicitação de adesão. Entre em contato com a diretoria.";
}

async function persistRegistrationProfile(payload: RegistrationProfilePayload) {
  const supabase = await createClient();
  let result = await saveRegistrationProfile(supabase, payload);

  if (!result.error) {
    return result;
  }

  try {
    const adminClient = createAdminClient();
    result = await saveRegistrationProfile(adminClient, payload);
  } catch (adminError) {
    console.error("registerMember admin fallback error:", adminError);
  }

  return result;
}

export async function registerMember(formData: FormData): Promise<ActionResult> {
  const fullName = (formData.get("fullName") as string)?.trim();
  const memberId = (formData.get("memberId") as string)?.trim().toUpperCase();
  const email = (formData.get("email") as string)?.trim().toLowerCase();
  const phone = (formData.get("phone") as string)?.trim();
  const birthDate = formData.get("birthDate") as string;
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!fullName || !memberId || !email || !phone || !birthDate || !password) {
    return { error: "Preencha todos os campos obrigatórios." };
  }

  if (phone.length < 10) {
    return { error: "Informe um telefone válido com DDD." };
  }

  const parsedBirthDate = new Date(birthDate);
  if (Number.isNaN(parsedBirthDate.getTime()) || parsedBirthDate > new Date()) {
    return { error: "Informe uma data de aniversário válida." };
  }

  if (memberId.length < 3) {
    return { error: "Informe um ID DeMolay válido." };
  }

  if (password.length < 6) {
    return { error: "A senha deve ter pelo menos 6 caracteres." };
  }

  if (password !== confirmPassword) {
    return { error: "As senhas não coincidem." };
  }

  const supabase = await createClient();

  const { data, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        member_id: memberId,
        phone,
        birth_date: birthDate,
      },
    },
  });

  if (authError || !data.user) {
    return {
      error: authError?.message.includes("already registered")
        ? "Este e-mail já está cadastrado. Use a aba Entrar com a mesma senha."
        : "Não foi possível criar a conta. Tente novamente.",
    };
  }

  await confirmMemberEmail(data.user.id);

  const profilePayload: RegistrationProfilePayload = {
    user_id: data.user.id,
    member_id: memberId,
    full_name: fullName,
    email,
    phone,
    birth_date: birthDate,
    status: "pending",
  };

  const { error: profileError, strippedKeys } =
    await persistRegistrationProfile(profilePayload);

  if (profileError) {
    return { error: registrationProfileError(profileError, strippedKeys) };
  }

  await supabase.auth.signOut();

  if (strippedKeys.length > 0) {
    return {
      success: true,
      error:
        "Cadastro enviado! Telefone e aniversário serão confirmados pela diretoria.",
    };
  }

  return { success: true };
}

export async function approveMembership(
  userId: string,
  executiveId?: string | null,
): Promise<ActionResult> {
  const reviewer = await getAuthUser();

  if (!reviewer || !(await canApproveMemberships(reviewer.id))) {
    return { error: "Sem permissão para aprovar adesões." };
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from("adae_member_profiles")
    .update({
      status: "approved",
      reviewed_by: reviewer.id,
      reviewed_at: new Date().toISOString(),
      rejection_reason: null,
    })
    .eq("user_id", userId)
    .eq("status", "pending");

  if (error) {
    return { error: "Erro ao aprovar a adesão." };
  }

  await confirmMemberEmail(userId);

  revalidatePath("/admin/adesoes");
  revalidatePath("/admin/membros");
  revalidatePath("/membros");
  revalidatePath("/");

  if (executiveId) {
    const linkResult = await linkExecutiveToMember(executiveId, userId);

    if (linkResult.error) {
      return {
        success: true,
        error:
          "Adesão aprovada, mas não foi possível vincular ao cargo. Vincule em Painel → Membros ADAE-MT.",
      };
    }

    const { data: executive } = await supabase
      .from("adae_executive_members")
      .select("role")
      .eq("id", executiveId)
      .maybeSingle();

    return {
      success: true,
      linkedRoleLabel: executive?.role
        ? EXECUTIVE_ROLE_LABELS[executive.role as ExecutiveRole]
        : undefined,
    };
  }

  return { success: true };
}

export async function rejectMembership(
  userId: string,
  reason: string,
): Promise<ActionResult> {
  const reviewer = await getAuthUser();

  if (!reviewer || !(await canApproveMemberships(reviewer.id))) {
    return { error: "Sem permissão para recusar adesões." };
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from("adae_member_profiles")
    .update({
      status: "rejected",
      reviewed_by: reviewer.id,
      reviewed_at: new Date().toISOString(),
      rejection_reason: reason.trim() || "Adesão recusada pela diretoria.",
    })
    .eq("user_id", userId)
    .eq("status", "pending");

  if (error) {
    return { error: "Erro ao recusar a adesão." };
  }

  revalidatePath("/admin/adesoes");

  return { success: true };
}
