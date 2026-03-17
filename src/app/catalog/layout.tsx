"use client";

import { useStore } from '@/lib/store';
import { checkCompatibility, checkPotentialCompatibility, SelectedProduct } from '@/lib/compatibility';
import { useMemo, useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle2, ChevronRight, X, Plus, Minus, Trash2, Info, ShoppingCart } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { formatCurrency } from '@/lib/utils';

import { REQUIRED_BUILD_CATEGORIES } from '@/lib/constants';
export default function CatalogLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { mode, buildSystem, buildStorage, updateBuildStorageQuantity, removeBuildComponent, removeBuildStorageComponent, cart, removeFromCart, updateQuantity, addToCart, clearBuild, clearCart, setMode } = useStore();
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const buildParts = [...Object.values(buildSystem), ...buildStorage];
  
  const handleSwitchToLooseParts = () => {
    buildParts.forEach(item => addToCart(item));
    clearBuild();
    setMode('loose');
  };
  
  const handleSwitchToBuild = () => {
    setMode('build');
  };

  const currentItems = mode === 'build' ? buildParts : cart;
  const currentTotal = mode === 'build' 
    ? buildParts.reduce((sum, item) => sum + item.price * ((item as any).quantity || 1), 0)
    : cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const cartCount = mode === 'build' ? Object.keys(buildSystem).length + buildStorage.reduce((sum, item) => sum + item.quantity, 0) : cart.reduce((sum, item) => sum + item.quantity, 0);

  const warnings = useMemo(() => {
    if (mode !== 'build') return [];
    
    const checkArray = Object.values(buildSystem).map(p => ({
      id: p.id,
      name: p.name,
      brand: p.brand,
      categoryId: p.category.name,
      specsJson: p.specsJson
    })) as SelectedProduct[];
    
    return checkCompatibility(checkArray);
  }, [buildSystem, mode]);

  const errors = warnings.filter(w => !w.startsWith('Notice:'));
  const notices = warnings.filter(w => w.startsWith('Notice:'));

  const missingCategories = REQUIRED_BUILD_CATEGORIES.filter((cat: string) => {
    return !buildSystem[cat];
  });
  
  const hasAtLeastOneSSD = buildStorage.some(s => {
    try {
      const specs = JSON.parse(s.specsJson);
      return specs.storageType === 'SSD' || specs.type === 'primary_storage'; // Only strictly labeled SSDs or legacy Primary Storage NVMe drives count
    } catch { return false; }
  });

  const isBuildComplete = missingCategories.length === 0 && hasAtLeastOneSSD;
  const canCheckoutBuild = isBuildComplete && errors.length === 0;

  return (
    <div className="flex flex-col lg:flex-row gap-8 w-full min-w-0 animate-in fade-in duration-500">
      
      <div className="flex-1 w-full min-w-0 relative">
        {children}
      </div>

      {isMounted && (mode === 'build' || mode === 'loose') && (
        <aside className="w-full lg:w-80 shrink-0 glass h-fit lg:sticky top-24 border-dark-border shadow-2xl flex flex-col overflow-hidden bg-dark-bg/90">
            <div className="flex items-center justify-between p-4 border-b border-dark-border bg-dark-surface/50">
                <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                    {mode === 'build' ? 'System Builder' : 'Loose Parts Cart'}
                </h2>
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => mode === 'build' ? clearBuild() : clearCart()}
                    title={mode === 'build' ? 'Clear Build' : 'Empty Cart'}
                    className="text-gray-500 hover:text-red-400 transition-colors p-1"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                  <div className="relative flex items-center justify-center text-gray-300">
                    <ShoppingCart className="h-6 w-6" />
                    {cartCount > 0 && (
                      <span className="absolute -top-2 -right-2 bg-brand-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-lg">{cartCount}</span>
                    )}
                  </div>
                </div>
            </div>

            <div className="flex flex-col gap-4 p-4 max-h-[60vh] overflow-y-auto">
              {mode === 'build' && (
                <div className="glass p-4 border-l-4 shadow-lg border-l-brand-500 bg-brand-500/5">
                   <h3 className="font-bold text-white mb-2 text-sm flex items-center gap-2">
                      Build Status
                   </h3>
                 
                 {errors.length > 0 && (
                   <div className="mt-3 space-y-2">
                     <div className="flex items-center gap-2 text-red-400 text-xs font-bold uppercase tracking-wider">
                       <AlertTriangle className="w-4 h-4" /> System Conflicts
                     </div>
                     <ul className="text-xs text-red-200/80 space-y-1 ml-6 list-disc">
                       {errors.map((w: string, i: number) => <li key={i}>{w}</li>)}
                     </ul>
                   </div>
                 )}
                 {notices.length > 0 && (
                   <div className="mt-3 space-y-2">
                     <div className="flex items-center gap-2 text-blue-400 text-xs font-bold uppercase tracking-wider">
                       <Info className="w-4 h-4" /> Build Notices
                     </div>
                     <ul className="text-xs text-blue-200/80 space-y-1 ml-6 list-disc">
                       {notices.map((w: string, i: number) => <li key={i}>{w.replace('Notice: ', '')}</li>)}
                     </ul>
                   </div>
                 )}
                 
                 {missingCategories.length > 0 || !hasAtLeastOneSSD ? (
                   <div className="space-y-2 mt-4">
                     <div className="text-xs font-bold text-amber-500 uppercase tracking-wider">Missing Required Parts</div>
                     <div className="flex flex-wrap gap-2">
                       {missingCategories.map((cat: string) => (
                         <Link key={cat} href={`/catalog/${cat}`}>
                           <span className="px-2 py-1 bg-amber-500/10 text-amber-400 text-[10px] border border-amber-500/20 hover:bg-amber-500/20 hover:text-amber-300 transition-colors cursor-pointer block">{cat}</span>
                         </Link>
                       ))}
                       {!hasAtLeastOneSSD && (
                         <Link href={`/catalog/Storage`}>
                           <span className="px-2 py-1 bg-amber-500/10 text-amber-400 text-[10px] border border-amber-500/20 hover:bg-amber-500/20 hover:text-amber-300 transition-colors cursor-pointer block">SSD</span>
                         </Link>
                       )}
                     </div>
                   </div>
                  ) : errors.length === 0 ? (
                   <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold mt-2">
                      <CheckCircle2 className="w-5 h-5" /> Rig is fully complete and compatible!
                   </div>
                 ) : null}
                </div>
              )}

               <div className="space-y-3 mt-2">
                  <div className="text-xs font-bold text-gray-500 uppercase tracking-wider px-2">Assigned Components</div>
                  
                  {currentItems.length === 0 ? (
                    <div className="text-center text-gray-500 py-6 text-sm border border-dashed border-dark-border">No parts selected yet.</div>
                  ) : (
                    currentItems.map(item => {
                      const itemWarnings = mode === 'build' ? checkPotentialCompatibility(
                        buildParts.map(p => ({
                          id: p.id,
                          name: p.name,
                          brand: p.brand,
                          categoryId: p.category.name,
                          specsJson: p.specsJson
                        })) as SelectedProduct[],
                        {
                          id: item.id,
                          name: item.name,
                          brand: item.brand,
                          categoryId: item.category.name,
                          specsJson: item.specsJson
                        }
                      ) : [];
                      const isIncompatible = itemWarnings.length > 0;

                      return (
                      <div 
                        key={item.id} 
                        onClick={() => router.push(`/catalog/${encodeURIComponent(item.category.name)}`)}
                        className={`flex flex-col p-3 border group cursor-pointer transition-all relative ${
                          isIncompatible 
                            ? 'bg-red-950/20 border-red-500/50 hover:bg-red-950/40 hover:border-red-500' 
                            : 'bg-dark-surface/50 border-dark-border hover:border-brand-500/50 hover:bg-dark-surface'
                        }`}
                      >
                         <div className="flex justify-between items-start mb-1">
                           <div className={`text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 ${isIncompatible ? 'text-red-400' : 'text-gray-500'}`}>
                             {isIncompatible && (
                               <div title={itemWarnings.join('\n')}>
                                 <AlertTriangle className="w-3.5 h-3.5" />
                               </div>
                             )}
                             {item.category.name}
                           </div>
                           <button 
                             onClick={(e) => { 
                               e.stopPropagation(); 
                               if (mode === 'build') {
                                 if (item.category.name === 'Storage') removeBuildStorageComponent(item.id);
                                 else removeBuildComponent(item.category.name);
                               } else {
                                 removeFromCart(item.id); 
                               }
                             }} 
                             className="text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity p-0.5"
                           >
                              <X className="w-3 h-3" />
                           </button>
                         </div>
                         <div className="text-sm font-medium text-gray-200 line-clamp-2 leading-snug mb-2 group-hover:text-brand-400 transition-colors">
                           {item.name}
                         </div>
                         <div className="flex justify-between items-end mt-auto pt-2">
                           {(mode === 'loose' || (mode === 'build' && item.category.name === 'Storage')) ? (
                             <div className="flex items-center gap-2 bg-dark-bg border border-dark-border p-0.5 rounded-sm">
                                <button onClick={(e) => { 
                                  e.stopPropagation(); 
                                  if (mode === 'loose') updateQuantity(item.id, ((item as any).quantity || 1) - 1);
                                  else updateBuildStorageQuantity(item.id, ((item as any).quantity || 1) - 1);
                                }} className="w-5 h-5 flex items-center justify-center text-gray-400 hover:text-white bg-white/5 text-xs">-</button>
                                <span className="text-[10px] font-mono w-4 text-center">{(item as any).quantity || 1}</span>
                                <button onClick={(e) => { 
                                  e.stopPropagation(); 
                                  if (mode === 'loose') updateQuantity(item.id, ((item as any).quantity || 1) + 1); 
                                  else updateBuildStorageQuantity(item.id, ((item as any).quantity || 1) + 1);
                                }} className="w-5 h-5 flex items-center justify-center text-gray-400 hover:text-white bg-white/5 text-xs">+</button>
                             </div>
                           ) : <div />}
                           <div className="font-mono text-xs text-amber-400 font-bold text-right">
                             {formatCurrency(item.price * ((item as any).quantity || 1))}
                           </div>
                         </div>
                      </div>
                    );
                  })
                )}
               </div>
            </div>

             <div className="p-4 border-t border-dark-border bg-dark-surface/80">
               <div className="flex justify-between text-gray-300 mb-4 items-end">
                 <span className="font-bold text-sm">Total Price</span>
                 <span className="font-black text-white text-xl leading-none">{formatCurrency(currentTotal)}</span>
               </div>
               
               <button 
                  onClick={() => { if (mode === 'loose' || canCheckoutBuild) router.push('/checkout'); }}
                  disabled={mode === 'build' && !canCheckoutBuild}
                  className={`w-full py-3 font-bold transition-all flex justify-center items-center gap-2 text-sm ${(mode === 'loose' || canCheckoutBuild) ? 'bg-amber-500 text-dark-bg hover:bg-amber-400' : 'bg-dark-surface text-gray-500 border border-dark-border cursor-not-allowed'}`}
                >
                 {(mode === 'loose' || canCheckoutBuild) ? 'Checkout' : 'Fix Missing Parts/Errors'} <ChevronRight className="w-5 h-5" />
               </button>
               {mode === 'build' ? (
                 <button
                    onClick={handleSwitchToLooseParts}
                    className="w-full mt-3 text-xs text-amber-500 hover:text-amber-400 font-medium transition-colors text-center underline-offset-4 hover:underline"
                  >
                   Switch to buying loose parts
                 </button>
               ) : (
                 <button
                    onClick={handleSwitchToBuild}
                    className="w-full mt-3 text-xs text-amber-500 hover:text-amber-400 font-medium transition-colors text-center underline-offset-4 hover:underline"
                  >
                   Switch to PC Builder
                 </button>
               )}
            </div>
        </aside>
      )}
    </div>
  );
}
