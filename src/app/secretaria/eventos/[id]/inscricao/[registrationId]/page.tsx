import Link from "next/link";
import { notFound } from "next/navigation";
import { requireApprovedMember } from "@/lib/auth/admin";
import {
  getPublishedEventWithPlans,
  getRegistrationForUser,
} from "@/lib/secretaria/events";
import { getTreasuryPixSettings } from "@/lib/treasury/treasury";
import { SiteLayout } from "@/components/SiteLayout";
import { CeremonialPageShell } from "@/components/landing/CeremonialPageShell";
import { SecretariaNav } from "@/components/secretaria/SecretariaNav";
import { EventRegistrationPayment } from "@/components/secretaria/EventRegistrationPayment";

type Props = {
  params: Promise<{ id: string; registrationId: string }>;
};

export default async function SecretariaEventRegistrationPaymentPage({
  params,
}: Props) {
  const user = await requireApprovedMember();
  const { id, registrationId } = await params;

  const [event, registration, pixSettings] = await Promise.all([
    getPublishedEventWithPlans(id),
    getRegistrationForUser(registrationId, user.id),
    getTreasuryPixSettings(),
  ]);

  if (!event || !registration || registration.event_id !== event.id) {
    notFound();
  }

  return (
    <SiteLayout>
      <CeremonialPageShell className="min-h-[calc(100dvh-4.5rem)] pb-16">
        <div className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6">
          <SecretariaNav />

          <div className="mt-8">
            <Link
              href={`/secretaria/eventos/${event.id}`}
              className="text-sm text-gold transition hover:underline"
            >
              ← Voltar para {event.title}
            </Link>

            <div className="mt-6">
              <EventRegistrationPayment
                event={event}
                registration={registration}
                pixSettings={pixSettings}
              />
            </div>
          </div>
        </div>
      </CeremonialPageShell>
    </SiteLayout>
  );
}
