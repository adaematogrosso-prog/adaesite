import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requirePanelAccess } from "@/lib/auth/admin";
import { confirmPendingMemberEmails } from "@/lib/auth/email-confirm.server";
import { getAdminUserIds } from "@/lib/auth/admin-users.server";
import { EXECUTIVE_ROLE_LABELS } from "@/lib/constants";
import { ExecutiveBoardSettingsForm } from "@/components/admin/ExecutiveBoardSettingsForm";
import { ExecutiveRoleManager } from "@/components/admin/ExecutiveRoleManager";
import { MemberRegistryManager } from "@/components/admin/MemberRegistryManager";
import { MembershipRequestsList } from "@/components/admin/MembershipRequestsList";
import { getPublicExecutiveBoardSettings } from "@/lib/members/executive-board-settings";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import type { ExecutiveLinkOption } from "@/types/admin";
import type { ExecutiveMember, MemberProfile } from "@/types/database";

export default async function AdminAdesoesPage() {
  const { canApprove, isAdmin } = await requirePanelAccess();

  if (!canApprove) {
    redirect("/admin?error=unauthorized");
  }

  const supabase = await createClient();

  const [
    { data: requests },
    { data: executives },
    { data: allMembers },
    adminUserIds,
    boardSettings,
  ] = await Promise.all([
      supabase
        .from("adae_member_profiles")
        .select("*")
        .eq("status", "pending")
        .order("created_at", { ascending: true }),
      supabase
        .from("adae_executive_members")
        .select("*")
        .eq("is_active", true)
        .order("display_order", { ascending: true }),
      supabase
        .from("adae_member_profiles")
        .select("*")
        .order("full_name", { ascending: true }),
      getAdminUserIds(),
      getPublicExecutiveBoardSettings(),
    ]);

  const pendingRequests = (requests ?? []) as MemberProfile[];

  if (pendingRequests.length > 0) {
    await confirmPendingMemberEmails(
      pendingRequests.map((request) => request.user_id),
    );
  }

  const boardMembers = (executives ?? []) as ExecutiveMember[];
  const linkedUserIds = boardMembers
    .map((member) => member.linked_user_id)
    .filter(Boolean) as string[];

  let occupantByUserId = new Map<string, string>();

  if (linkedUserIds.length > 0) {
    const { data: linkedProfiles } = await supabase
      .from("adae_member_profiles")
      .select("user_id, full_name")
      .in("user_id", linkedUserIds);

    occupantByUserId = new Map(
      (linkedProfiles ?? []).map((profile) => [
        profile.user_id,
        profile.full_name,
      ]),
    );
  }

  const executiveOptions: ExecutiveLinkOption[] = boardMembers.map((member) => ({
    id: member.id,
    label: EXECUTIVE_ROLE_LABELS[member.role],
    occupantName: member.linked_user_id
      ? (occupantByUserId.get(member.linked_user_id) ?? null)
      : null,
  }));

  const approvedMembers = ((allMembers ?? []) as MemberProfile[]).filter(
    (member) => member.status === "approved",
  );

  return (
    <div>
      <AdminPageHeader
        title="Adesões / Cadastro"
        subtitle="Aprove novas adesões e gerencie e-mail, senha e dados completos dos membros."
      />

      <section className="mt-10">
        <h2 className="section-title text-2xl font-semibold text-royal-blue">
          Solicitações pendentes
        </h2>
        <p className="mt-2 text-sm text-muted">
          Aprove ou recuse novos cadastros. Ao aprovar, você pode vincular o
          irmão a um cargo executivo na hora.
        </p>

        <MembershipRequestsList
          requests={pendingRequests}
          executiveOptions={executiveOptions}
        />
      </section>

      <section
        id="cadastro"
        className="mt-12 border-t border-gold/20 pt-10"
      >
        <h2 className="section-title text-2xl font-semibold text-royal-blue">
          Gerenciar cadastros
        </h2>
        <p className="mt-2 text-sm text-muted">
          Presidente e vice-presidente editam cadastros dos membros. A senha do
          administrador da plataforma só pode ser alterada pelo próprio admin.
        </p>

        <div className="mt-6">
          <MemberRegistryManager
            members={(allMembers ?? []) as MemberProfile[]}
            adminUserIds={Array.from(adminUserIds)}
            editorIsAdmin={isAdmin}
          />
        </div>
      </section>

      <section
        id="gestao"
        className="mt-12 border-t border-gold/20 pt-10"
      >
        <h2 className="section-title text-2xl font-semibold text-royal-blue">
          Gestão e chapa
        </h2>
        <p className="mt-2 text-sm text-muted">
          Ano de gestão e nome da chapa exibidos na seção Diretoria Executiva do
          site.
        </p>

        <div className="mt-6">
          <ExecutiveBoardSettingsForm settings={boardSettings} />
        </div>
      </section>

      <section
        id="cargos"
        className="mt-12 border-t border-gold/20 pt-10"
      >
        <h2 className="section-title text-2xl font-semibold text-royal-blue">
          Cargos executivos
        </h2>
        <p className="mt-2 text-sm text-muted">
          Vincule membros aprovados aos cargos da diretoria. Nome e foto exibidos
          na plataforma vêm do perfil de cada membro.
        </p>

        <div className="mt-6">
          <ExecutiveRoleManager
            executives={boardMembers}
            approvedMembers={approvedMembers}
          />
        </div>
      </section>
    </div>
  );
}
