import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { canAccessSharedDocuments } from "@/lib/documents/access";
import { getSharedDocument } from "@/lib/documents/shared-documents";
import { getAdminSession } from "@/lib/auth/admin";
import { MemberAreaNav } from "@/components/MemberAreaNav";
import { SiteLayout } from "@/components/SiteLayout";
import { DocumentViewerContent } from "@/components/DocumentViewerContent";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function DocumentViewerPage({ params }: Props) {
  const { user, canPublish, isAdmin } = await getAdminSession();

  if (user && (canPublish || isAdmin)) {
    const { id } = await params;
    redirect(`/admin/documentos/${id}`);
  }

  const canAccess = await canAccessSharedDocuments();
  if (!canAccess) {
    redirect("/login?next=/documentos");
  }

  const { id } = await params;
  const document = await getSharedDocument(id);

  if (!document) {
    notFound();
  }

  return (
    <SiteLayout>
      <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6">
        <MemberAreaNav />

        <div className="mt-8">
          <Link
            href="/documentos"
            className="text-sm text-royal-blue transition hover:underline"
          >
            ← Voltar para documentos gerais
          </Link>

          <div className="mt-6">
            <DocumentViewerContent document={document} />
          </div>
        </div>
      </div>
    </SiteLayout>
  );
}
