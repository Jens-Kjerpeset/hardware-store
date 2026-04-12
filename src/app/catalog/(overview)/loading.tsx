export default function CategoryLoading() {
  return (
    <div className="w-full animate-pulse space-y-8">
      {/* Hero Banner Placeholder */}
      <div className="w-full h-[140px] bg-surface/50 border border-border  flex flex-col items-center justify-center gap-3">
        <div className="h-8 bg-zinc-800  w-64" />
        <div className="h-4 bg-zinc-800  w-96" />
      </div>

      {/* Categories Grid Placeholder */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} className="bg-surface/50 border border-border  h-[160px] flex flex-col items-center justify-center p-6 gap-4">
            <div className="w-10 h-10 bg-zinc-800 " />
            <div className="h-5 bg-zinc-800  w-24" />
            <div className="h-3 bg-zinc-800  w-48" />
          </div>
        ))}
      </div>
    </div>
  );
}
