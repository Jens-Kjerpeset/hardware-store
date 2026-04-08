'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useState, useEffect, useTransition } from 'react';

interface FilterRangeProps {
  paramName: string; // The base JSON key (e.g., 'cores')
  min: number;
  max: number;
}

export function FilterRange({ paramName, min, max }: FilterRangeProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // URL parameters to listen to
  const minKey = `min_${paramName}`;
  const maxKey = `max_${paramName}`;

  // Local state for immediate input feedback (URL updates on blur/enter)
  const [localMin, setLocalMin] = useState<string>(searchParams.get(minKey) || min.toString());
  const [localMax, setLocalMax] = useState<string>(searchParams.get(maxKey) || max.toString());

  // Keep local state synced if URL changes externally (e.g., Clear Filters)
  useEffect(() => {
    setLocalMin(searchParams.get(minKey) || min.toString());
    setLocalMax(searchParams.get(maxKey) || max.toString());
  }, [searchParams, minKey, maxKey, min, max]);

  const applyRange = (newMin: string, newMax: string) => {
    const params = new URLSearchParams(searchParams.toString());
    
    // Only push if different from absolute database bounds
    if (newMin && parseFloat(newMin) > min) {
      params.set(minKey, newMin);
    } else {
      params.delete(minKey);
    }

    if (newMax && parseFloat(newMax) < max) {
      params.set(maxKey, newMax);
    } else {
      params.delete(maxKey);
    }

    params.delete('page');

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    });
  };

  const handleBlur = () => applyRange(localMin, localMax);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') applyRange(localMin, localMax);
  };

  return (
    <div className={`space-y-4 transition-opacity ${isPending ? 'opacity-50 pointer-events-none' : ''}`}>
      {/* Min / Max inputs */}
      <div className="flex items-center gap-2">
        <input 
          type="number" 
          step="any"
          data-testid="min-range-input"
          value={localMin}
          onChange={(e) => setLocalMin(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className="w-full bg-background border border-border rounded p-1.5 text-sm text-white focus:border-brand focus:ring-1 focus:ring-brand focus:outline-none text-center"
          aria-label={`Minimum ${paramName}`}
        />
        <span className="text-zinc-400">-</span>
        <input 
          type="number"
          step="any"
          data-testid="max-range-input"
          value={localMax}
          onChange={(e) => setLocalMax(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className="w-full bg-background border border-border rounded p-1.5 text-sm text-white focus:border-brand focus:ring-1 focus:ring-brand focus:outline-none text-center"
          aria-label={`Maximum ${paramName}`}
        />
      </div>

      {/* Interactive Dual-Range Slider */}
      <div className="relative w-full h-8 flex items-center group">
        {/* Track Base */}
        <div className="absolute w-full h-1 bg-surface-hover rounded-full"></div>
        
        {/* Active Range Highlight */}
        <div 
          className="absolute h-1 bg-brand rounded-full pointer-events-none"
          style={{
             left: `${((parseFloat(localMin || min.toString()) - min) / (Math.max(0.1, max - min))) * 100}%`,
             right: `${100 - ((parseFloat(localMax || max.toString()) - min) / (Math.max(0.1, max - min))) * 100}%`
          }}
        ></div>

        {/* Min Slider */}
        <input
          type="range"
          min={min}
          max={max}
          step={(max - min) > 10 ? '1' : '0.1'}
          value={localMin || min.toString()}
          onChange={(e) => {
             const currentMax = parseFloat(localMax || max.toString());
             const val = Math.min(parseFloat(e.target.value), currentMax);
             setLocalMin(val.toString());
          }}
          onMouseUp={handleBlur}
          onTouchEnd={handleBlur}
          className="multi-thumb-slider z-30 focus-visible:outline-none"
          aria-label={`Adjust Minimum ${paramName}`}
        />

        {/* Max Slider */}
        <input
          type="range"
          min={min}
          max={max}
          step={(max - min) > 10 ? '1' : '0.1'}
          value={localMax || max.toString()}
          onChange={(e) => {
             const currentMin = parseFloat(localMin || min.toString());
             const val = Math.max(parseFloat(e.target.value), currentMin);
             setLocalMax(val.toString());
          }}
          onMouseUp={handleBlur}
          onTouchEnd={handleBlur}
          className="multi-thumb-slider z-20 focus-visible:outline-none"
          aria-label={`Adjust Maximum ${paramName}`}
        />
      </div>
    </div>
  );
}
