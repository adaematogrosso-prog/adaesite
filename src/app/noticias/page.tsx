import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth/admin";
import { getPublishedNewsPosts } from "@/lib/news/posts";
import { NewsFeedWithSearch } from "@/components/NewsFeedWithSearch";
import { SiteLayout } from "@/components/SiteLayout";
import { Logo } from "@/components/Logo";
import { CeremonialPageShell } from "@/components/landing/CeremonialPageShell";

export default async function NewsPage() {
  const { user, canPublish, isAdmin } = await getAdminSession();

  if (user && (canPublish || isAdmin)) {
    redirect("/admin/noticias");
  }

  const posts = await getPublishedNewsPosts();

  return (
    <SiteLayout>
      <CeremonialPageShell className="min-h-[calc(100dvh-4.5rem)] pb-16">
        <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 sm:py-16">
          <div className="mb-10 text-center">
            <Logo size="lg" className="news-page-logo mx-auto" />
            <p className="landing-section-eyebrow mt-6">Comunicação</p>
            <h1 className="landing-section-title mt-3">Notícias ADAE-MT</h1>
            <p className="landing-section-lead mx-auto mt-4 max-w-xl">
              Acompanhe as novidades da associação.
            </p>
          </div>

          <NewsFeedWithSearch posts={posts} tone="dark" />
        </div>
      </CeremonialPageShell>
    </SiteLayout>
  );
}
