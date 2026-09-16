import { NextResponse } from "next/server";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { getAuthUser, isAdminUser } from "@/lib/auth/admin";
import { canAccessTesouraria } from "@/lib/auth/executive-access.server";
import { formatCurrencyFromCents } from "@/lib/treasury/money";
import {
  getTreasurySummary,
  getTreasuryTransactions,
  parseTreasuryFilters,
} from "@/lib/treasury/treasury";
import { SITE_NAME, SITE_SHORT_NAME } from "@/lib/constants";

export async function GET(request: Request) {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const isAdmin = await isAdminUser(user.id);
  const canAccess = isAdmin || (await canAccessTesouraria(user.id));

  if (!canAccess) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const filters = parseTreasuryFilters({
    date: searchParams.get("date") ?? undefined,
    month: searchParams.get("month") ?? undefined,
    year: searchParams.get("year") ?? undefined,
  });

  const [transactions, summary] = await Promise.all([
    getTreasuryTransactions(filters),
    getTreasurySummary(filters),
  ]);

  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  try {
    const logoPath = path.join(
      process.cwd(),
      "public",
      "imagenspublicas",
      "logoalumni2.png",
    );
    const logoBuffer = await readFile(logoPath);
    const logoBase64 = `data:image/png;base64,${logoBuffer.toString("base64")}`;
    doc.addImage(logoBase64, "PNG", 14, 10, 24, 25);
  } catch {
    // Logo opcional no PDF
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text(SITE_SHORT_NAME, 42, 18);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("Extrato Financeiro da Tesouraria Estadual", 42, 24);
  doc.text(SITE_NAME, 42, 29);

  const periodLabel = buildPeriodLabel(filters);
  doc.setFontSize(9);
  doc.text(`Período: ${periodLabel}`, 14, 40);
  doc.text(`Gerado em: ${new Date().toLocaleString("pt-BR")}`, 14, 45);

  doc.setFont("helvetica", "bold");
  doc.text(`Saldo do período: ${formatCurrencyFromCents(summary.balanceCents)}`, 14, 53);
  doc.setFont("helvetica", "normal");
  doc.text(`Entradas: ${formatCurrencyFromCents(summary.incomeCents)}`, 14, 58);
  doc.text(`Saídas: ${formatCurrencyFromCents(summary.expenseCents)}`, 80, 58);

  autoTable(doc, {
    startY: 64,
    head: [["Data", "Tipo", "Descrição", "Valor"]],
    body: transactions.map((transaction) => [
      formatDate(transaction.transaction_date),
      transaction.transaction_type === "income" ? "Entrada" : "Saída",
      transaction.description,
      formatCurrencyFromCents(
        transaction.transaction_type === "income"
          ? transaction.amount_cents
          : -transaction.amount_cents,
      ),
    ]),
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [26, 54, 93], textColor: 255 },
    alternateRowStyles: { fillColor: [248, 249, 252] },
    columnStyles: {
      0: { cellWidth: 22 },
      1: { cellWidth: 20 },
      3: { halign: "right", cellWidth: 28 },
    },
  });

  const finalY =
    (doc as jsPDF & { lastAutoTable?: { finalY: number } }).lastAutoTable
      ?.finalY ?? 64;

  doc.setFontSize(8);
  doc.text(
    `${transactions.length} lançamento(s) listado(s).`,
    14,
    Math.min(finalY + 8, 285),
  );

  const pdfBuffer = Buffer.from(doc.output("arraybuffer"));

  return new NextResponse(pdfBuffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="extrato-tesouraria-${buildFileSuffix(filters)}.pdf"`,
    },
  });
}

function formatDate(value: string) {
  const [year, month, day] = value.split("-");
  return `${day}/${month}/${year}`;
}

function buildPeriodLabel(filters: ReturnType<typeof parseTreasuryFilters>) {
  if (filters.date) {
    return formatDate(filters.date);
  }

  if (filters.month && filters.year) {
    const monthName = new Date(filters.year, filters.month - 1, 1).toLocaleDateString(
      "pt-BR",
      { month: "long", year: "numeric" },
    );
    return monthName;
  }

  if (filters.year) {
    return String(filters.year);
  }

  return "Todos os lançamentos";
}

function buildFileSuffix(filters: ReturnType<typeof parseTreasuryFilters>) {
  if (filters.date) return filters.date;
  if (filters.month && filters.year) {
    return `${filters.year}-${filters.month.toString().padStart(2, "0")}`;
  }
  if (filters.year) return String(filters.year);
  return "completo";
}
