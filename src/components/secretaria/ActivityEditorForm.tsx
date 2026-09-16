"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  createSecretariaActivity,
  updateSecretariaActivity,
  uploadActivityEditorMedia,
} from "@/actions/secretaria-activities";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import type { SecretariaActivity } from "@/types/database";

type Props = {
  activity?: SecretariaActivity;
};

export function ActivityEditorForm({ activity }: Props) {
  const router = useRouter();
  const isEditing = !!activity;
  const [title, setTitle] = useState(activity?.title ?? "");
  const [subtitle, setSubtitle] = useState(activity?.subtitle ?? "");
  const [contentHtml, setContentHtml] = useState(activity?.content ?? "");
  const [isPublished, setIsPublished] = useState(activity?.is_published ?? true);
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
    if (isPublished) {
      formData.set("is_published", "on");
    }

    startTransition(async () => {
      const result = isEditing
        ? await updateSecretariaActivity(activity.id, formData)
        : await createSecretariaActivity(formData);

      if (result.error) {
        setMessage({ type: "error", text: result.error });
        return;
      }

      router.push("/admin/secretaria/atividades");
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="rounded-2xl border border-gold/20 bg-white p-6 shadow-sm">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="section-title text-xl font-semibold text-royal-blue">
              {isEditing ? "Editar atividade" : "Nova atividade"}
            </h2>
            <p className="mt-1 text-sm text-muted">
              Título, subtítulo, banner e texto completo com formatação.
            </p>
          </div>
          <Link
            href="/admin/secretaria/atividades"
            className="text-sm text-royal-blue hover:underline"
          >
            ← Voltar para lista
          </Link>
        </div>

        <div className="space-y-4">
          <div>
            <label htmlFor="activity-title" className="block text-sm font-medium text-foreground">
              Título
            </label>
            <input
              id="activity-title"
              name="title"
              type="text"
              required
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              className="mt-1 w-full rounded-lg border border-gold/20 px-4 py-2.5 outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/20"
              placeholder="Título da atividade"
            />
          </div>

          <div>
            <label htmlFor="activity-subtitle" className="block text-sm font-medium text-foreground">
              Subtítulo
            </label>
            <input
              id="activity-subtitle"
              name="subtitle"
              type="text"
              value={subtitle}
              onChange={(event) => setSubtitle(event.target.value)}
              className="mt-1 w-full rounded-lg border border-gold/20 px-4 py-2.5 outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/20"
              placeholder="Subtítulo ou linha de apoio"
            />
          </div>

          <div>
            <label htmlFor="activity-banner" className="block text-sm font-medium text-foreground">
              Banner (foto de capa)
            </label>
            <input
              id="activity-banner"
              name="banner"
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="mt-1 block w-full text-sm text-muted file:mr-4 file:rounded-full file:border-0 file:bg-royal-blue file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-royal-blue-light"
            />
            {activity?.banner_image_url ? (
              <p className="mt-1 text-xs text-muted">
                Banner atual mantido se nenhum arquivo novo for enviado.
              </p>
            ) : null}
          </div>

          <label className="inline-flex items-center gap-2 text-sm text-foreground">
            <input
              type="checkbox"
              checked={isPublished}
              onChange={(event) => setIsPublished(event.target.checked)}
              className="rounded border-gold/30 text-royal-blue focus:ring-gold/30"
            />
            Publicar atividade
          </label>
        </div>
      </div>

      <div className="rounded-2xl border border-gold/20 bg-white p-6 shadow-sm">
        <label className="block text-sm font-medium text-foreground">
          Conteúdo da atividade
        </label>
        <p className="mt-1 mb-3 text-xs text-muted">
          Use negrito, itálico, cores, tamanhos, fontes, imagens e vídeos.
        </p>
        <RichTextEditor
          name="content"
          initialContent={activity?.content ?? ""}
          onChange={setContentHtml}
          uploadMedia={uploadActivityEditorMedia}
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
              : "Publicar atividade"}
        </button>
        <Link
          href="/admin/secretaria/atividades"
          className="rounded-full border border-gold/30 px-6 py-2.5 text-sm font-semibold text-royal-blue transition hover:bg-gold/10"
        >
          Cancelar
        </Link>
      </div>
    </form>
  );
}
