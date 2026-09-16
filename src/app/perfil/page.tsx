import Link from "next/link";
import { requireSelfProfileEditor } from "@/lib/auth/admin";
import { ProfileForm } from "@/components/ProfileForm";
import { MemberAreaNav } from "@/components/MemberAreaNav";
import { SiteLayout } from "@/components/SiteLayout";
import { Logo } from "@/components/Logo";

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

export default async function ProfilePage() {
  const { user, profile } = await requireSelfProfileEditor();

  return (
    <SiteLayout>
      <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
        <div className="mb-8 text-center">
          <Logo size="lg" className="mx-auto" />
          <h1 className="section-title mt-4 text-3xl font-bold text-royal-blue">
            Meu Perfil
          </h1>
          <p className="mt-2 text-sm text-muted">
            Atualize foto, CEP, data de nascimento, contato e senha.
          </p>
        </div>

        <MemberAreaNav />
        <ProfileForm
          profile={profile}
          userEmail={user.email ?? ""}
          defaultFullName={resolveDefaultFullName(
            profile?.full_name,
            user.user_metadata,
          )}
        />

        <p className="mt-6 text-center text-sm text-muted">
          <Link href="/" className="text-royal-blue hover:underline">
            ← Voltar ao site
          </Link>
        </p>
      </div>
    </SiteLayout>
  );
}
