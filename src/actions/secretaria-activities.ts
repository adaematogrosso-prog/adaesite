"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireSecretariaAccess } from "@/lib/auth/admin";

const BUCKET = "adae-secretaria-activities";
const MAX_BANNER_SIZE = 5 * 1024 * 1024;
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const MAX_VIDEO_SIZE = 50 * 1024 * 1024;

type ActionResult = { error?: string; success?: boolean };
type UploadResult = { error?: string; url?: string };

function revalidateActivityPaths(activityId?: string) {
  revalidatePath("/secretaria/atividades");
  revalidatePath("/admin/secretaria/atividades");
  revalidatePath("/secretaria");
  revalidatePath("/admin/secretaria");
  if (activityId) {
    revalidatePath(`/secretaria/atividades/${activityId}`);
    revalidatePath(`/admin/secretaria/atividades/${activityId}/editar`);
  }
}

function extractStoragePath(publicUrl: string | null): string | null {
  if (!publicUrl) return null;

  const marker = `/storage/v1/object/public/${BUCKET}/`;
  const index = publicUrl.indexOf(marker);
  if (index === -1) return null;
  return decodeURIComponent(publicUrl.slice(index + marker.length));
}

export async function createSecretariaActivity(
  formData: FormData,
): Promise<ActionResult> {
  const { user } = await requireSecretariaAccess();
  const supabase = await createClient();

  const title = (formData.get("title") as string)?.trim();
  const subtitle = (formData.get("subtitle") as string)?.trim() ?? "";
  const content = (formData.get("content") as string)?.trim();
  const banner = formData.get("banner") as File | null;
  const isPublished = formData.get("is_published") !== "off";

  if (!title || !content) {
    return { error: "Informe título e conteúdo da atividade." };
  }

  let bannerImageUrl: string | null = null;

  if (banner && banner.size > 0) {
    if (!banner.type.startsWith("image/")) {
      return { error: "O banner deve ser uma imagem." };
    }

    if (banner.size > MAX_BANNER_SIZE) {
      return { error: "A imagem de banner deve ter no máximo 5 MB." };
    }

    const extension = banner.name.split(".").pop()?.toLowerCase() ?? "jpg";
    const filePath = `${user.id}/banner/${Date.now()}-${crypto.randomUUID()}.${extension}`;

    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(filePath, banner, {
        upsert: false,
        contentType: banner.type,
      });

    if (uploadError) {
      return { error: "Erro ao enviar a imagem de banner." };
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from(BUCKET).getPublicUrl(filePath);

    bannerImageUrl = publicUrl;
  }

  const { error } = await supabase.from("adae_secretaria_activities").insert({
    title,
    subtitle,
    content,
    banner_image_url: bannerImageUrl,
    is_published: isPublished,
    created_by: user.id,
  });

  if (error) {
    return { error: "Erro ao publicar a atividade." };
  }

  revalidateActivityPaths();
  return { success: true };
}

export async function updateSecretariaActivity(
  id: string,
  formData: FormData,
): Promise<ActionResult> {
  const { user } = await requireSecretariaAccess();
  const supabase = await createClient();

  const title = (formData.get("title") as string)?.trim();
  const subtitle = (formData.get("subtitle") as string)?.trim() ?? "";
  const content = (formData.get("content") as string)?.trim();
  const banner = formData.get("banner") as File | null;
  const isPublished = formData.get("is_published") !== "off";

  if (!title || !content) {
    return { error: "Informe título e conteúdo da atividade." };
  }

  const { data: existing, error: fetchError } = await supabase
    .from("adae_secretaria_activities")
    .select("banner_image_url")
    .eq("id", id)
    .maybeSingle();

  if (fetchError || !existing) {
    return { error: "Atividade não encontrada." };
  }

  let bannerImageUrl = existing.banner_image_url;

  if (banner && banner.size > 0) {
    if (!banner.type.startsWith("image/")) {
      return { error: "O banner deve ser uma imagem." };
    }

    if (banner.size > MAX_BANNER_SIZE) {
      return { error: "A imagem de banner deve ter no máximo 5 MB." };
    }

    const extension = banner.name.split(".").pop()?.toLowerCase() ?? "jpg";
    const filePath = `${user.id}/banner/${Date.now()}-${crypto.randomUUID()}.${extension}`;

    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(filePath, banner, {
        upsert: false,
        contentType: banner.type,
      });

    if (uploadError) {
      return { error: "Erro ao enviar a imagem de banner." };
    }

    const oldPath = extractStoragePath(existing.banner_image_url);
    if (oldPath) {
      await supabase.storage.from(BUCKET).remove([oldPath]);
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from(BUCKET).getPublicUrl(filePath);

    bannerImageUrl = publicUrl;
  }

  const { error } = await supabase
    .from("adae_secretaria_activities")
    .update({
      title,
      subtitle,
      content,
      banner_image_url: bannerImageUrl,
      is_published: isPublished,
    })
    .eq("id", id);

  if (error) {
    return { error: "Erro ao salvar a atividade." };
  }

  revalidateActivityPaths(id);
  return { success: true };
}

export async function uploadActivityEditorMedia(
  formData: FormData,
): Promise<UploadResult> {
  const { user } = await requireSecretariaAccess();
  const supabase = await createClient();

  const file = formData.get("file") as File | null;

  if (!file || file.size === 0) {
    return { error: "Nenhum arquivo selecionado." };
  }

  const isImage = file.type.startsWith("image/");
  const isVideo = file.type.startsWith("video/");

  if (!isImage && !isVideo) {
    return { error: "Envie apenas imagens ou vídeos." };
  }

  const maxSize = isVideo ? MAX_VIDEO_SIZE : MAX_IMAGE_SIZE;
  if (file.size > maxSize) {
    return {
      error: isVideo
        ? "O vídeo deve ter no máximo 50 MB."
        : "A imagem deve ter no máximo 5 MB.",
    };
  }

  const extension = file.name.split(".").pop()?.toLowerCase() ?? "bin";
  const filePath = `${user.id}/editor/${Date.now()}-${crypto.randomUUID()}.${extension}`;

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(filePath, file, {
      upsert: false,
      contentType: file.type,
    });

  if (uploadError) {
    return { error: "Erro ao enviar o arquivo." };
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(BUCKET).getPublicUrl(filePath);

  return { url: publicUrl };
}

export async function deleteSecretariaActivity(id: string): Promise<ActionResult> {
  await requireSecretariaAccess();
  const supabase = await createClient();

  const { data: activity, error: fetchError } = await supabase
    .from("adae_secretaria_activities")
    .select("banner_image_url")
    .eq("id", id)
    .maybeSingle();

  if (fetchError || !activity) {
    return { error: "Atividade não encontrada." };
  }

  const storagePath = extractStoragePath(activity.banner_image_url);
  if (storagePath) {
    await supabase.storage.from(BUCKET).remove([storagePath]);
  }

  const { error } = await supabase
    .from("adae_secretaria_activities")
    .delete()
    .eq("id", id);

  if (error) {
    return { error: "Erro ao excluir a atividade." };
  }

  revalidateActivityPaths(id);
  return { success: true };
}
