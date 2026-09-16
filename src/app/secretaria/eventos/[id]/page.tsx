import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAdminSession, getAuthUser } from "@/lib/auth/admin";
import { getPublishedEventWithPlans } from "@/lib/secretaria/events";
import { formatCurrencyFromCents } from "@/lib/treasury/money";
import { SiteLayout } from "@/components/SiteLayout";
import { CeremonialPageShell } from "@/components/landing/CeremonialPageShell";
import { SecretariaNav } from "@/components/secretaria/SecretariaNav";

type Props = {
  params: Promise<{ id: string }>;
};

function formatEventDate(value: string) {
  return new Date(value).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function SecretariaEventDetailPage({ params }: Props) {
  const { id } = await params;
  const event = await getPublishedEventWithPlans(id);

  if (!event) {
    notFound();
  }

  const user = await getAuthUser();
  const { isApprovedMember } = await getAdminSession();
  const canRegister = !!user && isApprovedMember && event.registration_open;

  const registerHref = user
    ? `/secretaria/eventos/${event.id}/inscricao`
    : `/login?next=/secretaria/eventos/${event.id}/inscricao`;

  return (
    <SiteLayout>
      <CeremonialPageShell className="min-h-[calc(100dvh-4.5rem)] pb-16">
        <div className="mx-auto w-full max-w-4xl px-4 py-12 sm:px-6">
          <SecretariaNav />

          <article className="mt-8 overflow-hidden rounded-2xl border border-gold/20 bg-white/5 backdrop-blur-sm">
            {event.image_url ? (
              <div className="relative aspect-[16/9] w-full">
                <Image
                  src={event.image_url}
                  alt={event.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 896px) 100vw, 896px"
                  priority
                />
              </div>
            ) : null}

            <div className="p-6 sm:p-8">
              <p className="text-sm font-semibold uppercase tracking-wide text-gold">
                {formatEventDate(event.event_starts_at)}
              </p>
              <h1 className="landing-section-title mt-3">{event.title}</h1>
              {event.subtitle ? (
                <p className="mt-2 text-lg text-white/80">{event.subtitle}</p>
              ) : null}

              {event.location ? (
                <p className="mt-4 text-sm text-white/70">{event.location}</p>
              ) : null}

              {event.description ? (
                <p className="mt-6 whitespace-pre-wrap text-sm leading-relaxed text-white/75">
                  {event.description}
                </p>
              ) : null}

              {event.plans.length > 0 ? (
                <div className="mt-8 space-y-3">
                  <h2 className="text-lg font-semibold text-white">Planos</h2>
                  {event.plans.map((plan) => (
                    <div
                      key={plan.id}
                      className="rounded-xl border border-gold/15 bg-black/20 p-4"
                    >
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="font-semibold text-white">{plan.name}</p>
                          {plan.description ? (
                            <p className="mt-1 text-sm text-white/70">
                              {plan.description}
                            </p>
                          ) : null}
                          <div className="mt-2 flex flex-wrap gap-2 text-[11px] font-semibold uppercase tracking-wide text-white/60">
                            {plan.includes_accommodation ? (
                              <span className="rounded-full border border-gold/20 px-2 py-0.5">
                                Hospedagem
                              </span>
                            ) : null}
                            {plan.includes_kit ? (
                              <span className="rounded-full border border-gold/20 px-2 py-0.5">
                                Kit / camiseta
                              </span>
                            ) : null}
                          </div>
                        </div>
                        <p className="text-lg font-bold text-gold">
                          {formatCurrencyFromCents(plan.price_cents)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : null}

              <div className="mt-8 flex flex-wrap gap-3">
                {event.registration_open && event.plans.length > 0 ? (
                  canRegister ? (
                    <Link
                      href={registerHref}
                      className="inline-flex items-center justify-center rounded-full bg-royal-blue px-6 py-3 text-sm font-semibold text-white transition hover:bg-royal-blue-light"
                    >
                      Inscrever-se
                    </Link>
                  ) : user && !isApprovedMember ? (
                    <p className="rounded-xl border border-gold/20 bg-black/20 px-4 py-3 text-sm text-white/80">
                      Sua adesão precisa estar aprovada para se inscrever.
                    </p>
                  ) : (
                    <Link
                      href={registerHref}
                      className="inline-flex items-center justify-center rounded-full bg-royal-blue px-6 py-3 text-sm font-semibold text-white transition hover:bg-royal-blue-light"
                    >
                      Entrar para se inscrever
                    </Link>
                  )
                ) : (
                  <p className="rounded-xl border border-gold/20 bg-black/20 px-4 py-3 text-sm text-white/80">
                    Inscrições encerradas para este evento.
                  </p>
                )}

                <Link
                  href="/secretaria/eventos"
                  className="inline-flex items-center justify-center rounded-full border border-gold/30 px-6 py-3 text-sm font-semibold text-gold transition hover:bg-gold/10"
                >
                  Voltar
                </Link>
              </div>
            </div>
          </article>
        </div>
      </CeremonialPageShell>
    </SiteLayout>
  );
}
