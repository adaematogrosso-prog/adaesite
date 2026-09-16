export function formatCurrencyFromCents(cents: number): string {
  const value = cents / 100;
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export function parseCurrencyInput(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) return null;

  const normalized = trimmed
    .replace(/\s/g, "")
    .replace(/^R\$/, "")
    .replace(/\./g, "")
    .replace(",", ".");

  const amount = Number(normalized);
  if (!Number.isFinite(amount) || amount <= 0) return null;

  return Math.round(amount * 100);
}

export function formatCurrencyInput(cents: number): string {
  return (cents / 100).toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}
