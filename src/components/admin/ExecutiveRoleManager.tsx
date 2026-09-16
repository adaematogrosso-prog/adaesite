"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { linkExecutiveToMember } from "@/actions/executive-linking";
import { MemberSearchCombobox } from "@/components/admin/MemberSearchCombobox";
import { EXECUTIVE_ROLE_LABELS } from "@/lib/constants";
import type { ExecutiveMember, MemberProfile } from "@/types/database";

type Props = {
  executives: ExecutiveMember[];
  approvedMembers: MemberProfile[];
};

export function ExecutiveRoleManager({
  executives,
  approvedMembers,
}: Props) {
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [isPending, startTransition] = useTransition();

  const profileByUserId = new Map(
    approvedMembers.map((profile) => [profile.user_id, profile]),
  );

  function handleLink(executiveId: string, userId: string | null) {
    setMessage(null);

    startTransition(async () => {
      const result = await linkExecutiveToMember(executiveId, userId);

      if (result.error) {
        setMessage({ type: "error", text: result.error });
        return;
      }

      setMessage({
        type: "success",
        text: userId
          ? "Cargo atualizado. Nome e foto passam a vir do perfil do membro."
          : "Vínculo removido. O cargo ficou vago.",
      });
    });
  }

  return (
    <div className="space-y-4">
      {message ? (
        <p
          className={`rounded-xl px-4 py-3 text-sm ${
            message.type === "success"
              ? "bg-green-50 text-green-800"
              : "bg-red-50 text-crimson"
          }`}
        >
          {message.text}
        </p>
      ) : null}

      {executives.map((executive) => {
        const roleLabel = EXECUTIVE_ROLE_LABELS[executive.role];
        const linkedProfile = executive.linked_user_id
          ? profileByUserId.get(executive.linked_user_id)
          : null;

        return (
          <article
            key={executive.id}
            className="rounded-2xl border border-gold/20 bg-white p-5 shadow-sm"
          >
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="flex items-center gap-4">
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full border-4 border-gold/30 bg-royal-blue/5">
                  {linkedProfile?.profile_photo_url ? (
                    <Image
                      src={linkedProfile.profile_photo_url}
                      alt={linkedProfile.full_name}
                      fill
                      className="object-cover"
                      sizes="64px"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <span className="section-title text-xl font-bold text-royal-blue/40">
                        {roleLabel.charAt(0)}
                      </span>
                    </div>
                  )}
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gold">
                    {roleLabel}
                  </p>
                  <p className="section-title text-lg font-semibold text-royal-blue">
                    {linkedProfile?.full_name ?? "Cargo vago"}
                  </p>
                  {linkedProfile ? (
                    <p className="text-sm text-muted">
                      ID {linkedProfile.member_id} · dados e foto do perfil
                    </p>
                  ) : (
                    <p className="text-sm text-muted">
                      Busque um membro aprovado para ocupar este cargo.
                    </p>
                  )}
                </div>
              </div>

              <div className="w-full lg:max-w-sm">
                <MemberSearchCombobox
                  key={`${executive.id}-${executive.linked_user_id ?? "none"}`}
                  inputId={`role-${executive.id}`}
                  members={approvedMembers}
                  selectedUserId={executive.linked_user_id}
                  selectedLabel={linkedProfile?.full_name ?? null}
                  disabled={isPending}
                  onSelect={(userId) => handleLink(executive.id, userId)}
                  onClear={() => handleLink(executive.id, null)}
                />
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}
