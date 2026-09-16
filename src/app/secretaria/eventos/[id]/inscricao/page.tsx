import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { requireApprovedMember } from "@/lib/auth/admin";
import { getMemberProfile } from "@/lib/auth/membership";
import { getPublishedEventWithPlans } from "@/lib/secretaria/events";
import { SiteLayout } from "@/components/SiteLayout";
import { CeremonialPageShell } from "@/components/landing/CeremonialPageShell";
import { SecretariaNav } from "@/components/secretaria/SecretariaNav";
import { EventRegistrationForm } from "@/components/secretaria/EventRegistrationForm";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function SecretariaEventRegistrationPage({ params }: Props) {
  const user = await requireApprovedMember();
  const { id } = await params;

  const [event, profile] = await Promise.all([
    getPublishedEventWithPlans(id),
    getMemberProfile(user.id),
  ]);

  if (!event) {
    notFound();
  }

  if (!event.registration_open || event.plans.length === 0) {
    redirect(`/secretaria/eventos/${event.id}`);
  }

  if (!profile) {
    redirect("/perfil");
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
              <EventRegistrationForm event={event} profile={profile} />
            </div>
          </div>
        </div>
      </CeremonialPageShell>
    </SiteLayout>
  );
}
