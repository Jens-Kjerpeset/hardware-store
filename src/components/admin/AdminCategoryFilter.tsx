'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useTransition } from 'react';
import { Loader2 } from 'lucide-react';

export function AdminCategoryFilter({ categories }: { categories: { id: string, name: string }[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const currentCategory = searchParams.get('category') || '';

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    const params = new URLSearchParams(searchParams);
    if (val) {
      params.set('category', val);
    } else {
      params.delete('category');
    }
    // reset page to 1
    params.delete('page');

    startTransition(() => {
      router.push(`/admin/products?${params.toString()}`);
    });
  };

  return (
    <div className="relative w-full md:w-48">
      <select 
        value={currentCategory} 
        onChange={handleCategoryChange}
        disabled={isPending}
        className="w-full bg-background border border-border rounded-md px-3 py-2 text-white text-sm focus:outline-none focus:border-brand appearance-none"
      >
        <option value="">All Categories</option>
        {categories.map(c => (
          <option key={c.id} value={c.id}>{c.name}</option>
        ))}
      </select>
      {isPending && (
        <div className="absolute right-8 top-1/2 -translate-y-1/2">
          <Loader2 className="w-4 h-4 text-zinc-400 animate-spin" />
        </div>
      )}
      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
        <svg className="w-4 h-4 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
      </div>
    </div>
  );
}
