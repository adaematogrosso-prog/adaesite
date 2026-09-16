import { NextResponse } from "next/server";
import { getMeetingMinute } from "@/lib/secretaria/minutes";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  const minute = await getMeetingMinute(id);

  if (!minute) {
    return NextResponse.json({ error: "Ata não encontrada." }, { status: 404 });
  }

  const fileResponse = await fetch(minute.file_url, { cache: "no-store" });

  if (!fileResponse.ok) {
    return NextResponse.json(
      { error: "Arquivo indisponível no momento." },
      { status: 502 },
    );
  }

  const buffer = await fileResponse.arrayBuffer();
  const safeFileName = minute.file_name.replace(/["\r\n]/g, "");
  const encodedFileName = encodeURIComponent(minute.file_name);

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": minute.mime_type,
      "Content-Disposition": `attachment; filename="${safeFileName}"; filename*=UTF-8''${encodedFileName}`,
      "Content-Length": String(buffer.byteLength),
      "Cache-Control": "public, max-age=3600",
    },
  });
}
