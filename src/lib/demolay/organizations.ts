export type DemolayOrganization = {
  number: number | null;
  name: string;
  city?: string;
};

export const CUSTOM_ORGANIZATION_VALUE = "__custom__";

export function formatChapterLabel(org: DemolayOrganization): string {
  if (org.number != null) {
    return `Capítulo ${org.name} nº ${org.number}`;
  }

  return `Capítulo ${org.name}`;
}

export function formatAlumniCollegeLabel(org: DemolayOrganization): string {
  if (org.number != null) {
    return `Colégio Alumni ${org.name} nº ${org.number}`;
  }

  return `Colégio Alumni ${org.name}`;
}

function normalizeOrganizationText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export function findOrganizationMatch(
  value: string | null | undefined,
  options: DemolayOrganization[],
  formatter: (org: DemolayOrganization) => string,
): string {
  if (!value?.trim()) return "";

  const normalizedValue = normalizeOrganizationText(value);

  for (const option of options) {
    const label = formatter(option);
    if (normalizeOrganizationText(label) === normalizedValue) {
      return label;
    }
  }

  for (const option of options) {
    const normalizedName = normalizeOrganizationText(option.name);
    const normalizedNumber = option.number?.toString() ?? "";

    if (
      normalizedValue.includes(normalizedName) &&
      (normalizedNumber === "" || normalizedValue.includes(normalizedNumber))
    ) {
      return formatter(option);
    }
  }

  return CUSTOM_ORGANIZATION_VALUE;
}

export function isOrganizationInList(
  value: string | null | undefined,
  options: DemolayOrganization[],
  formatter: (org: DemolayOrganization) => string,
): boolean {
  if (!value?.trim()) return true;

  return (
    findOrganizationMatch(value, options, formatter) !== CUSTOM_ORGANIZATION_VALUE
  );
}

export function validateOrganizationSelection(
  value: string | null | undefined,
  options: DemolayOrganization[],
  formatter: (org: DemolayOrganization) => string,
  allowCustom: boolean,
  fieldLabel: string,
): { ok: true; value: string | null } | { ok: false; error: string } {
  const trimmed = value?.trim() ?? "";

  if (!trimmed) {
    return { ok: true, value: null };
  }

  if (allowCustom) {
    return { ok: true, value: trimmed };
  }

  const matched = findOrganizationMatch(trimmed, options, formatter);
  if (matched === CUSTOM_ORGANIZATION_VALUE) {
    return {
      ok: false,
      error: `Selecione um ${fieldLabel} válido da lista.`,
    };
  }

  return { ok: true, value: matched };
}
