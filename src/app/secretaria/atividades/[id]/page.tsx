import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getPublishedActivity } from "@/lib/secretaria/activities";
import { SiteLayout } from "@/components/SiteLayout";
import { NewsContent } from "@/components/NewsContent";
import { CeremonialPageShell } from "@/components/landing/CeremonialPageShell";
import { SecretariaNav } from "@/components/secretaria/SecretariaNav";

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

export default async function SecretariaActivityDetailPage({ params }: Props) {
  const { id } = await params;
  const activity = await getPublishedActivity(id);

  if (!activity) {
    notFound();
  }

  return (
    <SiteLayout>
      <CeremonialPageShell className="min-h-[calc(100dvh-4.5rem)] pb-16">
        <article className="mx-auto w-full max-w-4xl px-4 py-12 sm:px-6 sm:py-16">
          <SecretariaNav />

          <Link
            href="/secretaria/atividades"
            className="mt-8 inline-block text-sm font-medium text-gold transition hover:text-gold-light"
          >
            ← Voltar para atividades
          </Link>

          {activity.banner_image_url ? (
            <div className="relative mt-8 aspect-[21/9] overflow-hidden rounded-2xl border border-gold/20 shadow-xl">
              <Image
                src={activity.banner_image_url}
                alt={activity.title}
                fill
                className="object-cover"
                sizes="(max-width: 896px) 100vw, 896px"
                priority
              />
            </div>
          ) : null}

          <div className="news-article-panel mt-8 rounded-2xl border border-gold/15 bg-white p-6 shadow-xl sm:p-10">
            <p className="text-sm text-muted">{formatDate(activity.created_at)}</p>

            <h1 className="section-title mt-2 text-3xl font-bold text-royal-blue sm:text-4xl">
              {activity.title}
            </h1>

            {activity.subtitle ? (
              <p className="mt-4 text-lg leading-relaxed text-muted">
                {activity.subtitle}
              </p>
            ) : null}

            <NewsContent html={activity.content} />
          </div>
        </article>
      </CeremonialPageShell>
    </SiteLayout>
  );
}
