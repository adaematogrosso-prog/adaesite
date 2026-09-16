"use client";

import { useState, useTransition } from "react";
import { updateExecutiveBoardSettings } from "@/actions/executive-board-settings";
import type { ExecutiveBoardSettings } from "@/types/database";

type Props = {
  settings: ExecutiveBoardSettings;
};

export function ExecutiveBoardSettingsForm({ settings }: Props) {
  const [managementTerm, setManagementTerm] = useState(settings.management_term);
  const [slateName, setSlateName] = useState(settings.slate_name);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isPending) return;
    setMessage(null);

    const formData = new FormData();
    formData.set("managementTerm", managementTerm);
    formData.set("slateName", slateName);

    startTransition(async () => {
      const result = await updateExecutiveBoardSettings(formData);

      if (result.error) {
        setMessage({ type: "error", text: result.error });
        return;
      }

      setMessage({
        type: "success",
        text: "Gestão e chapa atualizadas. A landing page já reflete as mudanças.",
      });
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-gold/20 bg-white p-5 shadow-sm"
    >
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

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label
            htmlFor="management-term"
            className="block text-sm font-semibold text-royal-blue"
          >
            Ano de gestão
          </label>
          <input
            id="management-term"
            name="managementTerm"
            type="text"
            required
            inputMode="numeric"
            placeholder="2026/2027"
            value={managementTerm}
            onChange={(event) => setManagementTerm(event.target.value)}
            className="mt-1.5 w-full rounded-lg border border-royal-blue/20 px-3 py-2 text-sm outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/25"
          />
          <p className="mt-1 text-xs text-muted">Formato: AAAA/AAAA</p>
        </div>

        <div>
          <label
            htmlFor="slate-name"
            className="block text-sm font-semibold text-royal-blue"
          >
            Nome da chapa
          </label>
          <input
            id="slate-name"
            name="slateName"
            type="text"
            required
            maxLength={120}
            placeholder="União e Legado"
            value={slateName}
            onChange={(event) => setSlateName(event.target.value)}
            className="mt-1.5 w-full rounded-lg border border-royal-blue/20 px-3 py-2 text-sm outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/25"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="btn-glow mt-5 rounded-full bg-gold px-5 py-2.5 text-sm font-semibold text-royal-blue transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? "Salvando..." : "Salvar gestão e chapa"}
      </button>
    </form>
  );
}
