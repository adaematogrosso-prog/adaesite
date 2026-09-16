"use client";

import { useMemo, useState } from "react";
import { NewsFeed } from "@/components/NewsFeed";
import { SearchBar } from "@/components/SearchBar";
import { matchesSearch, stripHtml } from "@/lib/search";
import type { NewsPost } from "@/types/database";

type Props = {
  posts: NewsPost[];
  tone?: "light" | "dark";
};

export function NewsFeedWithSearch({ posts, tone = "light" }: Props) {
  const [query, setQuery] = useState("");

  const filteredPosts = useMemo(() => {
    if (!query.trim()) return posts;

    return posts.filter((post) =>
      matchesSearch(
        query,
        post.title,
        post.summary,
        stripHtml(post.content),
      ),
    );
  }, [posts, query]);

  return (
    <>
      <SearchBar
        id="public-news-search"
        label="Pesquisar notícias"
        placeholder="Buscar por título, subtítulo ou conteúdo..."
        value={query}
        onChange={setQuery}
        className="mb-8"
        tone={tone}
      />

      {filteredPosts.length === 0 ? (
        <div className={tone === "dark" ? "news-empty-state" : "rounded-2xl border border-dashed border-gold/30 bg-white p-10 text-center"}>
          <p className={tone === "dark" ? "news-empty-state-text" : "text-muted"}>
            Nenhuma notícia encontrada.
          </p>
        </div>
      ) : (
        <NewsFeed posts={filteredPosts} />
      )}
    </>
  );
}
