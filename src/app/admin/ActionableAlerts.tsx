import prisma from "@/lib/prisma";
import { AlertCircle, PackageX } from "lucide-react";
import Link from "next/link";

export default async function ActionableAlerts() {
  const [pendingOrders, lowStockProducts] = await Promise.all([
    prisma.order.count({
      where: { status: "pending" },
    }),
    prisma.product.count({
      where: { stock: { lte: 5 } }, // simplification, assuming threshold is 5
    }),
  ]);

  if (pendingOrders === 0 && lowStockProducts === 0) return null;

  return (
    <div className="flex flex-col gap-3 animate-in fade-in duration-500 mb-6">
      {pendingOrders > 0 && (
        <Link
          href="/admin/orders?status=pending"
          className="glass p-4 border border-rose-500/50 bg-rose-500/10 flex items-center gap-3 hover:bg-rose-500/20 transition-colors cursor-pointer block"
        >
          <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 inline-block" />
          <p className="text-sm text-rose-200 inline-block float-right w-[calc(100%-32px)]">
            You have <strong className="text-white">{pendingOrders}</strong>{" "}
            pending order(s) requiring attention.
          </p>
          <div className="clear-both" />
        </Link>
      )}
      {lowStockProducts > 0 && (
        <Link
          href="/admin/inventory?stock=low"
          className="glass p-4 border border-amber-500/50 bg-amber-500/10 flex items-center gap-3 hover:bg-amber-500/20 transition-colors cursor-pointer block"
        >
          <PackageX className="w-5 h-5 text-amber-500 shrink-0 inline-block" />
          <p className="text-sm text-amber-200 inline-block float-right w-[calc(100%-32px)]">
            You have <strong className="text-white">{lowStockProducts}</strong>{" "}
            product(s) low on stock.
          </p>
          <div className="clear-both" />
        </Link>
      )}
    </div>
  );
}
