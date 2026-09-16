import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getPublishedNewsPost } from "@/lib/news/posts";
import { SiteLayout } from "@/components/SiteLayout";
import { NewsContent } from "@/components/NewsContent";
import { CeremonialPageShell } from "@/components/landing/CeremonialPageShell";

type Props = {
  params: Promise<{ id: string }>;
};

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export default async function NewsDetailPage({ params }: Props) {
  const { id } = await params;
  const post = await getPublishedNewsPost(id);

  if (!post) {
    notFound();
  }

  return (
    <SiteLayout>
      <CeremonialPageShell className="min-h-[calc(100dvh-4.5rem)] pb-16">
        <article className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
          <Link
            href="/noticias"
            className="text-sm font-medium text-gold transition hover:text-gold-light"
          >
            ← Voltar para notícias
          </Link>

          <div className="news-article-panel mt-8 rounded-2xl border border-gold/15 bg-white p-6 shadow-xl sm:p-10">
            <p className="text-sm text-muted">{formatDate(post.created_at)}</p>

            <h1 className="section-title mt-2 text-3xl font-bold text-royal-blue sm:text-4xl">
              {post.title}
            </h1>

            {post.cover_image_url ? (
              <div className="relative mt-8 aspect-[16/10] overflow-hidden rounded-2xl border border-gold/20 bg-royal-blue/5">
                <Image
                  src={post.cover_image_url}
                  alt={post.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 768px"
                  priority
                />
              </div>
            ) : null}

            {post.summary ? (
              <p className="mt-8 text-lg leading-relaxed text-muted">
                {post.summary}
              </p>
            ) : null}

            <NewsContent html={post.content} />
          </div>
        </article>
      </CeremonialPageShell>
    </SiteLayout>
  );
}
