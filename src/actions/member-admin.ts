"use server";

import { revalidatePath } from "next/cache";
import { requireApprover, requirePanelAccess } from "@/lib/auth/admin";
import { isPlatformAdminUser } from "@/lib/auth/admin-users.server";
import { confirmMemberEmail } from "@/lib/auth/email-confirm.server";
import { getMemberAuthHealth } from "@/lib/auth/post-login.server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { parseProfileExtraFields } from "@/lib/members/profile-fields";
import { normalizeProfileTextFields } from "@/lib/members/profile-text";
import type { MembershipStatus } from "@/types/database";

const BUCKET = "adae-executive-photos";
const MAX_PHOTO_SIZE = 5 * 1024 * 1024;

type ActionResult = { error?: string; success?: boolean };

function normalizeCep(value: string): string | null {
  const digits = value.replace(/\D/g, "");
  if (digits.length !== 8) return null;
  return digits;
}

function revalidateMemberAdminPaths(userId: string) {
  revalidatePath("/admin/adesoes");
  revalidatePath("/admin/membros");
  revalidatePath("/membros");
  revalidatePath("/perfil");
  revalidatePath("/");
  revalidatePath(`/admin/adesoes?member=${userId}`);
}

export async function updateMemberByApprover(
  userId: string,
  formData: FormData,
): Promise<ActionResult> {
  const { user: reviewer, isAdmin: reviewerIsAdmin, canApprove } =
    await requirePanelAccess();

  if (!canApprove && !reviewerIsAdmin) {
    return { error: "Sem permissão para editar cadastros." };
  }

  const memberId = (formData.get("memberId") as string)?.trim().toUpperCase();
  const fullName = (formData.get("fullName") as string)?.trim();
  const email = (formData.get("email") as string)?.trim().toLowerCase();
  const phone = (formData.get("phone") as string)?.trim();
  const birthDate = formData.get("birthDate") as string;
  const status = formData.get("status") as MembershipStatus;
  const password = (formData.get("password") as string) ?? "";
  const confirmPassword = (formData.get("confirmPassword") as string) ?? "";
  const photo = formData.get("photo") as File | null;

  if (!userId || !memberId || !fullName || !email || !phone || !birthDate) {
    return { error: "Preencha todos os campos obrigatórios." };
  }

  if (!["pending", "approved", "rejected"].includes(status)) {
    return { error: "Status inválido." };
  }

  if (memberId.length < 3) {
    return { error: "Informe um ID DeMolay válido." };
  }

  if (phone.length < 10) {
    return { error: "Informe um telefone válido com DDD." };
  }

  const parsedBirthDate = new Date(birthDate);
  if (Number.isNaN(parsedBirthDate.getTime()) || parsedBirthDate > new Date()) {
    return { error: "Informe uma data de aniversário válida." };
  }

  if (password) {
    if (password.length < 6) {
      return { error: "A senha deve ter pelo menos 6 caracteres." };
    }

    if (password !== confirmPassword) {
      return { error: "As senhas não coincidem." };
    }
  }

  const targetIsAdmin = await isPlatformAdminUser(userId);

  if (targetIsAdmin && !reviewerIsAdmin && password) {
    return {
      error:
        "Somente o administrador da plataforma pode alterar a senha desta conta.",
    };
  }

  const supabase = await createClient();

  const { data: existing, error: fetchError } = await supabase
    .from("adae_member_profiles")
    .select("email, profile_photo_url")
    .eq("user_id", userId)
    .maybeSingle();

  if (fetchError || !existing) {
    return { error: "Membro não encontrado." };
  }

  const extraFields = parseProfileExtraFields(formData);
  const normalized = normalizeProfileTextFields({
    full_name: fullName,
    city: ((formData.get("city") as string) ?? "").trim() || null,
    alumni_college:
      ((formData.get("alumniCollege") as string) ?? "").trim() || null,
    chapter_name:
      ((formData.get("chapterName") as string) ?? "").trim() || null,
    profession: extraFields.profession,
  });

  const updateData: {
    member_id: string;
    full_name: string;
    email: string;
    phone: string;
    birth_date: string;
    cep: string | null;
    city: string | null;
    alumni_college: string | null;
    chapter_name: string | null;
    profession: string | null;
    education_level: string | null;
    is_mason: boolean | null;
    status: MembershipStatus;
    profile_photo_url?: string | null;
  } = {
    member_id: memberId,
    full_name: normalized.full_name,
    email,
    phone,
    birth_date: birthDate,
    cep: normalizeCep((formData.get("cep") as string) ?? ""),
    city: normalized.city,
    alumni_college: normalized.alumni_college,
    chapter_name: normalized.chapter_name,
    profession: normalized.profession,
    education_level: extraFields.education_level,
    is_mason: extraFields.is_mason,
    status,
  };

  if (photo && photo.size > 0) {
    if (!photo.type.startsWith("image/")) {
      return { error: "A foto deve ser uma imagem." };
    }

    if (photo.size > MAX_PHOTO_SIZE) {
      return { error: "A foto deve ter no máximo 5 MB." };
    }

    try {
      const adminClient = createAdminClient();
      const extension = photo.name.split(".").pop()?.toLowerCase() ?? "jpg";
      const filePath = `profiles/${userId}-${Date.now()}.${extension}`;

      const { error: uploadError } = await adminClient.storage
        .from(BUCKET)
        .upload(filePath, photo, {
          upsert: true,
          contentType: photo.type,
        });

      if (uploadError) {
        return { error: "Erro ao enviar a foto de perfil." };
      }

      const {
        data: { publicUrl },
      } = adminClient.storage.from(BUCKET).getPublicUrl(filePath);

      updateData.profile_photo_url = publicUrl;
    } catch {
      return {
        error:
          "Não foi possível enviar a foto. Verifique SUPABASE_SERVICE_ROLE_KEY.",
      };
    }
  }

  const { error: profileError } = await supabase
    .from("adae_member_profiles")
    .update(updateData)
    .eq("user_id", userId);

  if (profileError) {
    if (profileError.code === "23505") {
      return { error: "Este ID DeMolay ou e-mail já está em uso." };
    }

    return { error: "Erro ao salvar os dados do membro." };
  }

  const authChanged =
    email !== existing.email || (password.length > 0 && (!targetIsAdmin || reviewerIsAdmin));

  if (authChanged) {
    try {
      const adminClient = createAdminClient();
      const authUpdate: {
        email?: string;
        password?: string;
        user_metadata: Record<string, string>;
      } = {
        user_metadata: {
          full_name: fullName,
          member_id: memberId,
          phone,
          birth_date: birthDate,
        },
      };

      if (email !== existing.email) {
        authUpdate.email = email;
      }

      if (password && (!targetIsAdmin || reviewerIsAdmin)) {
        authUpdate.password = password;
      }

      const { error: authError } = await adminClient.auth.admin.updateUserById(
        userId,
        authUpdate,
      );

      if (authError) {
        await supabase
          .from("adae_member_profiles")
          .update({ email: existing.email })
          .eq("user_id", userId);

        return {
          error:
            authError.message.includes("already been registered") ||
            authError.message.includes("already registered")
              ? "Este e-mail já está cadastrado em outra conta."
              : "Dados salvos parcialmente. Não foi possível atualizar e-mail ou senha.",
        };
      }
    } catch {
      return {
        error:
          "Dados do perfil salvos, mas não foi possível atualizar login. Configure SUPABASE_SERVICE_ROLE_KEY.",
      };
    }
  }

  await confirmMemberEmail(userId);

  revalidateMemberAdminPaths(userId);
  return { success: true };
}

