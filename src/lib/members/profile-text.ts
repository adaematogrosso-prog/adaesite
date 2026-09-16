const LOWERCASE_WORDS = new Set(["de", "da", "do", "dos", "das", "e"]);

function capitalizeWord(word: string): string {
  const lower = word.toLocaleLowerCase("pt-BR");
  if (!lower) return lower;
  return lower.charAt(0).toLocaleUpperCase("pt-BR") + lower.slice(1);
}

export function formatTitleCaseText(value: string): string {
  const words = value.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "";

  return words
    .map((word, index) => {
      const lower = word.toLocaleLowerCase("pt-BR");
      if (index > 0 && LOWERCASE_WORDS.has(lower)) {
        return lower;
      }
      return capitalizeWord(word);
    })
    .join(" ");
}

export function formatPersonName(value: string): string {
  return formatTitleCaseText(value);
}

export function formatProfession(value: string): string {
  return formatTitleCaseText(value);
}

export function formatOrganizationName(value: string): string {
  return formatTitleCaseText(value);
}

export function formatCity(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "";

  const ufMatch = trimmed.match(/^(.+?)\s*-\s*([A-Za-z]{2})$/);
  if (ufMatch) {
    return `${formatTitleCaseText(ufMatch[1])} - ${ufMatch[2].toUpperCase()}`;
  }

  return formatTitleCaseText(trimmed);
}

export function normalizeProfileTextFields(fields: {
  full_name: string;
  city: string | null;
  alumni_college: string | null;
  chapter_name: string | null;
  profession: string | null;
}) {
  return {
    full_name: formatPersonName(fields.full_name),
    city: fields.city ? formatCity(fields.city) : null,
    alumni_college: fields.alumni_college
      ? formatOrganizationName(fields.alumni_college)
      : null,
    chapter_name: fields.chapter_name
      ? formatOrganizationName(fields.chapter_name)
      : null,
    profession: fields.profession ? formatProfession(fields.profession) : null,
  };
}
