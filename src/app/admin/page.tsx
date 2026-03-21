import { TimeframeSelector } from "./TimeframeSelector";
import { Suspense } from "react";
import DashboardMetrics from "./DashboardMetrics";
import TransactionsTable from "./TransactionsTable";
import ActionableAlerts from "./ActionableAlerts";
import SalesTrendChart from "./SalesTrendChart";
import TopSellers from "./TopSellers";
import { MetricsSkeleton, TableSkeleton } from "./Skeletons";

export const dynamic = "force-dynamic"; // Prevent static caching of admin data

export default async function AdminDashboardPage({
  searchParams,
}: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedSearchParams = await searchParams;
  const timeframe =
    typeof resolvedSearchParams?.timeframe === "string"
      ? resolvedSearchParams.timeframe
      : "all";

  let dateLimit: Date | undefined;
  const now = new Date();

  switch (timeframe) {
    case "year":
      dateLimit = new Date(
        now.getFullYear() - 1,
        now.getMonth(),
        now.getDate(),
      );
      break;
    case "month":
      dateLimit = new Date(
        now.getFullYear(),
        now.getMonth() - 1,
        now.getDate(),
      );
      break;
    case "week":
      dateLimit = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case "day":
      dateLimit = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      break;
    case "all":
    default:
      dateLimit = undefined;
      break;
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white mb-1">
            Store Performance
          </h2>
          <p className="text-sm text-gray-400">
            View real-time sales and revenue metrics based on the selected
            timeframe.
          </p>
        </div>
        <TimeframeSelector />
      </div>

      <Suspense
        fallback={
          <div className="h-20 bg-dark-surface animate-pulse mb-6"></div>
        }
      >
        <ActionableAlerts />
      </Suspense>

      <Suspense fallback={<MetricsSkeleton />} key={`metrics-${timeframe}`}>
        <DashboardMetrics dateLimit={dateLimit} />
      </Suspense>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Suspense
            fallback={
              <div className="h-64 bg-dark-surface animate-pulse mt-6"></div>
            }
            key={`trend-${timeframe}`}
          >
            <SalesTrendChart dateLimit={dateLimit} />
          </Suspense>

          <Suspense fallback={<TableSkeleton />} key={`table-${timeframe}`}>
            <TransactionsTable dateLimit={dateLimit} />
          </Suspense>
        </div>

        <div>
          <Suspense
            fallback={
              <div className="h-64 bg-dark-surface animate-pulse mt-6"></div>
            }
            key={`topsellers-${timeframe}`}
          >
            <TopSellers dateLimit={dateLimit} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
