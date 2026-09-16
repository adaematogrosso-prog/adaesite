"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { deleteNewsPost } from "@/actions/news";
import type { NewsPost } from "@/types/database";

type Props = {
  posts: NewsPost[];
};

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function AdminNewsList({ posts }: Props) {
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
        <Link
          href="/admin/noticias/nova"
          className="mt-4 inline-flex rounded-full bg-royal-blue px-5 py-2 text-sm font-semibold text-white transition hover:bg-royal-blue-light"
        >
          Criar primeira notícia
        </Link>
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

      <div className="overflow-hidden rounded-2xl border border-gold/20 bg-white shadow-sm">
        <div className="hidden grid-cols-[1fr_auto_auto] gap-4 border-b border-gold/15 bg-background px-5 py-3 text-xs font-semibold uppercase tracking-wide text-muted sm:grid">
          <span>Título</span>
          <span>Data</span>
          <span>Ações</span>
        </div>

        <ul className="divide-y divide-gold/10">
          {posts.map((post) => (
            <li
              key={post.id}
              className="flex flex-col gap-3 px-5 py-4 sm:grid sm:grid-cols-[1fr_auto_auto] sm:items-center sm:gap-4"
            >
              <div className="min-w-0">
                <p className="font-semibold text-royal-blue">{post.title}</p>
                {post.summary ? (
                  <p className="mt-1 truncate text-sm text-muted">
                    {post.summary}
                  </p>
                ) : null}
              </div>

              <p className="text-sm text-muted sm:text-right">
                {formatDate(post.created_at)}
              </p>

              <div className="flex flex-wrap gap-2 sm:justify-end">
                <Link
                  href={`/noticias/${post.id}`}
                  className="rounded-full border border-gold/30 px-4 py-1.5 text-xs font-semibold text-royal-blue transition hover:bg-gold/10"
                >
                  Ver
                </Link>
                <Link
                  href={`/admin/noticias/${post.id}/editar`}
                  className="rounded-full bg-royal-blue px-4 py-1.5 text-xs font-semibold text-white transition hover:bg-royal-blue-light"
                >
                  Editar
                </Link>
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => handleDelete(post.id, post.title)}
                  className="rounded-full border border-crimson/30 px-4 py-1.5 text-xs font-semibold text-crimson transition hover:bg-crimson/5 disabled:opacity-60"
                >
                  {isPending ? "..." : "Excluir"}
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
