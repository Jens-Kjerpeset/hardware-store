import prisma from "@/lib/prisma";
import OrdersTable from "./OrdersTable";

export const dynamic = "force-dynamic";

export default async function OrdersAdminPage() {
  const orders = await prisma.order.findMany({
    include: {
      customer: true,
      items: {
        include: {
          product: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

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
      <OrdersTable initialOrders={orders as any[]} />
    </div>
  );
}
