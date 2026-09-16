"use client";

import { useState } from "react";
import { formatCurrencyFromCents } from "@/lib/treasury/money";
import type { TreasurySummary } from "@/lib/treasury/treasury";
import type {
  TreasuryPixSettings,
  TreasuryTransactionWithReceipts,
} from "@/types/database";
import { FormToggleButton } from "@/components/admin/FormToggleButton";
import { TreasuryHistoryPanel } from "@/components/admin/treasury/TreasuryHistoryPanel";
import { TreasuryPixPanel } from "@/components/admin/treasury/TreasuryPixPanel";
import { TreasuryTransactionForm } from "@/components/admin/treasury/TreasuryTransactionForm";

type Props = {
  pixSettings: TreasuryPixSettings | null;
  canManagePix: boolean;
  currentSummary: TreasurySummary;
  transactions: TreasuryTransactionWithReceipts[];
};

export function TreasuryDashboard({
  pixSettings,
  canManagePix,
  currentSummary,
  transactions,
}: Props) {
  const [pixOpen, setPixOpen] = useState(false);
  const [transactionOpen, setTransactionOpen] = useState(false);

  return (
    <div className="space-y-8">
      <section className="grid gap-4 sm:grid-cols-3">
        <BalanceCard
          label="Saldo atual do caixa"
          value={formatCurrencyFromCents(currentSummary.balanceCents)}
          highlight
        />
        <BalanceCard
          label="Total de entradas"
          value={formatCurrencyFromCents(currentSummary.incomeCents)}
        />
        <BalanceCard
          label="Total de saídas"
          value={formatCurrencyFromCents(currentSummary.expenseCents)}
        />
      </section>

      <div className="flex flex-wrap gap-3">
        <FormToggleButton
          label={canManagePix ? "Configurar PIX" : "Ver PIX / QR Code"}
          openLabel="Fechar PIX"
          isOpen={pixOpen}
          onToggle={() => setPixOpen((open) => !open)}
        />
        <FormToggleButton
          label="Novo lançamento"
          openLabel="Cancelar lançamento"
          isOpen={transactionOpen}
          onToggle={() => setTransactionOpen((open) => !open)}
          variant="secondary"
        />
      </div>

      {pixOpen ? (
        <TreasuryPixPanel
          settings={pixSettings}
          canManagePix={canManagePix}
          onSaved={() => setPixOpen(false)}
        />
      ) : null}

      {transactionOpen ? (
        <TreasuryTransactionForm onSuccess={() => setTransactionOpen(false)} />
      ) : null}

      <TreasuryHistoryPanel transactions={transactions} />
    </div>
  );
}

function BalanceCard({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-gold/20 bg-white p-5 shadow-sm">
      <p className="text-xs font-medium uppercase tracking-wide text-muted">
        {label}
      </p>
      <p
        className={`mt-2 text-2xl font-bold ${
          highlight ? "text-royal-blue" : "text-foreground"
        }`}
      >
        {value}
      </p>
    </div>
  );
}
