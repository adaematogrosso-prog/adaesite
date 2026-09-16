function OrderBanners() {
  return (
    <svg
      className="login-auth-bg-banners-svg"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      aria-hidden
    >
      <defs>
        <linearGradient id="loginBannerBlue" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#003580" />
          <stop offset="55%" stopColor="#002456" />
          <stop offset="100%" stopColor="#001a45" />
        </linearGradient>
        <linearGradient id="loginBannerGold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#e8c547" />
          <stop offset="100%" stopColor="#b8941f" />
        </linearGradient>
      </defs>

      <g className="login-auth-bg-banner login-auth-bg-banner-far-left" opacity="0.5">
        <path d="M0 8 L0 92 L5 88 L10 92 L10 8 Z" fill="url(#loginBannerBlue)" />
        <path d="M0 8 L10 8 L10 11 L0 11 Z" fill="url(#loginBannerGold)" opacity="0.8" />
      </g>

      <g className="login-auth-bg-banner login-auth-bg-banner-left">
        <path d="M4 6 L4 94 L9 90 L14 94 L14 6 Z" fill="url(#loginBannerBlue)" opacity="0.58" />
        <path d="M4 6 L14 6 L14 9 L4 9 Z" fill="url(#loginBannerGold)" opacity="0.75" />
      </g>

      <g className="login-auth-bg-banner login-auth-bg-banner-mid-left" opacity="0.38">
        <path d="M18 10 L18 90 L22 86 L26 90 L26 10 Z" fill="url(#loginBannerBlue)" />
      </g>

      <g className="login-auth-bg-banner login-auth-bg-banner-mid-right" opacity="0.38">
        <path d="M74 10 L74 90 L78 86 L82 90 L82 10 Z" fill="url(#loginBannerBlue)" />
      </g>

      <g className="login-auth-bg-banner login-auth-bg-banner-right">
        <path d="M86 6 L86 94 L91 90 L96 94 L96 6 Z" fill="url(#loginBannerBlue)" opacity="0.62" />
        <path d="M86 6 L96 6 L96 9 L86 9 Z" fill="url(#loginBannerGold)" opacity="0.8" />
      </g>

      <g className="login-auth-bg-banner login-auth-bg-banner-far-right" opacity="0.5">
        <path d="M90 8 L90 92 L95 88 L100 92 L100 8 Z" fill="url(#loginBannerBlue)" />
        <path d="M90 8 L100 8 L100 11 L90 11 Z" fill="url(#loginBannerGold)" opacity="0.8" />
      </g>
    </svg>
  );
}

export function LoginBackground() {
  return (
    <div className="login-auth-bg pointer-events-none absolute inset-0" aria-hidden>
      <div className="login-auth-bg-base" />
      <div className="login-auth-bg-vignette" />

      <div className="login-auth-bg-fx absolute inset-0 overflow-hidden max-lg:hidden">
        <div className="login-auth-bg-stripes" />
        <div className="login-auth-bg-mesh" />
        <div className="login-auth-bg-rays login-auth-bg-rays-left" />
        <div className="login-auth-bg-rays login-auth-bg-rays-right" />
        <div className="login-auth-bg-glow login-auth-bg-glow-sky" />
        <div className="login-auth-bg-glow login-auth-bg-glow-gold" />
        <div className="login-auth-bg-glow login-auth-bg-glow-crimson" />
        <div className="login-auth-bg-glow login-auth-bg-glow-edge-left" />
        <div className="login-auth-bg-glow login-auth-bg-glow-edge-right" />
        <div className="login-auth-bg-orbs">
          <div className="login-auth-orb login-auth-orb-a" />
          <div className="login-auth-orb login-auth-orb-b" />
          <div className="login-auth-orb login-auth-orb-c" />
          <div className="login-auth-orb login-auth-orb-d" />
          <div className="login-auth-orb login-auth-orb-e" />
        </div>
        <div className="login-auth-bg-beams" />
        <div className="login-auth-bg-grid" />
        <div className="login-auth-bg-pattern" />
        <div className="login-auth-bg-banners">
          <OrderBanners />
        </div>
        <div className="login-auth-bg-emblem login-auth-bg-emblem-left" />
        <div className="login-auth-bg-emblem login-auth-bg-emblem-right" />
        <div className="login-auth-bg-sparkles" />
        <div className="login-auth-bg-spotlight login-auth-bg-spotlight-form" />
        <div className="login-auth-bg-spotlight login-auth-bg-spotlight-brand" />
        <div className="login-auth-bg-shimmer" />
        <div className="login-auth-bg-shimmer-gold" />
      </div>
    </div>
  );
}
