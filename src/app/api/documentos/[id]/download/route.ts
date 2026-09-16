import { NextResponse } from "next/server";
import { canAccessSharedDocuments } from "@/lib/documents/access";
import { getSharedDocument } from "@/lib/documents/shared-documents";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  if (!(await canAccessSharedDocuments())) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const { id } = await context.params;
  const document = await getSharedDocument(id);

  if (!document) {
    return NextResponse.json({ error: "Documento não encontrado." }, { status: 404 });
  }

  const fileResponse = await fetch(document.file_url, { cache: "no-store" });

  if (!fileResponse.ok) {
    return NextResponse.json(
      { error: "Arquivo indisponível no momento." },
      { status: 502 },
    );
  }

  const buffer = await fileResponse.arrayBuffer();
  const safeFileName = document.file_name.replace(/["\r\n]/g, "");
  const encodedFileName = encodeURIComponent(document.file_name);

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": document.mime_type,
      "Content-Disposition": `attachment; filename="${safeFileName}"; filename*=UTF-8''${encodedFileName}`,
      "Content-Length": String(buffer.byteLength),
      "Cache-Control": "private, no-store",
    },
  });
}
