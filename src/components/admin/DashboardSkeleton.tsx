export function DashboardSkeleton() {
  return (
    <div className="flex flex-col w-full space-y-8 animate-pulse text-zinc-100 max-w-6xl mx-auto">
      {/* Top-Level Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-surface border border-border p-6  h-32">
             <div className="h-4 w-1/2 bg-zinc-800/50  mb-4"></div>
             <div className="h-8 w-2/3 bg-zinc-800/50 "></div>
          </div>
        ))}
      </div>

      {/* Operations Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
         {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-surface border border-border p-6  h-48">
             <div className="h-6 w-1/2 bg-zinc-800/50  mb-4"></div>
             <div className="space-y-3">
               <div className="h-4 w-full bg-zinc-800/50 "></div>
               <div className="h-4 w-full bg-zinc-800/50 "></div>
               <div className="h-4 w-3/4 bg-zinc-800/50 "></div>
             </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         <div className="lg:col-span-2 bg-surface border border-border p-6  h-[400px]">
            <div className="h-6 w-1/3 bg-zinc-800/50  mb-4"></div>
            <div className="h-full w-full bg-zinc-800/50 "></div>
         </div>
         <div className="lg:col-span-1 bg-surface border border-border p-6  h-[400px]">
            <div className="h-6 w-1/2 bg-zinc-800/50  mb-4"></div>
            <div className="h-full w-full bg-zinc-800/50 "></div>
         </div>
      </div>
    </div>
  );
}
