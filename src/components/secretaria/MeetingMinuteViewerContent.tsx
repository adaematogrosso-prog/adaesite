import Link from "next/link";
import type { MeetingMinute } from "@/types/database";

type Props = {
  minute: MeetingMinute;
  downloadPath?: string;
  tone?: "light" | "dark";
  backHref?: string;
  backLabel?: string;
};

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export function MeetingMinuteViewerContent({
  minute,
  downloadPath = `/api/secretaria/atas/${minute.id}/download`,
  tone = "light",
  backHref = "/secretaria/atas",
  backLabel = "← Voltar para atas",
}: Props) {
  const titleClass = tone === "dark" ? "text-white" : "text-royal-blue";
  const mutedClass = tone === "dark" ? "text-white/70" : "text-muted";
  const panelClass =
    tone === "dark"
      ? "border border-gold/20 bg-white/5 backdrop-blur-sm"
      : "border border-gold/20 bg-white shadow-sm";

  return (
    <>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className={`section-title text-2xl font-bold sm:text-3xl ${titleClass}`}>
            {minute.title}
          </h1>
          <p className={`mt-2 text-sm ${mutedClass}`}>
            Publicada em {formatDate(minute.created_at)}
          </p>
          {minute.description ? (
            <p className={`mt-3 max-w-2xl text-sm leading-relaxed ${mutedClass}`}>
              {minute.description}
            </p>
          ) : null}
        </div>

        <a
          href={downloadPath}
          className="inline-flex shrink-0 items-center justify-center rounded-full border border-gold/30 px-5 py-2.5 text-sm font-semibold text-royal-blue transition hover:bg-gold/10"
        >
          Baixar PDF
        </a>
      </div>

      <div className={`mt-8 overflow-hidden rounded-2xl ${panelClass}`}>
        <iframe
          src={`${minute.file_url}#toolbar=1&navpanes=0`}
          title={minute.title}
          className="h-[75vh] w-full bg-white"
        />
      </div>

      <p className={`mt-4 text-sm ${mutedClass}`}>
        <Link href={backHref} className="text-gold hover:underline">
          {backLabel}
        </Link>
      </p>
    </>
  );
}
