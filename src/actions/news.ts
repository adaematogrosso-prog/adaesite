"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requirePublisher } from "@/lib/auth/admin";

const BUCKET = "adae-news-images";
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const MAX_VIDEO_SIZE = 50 * 1024 * 1024;

type ActionResult = { error?: string; success?: boolean };
type UploadResult = { error?: string; url?: string };

function revalidateNewsPaths() {
  revalidatePath("/noticias");
  revalidatePath("/admin/noticias");
}

export async function createNewsPost(formData: FormData): Promise<ActionResult> {
  const user = await requirePublisher();
  const supabase = await createClient();

  const title = (formData.get("title") as string)?.trim();
  const summary = (formData.get("summary") as string)?.trim() ?? "";
  const content = (formData.get("content") as string)?.trim();
  const cover = formData.get("cover") as File | null;

  if (!title || !content) {
    return { error: "Informe título e conteúdo da notícia." };
  }

  let coverImageUrl: string | null = null;

  if (cover && cover.size > 0) {
    if (!cover.type.startsWith("image/")) {
      return { error: "A capa deve ser uma imagem." };
    }

    if (cover.size > MAX_IMAGE_SIZE) {
      return { error: "A imagem de capa deve ter no máximo 5 MB." };
    }

    const extension = cover.name.split(".").pop()?.toLowerCase() ?? "jpg";
    const filePath = `${user.id}/${Date.now()}-${crypto.randomUUID()}.${extension}`;

    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(filePath, cover, {
        upsert: false,
        contentType: cover.type,
      });

    if (uploadError) {
      return { error: "Erro ao enviar a imagem de capa." };
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from(BUCKET).getPublicUrl(filePath);

    coverImageUrl = publicUrl;
  }

  const { error } = await supabase.from("adae_news_posts").insert({
    title,
    summary,
    content,
    cover_image_url: coverImageUrl,
    published_by: user.id,
    is_published: true,
  });

  if (error) {
    return { error: "Erro ao publicar a notícia." };
  }

  revalidateNewsPaths();
  return { success: true };
}

export async function updateNewsPost(
  id: string,
  formData: FormData,
): Promise<ActionResult> {
  const user = await requirePublisher();
  const supabase = await createClient();

  const title = (formData.get("title") as string)?.trim();
  const summary = (formData.get("summary") as string)?.trim() ?? "";
  const content = (formData.get("content") as string)?.trim();
  const cover = formData.get("cover") as File | null;

  if (!title || !content) {
    return { error: "Informe título e conteúdo da notícia." };
  }

  const { data: existing, error: fetchError } = await supabase
    .from("adae_news_posts")
    .select("cover_image_url")
    .eq("id", id)
    .maybeSingle();

  if (fetchError || !existing) {
    return { error: "Notícia não encontrada." };
  }

  let coverImageUrl = existing.cover_image_url;

  if (cover && cover.size > 0) {
    if (!cover.type.startsWith("image/")) {
      return { error: "A capa deve ser uma imagem." };
    }

    if (cover.size > MAX_IMAGE_SIZE) {
      return { error: "A imagem de capa deve ter no máximo 5 MB." };
    }

    const extension = cover.name.split(".").pop()?.toLowerCase() ?? "jpg";
    const filePath = `${user.id}/${Date.now()}-${crypto.randomUUID()}.${extension}`;

    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(filePath, cover, {
        upsert: false,
        contentType: cover.type,
      });

    if (uploadError) {
      return { error: "Erro ao enviar a imagem de capa." };
    }

    const oldPath = extractStoragePath(existing.cover_image_url);
    if (oldPath) {
      await supabase.storage.from(BUCKET).remove([oldPath]);
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from(BUCKET).getPublicUrl(filePath);

    coverImageUrl = publicUrl;
  }

  const { error } = await supabase
    .from("adae_news_posts")
    .update({
      title,
      summary,
      content,
      cover_image_url: coverImageUrl,
    })
    .eq("id", id);

  if (error) {
    return { error: "Erro ao salvar a notícia." };
  }

  revalidateNewsPaths();
  revalidatePath(`/noticias/${id}`);
  revalidatePath(`/admin/noticias/${id}/editar`);
  return { success: true };
}

export async function uploadNewsEditorMedia(
  formData: FormData,
): Promise<UploadResult> {
  const user = await requirePublisher();
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

export async function deleteNewsPost(id: string): Promise<ActionResult> {
  await requirePublisher();
  const supabase = await createClient();

  const { data: post, error: fetchError } = await supabase
    .from("adae_news_posts")
    .select("cover_image_url")
    .eq("id", id)
    .maybeSingle();

  if (fetchError || !post) {
    return { error: "Notícia não encontrada." };
  }

  const storagePath = extractStoragePath(post.cover_image_url);
  if (storagePath) {
    await supabase.storage.from(BUCKET).remove([storagePath]);
  }

  const { error } = await supabase.from("adae_news_posts").delete().eq("id", id);

  if (error) {
    return { error: "Erro ao excluir a notícia." };
  }

  revalidateNewsPaths();
  revalidatePath(`/noticias/${id}`);
  return { success: true };
}

function extractStoragePath(publicUrl: string | null): string | null {
  if (!publicUrl) return null;

  const marker = `/storage/v1/object/public/${BUCKET}/`;
  const index = publicUrl.indexOf(marker);
  if (index === -1) return null;
  return decodeURIComponent(publicUrl.slice(index + marker.length));
}
