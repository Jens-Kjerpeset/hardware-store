import prisma from "@/lib/prisma";
import OrdersTable from "./OrdersTable";
import { getOrdersForMonth } from "@/app/actions/admin";

export const dynamic = "force-dynamic";

export default async function OrdersAdminPage() {
  const allOrders = await prisma.order.findMany({
    select: { id: true, createdAt: true },
    orderBy: { createdAt: "desc" },
  });

  const monthGroupsMap = new Map<string, number>();
  for (const order of allOrders) {
    const d = order.createdAt;
    const yearMonth = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
    monthGroupsMap.set(yearMonth, (monthGroupsMap.get(yearMonth) || 0) + 1);
  }

  const monthGroups = Array.from(monthGroupsMap.entries()).map(([month, count]) => ({ month, count }));

  let initialOrders: any[] = [];
  if (monthGroups.length > 0) {
    const latestMonth = monthGroups[0].month;
    const res = await getOrdersForMonth(latestMonth);
    if (res.success && res.orders) {
      initialOrders = res.orders;
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-white mb-1">
          Order Management
        </h2>
        <p className="text-sm text-gray-400">
          View and update customer orders, process shipping, and track
          fulfillments.
        </p>
      </div>

      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      <OrdersTable monthGroups={monthGroups} initialOrders={initialOrders} />
    </div>
  );
}
