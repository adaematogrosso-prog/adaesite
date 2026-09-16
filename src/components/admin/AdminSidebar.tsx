"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOutAdmin } from "@/actions/executive-members";
import { Logo } from "@/components/Logo";
import { SITE_SHORT_NAME } from "@/lib/constants";
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

function MenuIcon({ open }: { open: boolean }) {
  return (
    <span className="relative h-3.5 w-4">
      <span
        className={`absolute left-0 top-0 h-0.5 w-4 rounded-full bg-current transition-transform duration-300 ${
          open ? "translate-y-[6px] rotate-45" : ""
        }`}
      />
      <span
        className={`absolute left-0 top-[6px] h-0.5 w-4 rounded-full bg-current transition-opacity duration-300 ${
          open ? "opacity-0" : "opacity-100"
        }`}
      />
      <span
        className={`absolute left-0 top-3 h-0.5 w-4 rounded-full bg-current transition-transform duration-300 ${
          open ? "-translate-y-[6px] -rotate-45" : ""
        }`}
      />
    </span>
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
  const [menuOpen, setMenuOpen] = useState(false);
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

  useEffect(() => {
    setMenuOpen(false);
  }, [currentPath]);

  useEffect(() => {
    if (!menuOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [menuOpen]);

  function isActive(item: NavItem) {
    if (item.exact) {
      return currentPath === item.href;
    }

    if (item.href === "/") {
      return false;
    }

    return currentPath.startsWith(item.href);
  }

  function renderAvatar(sizeClass = "h-11 w-11") {
    return (
      <span
        className={`admin-sidebar-avatar relative block rounded-full border ${sizeClass}`}
      >
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
    );
  }

  return (
    <>
      <header className="admin-mobile-header relative z-30 flex shrink-0 items-center justify-between gap-3 border-b border-gold/20 bg-royal-blue px-4 py-3 lg:hidden">
        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white transition hover:border-gold/40 hover:text-gold"
          aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
          aria-expanded={menuOpen}
        >
          <MenuIcon open={menuOpen} />
        </button>

        <Link href="/admin" className="min-w-0 flex-1 text-center">
          <p className="section-title truncate text-sm font-semibold text-gold">
            {SITE_SHORT_NAME}
          </p>
          <p className="truncate text-xs text-white/75">Painel administrativo</p>
        </Link>

        <Link
          href="/admin/perfil"
          title="Meu perfil"
          className="inline-flex shrink-0 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/50"
        >
          {renderAvatar("h-9 w-9")}
        </Link>
      </header>

      {menuOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/55 lg:hidden"
          aria-label="Fechar menu"
          onClick={() => setMenuOpen(false)}
        />
      ) : null}

      <aside
        className={`admin-sidebar fixed inset-y-0 left-0 z-50 flex w-[min(100vw-2.5rem,18rem)] shrink-0 flex-col transition-transform duration-300 lg:sticky lg:top-0 lg:z-auto lg:h-full lg:w-64 lg:translate-x-0 lg:overflow-y-auto lg:transition-none ${
          menuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <AdminSidebarBackground />

        <div className="admin-sidebar-inner relative z-[1] flex min-h-0 flex-1 flex-col overflow-y-auto">
          <div className="admin-sidebar-brand relative flex flex-col items-center px-5 py-6 text-center">
            <button
              type="button"
              onClick={() => setMenuOpen(false)}
              className="absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/15 text-white/80 transition hover:border-gold/40 hover:text-gold lg:hidden"
              aria-label="Fechar menu"
            >
              <MenuIcon open />
            </button>

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
                onClick={() => setMenuOpen(false)}
              >
                {renderAvatar()}
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
                onClick={() => setMenuOpen(false)}
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
    </>
  );
}
