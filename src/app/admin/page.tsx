import Link from "next/link";
import { requirePanelAccess } from "@/lib/auth/admin";
import { SITE_SHORT_NAME } from "@/lib/constants";
import {
  AdminNavIcon,
  ADMIN_NAV_ICON_BY_HREF,
  type AdminNavIconName,
} from "@/components/admin/AdminNavIcons";

type DashboardCard = {
  href: string;
  title: string;
  description: string;
  show: boolean;
};

function DashboardCardLink({
  href,
  title,
  description,
  icon,
}: {
  href: string;
  title: string;
  description: string;
  icon: AdminNavIconName;
}) {
  return (
    <Link
      href={href}
      className="admin-dashboard-card group flex flex-col items-center justify-center rounded-2xl border border-gold/20 bg-white px-5 py-5 text-center shadow-sm transition hover:-translate-y-0.5 hover:border-gold/40 hover:shadow-lg sm:px-6 sm:py-6"
    >
      <div className="admin-dashboard-card-icon mb-3 flex items-center justify-center rounded-2xl bg-royal-blue/10 text-royal-blue ring-1 ring-gold/20 transition group-hover:bg-royal-blue group-hover:text-gold-light group-hover:ring-gold/40 sm:mb-4">
        <AdminNavIcon name={icon} className="h-6 w-6 sm:h-7 sm:w-7" />
      </div>
      <h2 className="section-title text-base font-semibold text-royal-blue sm:text-lg">
        {title}
      </h2>
      <p className="admin-dashboard-card-desc mt-1.5 text-xs leading-relaxed text-muted sm:mt-2 sm:text-sm">
        {description}
      </p>
    </Link>
  );
}

export default async function AdminDashboardPage() {
  const { isAdmin, canApprove, canPublish, canSecretaria, canTesouraria } =
    await requirePanelAccess();

  const cards: DashboardCard[] = [
    {
      href: "/admin/noticias",
      title: "Notícias / Publicações",
      description: "Veja e publique novidades da ADAE-MT.",
      show: canPublish || isAdmin,
    },
    {
      href: "/admin/documentos",
      title: "Documentos Gerais",
      description: "Publique PDFs e imagens para os membros acessarem.",
      show: canPublish || isAdmin,
    },
    {
      href: "/admin/secretaria",
      title: "Secretaria Estadual",
      description: "Registros, atas e comunicações da secretaria.",
      show: canSecretaria || isAdmin,
    },
    {
      href: "/admin/tesouraria",
      title: "Tesouraria Estadual",
      description: "Controle financeiro e prestação de contas.",
      show: canTesouraria || isAdmin,
    },
    {
      href: "/admin/adesoes",
      title: "Adesões / Cadastro",
      description: "Aprove adesões, edite cadastros e vincule cargos executivos.",
      show: canApprove,
    },
    {
      href: "/admin/edicao-inicial",
      title: "Edição Inicial",
      description: "Gerencie as imagens dos pilares Sêniors na landing page.",
      show: isAdmin,
    },
  ].filter((card) => card.show);

  return (
    <div className="admin-dashboard mx-auto flex w-full max-w-5xl flex-col lg:h-full lg:overflow-hidden">
      <div className="admin-dashboard-header shrink-0 text-center">
        <h1 className="section-title text-2xl font-bold text-royal-blue sm:text-3xl">
          Painel Administrativo
        </h1>
        <p className="mt-1.5 text-sm text-muted sm:mt-2">
          Gerencie o conteúdo da plataforma {SITE_SHORT_NAME}.
        </p>
      </div>

      <div className="admin-dashboard-grid mt-5 sm:mt-6 lg:min-h-0 lg:flex-1">
        {cards.map((card) => (
          <DashboardCardLink
            key={card.href}
            href={card.href}
            title={card.title}
            description={card.description}
            icon={ADMIN_NAV_ICON_BY_HREF[card.href] ?? "inicio"}
          />
        ))}
      </div>
    </div>
  );
}
