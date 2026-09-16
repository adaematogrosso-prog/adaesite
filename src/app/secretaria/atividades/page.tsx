import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth/admin";
import { getPublishedActivities } from "@/lib/secretaria/activities";
import { SiteLayout } from "@/components/SiteLayout";
import { Logo } from "@/components/Logo";
import { CeremonialPageShell } from "@/components/landing/CeremonialPageShell";
import { SecretariaNav } from "@/components/secretaria/SecretariaNav";
import { ActivitiesFeedWithSearch } from "@/components/secretaria/ActivitiesFeedWithSearch";

export default async function SecretariaActivitiesPage() {
  const { user, canSecretaria, isAdmin } = await getAdminSession();

  if (user && (canSecretaria || isAdmin)) {
    redirect("/admin/secretaria/atividades");
  }

  const activities = await getPublishedActivities();

  return (
    <SiteLayout>
      <CeremonialPageShell className="min-h-[calc(100dvh-4.5rem)] pb-16">
        <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 sm:py-16">
          <div className="mb-10 text-center">
            <Logo size="lg" className="news-page-logo mx-auto" />
            <p className="landing-section-eyebrow mt-6">Secretaria Estadual</p>
            <h1 className="landing-section-title mt-3">Atividades ADAE-MT</h1>
            <p className="landing-section-lead mx-auto mt-4 max-w-xl">
              Acompanhe as atividades e publicações da secretaria.
            </p>
          </div>

          <SecretariaNav />

          <div className="mt-10">
            <ActivitiesFeedWithSearch activities={activities} tone="dark" />
          </div>
        </div>
      </CeremonialPageShell>
    </SiteLayout>
  );
}
