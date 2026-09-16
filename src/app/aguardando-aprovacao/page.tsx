import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isAdminUser } from "@/lib/auth/admin";
import { getMemberProfile } from "@/lib/auth/membership";
import { signOutAdmin } from "@/actions/executive-members";
import { Logo } from "@/components/Logo";
import { SITE_SHORT_NAME } from "@/lib/constants";

export default async function AwaitingApprovalPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const [isAdmin, profile] = await Promise.all([
    isAdminUser(user.id),
    getMemberProfile(user.id),
  ]);

  if (isAdmin || profile?.status === "approved") {
    redirect("/");
  }

  if (profile?.status === "rejected") {
    redirect("/login?error=rejected");
  }

  return (
    <div className="flex min-h-full flex-1 items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border border-gold/20 bg-white p-8 text-center shadow-lg">
        <Logo size="lg" className="mx-auto" />

        <h1 className="section-title mt-6 text-2xl font-bold text-royal-blue">
          Adesão em análise
        </h1>

        <p className="mt-4 text-sm leading-relaxed text-muted">
          Olá, <strong>{profile?.full_name ?? user.email}</strong>. Seu cadastro
          na {SITE_SHORT_NAME} foi recebido e está aguardando aprovação do
          Presidente, Vice-Presidente ou administrador da associação.
        </p>

        {profile?.member_id && (
          <p className="mt-4 rounded-lg bg-background px-4 py-3 text-sm text-foreground">
            ID DeMolay informado:{" "}
            <strong className="text-royal-blue">{profile.member_id}</strong>
          </p>
        )}

        {(profile?.phone || profile?.birth_date) && (
          <div className="mt-4 space-y-2 rounded-lg bg-background px-4 py-3 text-sm text-foreground">
            {profile.phone ? (
              <p>
                Telefone: <strong>{profile.phone}</strong>
              </p>
            ) : null}
            {profile.birth_date ? (
              <p>
                Aniversário:{" "}
                <strong>
                  {new Date(`${profile.birth_date}T12:00:00`).toLocaleDateString(
                    "pt-BR",
                  )}
                </strong>
              </p>
            ) : null}
          </div>
        )}

        <p className="mt-4 text-sm text-muted">
          Você receberá acesso à plataforma assim que a adesão for aprovada.
        </p>

        <div className="mt-8 flex flex-col gap-3">
          <Link
            href="/"
            className="rounded-full border border-gold/30 px-4 py-2.5 text-sm font-medium text-royal-blue transition hover:bg-gold/10"
          >
            Voltar ao site público
          </Link>
          <form action={signOutAdmin}>
            <button
              type="submit"
              className="w-full rounded-full bg-royal-blue px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-royal-blue-light"
            >
              Sair
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
