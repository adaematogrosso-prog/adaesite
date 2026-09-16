import Link from "next/link";
import {
  INSTAGRAM_ADAE_URL,
  INSTAGRAM_SLATE_URL,
  SITE_NAME,
  SITE_SHORT_NAME,
  SUPPORT_EMAIL,
} from "@/lib/constants";
import { getPublicExecutiveBoardSettings } from "@/lib/members/executive-board-settings";

function MailIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4 shrink-0"
      aria-hidden
    >
      <rect width="20" height="16" x="2" y="4" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4 shrink-0"
      aria-hidden
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

export async function Footer() {
  const boardSettings = await getPublicExecutiveBoardSettings();
  const slateName = boardSettings.slate_name.trim();
  const slateInstagramLabel = slateName
    ? `Instagram da chapa ${slateName}`
    : "Instagram da chapa atual";

  return (
    <footer className="site-footer royal-gradient mt-auto border-t border-gold/20 text-white shadow-[0_-24px_48px_rgba(0,10,30,0.45)]">
      <div className="site-footer-glow" aria-hidden />
      <div className="relative mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-14">
        <div className="grid gap-10 md:grid-cols-3 md:gap-8">
          <div>
            <p className="section-title text-lg font-semibold text-gold">
              {SITE_SHORT_NAME}
            </p>
            <p className="mt-2 max-w-sm text-sm leading-relaxed text-white/78">
              {SITE_NAME}
            </p>
            <p className="mt-4 text-sm text-white/65">
              Ordem DeMolay · Estado de Mato Grosso
            </p>
          </div>

          <div>
            <p className="site-footer-heading">Suporte</p>
            <ul className="site-footer-links mt-4 space-y-3">
              <li>
                <a
                  href={`mailto:${SUPPORT_EMAIL}`}
                  className="site-footer-link"
                >
                  <MailIcon />
                  <span>{SUPPORT_EMAIL}</span>
                </a>
              </li>
            </ul>
          </div>

          <div>
            <p className="site-footer-heading">Redes sociais</p>
            <ul className="site-footer-links mt-4 space-y-3">
              <li>
                <Link
                  href={INSTAGRAM_ADAE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="site-footer-link"
                >
                  <InstagramIcon />
                  <span>@demolayalumnimt</span>
                </Link>
              </li>
              <li>
                <Link
                  href={INSTAGRAM_SLATE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="site-footer-link"
                >
                  <InstagramIcon />
                  <span>{slateInstagramLabel}</span>
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="site-footer-bottom mt-10 border-t border-white/10 pt-6 text-center text-xs text-white/50">
          © {new Date().getFullYear()} {SITE_SHORT_NAME}. Todos os direitos
          reservados.
        </div>
      </div>
    </footer>
  );
}
