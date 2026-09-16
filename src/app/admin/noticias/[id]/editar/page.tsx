import { notFound } from "next/navigation";
import { requirePublisher } from "@/lib/auth/admin";
import { getNewsPostForEdit } from "@/lib/news/posts";
import { NewsEditorForm } from "@/components/admin/NewsEditorForm";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function AdminEditNewsPage({ params }: Props) {
  await requirePublisher();
  const { id } = await params;
  const post = await getNewsPostForEdit(id);

  if (!post) {
    notFound();
  }

  return <NewsEditorForm post={post} />;
}
