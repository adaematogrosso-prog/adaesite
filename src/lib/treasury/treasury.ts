import { createClient } from "@/lib/supabase/server";
import type {
  TreasuryPixSettings,
  TreasuryReceipt,
  TreasuryTransaction,
  TreasuryTransactionWithReceipts,
} from "@/types/database";

export type TreasuryFilters = {
  date?: string;
  month?: number;
  year?: number;
};

export type TreasurySummary = {
  balanceCents: number;
  incomeCents: number;
  expenseCents: number;
  transactionCount: number;
};

function applyTransactionFilters<
  T extends { gte: (col: string, val: string) => T; lte: (col: string, val: string) => T },
>(query: T, filters?: TreasuryFilters) {
  if (filters?.date) {
    return query.gte("transaction_date", filters.date).lte("transaction_date", filters.date);
  }

  if (filters?.month && filters?.year) {
    const month = filters.month.toString().padStart(2, "0");
    const start = `${filters.year}-${month}-01`;
    const lastDay = new Date(filters.year, filters.month, 0).getDate();
    const end = `${filters.year}-${month}-${lastDay.toString().padStart(2, "0")}`;
    return query.gte("transaction_date", start).lte("transaction_date", end);
  }

  if (filters?.year) {
    return query
      .gte("transaction_date", `${filters.year}-01-01`)
      .lte("transaction_date", `${filters.year}-12-31`);
  }

  return query;
}

export async function getTreasuryPixSettings(): Promise<TreasuryPixSettings | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("adae_treasury_pix_settings")
    .select("*")
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return (data as TreasuryPixSettings | null) ?? null;
}

export async function getTreasuryTransactions(
  filters?: TreasuryFilters,
): Promise<TreasuryTransactionWithReceipts[]> {
  const supabase = await createClient();

  let query = supabase
    .from("adae_treasury_transactions")
    .select("*")
    .order("transaction_date", { ascending: false })
    .order("created_at", { ascending: false });

  query = applyTransactionFilters(query, filters);

  const { data: transactions } = await query;
  const typedTransactions = (transactions ?? []) as TreasuryTransaction[];

  if (typedTransactions.length === 0) {
    return [];
  }

  const transactionIds = typedTransactions.map((item) => item.id);
  const creatorIds = [
    ...new Set(
      typedTransactions
        .map((item) => item.created_by)
        .filter((value): value is string => !!value),
    ),
  ];

  const [{ data: receipts }, { data: profiles }] = await Promise.all([
    supabase
      .from("adae_treasury_receipts")
      .select("*")
      .in("transaction_id", transactionIds)
      .order("created_at", { ascending: true }),
    creatorIds.length
      ? supabase
          .from("adae_member_profiles")
          .select("user_id, full_name")
          .in("user_id", creatorIds)
      : Promise.resolve({ data: [] }),
  ]);

  const receiptsByTransaction = new Map<string, TreasuryReceipt[]>();
  for (const receipt of (receipts ?? []) as TreasuryReceipt[]) {
    const current = receiptsByTransaction.get(receipt.transaction_id) ?? [];
    current.push(receipt);
    receiptsByTransaction.set(receipt.transaction_id, current);
  }

  const namesByUserId = new Map<string, string>();
  for (const profile of profiles ?? []) {
    namesByUserId.set(profile.user_id, profile.full_name);
  }

  return typedTransactions.map((transaction) => ({
    ...transaction,
    receipts: receiptsByTransaction.get(transaction.id) ?? [],
    creator_name: transaction.created_by
      ? namesByUserId.get(transaction.created_by) ?? null
      : null,
  }));
}

export async function getTreasurySummary(
  filters?: TreasuryFilters,
): Promise<TreasurySummary> {
  const transactions = await getTreasuryTransactions(filters);

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

export function parseTreasuryFilters(searchParams: {
  date?: string;
  month?: string;
  year?: string;
}): TreasuryFilters {
  const filters: TreasuryFilters = {};

  if (searchParams.date?.match(/^\d{4}-\d{2}-\d{2}$/)) {
    filters.date = searchParams.date;
    return filters;
  }

  const year = Number(searchParams.year);
  const month = Number(searchParams.month);

  if (Number.isInteger(year) && year >= 2000 && year <= 2100) {
    filters.year = year;
  }

  if (
    Number.isInteger(month) &&
    month >= 1 &&
    month <= 12 &&
    filters.year
  ) {
    filters.month = month;
  }

  return filters;
}
