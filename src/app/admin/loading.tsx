import { DashboardSkeleton } from '@/components/admin/DashboardSkeleton';

export default function Loading() {
  return (
    <div className="flex flex-col w-full py-8 text-zinc-100 max-w-6xl mx-auto space-y-8">
      <div>
        <div className="h-8 w-64 bg-zinc-800/50  animate-pulse mb-2"></div>
        <div className="h-4 w-96 bg-zinc-800/50  animate-pulse"></div>
      </div>
      <DashboardSkeleton />
    </div>
  );
}
