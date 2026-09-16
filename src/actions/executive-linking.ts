"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireApprover } from "@/lib/auth/admin";

type ActionResult = { error?: string; success?: boolean };

function revalidateExecutivePaths() {
  revalidatePath("/");
  revalidatePath("/admin/membros");
  revalidatePath("/membros");
}

export async function linkExecutiveToMember(
  executiveId: string,
  userId: string | null,
): Promise<ActionResult> {
  await requireApprover();

  if (!executiveId) {
    return { error: "Cargo inválido." };
  }

  const supabase = await createClient();

  const { error } = await supabase.rpc("adae_link_executive_member", {
    p_executive_id: executiveId,
    p_user_id: userId,
  });

  if (error) {
    if (userId) {
      const { data: profile } = await supabase
        .from("adae_member_profiles")
        .select("user_id")
        .eq("user_id", userId)
        .eq("status", "approved")
        .maybeSingle();

      if (!profile) {
        return { error: "Selecione um membro aprovado." };
      }

      await supabase
        .from("adae_executive_members")
        .update({ linked_user_id: null })
        .eq("linked_user_id", userId)
        .neq("id", executiveId);

      const { data: memberProfile } = await supabase
        .from("adae_member_profiles")
        .select("full_name, profile_photo_url")
        .eq("user_id", userId)
        .single();

      const { error: updateError } = await supabase
        .from("adae_executive_members")
        .update({
          linked_user_id: userId,
          name: memberProfile?.full_name ?? "",
          photo_url: memberProfile?.profile_photo_url ?? null,
        })
        .eq("id", executiveId);

      if (updateError) {
        return { error: "Erro ao vincular o membro ao cargo." };
      }
    } else {
      const { error: clearError } = await supabase
        .from("adae_executive_members")
        .update({ linked_user_id: null })
        .eq("id", executiveId);

      if (clearError) {
        return { error: "Erro ao remover o vínculo." };
      }
    }
  }

  revalidateExecutivePaths();
  return { success: true };
}
