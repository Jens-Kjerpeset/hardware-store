import prisma from "@/lib/prisma";
import Image from "next/image";
import { formatCurrency } from "@/lib/utils";
import { Trophy, Image as ImageIcon } from "lucide-react";
import Link from "next/link";

export default async function TopSellers({ dateLimit }: { dateLimit?: Date }) {
  const orderItems = await prisma.orderItem.findMany({
    where: dateLimit ? { order: { createdAt: { gte: dateLimit } } } : undefined,
    select: { productId: true, quantity: true },
  });

  const grouped = orderItems.reduce(
    (acc, item) => {
      acc[item.productId] = (acc[item.productId] || 0) + item.quantity;
      return acc;
    },
    {} as Record<string, number>,
  );

  const topProductIds = Object.entries(grouped)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([id]) => id);

  if (topProductIds.length === 0) return null;

  const products = await prisma.product.findMany({
    where: { id: { in: topProductIds } },
    select: { id: true, name: true, price: true, imageUrl: true, brand: true },
  });

  // Sort them back to the correct order
  const sortedProducts = topProductIds
    .map((id) => products.find((p) => p.id === id)!)
    .filter(Boolean);

  return (
    <div className="glass p-6 border border-dark-border mt-6">
      <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
        <Trophy className="w-5 h-5 text-amber-400" /> Top Performing Products
      </h3>
      <div className="space-y-4">
        {sortedProducts.map((product, idx) => (
          <Link
            href={`/admin/inventory?edit=${product.id}`}
            key={product.id}
            className="flex gap-4 p-4 bg-dark-bg/50 rounded-lg border border-dark-border hover:bg-dark-surface transition-colors cursor-pointer relative overflow-hidden group"
          >
            <div className="absolute top-0 left-0 w-1 h-full bg-brand-500/0 group-hover:bg-brand-500 transition-colors" />
            <div className="w-6 flex items-start justify-center font-bold text-gray-500 mt-3 flex-shrink-0">
              #{idx + 1}
            </div>
            <div className="w-14 h-14 relative bg-dark-bg/50 border border-dark-border rounded flex-shrink-0 flex items-center justify-center overflow-hidden mt-1">
              {product.imageUrl ? (
                <Image
                  src={product.imageUrl}
                  alt={product.name}
                  fill
                  className="object-contain p-1.5 bg-white"
                  sizes="56px"
                />
              ) : (
                <ImageIcon className="w-5 h-5 text-gray-500" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white leading-snug w-full mb-1">
                {product.name}
              </p>
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-bold tracking-wider  text-brand-400">
                  {product.brand}
                </p>
                <p className="font-mono text-sm font-bold text-white leading-none">
                  {grouped[product.id]} units
                </p>
              </div>
              <div className="flex justify-end mt-0.5">
                <p className="font-mono text-[11px] text-gray-400 leading-none">
                  {formatCurrency(product.price)} each
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
