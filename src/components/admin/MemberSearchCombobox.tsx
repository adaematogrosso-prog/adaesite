"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { MemberProfile } from "@/types/database";

type Props = {
  members: MemberProfile[];
  selectedUserId: string | null;
  selectedLabel: string | null;
  onSelect: (userId: string) => void;
  onClear: () => void;
  disabled?: boolean;
  inputId: string;
  label?: string;
};

export function MemberSearchCombobox({
  members,
  selectedUserId,
  selectedLabel,
  onSelect,
  onClear,
  disabled = false,
  inputId,
  label = "Membro no cargo",
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState(selectedLabel ?? "");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setQuery(selectedLabel ?? "");
  }, [selectedLabel, selectedUserId]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const suggestions = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (term.length < 2) return [];

    return members
      .filter(
        (member) =>
          member.full_name.toLowerCase().includes(term) ||
          member.member_id.toLowerCase().includes(term),
      )
      .slice(0, 8);
  }, [members, query]);

  const showSuggestions = open && query.trim().length >= 2;

  return (
    <div ref={containerRef} className="relative">
      <label htmlFor={inputId} className="text-sm font-medium text-foreground">
        {label}
      </label>

      <div className="mt-1 flex gap-2">
        <input
          id={inputId}
          type="text"
          value={query}
          disabled={disabled}
          autoComplete="off"
          placeholder="Digite ao menos 2 letras..."
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          className="w-full rounded-lg border border-gold/20 px-4 py-2.5 outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/20 disabled:opacity-60"
        />

        {selectedUserId ? (
          <button
            type="button"
            disabled={disabled}
            onClick={() => {
              onClear();
              setQuery("");
              setOpen(false);
            }}
            className="shrink-0 rounded-lg border border-gold/30 px-3 py-2 text-xs font-medium text-royal-blue transition hover:bg-gold/10 disabled:opacity-60"
          >
            Remover
          </button>
        ) : null}
      </div>

      {showSuggestions && suggestions.length > 0 ? (
        <ul className="absolute z-20 mt-1 max-h-56 w-full overflow-auto rounded-lg border border-gold/20 bg-white py-1 shadow-lg">
          {suggestions.map((member) => (
            <li key={member.user_id}>
              <button
                type="button"
                disabled={disabled}
                onClick={() => {
                  onSelect(member.user_id);
                  setQuery(member.full_name);
                  setOpen(false);
                }}
                className="flex w-full flex-col px-4 py-2.5 text-left transition hover:bg-gold/10 disabled:opacity-60"
              >
                <span className="text-sm font-medium text-foreground">
                  {member.full_name}
                </span>
                <span className="text-xs text-muted">
                  ID {member.member_id}
                </span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      {showSuggestions && suggestions.length === 0 ? (
        <p className="absolute z-20 mt-1 w-full rounded-lg border border-gold/20 bg-white px-4 py-3 text-sm text-muted shadow-lg">
          Nenhum membro encontrado.
        </p>
      ) : null}

      {query.trim().length > 0 && query.trim().length < 2 ? (
        <p className="mt-1 text-xs text-muted">
          Digite pelo menos 2 letras para buscar.
        </p>
      ) : null}
    </div>
  );
}
