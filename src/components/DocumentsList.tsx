"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { deleteSharedDocument } from "@/actions/documents";
import { ImageLightbox } from "@/components/ImageLightbox";
import { SearchBar } from "@/components/SearchBar";
import { matchesSearch } from "@/lib/search";
import type { SharedDocument } from "@/types/database";

type Props = {
  documents: SharedDocument[];
  canManage?: boolean;
  viewerBasePath?: string;
};

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export function DocumentsList({
  documents,
  canManage = false,
  viewerBasePath = "/documentos",
}: Props) {
  const [query, setQuery] = useState("");
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [isPending, startTransition] = useTransition();

  const filteredDocuments = useMemo(() => {
    if (!query.trim()) return documents;

    return documents.filter((document) =>
      matchesSearch(query, document.title, document.file_name),
    );
  }, [documents, query]);

  function handleDelete(id: string, title: string) {
    if (!window.confirm(`Excluir o documento "${title}"?`)) return;

    setMessage(null);
    startTransition(async () => {
      const result = await deleteSharedDocument(id);
      setMessage(
        result.error
          ? { type: "error", text: result.error }
          : { type: "success", text: "Documento excluído." },
      );
    });
  }

  if (documents.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-gold/30 bg-white p-10 text-center">
        <p className="text-muted">Nenhum documento disponível ainda.</p>
      </div>
    );
  }

  return (
    <div>
      <SearchBar
        id="documents-search"
        label="Pesquisar documentos"
        placeholder="Buscar por nome do documento..."
        value={query}
        onChange={setQuery}
        className="mb-6"
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

      {filteredDocuments.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gold/30 bg-white p-10 text-center">
          <p className="text-muted">Nenhum documento encontrado.</p>
        </div>
      ) : (
        <div className="members-grid">
          {filteredDocuments.map((document) => (
            <article
              key={document.id}
              className="flex h-full min-w-0 flex-col overflow-hidden rounded-2xl border border-gold/20 bg-white shadow-sm transition hover:border-gold/40 hover:shadow-md"
            >
              <div className="shrink-0 overflow-hidden border-b border-gold/10 bg-royal-blue/5">
                {document.file_kind === "image" ? (
                  <ImageLightbox
                    src={document.file_url}
                    alt={document.title}
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                ) : (
                  <div className="flex h-24 flex-col items-center justify-center gap-1 px-3 text-center">
                    <PdfIcon />
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-royal-blue">
                      PDF
                    </p>
                  </div>
                )}
              </div>

              <div className="flex flex-1 flex-col p-4 sm:p-5">
                <div className="mb-3 flex items-start justify-between gap-2">
                  <span className="shrink-0 rounded-full border border-gold/20 bg-gold/5 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-royal-blue">
                    {document.file_kind === "pdf" ? "PDF" : "Imagem"}
                  </span>
                  <p className="text-right text-[11px] leading-snug text-muted">
                    {formatDate(document.created_at)}
                  </p>
                </div>

                <h3 className="section-title line-clamp-3 text-base font-semibold leading-snug text-royal-blue sm:text-lg">
                  {document.title}
                </h3>

                <div className="mt-auto flex flex-col gap-2 pt-4">
                  <div className="grid grid-cols-2 gap-2">
                    <Link
                      href={`${viewerBasePath}/${document.id}`}
                      className="inline-flex items-center justify-center rounded-full bg-royal-blue px-3 py-2 text-xs font-semibold text-white transition hover:bg-royal-blue-light sm:text-sm"
                    >
                      Visualizar
                    </Link>

                    <a
                      href={`/api/documentos/${document.id}/download`}
                      className="inline-flex items-center justify-center rounded-full border border-gold/30 px-3 py-2 text-xs font-semibold text-royal-blue transition hover:bg-gold/10 sm:text-sm"
                    >
                      Baixar
                    </a>
                  </div>

                  {canManage ? (
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() => handleDelete(document.id, document.title)}
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
