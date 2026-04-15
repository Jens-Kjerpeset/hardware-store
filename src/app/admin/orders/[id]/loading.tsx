export default function Loading() {
  return (
    <div className="flex flex-col w-full max-w-5xl mx-auto py-8 text-zinc-100 space-y-8">
      {/* Header controls skeleton */}
      <div className="flex items-center justify-between bg-surface p-4 border border-border">
        <div className="w-32 h-5 bg-background border border-border animate-pulse" />
        <div className="w-56 h-10 bg-background border border-border animate-pulse" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Column: Details & Items */}
        <div className="lg:col-span-2 space-y-8">
          
          <div className="bg-surface border border-border p-8 space-y-6">
            <div className="flex justify-between items-start">
              <div className="w-1/3">
                <div className="w-48 h-7 bg-background border border-border animate-pulse mb-2" />
                <div className="w-24 h-4 bg-background border border-border animate-pulse" />
              </div>
              <div className="w-1/3 flex flex-col items-end">
                <div className="w-32 h-8 bg-background border border-border animate-pulse mb-2" />
                <div className="w-24 h-4 bg-background border border-border animate-pulse" />
              </div>
            </div>
          </div>

          <div className="bg-surface border border-border p-6 space-y-4">
             <div className="w-32 h-6 bg-background border border-border animate-pulse mb-4 border-b border-border pb-4" />
             <div className="space-y-4">
               {[...Array(3)].map((_, i) => (
                 <div key={i} className="flex justify-between items-center gap-4 py-2 border-b border-border/50 last:border-0">
                    <div className="flex-1 flex items-center gap-4">
                       <div className="w-12 h-12 bg-background border border-border shrink-0 animate-pulse" />
                       <div className="w-full max-w-[200px]">
                         <div className="w-full h-4 bg-background border border-border animate-pulse mb-2" />
                         <div className="w-2/3 h-3 bg-background border border-border animate-pulse" />
                       </div>
                    </div>
                    <div className="w-24 flex flex-col items-end">
                       <div className="w-16 h-4 bg-background border border-border animate-pulse mb-2" />
                       <div className="w-full h-4 bg-background border border-border animate-pulse" />
                    </div>
                 </div>
               ))}
             </div>
          </div>

        </div>

        {/* Right Column: Customer & Status Map */}
        <div className="space-y-8">
           
           <div className="bg-surface border border-border p-6 space-y-6">
              <div className="w-40 h-6 bg-background border border-border animate-pulse mb-4 border-b border-border pb-4" />
              
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i}>
                    <div className="w-32 h-3 bg-background border border-border animate-pulse mb-2" />
                    <div className="w-full h-10 bg-background border border-border animate-pulse" />
                  </div>
                ))}
              </div>
           </div>

           <div className="bg-surface border border-border p-6 space-y-4 text-sm">
              <div className="w-40 h-6 bg-background border border-border animate-pulse mb-4 border-b border-border pb-4" />
              
              <div>
                <div className="w-20 h-3 bg-background border border-border animate-pulse mb-2" />
                <div className="w-1/2 h-5 bg-background border border-border animate-pulse mb-1" />
                <div className="w-3/4 h-4 bg-background border border-border animate-pulse" />
              </div>

              <div className="pt-2">
                <div className="w-32 h-3 bg-background border border-border animate-pulse mb-2" />
                <div className="w-full h-16 bg-background border border-border animate-pulse mt-2" />
              </div>
           </div>

        </div>
      </div>
    </div>
  );
}
