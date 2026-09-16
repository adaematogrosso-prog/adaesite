import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth/admin";
import { getPublishedMeetingMinutes } from "@/lib/secretaria/minutes";
import { SiteLayout } from "@/components/SiteLayout";
import { Logo } from "@/components/Logo";
import { CeremonialPageShell } from "@/components/landing/CeremonialPageShell";
import { SecretariaNav } from "@/components/secretaria/SecretariaNav";
import { MeetingMinutesList } from "@/components/secretaria/MeetingMinutesList";

export default async function SecretariaMinutesPage() {
  const { user, canSecretaria, isAdmin } = await getAdminSession();

  if (user && (canSecretaria || isAdmin)) {
    redirect("/admin/secretaria/atas");
  }

  const minutes = await getPublishedMeetingMinutes();

  return (
    <SiteLayout>
      <CeremonialPageShell className="min-h-[calc(100dvh-4.5rem)] pb-16">
        <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 sm:py-16">
          <div className="mb-10 text-center">
            <Logo size="lg" className="news-page-logo mx-auto" />
            <p className="landing-section-eyebrow mt-6">Secretaria Estadual</p>
            <h1 className="landing-section-title mt-3">Atas ADAE-MT</h1>
            <p className="landing-section-lead mx-auto mt-4 max-w-xl">
              Documentos oficiais publicados pela secretaria para leitura e
              download.
            </p>
          </div>

          <SecretariaNav />

          <div className="mt-10">
            <MeetingMinutesList minutes={minutes} tone="dark" />
          </div>
        </div>
      </CeremonialPageShell>
    </SiteLayout>
  );
}
