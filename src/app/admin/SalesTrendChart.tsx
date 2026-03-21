import prisma from "@/lib/prisma";
import SalesTrendChartClient from "./SalesTrendChartClient";

export default async function SalesTrendChart({
  dateLimit,
}: {
  dateLimit?: Date;
}) {
  const orders = await prisma.order.findMany({
    where: dateLimit ? { createdAt: { gte: dateLimit } } : undefined,
    select: {
      createdAt: true,
      totalAmount: true,
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  const now = new Date();
  let groupBy = "DAY";
  if (!dateLimit) {
    groupBy = "MONTH";
  } else {
    const diffDays = (now.getTime() - dateLimit.getTime()) / (1000 * 3600 * 24);
    if (diffDays > 100) groupBy = "MONTH";
  }

  // Group by date
  const groupedData: Record<string, number> = {};
  orders.forEach((order) => {
    let dateStr = order.createdAt.toISOString().split("T")[0];
    if (groupBy === "MONTH") {
      dateStr = dateStr.substring(0, 7); // YYYY-MM
    }
    groupedData[dateStr] = (groupedData[dateStr] || 0) + order.totalAmount;
  });

  const data = Object.keys(groupedData).map((date) => ({
    date,
    revenue: groupedData[date],
  }));

  return (
    <div className="glass p-6 border border-dark-border mt-6">
      <h3 className="text-lg font-bold text-white mb-2">Revenue Trend</h3>
      <SalesTrendChartClient data={data} />
    </div>
  );
}
