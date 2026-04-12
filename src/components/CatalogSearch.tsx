'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Search, Loader2, X } from 'lucide-react';
import { useState, FormEvent, useEffect, useRef, useTransition } from 'react';

export function CatalogSearch({ alwaysOpen = false, inlineMobile = false }: { alwaysOpen?: boolean, inlineMobile?: boolean } = {}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [isOpen, setIsOpen] = useState(alwaysOpen || !!searchParams.get('q'));
  const desktopRef = useRef<HTMLInputElement>(null);
  const mobileRef = useRef<HTMLInputElement>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (isOpen) {
       desktopRef.current?.focus();
       mobileRef.current?.focus();
    }
  }, [isOpen]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (query.trim()) {
      params.set('q', query.trim());
    } else {
      params.delete('q');
    }

    params.delete('page');

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  return (
    <>
      {/* Universal Trigger Button */}
      {(!isOpen && !alwaysOpen) && (
         <button 
           aria-label="Open Search" 
           onClick={() => setIsOpen(true)} 
           className="p-2.5 bg-background border border-border  hover:bg-surface-hover hover:text-white text-zinc-400 transition-colors shrink-0"
         >
            <Search className="w-4 h-4" />
         </button>
      )}

      {/* Inline Search (Desktop default, or Mobile if inlineMobile is true) */}
      {(isOpen || alwaysOpen) && (
        <form onSubmit={handleSubmit} className={`${inlineMobile ? 'flex' : 'hidden md:flex'} flex-1 items-center relative bg-background border border-border  overflow-hidden focus-within:border-brand shrink-0 text-sm transition-opacity ${isPending ? 'opacity-50 pointer-events-none' : ''}`}>
           <button type="submit" aria-label="Submit Search" className="p-2.5 text-zinc-400 hover:text-brand transition-colors shrink-0">
              {isPending ? <Loader2 className="w-4 h-4 animate-spin text-brand" /> : <Search className="w-4 h-4" />}
           </button>
           <input 
             ref={desktopRef}
             type="text" 
             aria-label="Search items"
             placeholder="Target component..." 
             className="w-[220px] bg-transparent focus:outline-none text-white py-1.5 pr-4 h-full shrink-0"
             value={query}
             onChange={e => setQuery(e.target.value)}
           />
           {!alwaysOpen && (
             <button 
               type="button" 
               onClick={() => setIsOpen(false)} 
               className="p-2 text-zinc-500 hover:text-white mr-1 shrink-0 bg-transparent flex items-center justify-center  transition-colors"
               aria-label="Close search"
             >
               <X className="w-3.5 h-3.5" />
             </button>
           )}
        </form>
      )}

      {/* Mobile Fixed Search Overlay (Only if not inlineMobile) */}
      {(isOpen || alwaysOpen) && !inlineMobile && (
        <div className="md:hidden w-0 h-0 overflow-visible relative">
          <form 
            onSubmit={(e) => {
               handleSubmit(e);
               if (!alwaysOpen) setIsOpen(false);
            }} 
            className={`fixed top-16 left-0 w-screen max-w-[100vw] z-[45] bg-surface border-b border-border p-3  animate-in slide-in-from-top-2 ${isPending ? 'opacity-50 pointer-events-none' : ''}`}
          >
             <div className="flex items-center gap-2 max-w-[1920px] mx-auto px-1">
               <div className="relative flex-1">
                 <input 
                   ref={mobileRef}
                   autoFocus
                   type="text" 
                   aria-label="Search items"
                   placeholder="Search components..." 
                   className="w-full bg-background border border-border focus:border-brand focus:outline-none text-white py-2.5 pl-4 pr-10  text-base"
                   value={query}
                   onChange={e => setQuery(e.target.value)}
                   onKeyDown={(e) => {
                     if (e.key === 'Enter') {
                       e.preventDefault();
                       handleSubmit(e as unknown as FormEvent);
                       if (!alwaysOpen) setIsOpen(false);
                     }
                   }}
                 />
                 {!alwaysOpen && (
                   <button 
                     type="button" 
                     onClick={() => setIsOpen(false)}
                     className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-zinc-400 hover:text-white  transition-colors"
                     aria-label="Close Mobile Search"
                   >
                     <X className="w-5 h-5" />
                   </button>
                 )}
               </div>
               
               <button 
                 type="submit"
                 className="flex items-center justify-center px-4 py-2.5 text-sm font-bold text-white bg-brand border border-brand hover:brightness-110  shrink-0 active:scale-95 transition-all"
                 aria-label="Submit Search"
               >
                 {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
               </button>
             </div>
          </form>
        </div>
      )}
    </>
  );
}
