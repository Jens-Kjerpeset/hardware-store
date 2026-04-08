import { prisma } from '@/lib/prisma';
import { formatCurrency, formatDate } from '@/lib/formatters';
import Link from 'next/link';
import { OrderStatusSelect } from '@/components/admin/OrderStatusSelect';
import { Pagination } from '@/components/catalog/Pagination';

const ORDER_STATUS_OPTIONS = [
  { label: 'Pending', value: 'pending' },
  { label: 'Completed', value: 'completed' },
  { label: 'Refunded', value: 'refunded' },
  { label: 'Cancelled', value: 'cancelled' },
];

const SHIPPING_STATUS_OPTIONS = [
  { label: 'Pending', value: 'pending' },
  { label: 'Processing', value: 'processing' },
  { label: 'Shipped', value: 'shipped' },
  { label: 'Delivered', value: 'delivered' },
];

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const currentSearchParams = await searchParams;
  const pageParam = currentSearchParams['page'];
  const currentPage = pageParam ? Math.max(1, parseInt(pageParam as string) || 1) : 1;
  const statusFilter = currentSearchParams['status'] as string | undefined;

  const ITEMS_PER_PAGE = 20;

  const whereClause = statusFilter ? { status: statusFilter } : {};

  const totalOrders = await prisma.order.count({ where: whereClause });
  const totalPages = Math.max(1, Math.ceil(totalOrders / ITEMS_PER_PAGE));

  const orders = await prisma.order.findMany({
    where: whereClause,
    include: {
      customer: {
        select: { name: true, email: true },
      },
      items: { select: { id: true } }
    },
    orderBy: { createdAt: 'desc' },
    skip: (currentPage - 1) * ITEMS_PER_PAGE,
    take: ITEMS_PER_PAGE,
  });

  return (
    <div className="flex flex-col w-full py-8 text-zinc-100">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Order Management</h1>
          <p className="text-zinc-400 mt-1">Manage global transactions and fulfillment status.</p>
        </div>

        {/* Basic native filter linking */}
        <div className="flex flex-wrap gap-2">
           <Link href="/admin/orders" className={`px-4 py-2 text-sm font-medium rounded-md border ${!statusFilter ? 'bg-brand text-white border-brand' : 'bg-surface border-border text-zinc-300 hover:bg-zinc-800'}`}>All</Link>
           <Link href="/admin/orders?status=pending" className={`px-4 py-2 text-sm font-medium rounded-md border ${statusFilter === 'pending' ? 'bg-brand text-white border-brand' : 'bg-surface border-border text-zinc-300 hover:bg-zinc-800'}`}>Pending</Link>
           <Link href="/admin/orders?status=completed" className={`px-4 py-2 text-sm font-medium rounded-md border ${statusFilter === 'completed' ? 'bg-brand text-white border-brand' : 'bg-surface border-border text-zinc-300 hover:bg-zinc-800'}`}>Completed</Link>
        </div>
      </div>

      <div className="w-full overflow-x-auto bg-surface border border-border rounded-xl">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-border bg-[#141414]">
              <th className="px-6 py-4 text-xs font-semibold text-zinc-400 tracking-wider">Order ID</th>
              <th className="px-6 py-4 text-xs font-semibold text-zinc-400 tracking-wider">Date</th>
              <th className="px-6 py-4 text-xs font-semibold text-zinc-400 tracking-wider">Customer</th>
              <th className="px-6 py-4 text-xs font-semibold text-zinc-400 tracking-wider">Total</th>
              <th className="px-6 py-4 text-xs font-semibold text-zinc-400 tracking-wider">Payment Status</th>
              <th className="px-6 py-4 text-xs font-semibold text-zinc-400 tracking-wider">Shipping</th>
              <th className="px-6 py-4 text-xs font-semibold text-zinc-400 tracking-wider text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {orders.map((order) => (
              <tr key={order.id} className="hover:bg-zinc-800/50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm font-mono text-zinc-300">{order.id.split('-')[0].toUpperCase()}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-400">
                  {formatDate(order.createdAt)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-white">{order.customer?.name || 'Guest'}</div>
                  <div className="text-xs text-zinc-500">{order.customer?.email || 'N/A'}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm font-bold text-white">{formatCurrency(order.totalAmount)}</span>
                  <div className="text-xs text-zinc-500">{order.items.length} items</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <OrderStatusSelect 
                    orderId={order.id} 
                    type="status" 
                    currentValue={order.status} 
                    options={ORDER_STATUS_OPTIONS} 
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <OrderStatusSelect 
                    orderId={order.id} 
                    type="shippingStatus" 
                    currentValue={order.shippingStatus} 
                    options={SHIPPING_STATUS_OPTIONS} 
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <Link href={`/admin/orders/${order.id}`} className="text-brand hover:text-brand-hover text-sm font-medium transition-colors">
                    View Details
                  </Link>
                </td>
              </tr>
            ))}
            
            {orders.length === 0 && (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-zinc-500 text-sm">
                  No orders found matching the criteria.
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
