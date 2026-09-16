"use server";

import { revalidatePath } from "next/cache";
import { requireTesourariaAccess } from "@/lib/auth/admin";
import { canManageTreasuryPix } from "@/lib/auth/executive-access.server";
import { parseCurrencyInput } from "@/lib/treasury/money";
import { createClient } from "@/lib/supabase/server";
import type { TreasuryPixKeyType, TreasuryTransactionType } from "@/types/database";

const RECEIPTS_BUCKET = "adae-treasury-receipts";
const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ALLOWED_RECEIPT_TYPES = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

type ActionResult = { error?: string; success?: boolean };

function revalidateTreasuryPaths() {
  revalidatePath("/admin/tesouraria");
}

async function requireTreasuryPixManager() {
  const access = await requireTesourariaAccess();
  const canManagePix =
    access.isAdmin || (await canManageTreasuryPix(access.user.id));

  if (!canManagePix) {
    throw new Error("unauthorized_pix");
  }

  return access.user;
}

export async function updateTreasuryPixSettings(
  formData: FormData,
): Promise<ActionResult> {
  try {
    const user = await requireTreasuryPixManager();
    const supabase = await createClient();

    const pixKey = (formData.get("pixKey") as string)?.trim();
    const pixKeyType = (formData.get("pixKeyType") as TreasuryPixKeyType) ?? "random";
    const holderName = (formData.get("holderName") as string)?.trim();
    const holderCity = (formData.get("holderCity") as string)?.trim();
    const bankLabel = (formData.get("bankLabel") as string)?.trim() || null;

    if (!pixKey) return { error: "Informe a chave PIX." };
    if (!holderName) return { error: "Informe o nome do recebedor." };
    if (!holderCity) return { error: "Informe a cidade do recebedor." };

    const { data: existing } = await supabase
      .from("adae_treasury_pix_settings")
      .select("id")
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    const payload = {
      pix_key: pixKey,
      pix_key_type: pixKeyType,
      holder_name: holderName,
      holder_city: holderCity,
      bank_label: bankLabel,
      updated_by: user.id,
      updated_at: new Date().toISOString(),
    };

    const { error } = existing
      ? await supabase
          .from("adae_treasury_pix_settings")
          .update(payload)
          .eq("id", existing.id)
      : await supabase.from("adae_treasury_pix_settings").insert(payload);

    if (error) {
      return { error: "Erro ao salvar a chave PIX." };
    }

    revalidateTreasuryPaths();
    return { success: true };
  } catch {
    return { error: "Somente o presidente ou admin pode alterar a chave PIX." };
  }
}

export async function createTreasuryTransaction(
  formData: FormData,
): Promise<ActionResult> {
  const { user } = await requireTesourariaAccess();
  const supabase = await createClient();

  const transactionType = formData.get("transactionType") as TreasuryTransactionType;
  const description = (formData.get("description") as string)?.trim();
  const transactionDate = (formData.get("transactionDate") as string)?.trim();
  const amountInput = (formData.get("amount") as string)?.trim();
  const amountCents = parseCurrencyInput(amountInput ?? "");

  if (transactionType !== "income" && transactionType !== "expense") {
    return { error: "Selecione se o lançamento é entrada ou saída." };
  }

  if (!description) {
    return { error: "Informe a descrição do lançamento." };
  }

  if (!transactionDate?.match(/^\d{4}-\d{2}-\d{2}$/)) {
    return { error: "Informe uma data válida." };
  }

  if (!amountCents) {
    return { error: "Informe um valor válido." };
  }

  const files = formData
    .getAll("receipts")
    .filter((item): item is File => item instanceof File && item.size > 0);

  for (const file of files) {
    if (file.size > MAX_FILE_SIZE) {
      return { error: "Cada comprovante deve ter no máximo 10 MB." };
    }
    if (!ALLOWED_RECEIPT_TYPES.has(file.type)) {
      return {
        error: "Comprovante inválido. Use PDF ou imagem (JPG, PNG, WEBP, GIF).",
      };
    }
  }

  const { data: transaction, error: insertError } = await supabase
    .from("adae_treasury_transactions")
    .insert({
      transaction_type: transactionType,
      amount_cents: amountCents,
      description,
      transaction_date: transactionDate,
      created_by: user.id,
    })
    .select("id")
    .single();

  if (insertError || !transaction) {
    return { error: "Erro ao registrar o lançamento." };
  }

  for (const file of files) {
    const extension = file.name.split(".").pop()?.toLowerCase() ?? "bin";
    const filePath = `${transaction.id}/${Date.now()}-${crypto.randomUUID()}.${extension}`;

    const { error: uploadError } = await supabase.storage
      .from(RECEIPTS_BUCKET)
      .upload(filePath, file, {
        upsert: false,
        contentType: file.type,
      });

    if (uploadError) {
      continue;
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from(RECEIPTS_BUCKET).getPublicUrl(filePath);

    await supabase.from("adae_treasury_receipts").insert({
      transaction_id: transaction.id,
      file_url: publicUrl,
      file_name: file.name,
      mime_type: file.type,
      uploaded_by: user.id,
    });
  }

  revalidateTreasuryPaths();
  return { success: true };
}

export async function deleteTreasuryTransaction(id: string): Promise<ActionResult> {
  await requireTesourariaAccess();
  const supabase = await createClient();

  const { data: receipts } = await supabase
    .from("adae_treasury_receipts")
    .select("file_url")
    .eq("transaction_id", id);

  for (const receipt of receipts ?? []) {
    const storagePath = extractStoragePath(receipt.file_url);
    if (storagePath) {
      await supabase.storage.from(RECEIPTS_BUCKET).remove([storagePath]);
    }
  }

  const { error } = await supabase
    .from("adae_treasury_transactions")
    .delete()
    .eq("id", id);

  if (error) {
    return { error: "Erro ao excluir o lançamento." };
  }

  revalidateTreasuryPaths();
  return { success: true };
}

function extractStoragePath(publicUrl: string): string | null {
  const marker = `/storage/v1/object/public/${RECEIPTS_BUCKET}/`;
  const index = publicUrl.indexOf(marker);
  if (index === -1) return null;
  return decodeURIComponent(publicUrl.slice(index + marker.length));
}
