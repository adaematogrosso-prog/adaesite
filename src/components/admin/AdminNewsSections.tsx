"use client";

import { useMemo, useState } from "react";
import { AdminNewsList } from "@/components/admin/AdminNewsList";
import { NewsFeed } from "@/components/NewsFeed";
import { SearchBar } from "@/components/SearchBar";
import { matchesSearch, stripHtml } from "@/lib/search";
import type { NewsPost } from "@/types/database";

type Props = {
  allPosts: NewsPost[];
  publishedPosts: NewsPost[];
};

function filterNewsPosts(posts: NewsPost[], query: string) {
  if (!query.trim()) return posts;

  return posts.filter((post) =>
    matchesSearch(
      query,
      post.title,
      post.summary,
      stripHtml(post.content),
    ),
  );
}

export function AdminNewsSections({ allPosts, publishedPosts }: Props) {
  const [query, setQuery] = useState("");

  const filteredPublished = useMemo(
    () => filterNewsPosts(publishedPosts, query),
    [publishedPosts, query],
  );

  const filteredAll = useMemo(
    () => filterNewsPosts(allPosts, query),
    [allPosts, query],
  );

  return (
    <>
      <SearchBar
        id="admin-news-search"
        label="Pesquisar notícias"
        placeholder="Buscar por título, subtítulo ou conteúdo..."
        value={query}
        onChange={setQuery}
        className="mt-8"
      />

      <section className="mt-8">
        <h2 className="section-title text-xl font-semibold text-royal-blue">
          Notícias publicadas
        </h2>
        <div className="mt-6">
          {filteredPublished.length === 0 ? (
            <EmptySearch message="Nenhuma notícia publicada encontrada." />
          ) : (
            <NewsFeed posts={filteredPublished} />
          )}
        </div>
      </section>

      <section className="mt-12 border-t border-gold/20 pt-10">
        <h2 className="section-title text-xl font-semibold text-royal-blue">
          Gerenciar publicações
        </h2>
        <p className="mt-2 text-sm text-muted">
          Edite ou exclua notícias publicadas.
        </p>
        <div className="mt-6">
          {filteredAll.length === 0 ? (
            <EmptySearch message="Nenhuma publicação encontrada." />
          ) : (
            <AdminNewsList posts={filteredAll} />
          )}
        </div>
      </section>
    </>
  );
}

function EmptySearch({ message }: { message: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-gold/30 bg-white p-10 text-center">
      <p className="text-muted">{message}</p>
    </div>
  );
}
