import { requireApprovedMember } from "@/lib/auth/admin";
import { getMembersDirectory } from "@/lib/members/directory";
import { MemberAreaNav } from "@/components/MemberAreaNav";
import { MemberDirectory } from "@/components/MemberDirectory";
import { SiteLayout } from "@/components/SiteLayout";
import { Logo } from "@/components/Logo";

export default async function MembersPage() {
  await requireApprovedMember();
  const data = await getMembersDirectory();

  return (
    <SiteLayout>
      <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6">
        <div className="mb-8 text-center">
          <Logo size="lg" className="mx-auto" />
          <h1 className="section-title mt-4 text-3xl font-bold text-royal-blue">
            Membros ADAE-MT
          </h1>
          <p className="mt-2 text-sm text-muted">
            Diretoria e membros cadastrados da associação.
          </p>
        </div>

        <MemberAreaNav />
        <MemberDirectory data={data} />
      </div>
    </SiteLayout>
  );
}
