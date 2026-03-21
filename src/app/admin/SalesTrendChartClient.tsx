"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { formatCurrency } from "@/lib/utils";

interface SalesDataPoint {
  date: string;
  revenue: number;
}

export default function SalesTrendChartClient({
  data,
}: {
  data: SalesDataPoint[];
}) {
  const formattedData = useMemo(() => {
    return data.map((d) => ({
      ...d,
      displayDate:
        d.date.length === 7
          ? new Date(d.date + "-01").toLocaleDateString("en-US", {
              month: "short",
              year: "numeric",
            })
          : new Date(d.date).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            }),
    }));
  }, [data]);

  return (
    <div className="h-[300px] w-full mt-4">
      {formattedData.length > 0 ? (
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={formattedData}
            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#333"
              vertical={false}
            />
            <XAxis
              dataKey="displayDate"
              stroke="#888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              dy={10}
              minTickGap={30}
            />
            <YAxis
              stroke="#888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) =>
                value >= 1000
                  ? `${(value / 1000).toLocaleString("no-NO")}k Kr`
                  : `${value} Kr`
              }
              dx={-10}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1f2937",
                border: "1px solid #374151",
                borderRadius: "4px",
              }}
              itemStyle={{ color: "#fff" }}
              cursor={{ stroke: "#4b5563", strokeWidth: 1 }}
              formatter={(value: any) => [
                formatCurrency(Number(value)),
                "Revenue",
              ]}
            />
            <Line
              type="monotone"
              dataKey="revenue"
              stroke="#3b82f6"
              strokeWidth={3}
              dot={{ r: 4, fill: "#1e3a8a", stroke: "#3b82f6", strokeWidth: 2 }}
              activeDot={{
                r: 6,
                fill: "#60a5fa",
                stroke: "#fff",
                strokeWidth: 2,
              }}
            />
          </LineChart>
        </ResponsiveContainer>
      ) : (
        <div className="flex h-full items-center justify-center text-gray-500">
          No data available for this timeframe
        </div>
      )}
    </div>
  );
}
