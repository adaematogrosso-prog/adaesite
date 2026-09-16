import { requirePublisher } from "@/lib/auth/admin";
import { NewsEditorForm } from "@/components/admin/NewsEditorForm";

export default async function AdminNewNewsPage() {
  await requirePublisher();

  return <NewsEditorForm />;
}
