import Image from "next/image";
import Link from "next/link";
import { formatBirthDate } from "@/lib/format";
import type { DirectoryMember } from "@/lib/members/directory";

type Props = {
  member: DirectoryMember;
  profileFrom?: "admin";
};

function InfoRow({ label, value }: { label: string; value: string | null }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-muted">
        {label}
      </p>
      <p className="mt-0.5 text-sm text-foreground">{value?.trim() || "-"}</p>
    </div>
  );
}

function EyeIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
      aria-hidden
    >
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

export function MemberDirectoryCard({ member, profileFrom }: Props) {
  const initial = member.fullName.charAt(0).toUpperCase();
  const profileHref = member.userId
    ? profileFrom === "admin"
      ? `/admin/membros/${member.userId}`
      : `/membros/${member.userId}`
    : null;

  return (
    <article className="relative flex min-w-0 flex-col rounded-2xl border border-gold/20 bg-white p-5 shadow-sm transition hover:border-gold/40 hover:shadow-md">
      {profileHref ? (
        <Link
          href={profileHref}
          title="Ver perfil"
          aria-label={`Ver perfil de ${member.fullName}`}
          className="absolute right-4 top-4 inline-flex h-9 w-9 items-center justify-center rounded-full border border-gold/30 text-royal-blue transition hover:border-gold hover:bg-gold/10"
        >
          <EyeIcon />
        </Link>
      ) : null}

      <div className="flex items-start gap-4 pr-10">
        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full border-4 border-gold/30 bg-royal-blue/5">
          {member.photoUrl ? (
            <Image
              src={member.photoUrl}
              alt={member.fullName}
              fill
              className="object-cover"
              sizes="80px"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <span className="section-title text-2xl font-bold text-royal-blue/40">
                {initial}
              </span>
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          {member.executiveRoleLabel ? (
            <p className="text-xs font-semibold uppercase tracking-wide text-gold">
              {member.executiveRoleLabel}
            </p>
          ) : null}

          <h3 className="section-title text-lg font-semibold text-royal-blue">
            {member.fullName}
          </h3>

          {member.memberId ? (
            <p className="mt-1 text-sm text-muted">ID {member.memberId}</p>
          ) : null}
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <InfoRow label="Cidade" value={member.city} />
        <InfoRow label="Aniversário" value={formatBirthDate(member.birthDate)} />
        <InfoRow label="Colégio Alumni" value={member.alumniCollege} />
        <InfoRow label="Capítulo" value={member.chapterName} />
      </div>
    </article>
  );
}
