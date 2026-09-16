"use client";

import { useState } from "react";
import {
  CARDEAIS_VIRTUES,
  type CardeaisVirtue,
} from "@/lib/demolay/cardeais-virtues";
import { CardeaisVirtueModal } from "@/components/landing/CardeaisVirtueModal";

function VirtueButton({
  virtue,
  variant = "default",
  onSelect,
}: {
  virtue: CardeaisVirtue;
  variant?: "default" | "center";
  onSelect: (virtue: CardeaisVirtue) => void;
}) {
  return (
    <button
      type="button"
      className={`cardeais-virtue-item${variant === "center" ? " cardeais-virtue-item-center" : ""}`}
      onClick={() => onSelect(virtue)}
      aria-haspopup="dialog"
    >
      <span className="cardeais-virtue-order" aria-hidden>
        {virtue.order}
      </span>
      <span className="cardeais-virtue-name">{virtue.label}</span>
    </button>
  );
}

export function CardeaisVirtuesGrid() {
  const [selectedVirtue, setSelectedVirtue] = useState<CardeaisVirtue | null>(
    null,
  );

  const topRow = CARDEAIS_VIRTUES.filter((virtue) => virtue.order <= 3);
  const centerVirtue = CARDEAIS_VIRTUES.find((virtue) => virtue.order === 4);
  const bottomRow = CARDEAIS_VIRTUES.filter((virtue) => virtue.order >= 5);

  if (!centerVirtue) return null;

  return (
    <>
      <div className="cardeais-virtues-layout">
        <ul className="cardeais-virtues-row cardeais-virtues-row-top">
          {topRow.map((virtue) => (
            <li key={virtue.id}>
              <VirtueButton virtue={virtue} onSelect={setSelectedVirtue} />
            </li>
          ))}
        </ul>

        <div className="cardeais-virtues-center">
          <VirtueButton
            virtue={centerVirtue}
            variant="center"
            onSelect={setSelectedVirtue}
          />
        </div>

        <ul className="cardeais-virtues-row cardeais-virtues-row-bottom">
          {bottomRow.map((virtue) => (
            <li key={virtue.id}>
              <VirtueButton virtue={virtue} onSelect={setSelectedVirtue} />
            </li>
          ))}
        </ul>
      </div>

      <CardeaisVirtueModal
        virtue={selectedVirtue}
        onClose={() => setSelectedVirtue(null)}
      />
    </>
  );
}
