export function normalizeSearch(text: string) {
  return text
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");
}

export function matchesSearch(
  query: string,
  ...fields: (string | null | undefined)[]
) {
  const normalizedQuery = normalizeSearch(query);
  if (!normalizedQuery) return true;

  return fields.some(
    (field) => field && normalizeSearch(field).includes(normalizedQuery),
  );
}

export function stripHtml(html: string) {
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}
