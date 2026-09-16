import { notFound } from "next/navigation";
import Link from "next/link";
import { requirePublisher } from "@/lib/auth/admin";
import { getSharedDocument } from "@/lib/documents/shared-documents";
import { DocumentViewerContent } from "@/components/DocumentViewerContent";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function AdminDocumentViewerPage({ params }: Props) {
  await requirePublisher();
  const { id } = await params;
  const document = await getSharedDocument(id);

  if (!document) {
    notFound();
  }

  return (
    <div>
      <Link
        href="/admin/documentos"
        className="text-sm text-royal-blue transition hover:underline"
      >
        ← Voltar para documentos gerais
      </Link>

      <div className="mt-6">
        <DocumentViewerContent document={document} />
      </div>
    </div>
  );
}
