"use server";

import { revalidatePath } from "next/cache";
import type { User } from "@supabase/supabase-js";
import { requireSelfProfileEditor } from "@/lib/auth/admin";
import { resolveMemberProfileForEditor } from "@/lib/auth/membership";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { mergeProfileExtraFields } from "@/lib/members/profile-fields";
import { normalizeProfileTextFields } from "@/lib/members/profile-text";
import { ALUMNI_COLLEGES_MT } from "@/lib/demolay/alumni-colleges-mt";
import { DEMOLAY_CHAPTERS_MT } from "@/lib/demolay/chapters-mt";
import {
  formatAlumniCollegeLabel,
  formatChapterLabel,
  validateOrganizationSelection,
} from "@/lib/demolay/organizations";
import type { MemberProfile } from "@/types/database";

const BUCKET = "adae-executive-photos";
const MAX_PHOTO_SIZE = 5 * 1024 * 1024;

type ActionResult = { error?: string; success?: boolean; warning?: string };

type ProfileUpdateData = {
  full_name: string;
  phone: string | null;
  birth_date: string | null;
  cep: string | null;
  city: string | null;
  alumni_college: string | null;
  chapter_name: string | null;
  profession: string | null;
  education_level: string | null;
  is_mason: boolean | null;
  profile_photo_url?: string;
};

type ProfileUpsertPayload = ProfileUpdateData & {
  user_id: string;
  member_id: string;
  email: string;
  status: MemberProfile["status"];
};

function normalizeCep(value: string): string | null {
  const digits = value.replace(/\D/g, "");
  if (digits.length !== 8) return null;
  return digits;
}

function revalidateMemberPaths() {
  revalidatePath("/perfil");
  revalidatePath("/admin/perfil");
  revalidatePath("/membros");
  revalidatePath("/admin/membros");
  revalidatePath("/admin");
  revalidatePath("/");
}

function tryCreateAdminClient() {
  try {
    return createAdminClient();
  } catch {
    return null;
  }
}

const OPTIONAL_PROFILE_COLUMN_GROUPS = [
  ["profession", "education_level", "is_mason"],
  ["cep", "city", "alumni_college", "chapter_name"],
  ["phone", "birth_date"],
  ["profile_photo_url"],
] as const;

function isSchemaColumnError(error: { code?: string; message?: string } | null) {
  if (!error) return false;

  return (
    error.code === "42703" ||
    error.code === "PGRST204" ||
    /could not find the .* column/i.test(error.message ?? "")
  );
}

function omitProfileKeys<T extends Record<string, unknown>>(
  payload: T,
  keys: readonly string[],
): T {
  const next = { ...payload };
  for (const key of keys) {
    delete next[key];
  }
  return next;
}

type ProfileWriteResult = {
  error: { code?: string; message?: string } | null;
  strippedKeys: string[];
};

async function writeProfileWithColumnFallback<T extends Record<string, unknown>>(
  payload: T,
  write: (attempt: T) => Promise<{ error: { code?: string; message?: string } | null }>,
): Promise<ProfileWriteResult> {
  const strippedKeys: string[] = [];
  let attempt = payload;

  while (true) {
    const { error } = await write(attempt);

    if (!error) {
      return { error: null, strippedKeys };
    }

    if (!isSchemaColumnError(error)) {
      return { error, strippedKeys };
    }

    const nextGroup = OPTIONAL_PROFILE_COLUMN_GROUPS.find((group) =>
      group.some((key) => key in payload && !strippedKeys.includes(key)),
    );

    if (!nextGroup) {
      return { error, strippedKeys };
    }

    strippedKeys.push(...nextGroup);
    attempt = omitProfileKeys(attempt, nextGroup);
  }
}

function profileSaveWarning(strippedKeys: string[], uploadedPhoto: boolean) {
  if (uploadedPhoto && strippedKeys.includes("profile_photo_url")) {
    return "Perfil salvo parcialmente. Para guardar foto e demais campos, execute supabase/migration-profile-all-fields.sql no SQL Editor do Supabase.";
  }

  if (strippedKeys.length > 0) {
    return "Perfil salvo parcialmente. Execute supabase/migration-profile-all-fields.sql no Supabase para habilitar todos os campos.";
  }

  return undefined;
}

async function loadProfileForSave(
  userId: string,
  profile: MemberProfile | null,
  hasPanelAccess: boolean,
) {
  return resolveMemberProfileForEditor(userId, profile, hasPanelAccess);
}

function resolveDefaultFullName(user: User, existing: MemberProfile | null) {
  if (existing?.full_name?.trim()) return existing.full_name.trim();

  const fromMetadata = user.user_metadata?.full_name;
  if (typeof fromMetadata === "string" && fromMetadata.trim()) {
    return fromMetadata.trim();
  }

  if (user.email) {
    return user.email.split("@")[0];
  }

  return "Usuário";
}

