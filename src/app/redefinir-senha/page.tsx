import { Suspense } from "react";
import type { Metadata } from "next";
import { ResetPasswordForm } from "@/components/ResetPasswordForm";
import { LoginBackground } from "@/components/auth/LoginBackground";

export const metadata: Metadata = {
  title: "Redefinir senha | ADAE-MT",
  description: "Defina uma nova senha para sua conta na plataforma ADAE-MT.",
};

export default function ResetPasswordPage() {
  return (
    <div className="login-auth-page relative min-h-dvh overflow-x-hidden overflow-y-auto">
      <LoginBackground />

      <div className="relative z-10 flex min-h-dvh items-center justify-center px-4 py-4 sm:py-6">
        <Suspense
          fallback={
            <div className="login-auth-loading text-sm">Carregando formulário...</div>
          }
        >
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
