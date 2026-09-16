"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { createPixPayload } from "@/lib/treasury/pix-payload";
import { formatCurrencyFromCents } from "@/lib/treasury/money";
import type {
  EventRegistrationWithItems,
  SecretariaEvent,
  TreasuryPixSettings,
} from "@/types/database";

type Props = {
  event: SecretariaEvent;
  registration: EventRegistrationWithItems;
  pixSettings: TreasuryPixSettings | null;
};

const STATUS_LABELS = {
  pending_payment: "Aguardando pagamento",
  paid: "Pagamento confirmado",
  cancelled: "Cancelada",
} as const;

export function EventRegistrationPayment({
  event,
  registration,
  pixSettings,
}: Props) {
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [copyCode, setCopyCode] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function generateQrCode() {
      if (
        registration.status !== "pending_payment" ||
        !pixSettings?.pix_key ||
        !pixSettings.holder_name ||
        !pixSettings.holder_city
      ) {
        setQrCodeUrl(null);
        setCopyCode("");
        return;
      }

      const amount = registration.total_amount_cents / 100;
      const payload = createPixPayload({
        key: pixSettings.pix_key,
        name: pixSettings.holder_name,
        city: pixSettings.holder_city,
        amount,
        txid: registration.pix_reference.slice(0, 25),
      });

      setCopyCode(payload);
      const dataUrl = await QRCode.toDataURL(payload, {
        width: 240,
        margin: 1,
      });
      setQrCodeUrl(dataUrl);
    }

    void generateQrCode();
  }, [pixSettings, registration]);

  async function handleCopy() {
    if (!copyCode) return;
    await navigator.clipboard.writeText(copyCode);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-gold/20 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-gold">
          {STATUS_LABELS[registration.status]}
        </p>
        <h1 className="section-title mt-2 text-2xl font-bold text-royal-blue">
          Inscrição — {event.title}
        </h1>
        <p className="mt-2 text-sm text-muted">
          Referência PIX: <strong>{registration.pix_reference}</strong>
        </p>
      </div>

      <div className="rounded-2xl border border-gold/20 bg-white p-6 shadow-sm">
        <h2 className="section-title text-lg font-semibold text-royal-blue">
          Resumo da inscrição
        </h2>
        <ul className="mt-4 space-y-2 text-sm text-foreground">
          {registration.items.map((item) => (
            <li
              key={item.id}
              className="flex items-center justify-between gap-3 border-b border-gold/10 pb-2"
            >
              <span>
                {item.quantity}x {item.plan_name}
              </span>
              <span className="font-semibold">
                {formatCurrencyFromCents(item.line_total_cents)}
              </span>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-right text-lg font-bold text-royal-blue">
          Total: {formatCurrencyFromCents(registration.total_amount_cents)}
        </p>
      </div>

      <div className="rounded-2xl border border-gold/20 bg-white p-6 shadow-sm">
        <h2 className="section-title text-lg font-semibold text-royal-blue">
          Dados informados
        </h2>
        <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
          <Info label="Nome" value={registration.full_name} />
          <Info label="CPF" value={registration.cpf} />
          <Info label="ID Demolay" value={registration.member_id} />
          <Info label="Telefone" value={registration.phone} />
          <Info label="E-mail" value={registration.email} />
          {registration.t_shirt_size ? (
            <Info label="Camiseta" value={registration.t_shirt_size} />
          ) : null}
        </dl>
      </div>

      {registration.status === "pending_payment" ? (
        <div className="rounded-2xl border border-gold/20 bg-white p-6 shadow-sm">
          <h2 className="section-title text-lg font-semibold text-royal-blue">
            Pagamento via PIX
          </h2>

          {!pixSettings ? (
            <p className="mt-3 text-sm text-crimson">
              O PIX da tesouraria ainda não está configurado. Entre em contato com
              a secretaria.
            </p>
          ) : (
            <>
              <p className="mt-2 text-sm text-muted">
                Escaneie o QR Code ou copie o código PIX com o valor exato da
                inscrição. Após o pagamento, a secretaria confirmará sua vaga.
              </p>

              <div className="mt-6 flex flex-col items-center gap-4 sm:flex-row sm:items-start">
                {qrCodeUrl ? (
                  <img
                    src={qrCodeUrl}
                    alt="QR Code PIX"
                    className="rounded-xl border border-gold/20 p-2"
                    width={240}
                    height={240}
                  />
                ) : null}

                <div className="w-full flex-1 space-y-3">
                  <p className="text-sm text-foreground">
                    <span className="font-semibold">Valor:</span>{" "}
                    {formatCurrencyFromCents(registration.total_amount_cents)}
                  </p>
                  <p className="text-sm text-foreground">
                    <span className="font-semibold">Chave PIX:</span>{" "}
                    {pixSettings.pix_key}
                  </p>
                  {pixSettings.bank_label ? (
                    <p className="text-sm text-muted">{pixSettings.bank_label}</p>
                  ) : null}

                  <button
                    type="button"
                    onClick={handleCopy}
                    className="inline-flex items-center justify-center rounded-full border border-gold/30 px-4 py-2 text-sm font-semibold text-royal-blue transition hover:bg-gold/10"
                  >
                    {copied ? "Código copiado!" : "Copiar código PIX"}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      ) : null}
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wide text-muted">
        {label}
      </dt>
      <dd className="mt-0.5 text-foreground">{value}</dd>
    </div>
  );
}