function resolveMemberId(
  formData: FormData,
  user: User,
  existing: MemberProfile | null,
) {
  if (existing?.member_id) return existing.member_id;

  const fromForm = ((formData.get("memberId") as string) ?? "")
    .trim()
    .toUpperCase();
  if (fromForm) return fromForm;

  const fromMetadata = user.user_metadata?.member_id;
  if (typeof fromMetadata === "string" && fromMetadata.trim()) {
    return fromMetadata.trim().toUpperCase();
  }

  return `ADM-${user.id.replace(/-/g, "").slice(0, 12).toUpperCase()}`;
}

function mergeProfileFields(
  formData: FormData,
  existing: MemberProfile | null,
  user: User,
  allowCustomOrganizations: boolean,
): ProfileUpdateData | { error: string } {
  const rawFullName = (formData.get("fullName") as string)?.trim();
  const rawPhone = (formData.get("phone") as string)?.trim();
  const rawBirthDate = (formData.get("birthDate") as string)?.trim();
  const rawCep = (formData.get("cep") as string)?.trim();
  const rawCity = (formData.get("city") as string)?.trim();
  const rawAlumniCollege = (formData.get("alumniCollege") as string)?.trim();
  const rawChapterName = (formData.get("chapterName") as string)?.trim();
  const extraFields = mergeProfileExtraFields(formData, existing);

  if (rawBirthDate) {
    const parsedBirthDate = new Date(rawBirthDate);
    if (Number.isNaN(parsedBirthDate.getTime())) {
      return { error: "Data de aniversário inválida." };
    }

    if (parsedBirthDate > new Date()) {
      return { error: "A data de aniversário não pode ser no futuro." };
    }
  }

  const alumniCollegeResult = validateOrganizationSelection(
    rawAlumniCollege || existing?.alumni_college,
    ALUMNI_COLLEGES_MT,
    formatAlumniCollegeLabel,
    allowCustomOrganizations,
    "colégio alumni",
  );

  if (!alumniCollegeResult.ok) {
    return { error: alumniCollegeResult.error };
  }

  const chapterResult = validateOrganizationSelection(
    rawChapterName || existing?.chapter_name,
    DEMOLAY_CHAPTERS_MT,
    formatChapterLabel,
    allowCustomOrganizations,
    "capítulo DeMolay",
  );

  if (!chapterResult.ok) {
    return { error: chapterResult.error };
  }

  const normalized = normalizeProfileTextFields({
    full_name: rawFullName || resolveDefaultFullName(user, existing),
    city: rawCity || existing?.city || null,
    alumni_college: alumniCollegeResult.value,
    chapter_name: chapterResult.value,
    profession: extraFields.profession,
  });

  return {
    full_name: normalized.full_name,
    phone: rawPhone || existing?.phone || null,
    birth_date: rawBirthDate || existing?.birth_date || null,
    cep: rawCep ? normalizeCep(rawCep) : (existing?.cep ?? null),
    city: normalized.city,
    alumni_college: normalized.alumni_college,
    chapter_name: normalized.chapter_name,
    profession: normalized.profession,
    education_level: extraFields.education_level,
    is_mason: extraFields.is_mason,
  };
}

