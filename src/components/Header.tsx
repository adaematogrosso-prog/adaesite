import { getAdminSession } from "@/lib/auth/admin";
import { SiteHeader } from "@/components/SiteHeader";

export async function Header() {
  const { user, hasPanelAccess, isApprovedMember } = await getAdminSession();

  return (
    <SiteHeader
      user={user}
      hasPanelAccess={hasPanelAccess}
      isApprovedMember={isApprovedMember}
    />
  );
}
