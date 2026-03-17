import prisma from '@/lib/prisma';
import { InventoryTable } from './InventoryTable';

export const dynamic = 'force-dynamic';

export default async function InventoryPage() {
  const products = await prisma.product.findMany({
    include: {
      category: true
    },
    orderBy: {
      name: 'asc'
    }
  });

  const categories = await prisma.category.findMany({
    orderBy: { name: 'asc' }
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Inventory Management</h1>
          <p className="text-gray-400 text-sm mt-1">Manage product stock levels, pricing, and active catalog items.</p>
        </div>
        {/* Button moved inside InventoryTable for state access */}
      </div>

      <div className="w-full">
        <InventoryTable initialProducts={products} categories={categories} />
      </div>
    </div>
  );
}
