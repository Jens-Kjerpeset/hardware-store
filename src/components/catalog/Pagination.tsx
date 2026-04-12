'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useTransition } from 'react';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
}

export function Pagination({ currentPage, totalPages }: PaginationProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  if (totalPages <= 1) return null;

  const createPageUrl = (pageNumber: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', pageNumber.toString());
    return `${pathname}?${params.toString()}`;
  };

  const handleNavigate = (pageNumber: number) => {
    if (pageNumber < 1 || pageNumber > totalPages || isPending) return;
    startTransition(() => {
      router.push(createPageUrl(pageNumber));
    });
  };

  return (
    <div className="flex items-center justify-center gap-4 mt-12 py-4">
      <button
        onClick={() => handleNavigate(currentPage - 1)}
        disabled={currentPage <= 1 || isPending}
        className="flex items-center gap-1.5 px-3 py-2 border border-border bg-surface text-sm font-medium  hover:bg-zinc-800 disabled:opacity-50 disabled:pointer-events-none transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
        Previous
      </button>

      <span className="text-sm text-zinc-400 font-medium min-w-[5ch] text-center">
        {isPending ? <Loader2 className="w-4 h-4 mx-auto animate-spin" /> : `${currentPage} / ${totalPages}`}
      </span>

      <button
        onClick={() => handleNavigate(currentPage + 1)}
        disabled={currentPage >= totalPages || isPending}
        className="flex items-center gap-1.5 px-3 py-2 border border-border bg-surface text-sm font-medium  hover:bg-zinc-800 disabled:opacity-50 disabled:pointer-events-none transition-colors"
      >
        Next
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}
