"use client";

import { useMemo, useState } from "react";
import { ActivitiesFeed } from "@/components/secretaria/ActivitiesFeed";
import { SearchBar } from "@/components/SearchBar";
import { matchesSearch, stripHtml } from "@/lib/search";
import type { SecretariaActivity } from "@/types/database";

type Props = {
  activities: SecretariaActivity[];
  canManage?: boolean;
  viewerBasePath?: string;
  tone?: "light" | "dark";
};

export function ActivitiesFeedWithSearch({
  activities,
  canManage = false,
  viewerBasePath,
  tone = "light",
}: Props) {
  const [query, setQuery] = useState("");

  const filteredActivities = useMemo(() => {
    if (!query.trim()) return activities;

    return activities.filter((activity) =>
      matchesSearch(
        query,
        activity.title,
        activity.subtitle,
        stripHtml(activity.content),
      ),
    );
  }, [activities, query]);

  return (
    <>
      <SearchBar
        id="activities-search"
        label="Pesquisar atividades"
        placeholder="Buscar por título, subtítulo ou conteúdo..."
        value={query}
        onChange={setQuery}
        className="mb-8"
        tone={tone}
      />

      {filteredActivities.length === 0 ? (
        <div
          className={
            tone === "dark"
              ? "news-empty-state"
              : "rounded-2xl border border-dashed border-gold/30 bg-white p-10 text-center"
          }
        >
          <p className={tone === "dark" ? "news-empty-state-text" : "text-muted"}>
            Nenhuma atividade encontrada.
          </p>
        </div>
      ) : (
        <ActivitiesFeed
          activities={filteredActivities}
          canManage={canManage}
          viewerBasePath={viewerBasePath}
          tone={tone}
        />
      )}
    </>
  );
}
