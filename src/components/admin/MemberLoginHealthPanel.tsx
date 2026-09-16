"use client";

import { useEffect, useState, useTransition } from "react";
import {
  fetchMemberAuthHealth,
  repairMemberLogin,
} from "@/actions/member-admin";
import type { MemberAuthHealth } from "@/lib/auth/post-login.server";

type Props = {
  userId: string;
};

export function MemberLoginHealthPanel({ userId }: Props) {
  const [health, setHealth] = useState<MemberAuthHealth | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    let cancelled = false;

    startTransition(async () => {
      setError(null);
      setSuccess(null);
      const result = await fetchMemberAuthHealth(userId);

      if (cancelled) return;

      if ("error" in result && result.error) {
        setHealth(null);
        setError(result.error);
        return;
      }

      setHealth(result.health);
    });

    return () => {
      cancelled = true;
    };
  }, [userId]);

  const hasIssue =
    health &&
    (health.authMissing ||
      health.profileMissing ||
      health.emailMismatch ||
      health.accountMismatch ||
      !health.authConfirmed);

  if (!health || !hasIssue) {
    return null;
  }

  function handleRepair() {
    startTransition(async () => {
      setError(null);
      setSuccess(null);

      const result = await repairMemberLogin(userId);

      if (result.error) {
        setError(result.error);
        return;
      }

      setSuccess(
        "Login sincronizado. Peça ao membro para entrar com o e-mail cadastrado e a senha definida aqui.",
      );

      const refreshed = await fetchMemberAuthHealth(userId);
      if ("health" in refreshed && refreshed.health) {
        setHealth(refreshed.health);
      }
    });
  }

  return (
    <div className="rounded-2xl border border-amber-300 bg-amber-50 p-5 text-sm text-amber-950">
      <p className="font-semibold">Problema detectado no login deste membro</p>
      <ul className="mt-2 list-disc space-y-1 pl-5">
        {health.authMissing ? (
          <li>Não existe conta de autenticação vinculada a este cadastro.</li>
        ) : null}
        {health.profileMissing ? (
          <li>Existe login, mas o cadastro ADAE-MT não está vinculado.</li>
        ) : null}
        {health.emailMismatch ? (
          <li>
            E-mail do login ({health.authEmail ?? "?"}) difere do cadastro (
            {health.profileEmail ?? "?"}).
          </li>
        ) : null}
        {health.accountMismatch ? (
          <li>
            Existe outro cadastro com o mesmo e-mail de login. Não crie conta
            manual no Supabase — use este formulário.
          </li>
        ) : null}
        {!health.authConfirmed ? (
          <li>O e-mail de login ainda não estava confirmado.</li>
        ) : null}
      </ul>

      {error ? <p className="mt-3 text-red-700">{error}</p> : null}
      {success ? <p className="mt-3 text-green-800">{success}</p> : null}

      <button
        type="button"
        onClick={handleRepair}
        disabled={isPending}
        className="mt-4 rounded-full bg-amber-900 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white transition hover:bg-amber-950 disabled:opacity-60"
      >
        {isPending ? "Sincronizando..." : "Sincronizar login com cadastro"}
      </button>
    </div>
  );
}
