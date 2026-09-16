"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  createSecretariaEvent,
  updateSecretariaEvent,
} from "@/actions/secretaria-events";
import { formatCurrencyInput } from "@/lib/treasury/money";
import type { EventPlan, SecretariaEvent } from "@/types/database";

type PlanDraft = {
  key: string;
  name: string;
  description: string;
  price: string;
  includesAccommodation: boolean;
  includesKit: boolean;
};

type Props = {
  event?: SecretariaEvent & { plans: EventPlan[] };
};

function createEmptyPlan(): PlanDraft {
  return {
    key: crypto.randomUUID(),
    name: "",
    description: "",
    price: "",
    includesAccommodation: false,
    includesKit: false,
  };
}

function toDatetimeLocalValue(value: string | null | undefined) {
  if (!value) return "";
  const date = new Date(value);
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60_000);
  return local.toISOString().slice(0, 16);
}

function plansFromEvent(plans: EventPlan[]): PlanDraft[] {
  if (plans.length === 0) {
    return [createEmptyPlan()];
  }

  return plans.map((plan) => ({
    key: plan.id,
    name: plan.name,
    description: plan.description,
    price: formatCurrencyInput(plan.price_cents),
    includesAccommodation: plan.includes_accommodation,
    includesKit: plan.includes_kit,
  }));
}

