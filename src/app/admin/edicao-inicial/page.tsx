import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/admin";
import { SENIOR_PILLARS } from "@/lib/constants";
import { SeniorPillarEditor } from "@/components/admin/SeniorPillarEditor";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import type { SeniorPillar } from "@/types/database";

export default async function AdminEdicaoInicialPage() {
  await requireAdmin();

  const supabase = await createClient();

  const { data: pillars } = await supabase
    .from("adae_senior_pillars")
    .select("*")
    .order("display_order", { ascending: true });

  const displayPillars: SeniorPillar[] =
    pillars && pillars.length > 0
      ? (pillars as SeniorPillar[])
      : SENIOR_PILLARS.map((pillar) => ({
          id: pillar.key,
          key: pillar.key,
          title: pillar.title,
          description: pillar.description,
          image_url: null,
          display_order: pillar.order,
          is_active: true,
          created_at: "",
          updated_at: "",
        }));

  return (
    <div>
      <AdminPageHeader
        title="Edição Inicial"
        subtitle="Gerencie as imagens dos pilares Sêniors exibidos na landing page. A diretoria executiva é formada pelos membros vinculados em Adesões / Cadastro."
      />

      <section className="mt-10">
        <h2 className="section-title text-2xl font-semibold text-royal-blue">
          Pilares Sêniors
        </h2>
        <p className="mt-2 text-sm text-muted">
          Gerencie as imagens de Fraternidade, Serviço e Tradição.
        </p>

        {pillars && pillars.length > 0 ? (
          <div className="mt-6 grid gap-6 lg:grid-cols-3">
            {displayPillars.map((pillar) => (
              <SeniorPillarEditor key={pillar.id} pillar={pillar} />
            ))}
          </div>
        ) : (
          <div className="mt-6 rounded-2xl border border-dashed border-gold/30 bg-white p-8">
            <p className="text-sm text-muted">
              Execute o arquivo{" "}
              <code className="rounded bg-background px-1.5 py-0.5 text-royal-blue">
                supabase/migration-senior-pillars.sql
              </code>{" "}
              no SQL Editor do Supabase para habilitar o gerenciamento das
              imagens.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
