"use client";

import { useState, useEffect } from 'react';
import { formatCurrency } from '@/lib/utils';
import { ChevronDown, ChevronRight, X, Package } from 'lucide-react';

export function TransactionsList({ transactions }: { transactions: any[] }) {
  // Group transactions by "Month Year"
  const grouped = transactions.reduce((acc, t) => {
    const d = new Date(t.createdAt);
    const monthYear = d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    if (!acc[monthYear]) acc[monthYear] = [];
    acc[monthYear].push(t);
    return acc;
  }, {} as Record<string, any[]>);

  // Maintain an object tracking which months are currently expanded. Default to opening the most recent month.
  // Sort the month keys so the newest month is always at the top of the UI
  const allMonths = Object.keys(grouped).sort((a, b) => {
    return new Date(b).getTime() - new Date(a).getTime();
  });

  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    [allMonths[0]]: true // Open newest month by default
  });

  const toggleMonth = (month: string) => {
    setExpanded(prev => ({ ...prev, [month]: !prev[month] }));
  };

  const [selectedTransaction, setSelectedTransaction] = useState<any | null>(null);

  // Close modal on ESC key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedTransaction(null);
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  return (
    <div className="space-y-4">
      {allMonths.map((month) => {
        const monthTx = grouped[month];
        const isExpanded = !!expanded[month];
        
        // Calculate monthly summary
        const monthlyRevenue = monthTx.filter((t: any) => t.type === 'order').reduce((sum: number, t: any) => sum + t.totalAmount, 0);
        const monthlyExpenses = monthTx.filter((t: any) => t.type === 'expenditure').reduce((sum: number, t: any) => sum + t.amount, 0);

        return (
          <div key={month} className="glass rounded-xl border border-dark-border overflow-hidden bg-dark-surface/30">
            {/* Header / Accordion Toggle */}
            <button 
              onClick={() => toggleMonth(month)}
              className="w-full px-6 py-4 flex items-center justify-between hover:bg-white/5 transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                {isExpanded ? <ChevronDown className="w-5 h-5 text-gray-400" /> : <ChevronRight className="w-5 h-5 text-gray-400" />}
                <h3 className="text-lg font-bold text-white tracking-tight">{month}</h3>
                <span className="bg-dark-bg border border-dark-border text-gray-400 text-xs px-2 py-0.5 rounded-full font-mono">
                  {monthTx.length} transactions
                </span>
              </div>
              <div className="flex items-center gap-6 text-sm">
                <div className="flex flex-col items-end">
                  <span className="text-gray-500 text-[10px] uppercase font-bold tracking-wider mb-0.5">Rev In</span>
                  <span className="text-emerald-400 font-mono font-bold">+{formatCurrency(monthlyRevenue)}</span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-gray-500 text-[10px] uppercase font-bold tracking-wider mb-0.5">Exp Out</span>
                  <span className="text-rose-400 font-mono font-bold">-{formatCurrency(monthlyExpenses)}</span>
                </div>
              </div>
            </button>

            {/* Expanded Table Content */}
            {isExpanded && (
              <div className="border-t border-dark-border/50 bg-dark-bg/50">
                <div className="w-full overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs text-gray-400 bg-dark-surface/50 uppercase border-b border-dark-border">
                      <tr>
                        <th className="px-6 py-3 font-semibold">T-ID</th>
                        <th className="px-4 py-3 font-semibold">Date</th>
                        <th className="px-4 py-3 font-semibold">Description</th>
                        <th className="px-4 py-3 font-semibold">Status</th>
                        <th className="px-6 py-3 font-semibold text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {monthTx.map((t: any) => {
                        const isOrder = t.type === 'order';
                        return (
                          <tr 
                            key={t.id} 
                            onClick={() => setSelectedTransaction(t)}
                            className="border-b border-dark-border/30 hover:bg-white/5 transition-colors cursor-pointer"
                          >
                            <td className="px-6 py-3 font-mono text-xs text-gray-500">#{t.id.slice(0, 8)}</td>
                            <td className="px-4 py-3 text-gray-400 text-xs">{new Date(t.createdAt).toLocaleDateString()}</td>
                            <td className="px-4 py-3">
                              {isOrder ? (
                                <span className="text-gray-200">Customer Checkout ({t.items?.length || 0} items)</span>
                              ) : (
                                <span className="text-rose-300">Expenditure: {t.description} ({t.category})</span>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                isOrder ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                                        : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                              }`}>
                                {isOrder ? t.status : 'Cleared'}
                              </span>
                            </td>
                            <td className={`px-6 py-3 text-right font-mono font-bold ${isOrder ? 'text-emerald-400' : 'text-rose-400'}`}>
                              {isOrder ? '+' : '-'}{formatCurrency(isOrder ? t.totalAmount : t.amount)}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        );
      })}

      {/* Transaction Details Modal */}
      {selectedTransaction && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
          <div 
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setSelectedTransaction(null)}
          />
          
          <div className="relative w-full max-w-2xl bg-dark-bg border border-dark-border rounded-xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className={`px-6 py-4 border-b border-dark-border flex items-center justify-between ${
              selectedTransaction.type === 'order' ? 'bg-emerald-500/10' : 'bg-rose-500/10'
            }`}>
              <div>
                <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                  {selectedTransaction.type === 'order' ? 'Order Receipt' : 'Expenditure Details'}
                </h2>
                <div className="text-sm font-mono text-gray-400 mt-1">ID: {selectedTransaction.id}</div>
              </div>
              <button 
                onClick={() => setSelectedTransaction(null)}
                className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body (Scrollable) */}
            <div className="p-6 overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-2 gap-6 mb-8">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1">Date</div>
                  <div className="text-sm text-gray-300">{new Date(selectedTransaction.createdAt).toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1">Status</div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider inline-block ${
                    selectedTransaction.type === 'order' 
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                      : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                  }`}>
                    {selectedTransaction.type === 'order' ? selectedTransaction.status : 'Cleared'}
                  </span>
                </div>
                
                {selectedTransaction.type === 'expenditure' && (
                  <>
                    <div className="col-span-2">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1">Category</div>
                      <div className="text-sm text-gray-300">{selectedTransaction.category}</div>
                    </div>
                    <div className="col-span-2">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1">Description</div>
                      <div className="text-sm text-gray-200 bg-dark-surface/50 p-3 rounded-lg border border-dark-border">
                        {selectedTransaction.description}
                      </div>
                    </div>
                  </>
                )}
              </div>

              {selectedTransaction.type === 'order' && selectedTransaction.items && (
                <div className="space-y-4">
                  <h3 className="text-sm font-bold tracking-tight text-white mb-3 border-b border-dark-border pb-2 flex items-center gap-2">
                    <Package className="w-4 h-4 text-emerald-500" />
                    Purchased Items ({selectedTransaction.items.length})
                  </h3>
                  
                  <div className="space-y-2">
                    {selectedTransaction.items.map((item: any) => (
                      <div key={item.id} className="flex items-center justify-between p-3 bg-dark-surface/30 border border-dark-border/50 rounded-lg">
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-gray-200 line-clamp-1" title={item.product?.name || 'Unknown Product'}>
                            {item.product?.name || 'Unknown Product'}
                          </span>
                          <span className="text-xs text-gray-500 font-mono mt-0.5">
                            {item.quantity}x @ {formatCurrency(item.priceAtTime)}
                          </span>
                        </div>
                        <div className="text-sm font-bold font-mono text-emerald-400 shrink-0 ml-4">
                          {formatCurrency(item.quantity * item.priceAtTime)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className={`px-6 py-4 border-t border-dark-border flex justify-between items-center ${
              selectedTransaction.type === 'order' ? 'bg-emerald-950/20' : 'bg-rose-950/20'
            }`}>
              <div className="text-sm font-bold text-gray-400">Total</div>
              <div className={`text-2xl font-black font-mono tracking-tight ${
                selectedTransaction.type === 'order' ? 'text-emerald-400' : 'text-rose-400'
              }`}>
                 {selectedTransaction.type === 'order' ? '+' : '-'}{formatCurrency(
                   selectedTransaction.type === 'order' 
                     ? selectedTransaction.totalAmount 
                     : selectedTransaction.amount
                 )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
