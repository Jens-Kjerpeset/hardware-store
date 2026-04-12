export default function Loading() {
  return (
    <div className="flex flex-col w-full py-8 space-y-8 animate-pulse max-w-4xl mx-auto">
      <div>
        <div className="h-8 w-64 bg-zinc-800/50  mb-2"></div>
        <div className="h-4 w-96 bg-zinc-800/50 "></div>
      </div>
      <div className="space-y-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="w-full bg-surface border border-border p-6  h-48"></div>
        ))}
      </div>
    </div>
  );
}
