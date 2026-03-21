"use client";

import { useRouter, useSearchParams } from "next/navigation";

export function TimeframeSelector() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentTimeframe = searchParams.get("timeframe") || "all";

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newTimeframe = e.target.value;
    router.push(`/admin?timeframe=${newTimeframe}`);
  };

  return (
    <div className="flex items-center gap-2">
      <label htmlFor="timeframe" className="text-sm font-medium text-gray-400">
        Timeframe:
      </label>
      <select
        id="timeframe"
        value={currentTimeframe}
        onChange={handleChange}
        className="bg-dark-surface border border-dark-border  px-3 py-1.5 text-sm text-white focus:outline-none focus:border-brand-500 hover:bg-white/5 transition-colors cursor-pointer"
      >
        <option value="all">All Time</option>
        <option value="year">Past Year</option>
        <option value="month">Past Month</option>
        <option value="week">Past Week</option>
        <option value="day">Past 24 Hours</option>
      </select>
    </div>
  );
}
