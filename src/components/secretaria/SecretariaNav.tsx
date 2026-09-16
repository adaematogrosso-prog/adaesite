"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/secretaria", label: "Visão geral", exact: true },
  { href: "/secretaria/atas", label: "Atas" },
  { href: "/secretaria/eventos", label: "Eventos" },
  { href: "/secretaria/atividades", label: "Atividades" },
];

export function SecretariaNav() {
  const pathname = usePathname();

  return (
    <nav className="mb-8 flex flex-wrap justify-center gap-2">
      {items.map((item) => {
        const isActive = item.exact
          ? pathname === item.href
          : pathname.startsWith(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`rounded-full px-5 py-2 text-sm font-medium transition ${
              isActive
                ? "bg-royal-blue text-white shadow-md"
                : "border border-gold/30 bg-white/10 text-white hover:border-gold/50 hover:bg-gold/10"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
