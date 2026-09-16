"use client";

type Props = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  id?: string;
  className?: string;
  tone?: "light" | "dark";
};

export function SearchBar({
  value,
  onChange,
  placeholder = "Buscar...",
  label = "Pesquisar",
  id = "search",
  className = "",
  tone = "light",
}: Props) {
  const isDark = tone === "dark";

  if (isDark) {
    return (
      <div className={`news-search-panel ${className}`.trim()}>
        <label htmlFor={id} className="news-search-label">
          {label}
        </label>
        <input
          id={id}
          type="search"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className="news-search-input"
        />
      </div>
    );
  }

  return (
    <div className={className}>
      <label htmlFor={id} className="mb-2 block text-sm font-medium text-foreground">
        {label}
      </label>
      <input
        id={id}
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-gold/20 bg-white px-4 py-3 text-sm text-foreground outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/20"
      />
    </div>
  );
}
