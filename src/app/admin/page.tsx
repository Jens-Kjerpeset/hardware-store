import prisma from '@/lib/prisma';
import { formatCurrency } from '@/lib/utils';
import { DollarSign, TrendingUp, PackageSearch, Activity } from 'lucide-react';
import { TimeframeSelector } from './TimeframeSelector';
import { TransactionsList } from './TransactionsList';

export const dynamic = 'force-dynamic'; // Prevent static caching of admin data

export default async function AdminDashboardPage({
  searchParams,
}: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedSearchParams = await searchParams;
  const timeframe = typeof resolvedSearchParams?.timeframe === 'string' ? resolvedSearchParams.timeframe : 'all';

  let dateLimit: Date | undefined;
  const now = new Date();

  switch (timeframe) {
    case 'year':
      dateLimit = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
      break;
    case 'month':
      dateLimit = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
      break;
    case 'week':
      dateLimit = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case 'day':
      dateLimit = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      break;
    case 'all':
    default:
      dateLimit = undefined;
      break;
  }

  const [orders, expenditures] = await Promise.all([
    prisma.order.findMany({
      where: dateLimit ? { createdAt: { gte: dateLimit } } : undefined,
      include: { items: { include: { product: true } } },
      orderBy: { createdAt: 'desc' },
      take: dateLimit ? undefined : 1500 // Cap 'All Time' so browser doesn't freeze
    }),
    prisma.expenditure.findMany({
      where: dateLimit ? { createdAt: { gte: dateLimit } } : undefined,
      orderBy: { createdAt: 'desc' },
      take: dateLimit ? undefined : 1500 // Cap 'All Time'
    })
  ]);

  // Merge and sort chronological transactions (both incoming orders and outgoing expenditures)
  const transactions = [
    ...orders.map(o => ({ ...o, type: 'order' as const })),
    ...expenditures.map(e => ({ ...e, type: 'expenditure' as const }))
  ].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  // Calculate KPIs (We must execute separate fast aggregates for Total Math to bypass the `take: 20` bounds on table rows)
  const [totalOrderSum, totalExtCostSum] = await Promise.all([
    prisma.order.aggregate({
      _sum: { totalAmount: true },
      where: dateLimit ? { createdAt: { gte: dateLimit } } : undefined,
    }),
    prisma.expenditure.aggregate({
      _sum: { amount: true },
      where: dateLimit ? { createdAt: { gte: dateLimit } } : undefined,
    })
  ]);
  
  // To get cost of goods sold, we fetch all order items in timeframe
  const orderItems = await prisma.orderItem.findMany({
    where: dateLimit ? { order: { createdAt: { gte: dateLimit } } } : undefined,
  });

  let totalRevenue = totalOrderSum._sum.totalAmount || 0;
  let totalCostOfGoods = 0;
  let totalUnitsSold = 0;

  orderItems.forEach(item => {
    totalUnitsSold += item.quantity;
    totalCostOfGoods += (item.costAtTime * item.quantity);
  });

  const totalOtherExpenses = totalExtCostSum._sum.amount || 0;
  const totalExpenses = totalCostOfGoods + totalOtherExpenses;
  const totalProfit = totalRevenue - totalExpenses;
  const profitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      <div className="flex justify-between items-end mb-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white mb-1">Store Performance</h2>
          <p className="text-sm text-gray-400">View real-time sales and revenue metrics based on the selected timeframe.</p>
        </div>
        <TimeframeSelector />
      </div>

      {/* Top Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Revenue */}
        <div className="glass p-6 rounded-xl flex items-center gap-4 bg-gradient-to-br from-dark-surface to-dark-bg border border-dark-border">
          <div className="h-12 w-12 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 shrink-0">
            <DollarSign className="w-6 h-6 text-emerald-400" />
          </div>
          <div className="min-w-0 flex-1" style={{ containerType: 'inline-size' }}>
            <p className="text-sm font-medium text-gray-400">Total Revenue</p>
            <p className="font-bold tracking-tight text-white mt-1.5 whitespace-nowrap" style={{ fontSize: 'clamp(0.875rem, 10cqi, 1.5rem)', lineHeight: '1.2' }}>
              {formatCurrency(totalRevenue)}
            </p>
          </div>
        </div>

        {/* Expenses */}
        <div className="glass p-6 rounded-xl flex items-center gap-4 bg-gradient-to-br from-dark-surface to-dark-bg border border-dark-border">
          <div className="h-12 w-12 rounded-full bg-rose-500/10 flex items-center justify-center border border-rose-500/20 shrink-0">
            <TrendingUp className="w-6 h-6 text-rose-400 rotate-180" />
          </div>
          <div className="min-w-0 flex-1 flex flex-col items-start gap-1 cursor-help group relative" style={{ containerType: 'inline-size' }}>
            <p className="text-sm font-medium text-gray-400">Total Expenses</p>
            <p className="font-bold tracking-tight text-white mt-0.5 whitespace-nowrap border-b border-dashed border-gray-600" style={{ fontSize: 'clamp(0.875rem, 10cqi, 1.5rem)', lineHeight: '1.2' }}>
              {formatCurrency(totalExpenses)}
            </p>
             {/* Tooltip to explain expenses breakdown */}
            <div className="absolute top-full left-0 mt-2 p-3 bg-dark-surface border border-dark-border shadow-soft rounded text-xs text-gray-300 w-max z-50 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity">
               <p><span className="font-bold text-gray-100">COGS:</span> {formatCurrency(totalCostOfGoods)}</p>
               <p><span className="font-bold text-gray-100">Other:</span> {formatCurrency(totalOtherExpenses)}</p>
            </div>
          </div>
        </div>

        {/* Profit */}
        <div className="glass p-6 rounded-xl flex flex-col justify-center bg-gradient-to-br from-dark-surface to-dark-bg border border-dark-border">
          <div className="flex items-center gap-4">
             <div className="h-12 w-12 rounded-full bg-orange-500/10 flex items-center justify-center border border-orange-500/20 shrink-0">
               <Activity className="w-6 h-6 text-orange-400" />
             </div>
             <div className="min-w-0 flex-1" style={{ containerType: 'inline-size' }}>
               <p className="text-sm font-medium text-gray-400">Net Profit</p>
               <div className="flex items-baseline gap-2 mt-1.5">
                  <p className="font-bold tracking-tight text-white whitespace-nowrap" style={{ fontSize: 'clamp(0.875rem, 10cqi, 1.5rem)', lineHeight: '1.2' }}>
                    {formatCurrency(totalProfit)}
                  </p>
                  <span className={`text-xs font-bold shrink-0 ${profitMargin >= 0 ? 'text-gray-300' : 'text-rose-400'}`}>
                    {profitMargin > 0 && '+'}{profitMargin.toFixed(1)}%
                  </span>
               </div>
             </div>
          </div>
        </div>

        {/* Units Sold */}
        <div className="glass p-6 rounded-xl flex items-center gap-4 bg-gradient-to-br from-dark-surface to-dark-bg border border-dark-border">
          <div className="h-12 w-12 rounded-full bg-purple-500/10 flex items-center justify-center border border-purple-500/20 shrink-0">
            <PackageSearch className="w-6 h-6 text-purple-400" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-gray-400">Units Sold</p>
            <p className="text-2xl font-bold tracking-tight text-white mt-1.5 truncate">
              {totalUnitsSold}
            </p>
          </div>
        </div>

      </div>

      {/* Transactions Table */}
      <div className="mt-8">
        <h3 className="text-lg font-bold text-white mb-4">Recent Transactions</h3>
        <TransactionsList transactions={transactions} />
      </div>

    </div>
  );
}
