import Link from "next/link";
import { requireSelfProfileEditor } from "@/lib/auth/admin";
import { ProfileForm } from "@/components/ProfileForm";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";

function resolveDefaultFullName(
  profileFullName: string | undefined,
  metadata: Record<string, unknown> | undefined,
) {
  if (profileFullName?.trim()) return profileFullName.trim();

  const fromMetadata = metadata?.full_name;
  if (typeof fromMetadata === "string" && fromMetadata.trim()) {
    return fromMetadata.trim();
  }

  return "";
}

function resolveDefaultMemberId(metadata: Record<string, unknown> | undefined) {
  const fromMetadata = metadata?.member_id;
  if (typeof fromMetadata === "string" && fromMetadata.trim()) {
    return fromMetadata.trim().toUpperCase();
  }

  return "";
}

export default async function AdminProfilePage() {
  const { user, profile } = await requireSelfProfileEditor();

  return (
    <div>
      <AdminPageHeader
        title="Meu Perfil"
        subtitle="Atualize foto, CEP, data de nascimento, contato e senha de acesso."
      />

      <ProfileForm
        profile={profile}
        userEmail={user.email ?? ""}
        defaultFullName={resolveDefaultFullName(
          profile?.full_name,
          user.user_metadata,
        )}
        defaultMemberId={resolveDefaultMemberId(user.user_metadata)}
      />

      <p className="mt-6 text-sm text-muted">
        <Link href="/admin" className="text-royal-blue hover:underline">
          ← Voltar ao painel
        </Link>
      </p>
    </div>
  );
}
