'use client';
import { useBuilderStore } from "@/store/useBuilderStore";
import { SlidersHorizontal } from "lucide-react";

export function MobileFilterTrigger() {
  const { setMobileFilterOpen } = useBuilderStore();

  return (
    <button 
      onClick={() => setMobileFilterOpen(true)}
      className="lg:hidden flex items-center justify-center gap-2 bg-surface border border-border px-4 py-2.5  text-zinc-300 hover:text-white hover:border-zinc-500 transition-colors font-medium text-sm h-[44px]"
    >
      <SlidersHorizontal className="w-4 h-4" />
      Filters
    </button>
  );
}
