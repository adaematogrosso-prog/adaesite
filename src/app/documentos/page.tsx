import { redirect } from "next/navigation";
import { getAdminSession, requireApprovedMember } from "@/lib/auth/admin";
import { getSharedDocuments } from "@/lib/documents/shared-documents";
import { DocumentsList } from "@/components/DocumentsList";
import { MemberAreaNav } from "@/components/MemberAreaNav";
import { SiteLayout } from "@/components/SiteLayout";
import { Logo } from "@/components/Logo";

export default async function DocumentsPage() {
  const { user, canPublish, isAdmin } = await getAdminSession();

  if (user && (canPublish || isAdmin)) {
    redirect("/admin/documentos");
  }

  await requireApprovedMember();
  const documents = await getSharedDocuments();

  return (
    <SiteLayout>
      <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6">
        <div className="mb-8 text-center">
          <Logo size="lg" className="mx-auto" />
          <h1 className="section-title mt-4 text-3xl font-bold text-royal-blue">
            Documentos Gerais
          </h1>
          <p className="mt-2 text-sm text-muted">
            Arquivos compartilhados pela diretoria com os membros.
          </p>
        </div>

        <MemberAreaNav />

        <section className="mt-8">
          <div className="mb-6">
            <h2 className="section-title text-2xl font-semibold text-royal-blue">
              Documentos disponíveis
            </h2>
            <p className="mt-1 text-sm text-muted">
              Visualize ou baixe os arquivos publicados pela diretoria.
            </p>
          </div>

          <DocumentsList documents={documents} />
        </section>
      </div>
    </SiteLayout>
  );
}
