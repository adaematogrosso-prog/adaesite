import { notFound } from "next/navigation";
import { requireSecretariaAccess } from "@/lib/auth/admin";
import { getActivityForAdmin } from "@/lib/secretaria/activities";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { ActivityEditorForm } from "@/components/secretaria/ActivityEditorForm";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function AdminSecretariaEditActivityPage({ params }: Props) {
  await requireSecretariaAccess();
  const { id } = await params;
  const activity = await getActivityForAdmin(id);

  if (!activity) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-4xl">
      <AdminPageHeader title="Editar atividade" />

      <div className="mt-8">
        <ActivityEditorForm activity={activity} />
      </div>
    </div>
  );
}
