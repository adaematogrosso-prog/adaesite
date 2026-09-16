type IconProps = {
  className?: string;
};

function HomeIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className={className}
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1v-9.5Z"
      />
    </svg>
  );
}

function MembersIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className={className}
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M16 11a3 3 0 1 0-6 0 3 3 0 0 0 6 0Z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4 19a4 4 0 0 1 8 0M14 8.5a3 3 0 1 1 2.5 4.7M18 19a3.5 3.5 0 0 0-2.2-3.2"
      />
    </svg>
  );
}

function EnrollmentIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className={className}
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M16 11h5M18.5 8.5v5"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M8 11a3 3 0 1 0-6 0 3 3 0 0 0 6 0Z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2 19a4 4 0 0 1 8 0M14 19h6"
      />
    </svg>
  );
}

function NewsIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className={className}
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6 4h12a1 1 0 0 1 1 1v14l-3-2-3 2-3-2-3 2-3-2V5a1 1 0 0 1 1-1Z"
      />
      <path strokeLinecap="round" d="M8 8h8M8 12h8M8 16h5" />
    </svg>
  );
}

function DocumentsIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className={className}
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M8 4h8l3 3v13H5V4h3Z"
      />
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 4v4h8" />
      <path strokeLinecap="round" d="M9 13h6M9 17h4" />
    </svg>
  );
}

function SecretariaIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className={className}
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"
      />
      <path strokeLinecap="round" d="M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2M9 12h6M9 16h4" />
    </svg>
  );
}

function TesourariaIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className={className}
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 7h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z"
      />
      <path strokeLinecap="round" d="M3 10h18" />
      <path strokeLinecap="round" d="M7 15h4" />
    </svg>
  );
}

function LandingIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className={className}
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4 7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7Z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m8 15 2.5-3 2 2 3.5-4.5L18 15"
      />
      <circle cx="9" cy="9" r="1.2" fill="currentColor" stroke="none" />
    </svg>
  );
}

function LogoutIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className={className}
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M10 6H6a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h4"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M14 12H8m6 0-3-3m3 3-3 3"
      />
    </svg>
  );
}

export type AdminNavIconName =
  | "inicio"
  | "membros"
  | "adesoes"
  | "noticias"
  | "documentos"
  | "secretaria"
  | "tesouraria"
  | "edicao-inicial"
  | "sair";

const ICONS: Record<
  AdminNavIconName,
  ({ className }: IconProps) => React.JSX.Element
> = {
  inicio: HomeIcon,
  membros: MembersIcon,
  adesoes: EnrollmentIcon,
  noticias: NewsIcon,
  documentos: DocumentsIcon,
  secretaria: SecretariaIcon,
  tesouraria: TesourariaIcon,
  "edicao-inicial": LandingIcon,
  sair: LogoutIcon,
};

export const ADMIN_NAV_ICON_BY_HREF: Record<string, AdminNavIconName> = {
  "/admin": "inicio",
  "/admin/membros": "membros",
  "/admin/adesoes": "adesoes",
  "/admin/noticias": "noticias",
  "/admin/documentos": "documentos",
  "/admin/secretaria": "secretaria",
  "/admin/tesouraria": "tesouraria",
  "/admin/edicao-inicial": "edicao-inicial",
};

export function AdminNavIcon({
  name,
  className,
}: {
  name: AdminNavIconName;
  className?: string;
}) {
  const Icon = ICONS[name];
  return <Icon className={className} />;
}

export function AdminNavIconByHref({
  href,
  className,
}: {
  href: string;
  className?: string;
}) {
  const name = ADMIN_NAV_ICON_BY_HREF[href] ?? "inicio";
  return <AdminNavIcon name={name} className={className} />;
}
