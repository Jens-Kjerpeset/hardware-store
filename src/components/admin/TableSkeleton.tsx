export function TableSkeleton() {
  return (
    <div className="flex flex-col w-full py-8 space-y-8 animate-pulse">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-4">
        <div>
          <div className="h-8 w-64 bg-zinc-800/50 rounded-md mb-2"></div>
          <div className="h-4 w-96 bg-zinc-800/50 rounded-md"></div>
        </div>
        <div className="h-10 w-48 bg-zinc-800/50 rounded-md"></div>
      </div>
      <div className="w-full bg-surface border border-border rounded-xl">
        <div className="border-b border-border bg-[#141414] h-14"></div>
        <div className="p-4 space-y-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-16 w-full bg-zinc-800/50 rounded-md"></div>
          ))}
        </div>
      </div>
    </div>
  );
}
