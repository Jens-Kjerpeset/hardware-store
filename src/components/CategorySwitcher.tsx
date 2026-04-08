'use client';

import { useRouter } from 'next/navigation';
import { ChevronDown, Loader2 } from 'lucide-react';
import { useTransition } from 'react';

interface CategorySwitcherProps {
  currentCategoryName: string;
  categories: { name: string; slug: string }[];
}

export function CategorySwitcher({ currentCategoryName, categories }: CategorySwitcherProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <div className="relative group px-4 py-2 bg-background border border-border rounded-md text-sm font-medium text-white flex items-center hover:border-zinc-500 transition-colors cursor-pointer">
      <select
        data-testid="category-select"
        aria-label="Select category"
        value={currentCategoryName}
        onChange={(e) => {
          const selectedName = e.target.value;
          const selected = categories.find(c => c.name === selectedName);
          if (selected) {
            startTransition(() => {
              router.push(`/catalog/${selected.slug}`);
            });
          }
        }}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer appearance-none text-base"
      >
        {categories.map(cat => (
          <option key={cat.name} value={cat.name}>
            {cat.name}
          </option>
        ))}
      </select>
      
      <span className={`flex items-center gap-2 pointer-events-none transition-opacity min-w-0 ${isPending ? 'opacity-50' : ''}`}>
        {isPending && <Loader2 className="w-4 h-4 text-brand animate-spin shrink-0" />}
        {!isPending && <span className="truncate">{currentCategoryName}</span>} 
        {!isPending && <ChevronDown className="w-4 h-4 text-brand shrink-0" />}
      </span>
    </div>
  );
}