export function SecretariaEventForm({ event }: Props) {
  const router = useRouter();
  const isEditing = !!event;
  const [plans, setPlans] = useState<PlanDraft[]>(
    event ? plansFromEvent(event.plans) : [createEmptyPlan()],
  );
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [isPending, startTransition] = useTransition();

  function updatePlan(key: string, patch: Partial<PlanDraft>) {
    setPlans((current) =>
      current.map((plan) => (plan.key === key ? { ...plan, ...patch } : plan)),
    );
  }

  function addPlan() {
    setPlans((current) => [...current, createEmptyPlan()]);
  }

  function removePlan(key: string) {
    setPlans((current) =>
      current.length <= 1 ? current : current.filter((plan) => plan.key !== key),
    );
  }

  function handleSubmit(formEvent: React.FormEvent<HTMLFormElement>) {
    formEvent.preventDefault();
    if (isPending) return;
    setMessage(null);

    const formData = new FormData(formEvent.currentTarget);
    formData.set(
      "plans_json",
      JSON.stringify(
        plans.map((plan) => ({
          name: plan.name,
          description: plan.description,
          price: plan.price,
          includesAccommodation: plan.includesAccommodation,
          includesKit: plan.includesKit,
        })),
      ),
    );

    startTransition(async () => {
      const result = isEditing
        ? await updateSecretariaEvent(event.id, formData)
        : await createSecretariaEvent(formData);

      if (result.error) {
        setMessage({ type: "error", text: result.error });
        return;
      }

      setMessage({
        type: "success",
        text: isEditing ? "Evento atualizado!" : "Evento criado!",
      });
      router.refresh();
      if (!isEditing) {
        router.push("/admin/secretaria/eventos");
      }
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-gold/20 bg-white p-6 shadow-sm"
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="lg:col-span-2">
          <label htmlFor="event-title" className="block text-sm font-medium text-foreground">
            Título
          </label>
          <input
            id="event-title"
            name="title"
            required
            defaultValue={event?.title ?? ""}
            className="mt-2 w-full rounded-lg border border-gold/20 px-4 py-2.5 outline-none focus:border-gold focus:ring-2 focus:ring-gold/20"
          />
        </div>

        <div className="lg:col-span-2">
          <label htmlFor="event-subtitle" className="block text-sm font-medium text-foreground">
            Subtítulo
          </label>
          <input
            id="event-subtitle"
            name="subtitle"
            defaultValue={event?.subtitle ?? ""}
            className="mt-2 w-full rounded-lg border border-gold/20 px-4 py-2.5 outline-none focus:border-gold focus:ring-2 focus:ring-gold/20"
          />
        </div>

        <div>
          <label htmlFor="event-starts" className="block text-sm font-medium text-foreground">
            Início
          </label>
          <input
            id="event-starts"
            name="event_starts_at"
            type="datetime-local"
            required
            defaultValue={toDatetimeLocalValue(event?.event_starts_at)}
            className="mt-2 w-full rounded-lg border border-gold/20 px-4 py-2.5 outline-none focus:border-gold focus:ring-2 focus:ring-gold/20"
          />
        </div>

        <div>
          <label htmlFor="event-ends" className="block text-sm font-medium text-foreground">
            Término (opcional)
          </label>
          <input
            id="event-ends"
            name="event_ends_at"
            type="datetime-local"
            defaultValue={toDatetimeLocalValue(event?.event_ends_at)}
            className="mt-2 w-full rounded-lg border border-gold/20 px-4 py-2.5 outline-none focus:border-gold focus:ring-2 focus:ring-gold/20"
          />
        </div>

        <div className="lg:col-span-2">
          <label htmlFor="event-location" className="block text-sm font-medium text-foreground">
            Local
          </label>
          <input
            id="event-location"
            name="location"
            defaultValue={event?.location ?? ""}
            className="mt-2 w-full rounded-lg border border-gold/20 px-4 py-2.5 outline-none focus:border-gold focus:ring-2 focus:ring-gold/20"
          />
        </div>

        <div className="lg:col-span-2">
          <label htmlFor="event-description" className="block text-sm font-medium text-foreground">
            Descrição
          </label>
          <textarea
            id="event-description"
            name="description"
            rows={4}
            defaultValue={event?.description ?? ""}
            className="mt-2 w-full rounded-lg border border-gold/20 px-4 py-2.5 outline-none focus:border-gold focus:ring-2 focus:ring-gold/20"
          />
        </div>

        <div className="lg:col-span-2">
          <label htmlFor="event-image" className="block text-sm font-medium text-foreground">
            Imagem de divulgação
          </label>
          <input
            id="event-image"
            name="image"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="mt-2 block w-full text-sm text-muted file:mr-4 file:rounded-full file:border-0 file:bg-royal-blue file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white"
          />
          {event?.image_url ? (
            <p className="mt-2 text-xs text-muted">
              Imagem atual mantida se nenhum arquivo novo for enviado.
            </p>
          ) : null}
        </div>

        <div className="flex flex-col gap-3 lg:col-span-2 sm:flex-row">
          <label className="inline-flex items-center gap-2 text-sm text-foreground">
            <input
              type="checkbox"
              name="registration_open"
              defaultChecked={event?.registration_open ?? true}
              className="rounded border-gold/30 text-royal-blue focus:ring-gold/30"
            />
            Inscrições abertas
          </label>
          <label className="inline-flex items-center gap-2 text-sm text-foreground">
            <input
              type="checkbox"
              name="is_published"
              defaultChecked={event?.is_published ?? false}
              className="rounded border-gold/30 text-royal-blue focus:ring-gold/30"
            />
            Publicar evento
          </label>
        </div>
      </div>

      <div className="mt-8 border-t border-gold/10 pt-8">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h3 className="section-title text-lg font-semibold text-royal-blue">
              Planos de inscrição
            </h3>
            <p className="text-sm text-muted">
              Defina hospedagem, kit e valores de cada opção.
            </p>
          </div>
          <button
            type="button"
            onClick={addPlan}
            className="rounded-full border border-gold/30 px-4 py-2 text-sm font-semibold text-royal-blue hover:bg-gold/10"
          >
            + Plano
          </button>
        </div>

        <div className="space-y-4">
          {plans.map((plan, index) => (
            <div
              key={plan.key}
              className="rounded-xl border border-gold/15 bg-royal-blue/5 p-4"
            >
              <div className="mb-3 flex items-center justify-between gap-2">
                <p className="text-sm font-semibold text-royal-blue">
                  Plano {index + 1}
                </p>
                {plans.length > 1 ? (
                  <button
                    type="button"
                    onClick={() => removePlan(plan.key)}
                    className="text-xs font-semibold text-crimson hover:underline"
                  >
                    Remover
                  </button>
                ) : null}
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-xs font-medium text-foreground">
                    Nome do plano
                  </label>
                  <input
                    value={plan.name}
                    onChange={(event) =>
                      updatePlan(plan.key, { name: event.target.value })
                    }
                    placeholder="Ex.: Com hospedagem"
                    className="mt-1 w-full rounded-lg border border-gold/20 bg-white px-3 py-2 text-sm outline-none focus:border-gold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-foreground">
                    Valor (R$)
                  </label>
                  <input
                    value={plan.price}
                    onChange={(event) =>
                      updatePlan(plan.key, { price: event.target.value })
                    }
                    placeholder="0,00"
                    className="mt-1 w-full rounded-lg border border-gold/20 bg-white px-3 py-2 text-sm outline-none focus:border-gold"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-foreground">
                    Descrição
                  </label>
                  <input
                    value={plan.description}
                    onChange={(event) =>
                      updatePlan(plan.key, { description: event.target.value })
                    }
                    placeholder="Detalhes do que está incluso"
                    className="mt-1 w-full rounded-lg border border-gold/20 bg-white px-3 py-2 text-sm outline-none focus:border-gold"
                  />
                </div>
                <label className="inline-flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={plan.includesAccommodation}
                    onChange={(event) =>
                      updatePlan(plan.key, {
                        includesAccommodation: event.target.checked,
                      })
                    }
                    className="rounded border-gold/30 text-royal-blue"
                  />
                  Inclui hospedagem
                </label>
                <label className="inline-flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={plan.includesKit}
                    onChange={(event) =>
                      updatePlan(plan.key, { includesKit: event.target.checked })
                    }
                    className="rounded border-gold/30 text-royal-blue"
                  />
                  Inclui kit / camiseta
                </label>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-4 border-t border-gold/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
        {message ? (
          <p
            className={`rounded-xl px-4 py-2.5 text-sm ${
              message.type === "success"
                ? "bg-green-50 text-green-800"
                : "bg-red-50 text-crimson"
            }`}
          >
            {message.text}
          </p>
        ) : (
          <p className="text-xs text-muted">
            Membros aprovados poderão se inscrever e pagar via PIX.
          </p>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="inline-flex shrink-0 items-center justify-center rounded-full bg-royal-blue px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-royal-blue-light disabled:opacity-60"
        >
          {isPending ? "Salvando..." : isEditing ? "Salvar evento" : "Criar evento"}
        </button>
      </div>
    </form>
  );
}
