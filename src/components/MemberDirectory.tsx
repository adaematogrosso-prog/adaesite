"use client";

import { useMemo, useState } from "react";
import { MemberDirectoryCard } from "@/components/MemberDirectoryCard";
import { SearchBar } from "@/components/SearchBar";
import { matchesSearch } from "@/lib/search";
import type { DirectoryMember, MembersDirectoryData } from "@/lib/members/directory";

type Props = {
  data: MembersDirectoryData;
  profileFrom?: "admin";
};

function filterMembers(members: DirectoryMember[], query: string) {
  if (!query.trim()) return members;

  return members.filter((member) =>
    matchesSearch(
      query,
      member.fullName,
      member.memberId,
      member.city,
      member.alumniCollege,
      member.chapterName,
      member.phone,
      member.executiveRoleLabel,
    ),
  );
}

export function MemberDirectory({ data, profileFrom }: Props) {
  const [query, setQuery] = useState("");
  const totalCount = data.boardMembers.length + data.members.length;

  const filteredBoardMembers = useMemo(
    () => filterMembers(data.boardMembers, query),
    [data.boardMembers, query],
  );

  const filteredMembers = useMemo(
    () => filterMembers(data.members, query),
    [data.members, query],
  );

  if (totalCount === 0) {
    return (
      <div className="rounded-2xl border border-gold/20 bg-white p-8 text-center shadow-sm">
        <p className="text-muted">Nenhum membro aprovado cadastrado ainda.</p>
      </div>
    );
  }

  const hasResults =
    filteredBoardMembers.length > 0 || filteredMembers.length > 0;

  return (
    <div className="space-y-10">
      <SearchBar
        id="members-search"
        label="Pesquisar membros"
        placeholder="Buscar por nome, ID DeMolay, cidade, capítulo..."
        value={query}
        onChange={setQuery}
      />

      {!hasResults ? (
        <div className="rounded-2xl border border-dashed border-gold/30 bg-white p-10 text-center">
          <p className="text-muted">Nenhum membro encontrado.</p>
        </div>
      ) : null}

      {filteredBoardMembers.length > 0 ? (
        <section>
          <div className="mb-5">
            <h2 className="section-title text-2xl font-bold text-royal-blue">
              Diretoria Executiva
            </h2>
            <p className="mt-1 text-sm text-muted">
              Irmãos que compõem a diretoria da{" "}
              {filteredBoardMembers.length === 1 ? "associação" : "ADAE-MT"}.
            </p>
          </div>

          <div className="members-grid">
            {filteredBoardMembers.map((member) => (
              <MemberDirectoryCard
                key={
                  member.userId ?? member.executiveRoleLabel ?? member.fullName
                }
                member={member}
                profileFrom={profileFrom}
              />
            ))}
          </div>
        </section>
      ) : null}

      {filteredMembers.length > 0 ? (
        <section>
          <div className="mb-5">
            <h2 className="section-title text-2xl font-bold text-royal-blue">
              Membros
            </h2>
            <p className="mt-1 text-sm text-muted">
              Membros cadastrados e aprovados na plataforma.
            </p>
          </div>

          <div className="members-grid">
            {filteredMembers.map((member) => (
              <MemberDirectoryCard
                key={member.userId ?? member.memberId ?? member.fullName}
                member={member}
                profileFrom={profileFrom}
              />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
