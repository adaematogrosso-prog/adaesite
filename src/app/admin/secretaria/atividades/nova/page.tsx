import { requireSecretariaAccess } from "@/lib/auth/admin";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { ActivityEditorForm } from "@/components/secretaria/ActivityEditorForm";

export default async function AdminSecretariaNewActivityPage() {
  await requireSecretariaAccess();

  return (
    <div className="mx-auto max-w-4xl">
      <AdminPageHeader
        title="Nova atividade"
        subtitle="Crie uma publicação com banner e editor completo de texto."
      />

      <div className="mt-8">
        <ActivityEditorForm />
      </div>
    </div>
  );
}
