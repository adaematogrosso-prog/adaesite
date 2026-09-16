"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import { createTreasuryTransaction } from "@/actions/treasury";

export function TreasuryTransactionForm({
  onSuccess,
}: {
  onSuccess?: () => void;
}) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleFilesChange(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    setSelectedFiles(files);
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isPending) return;
    setMessage(null);

    const formData = new FormData(event.currentTarget);
    for (const file of selectedFiles) {
      formData.append("receipts", file);
    }

    startTransition(async () => {
      const result = await createTreasuryTransaction(formData);
      if (result.error) {
        setMessage({ type: "error", text: result.error });
        return;
      }

      formRef.current?.reset();
      setSelectedFiles([]);
      setMessage({ type: "success", text: "Lançamento registrado com sucesso." });
      router.refresh();
      onSuccess?.();
    });
  }

  return (
    <section className="rounded-2xl border border-gold/20 bg-white p-6 shadow-sm">
      <h2 className="section-title text-xl font-semibold text-royal-blue">
        Novo lançamento
      </h2>
      <p className="mt-1 text-sm text-muted">
        Registre entradas ou saídas do caixa e anexe um ou mais comprovantes.
      </p>

      <form ref={formRef} onSubmit={handleSubmit} className="mt-5 space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="transaction-type"
              className="block text-sm font-medium text-foreground"
            >
              Tipo
            </label>
            <select
              id="transaction-type"
              name="transactionType"
              required
              defaultValue="income"
              className="mt-1 w-full rounded-lg border border-gold/20 px-4 py-2.5 outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/20"
            >
              <option value="income">Entrada</option>
              <option value="expense">Saída</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="transaction-date"
              className="block text-sm font-medium text-foreground"
            >
              Data
            </label>
            <input
              id="transaction-date"
              name="transactionDate"
              type="date"
              required
              defaultValue={new Date().toISOString().slice(0, 10)}
              className="mt-1 w-full rounded-lg border border-gold/20 px-4 py-2.5 outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/20"
            />
          </div>

          <div>
            <label
              htmlFor="transaction-amount"
              className="block text-sm font-medium text-foreground"
            >
              Valor (R$)
            </label>
            <input
              id="transaction-amount"
              name="amount"
              type="text"
              required
              inputMode="decimal"
              placeholder="0,00"
              className="mt-1 w-full rounded-lg border border-gold/20 px-4 py-2.5 outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/20"
            />
          </div>

          <div className="sm:col-span-2">
            <label
              htmlFor="transaction-description"
              className="block text-sm font-medium text-foreground"
            >
              Descrição
            </label>
            <input
              id="transaction-description"
              name="description"
              type="text"
              required
              placeholder="Ex.: Mensalidade, pagamento de fornecedor..."
              className="mt-1 w-full rounded-lg border border-gold/20 px-4 py-2.5 outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/20"
            />
          </div>

          <div className="sm:col-span-2">
            <label
              htmlFor="transaction-receipts"
              className="block text-sm font-medium text-foreground"
            >
              Comprovantes
            </label>
            <input
              id="transaction-receipts"
              type="file"
              multiple
              accept="application/pdf,image/jpeg,image/png,image/webp,image/gif"
              onChange={handleFilesChange}
              className="mt-2 block w-full text-sm text-muted file:mr-4 file:rounded-full file:border-0 file:bg-royal-blue file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-royal-blue-light"
            />
            {selectedFiles.length > 0 ? (
              <ul className="mt-2 space-y-1 text-xs text-muted">
                {selectedFiles.map((file) => (
                  <li key={`${file.name}-${file.lastModified}`}>{file.name}</li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-xs text-muted">
                PDF ou imagem · até 10 MB por arquivo · múltiplos arquivos
              </p>
            )}
          </div>
        </div>

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
        ) : null}

        <button
          type="submit"
          disabled={isPending}
          className="rounded-full bg-royal-blue px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-royal-blue-light disabled:opacity-60"
        >
          {isPending ? "Salvando..." : "Registrar lançamento"}
        </button>
      </form>
    </section>
  );
}
