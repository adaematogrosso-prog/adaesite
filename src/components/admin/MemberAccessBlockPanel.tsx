"use client";

import { useState, useTransition } from "react";
import { updateMemberAccessBlock } from "@/actions/member-admin";
import type { MemberProfile } from "@/types/database";

type Props = {
  profile: MemberProfile;
};

export function MemberAccessBlockPanel({ profile }: Props) {
  const [isBlocked, setIsBlocked] = useState(profile.is_blocked ?? false);
  const [blockReason, setBlockReason] = useState(profile.block_reason ?? "");
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
    formData.set("isBlocked", isBlocked ? "true" : "false");
    formData.set("blockReason", blockReason);

    startTransition(async () => {
      const result = await updateMemberAccessBlock(profile.user_id, formData);

      setMessage(
        result.error
          ? { type: "error", text: result.error }
          : {
              type: "success",
              text: isBlocked
                ? "Acesso bloqueado. O membro verá o motivo ao tentar entrar."
                : "Bloqueio removido. O membro pode acessar novamente.",
            },
      );
    });
  }

  return (
    <section className="mt-8 rounded-2xl border border-crimson/20 bg-white p-6 shadow-sm">
      <h3 className="section-title text-lg font-semibold text-royal-blue">
        Bloqueio de acesso
      </h3>
      <p className="mt-2 text-sm text-muted">
        Presidentes e administradores podem impedir o login do membro na plataforma.
      </p>

      {message ? (
        <p
          className={`mt-4 rounded-xl px-4 py-3 text-sm ${
            message.type === "success"
              ? "bg-green-50 text-green-800"
              : "bg-red-50 text-crimson"
          }`}
        >
          {message.text}
        </p>
      ) : null}

      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
        <label className="flex items-start gap-3 text-sm text-foreground">
          <input
            type="checkbox"
            checked={isBlocked}
            onChange={(event) => setIsBlocked(event.target.checked)}
            className="mt-1"
          />
          <span>Bloquear acesso ao sistema</span>
        </label>

        {isBlocked ? (
          <div>
            <label
              htmlFor={`block-reason-${profile.user_id}`}
              className="block text-sm font-medium text-foreground"
            >
              Motivo do bloqueio
            </label>
            <textarea
              id={`block-reason-${profile.user_id}`}
              value={blockReason}
              onChange={(event) => setBlockReason(event.target.value)}
              required
              rows={3}
              className="mt-1 w-full rounded-lg border border-gold/20 px-4 py-2.5 outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/20"
              placeholder="Descreva o motivo que o membro verá ao tentar entrar."
            />
          </div>
        ) : null}

        <button
          type="submit"
          disabled={isPending}
          className="rounded-full bg-royal-blue px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-royal-blue-light disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? "Salvando..." : "Salvar bloqueio"}
        </button>
      </form>
    </section>
  );
}
