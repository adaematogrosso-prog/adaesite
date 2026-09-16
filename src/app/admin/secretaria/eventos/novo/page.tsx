import { requireSecretariaAccess } from "@/lib/auth/admin";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { SecretariaEventForm } from "@/components/secretaria/SecretariaEventForm";

export default async function AdminSecretariaNewEventPage() {
  await requireSecretariaAccess();

  return (
    <div className="mx-auto max-w-4xl">
      <AdminPageHeader
        title="Novo evento"
        subtitle="Configure título, divulgação e planos de inscrição."
      />

      <div className="mt-8">
        <SecretariaEventForm />
      </div>
    </div>
  );
}
