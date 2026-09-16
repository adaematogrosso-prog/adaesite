export function HeroWaveDivider() {
  return (
    <div
      className="hero-wave-divider pointer-events-none absolute bottom-0 left-0 right-0 z-20 translate-y-px overflow-hidden"
      aria-hidden
    >
      <svg
        viewBox="0 0 1440 120"
        preserveAspectRatio="none"
        className="block h-20 w-full sm:h-28"
      >
        <defs>
          <linearGradient id="heroWaveGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#002456" stopOpacity="0.85" />
            <stop offset="45%" stopColor="#0a1020" />
            <stop offset="100%" stopColor="#0a1020" />
          </linearGradient>
        </defs>
        <path
          fill="url(#heroWaveGradient)"
          d="M0,64 C240,112 480,24 720,56 C960,88 1200,32 1440,72 L1440,120 L0,120 Z"
          className="animate-wave-drift"
        />
        <path
          fill="url(#heroWaveGradient)"
          fillOpacity="0.55"
          d="M0,80 C360,36 720,104 1080,52 C1260,28 1380,68 1440,80 L1440,120 L0,120 Z"
          className="animate-wave-drift-reverse"
        />
        <path
          fill="#0a1020"
          fillOpacity="0.9"
          d="M0,96 C480,48 960,112 1440,68 L1440,120 L0,120 Z"
          className="animate-wave-drift"
          style={{ animationDuration: "14s" }}
        />
      </svg>
    </div>
  );
}

export function HeroBackgroundLayers() {
  return (
    <>
      <div className="hero-bg-base pointer-events-none absolute inset-0" />
      <div className="hero-bg-mesh pointer-events-none absolute inset-0" />
      <div className="hero-glow hero-glow-sky pointer-events-none absolute inset-0" />
      <div className="hero-glow hero-glow-blue pointer-events-none absolute inset-0" />
      <div className="hero-glow hero-glow-deep pointer-events-none absolute inset-0" />
      <div className="hero-bg-beams pointer-events-none absolute inset-0" />
      <div className="hero-bg-grid pointer-events-none absolute inset-0" />
      <div className="hero-bg-orbs pointer-events-none absolute inset-0 overflow-hidden">
        <div className="hero-orb hero-orb-sky hero-orb-1" />
        <div className="hero-orb hero-orb-blue hero-orb-2" />
        <div className="hero-orb hero-orb-ice hero-orb-3" />
      </div>
      <div className="hero-bg-sparkles pointer-events-none absolute inset-0" />
      <div className="hero-shimmer pointer-events-none absolute inset-0" />
      <div className="hero-bg-fade pointer-events-none absolute inset-0" />
    </>
  );
}

/** Fundo contínuo das seções escuras — efeitos cerimoniais DeMolay em movimento. */
function LandingOrderBanners() {
  return (
    <svg
      className="landing-flow-banners-svg"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      aria-hidden
    >
      <defs>
        <linearGradient id="landingBannerBlue" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#003580" />
          <stop offset="100%" stopColor="#001a45" />
        </linearGradient>
        <linearGradient id="landingBannerGold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#e8c547" />
          <stop offset="100%" stopColor="#b8941f" />
        </linearGradient>
      </defs>

      <g className="landing-flow-banner landing-flow-banner-left" opacity="0.42">
        <path d="M2 0 L2 100 L7 96 L12 100 L12 0 Z" fill="url(#landingBannerBlue)" />
        <path d="M2 0 L12 0 L12 2.5 L2 2.5 Z" fill="url(#landingBannerGold)" />
        <path
          d="M6 14 L7.2 20 L4.8 20 Z"
          fill="none"
          stroke="#d4af37"
          strokeWidth="0.12"
          opacity="0.5"
        />
      </g>

      <g className="landing-flow-banner landing-flow-banner-mid-left" opacity="0.28">
        <path d="M16 5 L16 95 L20 91 L24 95 L24 5 Z" fill="url(#landingBannerBlue)" />
        <path d="M16 5 L24 5 L24 7 L16 7 Z" fill="url(#landingBannerGold)" opacity="0.7" />
      </g>

      <g className="landing-flow-banner landing-flow-banner-mid-right" opacity="0.28">
        <path d="M76 5 L76 95 L80 91 L84 95 L84 5 Z" fill="url(#landingBannerBlue)" />
        <path d="M76 5 L84 5 L84 7 L76 7 Z" fill="url(#landingBannerGold)" opacity="0.7" />
      </g>

      <g className="landing-flow-banner landing-flow-banner-right" opacity="0.42">
        <path d="M88 0 L88 100 L93 96 L98 100 L98 0 Z" fill="url(#landingBannerBlue)" />
        <path d="M88 0 L98 0 L98 2.5 L88 2.5 Z" fill="url(#landingBannerGold)" />
        <circle cx="93" cy="18" r="3.5" fill="none" stroke="#d4af37" strokeWidth="0.12" opacity="0.35" />
      </g>
    </svg>
  );
}

