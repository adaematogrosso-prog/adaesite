"use client";

type Props = {
  label: string;
  openLabel?: string;
  isOpen: boolean;
  onToggle: () => void;
  variant?: "primary" | "secondary";
};

export function FormToggleButton({
  label,
  openLabel = "Fechar",
  isOpen,
  onToggle,
  variant = "primary",
}: Props) {
  const className =
    variant === "primary"
      ? "bg-royal-blue text-white hover:bg-royal-blue-light"
      : "border border-gold/30 text-royal-blue hover:bg-gold/10";

  return (
    <button
      type="button"
      onClick={onToggle}
      aria-expanded={isOpen}
      className={`inline-flex items-center justify-center rounded-full px-5 py-2.5 text-sm font-semibold transition ${className}`}
    >
      {isOpen ? openLabel : label}
    </button>
  );
}
