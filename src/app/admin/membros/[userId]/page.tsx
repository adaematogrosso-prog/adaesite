import { notFound, redirect } from "next/navigation";
import { requirePanelAccess } from "@/lib/auth/admin";
import { getMemberPublicProfile } from "@/lib/members/directory";
import { MemberPublicProfileView } from "@/components/MemberPublicProfileView";

type Props = {
  params: Promise<{ userId: string }>;
};

export default async function AdminMemberProfilePage({ params }: Props) {
  const { canApprove, isAdmin } = await requirePanelAccess();

  if (!canApprove && !isAdmin) {
    redirect("/admin?error=unauthorized");
  }

  const { userId } = await params;
  const member = await getMemberPublicProfile(userId);

  if (!member) {
    notFound();
  }

  return (
    <MemberPublicProfileView member={member} backHref="/admin/membros" />
  );
}
