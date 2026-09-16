import { notFound } from "next/navigation";
import { requireMemberAreaAccess } from "@/lib/auth/admin";
import { getMemberPublicProfile } from "@/lib/members/directory";
import { MemberAreaNav } from "@/components/MemberAreaNav";
import { MemberPublicProfileView } from "@/components/MemberPublicProfileView";
import { SiteLayout } from "@/components/SiteLayout";

type Props = {
  params: Promise<{ userId: string }>;
};

export default async function MemberProfilePage({ params }: Props) {
  await requireMemberAreaAccess();

  const { userId } = await params;
  const member = await getMemberPublicProfile(userId);

  if (!member) {
    notFound();
  }

  return (
    <SiteLayout>
      <div className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6">
        <MemberAreaNav />
        <MemberPublicProfileView member={member} backHref="/membros" />
      </div>
    </SiteLayout>
  );
}
