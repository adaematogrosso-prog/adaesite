import { createClient } from "@/lib/supabase/server";
import { SENIOR_PILLARS } from "@/lib/constants";
import { RevealOnScroll } from "@/components/RevealOnScroll";
import {
  LandingSectionAccent,
  LandingSectionDivider,
} from "@/components/landing/LandingBackgrounds";
import { LandingSectionHeader } from "@/components/landing/LandingSectionHeader";
import { SeniorEmblem } from "@/components/landing/SeniorEmblem";
import { SeniorPillarCard } from "@/components/SeniorPillarCard";
import type { SeniorPillar } from "@/types/database";

export async function AboutSeniors() {
  const supabase = await createClient();

  const { data: pillars } = await supabase
    .from("adae_senior_pillars")
    .select("*")
    .eq("is_active", true)
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
    <>
      <section id="seniors" className="landing-section relative py-20 sm:py-24">
        <LandingSectionAccent segment="seniors" />
        <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-stretch">
            <RevealOnScroll className="h-full">
              <div className="flex h-full flex-col">
                <LandingSectionHeader
                  align="left"
                  eyebrow="Após os 21 anos"
                  title="Os DeMolays Sêniors"
                />
                <SeniorEmblem />
              </div>
            </RevealOnScroll>

            <RevealOnScroll delay={120}>
              <div className="landing-content-panel">
                <div className="landing-prose">
                  <p>
                    Ao completar 21 anos, ou ao se tornar maçom antes dessa
                    idade, o DeMolay recebe o grau de Sênior, marcando uma nova
                    etapa em sua jornada fraterna. O vínculo com a Ordem não se
                    encerra; ele se transforma em compromisso de apoio, mentoria
                    e continuidade do legado DeMolay.
                  </p>
                  <p>
                    Os Sêniors integram associações alumni que, em cada estado,
                    organizam ações de assistência social, apoio aos Capítulos
                    ativos e eventos que fortalecem a rede de irmãos formados
                    pela Ordem.
                  </p>
                  <p>
                    A <strong>ADAE-MT</strong> reúne
                    os DeMolays Sêniors de Mato Grosso, promovendo a gestão das
                    atividades estaduais e mantendo viva a chama da fraternidade
                    que começou no Capítulo.
                  </p>
                </div>
              </div>
            </RevealOnScroll>
          </div>

          <div className="mt-14 grid items-stretch gap-5 sm:grid-cols-3">
            {displayPillars.map((pillar, index) => (
              <RevealOnScroll key={pillar.id} delay={index * 100} className="h-full">
                <SeniorPillarCard pillar={pillar} />
              </RevealOnScroll>
            ))}
          </div>
        </div>
      </section>
      <LandingSectionDivider />
    </>
  );
}
