/* eslint-disable @typescript-eslint/no-explicit-any */
import prisma from "@/lib/prisma";
import { InventoryTable } from "./InventoryTable";
import { AlertTriangle } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function InventoryPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; edit?: string }>;
}) {
  const params = await searchParams;
  const initialSearch = params?.search || "";
  const initialEditId = params?.edit || null;

  let products: any[] = [];
  let categories: any[] = [];
  let dbError = false;

  try {
    products = await prisma.product.findMany({
      include: {
        category: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    categories = await prisma.category.findMany({
      orderBy: { name: "asc" },
    });
  } catch (error) {
    console.error("Inventory DB Error:", error);
    dbError = true;
  }

  if (dbError) {
    return (
      <div className="space-y-6 animate-in fade-in duration-500">
        <div className="p-6 glass border border-red-500/50 bg-red-500/10  relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-red-500" />
          <h2 className="text-xl font-bold tracking-tight text-white mb-2 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-500" /> Database
            Connection Error
          </h2>
          <p className="text-sm text-red-200 leading-relaxed max-w-3xl">
            The server failed to connect to the database. If you deployed this
            to Vercel, please ensure that you have configured{" "}
            <strong>TURSO_DATABASE_URL</strong> and{" "}
            <strong>TURSO_AUTH_TOKEN</strong> in your Vercel Project Settings
            &gt; Environment Variables.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">
            Inventory Management
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Manage product stock levels, pricing, and active catalog items.
          </p>
        </div>
        {/* Button moved inside InventoryTable for state access */}
      </div>

      <div className="w-full">
        <InventoryTable
          initialProducts={products}
          categories={categories}
          initialSearch={initialSearch}
          initialEditId={initialEditId}
        />
      </div>
    </div>
  );
}
