import { Suspense } from "react";
import type { Metadata } from "next";
import { LoginForm } from "@/components/LoginForm";
import { LoginBackground } from "@/components/auth/LoginBackground";

export const metadata: Metadata = {
  title: "Entrar ou Registrar | ADAE-MT",
  description:
    "Acesse ou crie sua conta na plataforma da Associação DeMolay Alumni Estadual de Mato Grosso.",
};

export default function LoginPage() {
  return (
    <div className="login-auth-page relative h-dvh max-h-dvh overflow-hidden">
      <LoginBackground />

      <div className="relative z-10 h-full max-h-dvh overflow-hidden">
        <Suspense
          fallback={
            <div className="login-auth-loading flex h-full min-h-0 items-center justify-center px-4 text-sm">
              Carregando formulário...
            </div>
          }
        >
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
