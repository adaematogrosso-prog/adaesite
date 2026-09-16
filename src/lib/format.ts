function parseBirthDate(dateStr: string | null): Date | null {
  if (!dateStr) return null;

  const [year, month, day] = dateStr.split("-").map(Number);
  if (!year || !month || !day) return null;

  return new Date(year, month - 1, day);
}

export function formatBirthDate(dateStr: string | null): string {
  const date = parseBirthDate(dateStr);
  if (!date) return "-";

  return date.toLocaleDateString("pt-BR", {
    day: "numeric",
    month: "long",
  });
}

export function formatFullBirthDate(dateStr: string | null): string {
  const date = parseBirthDate(dateStr);
  if (!date) return "-";

  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function calculateAge(dateStr: string | null): number | null {
  const birth = parseBirthDate(dateStr);
  if (!birth) return null;

  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }

  return age >= 0 ? age : null;
}

export function formatAge(dateStr: string | null): string {
  const age = calculateAge(dateStr);
  if (age === null) return "-";
  return age === 1 ? "1 ano" : `${age} anos`;
}

export function formatPhone(phone: string | null): string {
  if (!phone?.trim()) return "-";

  let digits = phone.replace(/\D/g, "");

  if (digits.startsWith("55") && digits.length >= 12) {
    digits = digits.slice(2);
  }

  if (digits.length === 11) {
    return `(${digits.slice(0, 2)}) ${digits[2]} ${digits.slice(3, 7)}-${digits.slice(7)}`;
  }

  if (digits.length === 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }

  return phone.trim();
}

export function toWhatsAppUrl(phone: string | null): string | null {
  if (!phone) return null;

  const digits = phone.replace(/\D/g, "");
  if (digits.length < 10) return null;

  const withCountry = digits.startsWith("55") ? digits : `55${digits}`;
  return `https://wa.me/${withCountry}`;
}

export function formatCep(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 8);
  if (digits.length <= 5) return digits;
  return `${digits.slice(0, 5)}-${digits.slice(5)}`;
}
