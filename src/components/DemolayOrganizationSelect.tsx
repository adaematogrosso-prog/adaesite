"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CUSTOM_ORGANIZATION_VALUE,
  type DemolayOrganization,
} from "@/lib/demolay/organizations";

type Props = {
  id: string;
  label: string;
  name: string;
  value: string;
  options: DemolayOrganization[];
  formatLabel: (org: DemolayOrganization) => string;
  onValueChange: (value: string) => void;
  allowCustom?: boolean;
  placeholder?: string;
  customOptionLabel?: string;
  customPlaceholder?: string;
  className?: string;
  selectClassName?: string;
  inputClassName?: string;
};

export function DemolayOrganizationSelect({
  id,
  label,
  name,
  value,
  options,
  formatLabel,
  onValueChange,
  allowCustom = false,
  placeholder = "Selecione...",
  customOptionLabel = "Outro (cadastrar manualmente)",
  customPlaceholder = "Ex.: Nome nº 000",
  className = "",
  selectClassName = "mt-1 w-full rounded-lg border border-gold/20 px-4 py-2.5 outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/20",
  inputClassName = "mt-2 w-full rounded-lg border border-gold/20 px-4 py-2.5 outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/20",
}: Props) {
  const optionLabels = useMemo(
    () =>
      [...options]
        .map((option) => ({
          option,
          label: formatLabel(option),
        }))
        .sort((a, b) => {
          const numberA = a.option.number ?? Number.MAX_SAFE_INTEGER;
          const numberB = b.option.number ?? Number.MAX_SAFE_INTEGER;

          if (numberA !== numberB) return numberA - numberB;
          return a.label.localeCompare(b.label, "pt-BR");
        }),
    [formatLabel, options],
  );

  const matchedLabel = useMemo(() => {
    if (!value.trim()) return "";

    const normalizedValue = value.trim().toLowerCase();
    const exact = optionLabels.find(
      (entry) => entry.label.toLowerCase() === normalizedValue,
    );
    if (exact) return exact.label;

    return allowCustom ? CUSTOM_ORGANIZATION_VALUE : "";
  }, [allowCustom, optionLabels, value]);

  const [selected, setSelected] = useState(
    matchedLabel || (allowCustom && value.trim() ? CUSTOM_ORGANIZATION_VALUE : ""),
  );
  const [customValue, setCustomValue] = useState(
    matchedLabel === CUSTOM_ORGANIZATION_VALUE ? value : "",
  );

  useEffect(() => {
    const nextMatched =
      matchedLabel || (allowCustom && value.trim() ? CUSTOM_ORGANIZATION_VALUE : "");
    setSelected(nextMatched);
    setCustomValue(nextMatched === CUSTOM_ORGANIZATION_VALUE ? value : "");
  }, [allowCustom, matchedLabel, value]);

  function handleSelectChange(nextSelected: string) {
    setSelected(nextSelected);

    if (nextSelected === CUSTOM_ORGANIZATION_VALUE) {
      onValueChange(customValue);
      return;
    }

    onValueChange(nextSelected);
  }

  function handleCustomChange(nextCustom: string) {
    setCustomValue(nextCustom);
    onValueChange(nextCustom);
  }

  const hiddenValue =
    selected === CUSTOM_ORGANIZATION_VALUE ? customValue.trim() : selected;

  return (
    <div className={className}>
      <label htmlFor={id} className="block text-sm font-medium text-foreground">
        {label}
      </label>
      <select
        id={id}
        value={selected}
        onChange={(event) => handleSelectChange(event.target.value)}
        className={selectClassName}
        required={!allowCustom}
      >
        <option value="">{placeholder}</option>
        {optionLabels.map(({ option, label: optionLabel }) => (
          <option key={`${option.number ?? "na"}-${option.name}`} value={optionLabel}>
            {optionLabel}
            {option.city ? ` · ${option.city}` : ""}
          </option>
        ))}
        {allowCustom ? (
          <option value={CUSTOM_ORGANIZATION_VALUE}>{customOptionLabel}</option>
        ) : null}
      </select>

      {allowCustom && selected === CUSTOM_ORGANIZATION_VALUE ? (
        <input
          type="text"
          value={customValue}
          onChange={(event) => handleCustomChange(event.target.value)}
          className={inputClassName}
          placeholder={customPlaceholder}
          aria-label={`${label} (outro)`}
          required
        />
      ) : null}

      <input type="hidden" name={name} value={hiddenValue} />
    </div>
  );
}
