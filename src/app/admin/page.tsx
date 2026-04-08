import { prisma } from '@/lib/prisma';
import { formatCurrency, formatDate } from '@/lib/formatters';
import { RevenueChart } from '@/components/admin/RevenueChart';
import { ExpenditureChart } from '@/components/admin/ExpenditureChart';
import Link from 'next/link';
import { Suspense } from 'react';
import { DashboardSkeleton } from '@/components/admin/DashboardSkeleton';

async function DashboardMetrics() {
  // Extract aggregate data structurally
  const [orders, expenditures, pendingOrdersCount, allProducts, recentOrders] = await Promise.all([
     prisma.order.findMany({
        where: { status: 'completed' },
        include: { items: true },
        orderBy: { createdAt: 'asc' }
     }),
     prisma.expenditure.findMany({
        orderBy: { createdAt: 'asc' }
     }),
     prisma.order.count({ where: { status: 'pending' } }),
     prisma.product.findMany({ select: { id: true, name: true, stock: true, lowStockThreshold: true } }),
     prisma.order.findMany({ orderBy: { createdAt: 'desc' }, take: 5, include: { customer: true } })
  ]);

  const lowStockItems = allProducts.filter(p => p.stock <= p.lowStockThreshold).slice(0, 5);

  // Aggregate Top-Level Metrics
  let totalRevenue = 0;
  let totalCOGS = 0;
  
  const revenueSeriesMap: Record<string, { date: string, revenue: number, profit: number }> = {};
  
  orders.forEach((o) => {
     totalRevenue += o.totalAmount;
     
     let orderCOGS = 0;
     o.items.forEach(item => {
        orderCOGS += (item.costAtTime * item.quantity);
     });
     totalCOGS += orderCOGS;

     // Time-Series Math (YYYY-MM grouping)
     const dateStr = new Date(o.createdAt).toISOString().substring(0, 7);
     if (!revenueSeriesMap[dateStr]) {
        revenueSeriesMap[dateStr] = { date: dateStr, revenue: 0, profit: 0 };
     }
     
     revenueSeriesMap[dateStr].revenue += o.totalAmount;
     revenueSeriesMap[dateStr].profit += (o.totalAmount - orderCOGS);
  });

  let totalOPEX = 0;
  const expenditureSeriesMap: Record<string, number> = {};

  expenditures.forEach((e) => {
     totalOPEX += e.amount;
     
     const cat = e.category.toLowerCase();
     if (!expenditureSeriesMap[cat]) {
        expenditureSeriesMap[cat] = 0;
     }
     expenditureSeriesMap[cat] += e.amount;
     
     // Optionally append to timeline, but currently mapping by category 
  });

  const netProfit = totalRevenue - totalCOGS - totalOPEX;

  // Finalize Arrays for Recharts and Sort Time-Series Chronologically
  const revenueTimeline = Object.values(revenueSeriesMap).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  const formattedExpenditures = Object.entries(expenditureSeriesMap)
    .map(([name, amount]) => ({ name, amount }))
    .sort((a, b) => b.amount - a.amount);



  return (
    <>
      {/* Top-Level Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
         <div className="bg-surface border border-border p-6 rounded-xl relative overflow-hidden">
            <div className="text-zinc-400 text-sm font-semibold mb-2">Total Gross Revenue</div>
            <div className="text-2xl font-bold text-white">{formatCurrency(totalRevenue)}</div>
            <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-brand/10 rounded-full blur-2xl"></div>
         </div>
         
         <div className="bg-surface border border-border p-6 rounded-xl">
            <div className="text-zinc-400 text-sm font-semibold mb-2">Cost of Goods Sold (COGS)</div>
            <div className="text-2xl font-bold text-white">{formatCurrency(totalCOGS)}</div>
         </div>

         <div className="bg-surface border border-border p-6 rounded-xl relative overflow-hidden">
            <div className="text-zinc-400 text-sm font-semibold mb-2">Operating Expenses (OPEX)</div>
            <div className="text-2xl font-bold text-white">{formatCurrency(totalOPEX)}</div>
            <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-red-500/10 rounded-full blur-2xl"></div>
         </div>

         <div className="bg-background border border-brand/50 p-6 rounded-xl relative overflow-hidden">
            <div className="text-brand text-sm font-bold mb-2">Net Profit</div>
            <div className="text-3xl font-black text-white">{formatCurrency(netProfit)}</div>
            <div className="absolute right-0 bottom-0 top-0 w-2 bg-brand/20"></div>
         </div>
      </div>

      {/* Operations Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
         {/* Pending Orders Action Card */}
         <div className="bg-brand/10 border border-brand/20 p-6 rounded-xl flex flex-col justify-between">
            <div>
               <h2 className="text-xl font-bold text-brand mb-1">Action Required</h2>
               <p className="text-sm text-brand-hover mb-4">Orders pending fulfillment</p>
               <div className="text-5xl font-black text-brand mb-4">{pendingOrdersCount}</div>
            </div>
            <Link 
               href="/admin/orders?status=pending" 
               className="bg-brand hover:bg-brand-hover text-white px-4 py-2 text-center rounded-lg font-bold transition-colors"
            >
               View Orders
            </Link>
         </div>

         {/* Inventory Alerts */}
         <div className="bg-surface border border-border p-6 rounded-xl flex flex-col justify-between">
            <div>
               <h2 className="text-lg font-bold text-white mb-4">Inventory Alerts</h2>
               {lowStockItems.length > 0 ? (
                  <div className="space-y-3">
                     {lowStockItems.map(item => (
                        <div key={item.id} className="flex justify-between items-center text-sm">
                           <span className="text-zinc-300 truncate max-w-[200px]">{item.name}</span>
                           <span className="text-red-400 font-mono font-bold">{item.stock} / {item.lowStockThreshold}</span>
                        </div>
                     ))}
                  </div>
               ) : (
                  <div className="text-zinc-500 text-sm py-4">All inventory within healthy limits.</div>
               )}
            </div>
            <div className="mt-4 pt-4 border-t border-border">
               <Link href="/admin/products" className="text-brand hover:text-brand-hover text-sm font-bold flex items-center gap-1 transition-colors">
                  Manage Inventory &rarr;
               </Link>
            </div>
         </div>

         {/* Recent Orders */}
         <div className="bg-surface border border-border p-6 rounded-xl flex flex-col justify-between">
            <div>
               <h2 className="text-lg font-bold text-white mb-4">Recent Orders</h2>
               <div className="space-y-3">
                  {recentOrders.map(order => (
                     <div key={order.id} className="flex justify-between items-center text-sm">
                        <span className="text-zinc-300 font-mono truncate max-w-[100px]">{order.id.split('-')[0].toUpperCase()}</span>
                        <div className="text-right">
                           <div className="text-white font-medium">{formatCurrency(order.totalAmount)}</div>
                           <div className="text-zinc-500 text-xs">{formatDate(order.createdAt)}</div>
                        </div>
                     </div>
                  ))}
               </div>
            </div>
            <div className="mt-4 pt-4 border-t border-border">
               <Link href="/admin/orders" className="text-brand hover:text-brand-hover text-sm font-bold transition-colors">
                  All Orders &rarr;
               </Link>
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         
         <div className="lg:col-span-2 bg-surface border border-border p-6 rounded-xl space-y-6">
            <div>
               <h2 className="text-lg font-bold text-white">Revenue & Profit Timeline</h2>
               <p className="text-sm text-zinc-400 mt-1">Chronological mapping of completed orders.</p>
            </div>
            
            {revenueTimeline.length > 0 ? (
               <RevenueChart data={revenueTimeline} />
            ) : (
               <div className="h-80 w-full flex items-center justify-center border border-dashed border-border rounded-lg text-zinc-500 text-sm">
                  No revenue data available
               </div>
            )}
         </div>

         <div className="lg:col-span-1 bg-surface border border-border p-6 rounded-xl space-y-6">
            <div>
               <h2 className="text-lg font-bold text-white">Operating Expenses Breakdown</h2>
               <p className="text-sm text-zinc-400 mt-1">Operating expenses categorized.</p>
            </div>
            
            {formattedExpenditures.length > 0 ? (
               <ExpenditureChart data={formattedExpenditures} />
            ) : (
               <div className="h-80 w-full flex items-center justify-center border border-dashed border-border rounded-lg text-zinc-500 text-sm">
                  No expenditures recorded
               </div>
            )}
         </div>

      </div>
    </>
  );
}

export default function AdminDashboardPage() {
  return (
    <div className="flex flex-col w-full py-8 text-zinc-100 max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Financial Dashboard</h1>
        <p className="text-zinc-400 mt-1">Overview of revenue and operational metrics.</p>
      </div>

      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardMetrics />
      </Suspense>
    </div>
  );
}