async function uploadProfilePhoto(userId: string, photo: File, useAdmin: boolean) {
  if (!photo.type.startsWith("image/")) {
    return { error: "A foto deve ser uma imagem." as const };
  }

  if (photo.size > MAX_PHOTO_SIZE) {
    return { error: "A foto deve ter no máximo 5 MB." as const };
  }

  const extension = photo.name.split(".").pop()?.toLowerCase() ?? "jpg";
  const filePath = `profiles/${userId}-${Date.now()}.${extension}`;

  if (useAdmin) {
    const adminClient = tryCreateAdminClient();
    if (!adminClient) {
      return {
        error:
          "Não foi possível enviar a foto. Verifique SUPABASE_SERVICE_ROLE_KEY." as const,
      };
    }

    const { error: uploadError } = await adminClient.storage
      .from(BUCKET)
      .upload(filePath, photo, {
        upsert: true,
        contentType: photo.type,
      });

    if (uploadError) {
      console.error("profile photo upload error:", uploadError);
      return { error: "Erro ao enviar a foto de perfil." as const };
    }

    const {
      data: { publicUrl },
    } = adminClient.storage.from(BUCKET).getPublicUrl(filePath);

    return { publicUrl };
  }

  const supabase = await createClient();
  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(filePath, photo, {
      upsert: true,
      contentType: photo.type,
    });

  if (uploadError) {
    console.error("profile photo upload error:", uploadError);
    return { error: "Erro ao enviar a foto de perfil." as const };
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(BUCKET).getPublicUrl(filePath);

  return { publicUrl };
}

async function upsertProfileRow(
  db: ReturnType<typeof createAdminClient>,
  payload: ProfileUpsertPayload,
): Promise<ProfileWriteResult> {
  return writeProfileWithColumnFallback(payload, async (attempt) =>
    db.from("adae_member_profiles").upsert(attempt, {
      onConflict: "user_id",
    }),
  );
}

async function persistProfileUpdate(
  userId: string,
  updateData: ProfileUpdateData,
  hasPanelAccess: boolean,
): Promise<ProfileWriteResult> {
  const adminClient = hasPanelAccess ? tryCreateAdminClient() : null;
  const db = adminClient ?? (await createClient());

  return writeProfileWithColumnFallback(updateData, async (attempt) =>
    db.from("adae_member_profiles").update(attempt).eq("user_id", userId),
  );
}

export async function updateMemberProfile(
  formData: FormData,
): Promise<ActionResult> {
  const { user, profile, hasPanelAccess, canApprove, isAdmin } =
    await requireSelfProfileEditor();
  const existingProfile = await loadProfileForSave(
    user.id,
    profile,
    hasPanelAccess,
  );

  const parsed = mergeProfileFields(
    formData,
    existingProfile,
    user,
    canApprove || isAdmin,
  );

  if ("error" in parsed) {
    return { error: parsed.error };
  }

  const photo = formData.get("photo") as File | null;
  const uploadedPhoto = Boolean(photo && photo.size > 0);
  const updateData: ProfileUpdateData = { ...parsed };

  if (uploadedPhoto && photo) {
    const uploadResult = await uploadProfilePhoto(
      user.id,
      photo,
      hasPanelAccess,
    );

    if ("error" in uploadResult) {
      return { error: uploadResult.error };
    }

    updateData.profile_photo_url = uploadResult.publicUrl;
  }

  if (!user.email) {
    return { error: "E-mail da conta não encontrado." };
  }

  if (hasPanelAccess) {
    const adminClient = tryCreateAdminClient();
    if (!adminClient) {
      return {
        error:
          "Não foi possível salvar o perfil. Verifique SUPABASE_SERVICE_ROLE_KEY.",
      };
    }

    const payload: ProfileUpsertPayload = {
      user_id: user.id,
      member_id: resolveMemberId(formData, user, existingProfile),
      email: existingProfile?.email ?? user.email,
      status: existingProfile?.status ?? "approved",
      ...updateData,
    };

    const { error, strippedKeys } = await upsertProfileRow(adminClient, payload);

    if (error) {
      console.error("profile upsert error:", error);

      if (error.code === "23505") {
        return {
          error:
            "Este ID DeMolay já está em uso. Informe outro ID ou peça ajuda à diretoria.",
        };
      }

      return { error: "Erro ao salvar o perfil." };
    }

    revalidateMemberPaths();

    const warning = profileSaveWarning(strippedKeys, uploadedPhoto);
    if (warning) {
      return { success: true, warning };
    }

    return { success: true };
  }

  if (existingProfile) {
    const { error, strippedKeys } = await persistProfileUpdate(
      user.id,
      updateData,
      hasPanelAccess,
    );

    if (error) {
      return {
        error:
          "Erro ao salvar o perfil. Verifique se sua adesão está aprovada.",
      };
    }

    revalidateMemberPaths();

    const warning = profileSaveWarning(strippedKeys, uploadedPhoto);
    if (warning) {
      return { success: true, warning };
    }

    return { success: true };
  }

  return { error: "Cadastro de membro não encontrado." };
}

export async function updateMemberPassword(
  formData: FormData,
): Promise<ActionResult> {
  await requireSelfProfileEditor();
  const supabase = await createClient();

  const password = (formData.get("password") as string) ?? "";
  const confirmPassword = (formData.get("confirmPassword") as string) ?? "";

  if (!password) {
    return { error: "Informe a nova senha." };
  }

  if (password.length < 6) {
    return { error: "A senha deve ter pelo menos 6 caracteres." };
  }

  if (password !== confirmPassword) {
    return { error: "As senhas não coincidem." };
  }

  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    return { error: "Erro ao alterar a senha." };
  }

  return { success: true };
}

export async function removeMemberProfilePhoto(): Promise<ActionResult> {
  const { user, profile, hasPanelAccess } = await requireSelfProfileEditor();
  const existingProfile = await loadProfileForSave(
    user.id,
    profile,
    hasPanelAccess,
  );

  if (!existingProfile && !hasPanelAccess) {
    return { error: "Cadastro de membro não encontrado." };
  }

  const adminClient = hasPanelAccess ? tryCreateAdminClient() : null;
  const db = adminClient ?? (await createClient());

  const { error } = await db
    .from("adae_member_profiles")
    .update({ profile_photo_url: null })
    .eq("user_id", user.id);

  if (error) {
    return { error: "Erro ao remover a foto de perfil." };
  }

  revalidateMemberPaths();

  return { success: true };
}
