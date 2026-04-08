export default function ProductGridLoading() {
  return (
    <div className="flex flex-col lg:flex-row gap-8 items-start w-full">
      {/* Filters Sidebar Skeleton (Hidden on mobile to match FilterSidebar behavior) */}
      <div className="hidden lg:flex w-64 shrink-0 flex-col gap-8 animate-pulse pt-2">
        <div className="flex justify-between items-center pb-4 border-b border-border">
          <div className="h-6 bg-zinc-800 rounded w-24" />
          <div className="h-4 bg-zinc-800 rounded w-16" />
        </div>
        
        {/* Fake Filter Blocks */}
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-4">
            <div className="h-4 bg-zinc-800 rounded w-20" />
            <div className="space-y-3">
              <div className="h-4 bg-zinc-800 rounded w-full" />
              <div className="h-4 bg-zinc-800 rounded w-5/6" />
              <div className="h-4 bg-zinc-800 rounded w-4/6" />
            </div>
          </div>
        ))}
      </div>

      {/* Product Grid Skeleton */}
      <div className="flex-1 w-full space-y-6">
        {/* Top Bar Skeleton (Category Switcher / Search / Sort) */}
        <div className="h-14 w-full bg-surface/50 border border-border rounded-md animate-pulse" />

        {/* 3-Column Grid matching the xl:grid-cols-3 layout shown in the UI */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-surface/50 border border-border rounded-lg overflow-hidden flex flex-col h-[400px] animate-pulse">
              <div className="w-full bg-zinc-800/80 aspect-square p-8" />
              <div className="p-5 flex-1 flex flex-col gap-3">
                <div className="h-3 bg-zinc-800 rounded w-16 mb-1" />
                <div className="h-5 bg-zinc-800 rounded w-3/4 mb-4" />
                <div className="flex flex-wrap gap-2 mb-6">
                  <div className="h-5 bg-zinc-800 rounded w-16" />
                  <div className="h-5 bg-zinc-800 rounded w-20" />
                  <div className="h-5 bg-zinc-800 rounded w-24" />
                </div>
                <div className="mt-auto">
                  <div className="h-3 bg-zinc-800 rounded w-12 mb-2" />
                  <div className="h-6 bg-zinc-800 rounded w-28 mb-4" />
                  <div className="h-11 bg-zinc-800 rounded w-full" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
