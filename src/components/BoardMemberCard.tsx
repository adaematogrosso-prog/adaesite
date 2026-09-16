import { ImageLightbox } from "@/components/ImageLightbox";
import { EXECUTIVE_ROLE_LABELS } from "@/lib/constants";
import type { ExecutiveDisplay } from "@/lib/members/executive-display";

type Props = {
  member: ExecutiveDisplay;
  variant?: "default" | "adjunct";
};

export function BoardMemberCard({ member, variant = "default" }: Props) {
  const roleLabel = EXECUTIVE_ROLE_LABELS[member.role];
  const hasName = member.displayName.trim().length > 0 && member.displayName !== "A definir";
  const photoAlt = hasName
    ? `${member.displayName} - ${roleLabel}`
    : roleLabel;
  const isAdjunct = variant === "adjunct";

  return (
    <article
      className={`board-member-card group h-full${
        isAdjunct ? " board-member-card-adjunct" : ""
      }`}
    >
      <div className="board-member-card-glow" aria-hidden />
      <div className="board-member-card-shine" aria-hidden />

      <div className="board-member-card-inner">
        <div className="board-member-card-bar" aria-hidden />

        <div className="board-member-photo">
          {member.displayPhotoUrl ? (
            <ImageLightbox
              src={member.displayPhotoUrl}
              alt={photoAlt}
              sizes="128px"
              variant="avatar"
            />
          ) : (
            <div className="board-member-photo-placeholder" aria-hidden>
              <span>{roleLabel.charAt(0)}</span>
            </div>
          )}
        </div>

        <p className="board-member-role">{roleLabel}</p>

        {hasName ? (
          <p className="board-member-name">{member.displayName}</p>
        ) : (
          <p className="board-member-name board-member-name-muted">A definir</p>
        )}
      </div>
    </article>
  );
}
