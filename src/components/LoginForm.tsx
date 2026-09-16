"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { registerMember, resolveLoginEmail } from "@/actions/membership";
import {
  precheckLogin,
  reportFailedLogin,
  reportSuccessfulLogin,
  getPostLoginAccess,
} from "@/actions/auth-security";
import {
  SITE_SHORT_NAME,
  SUPPORT_EMAIL,
} from "@/lib/constants";
import {
  executiveRoleHasSecretariaAccess,
  executiveRoleHasTesourariaAccess,
} from "@/lib/auth/executive-roles";
import type { MemberBlockInfo } from "@/lib/auth/login-security.server";
import { useSubmitLock } from "@/hooks/useSubmitLock";
import { Logo } from "@/components/Logo";
import { LoginAuthPresentation } from "@/components/auth/LoginAuthPresentation";

type AuthMode = "login" | "register" | "recover";

type Props = {
  nextPath?: string;
  initialError?: string | null;
};

export function LoginForm({
  nextPath = "/admin",
  initialError = null,
}: Props) {
  const router = useRouter();
  const [, startModeTransition] = useTransition();

  const [mode, setMode] = useState<AuthMode>("login");
  const [fullName, setFullName] = useState("");
  const [memberId, setMemberId] = useState("");
  const [phone, setPhone] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [loginIdentifier, setLoginIdentifier] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(initialError);
  const [success, setSuccess] = useState<string | null>(null);
  const [blockedInfo, setBlockedInfo] = useState<MemberBlockInfo | null>(null);
  const [resolvedLoginEmail, setResolvedLoginEmail] = useState<string | null>(
    null,
  );
  const { isPending, run } = useSubmitLock();

  async function refreshResolvedLoginEmail(identifier: string) {
    const trimmed = identifier.trim();
    if (!trimmed) {
      setResolvedLoginEmail(null);
      return;
    }

    const result = await resolveLoginEmail(trimmed);
    setResolvedLoginEmail(result.email ?? null);
  }

  function switchMode(nextMode: AuthMode) {
    startModeTransition(() => {
      setMode(nextMode);
      setError(null);
      setSuccess(null);
      setBlockedInfo(null);
    });
  }

  function handleRecoverPassword(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    run(async () => {
      setError(null);
      setSuccess(null);
      setBlockedInfo(null);

      const precheck = await precheckLogin(loginIdentifier);

      if (precheck.blocked) {
        setBlockedInfo(precheck.blocked);
        return;
      }

      if (precheck.error || !precheck.email) {
        setError(precheck.error ?? "Informe e-mail ou ID DeMolay.");
        return;
      }

      const supabase = createClient();
      const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent("/redefinir-senha")}`;
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        precheck.email,
        { redirectTo },
      );

      if (resetError) {
        setError("Não foi possível enviar o e-mail. Verifique o endereço informado.");
        return;
      }

      setSuccess(
        "Enviamos um link para redefinir sua senha. Verifique sua caixa de entrada e o spam.",
      );
    });
  }

  function handleLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    run(async () => {
      setError(null);
      setSuccess(null);
      setBlockedInfo(null);

      const precheck = await precheckLogin(loginIdentifier);

      if (precheck.blocked) {
        setBlockedInfo(precheck.blocked);
        return;
      }

      if (precheck.error || !precheck.email) {
        setError(precheck.error ?? "Informe e-mail ou ID DeMolay.");
        return;
      }

      const supabase = createClient();
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: precheck.email,
        password,
      });

      if (authError || !data.user) {
        const failure = await reportFailedLogin(loginIdentifier);
        setError(failure.message);
        return;
      }

      await reportSuccessfulLogin(loginIdentifier);

      const access = await getPostLoginAccess(data.user.id);

      if (access.isBlocked && !access.isAdmin) {
        await supabase.auth.signOut();
        const refreshed = await precheckLogin(loginIdentifier);
        if (refreshed.blocked) {
          setBlockedInfo(refreshed.blocked);
        } else {
          setError("Sua conta está bloqueada.");
        }
        return;
      }

      const executiveRole = access.executiveRole;

      if (access.isAdmin) {
        router.push(nextPath);
        router.refresh();
        return;
      }

      if (
        executiveRole === "presidente" ||
        executiveRole === "vice_presidente"
      ) {
        router.push("/admin/adesoes");
        router.refresh();
        return;
      }

      if (
        executiveRole === "secretario" ||
        executiveRole === "secretario_adjunto"
      ) {
        router.push("/admin/noticias");
        router.refresh();
        return;
      }

      if (executiveRoleHasTesourariaAccess(executiveRole)) {
        router.push("/admin/tesouraria");
        router.refresh();
        return;
      }

      if (executiveRoleHasSecretariaAccess(executiveRole)) {
        router.push("/admin/secretaria");
        router.refresh();
        return;
      }

      if (access.accountMismatch) {
        await supabase.auth.signOut();
        setError(
          access.mismatchProfileStatus === "approved"
            ? "Existe um cadastro aprovado com este e-mail, mas vinculado a outra conta de login. Peça à diretoria para redefinir sua senha em Painel → Membros ADAE-MT (não crie uma conta nova no Supabase)."
            : "Sua conta de login não está vinculada ao cadastro ADAE-MT. Peça à diretoria para revisar seu cadastro em Painel → Membros ADAE-MT.",
        );
        return;
      }

      if (access.profileMissing) {
        await supabase.auth.signOut();
        setError(
          "Seu login foi criado, mas o cadastro ADAE-MT não está vinculado. Peça à diretoria para completar ou corrigir seu cadastro.",
        );
        return;
      }

      if (access.emailMismatch) {
        await supabase.auth.signOut();
        setError(
          "O e-mail do login não coincide com o cadastro. Peça à diretoria para salvar novamente e-mail e senha em Painel → Membros ADAE-MT.",
        );
        return;
      }

      if (access.profileStatus === "pending") {
        router.push("/aguardando-aprovacao");
        router.refresh();
        return;
      }

      if (access.profileStatus === "rejected") {
        await supabase.auth.signOut();
        setError("Sua adesão foi recusada pela diretoria.");
        return;
      }

      if (access.profileStatus !== "approved") {
        await supabase.auth.signOut();
        setError("Seu cadastro ainda não foi aprovado.");
        return;
      }

      router.push("/membros");
      router.refresh();
    });
  }

  function handleRegister(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    run(async () => {
      setError(null);
      setSuccess(null);
      setBlockedInfo(null);

      const formData = new FormData(event.currentTarget);
      const result = await registerMember(formData);

      if (result.error && !result.success) {
        setError(result.error);
        return;
      }

      setSuccess(
        result.error ??
          "Cadastro enviado! Sua adesão será analisada pelo Presidente, Vice-Presidente ou administrador. Você receberá acesso após a aprovação.",
      );
      const registeredEmail = (
        (formData.get("email") as string) ?? ""
      )
        .trim()
        .toLowerCase();
      setMode("login");
      setLoginIdentifier(registeredEmail);
      setResolvedLoginEmail(registeredEmail || null);
      setPassword("");
      setConfirmPassword("");
      setMemberId("");
      setPhone("");
      setBirthDate("");
    });
  }

  return (
    <div
      className={`login-auth-layout min-h-dvh lg:h-full lg:max-h-dvh${
        mode === "register" ? " login-auth-layout-register" : ""
      }`}
    >
      <section className="login-auth-form-column">
        <div className="login-auth-form-column-overlay" aria-hidden />

        <div className="login-auth-shell w-full">
          <div className="login-auth-brand-mobile mb-4 text-center lg:hidden">
            <Link href="/" className="login-auth-logo-link inline-block">
              <Logo size="md" priority className="mx-auto" />
            </Link>
            <p className="login-auth-eyebrow mt-3">Ordem DeMolay · Alumni</p>
            <h1 className="section-title login-auth-title mt-1 text-xl font-bold">
              {SITE_SHORT_NAME}
            </h1>
          </div>

          <div
            className={`login-auth-form-intro${
              mode === "register" ? " login-auth-form-intro-register" : ""
            }`}
          >
            {mode === "register" ? (
              <>
                <p className="login-auth-form-eyebrow">Novo membro</p>
                <h2 className="login-auth-form-heading">Solicitar adesão</h2>
              </>
            ) : (
              <>
                <p className="login-auth-form-eyebrow">Área restrita</p>
                <h2 className="login-auth-form-heading">Acesso à plataforma</h2>
              </>
            )}
            <div className="login-auth-form-rule" aria-hidden />
          </div>

          <div
            className={`login-auth-form-stage${
              mode === "register" ? " login-auth-form-stage-register" : ""
            }`}
          >
            <div className="login-auth-form-ambient" aria-hidden />

            <div className="login-auth-panel">
              <div className="login-auth-panel-border-glow" aria-hidden />
              <div className="login-auth-panel-sheen" aria-hidden />

              <div
                className={`login-auth-panel-inner${
                  mode === "register"
                    ? " login-auth-panel-inner-scroll login-auth-panel-inner-register"
                    : ""
                }`}
              >
                {mode !== "recover" ? (
                  <div className="login-auth-tabs flex rounded-full">
                    <button
                      type="button"
                      onClick={() => switchMode("login")}
                      className={`login-auth-tab flex-1 rounded-full font-semibold transition ${
                        mode === "login" ? "login-auth-tab-active" : ""
                      }`}
                    >
                      Entrar
                    </button>
                    <button
                      type="button"
                      onClick={() => switchMode("register")}
                      className={`login-auth-tab flex-1 rounded-full font-semibold transition ${
                        mode === "register" ? "login-auth-tab-active" : ""
                      }`}
                    >
                      Registrar
                    </button>
                  </div>
                ) : (
                  <div className="login-auth-recover-header">
                    <h2 className="login-auth-panel-title text-xl font-bold">
                      Recuperar senha
                    </h2>
                    <p className="login-auth-hint mt-1.5 text-sm">
                      Informe seu e-mail ou ID DeMolay. Enviaremos um link para
                      criar uma nova senha.
                    </p>
                  </div>
                )}

                {mode === "login" && (
                  <p className="login-auth-login-subtitle">
                    Informe seu e-mail ou ID DeMolay para acessar a plataforma.
                  </p>
                )}

                {blockedInfo ? (
                  <div className="login-auth-alert login-auth-alert-error rounded-lg px-4 py-4 text-sm">
                    <p>
                      Sua conta foi bloqueada por{" "}
                      <strong>{blockedInfo.blockedByName}</strong>.
                    </p>
                    <p className="mt-2">
                      <strong>Motivo:</strong> {blockedInfo.reason}
                    </p>
                    <a
                      href={`mailto:${SUPPORT_EMAIL}`}
                      className="login-auth-submit btn-glow mt-4 inline-flex w-full items-center justify-center rounded-full py-3 text-sm font-bold"
                    >
                      Entrar em contato
                    </a>
                  </div>
                ) : null}

                {error && !blockedInfo ? (
                  <div className="login-auth-alert login-auth-alert-error rounded-lg px-3 py-2.5 text-sm">
                    {error}
                  </div>
                ) : null}

                {success && (
                  <div className="login-auth-alert login-auth-alert-success rounded-lg px-3 py-2.5 text-sm">
                    {success}
                  </div>
                )}

                {mode === "login" ? (
                  <form onSubmit={handleLogin} className="login-auth-form">
                    <div className="login-auth-fields space-y-4">
                      <div className="login-auth-field">
                        <label
                          htmlFor="login-identifier"
                          className="login-auth-label block text-sm font-semibold"
                        >
                          E-mail ou ID DeMolay
                        </label>
                        <input
                          id="login-identifier"
                          type="text"
                          required
                          autoComplete="username"
                          value={loginIdentifier}
                          onChange={(e) => {
                            setLoginIdentifier(e.target.value);
                            setResolvedLoginEmail(null);
                          }}
                          onBlur={() => {
                            void refreshResolvedLoginEmail(loginIdentifier);
                          }}
                          className="login-auth-input login-auth-input-lg mt-1.5 w-full rounded-xl px-3.5 outline-none transition"
                          placeholder="seu@email.com ou 130035"
                        />
                        {resolvedLoginEmail ? (
                          <p className="login-auth-hint mt-1.5 text-xs">
                            Entrada será feita com o e-mail{" "}
                            <strong>{resolvedLoginEmail}</strong>
                          </p>
                        ) : null}
                      </div>

                      <div className="login-auth-field">
                        <div className="flex items-center justify-between gap-2">
                          <label
                            htmlFor="login-password"
                            className="login-auth-label block text-sm font-semibold"
                          >
                            Senha
                          </label>
                          <button
                            type="button"
                            onClick={() => switchMode("recover")}
                            className="login-auth-forgot-link text-xs font-semibold sm:text-sm"
                          >
                            Esqueci minha senha
                          </button>
                        </div>
                        <input
                          id="login-password"
                          type="password"
                          required
                          autoComplete="current-password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="login-auth-input login-auth-input-lg mt-1.5 w-full rounded-xl px-3.5 outline-none transition"
                          placeholder="••••••••"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isPending}
                      className="login-auth-submit btn-glow mt-6 w-full rounded-full py-3.5 text-base font-bold transition disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isPending ? "Entrando..." : "Acessar plataforma"}
                    </button>
                  </form>
                ) : mode === "recover" ? (
                  <form onSubmit={handleRecoverPassword} className="login-auth-form">
                    <div className="login-auth-field">
                      <label
                        htmlFor="recover-identifier"
                        className="login-auth-label block text-sm font-semibold"
                      >
                        E-mail ou ID DeMolay
                      </label>
                      <input
                        id="recover-identifier"
                        type="text"
                        required
                        autoComplete="username"
                        value={loginIdentifier}
                        onChange={(e) => setLoginIdentifier(e.target.value)}
                        className="login-auth-input login-auth-input-lg mt-1.5 w-full rounded-xl px-3.5 outline-none transition"
                        placeholder="seu@email.com ou 130035"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isPending}
                      className="login-auth-submit btn-glow mt-6 w-full rounded-full py-3.5 text-base font-bold transition disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isPending ? "Enviando..." : "Enviar link de recuperação"}
                    </button>

                    <p className="login-auth-footer mt-4 text-center text-sm">
                      <button
                        type="button"
                        onClick={() => switchMode("login")}
                        className="login-auth-back-link transition hover:underline"
                      >
                        ← Voltar para entrar
                      </button>
                    </p>
                  </form>
                ) : (
                  <form onSubmit={handleRegister} className="login-auth-form login-auth-form-register">
                    <p className="login-auth-hint login-auth-register-hint">
                      Preencha seus dados. O acesso será liberado após aprovação.
                    </p>

                    <div className="login-auth-register-grid grid sm:grid-cols-2">
                      <div className="sm:col-span-2">
                        <label
                          htmlFor="register-name"
                          className="login-auth-label block font-semibold"
                        >
                          Nome completo
                        </label>
                        <input
                          id="register-name"
                          name="fullName"
                          type="text"
                          required
                          autoComplete="name"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          className="login-auth-input login-auth-input-register mt-1 w-full rounded-lg outline-none transition"
                          placeholder="Seu nome"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="register-member-id"
                          className="login-auth-label block font-semibold"
                        >
                          ID DeMolay
                        </label>
                        <input
                          id="register-member-id"
                          name="memberId"
                          type="text"
                          required
                          value={memberId}
                          onChange={(e) => setMemberId(e.target.value.toUpperCase())}
                          className="login-auth-input login-auth-input-register mt-1 w-full rounded-lg uppercase outline-none transition"
                          placeholder="12345"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="register-phone"
                          className="login-auth-label block font-semibold"
                        >
                          Telefone
                        </label>
                        <input
                          id="register-phone"
                          name="phone"
                          type="tel"
                          required
                          autoComplete="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="login-auth-input login-auth-input-register mt-1 w-full rounded-lg outline-none transition"
                          placeholder="(65) 99999-9999"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="register-birth-date"
                          className="login-auth-label block font-semibold"
                        >
                          Data de aniversário
                        </label>
                        <input
                          id="register-birth-date"
                          name="birthDate"
                          type="date"
                          required
                          value={birthDate}
                          onChange={(e) => setBirthDate(e.target.value)}
                          className="login-auth-input login-auth-input-register login-auth-input-date mt-1 w-full rounded-lg outline-none transition"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="register-email"
                          className="login-auth-label block font-semibold"
                        >
                          E-mail
                        </label>
                        <input
                          id="register-email"
                          name="email"
                          type="email"
                          required
                          autoComplete="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="login-auth-input login-auth-input-register mt-1 w-full rounded-lg outline-none transition"
                          placeholder="seu@email.com"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="register-password"
                          className="login-auth-label block font-semibold"
                        >
                          Senha
                        </label>
                        <input
                          id="register-password"
                          name="password"
                          type="password"
                          required
                          autoComplete="new-password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="login-auth-input login-auth-input-register mt-1 w-full rounded-lg outline-none transition"
                          placeholder="Mín. 6 caracteres"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="register-confirm-password"
                          className="login-auth-label block font-semibold"
                        >
                          Confirmar senha
                        </label>
                        <input
                          id="register-confirm-password"
                          name="confirmPassword"
                          type="password"
                          required
                          autoComplete="new-password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="login-auth-input login-auth-input-register mt-1 w-full rounded-lg outline-none transition"
                          placeholder="Repita a senha"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isPending}
                      className="login-auth-submit login-auth-submit-register btn-glow mt-3 w-full rounded-full font-bold transition disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isPending ? "Enviando..." : "Solicitar adesão"}
                    </button>
                  </form>
                )}

                {mode !== "recover" && (
                  <p className="login-auth-footer mt-4 text-center text-sm lg:hidden">
                    <Link
                      href="/"
                      className="login-auth-back-link transition hover:underline"
                    >
                      ← Voltar ao site
                    </Link>
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <aside
        className="login-auth-brand-column hidden lg:flex"
        aria-label="Apresentação ADAE-MT"
      >
        <LoginAuthPresentation />
      </aside>
    </div>
  );
}
