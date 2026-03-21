"use client";

import { useState, useEffect } from "react";
import {
  createProduct,
  updateProduct,
  createCategory,
} from "@/app/actions/admin";
import { X, Plus } from "lucide-react";

const storageSpecs = [
  { key: "capacity", label: "Capacity (GB/TB)", type: "text" },
  { key: "formFactor", label: 'Form Factor (M.2, 2.5", 3.5")', type: "text" },
  {
    key: "interface",
    label: "Interface (NVMe PCIe 4.0, SATA III)",
    type: "text",
  },
] as const;

const coolerSpecs = [
  {
    key: "socketCompatibility",
    label: "Supported Sockets (e.g. AM5, LGA1700)",
    type: "text",
  },
  { key: "coolerType", label: "Type (Liquid/Air)", type: "text" },
  { key: "radiatorSize", label: "Radiator Size (mm)", type: "number" },
  { key: "height", label: "Height (mm)", type: "number" },
  { key: "color", label: "Color", type: "text" },
] as const;

export const CATEGORY_SPECS: Record<
  string,
  {
    key: string;
    label: string;
    type: "text" | "number";
    placeholder?: string;
  }[]
> = {
  CPU: [
    { key: "socket", label: "Socket", type: "text" },
    { key: "cores", label: "Cores", type: "number" },
    { key: "speedGhz", label: "Speed (GHz)", type: "number" },
    { key: "tdp", label: "TDP (W)", type: "number" },
  ],
  Motherboard: [
    { key: "socket", label: "Socket", type: "text" },
    { key: "formFactor", label: "Form Factor", type: "text" },
    { key: "chipset", label: "Chipset", type: "text" },
    { key: "memoryType", label: "Memory Type", type: "text" },
    { key: "memorySlots", label: "Memory Slots", type: "number" },
    { key: "maxMemory", label: "Max Memory (GB)", type: "number" },
  ],
  Memory: [
    { key: "memoryType", label: "Memory Type", type: "text" },
    { key: "capacity", label: "Capacity (GB)", type: "number" },
    { key: "speed", label: "Speed (MHz)", type: "number" },
    { key: "casLatency", label: "CAS Latency", type: "number" },
    { key: "modules", label: "Modules (e.g. 2x16GB)", type: "text" },
  ],
  RAM: [
    { key: "memoryType", label: "Memory Type", type: "text" },
    { key: "capacity", label: "Capacity (GB)", type: "number" },
    { key: "speed", label: "Speed (MHz)", type: "number" },
    { key: "casLatency", label: "CAS Latency", type: "number" },
    { key: "modules", label: "Modules (e.g. 2x16GB)", type: "text" },
  ],
  GPU: [
    { key: "chipset", label: "Chipset", type: "text" },
    { key: "memory", label: "Memory (GB)", type: "number" },
    {
      key: "slotWidth",
      label: "Slot Width/Thickness (e.g. 2-slot)",
      type: "text",
    },
    { key: "lengthMm", label: "Length (mm)", type: "number" },
    { key: "recommendedPsu", label: "Rec. PSU (W)", type: "number" },
  ],
  "Power Supply": [
    { key: "wattage", label: "Wattage (W)", type: "number" },
    { key: "formFactor", label: "Form Factor", type: "text" },
    { key: "modular", label: "Modular (Full/Semi/Non)", type: "text" },
    { key: "efficiency", label: "Efficiency", type: "text" },
  ],
  Case: [
    { key: "formFactor", label: "Form Factor", type: "text" },
    { key: "maxMainboard", label: "Max Mainboard", type: "text" },
    { key: "maxGpuLength", label: "Max GPU Length (mm)", type: "number" },
    {
      key: "maxCoolerHeight",
      label: "Max CPU Cooler Height (mm)",
      type: "number",
    },
    { key: "color", label: "Color", type: "text" },
    { key: "sidePanel", label: "Side Panel", type: "text" },
  ],
  "Primary Storage": [...storageSpecs],
  "Additional Storage": [...storageSpecs],
  Storage: [...storageSpecs],
  "Liquid Cooler": [...coolerSpecs],
  "Air Cooler": [...coolerSpecs],
  "CPU Cooler": [...coolerSpecs],
};

