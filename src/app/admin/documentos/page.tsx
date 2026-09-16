import { requirePublisher } from "@/lib/auth/admin";
import { getSharedDocuments } from "@/lib/documents/shared-documents";
import { DocumentsAdminView } from "@/components/admin/DocumentsAdminView";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";

export default async function AdminDocumentsPage() {
  await requirePublisher();
  const documents = await getSharedDocuments();

  return (
    <div>
      <AdminPageHeader
        title="Documentos Gerais"
        subtitle="Publique PDFs e imagens para os membros acessarem na área de documentos."
      />

      <DocumentsAdminView documents={documents} />
    </div>
  );
}
