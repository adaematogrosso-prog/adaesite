"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/admin";
import type { SeniorPillarKey } from "@/lib/constants";

const BUCKET = "adae-executive-photos";

export async function updateSeniorPillarImage(formData: FormData) {
  await requireAdmin();

  const id = formData.get("id") as string;
  const key = formData.get("key") as SeniorPillarKey;
  const photo = formData.get("photo") as File | null;

  if (!id || !key) {
    return { error: "Dados inválidos." };
  }

  if (!photo || photo.size === 0) {
    return { error: "Selecione uma imagem para enviar." };
  }

  const supabase = await createClient();
  const extension = photo.name.split(".").pop()?.toLowerCase() ?? "jpg";
  const filePath = `pillars/${key}-${Date.now()}.${extension}`;

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(filePath, photo, {
      upsert: true,
      contentType: photo.type,
    });

  if (uploadError) {
    return { error: "Erro ao enviar a imagem. Tente novamente." };
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(BUCKET).getPublicUrl(filePath);

  const { error } = await supabase
    .from("adae_senior_pillars")
    .update({ image_url: publicUrl })
    .eq("id", id);

  if (error) {
    return { error: "Erro ao salvar a imagem." };
  }

  revalidatePath("/");
  revalidatePath("/admin/edicao-inicial");

  return { success: true };
}

export async function removeSeniorPillarImage(id: string) {
  await requireAdmin();

  const supabase = await createClient();

  const { error } = await supabase
    .from("adae_senior_pillars")
    .update({ image_url: null })
    .eq("id", id);

  if (error) {
    return { error: "Erro ao remover a imagem." };
  }

  revalidatePath("/");
  revalidatePath("/admin/edicao-inicial");

  return { success: true };
}
