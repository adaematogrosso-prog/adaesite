import { getPublishedEvents, getEventPlans } from "@/lib/secretaria/events";
import { SiteLayout } from "@/components/SiteLayout";
import { Logo } from "@/components/Logo";
import { CeremonialPageShell } from "@/components/landing/CeremonialPageShell";
import { SecretariaNav } from "@/components/secretaria/SecretariaNav";
import { SecretariaEventsList } from "@/components/secretaria/SecretariaEventsList";

export default async function SecretariaEventsPage() {
  const events = await getPublishedEvents();
  const eventsWithPlans = await Promise.all(
    events.map(async (event) => ({
      ...event,
      plans: await getEventPlans(event.id),
    })),
  );

  return (
    <SiteLayout>
      <CeremonialPageShell className="min-h-[calc(100dvh-4.5rem)] pb-16">
        <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 sm:py-16">
          <div className="mb-10 text-center">
            <Logo size="lg" className="news-page-logo mx-auto" />
            <p className="landing-section-eyebrow mt-6">Secretaria Estadual</p>
            <h1 className="landing-section-title mt-3">Eventos ADAE-MT</h1>
            <p className="landing-section-lead mx-auto mt-4 max-w-xl">
              Confira eventos da associação e inscreva-se com o plano desejado.
            </p>
          </div>

          <SecretariaNav />

          <div className="mt-10">
            <SecretariaEventsList events={eventsWithPlans} tone="dark" />
          </div>
        </div>
      </CeremonialPageShell>
    </SiteLayout>
  );
}
