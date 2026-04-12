import { prisma } from '@/lib/prisma';
import { formatCurrency } from '@/lib/formatters';
import Link from 'next/link';
import { Pagination } from '@/components/catalog/Pagination';
import { Plus, Search } from 'lucide-react';
import { CatalogSearch } from '@/components/CatalogSearch';
import { AdminCategoryFilter } from '@/components/admin/AdminCategoryFilter';

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const currentSearchParams = await searchParams;
  const pageParam = currentSearchParams['page'];
  const currentPage = pageParam ? Math.max(1, parseInt(pageParam as string) || 1) : 1;
  const query = currentSearchParams['q'] as string | undefined;
  const categoryParam = currentSearchParams['category'] as string | undefined;

  const ITEMS_PER_PAGE = 20;

  const whereClause: any = {};
  if (query) whereClause.name = { contains: query };
  if (categoryParam) whereClause.categoryId = categoryParam;

  const [totalProducts, categories] = await Promise.all([
    prisma.product.count({ where: whereClause }),
    prisma.category.findMany({ select: { id: true, name: true }, orderBy: { name: 'asc' } })
  ]);
  const totalPages = Math.max(1, Math.ceil(totalProducts / ITEMS_PER_PAGE));

  const products = await prisma.product.findMany({
    where: whereClause,
    include: { category: true },
    orderBy: { createdAt: 'desc' },
    skip: (currentPage - 1) * ITEMS_PER_PAGE,
    take: ITEMS_PER_PAGE,
  });

  return (
    <div className="flex flex-col w-full py-8 text-zinc-100">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Hardware Inventory</h1>
          <p className="text-zinc-400 mt-1">Manage global product catalog and raw specifications.</p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full md:w-auto">
          <AdminCategoryFilter categories={categories} />
          <div className="w-full sm:w-auto md:w-64">
             <CatalogSearch alwaysOpen inlineMobile />
          </div>
          <Link 
             href="/admin/products/new" 
             className="bg-brand border border-brand hover:bg-brand-hover text-white px-4 py-2  text-sm font-bold flex items-center justify-center gap-2 whitespace-nowrap transition-colors"
          >
            <Plus className="w-4 h-4" /> Add Product
          </Link>
        </div>
      </div>

      <div className="w-full overflow-x-auto bg-surface border border-border ">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-border bg-[#141414]">
               <th className="px-6 py-4 w-12"></th>
               <th className="px-6 py-4 text-xs font-semibold text-zinc-400 tracking-wider">Product</th>
               <th className="px-6 py-4 text-xs font-semibold text-zinc-400 tracking-wider">SKU</th>
               <th className="px-6 py-4 text-xs font-semibold text-zinc-400 tracking-wider text-right">Price</th>
               <th className="px-6 py-4 text-xs font-semibold text-zinc-400 tracking-wider text-right">Stock</th>
               <th className="px-6 py-4 text-xs font-semibold text-zinc-400 tracking-wider text-center">Status</th>
               <th className="px-6 py-4 text-xs font-semibold text-zinc-400 tracking-wider text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {products.map((product) => {
              const isLowStock = product.stock <= product.lowStockThreshold;

              return (
                <tr key={product.id} className="hover:bg-zinc-800/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="w-10 h-10  border border-border bg-background overflow-hidden relative">
                      {product.imageUrl && <img src={product.imageUrl.replace('/products/', '/assets/').replace('_FINAL', '')} alt={product.name} className="object-contain p-1 w-full h-full" />}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-bold text-white truncate max-wxs">{product.name}</div>
                    <div className="text-xs text-zinc-500">{product.category.name} &bull; {product.brand}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-zinc-400">
                    {product.sku || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="text-sm font-bold text-white">{formatCurrency(product.price)}</div>
                    <div className="text-xs text-zinc-500">Cost: {formatCurrency(product.cost)}</div>
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-right font-bold text-sm ${isLowStock ? 'text-red-400' : 'text-zinc-300'}`}>
                    {product.stock}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    {product.isActive ? (
                      <span className="inline-flex py-1 px-2 text-[10px] font-bold  bg-green-500/10 text-green-400 border border-green-500/20">Active</span>
                    ) : (
                      <span className="inline-flex py-1 px-2 text-[10px] font-bold  bg-zinc-500/10 text-zinc-400 border border-zinc-500/20">Offline</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <Link href={`/admin/products/${product.id}`} className="text-brand hover:text-brand-hover text-sm font-medium transition-colors">
                      Edit
                    </Link>
                  </td>
                </tr>
              )
            })}
            
            {products.length === 0 && (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-zinc-500 text-sm">
                  No products found mapping to this condition.
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
