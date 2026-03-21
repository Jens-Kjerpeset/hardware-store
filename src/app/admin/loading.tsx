import {
  MetricsSkeleton,
  TableSkeleton,
  PageHeaderSkeleton,
} from "./Skeletons";

export default function AdminRootLoading() {
  return (
    <div className="space-y-6">
      <PageHeaderSkeleton />
      <MetricsSkeleton />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <TableSkeleton />
        </div>
        <div className="h-[400px] bg-dark-surface/30 border border-dark-border mt-8 rounded animate-pulse"></div>
      </div>
    </div>
  );
}
