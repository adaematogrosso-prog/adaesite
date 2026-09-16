"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOutAdmin } from "@/actions/executive-members";
import { Logo } from "@/components/Logo";
import { AdminSidebarBackground } from "@/components/admin/AdminSidebarBackground";

type Props = {
  isAdmin: boolean;
  canApprove: boolean;
  canPublish: boolean;
  canSecretaria: boolean;
  canTesouraria: boolean;
  userName: string;
  profilePhotoUrl: string | null;
};

type NavItem = {
  href: string;
  label: string;
  exact?: boolean;
  show: boolean;
};

function LogoutIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5"
      aria-hidden
    >
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" x2="9" y1="12" y2="12" />
    </svg>
  );
}

export function AdminSidebar({
  isAdmin,
  canApprove,
  canPublish,
  canSecretaria,
  canTesouraria,
  userName,
  profilePhotoUrl,
}: Props) {
  const currentPath = usePathname();
  const userInitial = userName.charAt(0).toUpperCase();

  const mainItems: NavItem[] = [
    { href: "/admin", label: "Início", exact: true, show: true },
    {
      href: "/admin/membros",
      label: "Membros ADAE-MT",
      show: canApprove || isAdmin,
    },
    { href: "/admin/adesoes", label: "Adesões / Cadastro", show: canApprove },
    {
      href: "/admin/noticias",
      label: "Notícias / Publicações",
      show: canPublish || isAdmin,
    },
    {
      href: "/admin/documentos",
      label: "Documentos Gerais",
      show: canPublish || isAdmin,
    },
    {
      href: "/admin/secretaria",
      label: "Secretaria Estadual",
      show: canSecretaria || isAdmin,
    },
    {
      href: "/admin/tesouraria",
      label: "Tesouraria Estadual",
      show: canTesouraria || isAdmin,
    },
    {
      href: "/admin/edicao-inicial",
      label: "Edição Inicial",
      show: isAdmin,
    },
  ].filter((item) => item.show);

  function isActive(item: NavItem) {
    if (item.exact) {
      return currentPath === item.href;
    }

    if (item.href === "/") {
      return false;
    }

    return currentPath.startsWith(item.href);
  }

  return (
    <aside className="admin-sidebar flex w-full shrink-0 flex-col lg:sticky lg:top-0 lg:h-full lg:w-64 lg:overflow-y-auto">
      <AdminSidebarBackground />

      <div className="admin-sidebar-inner relative z-[1] flex min-h-0 flex-1 flex-col">
        <div className="admin-sidebar-brand flex flex-col items-center px-5 py-6 text-center">
          <div className="admin-sidebar-logo-emphasis relative inline-block">
            <Logo size="panel" className="admin-sidebar-logo relative z-10" />
          </div>
          <p className="admin-sidebar-user mt-4 text-sm font-medium leading-snug">
            {userName}
          </p>

          <div className="mt-3 flex items-center justify-center gap-3">
            <Link
              href="/admin/perfil"
              title="Meu perfil"
              className="group inline-flex rounded-full focus-visible:outline-none"
            >
              <span className="admin-sidebar-avatar relative block h-11 w-11 rounded-full border transition group-hover:border-gold/60 group-focus-visible:border-gold/60">
                <span className="absolute inset-0 overflow-hidden rounded-full">
                  {profilePhotoUrl ? (
                    <Image
                      src={profilePhotoUrl}
                      alt={userName}
                      fill
                      className="object-cover"
                      sizes="44px"
                    />
                  ) : (
                    <span className="flex h-full w-full items-center justify-center text-sm font-semibold text-white/90">
                      {userInitial}
                    </span>
                  )}
                </span>
              </span>
            </Link>

            <form action={signOutAdmin}>
              <button
                type="submit"
                aria-label="Sair"
                title="Sair"
                className="admin-sidebar-logout inline-flex h-11 w-11 items-center justify-center rounded-lg border transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/50"
              >
                <LogoutIcon />
              </button>
            </form>
          </div>
        </div>

        <nav className="admin-sidebar-nav flex flex-col gap-1 px-3 py-4">
          {mainItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`admin-sidebar-link${
                isActive(item) ? " admin-sidebar-link-active" : ""
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </aside>
  );
}
