import { redirect } from "next/navigation";
import { requirePanelAccess } from "@/lib/auth/admin";
import { getMembersDirectory } from "@/lib/members/directory";
import { MemberDirectory } from "@/components/MemberDirectory";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";

export default async function AdminMembersPage() {
  const { canApprove, isAdmin } = await requirePanelAccess();

  if (!canApprove && !isAdmin) {
    redirect("/admin?error=unauthorized");
  }

  const data = await getMembersDirectory();

  return (
    <div>
      <AdminPageHeader
        title="Membros ADAE-MT"
        subtitle="Consulta da diretoria e dos membros aprovados."
      />

      <section>
        <MemberDirectory data={data} profileFrom="admin" />
      </section>
    </div>
  );
}
