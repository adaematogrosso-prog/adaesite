"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function ResetPasswordForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres.");
      return;
    }

    if (password !== confirmPassword) {
      setError("As senhas não coincidem.");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (updateError) {
      setError("Não foi possível redefinir a senha. Solicite um novo link e tente novamente.");
      return;
    }

    setSuccess("Senha atualizada com sucesso. Você já pode entrar na plataforma.");
    setPassword("");
    setConfirmPassword("");

    setTimeout(() => {
      router.push("/login");
      router.refresh();
    }, 1800);
  }

  return (
    <div className="login-auth-shell my-auto w-full max-w-md">
      <div className="login-auth-brand login-auth-brand-compact mb-4 text-center">
        <p className="login-auth-eyebrow">Redefinição de senha</p>
        <h1 className="section-title login-auth-title mt-2 text-xl font-bold sm:text-2xl">
          Nova senha
        </h1>
        <div className="login-auth-rule mx-auto mt-3" aria-hidden />
        <p className="login-auth-subtitle mt-3 text-sm">
          Escolha uma nova senha para sua conta ADAE-MT.
        </p>
      </div>

      <div className="login-auth-panel">
        <div className="login-auth-panel-inner">
          {error && (
            <div className="login-auth-alert login-auth-alert-error mb-3 rounded-lg px-3 py-2 text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="login-auth-alert login-auth-alert-success mb-3 rounded-lg px-3 py-2 text-sm">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="space-y-3">
              <div>
                <label
                  htmlFor="new-password"
                  className="login-auth-label block text-sm font-semibold"
                >
                  Nova senha
                </label>
                <input
                  id="new-password"
                  type="password"
                  required
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="login-auth-input mt-1 w-full rounded-lg px-3 py-2 outline-none transition"
                  placeholder="Mín. 6 caracteres"
                />
              </div>

              <div>
                <label
                  htmlFor="confirm-new-password"
                  className="login-auth-label block text-sm font-semibold"
                >
                  Confirmar nova senha
                </label>
                <input
                  id="confirm-new-password"
                  type="password"
                  required
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="login-auth-input mt-1 w-full rounded-lg px-3 py-2 outline-none transition"
                  placeholder="Repita a senha"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="login-auth-submit btn-glow mt-4 w-full rounded-full py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Salvando..." : "Salvar nova senha"}
            </button>
          </form>

          <p className="login-auth-footer mt-4 text-center text-sm">
            <Link href="/login" className="login-auth-back-link transition hover:underline">
              ← Voltar para entrar
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
