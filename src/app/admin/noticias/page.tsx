import Link from "next/link";
import { requirePublisher } from "@/lib/auth/admin";
import { getAllNewsPosts, getPublishedNewsPosts } from "@/lib/news/posts";
import { AdminNewsSections } from "@/components/admin/AdminNewsSections";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";

export default async function AdminNewsPage() {
  await requirePublisher();

  const [allPosts, publishedPosts] = await Promise.all([
    getAllNewsPosts(),
    getPublishedNewsPosts(),
  ]);

  return (
    <div>
      <AdminPageHeader
        title="Notícias / Publicações"
        actions={
          <Link
            href="/admin/noticias/nova"
            className="inline-flex items-center justify-center rounded-full bg-royal-blue px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-royal-blue-light"
          >
            + Publicar notícia
          </Link>
        }
      />

      <AdminNewsSections allPosts={allPosts} publishedPosts={publishedPosts} />
    </div>
  );
}
