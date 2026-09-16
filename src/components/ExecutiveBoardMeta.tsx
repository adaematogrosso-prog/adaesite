import type { ExecutiveBoardSettings } from "@/types/database";

type Props = {
  settings: ExecutiveBoardSettings;
};

export function ExecutiveBoardMeta({ settings }: Props) {
  const managementTerm = settings.management_term.trim();
  const slateName = settings.slate_name.trim();

  if (!managementTerm && !slateName) {
    return null;
  }

  return (
    <div className="board-org-meta">
      {managementTerm ? (
        <p className="board-org-term">Gestão {managementTerm}</p>
      ) : null}
      {slateName ? (
        <p className="board-org-slate">
          Chapa <span className="board-org-slate-name">{slateName}</span>
        </p>
      ) : null}
    </div>
  );
}
