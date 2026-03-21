import prisma from "@/lib/prisma";
import CustomersTable from "./CustomersTable";

export const dynamic = "force-dynamic";

export default async function CustomersAdminPage() {
  const customers = await prisma.customer.findMany({
    include: {
      orders: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-white mb-1">
          Customer Management
        </h2>
        <p className="text-sm text-gray-400">
          View customer profiles, lifetime value, and order history.
        </p>
      </div>

      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      <CustomersTable initialCustomers={customers as any[]} />
    </div>
  );
}
