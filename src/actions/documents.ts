"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requirePublisher } from "@/lib/auth/admin";
import type { SharedDocumentKind } from "@/types/database";

const BUCKET = "adae-shared-documents";
const MAX_FILE_SIZE = 10 * 1024 * 1024;

const ALLOWED_TYPES: Record<string, SharedDocumentKind> = {
  "application/pdf": "pdf",
  "image/jpeg": "image",
  "image/png": "image",
  "image/webp": "image",
  "image/gif": "image",
};

type ActionResult = { error?: string; success?: boolean };

function revalidateDocumentPaths() {
  revalidatePath("/documentos");
  revalidatePath("/admin/documentos");
}

function getFileKind(mimeType: string): SharedDocumentKind | null {
  return ALLOWED_TYPES[mimeType] ?? null;
}

export async function uploadSharedDocument(
  formData: FormData,
): Promise<ActionResult> {
  const user = await requirePublisher();
  const supabase = await createClient();

  const title = (formData.get("title") as string)?.trim();
  const file = formData.get("file") as File | null;

  if (!title) {
    return { error: "Informe o nome do documento." };
  }

  if (!file || file.size === 0) {
    return { error: "Selecione um arquivo PDF ou imagem." };
  }

  if (file.size > MAX_FILE_SIZE) {
    return { error: "O arquivo deve ter no máximo 10 MB." };
  }

  const fileKind = getFileKind(file.type);
  if (!fileKind) {
    return {
      error: "Formato não permitido. Use PDF ou imagem (JPG, PNG, WEBP, GIF).",
    };
  }

  const extension = file.name.split(".").pop()?.toLowerCase() ?? "bin";
  const filePath = `${user.id}/${Date.now()}-${crypto.randomUUID()}.${extension}`;

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

  const { error } = await supabase.from("adae_shared_documents").insert({
    title,
    file_url: publicUrl,
    file_name: file.name,
    mime_type: file.type,
    file_kind: fileKind,
    uploaded_by: user.id,
  });

  if (error) {
    await supabase.storage.from(BUCKET).remove([filePath]);
    return { error: "Erro ao registrar o documento." };
  }

  revalidateDocumentPaths();
  return { success: true };
}

export async function deleteSharedDocument(id: string): Promise<ActionResult> {
  await requirePublisher();
  const supabase = await createClient();

  const { data: document, error: fetchError } = await supabase
    .from("adae_shared_documents")
    .select("file_url")
    .eq("id", id)
    .maybeSingle();

  if (fetchError || !document) {
    return { error: "Documento não encontrado." };
  }

  const storagePath = extractStoragePath(document.file_url);
  if (storagePath) {
    await supabase.storage.from(BUCKET).remove([storagePath]);
  }

  const { error } = await supabase
    .from("adae_shared_documents")
    .delete()
    .eq("id", id);

  if (error) {
    return { error: "Erro ao excluir o documento." };
  }

  revalidateDocumentPaths();
  return { success: true };
}

function extractStoragePath(publicUrl: string): string | null {
  const marker = `/storage/v1/object/public/${BUCKET}/`;
  const index = publicUrl.indexOf(marker);
  if (index === -1) return null;
  return decodeURIComponent(publicUrl.slice(index + marker.length));
}