function LandingOrderSymbol() {
  return (
    <svg
      className="landing-flow-symbol-svg"
      viewBox="0 0 200 200"
      aria-hidden
    >
      <g className="landing-flow-symbol-star" opacity="0.35">
        <path
          d="M100 28 L112 78 L164 78 L122 108 L138 158 L100 128 L62 158 L78 108 L36 78 L88 78 Z"
          fill="none"
          stroke="#d4af37"
          strokeWidth="1.2"
        />
        <circle cx="100" cy="100" r="22" fill="none" stroke="#d4af37" strokeWidth="0.8" opacity="0.6" />
        <path
          d="M100 58 L100 142 M58 100 L142 100"
          fill="none"
          stroke="#d4af37"
          strokeWidth="0.6"
          opacity="0.45"
        />
      </g>
    </svg>
  );
}

export function LandingFlowBackground({
  variant = "landing",
}: {
  variant?: "landing" | "page";
}) {
  const isLanding = variant === "landing";

  return (
    <div
      className={`landing-flow-bg pointer-events-none absolute inset-0${
        isLanding ? "" : " landing-flow-bg--page"
      }`}
      aria-hidden
    >
      <div className="landing-flow-gradient" />

      <div
        className={`landing-flow-fx${isLanding ? "" : " landing-flow-fx--full"}`}
      >
        <div className="landing-flow-mesh" />
        <div className="landing-flow-rays landing-flow-rays-left" />
        <div className="landing-flow-rays landing-flow-rays-right" />
        <div className="landing-flow-beams" />
        <div className="landing-flow-grid" />
        <div className="landing-flow-pattern" />
        <div className="landing-flow-dots" />
        <div className="landing-flow-banners">
          <LandingOrderBanners />
        </div>
        <div className="landing-flow-symbol landing-flow-symbol-a">
          <LandingOrderSymbol />
        </div>
        <div className="landing-flow-symbol landing-flow-symbol-b">
          <LandingOrderSymbol />
        </div>
        <div className="landing-flow-emblem landing-flow-emblem-a" />
        <div className="landing-flow-emblem landing-flow-emblem-b" />
        <div className="landing-flow-orbs overflow-hidden">
          <div className="landing-flow-orb landing-flow-orb-a" />
          <div className="landing-flow-orb landing-flow-orb-b" />
          <div className="landing-flow-orb landing-flow-orb-c" />
          <div className="landing-flow-orb landing-flow-orb-d" />
        </div>
        <div className="landing-flow-sparkles" />
        <div className="landing-flow-shimmer" />
        <div className="landing-flow-shimmer-gold" />
        <div className="landing-flow-vignette" />
      </div>

      {isLanding ? <div className="landing-flow-top-veil" /> : null}
    </div>
  );
}

export function LandingSectionAccent({
  segment,
}: {
  segment: "historia" | "seniors" | "diretoria";
}) {
  return (
    <div
      className={`landing-section-accent landing-section-accent-${segment} pointer-events-none absolute inset-0`}
      aria-hidden
    />
  );
}

export function LandingSectionDivider() {
  return (
    <div className="landing-section-divider relative z-10" aria-hidden>
      <div className="landing-section-divider-line" />
    </div>
  );
}
