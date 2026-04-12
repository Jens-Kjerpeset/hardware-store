'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useTransition } from 'react';

interface FilterCheckboxProps {
  paramName: string;
  value: string;
}

export function FilterCheckbox({ paramName, value }: FilterCheckboxProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  
  // Check if this specific filter is currently active in the URL
  const activeValues = searchParams.getAll(paramName);
  const isChecked = activeValues.includes(value);

  const toggleFilter = () => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (isChecked) {
      // Remove value if already checked
      const newValues = activeValues.filter(v => v !== value);
      params.delete(paramName);
      newValues.forEach(v => params.append(paramName, v));
    } else {
      // Add value
      params.append(paramName, value);
    }

    params.delete('page');

    // Push new URL without triggering a full page reload, preserving scroll state
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    });
  };

  return (
    <label className={`flex items-center gap-3 cursor-pointer group transition-opacity ${isPending ? 'opacity-50 pointer-events-none' : ''}`}>
      <div className="relative flex items-center justify-center">
        <input 
          type="checkbox" 
          className="sr-only peer" 
          checked={isChecked}
          onChange={toggleFilter}
          aria-label={`Filter by ${value}`}
        />
        <div className={`w-4 h-4 border  transition-colors ${
          isChecked 
            ? 'bg-brand border-brand' 
            : 'border-border bg-surface group-hover:border-brand peer-focus-visible:ring-2 peer-focus-visible:ring-brand peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-background'
        }`}>
          {isChecked && (
            <svg className="w-3 h-3 text-white absolute inset-0 m-auto pointer-events-none" viewBox="0 0 14 14" fill="none">
              <path d="M3 8L6 11L11 3.5" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
            </svg>
          )}
        </div>
      </div>
      <span className={`text-sm transition-colors ${isChecked ? 'text-white font-medium' : 'text-zinc-400 group-hover:text-white'}`}>
        {value}
      </span>
    </label>
  );
}
