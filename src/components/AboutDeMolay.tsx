import { RevealOnScroll } from "@/components/RevealOnScroll";
import { CardeaisVirtuesGrid } from "@/components/landing/CardeaisVirtuesGrid";
import {
  LandingSectionAccent,
  LandingSectionDivider,
} from "@/components/landing/LandingBackgrounds";
import { LandingSectionHeader } from "@/components/landing/LandingSectionHeader";
import { CARDEAIS_CEREMONY_QUOTE } from "@/lib/demolay/cardeais-virtues";

export function AboutDeMolay() {
  return (
    <>
      <section id="historia" className="landing-section relative py-20 sm:py-28">
        <LandingSectionAccent segment="historia" />
        <div className="historia-section-glow pointer-events-none absolute inset-0" aria-hidden />

        <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6">
          <div className="grid gap-12 lg:grid-cols-12 lg:items-start lg:gap-14">
            <RevealOnScroll className="lg:col-span-4">
              <LandingSectionHeader
                align="left"
                eyebrow="Nossa Origem"
                title="A Ordem DeMolay"
                description="Fraternidade juvenil fundada nos princípios de honra, lealdade e serviço à comunidade."
              />

              <div className="historia-founding-badge mt-10">
                <span className="historia-founding-year">1919</span>
                <span className="historia-founding-meta">
                  18 de março · Kansas City
                </span>
              </div>

              <blockquote className="historia-quote mt-8">
                <span className="historia-quote-mark" aria-hidden>
                  “
                </span>
                Símbolo de lealdade, coragem e integridade, em homenagem a
                Jacques DeMolay.
              </blockquote>
            </RevealOnScroll>

            <RevealOnScroll delay={120} className="lg:col-span-8">
              <div className="landing-feature-panel">
                <div className="landing-feature-panel-glow" aria-hidden />
                <div className="landing-feature-panel-inner">
                  <div className="landing-prose">
                    <p className="historia-lead">
                      Fundada por Frank S. Land, a Ordem DeMolay dedica-se ao
                      desenvolvimento de jovens entre{" "}
                      <strong>12 e 21 anos</strong>, formando cidadãos preparados
                      para liderar com honra em suas famílias, comunidades e na
                      sociedade.
                    </p>
                    <p>
                      No Brasil, a DeMolay está presente em todos os estados,
                      reunindo milhares de jovens em ações filantrópicas,
                      formação cívica e no fortalecimento de laços que perduram
                      por toda a vida.
                    </p>
                  </div>

                  <div className="mt-10 border-t border-white/10 pt-10">
                    <p className="historia-virtues-label">As sete Virtudes Cardeais</p>
                    <p className="landing-card-muted mt-2 text-sm leading-relaxed">
                      {CARDEAIS_CEREMONY_QUOTE}
                    </p>
                    <div className="mt-6">
                      <CardeaisVirtuesGrid />
                    </div>
                  </div>
                </div>
              </div>
            </RevealOnScroll>
          </div>
        </div>
      </section>
      <LandingSectionDivider />
    </>
  );
}
