"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import QRCode from "qrcode";
import { updateTreasuryPixSettings } from "@/actions/treasury";
import { createPixPayload } from "@/lib/treasury/pix-payload";
import type { TreasuryPixKeyType, TreasuryPixSettings } from "@/types/database";

const PIX_KEY_TYPES: { value: TreasuryPixKeyType; label: string }[] = [
  { value: "random", label: "Chave aleatória" },
  { value: "cpf", label: "CPF" },
  { value: "cnpj", label: "CNPJ" },
  { value: "email", label: "E-mail" },
  { value: "phone", label: "Telefone" },
];

type Props = {
  settings: TreasuryPixSettings | null;
  canManagePix: boolean;
  onSaved?: () => void;
};

export function TreasuryPixPanel({ settings, canManagePix, onSaved }: Props) {
  const router = useRouter();
  const [pixKey, setPixKey] = useState(settings?.pix_key ?? "");
  const [pixKeyType, setPixKeyType] = useState<TreasuryPixKeyType>(
    settings?.pix_key_type ?? "random",
  );
  const [holderName, setHolderName] = useState(settings?.holder_name ?? "");
  const [holderCity, setHolderCity] = useState(settings?.holder_city ?? "");
  const [bankLabel, setBankLabel] = useState(settings?.bank_label ?? "");
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [copyCode, setCopyCode] = useState("");
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [isPending, startTransition] = useTransition();

  const activeSettings =
    settings ??
    (pixKey && holderName && holderCity
      ? {
          pix_key: pixKey,
          pix_key_type: pixKeyType,
          holder_name: holderName,
          holder_city: holderCity,
          bank_label: bankLabel || null,
        }
      : null);

  useEffect(() => {
    async function generateQrCode() {
      if (!activeSettings?.pix_key || !activeSettings.holder_name || !activeSettings.holder_city) {
        setQrCodeUrl(null);
        setCopyCode("");
        return;
      }

      const payload = createPixPayload({
        key: activeSettings.pix_key,
        name: activeSettings.holder_name,
        city: activeSettings.holder_city,
      });

      setCopyCode(payload);
      const dataUrl = await QRCode.toDataURL(payload, {
        width: 220,
        margin: 1,
      });
      setQrCodeUrl(dataUrl);
    }

    void generateQrCode();
  }, [
    activeSettings?.pix_key,
    activeSettings?.holder_name,
    activeSettings?.holder_city,
  ]);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isPending) return;
    setMessage(null);

    const formData = new FormData(event.currentTarget);
    startTransition(async () => {
      const result = await updateTreasuryPixSettings(formData);
      setMessage(
        result.error
          ? { type: "error", text: result.error }
          : { type: "success", text: "Chave PIX atualizada com sucesso." },
      );
      if (!result.error) {
        router.refresh();
        onSaved?.();
      }
    });
  }

  async function handleCopyPix() {
    if (!copyCode) return;
    await navigator.clipboard.writeText(copyCode);
    setMessage({ type: "success", text: "Código PIX copiado." });
  }

  return (
    <section className="rounded-2xl border border-gold/20 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-xl">
          <h2 className="section-title text-xl font-semibold text-royal-blue">
            PIX da tesouraria
          </h2>
          <p className="mt-1 text-sm text-muted">
            Chave PIX para pagamentos à ADAE-MT. Somente o presidente e o admin
            podem alterar.
          </p>

          {canManagePix ? (
            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label
                    htmlFor="pix-key"
                    className="block text-sm font-medium text-foreground"
                  >
                    Chave PIX
                  </label>
                  <input
                    id="pix-key"
                    name="pixKey"
                    type="text"
                    required
                    value={pixKey}
                    onChange={(event) => setPixKey(event.target.value)}
                    className="mt-1 w-full rounded-lg border border-gold/20 px-4 py-2.5 outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/20"
                    placeholder="CPF, CNPJ, e-mail, telefone ou aleatória"
                  />
                </div>

                <div>
                  <label
                    htmlFor="pix-key-type"
                    className="block text-sm font-medium text-foreground"
                  >
                    Tipo da chave
                  </label>
                  <select
                    id="pix-key-type"
                    name="pixKeyType"
                    value={pixKeyType}
                    onChange={(event) =>
                      setPixKeyType(event.target.value as TreasuryPixKeyType)
                    }
                    className="mt-1 w-full rounded-lg border border-gold/20 px-4 py-2.5 outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/20"
                  >
                    {PIX_KEY_TYPES.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="bank-label"
                    className="block text-sm font-medium text-foreground"
                  >
                    Banco / conta (opcional)
                  </label>
                  <input
                    id="bank-label"
                    name="bankLabel"
                    type="text"
                    value={bankLabel}
                    onChange={(event) => setBankLabel(event.target.value)}
                    className="mt-1 w-full rounded-lg border border-gold/20 px-4 py-2.5 outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/20"
                    placeholder="Ex.: Banco do Brasil, CC"
                  />
                </div>

                <div>
                  <label
                    htmlFor="holder-name"
                    className="block text-sm font-medium text-foreground"
                  >
                    Nome do recebedor
                  </label>
                  <input
                    id="holder-name"
                    name="holderName"
                    type="text"
                    required
                    maxLength={25}
                    value={holderName}
                    onChange={(event) => setHolderName(event.target.value)}
                    className="mt-1 w-full rounded-lg border border-gold/20 px-4 py-2.5 outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/20"
                    placeholder="ADAE-MT"
                  />
                </div>

                <div>
                  <label
                    htmlFor="holder-city"
                    className="block text-sm font-medium text-foreground"
                  >
                    Cidade
                  </label>
                  <input
                    id="holder-city"
                    name="holderCity"
                    type="text"
                    required
                    maxLength={15}
                    value={holderCity}
                    onChange={(event) => setHolderCity(event.target.value)}
                    className="mt-1 w-full rounded-lg border border-gold/20 px-4 py-2.5 outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/20"
                    placeholder="CUIABA"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isPending}
                className="rounded-full bg-royal-blue px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-royal-blue-light disabled:opacity-60"
              >
                {isPending ? "Salvando..." : "Salvar chave PIX"}
              </button>
            </form>
          ) : settings ? (
            <div className="mt-5 space-y-2 text-sm">
              <p>
                <span className="text-muted">Chave:</span>{" "}
                <strong>{settings.pix_key}</strong>
              </p>
              {settings.bank_label ? (
                <p>
                  <span className="text-muted">Conta:</span>{" "}
                  {settings.bank_label}
                </p>
              ) : null}
              <p>
                <span className="text-muted">Recebedor:</span>{" "}
                {settings.holder_name}, {settings.holder_city}
              </p>
            </div>
          ) : (
            <p className="mt-5 text-sm text-muted">
              Nenhuma chave PIX cadastrada ainda.
            </p>
          )}

          {message ? (
            <p
              className={`mt-4 rounded-xl px-4 py-2.5 text-sm ${
                message.type === "success"
                  ? "bg-green-50 text-green-800"
                  : "bg-red-50 text-crimson"
              }`}
            >
              {message.text}
            </p>
          ) : null}
        </div>

        <div className="flex w-full max-w-xs flex-col items-center rounded-2xl border border-gold/20 bg-royal-blue/5 p-5 lg:w-auto">
          {qrCodeUrl ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={qrCodeUrl}
                alt="QR Code PIX"
                className="rounded-xl bg-white p-3 shadow-sm"
              />
              <button
                type="button"
                onClick={handleCopyPix}
                className="mt-4 rounded-full border border-gold/30 px-4 py-2 text-xs font-semibold text-royal-blue transition hover:bg-gold/10"
              >
                Copiar PIX copia e cola
              </button>
            </>
          ) : (
            <div className="flex h-52 w-52 items-center justify-center text-center text-sm text-muted">
              Cadastre a chave PIX para gerar o QR Code.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
