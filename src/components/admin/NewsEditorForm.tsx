"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { createNewsPost, updateNewsPost } from "@/actions/news";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import type { NewsPost } from "@/types/database";

type Props = {
  post?: NewsPost;
};

export function NewsEditorForm({ post }: Props) {
  const router = useRouter();
  const isEditing = !!post;
  const [title, setTitle] = useState(post?.title ?? "");
  const [summary, setSummary] = useState(post?.summary ?? "");
  const [contentHtml, setContentHtml] = useState(post?.content ?? "");
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isPending) return;
    setMessage(null);

    const formData = new FormData(event.currentTarget);
    formData.set("content", contentHtml);

    startTransition(async () => {
      const result = isEditing
        ? await updateNewsPost(post.id, formData)
        : await createNewsPost(formData);

      if (result.error) {
        setMessage({ type: "error", text: result.error });
        return;
      }

      router.push("/admin/noticias");
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="rounded-2xl border border-gold/20 bg-white p-6 shadow-sm">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="section-title text-xl font-semibold text-royal-blue">
              {isEditing ? "Editar notícia" : "Nova notícia"}
            </h2>
            <p className="mt-1 text-sm text-muted">
              Preencha título, subtítulo, capa e conteúdo completo.
            </p>
          </div>
          <Link
            href="/admin/noticias"
            className="text-sm text-royal-blue hover:underline"
          >
            ← Voltar para lista
          </Link>
        </div>

        <div className="space-y-4">
          <div>
            <label
              htmlFor="news-title"
              className="block text-sm font-medium text-foreground"
            >
              Título
            </label>
            <input
              id="news-title"
              name="title"
              type="text"
              required
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              className="mt-1 w-full rounded-lg border border-gold/20 px-4 py-2.5 outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/20"
              placeholder="Título principal da notícia"
            />
          </div>

          <div>
            <label
              htmlFor="news-summary"
              className="block text-sm font-medium text-foreground"
            >
              Subtítulo
            </label>
            <input
              id="news-summary"
              name="summary"
              type="text"
              value={summary}
              onChange={(event) => setSummary(event.target.value)}
              className="mt-1 w-full rounded-lg border border-gold/20 px-4 py-2.5 outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/20"
              placeholder="Subtítulo ou linha de apoio"
            />
          </div>

          <div>
            <label
              htmlFor="news-cover"
              className="block text-sm font-medium text-foreground"
            >
              Imagem de capa
            </label>
            <input
              id="news-cover"
              name="cover"
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="mt-1 block w-full text-sm text-muted file:mr-4 file:rounded-full file:border-0 file:bg-royal-blue file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-royal-blue-light"
            />
            {post?.cover_image_url ? (
              <p className="mt-1 text-xs text-muted">
                Capa atual mantida se nenhum arquivo novo for enviado.
              </p>
            ) : null}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-gold/20 bg-white p-6 shadow-sm">
        <label className="block text-sm font-medium text-foreground">
          Conteúdo da publicação
        </label>
        <p className="mt-1 mb-3 text-xs text-muted">
          Use negrito, itálico, cores, tamanhos, fontes, imagens e vídeos.
        </p>
        <RichTextEditor
          name="content"
          initialContent={post?.content ?? ""}
          onChange={setContentHtml}
        />
      </div>

      {message ? (
        <p
          className={`text-sm ${
            message.type === "success" ? "text-green-700" : "text-crimson"
          }`}
        >
          {message.text}
        </p>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-full bg-royal-blue px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-royal-blue-light disabled:opacity-60"
        >
          {isPending
            ? "Salvando..."
            : isEditing
              ? "Salvar alterações"
              : "Publicar notícia"}
        </button>
        <Link
          href="/admin/noticias"
          className="rounded-full border border-gold/30 px-6 py-2.5 text-sm font-semibold text-royal-blue transition hover:bg-gold/10"
        >
          Cancelar
        </Link>
      </div>
    </form>
  );
}
