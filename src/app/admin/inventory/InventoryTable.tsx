"use client";

import { useState, useMemo } from "react";
import { formatCurrency } from "@/lib/utils";
import {
  deleteProduct,
  bulkDeleteProducts,
  bulkUpdateProductStatus,
} from "@/app/actions/admin";
import {
  Edit2,
  X,
  Trash2,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Plus,
  Search,
  ArrowUpDown,
} from "lucide-react";
import { ProductWizardModal } from "./ProductWizardModal";

interface Product {
  id: string;
  name: string;
  price: number;
  cost: number;
  stock: number;
  brand: string;
  description: string;
  specsJson: string;
  imageUrl: string;
  categoryId: string;
  sku?: string | null;
  isActive?: boolean;
  lowStockThreshold?: number;
  supplier?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
  category: { id: string; name: string };
}

export function InventoryTable({
  initialProducts,
  categories,
  initialSearch = "",
  initialEditId = null,
}: {
  initialProducts: Product[];
  categories: { id: string; name: string }[];
  initialSearch?: string;
  initialEditId?: string | null;
}) {
  const [products, setProducts] = useState(initialProducts);
  const [localCategories, setLocalCategories] = useState(categories);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);

  // New States
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [sortField, setSortField] = useState<
    "name" | "sku" | "supplier" | "stock" | "cost" | "price" | "margin"
  >("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "inactive"
  >("all");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isBulkActing, setIsBulkActing] = useState(false);

  // Unified Modal State
  const [modalMode, setModalMode] = useState<"add" | "edit" | null>(
    initialEditId ? "edit" : null,
  );
  const [editingId, setEditingId] = useState<string | null>(initialEditId);

  const handleSort = (field: typeof sortField) => {
    if (sortField === field) setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const toggleSelect = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedIds(newSet);
  };

  const handleBulkStatusUpdate = async (isActive: boolean) => {
    if (selectedIds.size === 0) return;
    setIsBulkActing(true);
    const result = await bulkUpdateProductStatus(
      Array.from(selectedIds),
      isActive,
    );
    if (result.success) {
      setProducts(
        products.map((p) => (selectedIds.has(p.id) ? { ...p, isActive } : p)),
      );
      setSelectedIds(new Set());
    } else alert("Failed to bulk update.");
    setIsBulkActing(false);
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    if (window.confirm(`Delete ${selectedIds.size} products?`)) {
      setIsBulkActing(true);
      const result = await bulkDeleteProducts(Array.from(selectedIds));
      if (result.success) {
        setProducts(products.filter((p) => !selectedIds.has(p.id)));
        setSelectedIds(new Set());
      } else alert("Failed to delete.");
      setIsBulkActing(false);
    }
  };

  const openAddModal = () => {
    setModalMode("add");
    setEditingId(null);
  };

  const handleEdit = (p: Product) => {
    setEditingId(p.id);
    setModalMode("edit");
  };

  const closeModal = () => {
    setModalMode(null);
    setEditingId(null);
  };

  const handleDelete = async (id: string) => {
    if (
      window.confirm(
        "Are you sure you want to delete this product? This cannot be undone.",
      )
    ) {
      const result = await deleteProduct(id);
      if (result.success) {
        setProducts(products.filter((p) => p.id !== id));
      } else {
        alert("Failed to delete product.");
      }
    }
  };

  // Filter & Sort
  const processedProducts = useMemo(() => {
    let result = [...products];

    if (statusFilter === "active")
      result = result.filter((p) => p.isActive !== false);
    else if (statusFilter === "inactive")
      result = result.filter((p) => p.isActive === false);

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.sku && p.sku.toLowerCase().includes(q)) ||
          (p.brand && p.brand.toLowerCase().includes(q)) ||
          (p.supplier && p.supplier.toLowerCase().includes(q)),
      );
    }

    result.sort((a, b) => {
      let valA: string | number | boolean | null | undefined,
        valB: string | number | boolean | null | undefined;
      if (sortField === "margin") {
        valA = a.price > 0 ? (a.price - a.cost) / a.price : 0;
        valB = b.price > 0 ? (b.price - b.cost) / b.price : 0;
      } else {
        valA = a[sortField] ?? "";
        valB = b[sortField] ?? "";
      }

      if (valA < valB) return sortOrder === "asc" ? -1 : 1;
      if (valA > valB) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    return result;
  }, [products, searchQuery, sortField, sortOrder, statusFilter]);

  // Group products by category
  const grouped = processedProducts.reduce(
    (acc, p) => {
      const cat = p.category.name;
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(p);
      return acc;
    },
    {} as Record<string, Product[]>,
  );

  const allCategories = Object.keys(grouped).sort();
  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    [allCategories[0]]: true,
  });

  const toggleCategory = (cat: string) => {
    setExpanded((prev) => ({ ...prev, [cat]: !prev[cat] }));
  };

  return (
    <>
      <div className="flex justify-between items-center mb-6 pt-2 relative z-10">
        <div className="flex bg-dark-surface/50 border border-dark-border p-1 gap-1 shadow-inner max-w-min">
          <button
            onClick={() => setStatusFilter("all")}
            className={`px-4 py-1.5 text-sm font-bold transition-colors ${statusFilter === "all" ? "bg-white/10 text-white shadow" : "text-gray-500 hover:text-white"}`}
          >
            All
          </button>
          <button
            onClick={() => setStatusFilter("active")}
            className={`px-4 py-1.5 text-sm font-bold transition-colors ${statusFilter === "active" ? "bg-white/10 text-emerald-400 shadow" : "text-gray-500 hover:text-emerald-400"}`}
          >
            Active
          </button>
          <button
            onClick={() => setStatusFilter("inactive")}
            className={`px-4 py-1.5 text-sm font-bold transition-colors ${statusFilter === "inactive" ? "bg-white/10 text-rose-400 shadow" : "text-gray-500 hover:text-rose-400"}`}
          >
            Inactive
          </button>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative group">
            <Search className="w-4 h-4 text-gray-500 group-focus-within:text-brand-400 absolute left-3 top-1/2 -translate-y-1/2 transition-colors" />
            <input
              type="text"
              placeholder="Search inventory (name, sku, brand)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 bg-dark-surface/50 border border-dark-border shadow-inner text-white text-sm focus:outline-none focus:border-brand-500 transition-colors w-72"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
          <button
            onClick={openAddModal}
            className="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white font-bold shadow-lg transition-colors text-sm flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Add Product
          </button>
        </div>
      </div>

      {selectedIds.size > 0 && (
        <div className="mb-4 p-3 bg-brand-500/10 border border-brand-500/30 flex items-center justify-between animate-in slide-in-from-top-2 sticky top-4 z-50 backdrop-blur-md shadow-lg rounded-lg">
          <span className="text-sm font-bold text-brand-400">
            {selectedIds.size} products selected
          </span>
          <div className="flex items-center gap-2">
            <button
              disabled={isBulkActing}
              onClick={() => handleBulkStatusUpdate(true)}
              className="px-3 py-1.5 bg-dark-bg border border-dark-border text-xs font-bold text-gray-300 hover:text-emerald-400 transition-colors"
            >
              Set Active
            </button>
            <button
              disabled={isBulkActing}
              onClick={() => handleBulkStatusUpdate(false)}
              className="px-3 py-1.5 bg-dark-bg border border-dark-border text-xs font-bold text-gray-300 hover:text-rose-400 transition-colors"
            >
              Set Inactive
            </button>
            <button
              disabled={isBulkActing}
              onClick={handleBulkDelete}
              className="px-3 py-1.5 bg-rose-500/10 border border-rose-500/30 text-xs font-bold text-rose-400 hover:bg-rose-500/20 transition-colors ml-2"
            >
              Delete Selected
            </button>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {allCategories.map((cat) => {
          const catProducts = grouped[cat];
          const isExpanded = !!expanded[cat];

          // Calculate category summary
          const totalItems = catProducts.length;
          const totalStock = catProducts.reduce((sum, p) => sum + p.stock, 0);

          return (
            <div
              key={cat}
              className="glass border border-dark-border overflow-hidden bg-dark-surface/30"
            >
              {/* Header / Accordion Toggle */}
              <button
                onClick={() => toggleCategory(cat)}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-white/5 transition-colors text-left"
              >
                <div className="flex items-center gap-4">
                  {isExpanded ? (
                    <ChevronDown className="w-5 h-5 text-brand-500" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-gray-500" />
                  )}
                  <div>
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                      {cat}
                      <span className="text-xs px-2 py-0.5 bg-dark-bg border border-dark-border rounded-full text-gray-400">
                        {totalItems} products
                      </span>
                    </h2>
                    <p className="text-sm text-gray-500 mt-1 flex gap-4">
                      <span>
                        Total Stock:{" "}
                        <strong className="text-gray-300">{totalStock}</strong>{" "}
                        units
                      </span>
                    </p>
                  </div>
                </div>
              </button>

              {/* Table Content */}
              {isExpanded && (
                <div className="border-t border-dark-border animate-in slide-in-from-top-2 duration-200">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-300">
                      <thead className="bg-dark-surface/50 text-gray-400 border-y border-dark-border">
                        <tr>
                          <th className="px-6 py-3 w-10">
                            <input
                              type="checkbox"
                              onChange={(e) => {
                                if (e.target.checked) setProducts(products); // Just to clear TS error temporarily
                              }}
                              className="w-4 h-4 rounded border-gray-600 text-brand-500 bg-dark-bg focus:ring-brand-500 focus:ring-offset-dark-bg"
                            />
                          </th>
                          <th
                            className="px-6 py-3 font-bold  tracking-wider cursor-pointer hover:text-white"
                            onClick={() => handleSort("name")}
                          >
                            <div className="flex items-center gap-2">
                              Product{" "}
                              {sortField === "name" && (
                                <ArrowUpDown className="w-3 h-3 text-brand-500" />
                              )}
                            </div>
                          </th>
                          <th
                            className="px-6 py-3 font-bold  tracking-wider cursor-pointer hover:text-white"
                            onClick={() => handleSort("sku")}
                          >
                            <div className="flex items-center gap-2">
                              SKU/Brand{" "}
                              {sortField === "sku" && (
                                <ArrowUpDown className="w-3 h-3 text-brand-500" />
                              )}
                            </div>
                          </th>
                          <th className="px-6 py-3 font-bold  tracking-wider">
                            Specs (Key)
                          </th>
                          <th
                            className="px-6 py-3 font-bold  tracking-wider cursor-pointer hover:text-white"
                            onClick={() => handleSort("cost")}
                          >
                            <div className="flex items-center gap-2">
                              Cost/Price{" "}
                              {sortField === "cost" && (
                                <ArrowUpDown className="w-3 h-3 text-brand-500" />
                              )}
                            </div>
                          </th>
                          <th
                            className="px-6 py-3 font-bold  tracking-wider cursor-pointer hover:text-white"
                            onClick={() => handleSort("stock")}
                          >
                            <div className="flex items-center gap-2">
                              Stock{" "}
                              {sortField === "stock" && (
                                <ArrowUpDown className="w-3 h-3 text-brand-500" />
                              )}
                            </div>
                          </th>
                          <th className="px-6 py-3 font-bold  tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 font-bold  tracking-wider text-right">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-dark-border/50">
                        {catProducts.map((product) => {
                          let specsStr = "";
                          try {
                            const s = JSON.parse(product.specsJson);
                            delete s.type;
                            specsStr = Object.entries(s)
                              .slice(0, 2)
                              .map(([k, v]) => `${k}: ${v}`)
                              .join(" | ");
                          } catch {}

                          const isSelected = selectedIds.has(product.id);
                          const margin =
                            product.price > 0
                              ? ((product.price - product.cost) /
                                  product.price) *
                                100
                              : 0;

                          return (
                            <tr
                              key={product.id}
                              className={`hover:bg-white/5 transition-colors group ${isSelected ? "bg-brand-500/5" : ""}`}
                            >
                              <td className="px-6 py-4">
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => toggleSelect(product.id)}
                                  className="w-4 h-4 rounded border-gray-600 text-brand-500 bg-dark-bg focus:ring-brand-500 focus:ring-offset-dark-bg cursor-pointer"
                                />
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 bg-dark-surface border border-dark-border flex items-center justify-center shrink-0 object-contain p-1">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                      src={product.imageUrl}
                                      alt={product.name}
                                      className="w-full h-full object-contain"
                                    />
                                  </div>
                                  <div className="flex flex-col max-w-[200px]">
                                    <span
                                      className="font-bold text-white truncate"
                                      title={product.name}
                                    >
                                      {product.name}
                                    </span>
                                    {product.supplier && (
                                      <span
                                        className="text-xs text-brand-400 truncate opacity-80"
                                        title={product.supplier}
                                      >
                                        {product.supplier}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 font-mono text-xs">
                                <div className="flex flex-col gap-1">
                                  <span className="text-gray-300">
                                    {product.sku || "No SKU"}
                                  </span>
                                  <span className="text-gray-500 font-sans">
                                    {product.brand}
                                  </span>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <span
                                  className="text-xs text-gray-400 bg-dark-surface/50 border border-dark-border px-2 py-1 truncate max-w-[150px] inline-block font-mono"
                                  title={specsStr}
                                >
                                  {specsStr || "N/A"}
                                </span>
                              </td>
                              <td className="px-6 py-4 font-mono">
                                <div className="flex flex-col gap-1 items-start">
                                  <div className="flex items-center gap-2">
                                    <span className="text-red-400/80">
                                      {formatCurrency(product.cost)}
                                    </span>
                                    <span className="text-gray-600">/</span>
                                    <span className="text-emerald-400 font-bold">
                                      {formatCurrency(product.price)}
                                    </span>
                                  </div>
                                  <span
                                    className={`text-[11px] px-1.5 py-0.5 border ${margin < 15 ? "text-red-400 border-red-500/30 bg-red-500/10" : "text-emerald-400 border-emerald-500/30 bg-emerald-500/10"}`}
                                  >
                                    {margin.toFixed(1)}% MRGN
                                  </span>
                                </div>
                              </td>
                              <td className="px-6 py-4 text-center">
                                <div className="flex flex-col items-center">
                                  <span
                                    className={`font-mono text-lg font-bold ${product.stock <= (product.lowStockThreshold || 5) ? "text-rose-500" : "text-gray-300"}`}
                                  >
                                    {product.stock}
                                  </span>
                                  {product.stock <=
                                    (product.lowStockThreshold || 5) && (
                                    <span className="text-[11px] text-rose-500  font-bold tracking-wider">
                                      Low
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                {product.isActive === false ? (
                                  <span className="text-xs font-bold text-rose-400 border border-rose-500/30 bg-rose-500/10 px-2 py-1">
                                    Inactive
                                  </span>
                                ) : (
                                  <span className="text-xs font-bold text-emerald-400 border border-emerald-500/30 bg-emerald-500/10 px-2 py-1">
                                    Active
                                  </span>
                                )}
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex items-center justify-end gap-2">
                                  {saveSuccess === product.id && (
                                    <span className="text-emerald-500 flex items-center text-xs animate-in slide-in-from-right-2">
                                      <CheckCircle2 className="w-4 h-4 mr-1" />{" "}
                                      Saved
                                    </span>
                                  )}
                                  <button
                                    onClick={() => handleEdit(product)}
                                    className="p-2 text-gray-500 hover:text-brand-400 hover:bg-brand-500/10  transition-colors"
                                    title="Edit Product"
                                  >
                                    <Edit2 className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => handleDelete(product.id)}
                                    className="p-2 text-gray-500 hover:text-rose-500 hover:bg-rose-500/10  transition-colors"
                                    title="Delete Product"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <ProductWizardModal
        isOpen={!!modalMode}
        mode={modalMode || "add"}
        editingProduct={products.find((p) => p.id === editingId)}
        categories={localCategories}
        onClose={closeModal}
        onSaveSuccess={(savedProduct, mode, newCategory) => {
          if (newCategory) {
            setLocalCategories([
              ...localCategories,
              newCategory as { id: string; name: string },
            ]);
          } else {
            if (mode === "add") {
              setProducts([...products, savedProduct as Product]);
            } else {
              setProducts(
                products.map((p) =>
                  p.id === savedProduct!.id ? (savedProduct as Product) : p,
                ),
              );
              setSaveSuccess(savedProduct!.id);
              setTimeout(() => setSaveSuccess(null), 2000);
            }
            closeModal();
          }
        }}
      />
    </>
  );
}
