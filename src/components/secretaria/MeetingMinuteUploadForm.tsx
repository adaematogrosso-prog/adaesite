"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import { uploadMeetingMinute } from "@/actions/secretaria-minutes";

export function MeetingMinuteUploadForm({ onSuccess }: { onSuccess?: () => void }) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
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

    startTransition(async () => {
      const result = await uploadMeetingMinute(formData);

      if (result.error) {
        setMessage({ type: "error", text: result.error });
        return;
      }

      setTitle("");
      setDescription("");
      setSelectedFile(null);
      formRef.current?.reset();
      setMessage({ type: "success", text: "Ata publicada com sucesso!" });
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
          Publicar ata
        </h3>
        <p className="mt-1 text-sm text-muted">
          Informe título, descrição breve e anexe o PDF da ata.
        </p>
      </div>

      <div className="grid gap-6">
        <div>
          <label htmlFor="minute-title" className="block text-sm font-medium text-foreground">
            Título
          </label>
          <input
            id="minute-title"
            name="title"
            type="text"
            required
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Ex.: Ata da Reunião Ordinária — Março/2026"
            className="mt-2 w-full rounded-lg border border-gold/20 px-4 py-2.5 outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/20"
          />
        </div>

        <div>
          <label htmlFor="minute-description" className="block text-sm font-medium text-foreground">
            Descrição breve
          </label>
          <textarea
            id="minute-description"
            name="description"
            rows={3}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Resumo do conteúdo ou da reunião."
            className="mt-2 w-full rounded-lg border border-gold/20 px-4 py-2.5 outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/20"
          />
        </div>

        <div>
          <span className="block text-sm font-medium text-foreground">Arquivo PDF</span>
          <input
            ref={fileInputRef}
            id="minute-file"
            name="file"
            type="file"
            required
            accept="application/pdf"
            className="sr-only"
            onChange={(event) => setSelectedFile(event.target.files?.[0] ?? null)}
          />
          <div className="mt-2 rounded-xl border border-dashed border-gold/30 bg-royal-blue/5">
            {selectedFile ? (
              <div className="flex items-center justify-between gap-3 p-4">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">
                    {selectedFile.name}
                  </p>
                  <p className="text-xs text-muted">PDF · até 15 MB</p>
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="rounded-full border border-gold/30 px-3 py-1.5 text-xs font-semibold text-royal-blue"
                >
                  Trocar
                </button>
              </div>
            ) : (
              <label
                htmlFor="minute-file"
                className="flex cursor-pointer flex-col items-center gap-2 px-4 py-8 text-center"
              >
                <span className="text-sm font-semibold text-royal-blue">
                  Selecionar PDF
                </span>
                <span className="text-xs text-muted">Somente PDF · até 15 MB</span>
              </label>
            )}
          </div>
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
            A ata ficará disponível para leitura e download por todos.
          </p>
        )}

        <button
          type="submit"
          disabled={isPending || !selectedFile}
          className="inline-flex shrink-0 items-center justify-center rounded-full bg-royal-blue px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-royal-blue-light disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? "Publicando..." : "Publicar ata"}
        </button>
      </div>
    </form>
  );
}
