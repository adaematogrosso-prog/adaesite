"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireApprover } from "@/lib/auth/admin";

type ActionResult = { error?: string; success?: boolean };

const SETTINGS_ID = "current";
const TERM_PATTERN = /^\d{4}\/\d{4}$/;

function revalidateBoardPaths() {
  revalidatePath("/");
  revalidatePath("/admin/adesoes");
}

export async function updateExecutiveBoardSettings(formData: FormData): Promise<ActionResult> {
  const user = await requireApprover();

  const managementTerm = String(formData.get("managementTerm") ?? "").trim();
  const slateName = String(formData.get("slateName") ?? "").trim();

  if (!managementTerm) {
    return { error: "Informe o ano de gestão (ex.: 2026/2027)." };
  }

  if (!TERM_PATTERN.test(managementTerm)) {
    return {
      error: "Use o formato AAAA/AAAA para a gestão (ex.: 2026/2027).",
    };
  }

  if (!slateName) {
    return { error: "Informe o nome da chapa." };
  }

  if (slateName.length > 120) {
    return { error: "O nome da chapa deve ter no máximo 120 caracteres." };
  }

  const supabase = await createClient();

  const { error } = await supabase.from("adae_executive_board_settings").upsert(
    {
      id: SETTINGS_ID,
      management_term: managementTerm,
      slate_name: slateName,
      updated_by: user.id,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "id" },
  );

  if (error) {
    return { error: "Não foi possível salvar. Verifique se a migration foi aplicada." };
  }

  revalidateBoardPaths();
  return { success: true };
}
