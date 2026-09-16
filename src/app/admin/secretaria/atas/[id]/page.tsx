import { notFound } from "next/navigation";
import { requireSecretariaAccess } from "@/lib/auth/admin";
import { getMeetingMinuteForAdmin } from "@/lib/secretaria/minutes";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { MeetingMinuteViewerContent } from "@/components/secretaria/MeetingMinuteViewerContent";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function AdminSecretariaMinuteViewerPage({ params }: Props) {
  await requireSecretariaAccess();
  const { id } = await params;
  const minute = await getMeetingMinuteForAdmin(id);

  if (!minute) {
    notFound();
  }

  return (
    <div>
      <AdminPageHeader title="Visualizar ata" />

      <div className="mt-6">
        <MeetingMinuteViewerContent
          minute={minute}
          backHref="/admin/secretaria/atas"
          backLabel="← Voltar para atas"
        />
      </div>
    </div>
  );
}
