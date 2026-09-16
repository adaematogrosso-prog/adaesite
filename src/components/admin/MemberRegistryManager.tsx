"use client";

import { useMemo, useState } from "react";
import { AdminMemberEditForm } from "@/components/admin/AdminMemberEditForm";
import { MemberAccessBlockPanel } from "@/components/admin/MemberAccessBlockPanel";
import { MemberLoginHealthPanel } from "@/components/admin/MemberLoginHealthPanel";
import { MemberSearchCombobox } from "@/components/admin/MemberSearchCombobox";
import type { MemberProfile, MembershipStatus } from "@/types/database";

type Props = {
  members: MemberProfile[];
  adminUserIds: string[];
  editorIsAdmin: boolean;
};

const STATUS_LABELS: Record<MembershipStatus, string> = {
  pending: "Pendente",
  approved: "Aprovado",
  rejected: "Recusado",
};

function memberLabel(profile: MemberProfile) {
  return `${profile.full_name} · ${profile.member_id} · ${STATUS_LABELS[profile.status]}`;
}

export function MemberRegistryManager({
  members,
  adminUserIds,
  editorIsAdmin,
}: Props) {
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  const selectedProfile = useMemo(
    () => members.find((member) => member.user_id === selectedUserId) ?? null,
    [members, selectedUserId],
  );

  const comboboxMembers = useMemo(
    () =>
      members.map((member) => ({
        ...member,
        full_name: memberLabel(member),
      })),
    [members],
  );

  if (members.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-gold/30 bg-white p-10 text-center">
        <p className="text-muted">Nenhum cadastro encontrado.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <MemberSearchCombobox
        members={comboboxMembers}
        selectedUserId={selectedUserId}
        selectedLabel={
          selectedProfile ? memberLabel(selectedProfile) : null
        }
        onSelect={setSelectedUserId}
        onClear={() => setSelectedUserId(null)}
        inputId="member-registry-search"
        label="Buscar membro para editar"
      />

      {selectedProfile ? (
        <>
          <MemberLoginHealthPanel userId={selectedProfile.user_id} />
          <AdminMemberEditForm
            key={selectedProfile.user_id}
            profile={selectedProfile}
            canEditPassword={
              editorIsAdmin || !adminUserIds.includes(selectedProfile.user_id)
            }
          />
          {!adminUserIds.includes(selectedProfile.user_id) ? (
            <MemberAccessBlockPanel profile={selectedProfile} />
          ) : null}
        </>
      ) : (
        <div className="rounded-2xl border border-dashed border-gold/30 bg-white p-8 text-center">
          <p className="text-sm text-muted">
            Selecione um membro acima para editar e-mail, senha e demais dados.
          </p>
        </div>
      )}
    </div>
  );
}
