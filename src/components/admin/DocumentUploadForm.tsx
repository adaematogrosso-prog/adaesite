"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import { uploadSharedDocument } from "@/actions/documents";

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getFileKindLabel(file: File) {
  if (file.type === "application/pdf") return "PDF";
  if (file.type.startsWith("image/")) return "Imagem";
  return "Arquivo";
}

function FileTypeIcon({ kind }: { kind: "pdf" | "image" | "file" }) {
  if (kind === "pdf") {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        className="h-8 w-8 shrink-0 text-crimson/80"
        aria-hidden
      >
        <path d="M6 2a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6H6zm7 1.5V9h5.5L13 3.5zM8 13h1.5v4H8v-4zm3.5 0H13v4h-1.5v-1.25h-.75V17H9.5v-4H11.5v1.25h.75V13zm4 0H17v4h-1.5v-1.25h-.75V17H14v-4h1.5v1.25h.75V13z" />
      </svg>
    );
  }

  if (kind === "image") {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-8 w-8 shrink-0 text-royal-blue"
        aria-hidden
      >
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <path d="m21 15-5-5L5 21" />
      </svg>
    );
  }

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-8 w-8 shrink-0 text-muted"
      aria-hidden
    >
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6" />
    </svg>
  );
}

function getFileIconKind(file: File): "pdf" | "image" | "file" {
  if (file.type === "application/pdf") return "pdf";
  if (file.type.startsWith("image/")) return "image";
  return "file";
}

export function DocumentUploadForm({ onSuccess }: { onSuccess?: () => void }) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    setSelectedFile(file);
    setMessage(null);
  }

  function handleClearFile() {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isPending) return;
    setMessage(null);

    const formData = new FormData(event.currentTarget);

    startTransition(async () => {
      const result = await uploadSharedDocument(formData);

      if (result.error) {
        setMessage({ type: "error", text: result.error });
        return;
      }

      setTitle("");
      setSelectedFile(null);
      formRef.current?.reset();
      setMessage({ type: "success", text: "Documento publicado com sucesso!" });
      router.refresh();
      onSuccess?.();
    });
  }

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      className="rounded-2xl border border-gold/20 bg-white p-6 shadow-sm"
    >
      <div className="mb-6">
        <h3 className="section-title text-lg font-semibold text-royal-blue">
          Anexar documento
        </h3>
        <p className="mt-1 text-sm text-muted">
          Informe o nome do documento e selecione um PDF ou imagem para
          publicar na área de documentos gerais.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div>
          <label
            htmlFor="document-title"
            className="block text-sm font-medium text-foreground"
          >
            Nome do documento
          </label>
          <input
            id="document-title"
            name="title"
            type="text"
            required
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Ex.: Estatuto ADAE-MT 2026"
            className="mt-2 w-full rounded-lg border border-gold/20 px-4 py-2.5 outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/20"
          />
          <p className="mt-2 text-xs text-muted">
            Esse nome aparece na listagem para os membros.
          </p>
        </div>

        <div>
          <span className="block text-sm font-medium text-foreground">
            Arquivo
          </span>

          <input
            ref={fileInputRef}
            id="document-file"
            name="file"
            type="file"
            required
            accept="application/pdf,image/jpeg,image/png,image/webp,image/gif"
            className="sr-only"
            onChange={handleFileChange}
          />

          <div className="mt-2 rounded-xl border border-dashed border-gold/30 bg-royal-blue/5">
            {selectedFile ? (
              <div className="flex items-center gap-3 p-4">
                <FileTypeIcon kind={getFileIconKind(selectedFile)} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">
                    {selectedFile.name}
                  </p>
                  <p className="mt-0.5 text-xs text-muted">
                    {getFileKindLabel(selectedFile)} ·{" "}
                    {formatFileSize(selectedFile.size)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="shrink-0 rounded-full border border-gold/30 px-3 py-1.5 text-xs font-semibold text-royal-blue transition hover:bg-gold/10"
                >
                  Trocar
                </button>
              </div>
            ) : (
              <label
                htmlFor="document-file"
                className="flex cursor-pointer flex-col items-center gap-2 px-4 py-8 text-center transition hover:bg-gold/5"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-7 w-7 text-royal-blue"
                  aria-hidden
                >
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" x2="12" y1="3" y2="15" />
                </svg>
                <span className="text-sm font-semibold text-royal-blue">
                  Selecionar arquivo
                </span>
                <span className="text-xs text-muted">
                  PDF ou imagem · até 10 MB
                </span>
              </label>
            )}
          </div>

          <div className="mt-2 flex flex-wrap gap-2">
            {["PDF", "JPG", "PNG", "WEBP", "GIF"].map((format) => (
              <span
                key={format}
                className="rounded-full border border-gold/20 bg-white px-2.5 py-0.5 text-[11px] font-medium uppercase tracking-wide text-muted"
              >
                {format}
              </span>
            ))}
          </div>

          {selectedFile ? (
            <button
              type="button"
              onClick={handleClearFile}
              className="mt-2 text-xs text-crimson transition hover:underline"
            >
              Remover arquivo selecionado
            </button>
          ) : null}
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-4 border-t border-gold/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
        {message ? (
          <p
            className={`rounded-xl px-4 py-2.5 text-sm ${
              message.type === "success"
                ? "bg-green-50 text-green-800"
                : "bg-red-50 text-crimson"
            }`}
          >
            {message.text}
          </p>
        ) : (
          <p className="text-xs text-muted">
            O documento ficará visível para os membros aprovados.
          </p>
        )}

        <button
          type="submit"
          disabled={isPending || !selectedFile}
          className="inline-flex shrink-0 items-center justify-center rounded-full bg-royal-blue px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-royal-blue-light disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? "Enviando..." : "Publicar documento"}
        </button>
      </div>
    </form>
  );
}
