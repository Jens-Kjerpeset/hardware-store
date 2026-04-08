'use client';

import { useState, useEffect, useRef } from "react";
import { useBuilderStore } from "@/store/useBuilderStore";
import { useFocusTrap } from "@/hooks/useFocusTrap";
import { Trash2, AlertTriangle, ShoppingCart, ChevronRight, X, Share2, Check } from "lucide-react";
import Link from "next/link";

const REQUIRED_CATEGORIES = [
  "CPU", "Motherboard", "GPU", "RAM", "Storage", 
  "Power Supply", "CPU Cooler", "Case", "OS"
];

export function BuilderSidebar() {
  const { components, buildStorage, issues, clearBuilder, getTotalPrice, mode, setMode, isMobileCartOpen, setMobileCartOpen } = useBuilderStore();
  const sidebarRef = useRef<HTMLElement>(null);
  const [copied, setCopied] = useState(false);

  useFocusTrap(sidebarRef, isMobileCartOpen, () => setMobileCartOpen(false));

  useEffect(() => {
    if (isMobileCartOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isMobileCartOpen]);

  if (mode !== "build") return null;

  const totalPrice = getTotalPrice();
  
  const assignedKeys = Object.keys(components);
  const missingCategories = REQUIRED_CATEGORIES.filter(cat => {
    if (cat === "Storage") {
      // Must have at least one SSD to satisfy "Storage" requirement
      return !buildStorage.some(s => s.specs?.storageType === "SSD");
    }
    return !assignedKeys.includes(cat);
  });

  // Derived validation strictly gates the checkout pipeline
  const isReadyToCheckout = missingCategories.length === 0 && issues.length === 0 && (assignedKeys.length > 0 || buildStorage.length > 0);

  const handleShare = () => {
    try {
      const baseUrl = window.location.origin;
      const params = new URLSearchParams();
      params.set('title', 'My PC Build');
      params.set('price', totalPrice.toLocaleString('no-NO'));
      if (components["CPU"]) params.set('cpu', components["CPU"].name);
      if (components["GPU"]) params.set('gpu', components["GPU"].name);
      
      const shareUrl = `${baseUrl}/api/og?${params.toString()}`;
      navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch(e) {}
  };

  return (
    <>
    {/* Optional backdrop for mobile */}
    {isMobileCartOpen && (
      <div 
        className="fixed inset-0 bg-black/60 z-[60] lg:hidden backdrop-blur-sm"
        onClick={() => setMobileCartOpen(false)}
      />
    )}
    <aside ref={sidebarRef} className={`w-full lg:w-[320px] shrink-0 bg-surface border-x-0 lg:border-x border-y-0 lg:border-y border-border lg:rounded-lg h-full lg:h-fit max-h-[100vh] lg:max-h-[calc(100vh-2rem)] flex-col lg:sticky top-0 lg:top-4 shadow-2xl z-[70] lg:z-auto transition-transform ${isMobileCartOpen ? 'fixed right-0 inset-y-0 flex animate-in slide-in-from-right-8 duration-300' : 'hidden lg:flex'}`}>
      {/* Screen Reader Live Region */}
      <div className="sr-only" aria-live="polite">
        Cart updated. {assignedKeys.length} items assigned. {issues.length} compatibility {issues.length === 1 ? 'issue' : 'issues'} detected.
      </div>

      {/* Header */}
      <div className="p-4 border-b border-border flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">System Builder</h2>
        <div className="flex items-center gap-4">
          <button 
            onClick={clearBuilder}
            className="text-zinc-400 hover:text-red-500 transition-colors"
            title="Clear Builder"
          >
            <Trash2 className="w-5 h-5" />
          </button>
          <div className="relative text-zinc-400">
            <ShoppingCart className="w-5 h-5" />
            <span className="absolute -top-2 -right-2 bg-brand text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
              {assignedKeys.length}
            </span>
          </div>
          <button onClick={() => setMobileCartOpen(false)} className="lg:hidden text-zinc-400 hover:text-white p-1" aria-label="Close Cart">
             <X className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        
        {/* Build Status */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-white">Build Status</h3>
          
          {/* Dynamic Conflicts Warning */}
          {issues.length > 0 && (
             <div 
                className="text-sm p-3 bg-red-950/20 border border-red-900/50 rounded-md text-red-400 space-y-2"
                role="alert"
                aria-live="assertive"
             >
                <div className="flex items-center gap-2 font-medium">
                  <AlertTriangle className="w-4 h-4" />
                  System Conflicts
                </div>
                <ul className="list-disc pl-5 text-xs text-red-300/80 space-y-1">
                  {issues.map((issue, idx) => (
                    <li key={idx}>{issue.message}</li>
                  ))}
                </ul>
             </div>
          )}

          {/* Missing Parts List */}
          <div className="space-y-2">
            <div className="text-xs text-amber-500 font-medium">Missing Required Parts</div>
            <div className="flex flex-wrap gap-2">
              {missingCategories.map(cat => (
                <Link 
                  key={cat} 
                  href={`/catalog/${cat.toLowerCase().replace(/ /g, '-')}`}
                  className="text-[10px] font-semibold tracking-wide border border-amber-900/50 text-amber-600 px-2 py-1 rounded bg-amber-950/10 hover:bg-amber-900/30 hover:text-amber-400 transition-colors"
                >
                  {cat}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Assigned Components */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-zinc-400">Assigned Components</h3>
          <div className="space-y-2">
            {assignedKeys.length === 0 && buildStorage.length === 0 ? (
              <div className="text-sm text-zinc-600 italic px-2">No components selected yet.</div>
            ) : (
              <>
                {assignedKeys.map(key => {
                  const isConflicting = issues.some(issue => issue.involvedCategories.includes(key));
                  
                  return (
                    <div key={key} className={`p-3 border rounded-md transition-colors group relative ${
                      isConflicting 
                        ? 'border-red-900/50 bg-red-950/10 hover:border-red-500/50' 
                        : 'border-border bg-surface hover:border-zinc-500'
                    }`}>
                       <div className={`text-[10px] flex items-center gap-1 mb-1 font-semibold ${
                         isConflicting ? 'text-red-500' : 'text-zinc-400'
                       }`}>
                          {isConflicting && <AlertTriangle className="w-3 h-3" />}
                          {key}
                       </div>
                       <div className="text-sm text-white font-medium pr-16">{components[key].name}</div>
                       <div className="absolute right-3 bottom-3 text-brand font-mono font-bold text-sm">
                          {components[key].price.toLocaleString('no-NO')} Kr
                       </div>
                    </div>
                  );
                })}
                {buildStorage.map(item => {
                  return (
                    <div key={item.id} className="p-3 border rounded-md transition-colors group relative border-border bg-surface hover:border-zinc-500">
                       <div className="text-[10px] flex items-center gap-1 mb-1 font-semibold text-zinc-400">
                          Storage {item.quantity > 1 ? `(x${item.quantity})` : ''} 
                       </div>
                       <div className="text-sm text-white font-medium pr-16">{item.name}</div>
                       <div className="absolute right-3 bottom-3 text-brand font-mono font-bold text-sm">
                          {(item.price * item.quantity).toLocaleString('no-NO')} Kr
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
          <span className="text-xl text-white font-bold font-mono">{totalPrice.toLocaleString('no-NO')} Kr</span>
        </div>

        {isReadyToCheckout ? (
          <Link
            href="/checkout"
            className="w-full flex items-center justify-center p-3 rounded font-medium transition-colors border bg-emerald-600 hover:bg-emerald-500 border-emerald-500 hover:border-emerald-400 text-white shadow-[0_0_15px_rgba(16,185,129,0.3)]"
          >
            Checkout Securely
          </Link>
        ) : (
          <button 
            disabled
            className="w-full flex items-center justify-center p-3 rounded font-medium transition-colors border bg-surface border-border text-zinc-400 cursor-not-allowed"
          >
            Resolve Issues to Checkout
          </button>
        )}
        
        <button 
          onClick={handleShare}
          className="w-full flex items-center justify-center gap-2 p-2 rounded text-sm font-medium transition-colors bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
        >
          {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
          {copied ? 'Copied Image Link!' : 'Share Build Image'}
        </button>

        <button 
          onClick={() => setMode('loose')}
          className="w-full text-center text-sm text-amber-500 font-medium hover:text-amber-400 transition-colors"
        >
          Switch to buying loose parts
        </button>
      </div>
    </aside>
    </>
  );
}
