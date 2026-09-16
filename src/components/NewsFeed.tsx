"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useTransition } from "react";
import { deleteNewsPost } from "@/actions/news";
import type { NewsPost } from "@/types/database";

type Props = {
  posts: NewsPost[];
  canManage?: boolean;
};

function stripHtml(html: string) {
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export function NewsFeed({ posts, canManage = false }: Props) {
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleDelete(id: string, title: string) {
    if (!window.confirm(`Excluir a notícia "${title}"?`)) return;

    setMessage(null);
    startTransition(async () => {
      const result = await deleteNewsPost(id);
      setMessage(
        result.error
          ? { type: "error", text: result.error }
          : { type: "success", text: "Notícia excluída." },
      );
    });
  }

  if (posts.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-gold/30 bg-white p-10 text-center">
        <p className="text-muted">Nenhuma notícia publicada ainda.</p>
      </div>
    );
  }

  return (
    <div>
      {message ? (
        <p
          className={`mb-4 rounded-xl px-4 py-3 text-sm ${
            message.type === "success"
              ? "bg-green-50 text-green-800"
              : "bg-red-50 text-crimson"
          }`}
        >
          {message.text}
        </p>
      ) : null}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <article
            key={post.id}
            className="flex min-w-0 flex-col overflow-hidden rounded-2xl border border-gold/20 bg-white shadow-sm transition hover:border-gold/40 hover:shadow-md"
          >
            {post.cover_image_url ? (
              <div className="relative aspect-[16/10] w-full bg-royal-blue/5">
                <Image
                  src={post.cover_image_url}
                  alt={post.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              </div>
            ) : (
              <div className="flex aspect-[16/10] items-center justify-center bg-gradient-to-br from-royal-blue/10 to-gold/10">
                <span className="section-title text-2xl font-bold text-royal-blue/30">
                  ADAE-MT
                </span>
              </div>
            )}

            <div className="flex flex-1 flex-col p-5">
              <p className="text-xs text-muted">{formatDate(post.created_at)}</p>
              <h3 className="section-title mt-2 text-lg font-semibold text-royal-blue">
                {post.title}
              </h3>
              {post.summary ? (
                <p className="mt-2 line-clamp-3 text-sm text-muted">
                  {post.summary}
                </p>
              ) : (
                <p className="mt-2 line-clamp-3 text-sm text-muted">
                  {stripHtml(post.content)}
                </p>
              )}

              <div className="mt-4 flex flex-col gap-2">
                <Link
                  href={`/noticias/${post.id}`}
                  className="inline-flex items-center justify-center rounded-full bg-royal-blue px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-royal-blue-light"
                >
                  Ler notícia
                </Link>

                {canManage ? (
                  <>
                    <Link
                      href={`/admin/noticias/${post.id}/editar`}
                      className="inline-flex items-center justify-center rounded-full border border-gold/30 px-4 py-2.5 text-sm font-semibold text-royal-blue transition hover:bg-gold/10"
                    >
                      Editar
                    </Link>
                    <button
                    type="button"
                    disabled={isPending}
                    onClick={() => handleDelete(post.id, post.title)}
                    className="inline-flex items-center justify-center rounded-full border border-crimson/30 px-4 py-2.5 text-sm font-semibold text-crimson transition hover:bg-crimson/5 disabled:opacity-60"
                  >
                    {isPending ? "Excluindo..." : "Excluir"}
                  </button>
                  </>
                ) : null}
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
