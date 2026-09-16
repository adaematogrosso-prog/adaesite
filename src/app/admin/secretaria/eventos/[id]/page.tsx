import Link from "next/link";
import { notFound } from "next/navigation";
import { requireSecretariaAccess } from "@/lib/auth/admin";
import {
  getEventForAdmin,
  getEventRegistrations,
} from "@/lib/secretaria/events";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { SecretariaEventForm } from "@/components/secretaria/SecretariaEventForm";
import { EventRegistrationsAdmin } from "@/components/secretaria/EventRegistrationsAdmin";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function AdminSecretariaEventDetailPage({ params }: Props) {
  await requireSecretariaAccess();
  const { id } = await params;

  const [event, registrations] = await Promise.all([
    getEventForAdmin(id),
    getEventRegistrations(id),
  ]);

  if (!event) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-4xl space-y-10">
      <AdminPageHeader
        title={event.title}
        subtitle={event.subtitle || "Editar evento e acompanhar inscrições."}
        actions={
          <Link
            href="/admin/secretaria/eventos"
            className="inline-flex items-center justify-center rounded-full border border-gold/30 px-5 py-2.5 text-sm font-semibold text-royal-blue transition hover:bg-gold/10"
          >
            ← Voltar
          </Link>
        }
      />

      <SecretariaEventForm event={event} />

      <section className="border-t border-gold/20 pt-10">
        <h2 className="section-title text-2xl font-semibold text-royal-blue">
          Inscrições ({registrations.length})
        </h2>
        <p className="mt-1 text-sm text-muted">
          Confirme pagamentos PIX recebidos pela tesouraria.
        </p>
        <div className="mt-6">
          <EventRegistrationsAdmin registrations={registrations} />
        </div>
      </section>
    </div>
  );
}
