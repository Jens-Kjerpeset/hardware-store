import { MetricsSkeleton, PageHeaderSkeleton } from "../Skeletons";

export default function AnalyticsLoading() {
  return (
    <div className="space-y-6">
      <PageHeaderSkeleton />
      <MetricsSkeleton />
      <div className="h-[400px] w-full bg-dark-surface/30 border border-dark-border mt-8 rounded animate-pulse"></div>
    </div>
  );
}
