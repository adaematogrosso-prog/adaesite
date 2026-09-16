"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { createEventRegistration } from "@/actions/secretaria-events";
import { formatCurrencyFromCents } from "@/lib/treasury/money";
import type { EventPlan, MemberProfile, SecretariaEventWithPlans } from "@/types/database";

const SHIRT_SIZES = ["PP", "P", "M", "G", "GG", "XG"];

type Props = {
  event: SecretariaEventWithPlans;
  profile: MemberProfile;
};

type SelectionState = Record<string, number>;

export function EventRegistrationForm({ event, profile }: Props) {
  const router = useRouter();
  const [selections, setSelections] = useState<SelectionState>(() =>
    Object.fromEntries(event.plans.map((plan) => [plan.id, 0])),
  );
  const [fullName, setFullName] = useState(profile.full_name);
  const [cpf, setCpf] = useState("");
  const [memberId, setMemberId] = useState(profile.member_id);
  const [phone, setPhone] = useState(profile.phone ?? "");
  const [email, setEmail] = useState(profile.email);
  const [tShirtSize, setTShirtSize] = useState("");
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [isPending, startTransition] = useTransition();

  const requiresKit = useMemo(
    () =>
      event.plans.some(
        (plan) => plan.includes_kit && (selections[plan.id] ?? 0) > 0,
      ),
    [event.plans, selections],
  );

  const totalCents = useMemo(() => {
    return event.plans.reduce((sum, plan) => {
      const quantity = selections[plan.id] ?? 0;
      return sum + plan.price_cents * quantity;
    }, 0);
  }, [event.plans, selections]);

  function updateQuantity(planId: string, quantity: number) {
    setSelections((current) => ({
      ...current,
      [planId]: Math.max(0, Math.min(20, quantity)),
    }));
  }

  function handleSubmit(formEvent: React.FormEvent<HTMLFormElement>) {
    formEvent.preventDefault();
    if (isPending) return;
    setMessage(null);

    const payload = event.plans
      .map((plan) => ({
        planId: plan.id,
        quantity: selections[plan.id] ?? 0,
      }))
      .filter((item) => item.quantity > 0);

    const formData = new FormData(formEvent.currentTarget);
    formData.set("selections_json", JSON.stringify(payload));

    startTransition(async () => {
      const result = await createEventRegistration(event.id, formData);

      if (result.error) {
        setMessage({ type: "error", text: result.error });
        return;
      }

      if (result.registrationId) {
        router.push(
          `/secretaria/eventos/${event.id}/inscricao/${result.registrationId}`,
        );
      }
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-gold/20 bg-white p-6 shadow-sm"
    >
      <div className="mb-8">
        <h2 className="section-title text-xl font-semibold text-royal-blue">
          Planos disponíveis
        </h2>
        <p className="mt-1 text-sm text-muted">
          Selecione a quantidade de cada plano desejado.
        </p>

        <div className="mt-4 space-y-3">
          {event.plans.map((plan) => (
            <PlanRow
              key={plan.id}
              plan={plan}
              quantity={selections[plan.id] ?? 0}
              onChange={(quantity) => updateQuantity(plan.id, quantity)}
            />
          ))}
        </div>

        <p className="mt-4 text-right text-lg font-semibold text-royal-blue">
          Total: {formatCurrencyFromCents(totalCents)}
        </p>
      </div>

      <div className="border-t border-gold/10 pt-8">
        <h2 className="section-title text-xl font-semibold text-royal-blue">
          Seus dados
        </h2>
        <p className="mt-1 text-sm text-muted">
          Confira ou atualize as informações antes de pagar.
        </p>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <Field label="Nome completo" id="full_name">
            <input
              id="full_name"
              name="full_name"
              required
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              className="mt-2 w-full rounded-lg border border-gold/20 px-4 py-2.5 outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/20"
            />
          </Field>

          <Field label="CPF" id="cpf">
            <input
              id="cpf"
              name="cpf"
              required
              value={cpf}
              onChange={(event) => setCpf(event.target.value)}
              placeholder="000.000.000-00"
              className="mt-2 w-full rounded-lg border border-gold/20 px-4 py-2.5 outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/20"
            />
          </Field>

          <Field label="ID Demolay" id="member_id">
            <input
              id="member_id"
              name="member_id"
              required
              value={memberId}
              onChange={(event) => setMemberId(event.target.value)}
              className="mt-2 w-full rounded-lg border border-gold/20 px-4 py-2.5 outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/20"
            />
          </Field>

          <Field label="Telefone" id="phone">
            <input
              id="phone"
              name="phone"
              required
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              className="mt-2 w-full rounded-lg border border-gold/20 px-4 py-2.5 outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/20"
            />
          </Field>

          <Field label="E-mail" id="email" className="md:col-span-2">
            <input
              id="email"
              name="email"
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="mt-2 w-full rounded-lg border border-gold/20 px-4 py-2.5 outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/20"
            />
          </Field>

          {requiresKit ? (
            <Field label="Tamanho da camiseta" id="t_shirt_size">
              <select
                id="t_shirt_size"
                name="t_shirt_size"
                required
                value={tShirtSize}
                onChange={(event) => setTShirtSize(event.target.value)}
                className="mt-2 w-full rounded-lg border border-gold/20 px-4 py-2.5 outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/20"
              >
                <option value="">Selecione</option>
                {SHIRT_SIZES.map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </Field>
          ) : null}
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
            Após confirmar, você verá o PIX para pagamento.
          </p>
        )}

        <button
          type="submit"
          disabled={isPending || totalCents <= 0}
          className="inline-flex shrink-0 items-center justify-center rounded-full bg-royal-blue px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-royal-blue-light disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? "Processando..." : "Continuar para pagamento"}
        </button>
      </div>
    </form>
  );
}

function PlanRow({
  plan,
  quantity,
  onChange,
}: {
  plan: EventPlan;
  quantity: number;
  onChange: (quantity: number) => void;
}) {
  return (
    <div className="rounded-xl border border-gold/15 bg-royal-blue/5 p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-semibold text-royal-blue">{plan.name}</p>
          {plan.description ? (
            <p className="mt-1 text-sm text-muted">{plan.description}</p>
          ) : null}
          <div className="mt-2 flex flex-wrap gap-2 text-[11px] font-semibold uppercase tracking-wide text-muted">
            {plan.includes_accommodation ? (
              <span className="rounded-full border border-gold/20 px-2 py-0.5">
                Hospedagem
              </span>
            ) : null}
            {plan.includes_kit ? (
              <span className="rounded-full border border-gold/20 px-2 py-0.5">
                Kit / camiseta
              </span>
            ) : null}
          </div>
          <p className="mt-2 text-sm font-semibold text-royal-blue">
            {formatCurrencyFromCents(plan.price_cents)}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onChange(quantity - 1)}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-gold/30 text-lg font-semibold text-royal-blue"
          >
            −
          </button>
          <span className="min-w-[2rem] text-center text-sm font-semibold">
            {quantity}
          </span>
          <button
            type="button"
            onClick={() => onChange(quantity + 1)}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-gold/30 text-lg font-semibold text-royal-blue"
          >
            +
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  id,
  children,
  className = "",
}: {
  label: string;
  id: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <label htmlFor={id} className="block text-sm font-medium text-foreground">
        {label}
      </label>
      {children}
    </div>
  );
}
