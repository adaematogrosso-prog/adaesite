import { SITE_NAME, SITE_SHORT_NAME } from "@/lib/constants";
import { Logo } from "@/components/Logo";
import {
  HeroBackgroundLayers,
  HeroWaveDivider,
} from "@/components/landing/LandingBackgrounds";

export function Hero() {
  return (
    <section className="relative overflow-hidden pb-12 text-white sm:pb-16 md:pb-20">
      <HeroBackgroundLayers />

      <div className="relative z-20 mx-auto flex max-w-6xl flex-col items-center gap-10 px-4 py-16 text-center sm:px-6 md:flex-row md:items-center md:gap-12 md:py-24 md:text-left lg:gap-16">
        <div
          className="animate-fade-in-up shrink-0 opacity-0"
          style={{ animationFillMode: "both" }}
        >
          <div className="hero-logo-emphasis relative inline-block">
            <Logo size="xl" priority className="hero-logo-image relative z-10" />
          </div>
        </div>

        <div
          className="animate-fade-in-up max-w-2xl opacity-0"
          style={{ animationDelay: "150ms", animationFillMode: "both" }}
        >
          <p className="section-title text-sm font-medium uppercase tracking-[0.2em] text-gold">
            Bem-vindo à
          </p>
          <h1 className="section-title mt-3 text-3xl font-bold leading-tight drop-shadow-sm sm:text-4xl md:text-5xl">
            {SITE_SHORT_NAME}
          </h1>
          <p className="mt-4 text-lg text-white/90">{SITE_NAME}</p>
          <p className="mt-4 text-base leading-relaxed text-white/75">
            Plataforma oficial para gerenciamento das atividades dos DeMolays
            Sêniors no estado de Mato Grosso, unindo tradição, fraternidade e
            serviço à comunidade.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4 md:justify-start">
            <a
              href="#historia"
              className="btn-glow rounded-full bg-gold px-6 py-3 text-sm font-semibold text-royal-blue shadow-lg shadow-gold/20 transition hover:scale-105 hover:bg-gold-light"
            >
              Conheça a Ordem
            </a>
            <a
              href="#diretoria"
              className="rounded-full border border-white/35 bg-white/5 px-6 py-3 text-sm font-semibold text-white backdrop-blur-sm transition hover:scale-105 hover:border-gold hover:bg-white/10 hover:text-gold"
            >
              Nossa Diretoria
            </a>
          </div>
        </div>
      </div>

      <HeroWaveDivider />
    </section>
  );
}
