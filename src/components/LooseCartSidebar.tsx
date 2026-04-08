"use client";
import { useBuilderStore, getActivePrice } from "@/store/useBuilderStore";
import { ShoppingCart, Trash2, X } from "lucide-react";
import Link from 'next/link';
import { useEffect, useRef } from 'react';
import { useFocusTrap } from "@/hooks/useFocusTrap";

export function LooseCartSidebar() {
  const { mode, looseCart, clearLooseCart, getTotalPrice, setMode, isMobileCartOpen, setMobileCartOpen } = useBuilderStore();
  const sidebarRef = useRef<HTMLElement>(null);
  
  useFocusTrap(sidebarRef, isMobileCartOpen, () => setMobileCartOpen(false));

  useEffect(() => {
    if (isMobileCartOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isMobileCartOpen]);

  if (mode !== "loose") return null;

  const totalItems = looseCart.reduce((sum, item) => sum + item.quantity, 0);



  return (
    <>
    {/* Optional backdrop for mobile */}
    {isMobileCartOpen && (
      <div 
        className="fixed inset-0 bg-black/60 z-[60] lg:hidden backdrop-blur-sm"
        onClick={() => setMobileCartOpen(false)}
      />
    )}
    <aside ref={sidebarRef} className={`w-full lg:w-[320px] shrink-0 bg-surface border-x-0 lg:border-x border-y-0 lg:border-y border-border lg:rounded-lg h-full lg:h-fit max-h-[100vh] lg:max-h-[calc(100vh-8rem)] flex-col lg:sticky top-0 lg:top-24 shadow-2xl z-[70] lg:z-auto transition-transform ${isMobileCartOpen ? 'fixed right-0 inset-y-0 flex animate-in slide-in-from-right-8 duration-300' : 'hidden lg:flex'}`}>
      {/* Header */}
      <div className="p-4 border-b border-border flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">Loose Cart</h2>
        <div className="flex items-center gap-4">
          <button 
            onClick={clearLooseCart}
            className="text-zinc-400 hover:text-red-500 transition-colors"
            title="Clear Cart"
          >
            <Trash2 className="w-5 h-5" />
          </button>
          <div className="relative text-zinc-400">
            <ShoppingCart className="w-5 h-5" />
            <span className="absolute -top-2 -right-2 bg-brand text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
              {totalItems}
            </span>
          </div>
          <button onClick={() => setMobileCartOpen(false)} className="lg:hidden text-zinc-400 hover:text-white p-1">
             <X className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        
        {/* Assigned Components */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-zinc-400">Selected Components</h3>
          <div className="space-y-2">
            {looseCart.length === 0 ? (
              <div className="text-sm text-zinc-600 italic px-2">No components selected yet.</div>
            ) : (
              <>
                {looseCart.map(item => {
                  const finalPrice = getActivePrice(item);
                  return (
                    <div key={item.id} className="p-3 border rounded-md transition-colors group relative border-border bg-surface hover:border-zinc-500">
                       <div className="text-[10px] flex items-center gap-1 mb-1 font-semibold text-zinc-400">
                          {item.category} {item.quantity > 1 ? `(x${item.quantity})` : ''} 
                       </div>
                       <div className="text-sm text-white font-medium pr-16">{item.name}</div>
                       <div className="absolute right-3 bottom-3 text-brand font-mono font-bold text-sm">
                          {(finalPrice * item.quantity).toLocaleString('no-NO')} Kr
                       </div>
                    </div>
                  );
                })}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Footer / Total */}
      <div className="p-4 border-t border-border bg-background space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-zinc-400 font-medium">Total Price</span>
          <span className="text-xl text-white font-bold font-mono">{getTotalPrice().toLocaleString('no-NO')} Kr</span>
        </div>

        {looseCart.length > 0 ? (
          <Link
            href="/checkout"
            className="w-full flex items-center justify-center p-3 rounded font-medium transition-colors border bg-brand hover:brightness-110 border-brand text-white shadow-[0_0_15px_rgba(234,88,12,0.3)]"
          >
            Checkout Securely
          </Link>
        ) : (
          <button 
            disabled
            className="w-full flex items-center justify-center p-3 rounded font-medium transition-colors border bg-surface border-border text-zinc-400 cursor-not-allowed"
          >
            Add items to checkout
          </button>
        )}
        <button 
          onClick={() => setMode('build')}
          className="w-full text-center text-sm text-brand font-medium hover:text-brand transition-colors"
        >
          Switch to System Builder
        </button>
      </div>
    </aside>
    </>
  );
}
