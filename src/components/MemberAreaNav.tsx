"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/perfil", label: "Meu Perfil" },
  { href: "/membros", label: "Membros ADAE-MT" },
  { href: "/documentos", label: "Documentos Gerais" },
  { href: "/secretaria", label: "Secretaria Estadual" },
];

export function MemberAreaNav() {
  const pathname = usePathname();

  return (
    <nav className="mb-8 flex flex-wrap justify-center gap-2">
      {items.map((item) => {
        const isActive = pathname === item.href;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`rounded-full px-5 py-2 text-sm font-medium transition ${
              isActive
                ? "bg-royal-blue text-white shadow-md"
                : "border border-gold/30 bg-white text-royal-blue hover:border-gold/50 hover:bg-gold/5"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
