"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { deleteSecretariaEvent } from "@/actions/secretaria-events";
import { SearchBar } from "@/components/SearchBar";
import { formatCurrencyFromCents } from "@/lib/treasury/money";
import { matchesSearch } from "@/lib/search";
import type { EventPlan, SecretariaEvent } from "@/types/database";

type EventWithPlans = SecretariaEvent & { plans?: EventPlan[] };

type Props = {
  events: EventWithPlans[];
  canManage?: boolean;
  viewerBasePath?: string;
  tone?: "light" | "dark";
};

function formatEventDate(value: string) {
  return new Date(value).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function lowestPlanPrice(plans: EventPlan[] | undefined) {
  if (!plans || plans.length === 0) return null;
  return Math.min(...plans.map((plan) => plan.price_cents));
}

export function SecretariaEventsList({
  events,
  canManage = false,
  viewerBasePath = "/secretaria/eventos",
  tone = "light",
}: Props) {
  const [query, setQuery] = useState("");
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [isPending, startTransition] = useTransition();

  const filteredEvents = useMemo(() => {
    if (!query.trim()) return events;
    return events.filter((event) =>
      matchesSearch(query, event.title, event.subtitle, event.location ?? ""),
    );
  }, [events, query]);

  const cardClass =
    tone === "dark"
      ? "border border-gold/20 bg-white/5 backdrop-blur-sm"
      : "border border-gold/20 bg-white shadow-sm";

  function handleDelete(id: string, title: string) {
    if (!window.confirm(`Excluir o evento "${title}"?`)) return;

    setMessage(null);
    startTransition(async () => {
      const result = await deleteSecretariaEvent(id);
      setMessage(
        result.error
          ? { type: "error", text: result.error }
          : { type: "success", text: "Evento excluído." },
      );
    });
  }

  if (events.length === 0) {
    return (
      <div className={`rounded-2xl p-10 text-center ${cardClass}`}>
        <p className={tone === "dark" ? "text-white/70" : "text-muted"}>
          Nenhum evento publicado ainda.
        </p>
      </div>
    );
  }

  return (
    <div>
      <SearchBar
        id="events-search"
        label="Pesquisar eventos"
        placeholder="Buscar por título, subtítulo ou local..."
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

      {filteredEvents.length === 0 ? (
        <div className={`rounded-2xl p-10 text-center ${cardClass}`}>
          <p className={tone === "dark" ? "text-white/70" : "text-muted"}>
            Nenhum evento encontrado.
          </p>
        </div>
      ) : (
        <div className="members-grid">
          {filteredEvents.map((event) => {
            const minPrice = lowestPlanPrice(event.plans);

            return (
              <article
                key={event.id}
                className={`flex h-full min-w-0 flex-col overflow-hidden rounded-2xl transition hover:border-gold/40 ${cardClass}`}
              >
                <div className="relative aspect-[16/10] overflow-hidden border-b border-gold/10 bg-royal-blue/10">
                  {event.image_url ? (
                    <Image
                      src={event.image_url}
                      alt={event.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm font-semibold text-royal-blue/70">
                      Evento ADAE-MT
                    </div>
                  )}
                </div>

                <div className="flex flex-1 flex-col p-4 sm:p-5">
                  <p
                    className={`text-[11px] uppercase tracking-wide ${
                      tone === "dark" ? "text-gold" : "text-gold"
                    }`}
                  >
                    {formatEventDate(event.event_starts_at)}
                  </p>

                  <h3
                    className={`section-title mt-2 line-clamp-2 text-base font-semibold leading-snug sm:text-lg ${
                      tone === "dark" ? "text-white" : "text-royal-blue"
                    }`}
                  >
                    {event.title}
                  </h3>

                  {event.subtitle ? (
                    <p
                      className={`mt-1 line-clamp-2 text-sm ${
                        tone === "dark" ? "text-white/75" : "text-muted"
                      }`}
                    >
                      {event.subtitle}
                    </p>
                  ) : null}

                  {event.location ? (
                    <p
                      className={`mt-2 text-xs ${
                        tone === "dark" ? "text-white/60" : "text-muted"
                      }`}
                    >
                      {event.location}
                    </p>
                  ) : null}

                  {minPrice !== null ? (
                    <p
                      className={`mt-3 text-sm font-semibold ${
                        tone === "dark" ? "text-gold" : "text-royal-blue"
                      }`}
                    >
                      A partir de {formatCurrencyFromCents(minPrice)}
                    </p>
                  ) : null}

                  <div className="mt-auto flex flex-col gap-2 pt-4">
                    <Link
                      href={`${viewerBasePath}/${event.id}`}
                      className="inline-flex items-center justify-center rounded-full bg-royal-blue px-3 py-2 text-xs font-semibold text-white transition hover:bg-royal-blue-light sm:text-sm"
                    >
                      {canManage ? "Gerenciar" : "Ver evento"}
                    </Link>

                    {canManage ? (
                      <button
                        type="button"
                        disabled={isPending}
                        onClick={() => handleDelete(event.id, event.title)}
                        className="inline-flex items-center justify-center rounded-full border border-crimson/30 px-3 py-2 text-xs font-semibold text-crimson transition hover:bg-crimson/5 disabled:opacity-60 sm:text-sm"
                      >
                        {isPending ? "Excluindo..." : "Excluir"}
                      </button>
                    ) : null}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
