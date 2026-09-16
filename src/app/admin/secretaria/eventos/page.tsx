import Link from "next/link";
import { requireSecretariaAccess } from "@/lib/auth/admin";
import { getAllEvents, getEventPlansForAdmin } from "@/lib/secretaria/events";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { SecretariaEventsList } from "@/components/secretaria/SecretariaEventsList";

export default async function AdminSecretariaEventsPage() {
  await requireSecretariaAccess();

  const events = await getAllEvents();
  const eventsWithPlans = await Promise.all(
    events.map(async (event) => ({
      ...event,
      plans: await getEventPlansForAdmin(event.id),
    })),
  );

  return (
    <div>
      <AdminPageHeader
        title="Eventos"
        subtitle="Crie eventos com planos de inscrição, imagem de divulgação e acompanhe pagamentos."
        actions={
          <Link
            href="/admin/secretaria/eventos/novo"
            className="inline-flex items-center justify-center rounded-full bg-royal-blue px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-royal-blue-light"
          >
            Novo evento
          </Link>
        }
      />

      <div className="mt-8">
        <SecretariaEventsList
          events={eventsWithPlans}
          canManage
          viewerBasePath="/admin/secretaria/eventos"
        />
      </div>
    </div>
  );
}