export interface WizardProduct {
  id: string;
  name: string;
  price: number;
  cost: number;
  stock: number;
  brand: string;
  description: string;
  specsJson: string;
  categoryId: string;
  imageUrl: string;
  sku?: string | null;
  isActive?: boolean;
  lowStockThreshold?: number;
  supplier?: string | null;
  discountPercent?: number | null;
  discountEndsAt?: Date | string | null;
  category?: { id: string; name: string };
}

export interface ProductWizardModalProps {
  isOpen: boolean;
  mode: "add" | "edit";
  editingProduct?: WizardProduct | null;
  categories: { id: string; name: string; fieldsJson?: string | null }[];
  onClose: () => void;
  onSaveSuccess: (
    product: WizardProduct | null,
    mode: "add" | "edit",
    newCategory?: { id: string; name: string },
  ) => void;
}

const emptyForm = {
  name: "",
  description: "",
  price: 0,
  cost: 0,
  stock: 10,
  brand: "",
  categoryId: "",
  imageUrl: "/placeholder.svg",
  sku: "",
  isActive: true,
  lowStockThreshold: 5,
  supplier: "",
  discountPercent: 0,
  discountEndsAt: "",
  dynamicSpecs: {} as Record<string, unknown>,
};

export function ProductWizardModal({
  isOpen,
  mode,
  editingProduct,
  categories,
  onClose,
  onSaveSuccess,
}: ProductWizardModalProps) {
  const [modalStep, setModalStep] = useState<1 | 2 | 3>(1);
  const [isSaving, setIsSaving] = useState(false);
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);

  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryIcon, setNewCategoryIcon] = useState("LayoutGrid");
  const [newCategoryDescription, setNewCategoryDescription] = useState("");
  const [newCategoryFields, setNewCategoryFields] = useState<
    { name: string; type: "text" | "number"; placeholder?: string }[]
  >([]);

  const [productForm, setProductForm] = useState(emptyForm);

  useEffect(() => {
    if (isOpen) {
      if (mode === "edit" && editingProduct) {
        let parsedSpecs: Record<string, unknown> = {};
        try {
          if (editingProduct?.specsJson) {
            parsedSpecs = JSON.parse(editingProduct.specsJson as string);
            delete parsedSpecs.type;
          }
        } catch {}

        // eslint-disable-next-line
        setProductForm({
          name: editingProduct.name,
          description: editingProduct.description,
          price: editingProduct.price,
          cost: editingProduct.cost,
          stock: editingProduct.stock,
          brand: editingProduct.brand,
          categoryId: editingProduct.categoryId,
          imageUrl: editingProduct.imageUrl,
          sku: editingProduct.sku || "",
          isActive: editingProduct.isActive ?? true,
          lowStockThreshold: editingProduct.lowStockThreshold ?? 5,
          supplier: editingProduct.supplier || "",
          discountPercent: editingProduct.discountPercent ?? 0,
          discountEndsAt: editingProduct.discountEndsAt
            ? new Date(editingProduct.discountEndsAt).toISOString().slice(0, 16)
            : "",
          dynamicSpecs: parsedSpecs,
        });
        setModalStep(2);
      } else {
        setProductForm(emptyForm);
        setModalStep(1);
        setNewCategoryName("");
        setNewCategoryIcon("LayoutGrid");
        setNewCategoryDescription("");
        setNewCategoryFields([]);
      }
    }
  }, [isOpen, mode, editingProduct]);

  if (!isOpen) return null;

  const handleModalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const activeCategory = categories.find(
      (c) => c.id === productForm.categoryId,
    );
    const categoryName = activeCategory?.name || "";
    const builtSpecs = {
      type: categoryName.toLowerCase().replace(" ", "_"),
      ...productForm.dynamicSpecs,
    };

    const payload = {
      ...productForm,
      discountPercent: productForm.discountPercent || null,
      discountEndsAt: productForm.discountEndsAt
        ? new Date(productForm.discountEndsAt)
        : null,
      specsJson: JSON.stringify(builtSpecs),
    };
    delete (payload as { dynamicSpecs?: unknown }).dynamicSpecs;

    if (mode === "add") {
      const result = await createProduct(
        payload as Parameters<typeof createProduct>[0],
      );
      if (result.success && result.product) {
        const catObj = categories.find(
          (c) => c.id === result.product!.categoryId,
        ) || { id: "unknown", name: "Unknown" };
        onSaveSuccess({ ...result.product, category: catObj }, "add");
      } else {
        alert("Failed to create product.");
      }
    } else if (mode === "edit" && editingProduct?.id) {
      const result = await updateProduct(
        editingProduct.id as string,
        payload as Parameters<typeof updateProduct>[1],
      );
      if (result.success) {
        const catObj = activeCategory || { id: "unknown", name: "Unknown" };
        onSaveSuccess(
          { ...editingProduct, ...payload, category: catObj },
          "edit",
        );
      } else {
        alert("Failed to update product.");
      }
    }

    setIsSaving(false);
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim() || isCreatingCategory) return;

    setIsCreatingCategory(true);
    const validFields = newCategoryFields.filter((f) => f.name.trim() !== "");
    const fieldsJsonStr = JSON.stringify(validFields);
    const result = await createCategory(
      newCategoryName.trim(),
      fieldsJsonStr,
      newCategoryIcon,
      newCategoryDescription,
    );

    if (result.success && result.category) {
      setProductForm({
        ...productForm,
        categoryId: result.category.id,
        dynamicSpecs: {},
      });
      setModalStep(2);
      onSaveSuccess(null, "add", result.category); // Using this to pass the new category up
    } else {
      alert(result.error || "Failed to create category.");
    }
    setIsCreatingCategory(false);
  };

  const currentFormMargin =
    productForm.price > 0
      ? ((productForm.price - productForm.cost) / productForm.price) * 100
      : 0;
  const activeCategoryName =
    categories.find((c) => c.id === productForm.categoryId)?.name || "";

  const namePlaceholder =
    activeCategoryName === "CPU"
      ? "e.g. Intel Core i9-14900K"
      : activeCategoryName === "Motherboard"
        ? "e.g. ASUS ROG Strix Z790"
        : activeCategoryName === "RAM" || activeCategoryName === "Memory"
          ? "e.g. Corsair Vengeance 32GB"
          : activeCategoryName === "GPU"
            ? "e.g. NVIDIA RTX 4090"
            : activeCategoryName === "Power Supply"
              ? "e.g. Corsair RM850x"
              : activeCategoryName === "Case"
                ? "e.g. NZXT H9 Flow"
                : activeCategoryName.includes("Storage")
                  ? "e.g. Samsung 990 PRO 2TB"
                  : activeCategoryName.includes("Cooler")
                    ? "e.g. Noctua NH-D15"
                    : "e.g. Product Name";

  const skuPlaceholder =
    activeCategoryName === "CPU"
      ? "e.g. CPU-14900K"
      : activeCategoryName === "Motherboard"
        ? "e.g. MB-Z790-ASUS"
        : activeCategoryName === "GPU"
          ? "e.g. GPU-4090-FE"
          : activeCategoryName.includes("Storage")
            ? "e.g. SSD-990PRO-2TB"
            : activeCategoryName === "RAM" || activeCategoryName === "Memory"
              ? "e.g. RAM-32GB-DDR5"
              : activeCategoryName === "Case"
                ? "e.g. CASE-NZXT-H9"
                : activeCategoryName === "Power Supply"
                  ? "e.g. PSU-RM850X"
                  : activeCategoryName.includes("Cooler")
                    ? "e.g. COOL-NH-D15"
                    : "e.g. SKU-12345";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="glass w-full max-w-4xl border border-dark-border overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 border-b border-dark-border flex justify-between items-center bg-dark-surface/50 shrink-0">
          <h2 className="text-xl font-bold text-white">
            {mode === "add"
              ? modalStep === 1
                ? "Step 1: Select Category"
                : modalStep === 3
                  ? "Add New Category"
                  : "Step 2: Product Details"
              : "Edit Product Details"}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto p-6">
          {modalStep === 1 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {categories.map((c) => (
                <button
                  key={c.id}
                  onClick={() => {
                    setProductForm({
                      ...productForm,
                      categoryId: c.id,
                      dynamicSpecs: {},
                    });
                    setModalStep(2);
                  }}
                  className="glass aspect-square border border-dark-border hover:border-brand-500 hover:bg-brand-500/10 flex flex-col items-center justify-center p-4 transition-all text-center group"
                >
                  <div className="w-12 h-12 bg-dark-surface/50 mb-3 group-hover:bg-brand-500/20 transition-colors flex items-center justify-center">
                    <Plus className="w-6 h-6 text-gray-400 group-hover:text-brand-400" />
                  </div>
                  <span className="font-bold text-gray-200 group-hover:text-white">
                    {c.name}
                  </span>
                </button>
              ))}

              <button
                onClick={() => setModalStep(3)}
                className="glass aspect-square border border-dark-border border-dashed hover:border-emerald-500 hover:bg-emerald-500/10 flex flex-col items-center justify-center p-4 transition-all text-center group"
              >
                <div className="w-12 h-12 bg-dark-surface/50 mb-3 group-hover:bg-emerald-500/20 transition-colors flex items-center justify-center">
                  <Plus className="w-6 h-6 text-gray-400 group-hover:text-emerald-400" />
                </div>
                <span className="font-bold text-gray-400 group-hover:text-emerald-400">
                  Add Category
                </span>
              </button>
            </div>
          ) : modalStep === 3 ? (
            <form
              onSubmit={handleCreateCategory}
              className="space-y-6 max-w-xl mx-auto py-4"
            >
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-emerald-400">
                    New Category Name
                  </label>
                  <input
                    required
                    type="text"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    className="w-full bg-dark-bg border border-emerald-500/30 px-3 py-3 text-white focus:outline-none focus:border-emerald-500 transition-colors"
                    placeholder="e.g. Optical Drives"
                    autoFocus
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-emerald-400">
                    Description (Optional)
                  </label>
                  <textarea
                    value={newCategoryDescription}
                    onChange={(e) => setNewCategoryDescription(e.target.value)}
                    className="w-full bg-dark-bg border border-emerald-500/30 px-3 py-2 text-white focus:outline-none focus:border-emerald-500 transition-colors h-20 resize-none"
                    placeholder="e.g. Blu-ray and DVD/CD burners and readers"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-emerald-400">
                    Icon (Name or Image URL)
                  </label>
                  <input
                    type="text"
                    value={newCategoryIcon}
                    onChange={(e) => setNewCategoryIcon(e.target.value)}
                    className="w-full bg-dark-bg border border-emerald-500/30 px-3 py-3 text-white focus:outline-none focus:border-emerald-500 transition-colors"
                    placeholder="e.g. Disc or /icons/optical.png"
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    Provide a Lucide icon name (e.g. LayoutGrid, Disc, Laptop)
                    or an image URL starting with / or http.
                  </p>
                </div>

                <div className="space-y-3 pt-2">
                  <label className="text-xs font-bold text-gray-400 flex items-center justify-between">
                    Custom Specifications
                    <button
                      type="button"
                      onClick={() =>
                        setNewCategoryFields([
                          ...newCategoryFields,
                          { name: "", type: "text" },
                        ])
                      }
                      className="text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition-colors bg-emerald-500/10 hover:bg-emerald-500/20 px-2 py-1 "
                    >
                      <Plus className="w-4 h-4" /> Add Field
                    </button>
                  </label>

                  {newCategoryFields.map((field, idx) => (
                    <div
                      key={idx}
                      className="flex gap-2 items-center animate-in slide-in-from-top-2 duration-200"
                    >
                      <input
                        type="text"
                        value={field.name}
                        onChange={(e) => {
                          const arr = [...newCategoryFields];
                          arr[idx].name = e.target.value;
                          setNewCategoryFields(arr);
                        }}
                        placeholder="Field Name (e.g. Read Speed)"
                        className="flex-1 bg-dark-bg border border-dark-border px-3 py-2 text-white text-sm focus:outline-none focus:border-emerald-500 transition-colors"
                      />
                      <input
                        type="text"
                        value={field.placeholder || ""}
                        onChange={(e) => {
                          const arr = [...newCategoryFields];
                          arr[idx].placeholder = e.target.value;
                          setNewCategoryFields(arr);
                        }}
                        placeholder="Placeholder (Opt)"
                        className="flex-1 bg-dark-bg border border-dark-border px-3 py-2 text-white text-sm focus:outline-none focus:border-emerald-500 transition-colors"
                      />
                      <select
                        value={field.type}
                        onChange={(e) => {
                          const arr = [...newCategoryFields];
                          arr[idx].type = e.target.value as "text" | "number";
                          setNewCategoryFields(arr);
                        }}
                        className="w-32 bg-dark-bg border border-dark-border px-3 py-2 text-gray-300 text-sm focus:outline-none focus:border-emerald-500 transition-colors appearance-none"
                      >
                        <option value="text">Text Array</option>
                        <option value="number">Numeric</option>
                      </select>
                      <button
                        type="button"
                        onClick={() =>
                          setNewCategoryFields(
                            newCategoryFields.filter((_, i) => i !== idx),
                          )
                        }
                        className="p-2 text-gray-500 hover:text-rose-400 transition-colors bg-dark-surface "
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  {newCategoryFields.length === 0 && (
                    <div className="p-4 border border-dark-border border-dashed bg-dark-surface/30 flex flex-col items-center justify-center text-center">
                      <p className="text-sm text-gray-500">
                        No custom specs defined.
                      </p>
                      <p className="text-xs text-gray-600 mt-1">
                        Products in this category will only request general
                        information like Price and Description.
                      </p>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex gap-3 pt-6 border-t border-dark-border">
                <button
                  type="button"
                  onClick={() => setModalStep(1)}
                  className="px-4 py-2 font-bold text-gray-400 hover:text-white transition-colors"
                  disabled={isCreatingCategory}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreatingCategory || !newCategoryName.trim()}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 transition-colors disabled:opacity-50"
                >
                  {isCreatingCategory ? "Creating..." : "Create & Continue"}
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleModalSubmit} className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-brand-400 font-bold text-sm">
                  General Information
                </h3>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-400">
                      Product Name
                    </label>
                    <input
                      required
                      type="text"
                      value={productForm.name}
                      onChange={(e) =>
                        setProductForm({ ...productForm, name: e.target.value })
                      }
                      className="w-full bg-dark-bg border border-dark-border px-3 py-2 text-white focus:outline-none focus:border-brand-500"
                      placeholder={namePlaceholder}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-400">
                      Image URL
                    </label>
                    <input
                      required
                      type="text"
                      value={productForm.imageUrl}
                      onChange={(e) =>
                        setProductForm({
                          ...productForm,
                          imageUrl: e.target.value,
                        })
                      }
                      className="w-full bg-dark-bg border border-dark-border px-3 py-2 text-white focus:outline-none focus:border-brand-500"
                      placeholder="/placeholder.svg"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-400">
                    Description
                  </label>
                  <textarea
                    required
                    value={productForm.description}
                    onChange={(e) =>
                      setProductForm({
                        ...productForm,
                        description: e.target.value,
                      })
                    }
                    className="w-full bg-dark-bg border border-dark-border px-3 py-2 text-white focus:outline-none focus:border-brand-500 h-20 resize-none"
                    placeholder="Product details..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-400">
                      SKU
                    </label>
                    <input
                      required
                      type="text"
                      value={productForm.sku}
                      onChange={(e) =>
                        setProductForm({ ...productForm, sku: e.target.value })
                      }
                      className="w-full bg-dark-bg border border-dark-border px-3 py-2 text-white focus:outline-none focus:border-brand-500 font-mono text-sm"
                      placeholder={skuPlaceholder}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-400">
                      Supplier/Vendor (Optional)
                    </label>
                    <input
                      type="text"
                      value={productForm.supplier}
                      onChange={(e) =>
                        setProductForm({
                          ...productForm,
                          supplier: e.target.value,
                        })
                      }
                      className="w-full bg-dark-bg border border-dark-border px-3 py-2 text-white focus:outline-none focus:border-brand-500"
                      placeholder="e.g. Tech Distributors Inc."
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-400">
                      Brand
                    </label>
                    <input
                      required
                      type="text"
                      value={productForm.brand}
                      onChange={(e) =>
                        setProductForm({
                          ...productForm,
                          brand: e.target.value,
                        })
                      }
                      className="w-full bg-dark-bg border border-dark-border px-3 py-2 text-white focus:outline-none focus:border-brand-500"
                      placeholder="e.g. ASUS"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-400">
                      Category
                    </label>
                    <div className="w-full bg-dark-surface/50 border border-dark-border px-3 py-2 text-gray-400 text-sm font-bold flex justify-between items-center cursor-not-allowed opacity-75">
                      {activeCategoryName || "Unknown Category"}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-5 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-400">
                      Cost
                    </label>
                    <input
                      required
                      type="number"
                      value={productForm.cost || ""}
                      onChange={(e) =>
                        setProductForm({
                          ...productForm,
                          cost: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="w-full bg-dark-bg border border-dark-border px-3 py-2 text-white focus:outline-none focus:border-brand-500 font-mono text-sm"
                      placeholder="0"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-400">
                      Price
                    </label>
                    <input
                      required
                      type="number"
                      value={productForm.price || ""}
                      onChange={(e) =>
                        setProductForm({
                          ...productForm,
                          price: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="w-full bg-dark-bg border border-dark-border px-3 py-2 text-white focus:outline-none focus:border-brand-500 font-mono text-sm"
                      placeholder="0"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-400">
                      Margin
                    </label>
                    <div
                      className={`w-full bg-dark-surface/50 border border-dark-border px-3 py-2 font-mono text-sm flex items-center h-[38px] ${currentFormMargin < 15 ? "text-rose-400" : "text-emerald-400"}`}
                    >
                      {currentFormMargin.toFixed(1)}%
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-400">
                      Stock
                    </label>
                    <input
                      required
                      type="number"
                      value={productForm.stock}
                      onChange={(e) =>
                        setProductForm({
                          ...productForm,
                          stock: parseInt(e.target.value) || 0,
                        })
                      }
                      className="w-full bg-dark-bg border border-dark-border px-3 py-2 text-white focus:outline-none focus:border-brand-500 font-mono text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-400">
                      Low Stock
                    </label>
                    <input
                      required
                      type="number"
                      value={productForm.lowStockThreshold}
                      onChange={(e) =>
                        setProductForm({
                          ...productForm,
                          lowStockThreshold: parseInt(e.target.value) || 0,
                        })
                      }
                      className="w-full bg-dark-bg border border-dark-border px-3 py-2 text-white focus:outline-none focus:border-brand-500 font-mono text-sm"
                      placeholder="5"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 border-t border-dark-border/50 pt-4 mt-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-400">
                      Temporary Discount (%)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={productForm.discountPercent || ""}
                      onChange={(e) =>
                        setProductForm({
                          ...productForm,
                          discountPercent: parseInt(e.target.value) || 0,
                        })
                      }
                      className="w-full bg-dark-bg border border-dark-border px-3 py-2 text-white focus:outline-none focus:border-brand-500 font-mono text-sm"
                      placeholder="e.g. 20"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-400">
                      Discount Ends At
                    </label>
                    <input
                      type="datetime-local"
                      value={productForm.discountEndsAt}
                      onChange={(e) =>
                        setProductForm({
                          ...productForm,
                          discountEndsAt: e.target.value,
                        })
                      }
                      className="w-full bg-dark-bg border border-dark-border px-3 py-2 text-white focus:outline-none focus:border-brand-500 text-sm [&::-webkit-calendar-picker-indicator]:invert"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={productForm.isActive}
                      onChange={(e) =>
                        setProductForm({
                          ...productForm,
                          isActive: e.target.checked,
                        })
                      }
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-dark-surface/50 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-brand-500 peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-gray-400 peer-checked:after:bg-white after:border-gray-500 after:border after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                    <span className="ml-3 text-sm font-bold text-gray-400">
                      Active Product
                    </span>
                  </label>
                </div>
              </div>

              <hr className="border-dark-border" />

              <div className="space-y-4">
                <h3 className="text-emerald-400 font-bold text-sm flex items-center gap-2">
                  Technical Specifications
                  <span className="bg-dark-bg px-2 py-0.5 text-[11px] text-gray-400">
                    Dynamic
                  </span>
                </h3>

                {(() => {
                  const activeCat = categories.find(
                    (c) => c.id === productForm.categoryId,
                  );
                  const catName = activeCat?.name || "";
                  let specFields = CATEGORY_SPECS[catName];

                  if (!specFields && activeCat && activeCat.fieldsJson) {
                    try {
                      const parsed = JSON.parse(activeCat.fieldsJson);
                      if (Array.isArray(parsed) && parsed.length > 0) {
                        specFields = parsed.map(
                          (f: {
                            name: string;
                            type: string;
                            placeholder?: string;
                          }) => ({
                            key: f.name.toLowerCase().replace(/\s+/g, "_"),
                            label: f.name,
                            type: f.type === "number" ? "number" : "text",
                            placeholder: f.placeholder,
                          }),
                        );
                      }
                    } catch {}
                  }

                  if (!specFields) specFields = [];

                  if (specFields.length === 0) {
                    return (
                      <p className="text-gray-500 text-sm">
                        No specialized filters required for this category. The
                        general fields above are sufficient.
                      </p>
                    );
                  }

                  return (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {specFields.map((field) => (
                        <div key={field.key} className="space-y-1">
                          <label className="text-xs font-bold text-gray-400">
                            {field.label}
                          </label>
                          <input
                            type={field.type}
                            value={
                              (productForm.dynamicSpecs[field.key] as
                                | string
                                | number
                                | undefined) || ""
                            }
                            onChange={(e) => {
                              const val =
                                field.type === "number"
                                  ? parseFloat(e.target.value) || 0
                                  : e.target.value;
                              setProductForm((prev) => ({
                                ...prev,
                                dynamicSpecs: {
                                  ...prev.dynamicSpecs,
                                  [field.key]: val,
                                },
                              }));
                            }}
                            className="w-full bg-dark-bg border border-dark-border px-3 py-2 text-white focus:outline-none focus:border-brand-500"
                            placeholder={
                              field.placeholder ||
                              (field.type === "number" ? "0" : "...")
                            }
                          />
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>

              <div className="pt-4 flex justify-between gap-3 border-t border-dark-border/50 mt-6 pt-6 -mx-6 px-6 bg-dark-surface/30">
                <div>
                  {mode === "add" && (
                    <button
                      type="button"
                      onClick={() => setModalStep(1)}
                      className="px-4 py-2 text-sm font-bold text-gray-400 hover:text-white transition-colors"
                    >
                      &larr; Back to Categories
                    </button>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-sm font-bold text-gray-400 hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-6 py-2 bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white font-bold shadow-lg transition-colors text-sm"
                  >
                    {isSaving
                      ? "Saving..."
                      : mode === "add"
                        ? "Create Product"
                        : "Save Changes"}
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
