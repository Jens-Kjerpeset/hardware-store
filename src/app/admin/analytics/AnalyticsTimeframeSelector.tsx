"use client";

import { useRouter } from "next/navigation";

export default function AnalyticsTimeframeSelector({
  initial,
}: {
  initial: string;
}) {
  const router = useRouter();

  return (
    <select
      className="bg-dark-bg border border-dark-border text-white text-sm rounded-lg px-3 py-2 cursor-pointer focus:outline-none focus:border-brand-500 transition-colors"
      value={initial}
      onChange={(e) => {
        router.push(`/admin/analytics?timeframe=${e.target.value}`);
      }}
    >
      <option value="7d">Last 7 Days</option>
      <option value="30d">Last 30 Days</option>
      <option value="year">Last 12 Months</option>
      <option value="all">All Time</option>
    </select>
  );
}
