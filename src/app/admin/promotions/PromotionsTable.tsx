"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { createDiscountCode, toggleDiscountCode } from "@/app/actions/admin";
import { Loader2, Plus, Tag, Check, X } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

 
export default function PromotionsTable({
  initialCodes,
  categories = [],
}: {
  initialCodes: any[];
  categories?: any[];
}) {
  const [codes, setCodes] = useState(initialCodes);

  // Create Form State
  const [showCreate, setShowCreate] = useState(false);
  const [newCode, setNewCode] = useState("");
  const [newDiscountType, setNewDiscountType] = useState("PERCENTAGE");
  const [newDiscountValue, setNewDiscountValue] = useState("10");
  const [newMaxUses, setNewMaxUses] = useState("");
  const [newExpiresAt, setNewExpiresAt] = useState("");
  const [newMinOrderValue, setNewMinOrderValue] = useState("");
  const [newAppliesTo, setNewAppliesTo] = useState<string[]>(["ALL"]);
  const [isCreating, setIsCreating] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleToggle = async (id: string, currentStatus: boolean) => {
    const res = await toggleDiscountCode(id, !currentStatus);
    if (res.success) {
      setCodes(
        codes.map((c) =>
          c.id === id ? { ...c, isActive: !currentStatus } : c,
        ),
      );
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    setErrorMsg("");

    if (!newCode || !newDiscountValue) {
      setErrorMsg("Code and Value are required.");
      setIsCreating(false);
      return;
    }

    const maxUses = newMaxUses ? parseInt(newMaxUses) : null;
    const expiresAt = newExpiresAt ? new Date(newExpiresAt) : null;
    const minOrderValue = newMinOrderValue
      ? parseFloat(newMinOrderValue)
      : null;
    const applicableCategoryIds = JSON.stringify(newAppliesTo);

     
    const payload: any = {
      code: newCode.toUpperCase(),
      discountType: newDiscountType,
      isActive: true,
      maxUses,
      expiresAt,
      minOrderValue,
      applicableCategoryIds,
    };

    if (newDiscountType === "PERCENTAGE") {
      payload.discountPercent = parseInt(newDiscountValue);
    } else {
      payload.discountAmount = parseFloat(newDiscountValue);
    }

    const res = await createDiscountCode(payload);

    if (res.success) {
      setShowCreate(false);
      setNewCode("");
      setNewDiscountType("PERCENTAGE");
      setNewDiscountValue("10");
      setNewMaxUses("");
      setNewExpiresAt("");
      setNewMinOrderValue("");
      setNewAppliesTo(["ALL"]);
      window.location.reload();
    } else {
      setErrorMsg(res.error || "Failed to create code");
    }
    setIsCreating(false);
  };

  const toggleCategorySelection = (catId: string) => {
    if (catId === "ALL") {
      setNewAppliesTo(["ALL"]);
      return;
    }

    let current = [...newAppliesTo].filter((id) => id !== "ALL");
    if (current.includes(catId)) {
      current = current.filter((id) => id !== catId);
    } else {
      current.push(catId);
    }

    if (current.length === 0) {
      setNewAppliesTo(["ALL"]);
    } else {
      setNewAppliesTo(current);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Never";
    return new Date(dateString).toLocaleDateString("no-NO", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-dark-surface/50 p-4 rounded-xl border border-dark-border">
        <div>
          <h3 className="text-white font-bold">Campaigns Library</h3>
          <p className="text-xs text-gray-400">
            Manage active hooks and coupon redemptions array.
          </p>
        </div>
        {!showCreate && (
          <button
            onClick={() => setShowCreate(true)}
            className="bg-brand-600 hover:bg-brand-500 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition-all shadow-lg shadow-brand-500/20"
          >
            <Plus className="w-4 h-4" /> New Discount Code
          </button>
        )}
      </div>

      {showCreate && (
        <form
          onSubmit={handleCreate}
          className="glass p-6 md:p-8 border border-brand-500/50 space-y-6 animate-in fade-in slide-in-from-top-4 relative"
        >
          <div className="border-b border-dark-border pb-4">
            <h3 className="font-bold text-white text-lg flex items-center gap-2">
              <Tag className="w-5 h-5 text-brand-400" /> Generator Constraints
            </h3>
            <p className="text-sm text-gray-400 mt-1">
              Deploy structured promotion wrappers enforcing strict margin
              bounds.
            </p>
          </div>

          {errorMsg && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm rounded-lg">
              {errorMsg}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <label className="block text-xs font-bold text-brand-400  tracking-wider mb-1">
                Target Code
              </label>
              <input
                type="text"
                value={newCode}
                onChange={(e) => setNewCode(e.target.value.toUpperCase())}
                placeholder="e.g. SUMMER26"
                className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-2 text-white font-mono  focus:outline-none focus:border-brand-500 transition-all"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-brand-400  tracking-wider mb-1">
                Discount Type
              </label>
              <select
                value={newDiscountType}
                onChange={(e) => setNewDiscountType(e.target.value)}
                className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-2 text-white focus:outline-none focus:border-brand-500 transition-all"
              >
                <option value="PERCENTAGE">% OFF MSR</option>
                <option value="FLAT">Kr OFF (Flat)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-brand-400  tracking-wider mb-1">
                Discount Payload
              </label>
              <input
                type="number"
                min="1"
                value={newDiscountValue}
                onChange={(e) => setNewDiscountValue(e.target.value)}
                className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-2 text-white font-mono focus:outline-none focus:border-brand-500 transition-all"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400  tracking-wider mb-1">
                Minimum Cart Value
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  value={newMinOrderValue}
                  onChange={(e) => setNewMinOrderValue(e.target.value)}
                  placeholder="0"
                  className="w-full bg-dark-bg border border-dark-border rounded-lg pl-3 pr-8 py-2 text-white font-mono focus:outline-none focus:border-brand-500 transition-all"
                />
                <span className="absolute right-3 top-2 text-sm text-gray-500 font-bold">
                  Kr
                </span>
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400  tracking-wider mb-1">
                Global Expiration Date
              </label>
              <input
                type="datetime-local"
                value={newExpiresAt}
                onChange={(e) => setNewExpiresAt(e.target.value)}
                className="w-full bg-dark-bg border border-dark-border rounded-lg px-2 py-2 text-white text-sm focus:outline-none focus:border-brand-500 transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400  tracking-wider mb-1">
                Redemption Cap (Max)
              </label>
              <input
                type="number"
                min="1"
                value={newMaxUses}
                onChange={(e) => setNewMaxUses(e.target.value)}
                placeholder="Unlimited Configured"
                className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-2 text-white font-mono focus:outline-none focus:border-brand-500 transition-all placeholder:text-gray-600"
              />
            </div>

            <div className="lg:col-span-2">
              <label className="block text-xs font-bold text-gray-400  tracking-wider mb-1">
                Enforce Category Restrictions
              </label>
              <div className="flex flex-wrap gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => toggleCategorySelection("ALL")}
                  className={`px-3 py-1.5 text-xs rounded-full border transition-colors ${newAppliesTo.includes("ALL") ? "bg-brand-500/20 border-brand-500 text-brand-300" : "bg-dark-bg border-dark-border text-gray-400 hover:border-gray-500"}`}
                >
                  Entire Catalog
                </button>
                {categories.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => toggleCategorySelection(c.id)}
                    className={`px-3 py-1.5 text-xs rounded-full border transition-colors ${newAppliesTo.includes(c.id) ? "bg-brand-500/20 border-brand-500 text-brand-300" : "bg-dark-bg border-dark-border text-gray-400 hover:border-gray-500"}`}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-dark-border flex items-center justify-end gap-3">
            <button
              type="button"
              disabled={isCreating}
              onClick={() => setShowCreate(false)}
              className="bg-dark-bg hover:bg-dark-surface border border-dark-border text-gray-300 px-5 py-2.5 rounded-lg font-bold flex items-center gap-2 transition-all"
            >
              <X className="w-4 h-4" /> Terminate Session
            </button>
            <button
              type="submit"
              disabled={isCreating}
              className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2.5 rounded-lg font-bold flex items-center gap-2 transition-all disabled:opacity-50 shadow-lg shadow-emerald-500/20"
            >
              {isCreating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Check className="w-4 h-4" />
              )}{" "}
              Compile Instance
            </button>
          </div>
        </form>
      )}

      <div className="glass border border-dark-border overflow-hidden rounded-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs  bg-dark-bg/80 text-gray-400 border-b border-dark-border">
              <tr>
                <th className="px-6 py-4 rounded-tl-xl w-12">
                  <Tag className="w-4 h-4" />
                </th>
                <th className="px-6 py-4">Security Key</th>
                <th className="px-6 py-4">Constraint Params</th>
                <th className="px-6 py-4">State</th>
                <th className="px-6 py-4">Expiration Logic</th>
                <th className="px-6 py-4">Load Factor</th>
                <th className="px-6 py-4 rounded-tr-xl">Admin Options</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-border">
              {codes.map((code) => {
                const isExpired =
                  code.expiresAt && new Date(code.expiresAt) < new Date();
                const isCapped = code.maxUses && code.usedCount >= code.maxUses;

                let badgeClass = "";
                let badgeText = "";

                if (isExpired) {
                  badgeText = "Expired";
                  badgeClass =
                    "border-rose-500/50 text-rose-400 bg-rose-500/10";
                } else if (isCapped) {
                  badgeText = "Capped";
                  badgeClass =
                    "border-amber-500/50 text-amber-400 bg-amber-500/10";
                } else if (!code.isActive) {
                  badgeText = "Disabled";
                  badgeClass =
                    "border-gray-500/50 text-gray-400 bg-gray-500/10";
                } else {
                  badgeText = "Active";
                  badgeClass =
                    "border-emerald-500/50 text-emerald-400 bg-emerald-500/10";
                }

                return (
                  <tr
                    key={code.id}
                    className="hover:bg-dark-bg/50 transition-colors"
                  >
                    <td className="px-6 py-4 text-brand-400"></td>
                    <td className="px-6 py-4 font-mono font-bold text-white tracking-widest">
                      {code.code}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-emerald-400">
                        {code.discountType === "FLAT"
                          ? `${formatCurrency(code.discountAmount)} OFF`
                          : `${code.discountPercent}% OFF`}
                      </div>
                      {(code.minOrderValue || code.applicableCategoryIds) && (
                        <div className="text-xs text-gray-500 mt-1 flex gap-2">
                          {code.minOrderValue && (
                            <span>
                              Min: {formatCurrency(code.minOrderValue)}
                            </span>
                          )}
                          {code.applicableCategoryIds &&
                            code.applicableCategoryIds !== '["ALL"]' && (
                              <span>Restricted Scope</span>
                            )}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 text-xs rounded-full border ${badgeClass}`}
                      >
                        {badgeText}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-400">
                      {formatDate(code.expiresAt)}
                    </td>
                    <td className="px-6 py-4 font-mono text-gray-300">
                      {code.usedCount}{" "}
                      <span className="text-gray-500">
                        {code.maxUses ? `/ ${code.maxUses}` : " / ∞"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleToggle(code.id, code.isActive)}
                        className="text-xs font-bold text-gray-300 hover:text-white bg-dark-bg px-3 py-1.5 rounded border border-dark-border hover:border-gray-500 transition-colors"
                      >
                        {code.isActive ? "Suspend" : "Execute Activation"}
                      </button>
                    </td>
                  </tr>
                );
              })}

              {codes.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-8 text-center text-gray-500"
                  >
                    No discount scripts loaded into main memory.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
