import { requireSecretariaAccess } from "@/lib/auth/admin";
import { getAllMeetingMinutes } from "@/lib/secretaria/minutes";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { SecretariaMinutesAdminView } from "@/components/admin/SecretariaMinutesAdminView";

export default async function AdminSecretariaMinutesPage() {
  await requireSecretariaAccess();
  const minutes = await getAllMeetingMinutes();

  return (
    <div>
      <AdminPageHeader
        title="Atas da Secretaria"
        subtitle="Publique atas em PDF com título e descrição breve. Todos podem ler e baixar."
      />

      <SecretariaMinutesAdminView minutes={minutes} />
    </div>
  );
}
