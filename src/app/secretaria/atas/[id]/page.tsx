import { notFound } from "next/navigation";
import { getMeetingMinute } from "@/lib/secretaria/minutes";
import { SiteLayout } from "@/components/SiteLayout";
import { CeremonialPageShell } from "@/components/landing/CeremonialPageShell";
import { SecretariaNav } from "@/components/secretaria/SecretariaNav";
import { MeetingMinuteViewerContent } from "@/components/secretaria/MeetingMinuteViewerContent";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function SecretariaMinuteViewerPage({ params }: Props) {
  const { id } = await params;
  const minute = await getMeetingMinute(id);

  if (!minute) {
    notFound();
  }

  return (
    <SiteLayout>
      <CeremonialPageShell className="min-h-[calc(100dvh-4.5rem)] pb-16">
        <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6">
          <SecretariaNav />

          <div className="mt-8">
            <MeetingMinuteViewerContent minute={minute} tone="dark" />
          </div>
        </div>
      </CeremonialPageShell>
    </SiteLayout>
  );
}
