"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { deleteTreasuryTransaction } from "@/actions/treasury";
import { formatCurrencyFromCents } from "@/lib/treasury/money";
import type { TreasurySummary } from "@/lib/treasury/treasury";
import type { TreasuryTransactionWithReceipts } from "@/types/database";

type Props = {
  transactions: TreasuryTransactionWithReceipts[];
};

type FilterMode = "all" | "date" | "month";

function formatDisplayDate(value: string) {
  const [year, month, day] = value.split("-");
  return `${day}/${month}/${year}`;
}

function summarize(transactions: TreasuryTransactionWithReceipts[]): TreasurySummary {
  let incomeCents = 0;
  let expenseCents = 0;

  for (const transaction of transactions) {
    if (transaction.transaction_type === "income") {
      incomeCents += transaction.amount_cents;
    } else {
      expenseCents += transaction.amount_cents;
    }
  }

  return {
    balanceCents: incomeCents - expenseCents,
    incomeCents,
    expenseCents,
    transactionCount: transactions.length,
  };
}

export function TreasuryHistoryPanel({ transactions }: Props) {
  const router = useRouter();
  const now = new Date();
  const [filterMode, setFilterMode] = useState<FilterMode>("all");
  const [specificDate, setSpecificDate] = useState("");
  const [month, setMonth] = useState(String(now.getMonth() + 1));
  const [year, setYear] = useState(String(now.getFullYear()));
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [isPending, startTransition] = useTransition();

  const filteredTransactions = useMemo(() => {
    if (filterMode === "date" && specificDate) {
      return transactions.filter(
        (transaction) => transaction.transaction_date === specificDate,
      );
    }

    if (filterMode === "month") {
      const monthNumber = Number(month);
      const yearNumber = Number(year);
      return transactions.filter((transaction) => {
        const [transactionYear, transactionMonth] =
          transaction.transaction_date.split("-");
        return (
          Number(transactionYear) === yearNumber &&
          Number(transactionMonth) === monthNumber
        );
      });
    }

    return transactions;
  }, [filterMode, month, specificDate, transactions, year]);

  const filteredSummary = useMemo(
    () => summarize(filteredTransactions),
    [filteredTransactions],
  );

  function buildExportUrl() {
    const params = new URLSearchParams();
    if (filterMode === "date" && specificDate) {
      params.set("date", specificDate);
    } else if (filterMode === "month") {
      params.set("month", month);
      params.set("year", year);
    }
    const query = params.toString();
    return query
      ? `/api/tesouraria/extrato?${query}`
      : "/api/tesouraria/extrato";
  }

  function handleDelete(id: string, description: string) {
    if (!window.confirm(`Excluir o lançamento "${description}"?`)) return;

    setMessage(null);
    startTransition(async () => {
      const result = await deleteTreasuryTransaction(id);
      setMessage(
        result.error
          ? { type: "error", text: result.error }
          : { type: "success", text: "Lançamento excluído." },
      );
      if (!result.error) {
        router.refresh();
      }
    });
  }

  return (
    <section className="rounded-2xl border border-gold/20 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="section-title text-xl font-semibold text-royal-blue">
            Histórico financeiro
          </h2>
          <p className="mt-1 text-sm text-muted">
            Consulte lançamentos, filtre por período e gere o extrato em PDF.
          </p>
        </div>

        <a
          href={buildExportUrl()}
          className="inline-flex items-center justify-center rounded-full border border-gold/30 px-4 py-2.5 text-sm font-semibold text-royal-blue transition hover:bg-gold/10"
        >
          Gerar extrato PDF
        </a>
      </div>

      <div className="mt-5 grid gap-3 rounded-xl border border-gold/10 bg-royal-blue/5 p-4 sm:grid-cols-3">
        <SummaryCard
          label="Saldo filtrado"
          value={formatCurrencyFromCents(filteredSummary.balanceCents)}
          highlight
        />
        <SummaryCard
          label="Entradas"
          value={formatCurrencyFromCents(filteredSummary.incomeCents)}
        />
        <SummaryCard
          label="Saídas"
          value={formatCurrencyFromCents(filteredSummary.expenseCents)}
        />
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-4">
        <div>
          <label
            htmlFor="filter-mode"
            className="block text-sm font-medium text-foreground"
          >
            Filtro
          </label>
          <select
            id="filter-mode"
            value={filterMode}
            onChange={(event) =>
              setFilterMode(event.target.value as FilterMode)
            }
            className="mt-1 w-full rounded-lg border border-gold/20 px-3 py-2.5 text-sm outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/20"
          >
            <option value="all">Todos</option>
            <option value="month">Mês e ano</option>
            <option value="date">Data específica</option>
          </select>
        </div>

        {filterMode === "date" ? (
          <div>
            <label
              htmlFor="filter-date"
              className="block text-sm font-medium text-foreground"
            >
              Data
            </label>
            <input
              id="filter-date"
              type="date"
              value={specificDate}
              onChange={(event) => setSpecificDate(event.target.value)}
              className="mt-1 w-full rounded-lg border border-gold/20 px-3 py-2.5 text-sm outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/20"
            />
          </div>
        ) : null}

        {filterMode === "month" || filterMode === "all" ? (
          <>
            <div>
              <label
                htmlFor="filter-month"
                className="block text-sm font-medium text-foreground"
              >
                Mês
              </label>
              <select
                id="filter-month"
                value={month}
                onChange={(event) => setMonth(event.target.value)}
                disabled={filterMode === "all"}
                className="mt-1 w-full rounded-lg border border-gold/20 px-3 py-2.5 text-sm outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/20 disabled:bg-muted/10"
              >
                {Array.from({ length: 12 }, (_, index) => {
                  const value = String(index + 1);
                  return (
                    <option key={value} value={value}>
                      {value.padStart(2, "0")}
                    </option>
                  );
                })}
              </select>
            </div>

            <div>
              <label
                htmlFor="filter-year"
                className="block text-sm font-medium text-foreground"
              >
                Ano
              </label>
              <input
                id="filter-year"
                type="number"
                min={2000}
                max={2100}
                value={year}
                onChange={(event) => setYear(event.target.value)}
                disabled={filterMode === "all"}
                className="mt-1 w-full rounded-lg border border-gold/20 px-3 py-2.5 text-sm outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/20 disabled:bg-muted/10"
              />
            </div>
          </>
        ) : null}
      </div>

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

      {filteredTransactions.length === 0 ? (
        <div className="mt-6 rounded-xl border border-dashed border-gold/30 p-8 text-center text-sm text-muted">
          Nenhum lançamento encontrado para o filtro selecionado.
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {filteredTransactions.map((transaction) => (
            <article
              key={transaction.id}
              className="rounded-xl border border-gold/15 p-4"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${
                        transaction.transaction_type === "income"
                          ? "bg-green-50 text-green-700"
                          : "bg-red-50 text-crimson"
                      }`}
                    >
                      {transaction.transaction_type === "income"
                        ? "Entrada"
                        : "Saída"}
                    </span>
                    <span className="text-xs text-muted">
                      {formatDisplayDate(transaction.transaction_date)}
                    </span>
                    {transaction.creator_name ? (
                      <span className="text-xs text-muted">
                        por {transaction.creator_name}
                      </span>
                    ) : null}
                  </div>

                  <p className="mt-2 font-medium text-foreground">
                    {transaction.description}
                  </p>

                  {transaction.receipts.length > 0 ? (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {transaction.receipts.map((receipt) => (
                        <a
                          key={receipt.id}
                          href={receipt.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rounded-full border border-gold/20 px-3 py-1 text-xs font-medium text-royal-blue transition hover:bg-gold/10"
                        >
                          {receipt.file_name}
                        </a>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-2 text-xs text-muted">
                      Sem comprovantes anexados.
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-3 sm:flex-col sm:items-end">
                  <p
                    className={`text-lg font-bold ${
                      transaction.transaction_type === "income"
                        ? "text-green-700"
                        : "text-crimson"
                    }`}
                  >
                    {transaction.transaction_type === "income" ? "+" : "-"}
                    {formatCurrencyFromCents(transaction.amount_cents)}
                  </p>
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={() =>
                      handleDelete(transaction.id, transaction.description)
                    }
                    className="text-xs font-semibold text-crimson transition hover:underline disabled:opacity-60"
                  >
                    Excluir
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

function SummaryCard({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-muted">
        {label}
      </p>
      <p
        className={`mt-1 text-lg font-bold ${
          highlight ? "text-royal-blue" : "text-foreground"
        }`}
      >
        {value}
      </p>
    </div>
  );
}
