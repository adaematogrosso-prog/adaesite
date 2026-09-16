"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { deleteMeetingMinute } from "@/actions/secretaria-minutes";
import { SearchBar } from "@/components/SearchBar";
import { matchesSearch } from "@/lib/search";
import type { MeetingMinute } from "@/types/database";

type Props = {
  minutes: MeetingMinute[];
  canManage?: boolean;
  viewerBasePath?: string;
  tone?: "light" | "dark";
};

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export function MeetingMinutesList({
  minutes,
  canManage = false,
  viewerBasePath = "/secretaria/atas",
  tone = "light",
}: Props) {
  const [query, setQuery] = useState("");
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [isPending, startTransition] = useTransition();

  const filteredMinutes = useMemo(() => {
    if (!query.trim()) return minutes;
    return minutes.filter((minute) =>
      matchesSearch(query, minute.title, minute.description),
    );
  }, [minutes, query]);

  const cardClass =
    tone === "dark"
      ? "border border-gold/20 bg-white/5 backdrop-blur-sm"
      : "border border-gold/20 bg-white shadow-sm";

  function handleDelete(id: string, title: string) {
    if (!window.confirm(`Excluir a ata "${title}"?`)) return;

    setMessage(null);
    startTransition(async () => {
      const result = await deleteMeetingMinute(id);
      setMessage(
        result.error
          ? { type: "error", text: result.error }
          : { type: "success", text: "Ata excluída." },
      );
    });
  }

  if (minutes.length === 0) {
    return (
      <div className={`rounded-2xl p-10 text-center ${cardClass}`}>
        <p className={tone === "dark" ? "text-white/70" : "text-muted"}>
          Nenhuma ata publicada ainda.
        </p>
      </div>
    );
  }

  return (
    <div>
      <SearchBar
        id="minutes-search"
        label="Pesquisar atas"
        placeholder="Buscar por título ou descrição..."
        value={query}
        onChange={setQuery}
        className="mb-6"
        tone={tone}
      />

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

      {filteredMinutes.length === 0 ? (
        <div className={`rounded-2xl p-10 text-center ${cardClass}`}>
          <p className={tone === "dark" ? "text-white/70" : "text-muted"}>
            Nenhuma ata encontrada.
          </p>
        </div>
      ) : (
        <div className="members-grid">
          {filteredMinutes.map((minute) => (
            <article
              key={minute.id}
              className={`flex h-full min-w-0 flex-col overflow-hidden rounded-2xl transition hover:border-gold/40 ${cardClass}`}
            >
              <div className="flex h-24 flex-col items-center justify-center gap-1 border-b border-gold/10 bg-royal-blue/5 px-3 text-center">
                <PdfIcon />
                <p className="text-[11px] font-semibold uppercase tracking-wide text-royal-blue">
                  PDF
                </p>
              </div>

              <div className="flex flex-1 flex-col p-4 sm:p-5">
                <p
                  className={`text-right text-[11px] leading-snug ${
                    tone === "dark" ? "text-white/60" : "text-muted"
                  }`}
                >
                  {formatDate(minute.created_at)}
                </p>

                <h3
                  className={`section-title mt-2 line-clamp-2 text-base font-semibold leading-snug sm:text-lg ${
                    tone === "dark" ? "text-white" : "text-royal-blue"
                  }`}
                >
                  {minute.title}
                </h3>

                {minute.description ? (
                  <p
                    className={`mt-2 line-clamp-3 text-sm ${
                      tone === "dark" ? "text-white/70" : "text-muted"
                    }`}
                  >
                    {minute.description}
                  </p>
                ) : null}

                <div className="mt-auto flex flex-col gap-2 pt-4">
                  <div className="grid grid-cols-2 gap-2">
                    <Link
                      href={`${viewerBasePath}/${minute.id}`}
                      className="inline-flex items-center justify-center rounded-full bg-royal-blue px-3 py-2 text-xs font-semibold text-white transition hover:bg-royal-blue-light sm:text-sm"
                    >
                      Ler
                    </Link>
                    <a
                      href={`/api/secretaria/atas/${minute.id}/download`}
                      className="inline-flex items-center justify-center rounded-full border border-gold/30 px-3 py-2 text-xs font-semibold text-royal-blue transition hover:bg-gold/10 sm:text-sm"
                    >
                      Baixar
                    </a>
                  </div>

                  {canManage ? (
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() => handleDelete(minute.id, minute.title)}
                      className="inline-flex items-center justify-center rounded-full border border-crimson/30 px-3 py-2 text-xs font-semibold text-crimson transition hover:bg-crimson/5 disabled:opacity-60 sm:text-sm"
                    >
                      {isPending ? "Excluindo..." : "Excluir"}
                    </button>
                  ) : null}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

function PdfIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className="h-6 w-6 text-crimson/80"
      aria-hidden
    >
      <path d="M6 2a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6H6zm7 1.5V9h5.5L13 3.5zM8 13h1.5v4H8v-4zm3.5 0H13v4h-1.5v-1.25h-.75V17H9.5v-4H11.5v1.25h.75V13zm4 0H17v4h-1.5v-1.25h-.75V17H14v-4h1.5v1.25h.75V13z" />
    </svg>
  );
}
