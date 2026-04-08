'use client';

import { XCircle, HelpCircle, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { FilterCheckbox } from "./FilterCheckbox";
import { FilterRange } from "./FilterRange";
import { useBuilderStore } from "@/store/useBuilderStore";
import { useFocusTrap } from "@/hooks/useFocusTrap";
import type { FilterConfig } from "@/app/catalog/[category]/page";


const FilterTooltip = ({ text }: { text: string }) => (
  <div className="group relative inline-flex items-center ml-2 align-middle z-30">
    <HelpCircle className="w-3.5 h-3.5 text-brand cursor-help" />
    <div className="tooltip-content">
      {text}
      <div className="absolute top-full left-1/2 -translate-x-1/2 border-x-4 border-t-4 border-transparent border-t-border" />
    </div>
  </div>
);

// Helper to format raw JSON keys nicely
function formatKey(key: string) {
  // Convert camelCase or underscore to Title Case Words
  const spaced = key.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ');
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

export function FilterSidebar({ config }: { config: FilterConfig }) {
  const { isMobileFilterOpen, setMobileFilterOpen } = useBuilderStore();
  const sidebarRef = useRef<HTMLElement>(null);
  
  useFocusTrap(sidebarRef, isMobileFilterOpen, () => setMobileFilterOpen(false));

  useEffect(() => {
    if (isMobileFilterOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isMobileFilterOpen]);

  return (
    <>
    {/* Optional mobile backdrop */}
    {isMobileFilterOpen && (
      <div 
        className="fixed inset-0 bg-black/60 z-[60] lg:hidden backdrop-blur-sm"
        onClick={() => setMobileFilterOpen(false)}
      />
    )}
    <aside ref={sidebarRef} className={`shrink-0 lg:w-64 space-y-8 lg:bg-transparent overflow-y-auto ${
      isMobileFilterOpen 
        ? 'fixed bottom-0 left-0 w-full h-[85vh] bg-surface border-t border-border rounded-t-2xl p-6 pb-28 flex flex-col z-[70] animate-in slide-in-from-bottom-12 duration-300 shadow-[0_-10px_60px_rgba(0,0,0,0.8)] lg:static lg:h-auto lg:bg-transparent lg:border-none lg:p-0 lg:shadow-none lg:flex lg:animate-none' 
        : 'hidden lg:block lg:pl-2 lg:bg-transparent'
    }`}>
      <div className="flex items-center justify-between pb-4 border-b border-border">
        <h3 className="text-lg font-bold text-white">Filters</h3>
        <div className="flex items-center gap-3">
          {/* Clears all filters by linking to the base pathname without query params */}
          <Link onClick={() => setMobileFilterOpen(false)} href="?" scroll={false} className="text-xs text-zinc-400 hover:text-white flex items-center gap-1 transition-colors">
            Clear filters
            <XCircle className="w-4 h-4 text-brand bg-brand/20 rounded p-0.5" />
          </Link>
          <button onClick={() => setMobileFilterOpen(false)} className="lg:hidden text-zinc-400 hover:text-white" aria-label="Close Filters">
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="text-brand font-semibold text-sm flex items-center gap-1">
          Brand <FilterTooltip text="Filter by manufacturer" />
        </h4>
        <div className="space-y-3">
          {config.brands.map((brand: string) => (
             <FilterCheckbox key={brand} paramName="brand" value={brand} />
          ))}
        </div>
      </div>

      {/* Dynamic String Checkboxes */}
      {Object.entries(config.checkboxes).map(([key, values]: [string, string[]]) => (
        <div key={key} className="space-y-4">
          <h4 className="text-brand font-semibold text-sm flex items-center gap-1">
            {formatKey(key)} <FilterTooltip text={`Adjust ${formatKey(key).toLowerCase()} compatibility`} />
          </h4>
          <div className="space-y-3">
            {values.map((val: string) => (
               <FilterCheckbox key={val} paramName={key} value={val} />
            ))}
          </div>
        </div>
      ))}

      {/* Dynamic Numeric Ranges */}
      {Object.entries(config.ranges).map(([key, bounds]: [string, { min: number, max: number }]) => (
        <div key={key} className="space-y-4">
          <h4 className="text-brand font-semibold text-sm flex items-center gap-1">
            {formatKey(key)} <FilterTooltip text={`Drag sliders to restrict bounds for ${formatKey(key)}`} />
          </h4>
          <FilterRange paramName={key} min={bounds.min} max={bounds.max} />
        </div>
      ))}
    </aside>
    </>
  );
}
