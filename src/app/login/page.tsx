import type { Metadata } from "next";
import { LoginForm } from "@/components/LoginForm";
import { LoginBackground } from "@/components/auth/LoginBackground";

export const metadata: Metadata = {
  title: "Entrar ou Registrar | ADAE-MT",
  description:
    "Acesse ou crie sua conta na plataforma da Associação DeMolay Alumni Estadual de Mato Grosso.",
};

type Props = {
  searchParams: Promise<{ next?: string; error?: string }>;
};

function resolveInitialError(error?: string) {
  if (error === "auth") {
    return "Não foi possível autenticar. Tente novamente.";
  }

  if (error === "rejected") {
    return "Sua adesão foi recusada pela diretoria. Entre em contato com a ADAE-MT.";
  }

  if (error === "blocked") {
    return "Sua conta está bloqueada. Informe seu e-mail ou ID DeMolay abaixo para ver os detalhes.";
  }

  return null;
}

export default async function LoginPage({ searchParams }: Props) {
  const params = await searchParams;

  return (
    <div className="login-auth-page relative min-h-dvh overflow-x-hidden overflow-y-auto lg:h-dvh lg:max-h-dvh lg:overflow-hidden">
      <LoginBackground />

      <div className="relative z-10 min-h-dvh lg:h-full lg:max-h-dvh lg:overflow-hidden">
        <LoginForm
          nextPath={params.next ?? "/admin"}
          initialError={resolveInitialError(params.error)}
        />
      </div>
    </div>
  );
}
