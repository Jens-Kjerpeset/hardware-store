"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, Fragment } from "react";
import { formatCurrency } from "@/lib/utils";
import { updateOrderStatus, getOrdersForMonth } from "@/app/actions/admin";
import { ChevronDown, ChevronRight, Check, Loader2 } from "lucide-react";

export default function OrdersTable({
  monthGroups,
  initialOrders,
}: {
  monthGroups: { month: string; count: number }[];
  initialOrders: any[];
}) {
  const [loadedMonths, setLoadedMonths] = useState<Record<string, any[]>>(() => {
    if (monthGroups.length > 0) {
      return { [monthGroups[0].month]: initialOrders };
    }
    return {};
  });

  const [expandedMonths, setExpandedMonths] = useState<Set<string>>(() => {
    return new Set(monthGroups.length > 0 ? [monthGroups[0].month] : []);
  });

  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isLoadingUpdate, setIsLoadingUpdate] = useState<string | null>(null);
  const [loadingMonths, setLoadingMonths] = useState<Set<string>>(new Set());

  const formatMonthYear = (yearMonth: string) => {
    const [year, month] = yearMonth.split("-");
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  };

  const toggleMonth = async (month: string) => {
    const nextExt = new Set(expandedMonths);
    if (nextExt.has(month)) {
      nextExt.delete(month);
      setExpandedMonths(nextExt);
      return;
    }

    nextExt.add(month);
    setExpandedMonths(nextExt);

    if (!loadedMonths[month]) {
      setLoadingMonths((prev) => new Set(prev).add(month));
      const res = await getOrdersForMonth(month);
      if (res.success && res.orders) {
        setLoadedMonths((prev) => ({ ...prev, [month]: res.orders }));
      }
      setLoadingMonths((prev) => {
        const next = new Set(prev);
        next.delete(month);
        return next;
      });
    }
  };

  const handleUpdate = async (
    id: string,
    status: string,
    trackingNumber: string,
    shippingStatus: string,
    shippingGateway: string,
  ) => {
    setIsLoadingUpdate(id);
    const result = await updateOrderStatus(
      id,
      status,
      trackingNumber,
      shippingStatus,
      shippingGateway,
    );
    if (result.success) {
      setLoadedMonths((prev) => {
        const next = { ...prev };
        for (const month in next) {
          if (next[month]) {
            next[month] = next[month].map((o) =>
              o.id === id
                ? { ...o, status, trackingNumber, shippingStatus, shippingGateway }
                : o,
            );
          }
        }
        return next;
      });
      setTimeout(() => setIsLoadingUpdate(null), 1500);
    } else {
      setIsLoadingUpdate(null);
    }
  };

  return (
    <div className="glass border border-dark-border overflow-hidden rounded-xl">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs bg-dark-bg/80 text-gray-400 border-b border-dark-border">
            <tr>
              <th className="px-6 py-4 rounded-tl-xl w-10"></th>
              <th className="px-6 py-4">Order ID</th>
              <th className="px-6 py-4">Customer</th>
              <th className="px-6 py-4">Total</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Shipping</th>
              <th className="px-6 py-4 rounded-tr-xl text-right">Date</th>
            </tr>
          </thead>
          
          {monthGroups.map((group) => {
            const orders = loadedMonths[group.month] || [];
            const isExpanded = expandedMonths.has(group.month);
            const isLoading = loadingMonths.has(group.month);

            return (
              <Fragment key={group.month}>
                <tbody className="divide-y divide-dark-border border-b border-dark-border/50">
                  <tr
                    className="bg-dark-surface/50 cursor-pointer hover:bg-dark-surface transition-colors"
                    onClick={() => toggleMonth(group.month)}
                  >
                    <td className="px-6 py-3 border-y border-brand-500/10">
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4 text-brand-400" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-gray-500" />
                      )}
                    </td>
                    <td colSpan={6} className="px-6 py-3 text-brand-400 font-bold border-y border-brand-500/10">
                      {formatMonthYear(group.month)}
                      <span className="text-gray-500 font-normal ml-2 tracking-wide text-[11px] uppercase">
                        ({group.count} orders)
                      </span>
                      {isLoading && (
                        <Loader2 className="inline ml-3 w-4 h-4 animate-spin text-brand-500" />
                      )}
                    </td>
                  </tr>
                </tbody>

                {isExpanded && orders.length > 0 && (
                  <tbody className="divide-y divide-dark-border">
                    {orders.map((order) => (
                      <Fragment key={order.id}>
                        <tr
                          className="hover:bg-dark-bg/50 transition-colors group cursor-pointer"
                          onClick={() =>
                            setExpandedId(expandedId === order.id ? null : order.id)
                          }
                        >
                          <td className="px-6 py-4 pl-10">
                            {expandedId === order.id ? (
                              <ChevronDown className="w-4 h-4" />
                            ) : (
                              <ChevronRight className="w-4 h-4" />
                            )}
                          </td>
                          <td className="px-6 py-4 font-mono text-xs text-gray-300">
                            {order.id.split("-")[0]}
                          </td>
                          <td className="px-6 py-4 text-white">
                            {order.customer ? order.customer.name : "Guest User"}
                          </td>
                          <td className="px-6 py-4 font-bold text-brand-400 font-mono">
                            {formatCurrency(order.totalAmount)}
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`px-2 py-1 text-[11px] tracking-wide font-bold capitalize rounded-full border ${
                                order.status === "completed"
                                  ? "border-emerald-500/50 text-emerald-400 bg-emerald-500/10"
                                  : order.status === "ready_for_fulfillment"
                                    ? "border-blue-500/50 text-blue-400 bg-blue-500/10"
                                    : order.status === "processing"
                                      ? "border-indigo-500/50 text-indigo-400 bg-indigo-500/10"
                                      : order.status === "pending"
                                        ? "border-amber-500/50 text-amber-400 bg-amber-500/10"
                                        : "border-gray-500/50 text-gray-400 bg-gray-500/10"
                              }`}
                            >
                              {order.status.replace(/_/g, " ")}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`px-2 py-1 text-xs rounded-full border ${
                                order.shippingStatus === "delivered"
                                  ? "border-blue-500/50 text-blue-400 bg-blue-500/10"
                                  : order.shippingStatus === "shipped"
                                    ? "border-purple-500/50 text-purple-400 bg-purple-500/10"
                                    : "border-rose-500/50 text-rose-400 bg-rose-500/10"
                              }`}
                            >
                              {order.shippingStatus || "pending"}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-gray-400 text-xs text-right truncate max-w-[120px]">
                            {new Date(order.createdAt).toLocaleDateString("no-NO")}
                          </td>
                        </tr>
                        {expandedId === order.id && (
                          <tr>
                            <td
                              colSpan={7}
                              className="px-6 py-6 bg-dark-surface border-b border-dark-border"
                              style={{ paddingLeft: "3.5rem" }}
                            >
                              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                <div>
                                  <h4 className="text-sm font-bold text-white mb-3">
                                    Shipping Details
                                  </h4>
                                  <div className="p-3 bg-dark-bg/50 border border-dark-border rounded text-sm mb-4">
                                    <p className="text-white font-medium">
                                      {order.customer?.name || "Guest User"}
                                    </p>
                                    <p className="text-gray-400">
                                      {order.customer?.email || "No email provided"}
                                    </p>
                                    {order.customer?.phone && (
                                      <p className="text-gray-400">
                                        {order.customer.phone}
                                      </p>
                                    )}
                                    <p className="text-gray-300 mt-2 pt-2 border-t border-dark-border/50">
                                      {order.shippingAddress ||
                                        "No shipping address provided"}
                                    </p>
                                  </div>

                                  <h4 className="text-sm font-bold text-white mb-3">
                                    Order Items
                                  </h4>
                                  <div className="space-y-2">
                                    {(() => {
                                      const aggregatedItems =
                                        order.items?.reduce((acc: any[], item: any) => {
                                          const existing = acc.find(
                                            (i) =>
                                              i.product?.name === item.product?.name,
                                          );
                                          if (existing) {
                                            existing.quantity += item.quantity;
                                          } else {
                                            acc.push({ ...item });
                                          }
                                          return acc;
                                        }, []) || [];

                                      return aggregatedItems.map((item: any) => (
                                        <div
                                          key={item.id}
                                          className="flex justify-between text-sm bg-dark-bg p-2 rounded border border-dark-border"
                                        >
                                          <span className="text-gray-300 truncate pr-4 text-xs">
                                            <span className="font-mono text-emerald-400 font-bold">
                                              {item.quantity}x
                                            </span>{" "}
                                            {item.product?.name || "Unknown Product"}
                                          </span>
                                          <span className="font-mono text-white text-xs">
                                            {formatCurrency(
                                              item.priceAtTime * item.quantity,
                                            )}
                                          </span>
                                        </div>
                                      ));
                                    })()}
                                  </div>
                                </div>
                                <div className="space-y-4">
                                  <h4 className="text-sm font-bold text-white mb-3">
                                    Fulfillment Processing
                                  </h4>

                                  <div className="space-y-3">
                                    <div>
                                      <label className="block text-xs text-gray-400 mb-1">
                                        Order Status
                                      </label>
                                      <select
                                        className="w-full bg-dark-bg border border-dark-border rounded px-3 py-2 text-sm text-white"
                                        value={order.status}
                                        onChange={(e) =>
                                          handleUpdate(
                                            order.id,
                                            e.target.value,
                                            order.trackingNumber || "",
                                            order.shippingStatus || "pending",
                                            order.shippingGateway || "",
                                          )
                                        }
                                      >
                                        <option value="pending">Pending</option>
                                        <option value="processing">Processing</option>
                                        <option value="ready_for_fulfillment">
                                          Ready for Fulfillment
                                        </option>
                                        <option
                                          value="completed"
                                          disabled={
                                            order.shippingStatus !== "shipped" &&
                                            order.shippingStatus !== "delivered"
                                          }
                                        >
                                          Completed{" "}
                                          {order.shippingStatus !== "shipped" &&
                                          order.shippingStatus !== "delivered"
                                            ? "(Needs Shipping)"
                                            : ""}
                                        </option>
                                        <option value="refunded">Refunded</option>
                                      </select>
                                    </div>

                                    <div>
                                      <label className="block text-xs text-gray-400 mb-1">
                                        Shipping Status
                                      </label>
                                      <select
                                        className="w-full bg-dark-bg border border-dark-border rounded px-3 py-2 text-sm text-white"
                                        value={order.shippingStatus || "pending"}
                                        onChange={(e) =>
                                          handleUpdate(
                                            order.id,
                                            order.status,
                                            order.trackingNumber || "",
                                            e.target.value,
                                            order.shippingGateway || "",
                                          )
                                        }
                                      >
                                        <option value="pending">Pending</option>
                                        <option value="processing">Processing</option>
                                        <option value="shipped">Shipped</option>
                                        <option value="delivered">Delivered</option>
                                      </select>
                                    </div>

                                    <div>
                                      <label className="block text-xs text-gray-400 mb-1">
                                        Carrier & Tracking
                                      </label>
                                      <div className="flex gap-2">
                                        <select
                                          className="bg-dark-bg border border-dark-border rounded px-3 py-2 text-sm text-white max-w-[120px] truncate"
                                          value={order.shippingGateway || ""}
                                          onChange={(e) =>
                                            handleUpdate(
                                              order.id,
                                              order.status,
                                              order.trackingNumber || "",
                                              order.shippingStatus || "pending",
                                              e.target.value,
                                            )
                                          }
                                        >
                                          <option value="">Carrier</option>
                                          <option value="Posten">Posten</option>
                                          <option value="Bring">Bring</option>
                                          <option value="DHL">DHL</option>
                                        </select>
                                        <input
                                          type="text"
                                          className="flex-1 bg-dark-bg border border-dark-border rounded px-3 py-2 text-sm text-white font-mono min-w-0"
                                          placeholder="Tracking number"
                                          defaultValue={order.trackingNumber || ""}
                                          onBlur={(e) => {
                                            if (
                                              e.target.value !==
                                              (order.trackingNumber || "")
                                            ) {
                                              handleUpdate(
                                                order.id,
                                                order.status,
                                                e.target.value,
                                                order.shippingStatus || "pending",
                                                order.shippingGateway || "",
                                              );
                                            }
                                          }}
                                        />
                                      </div>
                                    </div>

                                    <div className="flex justify-between items-center mt-6 pt-4 border-t border-dark-border/50">
                                      <span className="text-[11px] text-gray-500  tracking-widest font-bold">
                                        Auto-saves on change
                                      </span>
                                      {isLoadingUpdate === order.id ? (
                                        <span className="text-emerald-400 text-xs font-bold flex items-center gap-1 animate-pulse bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20">
                                          <Check className="w-3 h-3" /> Saved!
                                        </span>
                                      ) : (
                                        <div className="h-6"></div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    ))}
                  </tbody>
                )}
              </Fragment>
            );
          })}

          {monthGroups.length === 0 && (
            <tbody>
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                  No orders found.
                </td>
              </tr>
            </tbody>
          )}
        </table>
      </div>
    </div>
  );
}
