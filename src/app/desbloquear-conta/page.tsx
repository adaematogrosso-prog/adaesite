import Link from "next/link";
import { unlockAccount } from "@/actions/auth-security";
import { SiteLayout } from "@/components/SiteLayout";
import { SUPPORT_EMAIL } from "@/lib/constants";

type Props = {
  searchParams: Promise<{ token?: string }>;
};

export default async function UnlockAccountPage({ searchParams }: Props) {
  const { token } = await searchParams;

  if (!token?.trim()) {
    return (
      <SiteLayout>
        <div className="mx-auto max-w-lg px-4 py-16 text-center">
          <h1 className="section-title text-2xl font-bold text-royal-blue">
            Link inválido
          </h1>
          <p className="mt-3 text-muted">
            O link de desbloqueio não foi informado ou já expirou.
          </p>
          <Link
            href="/login"
            className="mt-6 inline-flex rounded-full bg-royal-blue px-6 py-2.5 text-sm font-semibold text-white"
          >
            Voltar para entrar
          </Link>
        </div>
      </SiteLayout>
    );
  }

  const result = await unlockAccount(token.trim());

  return (
    <SiteLayout>
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <h1 className="section-title text-2xl font-bold text-royal-blue">
          {result.ok ? "Conta desbloqueada" : "Não foi possível desbloquear"}
        </h1>
        <p className="mt-3 text-muted">
          {result.ok
            ? "Sua conta foi desbloqueada. Você já pode entrar novamente na plataforma."
            : result.error ??
              "Tente solicitar um novo link ou entre em contato com a diretoria."}
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/login"
            className="inline-flex rounded-full bg-royal-blue px-6 py-2.5 text-sm font-semibold text-white"
          >
            Ir para entrar
          </Link>
          {!result.ok ? (
            <a
              href={`mailto:${SUPPORT_EMAIL}`}
              className="inline-flex rounded-full border border-gold/30 px-6 py-2.5 text-sm font-semibold text-royal-blue"
            >
              Entrar em contato
            </a>
          ) : null}
        </div>
      </div>
    </SiteLayout>
  );
}
