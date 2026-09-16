import type { MemberProfile } from "@/types/database";

export const EDUCATION_LEVEL_OPTIONS = [
  { value: "", label: "Selecione..." },
  { value: "fundamental_incompleto", label: "Ensino Fundamental incompleto" },
  { value: "fundamental_completo", label: "Ensino Fundamental completo" },
  { value: "medio_incompleto", label: "Ensino Médio incompleto" },
  { value: "medio_completo", label: "Ensino Médio completo" },
  { value: "superior_incompleto", label: "Ensino Superior incompleto" },
  { value: "superior_completo", label: "Ensino Superior completo" },
  { value: "pos_graduacao", label: "Pós-graduação" },
  { value: "mestrado", label: "Mestrado" },
  { value: "doutorado", label: "Doutorado" },
] as const;

export type IsMasonFormValue = "" | "yes" | "no";

export function isMasonToFormValue(value: boolean | null | undefined): IsMasonFormValue {
  if (value === true) return "yes";
  if (value === false) return "no";
  return "";
}

export function parseIsMasonFromForm(value: FormDataEntryValue | null): boolean | null {
  if (value === "yes") return true;
  if (value === "no") return false;
  return null;
}

export function formatIsMason(value: boolean | null | undefined): string {
  if (value === true) return "Sim";
  if (value === false) return "Não";
  return "Não informado";
}

export function formatEducationLevel(value: string | null | undefined): string {
  if (!value) return "Não informado";

  const option = EDUCATION_LEVEL_OPTIONS.find((item) => item.value === value);
  return option?.label ?? value;
}

export function parseProfileExtraFields(formData: FormData) {
  return {
    profession: ((formData.get("profession") as string) ?? "").trim() || null,
    education_level:
      ((formData.get("educationLevel") as string) ?? "").trim() || null,
    is_mason: parseIsMasonFromForm(formData.get("isMason")),
  };
}

export function mergeProfileExtraFields(
  formData: FormData,
  existing: Pick<
    MemberProfile,
    "profession" | "education_level" | "is_mason"
  > | null | undefined,
) {
  const rawProfession = ((formData.get("profession") as string) ?? "").trim();
  const rawEducation = ((formData.get("educationLevel") as string) ?? "").trim();
  const isMasonRaw = formData.get("isMason");

  return {
    profession: rawProfession || existing?.profession || null,
    education_level: rawEducation || existing?.education_level || null,
    is_mason:
      isMasonRaw === "yes" || isMasonRaw === "no"
        ? parseIsMasonFromForm(isMasonRaw)
        : existing?.is_mason ?? null,
  };
}
