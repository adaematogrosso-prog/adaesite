"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { CARDEAIS_SOURCE, type CardeaisVirtue } from "@/lib/demolay/cardeais-virtues";

type Props = {
  virtue: CardeaisVirtue | null;
  onClose: () => void;
};

export function CardeaisVirtueModal({ virtue, onClose }: Props) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!virtue) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [virtue, onClose]);

  if (!virtue || !mounted) return null;

  return createPortal(
    <div
      className="cardeais-virtue-modal-backdrop"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="cardeais-virtue-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="cardeais-virtue-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          className="cardeais-virtue-modal-close"
          onClick={onClose}
          aria-label="Fechar"
        >
          Fechar
        </button>

        <div className="cardeais-virtue-modal-header">
          <span className="cardeais-virtue-modal-order" aria-hidden>
            {virtue.order}
          </span>
          <div>
            <p className="cardeais-virtue-modal-eyebrow">Virtude Cardeal</p>
            <h3
              id="cardeais-virtue-modal-title"
              className="cardeais-virtue-modal-title"
            >
              {virtue.label}
            </h3>
          </div>
        </div>

        <div className="cardeais-virtue-modal-body">
          {virtue.paragraphs.map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}

          {virtue.reflections.length > 0 && (
            <div className="cardeais-virtue-modal-reflections">
              <p className="cardeais-virtue-modal-reflections-label">Reflita</p>
              <ul>
                {virtue.reflections.map((question) => (
                  <li key={question}>{question}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="cardeais-virtue-modal-footer">
          <p className="cardeais-virtue-modal-source">{CARDEAIS_SOURCE}</p>
        </div>
      </div>
    </div>,
    document.body,
  );
}
