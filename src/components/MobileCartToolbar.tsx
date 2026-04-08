'use client';
import { useBuilderStore } from "@/store/useBuilderStore";
import { ShoppingCart, LayoutGrid, SlidersHorizontal } from "lucide-react";

export function MobileCartToolbar() {
  const { mode, looseCart, components, buildStorage, isMobileCartOpen, setMobileCartOpen, getTotalPrice, setMobileFilterOpen } = useBuilderStore();

  const handleToggle = () => setMobileCartOpen(!isMobileCartOpen);

  // Derive counts based on mode
  let itemCount = 0;
  if (mode === "loose") {
    itemCount = looseCart.reduce((sum, item) => sum + item.quantity, 0);
  } else {
    const builderKeys = Object.keys(components);
    const storageKeys = buildStorage.reduce((sum, s) => sum + s.quantity, 0);
    itemCount = builderKeys.length + storageKeys;
  }

  const price = getTotalPrice();

  return (
    <div className="fixed bottom-0 left-0 w-full z-[60] bg-[#1a0f0f] border-t border-border p-3 grid grid-cols-2 gap-3 lg:hidden shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
      
      <button 
        onClick={() => setMobileFilterOpen(true)}
        className="flex items-center justify-center gap-2 bg-transparent border border-zinc-700/80 px-2 py-3 rounded-lg text-sm font-semibold text-zinc-300 hover:bg-zinc-800 hover:text-white transition-all active:scale-95 min-w-0"
      >
        <SlidersHorizontal className="w-4 h-4 shrink-0" />
        <span className="truncate">Filters</span>
      </button>

      <button
        data-testid="cart-drawer-toggle"
        onClick={handleToggle}
        className="bg-brand text-white font-bold py-3 px-4 rounded-lg relative shadow-[0_0_15px_rgba(234,88,12,0.3)] hover:brightness-110 active:scale-95 transition-all flex flex-col items-center justify-center min-w-0"
      >
        <span className="absolute -top-2.5 right-0 bg-white text-brand border-2 border-brand text-[11px] h-[22px] min-w-[22px] px-1 flex items-center justify-center rounded-full font-black shadow-md z-10 translate-x-1/2">
          {itemCount}
        </span>
        <span className="text-[10px] uppercase font-black tracking-wider opacity-80 leading-tight">View Cart</span>
        <span className="text-sm font-mono leading-tight">{price.toLocaleString('no-NO')} Kr</span>
      </button>

    </div>
  );
}