export async function fetchMemberAuthHealth(userId: string) {
  const { canApprove, isAdmin } = await requirePanelAccess();

  if (!canApprove && !isAdmin) {
    return { error: "Sem permissão." as const };
  }

  return { health: await getMemberAuthHealth(userId) };
}

export async function repairMemberLogin(userId: string): Promise<ActionResult> {
  const { canApprove, isAdmin } = await requirePanelAccess();

  if (!canApprove && !isAdmin) {
    return { error: "Sem permissão para corrigir login." };
  }

  const admin = createAdminClient();
  const { data: profile, error: profileError } = await admin
    .from("adae_member_profiles")
    .select("email, full_name, member_id, phone, birth_date")
    .eq("user_id", userId)
    .maybeSingle();

  if (profileError || !profile) {
    return { error: "Cadastro do membro não encontrado." };
  }

  try {
    const { error: authError } = await admin.auth.admin.updateUserById(userId, {
      email: profile.email,
      email_confirm: true,
      user_metadata: {
        full_name: profile.full_name,
        member_id: profile.member_id,
        phone: profile.phone ?? "",
        birth_date: profile.birth_date ?? "",
      },
    });

    if (authError) {
      return {
        error:
          "Não foi possível sincronizar o login. Verifique se o e-mail não está em outra conta.",
      };
    }
  } catch {
    return {
      error:
        "Não foi possível sincronizar o login. Configure SUPABASE_SERVICE_ROLE_KEY.",
    };
  }

  await confirmMemberEmail(userId);
  revalidateMemberAdminPaths(userId);
  return { success: true };
}

export async function updateMemberAccessBlock(
  userId: string,
  formData: FormData,
): Promise<ActionResult> {
  const { user: reviewer, isAdmin, canApprove } = await requirePanelAccess();

  if (!canApprove && !isAdmin) {
    return { error: "Sem permissão para bloquear membros." };
  }

  if (userId === reviewer.id) {
    return { error: "Você não pode bloquear a si mesmo." };
  }

  if (await isPlatformAdminUser(userId)) {
    return { error: "Não é possível bloquear um administrador da plataforma." };
  }

  const shouldBlock = formData.get("isBlocked") === "true";
  const reason = (formData.get("blockReason") as string)?.trim();

  if (shouldBlock && reason.length < 3) {
    return { error: "Informe o motivo do bloqueio (mínimo 3 caracteres)." };
  }

  const admin = createAdminClient();
  const { error } = await admin
    .from("adae_member_profiles")
    .update({
      is_blocked: shouldBlock,
      blocked_at: shouldBlock ? new Date().toISOString() : null,
      blocked_by: shouldBlock ? reviewer.id : null,
      block_reason: shouldBlock ? reason : null,
    })
    .eq("user_id", userId);

  if (error) {
    return { error: "Erro ao atualizar o bloqueio de acesso." };
  }

  if (shouldBlock) {
    try {
      await admin.auth.admin.signOut(userId, "global");
    } catch (signOutError) {
      console.error("updateMemberAccessBlock signOut error:", signOutError);
    }
  }

  revalidateMemberAdminPaths(userId);
  return { success: true };
}

export async function removeMemberPhotoByApprover(
  userId: string,
): Promise<ActionResult> {
  await requireApprover();
  const supabase = await createClient();

  const { error } = await supabase
    .from("adae_member_profiles")
    .update({ profile_photo_url: null })
    .eq("user_id", userId);

  if (error) {
    return { error: "Erro ao remover a foto de perfil." };
  }

  revalidateMemberAdminPaths(userId);
  return { success: true };
}
