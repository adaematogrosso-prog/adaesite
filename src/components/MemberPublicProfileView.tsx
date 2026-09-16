import Image from "next/image";
import Link from "next/link";
import {
  formatAge,
  formatBirthDate,
  formatFullBirthDate,
  formatPhone,
} from "@/lib/format";
import {
  formatEducationLevel,
  formatIsMason,
} from "@/lib/members/profile-fields";
import type { MemberPublicProfile } from "@/lib/members/directory";

type Props = {
  member: MemberPublicProfile;
  backHref?: string;
};

function InfoRow({ label, value }: { label: string; value: string | null }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-muted">
        {label}
      </p>
      <p className="mt-1 text-sm text-foreground">{value?.trim() || "-"}</p>
    </div>
  );
}

function EmailRow({ email }: { email: string | null }) {
  const trimmed = email?.trim();

  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-muted">
        E-mail
      </p>
      {trimmed ? (
        <a
          href={`mailto:${trimmed}`}
          className="mt-1 block text-sm text-royal-blue transition hover:underline"
        >
          {trimmed}
        </a>
      ) : (
        <p className="mt-1 text-sm text-foreground">-</p>
      )}
    </div>
  );
}

export function MemberPublicProfileView({
  member,
  backHref = "/membros",
}: Props) {
  const initial = member.fullName.charAt(0).toUpperCase();

  return (
    <div>
      <Link
        href={backHref}
        className="inline-flex items-center gap-2 text-sm font-medium text-royal-blue transition hover:text-royal-blue-light"
      >
        ← Voltar aos membros
      </Link>

      <article className="mt-6 rounded-2xl border border-gold/20 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-start">
          <div className="relative h-32 w-32 shrink-0 overflow-hidden rounded-full border-4 border-gold/30 bg-royal-blue/5">
            {member.photoUrl ? (
              <Image
                src={member.photoUrl}
                alt={member.fullName}
                fill
                className="object-cover"
                sizes="128px"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <span className="section-title text-4xl font-bold text-royal-blue/40">
                  {initial}
                </span>
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1 text-center sm:text-left">
            {member.executiveRoleLabel ? (
              <p className="text-xs font-semibold uppercase tracking-wide text-gold">
                {member.executiveRoleLabel}
              </p>
            ) : null}

            <h1 className="section-title text-3xl font-bold text-royal-blue">
              {member.fullName}
            </h1>

            {member.memberId ? (
              <p className="mt-2 text-sm text-muted">ID {member.memberId}</p>
            ) : null}
          </div>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <InfoRow label="Cidade" value={member.city} />
          <InfoRow
            label="Aniversário"
            value={formatBirthDate(member.birthDate)}
          />
          <InfoRow
            label="Data de nascimento"
            value={formatFullBirthDate(member.birthDate)}
          />
          <InfoRow label="Idade" value={formatAge(member.birthDate)} />
          <EmailRow email={member.email} />
          <InfoRow label="Telefone" value={formatPhone(member.phone)} />
          <InfoRow label="Colégio Alumni" value={member.alumniCollege} />
          <InfoRow label="Capítulo" value={member.chapterName} />
          <InfoRow label="Profissão" value={member.profession} />
          <InfoRow
            label="Escolaridade"
            value={formatEducationLevel(member.educationLevel)}
          />
          <InfoRow
            label="Já é maçon?"
            value={formatIsMason(member.isMason)}
          />
        </div>
      </article>
    </div>
  );
}
