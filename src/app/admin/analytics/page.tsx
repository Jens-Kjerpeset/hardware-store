import prisma from "@/lib/prisma";
import AnalyticsCharts from "./AnalyticsCharts";
import AnalyticsTimeframeSelector from "./AnalyticsTimeframeSelector";
import { formatCurrency } from "@/lib/utils";
import { Target, TrendingUp, Vault, PackageX, Trophy } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AnalyticsAdminPage({
  searchParams,
}: {
  searchParams: { timeframe?: string };
}) {
  const timeframe = searchParams.timeframe || "all";

  let dateLimit: Date | undefined = undefined;
  const now = new Date();
  switch (timeframe) {
    case "7d":
      dateLimit = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case "30d":
      dateLimit = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      break;
    case "year":
      dateLimit = new Date();
      dateLimit.setFullYear(dateLimit.getFullYear() - 1);
      break;
  }

  // Inventory Value
  const products = await prisma.product.findMany({
    select: {
      id: true,
      name: true,
      stock: true,
      cost: true,
      price: true,
      brand: true,
      categoryId: true,
    },
  });
  const totalInventoryValue = products.reduce(
    (sum, p) => sum + p.stock * p.cost,
    0,
  );

  // Filter orders
  const orderItems = await prisma.orderItem.findMany({
    where: dateLimit ? { order: { createdAt: { gte: dateLimit } } } : undefined,
    select: {
      quantity: true,
      priceAtTime: true,
      costAtTime: true,
      product: {
        select: {
          id: true,
          name: true,
          brand: true,
          category: { select: { name: true } },
        },
      },
    },
  });

  const categoryRevenue: Record<string, number> = {};
  const categoryProfit: Record<string, number> = {};
  const productProfit: Record<
    string,
    { id: string; name: string; profit: number; units: number; brand: string }
  > = {};

  let totalRevenue = 0;
  let totalCost = 0;

  orderItems.forEach((item) => {
    const rev = item.priceAtTime * item.quantity;
    const itemCost = item.costAtTime * item.quantity;
    const profit = rev - itemCost;

    totalRevenue += rev;
    totalCost += itemCost;

    const catName = item.product?.category?.name || "Uncategorized";
    categoryRevenue[catName] = (categoryRevenue[catName] || 0) + rev;
    categoryProfit[catName] = (categoryProfit[catName] || 0) + profit;

    if (item.product) {
      if (!productProfit[item.product.id]) {
        productProfit[item.product.id] = {
          id: item.product.id,
          name: item.product.name,
          profit: 0,
          units: 0,
          brand: item.product.brand,
        };
      }
      productProfit[item.product.id].profit += profit;
      productProfit[item.product.id].units += item.quantity;
    }
  });

  const categoryData = Object.entries(categoryRevenue)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
  const profitData = Object.entries(categoryProfit)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  const topProfitable = Object.values(productProfit)
    .sort((a, b) => b.profit - a.profit)
    .slice(0, 5);

  const slowMoving = products
    .filter((p) => p.stock > 0)
    .map((p) => ({
      ...p,
      unitsSold: productProfit[p.id]?.units || 0,
    }))
    .sort((a, b) => {
      if (a.unitsSold === b.unitsSold) return b.stock - a.stock;
      return a.unitsSold - b.unitsSold;
    })
    .slice(0, 5);

  // Overall metrics
  const totalProfit = totalRevenue - totalCost;
  const averageMargin =
    totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-12">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white mb-1">
            Deep Analytics & Reporting
          </h2>
          <p className="text-sm text-gray-400">
            Detailed insights into margins, categories, and inventory
            efficiency.
          </p>
        </div>
        <AnalyticsTimeframeSelector initial={timeframe} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass p-6 flex flex-col items-center justify-center text-center gap-2 border border-dark-border">
          <Vault className="w-8 h-8 text-indigo-400 mb-2" />
          <p className="text-sm text-gray-400">Total Valid Inventory Value</p>
          <p className="text-2xl font-mono font-bold text-white">
            {formatCurrency(totalInventoryValue)}
          </p>
        </div>
        <div className="glass p-6 flex flex-col items-center justify-center text-center gap-2 border border-dark-border">
          <TrendingUp className="w-8 h-8 text-emerald-400 mb-2" />
          <p className="text-sm text-gray-400">Period Profit Margin</p>
          <p className="text-2xl font-mono font-bold text-white">
            {averageMargin.toFixed(1)}%
          </p>
        </div>
        <div className="glass p-6 flex flex-col items-center justify-center text-center gap-2 border border-dark-border">
          <Target className="w-8 h-8 text-brand-400 mb-2" />
          <p className="text-sm text-gray-400">Total Period Revenue</p>
          <p className="text-2xl font-mono font-bold text-white">
            {formatCurrency(totalRevenue)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        <AnalyticsCharts categoryData={categoryData} profitData={profitData} />

        <div className="space-y-6">
          {/* Top 5 Most Profitable */}
          <div className="glass p-6 border border-dark-border rounded-xl">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-emerald-400" /> Top 5 Profitable
              Products
            </h3>
            <div className="space-y-3">
              {topProfitable.length > 0 ? (
                topProfitable.map((product, idx) => (
                  <Link
                    href={`/admin/inventory?search=${encodeURIComponent(product.name)}`}
                    key={product.id}
                    className="flex items-center justify-between p-3 bg-dark-bg/50 rounded-lg border border-dark-border hover:bg-dark-surface transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-4 text-xs font-bold text-gray-500">
                        #{idx + 1}
                      </span>
                      <div>
                        <p className="text-sm font-bold text-white line-clamp-1">
                          {product.name}
                        </p>
                        <p className="text-xs text-gray-400">
                          {product.brand} &bull; {product.units} units sold
                        </p>
                      </div>
                    </div>
                    <div className="text-right shrink-0 ml-4">
                      <p className="text-sm font-mono font-bold text-emerald-400">
                        {formatCurrency(product.profit)}
                      </p>
                      <p className="text-[11px] text-gray-500  tracking-wider mt-0.5">
                        Profit
                      </p>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="text-sm text-gray-500 italic p-4 text-center border border-dashed border-dark-border rounded-lg">
                  No sales data for this period
                </div>
              )}
            </div>
          </div>

          {/* Slow Moving Inventory */}
          <div className="glass p-6 border border-dark-border rounded-xl">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <PackageX className="w-5 h-5 text-rose-400" /> Slow-Moving
              Inventory Risk
            </h3>
            <div className="space-y-3">
              {slowMoving.length > 0 ? (
                slowMoving.map((product) => (
                  <Link
                    href={`/admin/inventory?search=${encodeURIComponent(product.name)}`}
                    key={product.id}
                    className="flex items-center justify-between p-3 bg-dark-bg/50 rounded-lg border border-dark-border hover:bg-dark-surface transition-colors group"
                  >
                    <div>
                      <p className="text-sm font-bold text-white line-clamp-1">
                        {product.name}
                      </p>
                      <p className="text-xs text-rose-400 mt-0.5 font-bold">
                        {product.unitsSold} units moving in exactly this period
                      </p>
                    </div>
                    <div className="text-right shrink-0 ml-4">
                      <p className="text-sm font-mono font-bold text-white">
                        {product.stock} in stock
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5 font-mono">
                        Tying {formatCurrency(product.stock * product.cost)}
                      </p>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="text-sm text-gray-500 italic p-4 text-center border border-dashed border-dark-border rounded-lg">
                  All items are moving well
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
