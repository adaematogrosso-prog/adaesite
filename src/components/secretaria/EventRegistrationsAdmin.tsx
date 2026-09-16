"use client";

import { useState, useTransition } from "react";
import { updateEventRegistrationStatus } from "@/actions/secretaria-events";
import { formatCurrencyFromCents } from "@/lib/treasury/money";
import type { EventRegistrationWithItems } from "@/types/database";

type Props = {
  registrations: EventRegistrationWithItems[];
};

const STATUS_LABELS = {
  pending_payment: "Aguardando pagamento",
  paid: "Pago",
  cancelled: "Cancelada",
} as const;

export function EventRegistrationsAdmin({ registrations }: Props) {
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleStatusChange(
    registrationId: string,
    status: "paid" | "cancelled" | "pending_payment",
  ) {
    setMessage(null);
    startTransition(async () => {
      const result = await updateEventRegistrationStatus(registrationId, status);
      setMessage(
        result.error
          ? { type: "error", text: result.error }
          : { type: "success", text: "Inscrição atualizada." },
      );
    });
  }

  if (registrations.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-gold/30 bg-white p-8 text-center">
        <p className="text-muted">Nenhuma inscrição registrada ainda.</p>
      </div>
    );
  }

  return (
    <div>
      {message ? (
        <p
          className={`mb-4 rounded-xl px-4 py-3 text-sm ${
            message.type === "success"
              ? "bg-green-50 text-green-800"
              : "bg-red-50 text-crimson"
          }`}
        >
          {message.text}
        </p>
      ) : null}

      <div className="space-y-4">
        {registrations.map((registration) => (
          <article
            key={registration.id}
            className="rounded-2xl border border-gold/20 bg-white p-5 shadow-sm"
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-royal-blue">
                  {registration.full_name}
                </p>
                <p className="text-xs text-muted">
                  {registration.email} · {registration.phone}
                </p>
                <p className="mt-1 text-xs text-muted">
                  CPF {registration.cpf} · ID {registration.member_id}
                  {registration.t_shirt_size
                    ? ` · Camiseta ${registration.t_shirt_size}`
                    : ""}
                </p>
              </div>

              <div className="text-right">
                <p className="text-sm font-semibold text-royal-blue">
                  {formatCurrencyFromCents(registration.total_amount_cents)}
                </p>
                <p className="text-xs text-muted">
                  {STATUS_LABELS[registration.status]}
                </p>
                <p className="text-[11px] text-muted">
                  Ref. {registration.pix_reference}
                </p>
              </div>
            </div>

            <ul className="mt-4 space-y-1 border-t border-gold/10 pt-4 text-sm text-foreground">
              {registration.items.map((item) => (
                <li key={item.id}>
                  {item.quantity}x {item.plan_name} —{" "}
                  {formatCurrencyFromCents(item.line_total_cents)}
                </li>
              ))}
            </ul>

            <div className="mt-4 flex flex-wrap gap-2">
              {registration.status !== "paid" ? (
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => handleStatusChange(registration.id, "paid")}
                  className="rounded-full bg-royal-blue px-4 py-2 text-xs font-semibold text-white disabled:opacity-60"
                >
                  Confirmar pagamento
                </button>
              ) : null}

              {registration.status !== "cancelled" ? (
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() =>
                    handleStatusChange(registration.id, "cancelled")
                  }
                  className="rounded-full border border-crimson/30 px-4 py-2 text-xs font-semibold text-crimson disabled:opacity-60"
                >
                  Cancelar
                </button>
              ) : null}

              {registration.status === "cancelled" ? (
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() =>
                    handleStatusChange(registration.id, "pending_payment")
                  }
                  className="rounded-full border border-gold/30 px-4 py-2 text-xs font-semibold text-royal-blue disabled:opacity-60"
                >
                  Reabrir pendência
                </button>
              ) : null}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
