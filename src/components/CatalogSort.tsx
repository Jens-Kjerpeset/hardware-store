'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { ChevronDown, Loader2 } from 'lucide-react';
import { useTransition } from 'react';

export function CatalogSort() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  
  const currentSort = searchParams.get('sort') || '';
  
  // Options
  const sortOptions = [
    { label: 'Relevance', value: '' },
    { label: 'Price: Low to High', value: 'price_asc' },
    { label: 'Price: High to Low', value: 'price_desc' },
    { label: 'Alphabetical', value: 'name_asc' },
  ];
  
  return (
    <div className="relative group px-4 py-2 bg-background border border-border rounded-md text-sm font-medium text-zinc-400 flex items-center hover:border-zinc-500 transition-colors cursor-pointer shrink-0">
      <select
        data-testid="sort-select"
        aria-label="Sort catalog items"
        value={currentSort}
        onChange={(e) => {
          const params = new URLSearchParams(searchParams.toString());
          if (e.target.value) {
            params.set('sort', e.target.value);
          } else {
            params.delete('sort');
          }
          
          params.delete('page');

          startTransition(() => {
            router.push(`${pathname}?${params.toString()}`);
          });
        }}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer appearance-none text-base"
      >
        {sortOptions.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      
      <span className={`flex items-center gap-2 pointer-events-none transition-opacity min-w-0 ${isPending ? 'opacity-50' : ''}`}>
        {isPending && <Loader2 className="w-4 h-4 animate-spin text-brand shrink-0" />}
        {!isPending && <span className="truncate">{sortOptions.find(o => o.value === currentSort)?.label || 'Sort By'}</span>} 
        <ChevronDown className="w-4 h-4 shrink-0" />
      </span>
    </div>
  );
}
