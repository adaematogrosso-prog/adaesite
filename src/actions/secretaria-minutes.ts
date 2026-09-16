"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireSecretariaAccess } from "@/lib/auth/admin";

const BUCKET = "adae-secretaria-minutes";
const MAX_FILE_SIZE = 15 * 1024 * 1024;

type ActionResult = { error?: string; success?: boolean };

function revalidateMinutePaths() {
  revalidatePath("/secretaria/atas");
  revalidatePath("/admin/secretaria/atas");
  revalidatePath("/secretaria");
  revalidatePath("/admin/secretaria");
}

function extractStoragePath(publicUrl: string): string | null {
  const marker = `/storage/v1/object/public/${BUCKET}/`;
  const index = publicUrl.indexOf(marker);
  if (index === -1) return null;
  return decodeURIComponent(publicUrl.slice(index + marker.length));
}

export async function uploadMeetingMinute(
  formData: FormData,
): Promise<ActionResult> {
  const { user } = await requireSecretariaAccess();
  const supabase = await createClient();

  const title = (formData.get("title") as string)?.trim();
  const description = (formData.get("description") as string)?.trim() ?? "";
  const file = formData.get("file") as File | null;

  if (!title) {
    return { error: "Informe o título da ata." };
  }

  if (!file || file.size === 0) {
    return { error: "Selecione o arquivo PDF da ata." };
  }

  if (file.type !== "application/pdf") {
    return { error: "A ata deve ser enviada em PDF." };
  }

  if (file.size > MAX_FILE_SIZE) {
    return { error: "O PDF deve ter no máximo 15 MB." };
  }

  const extension = file.name.split(".").pop()?.toLowerCase() ?? "pdf";
  const filePath = `${user.id}/${Date.now()}-${crypto.randomUUID()}.${extension}`;

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(filePath, file, {
      upsert: false,
      contentType: file.type,
    });

  if (uploadError) {
    return { error: "Erro ao enviar o PDF da ata." };
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(BUCKET).getPublicUrl(filePath);

  const { error } = await supabase.from("adae_meeting_minutes").insert({
    title,
    description,
    file_url: publicUrl,
    file_name: file.name,
    mime_type: file.type,
    is_published: true,
    created_by: user.id,
  });

  if (error) {
    await supabase.storage.from(BUCKET).remove([filePath]);
    return { error: "Erro ao registrar a ata." };
  }

  revalidateMinutePaths();
  return { success: true };
}

export async function deleteMeetingMinute(id: string): Promise<ActionResult> {
  await requireSecretariaAccess();
  const supabase = await createClient();

  const { data: minute, error: fetchError } = await supabase
    .from("adae_meeting_minutes")
    .select("file_url")
    .eq("id", id)
    .maybeSingle();

  if (fetchError || !minute) {
    return { error: "Ata não encontrada." };
  }

  const storagePath = extractStoragePath(minute.file_url);
  if (storagePath) {
    await supabase.storage.from(BUCKET).remove([storagePath]);
  }

  const { error } = await supabase
    .from("adae_meeting_minutes")
    .delete()
    .eq("id", id);

  if (error) {
    return { error: "Erro ao excluir a ata." };
  }

  revalidateMinutePaths();
  return { success: true };
}
