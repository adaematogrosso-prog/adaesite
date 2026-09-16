"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { Logo } from "@/components/Logo";
import { SITE_SHORT_NAME } from "@/lib/constants";

const baseNavLinks = [
  { href: "/#historia", label: "História", sectionId: "historia", type: "section" as const },
  { href: "/#seniors", label: "Sêniors", sectionId: "seniors", type: "section" as const },
  { href: "/#diretoria", label: "Diretoria", sectionId: "diretoria", type: "section" as const },
  { href: "/noticias", label: "Notícias", type: "page" as const },
];

const secretariaNavLink = {
  href: "/secretaria",
  label: "Secretaria",
  type: "page" as const,
};

type Props = {
  user: User | null;
  hasPanelAccess: boolean;
  isApprovedMember: boolean;
};

export function SiteHeader({
  user,
  hasPanelAccess,
  isApprovedMember,
}: Props) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  const activeSectionRef = useRef("");

  useEffect(() => {
    let ticking = false;

    function handleScroll() {
      if (ticking) return;

      ticking = true;
      requestAnimationFrame(() => {
        setScrolled(window.scrollY > 12);
        ticking = false;
      });
    }

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const sections = baseNavLinks
      .filter((link) => link.type === "section")
      .map((link) => document.getElementById(link.sectionId!))
      .filter(Boolean) as HTMLElement[];

    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

        const nextSection = visible[0]?.target.id ?? "";
        if (nextSection && nextSection !== activeSectionRef.current) {
          activeSectionRef.current = nextSection;
          setActiveSection(nextSection);
        }
      },
      { rootMargin: "-40% 0px -45% 0px", threshold: [0.25, 0.5] },
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    function handleResize() {
      if (window.innerWidth >= 768) setMenuOpen(false);
    }

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  function isLinkActive(link: (typeof baseNavLinks)[number] | typeof secretariaNavLink) {
    if (link.type === "page") {
      return pathname.startsWith(link.href);
    }

    return pathname === "/" && activeSection === link.sectionId;
  }

  function linkClassName(isActive: boolean) {
    return `nav-link relative rounded-full px-4 py-2 text-sm font-medium transition-all duration-300 ${
      isActive
        ? "bg-gold/20 text-gold shadow-inner shadow-gold/10"
        : "text-white/85 hover:bg-white/10 hover:text-gold"
    }`;
  }

  const showMemberLinks = !!user && isApprovedMember && !hasPanelAccess;
  const showPanelButton = !!user && hasPanelAccess;
  const showLoginButton = !user;
  const showSecretariaLink =
    !!user && (isApprovedMember || hasPanelAccess);
  const navLinks = showSecretariaLink
    ? [...baseNavLinks, secretariaNavLink]
    : baseNavLinks;

  return (
    <header
      className={`safe-area-top sticky top-0 z-50 border-b transition-all duration-300 ${
        scrolled
          ? "border-gold/30 bg-royal-blue/95 shadow-xl shadow-black/20 md:backdrop-blur-md"
          : "border-gold/20 bg-royal-blue shadow-lg"
      }`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <Link
          href="/"
          className="group flex items-center gap-3 transition-transform hover:scale-[1.02]"
        >
          <Logo size="md" priority />
          <div className="hidden sm:block">
            <p className="section-title text-sm font-semibold tracking-wide text-gold transition-colors group-hover:text-gold-light">
              {SITE_SHORT_NAME}
            </p>
            <p className="text-xs text-white/80">
              DeMolay Alumni · Mato Grosso
            </p>
          </div>
        </Link>

        <div className="flex items-center gap-3 md:gap-4">
          <nav className="hidden items-center rounded-full border border-white/10 bg-white/5 p-1 backdrop-blur-sm md:flex">
            {navLinks.map((link) => {
              const isActive = isLinkActive(link);

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={linkClassName(isActive)}
                >
                  {link.label}
                  <span
                    className={`absolute bottom-1 left-1/2 h-0.5 -translate-x-1/2 rounded-full bg-gold transition-all duration-300 ${
                      isActive ? "w-4/5 opacity-100" : "w-0 opacity-0"
                    }`}
                  />
                </Link>
              );
            })}
          </nav>

          <div className="hidden items-center gap-2 md:flex">
            {showPanelButton ? (
              <Link
                href="/admin"
                className="rounded-full border border-gold/60 bg-gold px-4 py-2 text-sm font-medium text-royal-blue transition hover:scale-105 hover:bg-gold-light"
              >
                Painel
              </Link>
            ) : null}

            {showMemberLinks ? (
              <>
                <Link
                  href="/membros"
                  className="rounded-full border border-gold/60 bg-gold/10 px-4 py-2 text-sm font-medium text-gold transition hover:scale-105 hover:bg-gold hover:text-royal-blue"
                >
                  Membros ADAE-MT
                </Link>
                <Link
                  href="/perfil"
                  className="rounded-full border border-gold/60 bg-gold/10 px-4 py-2 text-sm font-medium text-gold transition hover:scale-105 hover:bg-gold hover:text-royal-blue"
                >
                  Meu Perfil
                </Link>
              </>
            ) : null}

            {showLoginButton ? (
              <Link
                href="/login"
                className="rounded-full border border-gold/60 bg-gold/10 px-4 py-2 text-sm font-medium text-gold transition hover:scale-105 hover:bg-gold hover:text-royal-blue"
              >
                Entrar
              </Link>
            ) : null}
          </div>

          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white transition hover:border-gold/40 hover:text-gold md:hidden"
            aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
            aria-expanded={menuOpen}
          >
            <span className="relative h-3.5 w-4">
              <span
                className={`absolute left-0 top-0 h-0.5 w-4 rounded-full bg-current transition-transform duration-300 ${
                  menuOpen ? "translate-y-[6px] rotate-45" : ""
                }`}
              />
              <span
                className={`absolute left-0 top-[6px] h-0.5 w-4 rounded-full bg-current transition-opacity duration-300 ${
                  menuOpen ? "opacity-0" : "opacity-100"
                }`}
              />
              <span
                className={`absolute left-0 top-3 h-0.5 w-4 rounded-full bg-current transition-transform duration-300 ${
                  menuOpen ? "-translate-y-[6px] -rotate-45" : ""
                }`}
              />
            </span>
          </button>
        </div>
      </div>

      <div
        className={`overflow-hidden border-t border-white/10 bg-royal-blue/95 transition-all duration-300 md:hidden ${
          menuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <nav className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-4">
          {navLinks.map((link) => {
            const isActive = isLinkActive(link);

            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className={`rounded-xl px-4 py-3 text-sm font-medium transition ${
                  isActive
                    ? "bg-gold/20 text-gold"
                    : "text-white/90 hover:bg-white/10 hover:text-gold"
                }`}
              >
                {link.label}
              </Link>
            );
          })}

          <div className="mt-2 space-y-2">
            {showPanelButton ? (
              <Link
                href="/admin"
                onClick={() => setMenuOpen(false)}
                className="block rounded-xl bg-gold px-4 py-3 text-center text-sm font-semibold text-royal-blue"
              >
                Painel
              </Link>
            ) : null}

            {showMemberLinks ? (
              <>
                <Link
                  href="/membros"
                  onClick={() => setMenuOpen(false)}
                  className="block rounded-xl border border-gold/40 px-4 py-3 text-center text-sm font-semibold text-gold"
                >
                  Membros ADAE-MT
                </Link>
                <Link
                  href="/perfil"
                  onClick={() => setMenuOpen(false)}
                  className="block rounded-xl border border-gold/40 px-4 py-3 text-center text-sm font-semibold text-gold"
                >
                  Meu Perfil
                </Link>
              </>
            ) : null}

            {showLoginButton ? (
              <Link
                href="/login"
                onClick={() => setMenuOpen(false)}
                className="block rounded-xl border border-gold/40 px-4 py-3 text-center text-sm font-semibold text-gold"
              >
                Entrar
              </Link>
            ) : null}
          </div>
        </nav>
      </div>
    </header>
  );
}
