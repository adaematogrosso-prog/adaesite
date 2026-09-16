"use client";

import { useState, useTransition } from "react";
import { updateMemberPassword } from "@/actions/profile";

export function ProfilePasswordForm() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);

    const formData = new FormData(event.currentTarget);

    startTransition(async () => {
      const result = await updateMemberPassword(formData);

      if (result.error) {
        setMessage({ type: "error", text: result.error });
        return;
      }

      setPassword("");
      setConfirmPassword("");
      setMessage({ type: "success", text: "Senha alterada com sucesso!" });
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-gold/20 bg-white p-8 shadow-lg"
    >
      <h2 className="section-title text-lg font-semibold text-royal-blue">
        Alterar senha
      </h2>
      <p className="mt-1 text-sm text-muted">
        Defina uma nova senha de acesso à plataforma.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div>
          <label
            htmlFor="profile-password"
            className="block text-sm font-medium text-foreground"
          >
            Nova senha
          </label>
          <input
            id="profile-password"
            name="password"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-lg border border-gold/20 px-4 py-2.5 outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/20"
            placeholder="Mínimo 6 caracteres"
          />
        </div>

        <div>
          <label
            htmlFor="profile-confirm-password"
            className="block text-sm font-medium text-foreground"
          >
            Confirmar nova senha
          </label>
          <input
            id="profile-confirm-password"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="mt-1 w-full rounded-lg border border-gold/20 px-4 py-2.5 outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/20"
            placeholder="Repita a nova senha"
          />
        </div>
      </div>

      {message ? (
        <p
          className={`mt-4 text-sm ${
            message.type === "success" ? "text-green-700" : "text-crimson"
          }`}
        >
          {message.text}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isPending}
        className="mt-6 w-full rounded-full border border-royal-blue px-6 py-3 text-sm font-semibold text-royal-blue transition hover:bg-royal-blue/5 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? "Alterando..." : "Alterar senha"}
      </button>
    </form>
  );
}
