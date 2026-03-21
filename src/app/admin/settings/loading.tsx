import { PageHeaderSkeleton } from "../Skeletons";

export default function SettingsLoading() {
  return (
    <div className="space-y-6">
      <PageHeaderSkeleton />
      <div className="flex flex-col lg:flex-row gap-8 mt-8">
        {/* Sidebar Skeleton */}
        <div className="w-full lg:w-64 shrink-0 space-y-2">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-10 w-full bg-dark-surface/50 rounded animate-pulse"
            ></div>
          ))}
        </div>
        {/* Content Skeleton */}
        <div className="flex-1 space-y-6">
          <div className="h-[300px] w-full bg-dark-surface/30 border border-dark-border rounded animate-pulse"></div>
        </div>
      </div>
    </div>
  );
}
