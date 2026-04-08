'use client';

import { useState } from "react";
import { useBuilderStore, getActivePrice, calculateIssues, ValidationIssue } from "@/store/useBuilderStore";
import { AlertTriangle, Plus, ShoppingCart, CheckCircle } from "lucide-react";
import Image from "next/image";

function formatHardwareSpec(key: string, value: any, type?: string): string {
  switch (key) {
    case 'cores': return `${value} Cores`;
    case 'speedGhz': return `${value} GHz`;
    case 'memory': return type === 'gpu' ? `${value}GB VRAM` : String(value);
    case 'tdp': return `${value}W TDP`;
    case 'recommendedPsu': return `${value}W`;
    case 'lengthMm': return `${value}mm`;
    case 'capacity': return Number(value) >= 1000 ? `${Number(value) / 1000}TB` : `${value}GB`;
    case 'speed': return type === 'ram' ? `${(Number(value) / 1000).toFixed(1)} GHz` : `${value} MHz`;
    case 'casLatency': return `CL${value}`;
    case 'memorySlots': return `${value} DIMMs`;
    case 'maxMemory': return `Up to ${value}GB`;
    case 'wattage': return `${value}W`;
    case 'modular': return typeof value === 'boolean' ? (value ? 'Fully Modular' : 'Non-Modular') : `${value} Modular`;
    case 'maxMainboard': return `Up to ${value}`;
    case 'sidePanel': return `${value} Panel`;
    case 'coolerType': return `${value} Cooler`;
    case 'radiatorSize': return `${value}mm Radiator`;
    case 'height': return `${value}mm Height`;
    case 'rpm': return `${value} RPM`;
    case 'cache': return `${value}MB Cache`;
    case 'readSpeed': return `${value} MB/s Read`;
    case 'writeSpeed': return `${value} MB/s Write`;
    default: return String(value);
  }
}

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    brand: string;
    price: number;
    discountPercent?: number | null;
    discountEndsAt?: Date | null;
    imageUrl: string;
    specsJson: string;
    category: {
      name: string;
    };
  };
}

