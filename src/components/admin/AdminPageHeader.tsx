import type { ReactNode } from "react";

type Props = {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  className?: string;
};

export function AdminPageHeader({
  title,
  subtitle,
  actions,
  className = "",
}: Props) {
  return (
    <header className={`admin-page-header ${className}`.trim()}>
      <h1 className="admin-page-title section-title text-3xl font-bold text-royal-blue">
        {title}
      </h1>
      {subtitle ? (
        <p className="admin-page-subtitle text-muted">{subtitle}</p>
      ) : null}
      {actions ? (
        <div className="admin-page-header-actions">{actions}</div>
      ) : null}
    </header>
  );
}
