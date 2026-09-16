"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useTransition } from "react";
import { deleteSecretariaActivity } from "@/actions/secretaria-activities";
import type { SecretariaActivity } from "@/types/database";

type Props = {
  activities: SecretariaActivity[];
  canManage?: boolean;
  viewerBasePath?: string;
  tone?: "light" | "dark";
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

export function ActivitiesFeed({
  activities,
  canManage = false,
  viewerBasePath = "/secretaria/atividades",
  tone = "light",
}: Props) {
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [isPending, startTransition] = useTransition();

  const cardClass =
    tone === "dark"
      ? "border border-gold/20 bg-white/5 backdrop-blur-sm"
      : "border border-gold/20 bg-white shadow-sm";

  function handleDelete(id: string, title: string) {
    if (!window.confirm(`Excluir a atividade "${title}"?`)) return;

    setMessage(null);
    startTransition(async () => {
      const result = await deleteSecretariaActivity(id);
      setMessage(
        result.error
          ? { type: "error", text: result.error }
          : { type: "success", text: "Atividade excluída." },
      );
    });
  }

  if (activities.length === 0) {
    return (
      <div
        className={`rounded-2xl p-10 text-center ${
          tone === "dark" ? "news-empty-state" : "border border-dashed border-gold/30 bg-white"
        }`}
      >
        <p className={tone === "dark" ? "news-empty-state-text" : "text-muted"}>
          Nenhuma atividade publicada ainda.
        </p>
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
        {activities.map((activity) => (
          <article
            key={activity.id}
            className={`flex min-w-0 flex-col overflow-hidden rounded-2xl transition hover:border-gold/40 ${cardClass}`}
          >
            {activity.banner_image_url ? (
              <div className="relative aspect-[16/10] w-full bg-royal-blue/10">
                <Image
                  src={activity.banner_image_url}
                  alt={activity.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              </div>
            ) : (
              <div className="flex aspect-[16/10] items-center justify-center bg-gradient-to-br from-royal-blue/10 to-gold/10">
                <span
                  className={`section-title text-2xl font-bold ${
                    tone === "dark" ? "text-white/30" : "text-royal-blue/30"
                  }`}
                >
                  ADAE-MT
                </span>
              </div>
            )}

            <div className="flex flex-1 flex-col p-5">
              <p className={`text-xs ${tone === "dark" ? "text-white/60" : "text-muted"}`}>
                {formatDate(activity.created_at)}
              </p>
              <h3
                className={`section-title mt-2 text-lg font-semibold ${
                  tone === "dark" ? "text-white" : "text-royal-blue"
                }`}
              >
                {activity.title}
              </h3>
              {activity.subtitle ? (
                <p
                  className={`mt-2 line-clamp-3 text-sm ${
                    tone === "dark" ? "text-white/70" : "text-muted"
                  }`}
                >
                  {activity.subtitle}
                </p>
              ) : (
                <p
                  className={`mt-2 line-clamp-3 text-sm ${
                    tone === "dark" ? "text-white/70" : "text-muted"
                  }`}
                >
                  {stripHtml(activity.content)}
                </p>
              )}

              <div className="mt-4 flex flex-col gap-2">
                <Link
                  href={`${viewerBasePath}/${activity.id}`}
                  className="inline-flex items-center justify-center rounded-full bg-royal-blue px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-royal-blue-light"
                >
                  {canManage ? "Ver / editar" : "Ler atividade"}
                </Link>

                {canManage ? (
                  <>
                    <Link
                      href={`/admin/secretaria/atividades/${activity.id}/editar`}
                      className="inline-flex items-center justify-center rounded-full border border-gold/30 px-4 py-2.5 text-sm font-semibold text-royal-blue transition hover:bg-gold/10"
                    >
                      Editar
                    </Link>
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() => handleDelete(activity.id, activity.title)}
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
