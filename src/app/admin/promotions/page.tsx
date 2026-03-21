import prisma from "@/lib/prisma";
/* eslint-disable @typescript-eslint/no-explicit-any */
import PromotionsTable from "./PromotionsTable";

export const dynamic = "force-dynamic";

export default async function PromotionsAdminPage() {
  const discountCodes = await prisma.discountCode.findMany({
    orderBy: { createdAt: "desc" },
  });

  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-5xl">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-white mb-1">
          Promotions & Marketing
        </h2>
        <p className="text-sm text-gray-400">
          Manage active sales and generate discount codes for customers.
        </p>
      </div>

      { }
      <PromotionsTable
        initialCodes={discountCodes as any[]}
        categories={categories as any[]}
      />
    </div>
  );
}
