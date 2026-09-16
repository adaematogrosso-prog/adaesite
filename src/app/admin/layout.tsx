import { requirePanelAccess } from "@/lib/auth/admin";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

function resolveUserName(
  fullName: string | null | undefined,
  metadata: Record<string, unknown> | undefined,
  email: string | undefined,
) {
  const fromProfile = fullName?.trim();
  if (fromProfile) return fromProfile;

  const fromMetadata = metadata?.full_name;
  if (typeof fromMetadata === "string" && fromMetadata.trim()) {
    return fromMetadata.trim();
  }

  if (email) {
    return email.split("@")[0];
  }

  return "Usuário";
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isAdmin, canApprove, canPublish, canSecretaria, canTesouraria, profile } =
    await requirePanelAccess();

  const userName = resolveUserName(
    profile?.full_name,
    user.user_metadata,
    user.email,
  );

  return (
    <div className="flex h-dvh flex-col overflow-hidden lg:flex-row">
      <AdminSidebar
        isAdmin={isAdmin}
        canApprove={canApprove}
        canPublish={canPublish}
        canSecretaria={canSecretaria}
        canTesouraria={canTesouraria}
        userName={userName}
        profilePhotoUrl={profile?.profile_photo_url ?? null}
      />

      <main className="admin-main flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto bg-background">
        <div className="admin-main-inner mx-auto flex w-full max-w-7xl flex-1 flex-col px-4 py-6 sm:px-6">
          {children}
        </div>
      </main>
    </div>
  );
}
