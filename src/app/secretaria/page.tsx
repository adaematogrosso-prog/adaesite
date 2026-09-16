import Link from "next/link";
import { getPublishedMeetingMinutes } from "@/lib/secretaria/minutes";
import { getPublishedEvents } from "@/lib/secretaria/events";
import { getPublishedActivities } from "@/lib/secretaria/activities";
import { SiteLayout } from "@/components/SiteLayout";
import { Logo } from "@/components/Logo";
import { CeremonialPageShell } from "@/components/landing/CeremonialPageShell";
import { SecretariaNav } from "@/components/secretaria/SecretariaNav";

export default async function SecretariaPage() {
  const [minutes, events, activities] = await Promise.all([
    getPublishedMeetingMinutes(),
    getPublishedEvents(),
    getPublishedActivities(),
  ]);

  const upcomingEvents = events.filter(
    (event) => new Date(event.event_starts_at) >= new Date(),
  );

  return (
    <SiteLayout>
      <CeremonialPageShell className="min-h-[calc(100dvh-4.5rem)] pb-16">
        <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 sm:py-16">
          <div className="mb-10 text-center">
            <Logo size="lg" className="news-page-logo mx-auto" />
            <p className="landing-section-eyebrow mt-6">Secretaria Estadual</p>
            <h1 className="landing-section-title mt-3">Secretaria ADAE-MT</h1>
            <p className="landing-section-lead mx-auto mt-4 max-w-2xl">
              Consulte atas, eventos e atividades publicadas pela secretaria.
            </p>
          </div>

          <SecretariaNav />

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Link
              href="/secretaria/atas"
              className="rounded-2xl border border-gold/20 bg-white/5 p-6 backdrop-blur-sm transition hover:border-gold/40"
            >
              <p className="text-sm font-semibold uppercase tracking-wide text-gold">
                Atas
              </p>
              <p className="mt-2 text-3xl font-bold text-white">{minutes.length}</p>
              <p className="mt-2 text-sm text-white/70">
                Leia e baixe atas publicadas pela secretaria.
              </p>
            </Link>

            <Link
              href="/secretaria/eventos"
              className="rounded-2xl border border-gold/20 bg-white/5 p-6 backdrop-blur-sm transition hover:border-gold/40"
            >
              <p className="text-sm font-semibold uppercase tracking-wide text-gold">
                Eventos
              </p>
              <p className="mt-2 text-3xl font-bold text-white">
                {upcomingEvents.length}
              </p>
              <p className="mt-2 text-sm text-white/70">
                Próximos eventos abertos para inscrição.
              </p>
            </Link>

            <Link
              href="/secretaria/atividades"
              className="rounded-2xl border border-gold/20 bg-white/5 p-6 backdrop-blur-sm transition hover:border-gold/40"
            >
              <p className="text-sm font-semibold uppercase tracking-wide text-gold">
                Atividades
              </p>
              <p className="mt-2 text-3xl font-bold text-white">{activities.length}</p>
              <p className="mt-2 text-sm text-white/70">
                Publicações e registros das atividades da associação.
              </p>
            </Link>
          </div>
        </div>
      </CeremonialPageShell>
    </SiteLayout>
  );
}
