"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { formatCurrency } from "@/lib/utils";
import { PieChartIcon } from "lucide-react";

const CATEGORY_COLORS: Record<string, string> = {
  GPU: "#3b82f6", // Blue
  CPU: "#10b981", // Emerald
  Motherboard: "#ef4444", // Red
  Storage: "#f59e0b", // Amber
  RAM: "#ec4899", // Pink
  "Power Supply": "#8b5cf6", // Purple
  Case: "#64748b", // Slate
  "CPU Cooler": "#06b6d4", // Cyan
  OS: "#0ea5e9", // Sky
  Uncategorized: "#9ca3af", // Gray
};

export default function AnalyticsCharts({
  categoryData,
  profitData,
}: {
  categoryData: any[];
  profitData: any[];
}) {
  const [mode, setMode] = useState<"revenue" | "profit">("revenue");
  const data = mode === "revenue" ? categoryData : profitData;
  const total = data.reduce((sum, d) => sum + d.value, 0);

  // Calculate percentages so they can be shown in tooltip
  const dataWithPct = data.map((d) => ({
    ...d,
    percentage: total > 0 ? (d.value / total) * 100 : 0,
  }));

  const renderTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-dark-surface border border-dark-border p-3 rounded-lg shadow-lg">
          <p className="font-bold text-white mb-1">{data.name}</p>
          <div className="flex gap-4">
            <span className="text-gray-400">
              {mode === "revenue" ? "Revenue:" : "Profit:"}
            </span>
            <span className="font-mono text-emerald-400 font-bold">
              {formatCurrency(data.value)}
            </span>
          </div>
          <div className="flex gap-4 mt-1 pt-1 border-t border-dark-border/50">
            <span className="text-gray-400">Share:</span>
            <span className="font-mono text-brand-400 font-bold">
              {data.percentage.toFixed(1)}%
            </span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="glass p-6 border border-dark-border flex flex-col h-fit rounded-xl">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <PieChartIcon className="w-5 h-5 text-gray-400" /> Segment Breakdown
        </h3>
        <div className="flex bg-dark-bg border border-dark-border rounded-lg p-1">
          <button
            onClick={() => setMode("revenue")}
            className={`px-3 py-1 text-xs font-bold rounded ${mode === "revenue" ? "bg-brand-500/20 text-brand-400" : "text-gray-400 hover:text-white"}`}
          >
            Revenue
          </button>
          <button
            onClick={() => setMode("profit")}
            className={`px-3 py-1 text-xs font-bold rounded ${mode === "profit" ? "bg-emerald-500/20 text-emerald-400" : "text-gray-400 hover:text-white"}`}
          >
            Profit
          </button>
        </div>
      </div>

      <div className="w-full h-[450px]">
        {dataWithPct.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={dataWithPct}
                cx="35%"
                cy="50%"
                innerRadius={100}
                outerRadius={140}
                paddingAngle={2}
                dataKey="value"
                stroke="none"
              >
                {dataWithPct.map((entry, index) => {
                  const fallbackColors = [
                    "#eab308",
                    "#2dd4bf",
                    "#f43f5e",
                    "#a855f7",
                    "#fb923c",
                  ];
                  const color =
                    CATEGORY_COLORS[entry.name] ||
                    fallbackColors[index % fallbackColors.length];
                  return <Cell key={`cell-${index}`} fill={color} />;
                })}
              </Pie>
              <Tooltip content={renderTooltip} isAnimationActive={false} />
              <Legend
                layout="vertical"
                verticalAlign="middle"
                align="right"
                wrapperStyle={{ right: 20, color: "#9ca3af", fontSize: "13px" }}
              />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-full items-center justify-center text-gray-500 italic">
            No category data available for this timeframe.
          </div>
        )}
      </div>
    </div>
  );
}
