import { prisma } from '@/lib/prisma';
import { formatCurrency, formatDate } from '@/lib/formatters';
import Link from 'next/link';
import { Pagination } from '@/components/catalog/Pagination';
import { Plus } from 'lucide-react';

export default async function AdminPromotionsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const currentSearchParams = await searchParams;
  const pageParam = currentSearchParams['page'];
  const currentPage = pageParam ? Math.max(1, parseInt(pageParam as string) || 1) : 1;

  const ITEMS_PER_PAGE = 20;

  const totalPromos = await prisma.discountCode.count();
  const totalPages = Math.max(1, Math.ceil(totalPromos / ITEMS_PER_PAGE));

  const promos = await prisma.discountCode.findMany({
    orderBy: { createdAt: 'desc' },
    skip: (currentPage - 1) * ITEMS_PER_PAGE,
    take: ITEMS_PER_PAGE,
  });

  const now = new Date();

  return (
    <div className="flex flex-col w-full py-8 text-zinc-100">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Promotions & Discounts</h1>
          <p className="text-zinc-400 mt-1">Manage discount codes and promotional rules.</p>
        </div>

        <Link 
           href="/admin/promotions/new" 
           className="bg-brand border border-brand hover:bg-brand-hover text-white px-4 py-2  text-sm font-bold flex items-center gap-2 whitespace-nowrap transition-colors"
        >
          <Plus className="w-4 h-4" /> Create Promotion
        </Link>
      </div>

      <div className="w-full overflow-x-auto bg-surface border border-border ">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-border bg-[#141414]">
               <th className="px-6 py-4 text-xs font-semibold text-zinc-400 tracking-wider">Discount Code</th>
               <th className="px-6 py-4 text-xs font-semibold text-zinc-400 tracking-wider">Discount Value</th>
               <th className="px-6 py-4 text-xs font-semibold text-zinc-400 tracking-wider">Usage Rules</th>
               <th className="px-6 py-4 text-xs font-semibold text-zinc-400 tracking-wider">Expiration Date</th>
               <th className="px-6 py-4 text-xs font-semibold text-zinc-400 tracking-wider text-center">Status</th>
               <th className="px-6 py-4 text-xs font-semibold text-zinc-400 tracking-wider text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {promos.map((promo) => {
              const conditionExpired = promo.expiresAt && promo.expiresAt < now;
              const conditionExhausted = promo.maxUses !== null && promo.usedCount >= promo.maxUses;
              const isDead = !promo.isActive || conditionExpired || conditionExhausted;

              return (
                <tr key={promo.id} className={`hover:bg-zinc-800/50 transition-colors ${isDead ? 'opacity-50' : ''}`}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`font-mono font-bold text-lg ${isDead ? 'line-through text-zinc-500' : 'text-white'}`}>{promo.code}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {promo.discountType === 'PERCENTAGE' ? (
                       <span className="text-sm font-bold text-brand">{promo.discountPercent}% off</span>
                    ) : (
                       <span className="text-sm font-bold text-brand">{formatCurrency(promo.discountAmount || 0)} off</span>
                    )}
                    {promo.minOrderValue ? (
                       <div className="text-xs text-zinc-500 mt-1">Min: {formatCurrency(promo.minOrderValue)}</div>
                    ) : null}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-400">
                    <span className="text-white font-medium">{promo.usedCount}</span> / {promo.maxUses !== null ? promo.maxUses : <span className="text-xl leading-none tracking-tighter">&infin;</span>}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-400">
                    {promo.expiresAt ? formatDate(promo.expiresAt) : 'Permanent'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    {!promo.isActive ? (
                      <span className="inline-flex py-1 px-2 text-[10px] font-bold  bg-zinc-500/10 text-zinc-400 border border-zinc-500/20">Archived</span>
                    ) : conditionExhausted ? (
                      <span className="inline-flex py-1 px-2 text-[10px] font-bold  bg-amber-500/10 text-amber-500 border border-amber-500/20">Cap Exceeded</span>
                    ) : conditionExpired ? (
                      <span className="inline-flex py-1 px-2 text-[10px] font-bold  bg-red-500/10 text-red-500 border border-red-500/20">Expired</span>
                    ) : (
                      <span className="inline-flex py-1 px-2 text-[10px] font-bold  bg-green-500/10 text-green-400 border border-green-500/20">Active</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <Link href={`/admin/promotions/${promo.id}`} className="text-brand hover:text-brand-hover text-sm font-medium transition-colors">
                      Edit
                    </Link>
                  </td>
                </tr>
              )
            })}
            
            {promos.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-zinc-500 text-sm">
                  No promotions found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Pagination currentPage={currentPage} totalPages={totalPages} />
    </div>
  );
}
