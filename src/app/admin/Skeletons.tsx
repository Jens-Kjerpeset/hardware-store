// src/app/admin/Skeletons.tsx
import { DollarSign, TrendingUp, PackageSearch, Activity } from "lucide-react";

export function PageHeaderSkeleton() {
  return (
    <div className="flex justify-between items-center mb-6 animate-pulse">
      <div>
        <div className="h-8 bg-gray-700/50 rounded w-64 mb-2"></div>
        <div className="h-4 bg-gray-800/50 rounded w-96"></div>
      </div>
      <div className="h-10 bg-gray-700/50 rounded w-32"></div>
    </div>
  );
}

export function MetricsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
      {/* Revenue Skeleton */}
      <div className="glass p-6  flex items-center gap-4 bg-gradient-to-br from-dark-surface to-dark-bg border border-dark-border">
        <div className="h-12 w-12  bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 shrink-0">
          <DollarSign className="w-6 h-6 text-emerald-400" />
        </div>
        <div className="min-w-0 flex-1 space-y-2">
          <div className="h-4 bg-gray-700/50  w-24"></div>
          <div className="h-7 bg-gray-600/50  w-32"></div>
        </div>
      </div>

      {/* Expenses Skeleton */}
      <div className="glass p-6  flex items-center gap-4 bg-gradient-to-br from-dark-surface to-dark-bg border border-dark-border">
        <div className="h-12 w-12  bg-rose-500/10 flex items-center justify-center border border-rose-500/20 shrink-0">
          <TrendingUp className="w-6 h-6 text-rose-400 rotate-180" />
        </div>
        <div className="min-w-0 flex-1 space-y-2">
          <div className="h-4 bg-gray-700/50  w-24"></div>
          <div className="h-7 bg-gray-600/50  w-32"></div>
        </div>
      </div>

      {/* Profit Skeleton */}
      <div className="glass p-6  flex items-center gap-4 bg-gradient-to-br from-dark-surface to-dark-bg border border-dark-border">
        <div className="h-12 w-12  bg-orange-500/10 flex items-center justify-center border border-orange-500/20 shrink-0">
          <Activity className="w-6 h-6 text-orange-400" />
        </div>
        <div className="min-w-0 flex-1 space-y-2">
          <div className="h-4 bg-gray-700/50  w-24"></div>
          <div className="h-7 bg-gray-600/50  w-32"></div>
        </div>
      </div>

      {/* Units Sold Skeleton */}
      <div className="glass p-6  flex items-center gap-4 bg-gradient-to-br from-dark-surface to-dark-bg border border-dark-border">
        <div className="h-12 w-12  bg-purple-500/10 flex items-center justify-center border border-purple-500/20 shrink-0">
          <PackageSearch className="w-6 h-6 text-purple-400" />
        </div>
        <div className="min-w-0 flex-1 space-y-2">
          <div className="h-4 bg-gray-700/50  w-24"></div>
          <div className="h-7 bg-gray-600/50  w-32"></div>
        </div>
      </div>
    </div>
  );
}

export function TableSkeleton() {
  return (
    <div className="mt-8 animate-pulse space-y-4">
      <div className="h-7 bg-gray-700/50  w-48 mb-4"></div>

      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="glass  border border-dark-border overflow-hidden bg-dark-surface/30 opacity-70"
        >
          <div className="w-full px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 bg-gray-700/50 "></div>
              <div className="h-6 bg-gray-600/50  w-40"></div>
              <div className="h-5 bg-gray-700/50  w-24"></div>
            </div>
            <div className="flex gap-6">
              <div className="h-8 bg-gray-700/50  w-16"></div>
              <div className="h-8 bg-gray-700/50  w-16"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
