/* eslint-disable @typescript-eslint/no-explicit-any */
import prisma from "@/lib/prisma";
import { AlertTriangle } from "lucide-react";
import { TransactionsList } from "./TransactionsList";

export default async function TransactionsTable({
  dateLimit,
}: {
  dateLimit?: Date;
}) {
  let orders: any[] = [];
  let expenditures: any[] = [];
  let transactions: any[] = [];
  let dbError = false;

  try {
    [orders, expenditures] = await Promise.all([
      prisma.order.findMany({
        where: dateLimit ? { createdAt: { gte: dateLimit } } : undefined,
        include: { items: { include: { product: true } }, customer: true },
        orderBy: { createdAt: "desc" },
        take: dateLimit ? undefined : 1500, // Cap 'All Time' so browser doesn't freeze
      }),
      prisma.expenditure.findMany({
        where: dateLimit ? { createdAt: { gte: dateLimit } } : undefined,
        orderBy: { createdAt: "desc" },
        take: dateLimit ? undefined : 1500, // Cap 'All Time'
      }),
    ]);

    // Merge and sort chronological transactions (both incoming orders and outgoing expenditures)
    transactions = [
      ...orders.map((o) => ({ ...o, type: "order" as const })),
      ...expenditures.map((e) => ({ ...e, type: "expenditure" as const })),
    ].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  } catch (error) {
    console.error("TransactionsTable DB Error:", error);
    dbError = true;
  }

  if (dbError) {
    return (
      <div className="mt-8 p-6 glass border border-red-500/50 bg-red-500/10  relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1 h-full bg-red-500" />
        <h2 className="text-xl font-bold tracking-tight text-white mb-2 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-red-500" /> Database Connection
          Error
        </h2>
        <p className="text-sm text-red-200 leading-relaxed max-w-3xl">
          The server failed to fetch transactions. Ensure database connections
          are working.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-8 animate-in fade-in duration-500">
      <h3 className="text-lg font-bold text-white mb-4">Recent Transactions</h3>
      <TransactionsList transactions={transactions} />
    </div>
  );
}
