import Image from "next/image";

type Props = {
  document: {
    id: string;
    title: string;
    file_url: string;
    file_kind: "pdf" | "image";
    created_at: string;
  };
};

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export function DocumentViewerContent({ document }: Props) {
  return (
    <>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="section-title text-2xl font-bold text-royal-blue sm:text-3xl">
            {document.title}
          </h1>
          <p className="mt-2 text-sm text-muted">
            Publicado em {formatDate(document.created_at)}
          </p>
        </div>

        <a
          href={`/api/documentos/${document.id}/download`}
          className="inline-flex shrink-0 items-center justify-center rounded-full border border-gold/30 px-5 py-2.5 text-sm font-semibold text-royal-blue transition hover:bg-gold/10"
        >
          Baixar arquivo
        </a>
      </div>

      <div className="mt-8 overflow-hidden rounded-2xl border border-gold/20 bg-white shadow-sm">
        {document.file_kind === "pdf" ? (
          <iframe
            src={`${document.file_url}#toolbar=1&navpanes=0`}
            title={document.title}
            className="h-[75vh] w-full bg-white"
          />
        ) : (
          <div className="flex justify-center bg-royal-blue/5 p-4 sm:p-8">
            <Image
              src={document.file_url}
              alt={document.title}
              width={1600}
              height={1200}
              unoptimized
              className="max-h-[75vh] w-auto max-w-full object-contain"
            />
          </div>
        )}
      </div>
    </>
  );
}
