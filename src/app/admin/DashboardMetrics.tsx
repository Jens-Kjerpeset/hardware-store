import prisma from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";
import {
  DollarSign,
  TrendingUp,
  PackageSearch,
  Activity,
  AlertTriangle,
} from "lucide-react";
import Link from "next/link";

export default async function DashboardMetrics({
  dateLimit,
}: {
  dateLimit?: Date;
}) {
  let totalOrderSum: { _sum: { totalAmount: number | null } } = {
    _sum: { totalAmount: 0 },
  };
  let totalExtCostSum: { _sum: { amount: number | null } } = {
    _sum: { amount: 0 },
  };
  let orderItems: { quantity: number; costAtTime: number }[] = [];
  let dbError = false;

  try {
    [totalOrderSum, totalExtCostSum] = await Promise.all([
      prisma.order.aggregate({
        _sum: { totalAmount: true },
        where: dateLimit ? { createdAt: { gte: dateLimit } } : undefined,
      }),
      prisma.expenditure.aggregate({
        _sum: { amount: true },
        where: dateLimit ? { createdAt: { gte: dateLimit } } : undefined,
      }),
    ]);

    orderItems = await prisma.orderItem.findMany({
      where: dateLimit
        ? { order: { createdAt: { gte: dateLimit } } }
        : undefined,
      select: { quantity: true, costAtTime: true },
    });
  } catch (error) {
    console.error("DashboardMetrics DB Error:", error);
    dbError = true;
  }

  const totalRevenue = totalOrderSum._sum.totalAmount || 0;
  let totalCostOfGoods = 0;
  let totalUnitsSold = 0;

  orderItems.forEach((item) => {
    totalUnitsSold += item.quantity;
    totalCostOfGoods += item.costAtTime * item.quantity;
  });

  const totalOtherExpenses = totalExtCostSum._sum.amount || 0;
  const totalExpenses = totalCostOfGoods + totalOtherExpenses;
  const totalProfit = totalRevenue - totalExpenses;
  const profitMargin =
    totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;

  if (dbError) {
    return (
      <div className="p-6 glass border border-red-500/50 bg-red-500/10  relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1 h-full bg-red-500" />
        <h2 className="text-xl font-bold tracking-tight text-white mb-2 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-red-500" /> Database Connection
          Error
        </h2>
        <p className="text-sm text-red-200 leading-relaxed max-w-3xl">
          The server failed to connect to the database. If you deployed this to
          Vercel, please ensure that you have configured{" "}
          <strong>TURSO_DATABASE_URL</strong> and{" "}
          <strong>TURSO_AUTH_TOKEN</strong> in your Vercel Project Settings &gt;
          Environment Variables.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-in fade-in duration-500">
      {/* Revenue */}
      <Link
        href="/admin/analytics"
        className="glass p-6 flex flex-row items-center gap-4 bg-gradient-to-br from-dark-surface to-dark-bg border border-dark-border hover:border-brand-500/50 transition-colors group cursor-pointer block h-full box-border"
      >
        <div className="h-12 w-12 bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 shrink-0 float-left group-hover:bg-emerald-500/20 transition-colors">
          <DollarSign className="w-6 h-6 text-emerald-400" />
        </div>
        <div
          className="min-w-0 flex-1 float-left"
          style={{ containerType: "inline-size" }}
        >
          <p className="text-sm font-medium text-gray-400 group-hover:text-gray-300 transition-colors">
            Total Revenue
          </p>
          <p
            className="font-bold tracking-tight text-white mt-1.5 whitespace-nowrap font-mono"
            style={{
              fontSize: "clamp(0.875rem, 10cqi, 1.5rem)",
              lineHeight: "1.2",
            }}
          >
            {formatCurrency(totalRevenue)}
          </p>
        </div>
        <div className="clear-both" />
      </Link>

      {/* Expenses */}
      <Link
        href="/admin/analytics"
        className="glass p-6 flex items-center gap-4 bg-gradient-to-br from-dark-surface to-dark-bg border border-dark-border hover:border-brand-500/50 transition-colors group relative cursor-pointer block h-full box-border"
      >
        <div className="h-12 w-12 bg-rose-500/10 flex items-center justify-center border border-rose-500/20 shrink-0 float-left group-hover:bg-rose-500/20 transition-colors">
          <TrendingUp className="w-6 h-6 text-rose-400 rotate-180" />
        </div>
        <div
          className="min-w-0 flex-1 flex flex-col items-start gap-1 float-left"
          style={{ containerType: "inline-size" }}
        >
          <p className="text-sm font-medium text-gray-400 group-hover:text-gray-300 transition-colors">
            Total Expenses
          </p>
          <p
            className="font-bold tracking-tight text-white mt-0.5 whitespace-nowrap border-b border-dashed border-gray-600 font-mono"
            style={{
              fontSize: "clamp(0.875rem, 10cqi, 1.5rem)",
              lineHeight: "1.2",
            }}
          >
            {formatCurrency(totalExpenses)}
          </p>
          {/* Tooltip to explain expenses breakdown */}
          <div className="absolute top-full left-0 mt-2 p-3 bg-dark-surface border border-brand-500/30 shadow-soft text-xs text-gray-300 w-max z-50 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity">
            <p>
              <span className="font-bold text-gray-100">COGS:</span>{" "}
              <span className="font-mono">
                {formatCurrency(totalCostOfGoods)}
              </span>
            </p>
            <p>
              <span className="font-bold text-gray-100">Other:</span>{" "}
              <span className="font-mono">
                {formatCurrency(totalOtherExpenses)}
              </span>
            </p>
          </div>
        </div>
        <div className="clear-both" />
      </Link>

      {/* Profit */}
      <Link
        href="/admin/analytics"
        className="glass p-6 flex flex-col justify-center bg-gradient-to-br from-dark-surface to-dark-bg border border-dark-border hover:border-brand-500/50 transition-colors group cursor-pointer block h-full box-border"
      >
        <div className="flex items-center gap-4 w-full">
          <div className="h-12 w-12 bg-orange-500/10 flex items-center justify-center border border-orange-500/20 shrink-0 float-left group-hover:bg-orange-500/20 transition-colors">
            <Activity className="w-6 h-6 text-orange-400" />
          </div>
          <div
            className="min-w-0 flex-1 float-left"
            style={{ containerType: "inline-size" }}
          >
            <p className="text-sm font-medium text-gray-400 group-hover:text-gray-300 transition-colors">
              Net Profit
            </p>
            <div className="flex items-baseline gap-2 mt-1.5">
              <p
                className="font-bold tracking-tight text-white whitespace-nowrap font-mono"
                style={{
                  fontSize: "clamp(0.875rem, 10cqi, 1.5rem)",
                  lineHeight: "1.2",
                }}
              >
                {formatCurrency(totalProfit)}
              </p>
              <span
                className={`text-xs font-bold shrink-0 ${profitMargin >= 0 ? "text-gray-300" : "text-rose-400"}`}
              >
                {profitMargin > 0 && "+"}
                {profitMargin.toFixed(1)}%
              </span>
            </div>
          </div>
          <div className="clear-both" />
        </div>
      </Link>

      {/* Units Sold */}
      <Link
        href="/admin/analytics"
        className="glass p-6 flex flex-row items-center gap-4 bg-gradient-to-br from-dark-surface to-dark-bg border border-dark-border hover:border-brand-500/50 transition-colors group cursor-pointer block h-full box-border"
      >
        <div className="h-12 w-12 bg-purple-500/10 flex items-center justify-center border border-purple-500/20 shrink-0 float-left group-hover:bg-purple-500/20 transition-colors">
          <PackageSearch className="w-6 h-6 text-purple-400" />
        </div>
        <div className="min-w-0 float-left">
          <p className="text-sm font-medium text-gray-400 group-hover:text-gray-300 transition-colors">
            Units Sold
          </p>
          <p className="text-2xl font-bold tracking-tight text-white mt-1.5 truncate">
            {totalUnitsSold}
          </p>
        </div>
        <div className="clear-both" />
      </Link>
    </div>
  );
}