export function ProductCard({ product }: ProductCardProps) {
  const [isAdded, setIsAdded] = useState(false);
  const handleOptimisticAdd = (action: () => void) => {
    action();
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1000);
  };

  const { 
    mode, 
    components, 
    setComponent, 
    removeComponent, 
    addToLooseCart,
    looseCart,
    updateLooseQuantity,
    removeFromLooseCart,
    buildStorage,
    addBuildStorageComponent,
    updateBuildStorageQuantity
  } = useBuilderStore();
  
  const categoryName = product.category.name;
  const isSelected = mode === "build" && components[categoryName]?.id === product.id;
  const issues = useBuilderStore(state => state.issues);
  const isConflicting = mode === "build" && issues.some(issue => issue.involvedCategories.includes(categoryName));

  const finalPrice = getActivePrice(product);
  const isDiscounted = finalPrice < product.price;

  let specs: Record<string, string> = {};
  try {
    specs = JSON.parse(product.specsJson || "{}");
  } catch (e) {
    console.error(`Failed to parse specsJson for product ${product.id}:`, e);
  }

  let potentialIssues: ValidationIssue[] = [];
  if (mode === "build" && !isSelected) {
    const hypotheticalComponents = {
      ...components,
      [categoryName]: {
        id: product.id,
        name: product.name,
        price: product.price,
        category: categoryName,
        specs
      }
    };
    potentialIssues = calculateIssues(hypotheticalComponents).filter(issue => issue.involvedCategories.includes(categoryName));
  }

  const handleToggle = () => {
    if (mode === "loose") {
      addToLooseCart({
        id: product.id,
        name: product.name,
        price: product.price,
        category: categoryName,
        discountPercent: product.discountPercent,
        discountEndsAt: product.discountEndsAt,
        specs: specs
      });
      return;
    }

    if (isSelected) {
      removeComponent(categoryName);
    } else {
      setComponent(categoryName, {
        id: product.id,
        name: product.name,
        price: product.price,
        category: categoryName,
        discountPercent: product.discountPercent,
        discountEndsAt: product.discountEndsAt,
        specs: specs
      });
    }
  };

  return (
    <div className={`flex flex-col bg-[#0f0f0f] border ${isSelected ? (isConflicting ? 'border-red-500' : 'border-brand') : 'border-border'} rounded-lg overflow-hidden group md:hover:border-brand/50 transition-colors relative`}>
      {/* Dynamic Compatibility Warning */}
      {(isSelected && isConflicting) || (!isSelected && potentialIssues.length > 0) ? (
         <div className="absolute top-3 right-3 text-red-500 z-20 bg-red-950/90 p-1.5 rounded-md border border-red-900 shadow-lg group/warning cursor-help">
           <AlertTriangle className="w-5 h-5" />
           
           {/* Hover Tooltip */}
           <div className="absolute right-0 top-full mt-2 w-56 bg-[#1a0f0f] border border-red-900/50 rounded-md shadow-2xl p-3 opacity-0 group-hover/warning:opacity-100 transition-opacity pointer-events-none z-30 flex flex-col">
              <span className="text-xs font-semibold text-red-500 mb-2 tracking-wide">
                {isSelected ? "Current Conflicts" : "Potential Conflicts"}
              </span>
              <ul className="text-[11px] text-red-200/90 list-disc pl-4 space-y-1.5 leading-tight">
                {isSelected 
                   ? issues.filter(issue => issue.involvedCategories.includes(categoryName)).map((issue, i) => <li key={i}>{issue.message}</li>)
                   : potentialIssues.map((issue, i) => <li key={i}>{issue.message}</li>)
                }
              </ul>
           </div>
         </div>
      ) : null}

      {/* Image Area */}
      <div className="bg-[#1f1614] h-[220px] shrink-0 w-full flex items-center justify-center p-6 relative">
        <Image 
          src={product.imageUrl.replace('/products/', '/assets/').replace('_FINAL', '')} 
          alt={product.name}
          width={200}
          height={200}
          className="object-contain h-full w-full drop-shadow-2xl"
          unoptimized
        />
      </div>

      {/* Details */}
      <div className="p-5 flex-1 flex flex-col">
        <span className="text-brand text-xs font-semibold tracking-wider mb-1">
          {product.brand}
        </span>
        <h3 className="text-white font-medium text-lg leading-tight mb-4">
          {product.name}
        </h3>

        {/* Specs Badges */}
        <div className="flex flex-wrap gap-2 mb-6">
          {Object.entries(specs).filter(([key]) => key !== 'type').map(([key, value]) => {
            const type = specs.type as string | undefined;
            const formattedValue = formatHardwareSpec(key, value, type);

            return (
              <div key={key} className="px-2 py-1 bg-surface border border-border text-zinc-400 text-[10px] font-semibold rounded tracking-wide">
                {formattedValue}
              </div>
            );
          })}
        </div>

        {/* Price & Action */}
        <div className="mt-auto">
          <div className="text-zinc-400 text-xs mb-1">Price</div>
          <div className="flex items-center gap-2 mb-4">
             <div className="text-xl text-white font-mono font-bold">
               {finalPrice.toLocaleString('no-NO')} Kr
             </div>
             {isDiscounted && (
               <div className="text-sm text-zinc-400 line-through font-mono">
                 {product.price.toLocaleString('no-NO')} Kr
               </div>
             )}
          </div>
          
          {mode === "build" && categoryName === "Storage" ? (() => {
             const storageItem = buildStorage.find(s => s.id === product.id);
             if (storageItem) {
               return (
                 <div className="w-full h-[42px] flex items-center bg-emerald-600 rounded font-medium tracking-tight text-white overflow-hidden shadow-[0_0_15px_rgba(5,150,105,0.4)]">
                   <button aria-label="Decrease quantity"
                     data-testid="qty-decrease"
                     onClick={(e) => {
                       e.stopPropagation();
                       updateBuildStorageQuantity(product.id, storageItem.quantity - 1);
                     }}
                     className="flex-1 h-full md:hover:bg-emerald-700 active:bg-emerald-800 transition-colors flex items-center justify-center text-lg"
                   >
                     -
                   </button>
                   <div className="px-5 h-full flex items-center justify-center min-w-[3ch] font-mono text-sm bg-black/20 text-white font-bold border-x border-emerald-500/30">
                     {storageItem.quantity}
                   </div>
                   <button aria-label="Increase quantity"
                     data-testid="qty-increase"
                     onClick={(e) => {
                       e.stopPropagation();
                       updateBuildStorageQuantity(product.id, storageItem.quantity + 1);
                     }}
                     className="flex-1 h-full md:hover:bg-emerald-700 active:bg-emerald-800 transition-colors flex items-center justify-center text-lg"
                   >
                     <Plus className="w-4 h-4" />
                   </button>
                 </div>
               );
             } else {
               return (
                 <button aria-label="Select product"
                   data-testid="add-to-cart-btn"
                   onClick={() => handleOptimisticAdd(() => addBuildStorageComponent({
                     id: product.id,
                     name: product.name,
                     price: product.price,
                     category: categoryName,
                     discountPercent: product.discountPercent,
                     discountEndsAt: product.discountEndsAt,
                     specs: specs
                   }))}
                   className="w-full h-11 rounded font-medium flex items-center justify-center gap-2 transition-all bg-amber-600 md:hover:bg-amber-500 text-white"
                 >
                   {isAdded ? <><CheckCircle className="w-4 h-4"/> Added!</> : "Select"}
                 </button>
               );
             }
          })() : mode === "loose" && looseCart.some(i => i.id === product.id) ? (() => {
             const cartItem = looseCart.find(i => i.id === product.id)!;
             return (
               <div className="w-full h-[42px] flex items-center bg-zinc-800 rounded font-medium tracking-tight text-white overflow-hidden border border-border">
                 <button aria-label="Decrease quantity"
                   data-testid="qty-decrease"
                   onClick={(e) => {
                     e.stopPropagation();
                     if (cartItem.quantity <= 1) {
                       removeFromLooseCart(product.id);
                     } else {
                       updateLooseQuantity(product.id, cartItem.quantity - 1);
                     }
                   }}
                   className="flex-1 h-full md:hover:bg-zinc-700 active:bg-zinc-600 transition-colors flex items-center justify-center text-lg"
                 >
                   -
                 </button>
                 <div className="px-5 h-full flex items-center justify-center min-w-[3ch] font-mono text-sm bg-black/40 text-brand font-bold border-x border-border">
                   {cartItem.quantity}
                 </div>
                 <button aria-label="Increase quantity"
                   data-testid="qty-increase"
                   onClick={(e) => {
                     e.stopPropagation();
                     updateLooseQuantity(product.id, cartItem.quantity + 1);
                   }}
                   className="flex-1 h-full md:hover:bg-zinc-700 active:bg-zinc-600 transition-colors flex items-center justify-center text-lg"
                 >
                   <Plus className="w-4 h-4" />
                 </button>
               </div>
             );
          })() : (
            <button
              data-testid="add-to-cart-btn"
              onClick={() => handleOptimisticAdd(() => handleToggle())}
              className={`w-full h-11 rounded font-medium flex items-center justify-center gap-2 transition-all ${
                mode === "build" 
                  ? (isSelected 
                      ? 'bg-emerald-600 md:hover:bg-emerald-700 text-white shadow-[0_0_15px_rgba(5,150,105,0.4)]'
                      : 'bg-brand md:hover:bg-brand-hover text-white')
                  : 'bg-zinc-800 md:hover:bg-zinc-700 border border-border text-white md:hover:border-brand/50'
              }`}
            >
              {mode === "build" ? (isSelected ? "Selected" : "Select") : (isAdded ? <><CheckCircle className="w-4 h-4"/> Added!</> : <><ShoppingCart className="w-4 h-4"/> Add to Cart</>)}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
