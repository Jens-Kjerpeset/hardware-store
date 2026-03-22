"use client";

import { useState, useEffect } from "react";
import { useStore } from "@/lib/store";
import {
  checkPotentialCompatibility,
  SelectedProduct,
} from "@/lib/compatibility";
import { formatCurrency } from "@/lib/utils";
import {
  AlertTriangle,
  Cpu,
  Check,
  ShoppingCart,
  Minus,
  Plus,
} from "lucide-react";
import Image from "next/image";

export interface ProductCardType {
  id: string;
  name: string;
  price: number;
  brand: string;
  specsJson: string;
  description: string;
  imageUrl: string;
  categoryId: string;
  discountPercent?: number | null;
  discountEndsAt?: Date | string | null;
  category: { id?: string; name: string };
}

export function ProductCard({ product }: { product: ProductCardType }) {
  const {
    mode,
    buildSystem,
    buildStorage,
    cart,
    updateBuildStorageQuantity,
    addBuildStorageComponent,
    setBuildComponent,
    removeBuildComponent,
    updateQuantity,
    addToCart,
  } = useStore();

  const [isAdded, setIsAdded] = useState(false);

  const specs = JSON.parse(product.specsJson);
  const [isDiscountActive, setIsDiscountActive] = useState(false);

  useEffect(() => {
    if (!product.discountPercent || !product.discountEndsAt) return;
    const checkDate = () =>
      setIsDiscountActive(
        new Date(product.discountEndsAt!).getTime() > Date.now(),
      );
    checkDate();
    const timer = setInterval(checkDate, 60000);
    return () => clearInterval(timer);
  }, [product.discountPercent, product.discountEndsAt]);

  const salePrice =
    isDiscountActive && product.discountPercent
      ? product.price * (1 - product.discountPercent / 100)
      : product.price;
  const buildParts = [...Object.values(buildSystem), ...buildStorage];

  const potentialIncompatibilities =
    mode === "build"
      ? checkPotentialCompatibility(
          buildParts.map((p) => ({
            id: p.id,
            name: p.name,
            brand: p.brand,
            categoryId: p.category.name,
            specsJson: p.specsJson,
          })) as SelectedProduct[],
          {
            id: product.id,
            name: product.name,
            brand: product.brand,
            categoryId: product.category.name,
            specsJson: product.specsJson,
          },
        )
      : [];

  const isIncompatible = potentialIncompatibilities.length > 0;

  return (
    <div
      className={`group flex flex-col min-w-0 glass transition-all duration-300 relative ${isIncompatible ? "border-red-500/50 hover:shadow-[0_0_30px_-5px_rgba(239,68,68,0.2)] hover:z-50" : "hover:border-brand-500/50 hover:shadow-[0_0_30px_-5px_rgba(59,130,246,0.2)] hover:z-50"}`}
    >
      {isIncompatible && (
        <div className="absolute top-3 right-3 z-50 group/warn">
          <AlertTriangle className="w-6 h-6 text-red-500 cursor-help" />
          <div className="absolute right-0 top-full mt-2 hidden group-hover/warn:block w-64 p-3 bg-dark-bg border border-red-500/50 text-xs text-red-200 shadow-2xl z-[100] ">
            <ul className="list-disc pl-4 space-y-1">
              {potentialIncompatibilities.map((w, i) => (
                <li key={i}>{w}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Image specific background gradient based on category */}
      <div
        className={`h-48 w-full p-6 flex items-center justify-center bg-gradient-to-b relative overflow-hidden ${isIncompatible ? "from-red-950/40 to-dark-bg bg-red-950/20" : "from-orange-500/10 to-dark-bg"}`}
      >
        {isDiscountActive && (
          <div className="absolute top-4 -left-10 w-40 bg-rose-600 text-white font-black text-xs text-center py-1 shadow-lg transform -rotate-45 z-20 tracking-wider">
            {product.discountPercent}% OFF
          </div>
        )}
        <div className="absolute inset-0 bg-brand-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
        {product.imageUrl && product.imageUrl.startsWith("/products/") ? (
          <div className="relative w-[85%] h-[85%] flex items-center justify-center group-hover:scale-110 transition-transform duration-500 ease-out">
            <Image 
              src={product.imageUrl} 
              alt={product.name} 
              fill
              className="object-contain drop-shadow-[0_15px_25px_rgba(0,0,0,0.4)]"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>
        ) : (
          <Cpu className="w-24 h-24 text-gray-600/50 group-hover:scale-110 transition-transform duration-500 ease-out drop-shadow-2xl" />
        )}
      </div>

      <div className="p-4 sm:p-5 flex flex-col flex-1 min-w-0">
        <div className="text-xs font-bold text-brand-500 mb-2 truncate">
          {product.brand}
        </div>
        <h3 className="text-base sm:text-lg font-bold text-gray-100 leading-tight mb-2 group-hover:text-white transition-colors break-words line-clamp-3">
          {product.name}
        </h3>

        <div className="flex flex-wrap gap-2 mb-4 mt-auto">
          {specs.socket && (
            <span className="text-[11px] font-mono px-2 py-1 bg-dark-bg border border-dark-border text-gray-400">
              {specs.socket}
            </span>
          )}
          {specs.chipset && (
            <span className="text-[11px] font-mono px-2 py-1 bg-dark-bg border border-dark-border text-gray-400">
              {specs.chipset}
            </span>
          )}
          {specs.formFactor && (
            <span className="text-[11px] font-mono px-2 py-1 bg-dark-bg border border-dark-border text-gray-400">
              {specs.formFactor}
            </span>
          )}
          {specs.cores && (
            <span className="text-[11px] font-mono px-2 py-1 bg-dark-bg border border-dark-border text-gray-400">
              {specs.cores} Cores
            </span>
          )}
          {specs.speedGhz && (
            <span className="text-[11px] font-mono px-2 py-1 bg-dark-bg border border-dark-border text-gray-400">
              {specs.speedGhz} GHz
            </span>
          )}
          {specs.memory && specs.type === "gpu" && (
            <span className="text-[11px] font-mono px-2 py-1 bg-dark-bg border border-dark-border text-gray-400">
              {specs.memory} VRAM
            </span>
          )}
          {specs.interface && specs.type === "gpu" && (
            <span className="text-[11px] font-mono px-2 py-1 bg-dark-bg border border-dark-border text-gray-400">
              {specs.interface}
            </span>
          )}
          {specs.tdp && (
            <span className="text-[11px] font-mono px-2 py-1 bg-dark-bg border border-dark-border text-gray-400">
              {specs.tdp}W TDP
            </span>
          )}
          {specs.recommendedPsu && (
            <span className="text-[11px] font-mono px-2 py-1 bg-dark-bg border border-dark-border text-gray-400">
              {specs.recommendedPsu}W PSU
            </span>
          )}
          {specs.lengthMm && specs.type === "gpu" && (
            <span className="text-[11px] font-mono px-2 py-1 bg-dark-bg border border-dark-border text-gray-400">
              {specs.lengthMm}mm
            </span>
          )}
          {specs.memoryType && (
            <span className="text-[11px] font-mono px-2 py-1 bg-dark-bg border border-dark-border text-gray-400">
              {specs.memoryType}
            </span>
          )}
          {specs.capacity &&
            (specs.type === "ram" ||
              specs.type === "primary_storage" ||
              specs.type === "storage" ||
              specs.type === "additional_storage") && (
              <span className="text-[11px] font-mono px-2 py-1 bg-dark-bg border border-dark-border text-gray-400">
                {specs.capacity >= 1000
                  ? `${specs.capacity / 1000}TB`
                  : `${specs.capacity}GB`}
              </span>
            )}
          {specs.speed && specs.type === "ram" && (
            <span className="text-[11px] font-mono px-2 py-1 bg-dark-bg border border-dark-border text-gray-400">
              {(specs.speed / 1000).toFixed(1)} GHz
            </span>
          )}
          {specs.casLatency && (
            <span className="text-[11px] font-mono px-2 py-1 bg-dark-bg border border-dark-border text-gray-400">
              CL{specs.casLatency}
            </span>
          )}
          {specs.modules && (
            <span className="text-[11px] font-mono px-2 py-1 bg-dark-bg border border-dark-border text-gray-400">
              {specs.modules}
            </span>
          )}
          {specs.memorySlots && (
            <span className="text-[11px] font-mono px-2 py-1 bg-dark-bg border border-dark-border text-gray-400">
              {specs.memorySlots} DIMMs
            </span>
          )}
          {specs.maxMemory && specs.type === "motherboard" && (
            <span className="text-[11px] font-mono px-2 py-1 bg-dark-bg border border-dark-border text-gray-400">
              Up to {specs.maxMemory}GB
            </span>
          )}
          {specs.wattage && (
            <span className="text-[11px] font-mono px-2 py-1 bg-dark-bg border border-dark-border text-gray-400">
              {specs.wattage}W
            </span>
          )}
          {specs.efficiency && specs.type === "psu" && (
            <span className="text-[11px] font-mono px-2 py-1 bg-dark-bg border border-dark-border text-gray-400">
              {specs.efficiency}
            </span>
          )}
          {specs.modular && specs.type === "psu" && (
            <span className="text-[11px] font-mono px-2 py-1 bg-dark-bg border border-dark-border text-gray-400">
              {typeof specs.modular === "boolean"
                ? specs.modular
                  ? "Fully Modular"
                  : "Non-Modular"
                : specs.modular + " Modular"}
            </span>
          )}
          {specs.formFactor && specs.type === "case" && (
            <span className="text-[11px] font-mono px-2 py-1 bg-dark-bg border border-dark-border text-gray-400">
              {specs.formFactor}
            </span>
          )}
          {specs.maxMainboard && specs.type === "case" && (
            <span className="text-[11px] font-mono px-2 py-1 bg-dark-bg border border-dark-border text-gray-400">
              Up to {specs.maxMainboard}
            </span>
          )}
          {specs.color && specs.type === "case" && (
            <span className="text-[11px] font-mono px-2 py-1 bg-dark-bg border border-dark-border text-gray-400 flex items-center gap-1.5">
              <span
                className={`w-2 h-2 border border-gray-600 ${specs.color.toLowerCase() === "white" ? "bg-white" : "bg-black"}`}
              ></span>
              {specs.color}
            </span>
          )}
          {specs.sidePanel && specs.type === "case" && (
            <span className="text-[11px] font-mono px-2 py-1 bg-dark-bg border border-dark-border text-gray-400">
              {specs.sidePanel} Panel
            </span>
          )}
          {specs.coolerType && specs.type === "cooler" && (
            <span className="text-[11px] font-mono px-2 py-1 bg-dark-bg border border-dark-border text-gray-400">
              {specs.coolerType} Cooler
            </span>
          )}
          {specs.radiatorSize && specs.type === "cooler" && (
            <span className="text-[11px] font-mono px-2 py-1 bg-dark-bg border border-dark-border text-gray-400">
              {specs.radiatorSize}mm Radiator
            </span>
          )}
          {specs.height && specs.type === "cooler" && (
            <span className="text-[11px] font-mono px-2 py-1 bg-dark-bg border border-dark-border text-gray-400">
              {specs.height}mm Height
            </span>
          )}
          {specs.maxRPM && specs.type === "cooler" && (
            <span className="text-[11px] font-mono px-2 py-1 bg-dark-bg border border-dark-border text-gray-400">
              {specs.minRPM} - {specs.maxRPM} RPM
            </span>
          )}
          {specs.maxNoise && specs.type === "cooler" && (
            <span className="text-[11px] font-mono px-2 py-1 bg-dark-bg border border-dark-border text-gray-400">
              {specs.minNoise} - {specs.maxNoise} dBA
            </span>
          )}
          {specs.color && specs.type === "cooler" && (
            <span className="text-[11px] font-mono px-2 py-1 bg-dark-bg border border-dark-border text-gray-400 flex items-center gap-1.5">
              <span
                className={`w-2 h-2 border border-gray-600 ${specs.color.toLowerCase() === "white" ? "bg-white" : specs.color.toLowerCase() === "black" ? "bg-black" : "bg-[#8b4513]"}`}
              ></span>
              {specs.color}
            </span>
          )}
          {specs.interface &&
            (specs.type === "primary_storage" ||
              specs.type === "storage" ||
              specs.type === "additional_storage") && (
              <span className="text-[11px] font-mono px-2 py-1 bg-dark-bg border border-dark-border text-gray-400">
                {specs.interface}
              </span>
            )}
          {specs.storageType && specs.type === "additional_storage" && (
            <span className="text-[11px] font-mono px-2 py-1 bg-dark-bg border border-dark-border text-brand-400 font-bold">
              {specs.storageType}
            </span>
          )}
          {specs.rpm && specs.type === "additional_storage" && (
            <span className="text-[11px] font-mono px-2 py-1 bg-dark-bg border border-dark-border text-gray-400">
              {specs.rpm} RPM
            </span>
          )}
          {specs.cache && specs.type === "additional_storage" && (
            <span className="text-[11px] font-mono px-2 py-1 bg-dark-bg border border-dark-border text-gray-400">
              {specs.cache}MB Cache
            </span>
          )}
          {specs.readSpeed && (
            <span className="text-[11px] font-mono px-2 py-1 bg-dark-bg border border-dark-border text-gray-400">
              {specs.readSpeed} MB/s Read
            </span>
          )}
          {specs.writeSpeed && (
            <span className="text-[11px] font-mono px-2 py-1 bg-dark-bg border border-dark-border text-gray-400">
              {specs.writeSpeed} MB/s Write
            </span>
          )}
        </div>

        <div className="flex flex-col gap-3 mt-auto pt-4 border-t border-dark-border w-full min-w-0">
          <div className="flex flex-col min-w-0 w-full overflow-hidden h-full justify-center">
            <div className="flex justify-between items-center w-full mb-1">
              <span className="text-[11px] text-gray-500 leading-none">
                Price
              </span>
              {isDiscountActive && (
                <span className="text-[11px] text-rose-500/70 line-through leading-none whitespace-nowrap font-mono">
                  {formatCurrency(product.price)}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 w-full">
              <span className="text-sm sm:text-base font-black text-brand-400 leading-none whitespace-nowrap font-mono">
                {formatCurrency(salePrice)}
              </span>
            </div>
          </div>
          {mode === "build"
            ? (() => {
                if (product.category.name === "Storage") {
                  const storageItem = buildStorage.find(
                    (s: { id: string; quantity?: number }) =>
                      s.id === product.id,
                  ) as { id: string; quantity?: number } | undefined;
                  if (storageItem) {
                    return (
                      <div className="w-full h-8 sm:h-10 flex items-center bg-amber-600 ring-2 ring-amber-400/50 shadow-lg shadow-amber-500/30 overflow-hidden font-bold text-white mt-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            updateBuildStorageQuantity(
                              product.id,
                              (storageItem.quantity || 1) - 1,
                            );
                          }}
                          className="flex-1 h-full hover:bg-dark-bg/20 active:bg-dark-bg/40 transition-colors flex items-center justify-center"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <div className="px-4 h-full flex items-center justify-center min-w-[3ch] font-mono text-sm bg-dark-bg/50 text-white font-black border-x border-amber-600/30 shadow-inner">
                          {storageItem.quantity || 1}
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            updateBuildStorageQuantity(
                              product.id,
                              (storageItem.quantity || 1) + 1,
                            );
                          }}
                          className="flex-1 h-full hover:bg-dark-bg/20 active:bg-dark-bg/40 transition-colors flex items-center justify-center"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  } else {
                    return (
                      <button
                        onClick={() => addBuildStorageComponent(product)}
                        className="w-full h-8 sm:h-10 px-2 sm:px-3 text-xs sm:text-sm font-bold text-white flex items-center justify-center shadow-lg transition-all hover:scale-[1.02] active:scale-95 gap-1 bg-amber-600 hover:bg-amber-500 hover:shadow-amber-500/30"
                      >
                        <span>Select</span>
                      </button>
                    );
                  }
                } else {
                  const isSelected =
                    buildSystem[product.category.name]?.id === product.id;
                  return (
                    <button
                      onClick={() => {
                        if (isSelected) {
                          removeBuildComponent(product.category.name);
                        } else {
                          setBuildComponent(product.category.name, product);
                        }
                      }}
                      className={`w-full h-8 sm:h-10 px-2 sm:px-3 text-xs sm:text-sm font-bold text-white flex items-center justify-center shadow-lg transition-all hover:scale-[1.02] active:scale-95 gap-1 bg-brand-600 ${
                        isSelected
                          ? "bg-emerald-600 hover:bg-emerald-500 hover:shadow-emerald-500/30 ring-2 ring-emerald-400/50"
                          : "bg-amber-600 hover:bg-amber-500 hover:shadow-amber-500/30"
                      }`}
                    >
                      {isSelected ? <span>Selected</span> : <span>Select</span>}
                    </button>
                  );
                }
              })()
            : (() => {
                const cartItem = cart.find((item) => item.id === product.id);
                if (cartItem) {
                  return (
                    <div className="w-full h-8 sm:h-10 flex items-center bg-brand-500 ring-2 ring-brand-400/50 shadow-lg shadow-brand-500/30 overflow-hidden font-bold text-white">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          updateQuantity(product.id, cartItem.quantity - 1);
                        }}
                        className="flex-1 h-full hover:bg-dark-bg/20 active:bg-dark-bg/40 transition-colors flex items-center justify-center"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <div className="px-4 h-full flex items-center justify-center min-w-[3ch] font-mono text-sm bg-dark-bg/50 text-white font-black border-x border-brand-600/30 shadow-inner">
                        {cartItem.quantity}
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          updateQuantity(product.id, cartItem.quantity + 1);
                        }}
                        className="flex-1 h-full hover:bg-dark-bg/20 active:bg-dark-bg/40 transition-colors flex items-center justify-center"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  );
                }
                return (
                  <button
                    onClick={() => {
                      addToCart(product);
                      setIsAdded(true);
                      setTimeout(() => setIsAdded(false), 2000);
                    }}
                    className={`w-full h-8 sm:h-10 px-2 sm:px-3 text-xs sm:text-sm font-bold text-white flex items-center justify-center shadow-lg transition-all hover:scale-[1.02] active:scale-95 gap-1 bg-brand-600 hover:bg-brand-500 hover:shadow-brand-500/30`}
                  >
                    {isAdded ? (
                      <Check className="w-5 h-5 text-emerald-300" />
                    ) : (
                      <ShoppingCart className="w-5 h-5" />
                    )}
                  </button>
                );
              })()}
        </div>
      </div>
    </div>
  );
}
