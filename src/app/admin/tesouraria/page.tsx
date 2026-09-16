import { requireTesourariaAccess } from "@/lib/auth/admin";
import { canManageTreasuryPix } from "@/lib/auth/executive-access.server";
import {
  getTreasuryPixSettings,
  getTreasurySummary,
  getTreasuryTransactions,
} from "@/lib/treasury/treasury";
import { TreasuryDashboard } from "@/components/admin/treasury/TreasuryDashboard";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";

export default async function AdminTesourariaPage() {
  const access = await requireTesourariaAccess();
  const canManagePix =
    access.isAdmin || (await canManageTreasuryPix(access.user.id));

  const [pixSettings, transactions, currentSummary] = await Promise.all([
    getTreasuryPixSettings(),
    getTreasuryTransactions(),
    getTreasurySummary(),
  ]);

  return (
    <div>
      <AdminPageHeader
        title="Tesouraria Estadual"
        subtitle="Controle financeiro da ADAE-MT: chave PIX para pagamentos, lançamentos de entradas e saídas, comprovantes e extrato em PDF."
      />

      <TreasuryDashboard
        pixSettings={pixSettings}
        canManagePix={canManagePix}
        currentSummary={currentSummary}
        transactions={transactions}
      />
    </div>
  );
}
