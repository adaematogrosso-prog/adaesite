import Link from "next/link";
import { Logo } from "@/components/Logo";
import { SITE_NAME, SITE_SHORT_NAME } from "@/lib/constants";

export function LoginAuthPresentation() {
  return (
    <div className="login-auth-presentation">
      <Link href="/" className="login-auth-logo-link inline-block shrink-0">
        <div className="hero-logo-emphasis login-auth-presentation-logo-wrap relative inline-block">
          <Logo
            size="lg"
            priority
            className="hero-logo-image login-auth-presentation-logo relative z-10 mx-auto"
          />
        </div>
      </Link>

      <p className="login-auth-eyebrow login-auth-presentation-eyebrow shrink-0">
        Ordem DeMolay · Alumni
      </p>
      <h1 className="section-title login-auth-title login-auth-presentation-title shrink-0">
        {SITE_SHORT_NAME}
      </h1>
      <div className="login-auth-rule login-auth-presentation-rule shrink-0" aria-hidden />
      <p className="login-auth-lead login-auth-presentation-lead shrink-0">
        {SITE_NAME}
      </p>
      <p className="login-auth-subtitle login-auth-presentation-text shrink-0">
        Plataforma oficial dos DeMolays Sêniors em Mato Grosso: tradição,
        fraternidade e serviço à comunidade.
      </p>
      <p className="login-auth-note login-auth-presentation-note shrink-0">
        Acesso exclusivo para membros aprovados
      </p>

      <Link
        href="/"
        className="login-auth-site-link login-auth-presentation-link shrink-0 inline-flex items-center gap-2 transition hover:underline"
      >
        ← Voltar ao site
      </Link>
    </div>
  );
}
