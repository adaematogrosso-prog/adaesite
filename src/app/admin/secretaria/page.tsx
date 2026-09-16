import Link from "next/link";

import { requireSecretariaAccess } from "@/lib/auth/admin";
import { getMembersDirectory } from "@/lib/members/directory";
import { getAllMeetingMinutes } from "@/lib/secretaria/minutes";
import { getAllEvents, getEventPlansForAdmin } from "@/lib/secretaria/events";
import { getPublishedActivities } from "@/lib/secretaria/activities";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";

export default async function AdminSecretariaPage() {
  const { canApprove, isAdmin } = await requireSecretariaAccess();

  const [minutes, events, publishedActivities, membersDirectory] =
    await Promise.all([
      getAllMeetingMinutes(),
      getAllEvents(),
      getPublishedActivities(),
      getMembersDirectory(),
    ]);

  const eventsWithPlans = await Promise.all(
    events.map(async (event) => ({
      ...event,
      plans: await getEventPlansForAdmin(event.id),
    })),
  );

  const publishedEvents = eventsWithPlans.filter((event) => event.is_published);
  const membersCount =
    membersDirectory.boardMembers.length + membersDirectory.members.length;
  const showMembersCard = canApprove || isAdmin;

  return (
    <div className="mx-auto max-w-5xl">
      <AdminPageHeader
        title="Secretaria Estadual"
        subtitle="Gerencie atas, eventos, atividades, membros e inscrições."
      />

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {showMembersCard ? (
          <Link
            href="/admin/membros"
            className="rounded-2xl border border-gold/20 bg-white p-6 shadow-sm transition hover:border-gold/40 hover:shadow-md"
          >
            <p className="text-sm font-semibold uppercase tracking-wide text-gold">
              Membros ADAE-MT
            </p>
            <p className="section-title mt-2 text-2xl font-bold text-royal-blue">
              {membersCount}
            </p>
            <p className="mt-2 text-sm text-muted">
              Consulte a diretoria e os membros aprovados da associação.
            </p>
          </Link>
        ) : null}

        <Link
          href="/admin/secretaria/atas"
          className="rounded-2xl border border-gold/20 bg-white p-6 shadow-sm transition hover:border-gold/40 hover:shadow-md"
        >
          <p className="text-sm font-semibold uppercase tracking-wide text-gold">
            Atas
          </p>
          <p className="section-title mt-2 text-2xl font-bold text-royal-blue">
            {minutes.length}
          </p>
          <p className="mt-2 text-sm text-muted">
            Publicar PDFs com título e descrição para leitura pública.
          </p>
        </Link>

        <Link
          href="/admin/secretaria/eventos"
          className="rounded-2xl border border-gold/20 bg-white p-6 shadow-sm transition hover:border-gold/40 hover:shadow-md"
        >
          <p className="text-sm font-semibold uppercase tracking-wide text-gold">
            Eventos
          </p>
          <p className="section-title mt-2 text-2xl font-bold text-royal-blue">
            {publishedEvents.length}
          </p>
          <p className="mt-2 text-sm text-muted">
            Criar eventos, planos de inscrição e acompanhar pagamentos.
          </p>
        </Link>

        <Link
          href="/admin/secretaria/atividades"
          className="rounded-2xl border border-gold/20 bg-white p-6 shadow-sm transition hover:border-gold/40 hover:shadow-md"
        >
          <p className="text-sm font-semibold uppercase tracking-wide text-gold">
            Atividades
          </p>
          <p className="section-title mt-2 text-2xl font-bold text-royal-blue">
            {publishedActivities.length}
          </p>
          <p className="mt-2 text-sm text-muted">
            Publicar atividades com banner, subtítulo e texto formatado.
          </p>
        </Link>
      </div>
    </div>
  );
}
