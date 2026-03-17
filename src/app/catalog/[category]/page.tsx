"use client";

import { use, useEffect, useState, useCallback, useMemo } from 'react';
import { Cpu, ShoppingCart, FilterX, ChevronDown, Check, ChevronLeft, HelpCircle, AlertTriangle, Filter, Search, Minus, Plus } from 'lucide-react';
import { useStore } from '@/lib/store';
import { checkPotentialCompatibility, getIncompatibleFilterOptions, SelectedProduct } from '@/lib/compatibility';
import { formatCurrency } from '@/lib/utils';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import {
  CATEGORY_BRAND_MAP,
  CPU_MIN_SPEED, CPU_MAX_SPEED, CPU_MIN_CORES, CPU_MAX_CORES, CPU_MAX_TDP, CPU_SOCKETS,
  GPU_MIN_VRAM, GPU_MAX_VRAM, GPU_MIN_PSU, GPU_MAX_PSU, GPU_INTERFACES, GPU_CHIPSETS, GPU_MAX_LENGTH,
  MOTHERBOARD_FORM_FACTORS, MOTHERBOARD_MEMORY_TYPES, MOTHERBOARD_SOCKETS, MOTHERBOARD_CHIPSETS,
  RAM_MIN_SPEED, RAM_MAX_SPEED, RAM_MAX_CAS, RAM_CAPACITIES, RAM_MODULES,
  STORAGE_CAPACITIES, STORAGE_INTERFACES, STORAGE_MIN_READ_SPEED, STORAGE_MAX_READ_SPEED, STORAGE_TYPES, STORAGE_FORM_FACTORS,
  PSU_MIN_WATTAGE, PSU_MAX_WATTAGE, PSU_EFFICIENCIES, PSU_MODULARITIES, PSU_FORM_FACTORS,
  CASE_FORM_FACTORS, CASE_MAX_MAINBOARDS, CASE_COLORS, CASE_SIDE_PANELS,
  COOLER_TYPES, COOLER_RADIATOR_SIZES, COOLER_COLORS, MIN_COOLER_NOISE, MAX_COOLER_NOISE, MIN_COOLER_HEIGHT, MAX_COOLER_HEIGHT
} from '@/lib/constants';

const FilterTooltip = ({ text }: { text: string }) => (
  <div className="group relative inline-flex items-center ml-2 align-middle">
    <HelpCircle className="w-3.5 h-3.5 text-orange-500 cursor-help" />
    <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover:block w-56 p-2 bg-dark-bg border border-dark-border text-xs text-gray-300 rounded shadow-2xl z-50 normal-case tracking-normal text-center pointer-events-none">
      {text}
      <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-dark-border" />
    </div>
  </div>
);

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  brand: string;
  category: { name: string };
  categoryId: string;
  specsJson: string;
}

export default function CategoryGrid({ params }: { params: Promise<{ category: string }> }) {
  const { category: activeCategory } = use(params);
  const router = useRouter();
  const decodedCategory = decodeURIComponent(activeCategory);

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Zustand Store
  const { mode, cart, addToCart, removeFromCart, updateQuantity, setBuildComponent, removeBuildComponent, buildSystem, buildStorage, addBuildStorageComponent, removeBuildStorageComponent, updateBuildStorageQuantity } = useStore();
  const [addedItem, setAddedItem] = useState<string | null>(null);

  const buildParts = [...Object.values(buildSystem), ...buildStorage];
  
  const incompatibleFilters = useMemo(() => {
    if (mode !== 'build') return {};
    const checkArray = buildParts.map(p => ({
      id: p.id,
      name: p.name,
      brand: p.brand,
      categoryId: p.category.name,
      specsJson: p.specsJson
    })) as SelectedProduct[];
    return getIncompatibleFilterOptions(checkArray, decodedCategory);
  }, [buildParts, decodedCategory, mode]);

  // Filters
  const [query, setQuery] = useState("");
  const [brands, setBrands] = useState<string[]>([]);
  const [sort, setSort] = useState("price_desc");
  const [lastClickedBrand, setLastClickedBrand] = useState<number | null>(null);

  // Deep Filters (CPU)
  const [minSpeed, setMinSpeed] = useState<number>(CPU_MIN_SPEED);
  const [maxSpeed, setMaxSpeed] = useState<number>(CPU_MAX_SPEED);
  const [minCores, setMinCores] = useState<number>(CPU_MIN_CORES);
  const [maxCores, setMaxCores] = useState<number>(CPU_MAX_CORES);
  const [maxTDP, setMaxTDP] = useState<number>(CPU_MAX_TDP);
  const [sockets, setSockets] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  // Deep Filters (GPU)
  const [minVram, setMinVram] = useState<number>(GPU_MIN_VRAM);
  const [maxVram, setMaxVram] = useState<number>(GPU_MAX_VRAM);
  const [minPsu, setMinPsu] = useState<number>(GPU_MIN_PSU);
  const [maxPsu, setMaxPsu] = useState<number>(GPU_MAX_PSU);
  const [interfaces, setInterfaces] = useState<string[]>([]);
  const [chipsets, setChipsets] = useState<string[]>([]);
  const [maxLength, setMaxLength] = useState<number>(GPU_MAX_LENGTH);

  // Deep Filters (Motherboard)
  const [formFactors, setFormFactors] = useState<string[]>([]);
  const [memoryTypes, setMemoryTypes] = useState<string[]>([]);
  const [minMemorySlots, setMinMemorySlots] = useState<number>(0);
  const [maxMemorySlots, setMaxMemorySlots] = useState<number>(16);
  const [minMaxMemory, setMinMaxMemory] = useState<number>(0);

  // Deep Filters (RAM)
  const [minRamSpeed, setMinRamSpeed] = useState<number>(RAM_MIN_SPEED);
  const [maxRamSpeed, setMaxRamSpeed] = useState<number>(RAM_MAX_SPEED);
  const [maxCasLatency, setMaxCasLatency] = useState<number>(RAM_MAX_CAS);
  const [capacities, setCapacities] = useState<number[]>([]);
  const [modules, setModules] = useState<string[]>([]);

  // Storage Deep Filters
  const [storageInterfaces, setStorageInterfaces] = useState<string[]>([]);
  const [storageCapacities, setStorageCapacities] = useState<number[]>([]);
  const [minReadSpeed, setMinReadSpeed] = useState<number>(STORAGE_MIN_READ_SPEED);
  const [maxReadSpeed, setMaxReadSpeed] = useState<number>(STORAGE_MAX_READ_SPEED);
  const [storageTypes, setStorageTypes] = useState<string[]>([]);
  const [storageFormFactors, setStorageFormFactors] = useState<string[]>([]);

  // Power Supply specific filters
  const [minWattage, setMinWattage] = useState<number>(PSU_MIN_WATTAGE);
  const [maxWattage, setMaxWattage] = useState<number>(PSU_MAX_WATTAGE);
  const [psuEfficiencies, setPsuEfficiencies] = useState<string[]>([]);
  const [psuModularities, setPsuModularities] = useState<string[]>([]);
  const [psuFormFactors, setPsuFormFactors] = useState<string[]>([]);

  // Case specific filters
  const [caseFormFactors, setCaseFormFactors] = useState<string[]>([]);
  const [caseMaxMainboards, setCaseMaxMainboards] = useState<string[]>([]);
  const [caseColors, setCaseColors] = useState<string[]>([]);
  const [caseSidePanels, setCaseSidePanels] = useState<string[]>([]);

  // CPU Cooler specific filters
  const [coolerTypes, setCoolerTypes] = useState<string[]>([]);
  const [coolerRadiatorSizes, setCoolerRadiatorSizes] = useState<number[]>([]);
  const [coolerColors, setCoolerColors] = useState<string[]>([]);
  const [minCoolerNoise, setMinCoolerNoise] = useState<number>(MIN_COOLER_NOISE);
  const [maxCoolerNoise, setMaxCoolerNoise] = useState<number>(MAX_COOLER_NOISE);
  const [minCoolerHeight, setMinCoolerHeight] = useState<number>(MIN_COOLER_HEIGHT);
  const [maxCoolerHeight, setMaxCoolerHeight] = useState<number>(MAX_COOLER_HEIGHT);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    let url = `/api/products?sort=${sort}`;
    if (query) url += `&q=${encodeURIComponent(query)}`;
    url += `&category=${encodeURIComponent(decodedCategory)}`;
    if (brands.length > 0) url += `&brand=${encodeURIComponent(brands.join(','))}`;
    
    if (decodedCategory === 'CPU') {
      if (minSpeed > CPU_MIN_SPEED) url += `&minSpeed=${minSpeed}`;
      if (maxSpeed < CPU_MAX_SPEED) url += `&maxSpeed=${maxSpeed}`;
      if (minCores > CPU_MIN_CORES) url += `&minCores=${minCores}`;
      if (maxCores < CPU_MAX_CORES) url += `&maxCores=${maxCores}`;
      if (maxTDP < CPU_MAX_TDP) url += `&maxTDP=${maxTDP}`;
      if (sockets.length > 0) url += `&sockets=${encodeURIComponent(sockets.join(','))}`;
    }
    
    if (decodedCategory === 'GPU') {
      if (minVram > GPU_MIN_VRAM) url += `&minVram=${minVram}`;
      if (maxVram < GPU_MAX_VRAM) url += `&maxVram=${maxVram}`;
      if (minPsu > GPU_MIN_PSU) url += `&minPsu=${minPsu}`;
      if (maxPsu < GPU_MAX_PSU) url += `&maxPsu=${maxPsu}`;
      if (interfaces.length > 0) url += `&interfaces=${encodeURIComponent(interfaces.join(','))}`;
      if (chipsets.length > 0) url += `&chipsets=${encodeURIComponent(chipsets.join(','))}`;
      if (maxLength < GPU_MAX_LENGTH) url += `&maxLength=${maxLength}`;
    }

    if (decodedCategory === 'Motherboard') {
      if (sockets.length > 0) url += `&sockets=${encodeURIComponent(sockets.join(','))}`;
      if (formFactors.length > 0) url += `&formFactor=${encodeURIComponent(formFactors.join(','))}`;
      if (memoryTypes.length > 0) url += `&memoryType=${encodeURIComponent(memoryTypes.join(','))}`;
      if (minMemorySlots > 0) url += `&minMemorySlots=${minMemorySlots}`;
      if (maxMemorySlots < 16) url += `&maxMemorySlots=${maxMemorySlots}`;
      if (minMaxMemory > 0) url += `&minMaxMemory=${minMaxMemory}`;
      if (chipsets.length > 0) url += `&chipsets=${encodeURIComponent(chipsets.join(','))}`;
    }
    
    if (decodedCategory === 'RAM') {
      if (memoryTypes.length > 0) url += `&memoryType=${encodeURIComponent(memoryTypes.join(','))}`;
      if (capacities.length > 0) url += `&capacities=${encodeURIComponent(capacities.join(','))}`;
      if (modules.length > 0) url += `&modules=${encodeURIComponent(modules.join(','))}`;
      if (minRamSpeed > RAM_MIN_SPEED) url += `&minRamSpeed=${minRamSpeed}`;
      if (maxRamSpeed < RAM_MAX_SPEED) url += `&maxRamSpeed=${maxRamSpeed}`;
      if (maxCasLatency < RAM_MAX_CAS) url += `&maxCasLatency=${maxCasLatency}`;
    }

    if (decodedCategory === 'Storage') {
      if (storageInterfaces.length > 0) url += `&storageInterfaces=${encodeURIComponent(storageInterfaces.join(','))}`;
      if (storageCapacities.length > 0) url += `&storageCapacities=${encodeURIComponent(storageCapacities.join(','))}`;
      if (minReadSpeed > STORAGE_MIN_READ_SPEED) url += `&minReadSpeed=${minReadSpeed}`;
      if (maxReadSpeed < STORAGE_MAX_READ_SPEED) url += `&maxReadSpeed=${maxReadSpeed}`;
      if (storageTypes.length > 0) url += `&storageTypes=${encodeURIComponent(storageTypes.join(','))}`;
      if (storageFormFactors.length > 0) url += `&storageFormFactors=${encodeURIComponent(storageFormFactors.join(','))}`;
    }

    if (decodedCategory === 'Power Supply') {
      if (minWattage > PSU_MIN_WATTAGE) url += `&minWattage=${minWattage}`;
      if (maxWattage < PSU_MAX_WATTAGE) url += `&maxWattage=${maxWattage}`;
      if (psuEfficiencies.length > 0) url += `&psuEfficiencies=${encodeURIComponent(psuEfficiencies.join(','))}`;
      if (psuModularities.length > 0) url += `&psuModularities=${encodeURIComponent(psuModularities.join(','))}`;
      if (psuFormFactors.length > 0) url += `&psuFormFactors=${encodeURIComponent(psuFormFactors.join(','))}`;
    }

    if (decodedCategory === 'Case') {
      if (caseFormFactors.length > 0) url += `&caseFormFactors=${encodeURIComponent(caseFormFactors.join(','))}`;
      if (caseMaxMainboards.length > 0) url += `&caseMaxMainboards=${encodeURIComponent(caseMaxMainboards.join(','))}`;
      if (caseColors.length > 0) url += `&caseColors=${encodeURIComponent(caseColors.join(','))}`;
      if (caseSidePanels.length > 0) url += `&caseSidePanels=${encodeURIComponent(caseSidePanels.join(','))}`;
    }

    if (decodedCategory === 'CPU Cooler') {
      if (coolerTypes.length > 0) url += `&coolerTypes=${encodeURIComponent(coolerTypes.join(','))}`;
      if (coolerRadiatorSizes.length > 0) url += `&coolerRadiatorSizes=${encodeURIComponent(coolerRadiatorSizes.join(','))}`;
      if (coolerColors.length > 0) url += `&coolerColors=${encodeURIComponent(coolerColors.join(','))}`;
      if (minCoolerNoise > MIN_COOLER_NOISE) url += `&minCoolerNoise=${minCoolerNoise}`;
      if (maxCoolerNoise < MAX_COOLER_NOISE) url += `&maxCoolerNoise=${maxCoolerNoise}`;
      if (minCoolerHeight > MIN_COOLER_HEIGHT) url += `&minCoolerHeight=${minCoolerHeight}`;
      if (maxCoolerHeight < MAX_COOLER_HEIGHT) url += `&maxCoolerHeight=${maxCoolerHeight}`;
      // Note: socket compatibility is handled via the existing 'sockets' state variable
    }
    
    try {
      const res = await fetch(url);
      const data = await res.json();
      setProducts(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [query, brands, sort, decodedCategory, minSpeed, maxSpeed, minCores, maxCores, maxTDP, sockets, minVram, maxVram, minPsu, maxPsu, interfaces, chipsets, maxLength, formFactors, memoryTypes, minMemorySlots, maxMemorySlots, minMaxMemory, minRamSpeed, maxRamSpeed, maxCasLatency, capacities, modules, storageInterfaces, storageCapacities, minReadSpeed, maxReadSpeed, storageTypes, storageFormFactors, minWattage, maxWattage, psuEfficiencies, psuModularities, psuFormFactors, caseFormFactors, caseMaxMainboards, caseColors, caseSidePanels, coolerTypes, coolerRadiatorSizes, coolerColors, minCoolerNoise, maxCoolerNoise, minCoolerHeight, maxCoolerHeight]);

  useEffect(() => {
    // debounce search
    const timer = setTimeout(() => {
      fetchProducts();
    }, 300);
    return () => clearTimeout(timer);
  }, [fetchProducts]);

  return (
    <div className="flex flex-col gap-6 w-full min-w-0 animate-in fade-in duration-500">
      

      <div className="flex flex-col lg:flex-row gap-8 w-full min-w-0 relative">
        
        {/* Mobile Filter Overlays and Triggers */}
        <div className="lg:hidden">
          {/* Overlay */}
          <div 
            className={`fixed inset-0 bg-black/60 z-40 backdrop-blur-sm transition-opacity duration-300 ${showFilters ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
            onClick={() => setShowFilters(false)}
          />

          {/* Floating Left Tab Button */}
          <button 
            onClick={() => setShowFilters(true)}
            className={`fixed left-0 top-1/2 -translate-y-1/2 z-[100] flex items-center justify-center bg-brand-500 hover:bg-brand-400 rounded-r-xl shadow-xl transition-all h-24 overflow-hidden group ${showFilters ? '-translate-x-full' : 'translate-x-0 w-10 hover:w-14'}`}
            title="Open Filters"
          >
            <div className="flex flex-col items-center justify-center gap-2 group-hover:scale-110 transition-transform">
              <Filter className="w-5 h-5 text-dark-bg" />
            </div>
          </button>
        </div>

        {/* Sidebar filters */}
        <aside className={`w-[85vw] sm:w-[360px] lg:w-64 shrink-0 flex flex-col gap-6 min-w-0 fixed lg:static top-0 bottom-0 left-0 z-50 lg:z-auto transition-transform duration-300 ease-in-out bg-dark-bg/95 lg:bg-transparent border-r lg:border-none border-dark-border overflow-y-auto lg:overflow-visible ${showFilters ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} `}>
          <div className="glass flex-1 shrink-0 flex flex-col p-6 pb-20 lg:pb-6 lg:shadow-xl relative border-none lg:border-solid border-dark-border">
            
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold tracking-tight">Filters</h2>
              
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => { 
                    setBrands([]); 
                    setQuery(''); 
                    setMinSpeed(CPU_MIN_SPEED);
                    setMaxSpeed(CPU_MAX_SPEED);
                    setMinCores(CPU_MIN_CORES);
                    setMaxCores(CPU_MAX_CORES);
                    setMaxTDP(CPU_MAX_TDP);
                    setSockets([]);
                    
                    setMinVram(GPU_MIN_VRAM);
                    setMaxVram(GPU_MAX_VRAM);
                    setMinPsu(GPU_MIN_PSU);
                    setMaxPsu(GPU_MAX_PSU);
                    setInterfaces([]);
                    setChipsets([]);
                    setMaxLength(GPU_MAX_LENGTH);

                    setFormFactors([]);
                    setMemoryTypes([]);
                    setMinMemorySlots(0);
                    setMaxMemorySlots(16);
                    setMinMaxMemory(0);

                    setMinRamSpeed(RAM_MIN_SPEED);
                    setMaxRamSpeed(RAM_MAX_SPEED);
                    setMaxCasLatency(RAM_MAX_CAS);
                    setCapacities([]);
                    setModules([]);

                    setStorageInterfaces([]);
                    setStorageCapacities([]);
                    setMinReadSpeed(STORAGE_MIN_READ_SPEED);
                    setMaxReadSpeed(STORAGE_MAX_READ_SPEED);
                    setStorageTypes([]);
                    setStorageFormFactors([]);
                    setMinWattage(PSU_MIN_WATTAGE);
                    setMaxWattage(PSU_MAX_WATTAGE);
                    setPsuEfficiencies([]);
                    setPsuModularities([]);
                    setPsuFormFactors([]);
                    setCaseFormFactors([]);
                    setCaseMaxMainboards([]);
                    setCaseColors([]);
                    setCaseSidePanels([]);
                    setCoolerTypes([]);
                    setCoolerRadiatorSizes([]);
                    setCoolerColors([]);
                    setMinCoolerNoise(MIN_COOLER_NOISE);
                    setMaxCoolerNoise(MAX_COOLER_NOISE);
                    setMinCoolerHeight(MIN_COOLER_HEIGHT);
                    setMaxCoolerHeight(MAX_COOLER_HEIGHT);
                  }}
                  className="text-sm font-medium text-gray-400 hover:text-brand-500 transition-colors py-1 px-2 rounded hover:bg-brand-500/10"
                  title="Clear All Filters"
                >
                  Clear filters
                </button>

                {/* Mobile Close Button */}
                <button 
                  onClick={() => setShowFilters(false)}
                  className="lg:hidden flex items-center justify-center w-8 h-8 bg-brand-500 hover:bg-brand-400 text-dark-bg rounded transition-colors shadow-lg"
                  title="Close Filters"
                >
                  <div className="relative w-4 h-4">
                    <div className="absolute top-1/2 left-0 w-full h-[2px] bg-current -translate-y-1/2 rotate-45 rounded-full" />
                    <div className="absolute top-1/2 left-0 w-full h-[2px] bg-current -translate-y-1/2 -rotate-45 rounded-full" />
                  </div>
                </button>
              </div>
            </div>

            <div className="space-y-6">
              
              {/* GPU Chipset (Top Level) */}
              {decodedCategory === 'GPU' && (
                <div>
                  <div className="flex items-center mb-3">
                    <h3 className="text-sm font-semibold text-brand-500 uppercase tracking-wider">Chipset</h3>
                    <FilterTooltip text="The core graphics processor designer (e.g., NVIDIA, AMD)." />
                  </div>
                  <div className="space-y-2 mb-6">
                    {GPU_CHIPSETS.map((c) => {
                      const isChecked = chipsets.includes(c);
                      const toggle = () => {
                         setChipsets(prev => isChecked ? prev.filter(x => x !== c) : [...prev, c]);
                      };
                      return (
                      <label key={c} className="flex items-center gap-3 cursor-pointer group select-none">
                        <input 
                          type="checkbox" 
                          checked={isChecked}
                          onChange={toggle}
                          className="hidden"
                        />
                        <div className={`w-4 h-4 border flex items-center justify-center transition-all ${isChecked ? 'bg-brand-500 border-brand-500' : 'border-gray-500 group-hover:border-brand-400'}`}>
                          {isChecked && <Check className="w-3 h-3 text-white" />}
                        </div>
                        <span className={`text-sm transition-colors ${isChecked ? 'text-white font-medium' : 'text-gray-400 group-hover:text-gray-200'}`}>
                          {c}
                        </span>
                      </label>
                    )})}
                  </div>
                </div>
              )}

              {/* Brands */}
            <div className="flex flex-col gap-8 transition-all duration-300">
              {/* Brands */}
              <div>
                <div className="flex items-center mb-4">
                  <h3 className="text-sm font-semibold text-brand-500 uppercase tracking-wider">Brand</h3>
                <FilterTooltip text="The manufacturer of the component." />
              </div>
              <div className="space-y-2">
                {(CATEGORY_BRAND_MAP[decodedCategory] || [])
                  .filter(b => {
                    if (decodedCategory === 'GPU' && chipsets.length > 0) {
                       const isNvidiaOnly = chipsets.includes('NVIDIA') && chipsets.length === 1;
                       const isAmdOnly = chipsets.includes('AMD') && chipsets.length === 1;
                       const isIntelOnly = chipsets.includes('Intel') && chipsets.length === 1;

                       if (isNvidiaOnly && ['Sapphire', 'XFX', 'ASRock', 'AMD'].includes(b)) return false;
                       if (isAmdOnly && ['NVIDIA'].includes(b)) return false; 
                       if (isIntelOnly && ['NVIDIA', 'AMD', 'Sapphire', 'XFX', 'ASUS', 'MSI', 'Gigabyte'].includes(b)) return false;
                    }
                    return true;
                  })
                  .map((b, index, filteredArray) => {
                  const isChecked = brands.includes(b);
                  const toggle = (e: React.ChangeEvent<HTMLInputElement>, currentCheckedValue: boolean) => {
                    if ((e.nativeEvent as MouseEvent).shiftKey && lastClickedBrand !== null) {
                      const start = Math.min(lastClickedBrand, index);
                      const end = Math.max(lastClickedBrand, index);
                      const range = filteredArray.slice(start, end + 1);
                      if (currentCheckedValue) {
                        setBrands(prev => prev.filter(c => !range.includes(c)));
                      } else {
                        setBrands(prev => Array.from(new Set([...prev, ...range])));
                      }
                    } else {
                       setBrands(prev => currentCheckedValue ? prev.filter(c => c !== b) : [...prev, b]);
                    }
                    setLastClickedBrand(index);
                  };
                  return (
                  <label key={b} className="flex items-center gap-3 cursor-pointer group select-none">
                    <input 
                      type="checkbox" 
                      checked={isChecked}
                      onChange={(e) => toggle(e, isChecked)}
                      className="hidden"
                    />
                    <div className={`w-4 h-4 border flex items-center justify-center transition-all ${isChecked ? 'bg-brand-500 border-brand-500' : 'border-gray-500 group-hover:border-brand-400'}`}>
                      {isChecked && <Check className="w-3 h-3 text-white" />}
                    </div>
                    <span className={`text-sm transition-colors ${isChecked ? 'text-white font-medium' : 'text-gray-400 group-hover:text-gray-200'}`}>
                      {b}
                    </span>
                  </label>
                )})}
              </div>
              </div>
            </div>
            
            {/* CPU Deep Filters */}
            {decodedCategory === 'CPU' && (
              <div className="pt-6 border-t border-dark-border">
                <div className="flex items-center mb-3">
                  <h3 className="text-sm font-semibold text-brand-500 uppercase tracking-wider">Socket Type</h3>
                  <FilterTooltip text="The physical connection mechanism on the motherboard. The CPU and Motherboard sockets must match exactly." />
                </div>
                <div className="space-y-2">
                  {CPU_SOCKETS.map((s) => {
                    const isChecked = sockets.includes(s);
                    const isFilterIncompatible = incompatibleFilters.sockets?.includes(s) ?? false;
                    const toggle = () => {
                       setSockets(prev => isChecked ? prev.filter(x => x !== s) : [...prev, s]);
                    };
                    return (
                    <label key={s} className={`flex items-center gap-3 cursor-pointer group select-none px-1.5 -ml-1.5 rounded transition-colors ${isFilterIncompatible ? 'border border-red-500/50 bg-red-950/30' : 'border border-transparent'}`}>
                      <input 
                        type="checkbox" 
                        checked={isChecked}
                        onChange={toggle}
                        className="hidden"
                      />
                      <div className={`w-4 h-4 border flex items-center justify-center transition-all ${isChecked ? 'bg-brand-500 border-brand-500' : 'border-gray-500 group-hover:border-brand-400'}`}>
                        {isChecked && <Check className="w-3 h-3 text-white" />}
                      </div>
                      <span className={`text-sm transition-colors ${isChecked ? 'text-white font-medium' : 'text-gray-400 group-hover:text-gray-200'}`}>
                        {s}
                      </span>
                    </label>
                  )})}
                </div>

                <div className="flex items-center mb-3 mt-8">
                  <h3 className="text-sm font-semibold text-brand-500 uppercase tracking-wider">Speed (GHz)</h3>
                  <FilterTooltip text="The operating frequency of the CPU. Higher means faster processing, but generates more heat." />
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 bg-dark-bg px-2 py-1 border border-dark-border">
                      <input 
                        type="number" 
                        value={minSpeed} 
                        onChange={e => setMinSpeed(Math.min(maxSpeed, Math.max(CPU_MIN_SPEED, parseFloat(e.target.value) || CPU_MIN_SPEED)))} 
                        className="w-8 bg-transparent text-white text-xs text-center focus:outline-none appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:m-0 [&::-webkit-outer-spin-button]:m-0"
                      />
                      <span className="text-xs text-gray-500">GHz</span>
                    </div>
                    <span className="text-gray-500">-</span>
                    <div className="flex items-center gap-2 bg-dark-bg px-2 py-1 border border-dark-border">
                      <input 
                        type="number" 
                        value={maxSpeed} 
                        onChange={e => setMaxSpeed(Math.max(minSpeed, Math.min(CPU_MAX_SPEED, parseFloat(e.target.value) || CPU_MAX_SPEED)))} 
                        className="w-8 bg-transparent text-white text-xs text-center focus:outline-none appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:m-0 [&::-webkit-outer-spin-button]:m-0"
                      />
                      <span className="text-xs text-gray-500">GHz</span>
                    </div>
                  </div>

                  <div className="relative h-1 bg-dark-bg mt-6 border-y border-dark-border flex items-center">
                    <div 
                      className="absolute h-full bg-brand-500"
                      style={{ 
                        left: `${((minSpeed - CPU_MIN_SPEED) / (CPU_MAX_SPEED - CPU_MIN_SPEED)) * 100}%`, 
                        right: `${100 - ((maxSpeed - CPU_MIN_SPEED) / (CPU_MAX_SPEED - CPU_MIN_SPEED)) * 100}%` 
                      }}
                    />
                    <input 
                      type="range" min={CPU_MIN_SPEED} max={CPU_MAX_SPEED} step="0.1" 
                      value={minSpeed} 
                      onChange={e => {
                         const val = parseFloat(e.target.value);
                         if (val <= maxSpeed) setMinSpeed(val);
                      }}
                      className="absolute w-full appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-brand-500"
                    />
                    <input 
                      type="range" min={CPU_MIN_SPEED} max={CPU_MAX_SPEED} step="0.1" 
                      value={maxSpeed} 
                      onChange={e => {
                         const val = parseFloat(e.target.value);
                         if (val >= minSpeed) setMaxSpeed(val);
                      }}
                      className="absolute w-full appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-brand-500"
                    />
                  </div>
                </div>
                
                <div className="flex items-center mb-3 mt-8">
                  <h3 className="text-sm font-semibold text-brand-500 uppercase tracking-wider">Cores</h3>
                  <FilterTooltip text="The number of independent processing units. More cores help with multitasking and heavy workloads like video editing." />
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 bg-dark-bg px-2 py-1 border border-dark-border">
                      <input 
                        type="number" 
                        value={minCores} 
                        onChange={e => setMinCores(Math.min(maxCores, Math.max(CPU_MIN_CORES, parseInt(e.target.value) || CPU_MIN_CORES)))} 
                        className="w-8 bg-transparent text-white text-xs text-center focus:outline-none appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:m-0 [&::-webkit-outer-spin-button]:m-0"
                      />
                      <span className="text-xs text-gray-500">Cs</span>
                    </div>
                    <span className="text-gray-500">-</span>
                    <div className="flex items-center gap-2 bg-dark-bg px-2 py-1 border border-dark-border">
                      <input 
                        type="number" 
                        value={maxCores} 
                        onChange={e => setMaxCores(Math.max(minCores, Math.min(CPU_MAX_CORES, parseInt(e.target.value) || CPU_MAX_CORES)))} 
                        className="w-8 bg-transparent text-white text-xs text-center focus:outline-none appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:m-0 [&::-webkit-outer-spin-button]:m-0"
                      />
                      <span className="text-xs text-gray-500">Cs</span>
                    </div>
                  </div>

                  <div className="relative h-1 bg-dark-bg mt-6 border-y border-dark-border flex items-center">
                    <div 
                      className="absolute h-full bg-brand-500"
                      style={{ 
                        left: `${((minCores - CPU_MIN_CORES) / (CPU_MAX_CORES - CPU_MIN_CORES)) * 100}%`, 
                        right: `${100 - ((maxCores - CPU_MIN_CORES) / (CPU_MAX_CORES - CPU_MIN_CORES)) * 100}%` 
                      }}
                    />
                    <input 
                      type="range" min={CPU_MIN_CORES} max={CPU_MAX_CORES} step="2" 
                      value={minCores} 
                      onChange={e => {
                         const val = parseInt(e.target.value);
                         if (val <= maxCores) setMinCores(val);
                      }}
                      className="absolute w-full appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-brand-500"
                    />
                    <input 
                      type="range" min={CPU_MIN_CORES} max={CPU_MAX_CORES} step="2" 
                      value={maxCores} 
                      onChange={e => {
                         const val = parseInt(e.target.value);
                         if (val >= minCores) setMaxCores(val);
                      }}
                      className="absolute w-full appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-brand-500"
                    />
                  </div>
                </div>
                
                <div className="flex items-center mb-3 mt-8">
                  <h3 className="text-sm font-semibold text-brand-500 uppercase tracking-wider">Max Power (TDP)</h3>
                  <FilterTooltip text="Thermal Design Power. The maximum heat generated by the CPU that the cooling system needs to dissipate." />
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 bg-dark-bg px-2 py-1 border border-dark-border">
                      <input 
                        type="number" 
                        value={maxTDP} 
                        onChange={e => setMaxTDP(Math.max(65, Math.min(CPU_MAX_TDP, parseInt(e.target.value) || CPU_MAX_TDP)))} 
                        min={65} max={CPU_MAX_TDP} step="5"
                        className="w-8 bg-transparent text-white text-xs text-center focus:outline-none appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:m-0 [&::-webkit-outer-spin-button]:m-0"
                      />
                      <span className="text-xs text-gray-500">W</span>
                    </div>
                  </div>
                  <div className="relative h-1 bg-dark-bg mt-6 border-y border-dark-border flex items-center">
                    <div 
                      className="absolute h-full bg-brand-500"
                      style={{ left: 0, right: `${100 - ((maxTDP - 65) / (CPU_MAX_TDP - 65)) * 100}%` }}
                    />
                    <input 
                      type="range" min={65} max={CPU_MAX_TDP} step="5" 
                      value={maxTDP} 
                      onChange={e => setMaxTDP(parseInt(e.target.value))}
                      className="absolute w-full appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-brand-500"
                    />
                  </div>
                </div>

              </div>
            )}

            {/* Motherboard Deep Filters */}
            {decodedCategory === 'Motherboard' && (
              <div className="pt-6 border-t border-dark-border">
                
                <div className="flex items-center mb-3">
                  <h3 className="text-sm font-semibold text-brand-500 uppercase tracking-wider">Socket</h3>
                  <FilterTooltip text="The physical connection mechanism on the motherboard. The CPU and Motherboard sockets must match exactly." />
                </div>
                <div className="space-y-2">
                  {MOTHERBOARD_SOCKETS.map((s) => {
                    const isChecked = sockets.includes(s);
                    const isFilterIncompatible = incompatibleFilters.sockets?.includes(s) ?? false;
                    const toggle = () => {
                       setSockets(prev => isChecked ? prev.filter(x => x !== s) : [...prev, s]);
                    };
                    return (
                    <label key={s} className={`flex items-center gap-3 cursor-pointer group select-none px-1.5 -ml-1.5 rounded transition-colors ${isFilterIncompatible ? 'border border-red-500/50 bg-red-950/30' : 'border border-transparent'}`}>
                      <input 
                        type="checkbox" 
                        checked={isChecked}
                        onChange={toggle}
                        className="hidden"
                      />
                      <div className={`w-4 h-4 border flex items-center justify-center transition-all ${isChecked ? 'bg-brand-500 border-brand-500' : 'border-gray-500 group-hover:border-brand-400'}`}>
                        {isChecked && <Check className="w-3 h-3 text-white" />}
                      </div>
                      <span className={`text-sm transition-colors ${isChecked ? 'text-white font-medium' : 'text-gray-400 group-hover:text-gray-200'}`}>
                        {s}
                      </span>
                    </label>
                  )})}
                </div>

                <div className="flex items-center mb-3 mt-8">
                  <h3 className="text-sm font-semibold text-brand-500 uppercase tracking-wider">Chipset</h3>
                  <FilterTooltip text="The core logic center of the motherboard. This determines features like PCIe lanes, USB ports, and overclocking support." />
                </div>
                <div className="space-y-2">
                  {MOTHERBOARD_CHIPSETS.map((c) => {
                    const isChecked = chipsets.includes(c);
                    const toggle = () => {
                       setChipsets(prev => isChecked ? prev.filter(x => x !== c) : [...prev, c]);
                    };
                    return (
                    <label key={c} className="flex items-center gap-3 cursor-pointer group select-none">
                      <input 
                        type="checkbox" 
                        checked={isChecked}
                        onChange={toggle}
                        className="hidden"
                      />
                      <div className={`w-4 h-4 border flex items-center justify-center transition-all ${isChecked ? 'bg-brand-500 border-brand-500' : 'border-gray-500 group-hover:border-brand-400'}`}>
                        {isChecked && <Check className="w-3 h-3 text-white" />}
                      </div>
                      <span className={`text-sm transition-colors ${isChecked ? 'text-white font-medium' : 'text-gray-400 group-hover:text-gray-200'}`}>
                        {c}
                      </span>
                    </label>
                  )})}
                </div>

                <div className="flex items-center mb-3 mt-8">
                  <h3 className="text-sm font-semibold text-brand-500 uppercase tracking-wider">Form Factor</h3>
                  <FilterTooltip text="The physical size of the motherboard. Must fit inside your chosen PC case (e.g., ATX is standard, ITX is small)." />
                </div>
                <div className="space-y-2">
                  {MOTHERBOARD_FORM_FACTORS.map((f) => {
                    const isChecked = formFactors.includes(f);
                    const isFilterIncompatible = incompatibleFilters.formFactors?.includes(f) ?? false;
                    const toggle = () => {
                       setFormFactors(prev => isChecked ? prev.filter(x => x !== f) : [...prev, f]);
                    };
                    return (
                    <label key={f} className={`flex items-center gap-3 cursor-pointer group select-none px-1.5 -ml-1.5 rounded transition-colors ${isFilterIncompatible ? 'border border-red-500/50 bg-red-950/30' : 'border border-transparent'}`}>
                      <input 
                        type="checkbox" 
                        checked={isChecked}
                        onChange={toggle}
                        className="hidden"
                      />
                      <div className={`w-4 h-4 border flex items-center justify-center transition-all ${isChecked ? 'bg-brand-500 border-brand-500' : 'border-gray-500 group-hover:border-brand-400'}`}>
                        {isChecked && <Check className="w-3 h-3 text-white" />}
                      </div>
                      <span className={`text-sm transition-colors ${isChecked ? 'text-white font-medium' : 'text-gray-400 group-hover:text-gray-200'}`}>
                        {f}
                      </span>
                    </label>
                  )})}
                </div>

                <div className="flex items-center mb-3 mt-8">
                  <h3 className="text-sm font-semibold text-brand-500 uppercase tracking-wider">Memory Type</h3>
                  <FilterTooltip text="The generation of RAM supported (e.g., DDR4 or DDR5). RAM and Motherboard must use the same type." />
                </div>
                <div className="space-y-2">
                  {MOTHERBOARD_MEMORY_TYPES.map((t) => {
                    const isChecked = memoryTypes.includes(t);
                    const isFilterIncompatible = incompatibleFilters.memoryTypes?.includes(t) ?? false;
                    const toggle = () => {
                       setMemoryTypes(prev => isChecked ? prev.filter(x => x !== t) : [...prev, t]);
                    };
                    return (
                    <label key={t} className={`flex items-center gap-3 cursor-pointer group select-none px-1.5 -ml-1.5 rounded transition-colors ${isFilterIncompatible ? 'border border-red-500/50 bg-red-950/30' : 'border border-transparent'}`}>
                      <input 
                        type="checkbox" 
                        checked={isChecked}
                        onChange={toggle}
                        className="hidden"
                      />
                      <div className={`w-4 h-4 border flex items-center justify-center transition-all ${isChecked ? 'bg-brand-500 border-brand-500' : 'border-gray-500 group-hover:border-brand-400'}`}>
                        {isChecked && <Check className="w-3 h-3 text-white" />}
                      </div>
                      <span className={`text-sm transition-colors ${isChecked ? 'text-white font-medium' : 'text-gray-400 group-hover:text-gray-200'}`}>
                        {t}
                      </span>
                    </label>
                  )})}
                </div>

                <div className="flex items-center mb-3 mt-8">
                  <h3 className="text-sm font-semibold text-brand-500 uppercase tracking-wider">Min Capacity (GB)</h3>
                  <FilterTooltip text="The maximum total RAM capacity supported by the motherboard." />
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 bg-dark-bg px-2 py-1 border border-dark-border">
                      <input 
                        type="number" 
                        value={minMaxMemory} 
                        onChange={e => setMinMaxMemory(Math.max(0, parseInt(e.target.value) || 0))} 
                        className="w-10 bg-transparent text-white text-xs text-center focus:outline-none appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:m-0 [&::-webkit-outer-spin-button]:m-0"
                      />
                      <span className="text-xs text-gray-500">GB</span>
                    </div>
                  </div>
                  <div className="relative h-1 bg-dark-bg mt-6 border-y border-dark-border flex items-center">
                    <div 
                      className="absolute h-full bg-brand-500"
                      style={{ left: `${(minMaxMemory / 256) * 100}%`, right: 0 }}
                    />
                    <input 
                      type="range" min={0} max={256} step="32" 
                      value={minMaxMemory} 
                      onChange={e => setMinMaxMemory(parseInt(e.target.value))}
                      className="absolute w-full appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-brand-500"
                    />
                  </div>
                </div>

              </div>
            )}

            {/* GPU Deep Filters */}
            {decodedCategory === 'GPU' && (
              <div className="pt-6 border-t border-dark-border">
                
                <div className="flex items-center mb-3">
                  <h3 className="text-sm font-semibold text-brand-500 uppercase tracking-wider">Interface</h3>
                  <FilterTooltip text="The PCIe connection standard used to connect the GPU to the motherboard. Check your motherboard for compatibility (e.g., PCIe 4.0)." />
                </div>
                <div className="space-y-2">
                  {GPU_INTERFACES.map((i) => {
                    const isChecked = interfaces.includes(i);
                    const toggle = () => {
                       setInterfaces(prev => isChecked ? prev.filter(x => x !== i) : [...prev, i]);
                    };
                    return (
                    <label key={i} className="flex items-center gap-3 cursor-pointer group select-none">
                      <input 
                        type="checkbox" 
                        checked={isChecked}
                        onChange={toggle}
                        className="hidden"
                      />
                      <div className={`w-4 h-4 border flex items-center justify-center transition-all ${isChecked ? 'bg-brand-500 border-brand-500' : 'border-gray-500 group-hover:border-brand-400'}`}>
                        {isChecked && <Check className="w-3 h-3 text-white" />}
                      </div>
                      <span className={`text-sm transition-colors ${isChecked ? 'text-white font-medium' : 'text-gray-400 group-hover:text-gray-200'}`}>
                        {i}
                      </span>
                    </label>
                  )})}
                </div>

                <div className="flex items-center mb-3 mt-8">
                  <h3 className="text-sm font-semibold text-brand-500 uppercase tracking-wider">VRAM Capacity (GB)</h3>
                  <FilterTooltip text="Video RAM. Dedicated memory for the graphics card. Higher VRAM allows for higher resolutions and better texture quality in games." />
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 bg-dark-bg px-2 py-1 border border-dark-border">
                      <input 
                        type="number" 
                        value={minVram} 
                        onChange={e => setMinVram(Math.min(maxVram, Math.max(GPU_MIN_VRAM, parseInt(e.target.value) || GPU_MIN_VRAM)))} 
                        className="w-10 bg-transparent text-white text-xs text-center focus:outline-none appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:m-0 [&::-webkit-outer-spin-button]:m-0"
                      />
                      <span className="text-xs text-gray-500">GB</span>
                    </div>
                    <span className="text-gray-500">-</span>
                    <div className="flex items-center gap-2 bg-dark-bg px-2 py-1 border border-dark-border">
                      <input 
                        type="number" 
                        value={maxVram} 
                        onChange={e => setMaxVram(Math.max(minVram, Math.min(GPU_MAX_VRAM, parseInt(e.target.value) || GPU_MAX_VRAM)))} 
                        className="w-10 bg-transparent text-white text-xs text-center focus:outline-none appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:m-0 [&::-webkit-outer-spin-button]:m-0"
                      />
                      <span className="text-xs text-gray-500">GB</span>
                    </div>
                  </div>

                  <div className="relative h-1 bg-dark-bg mt-6 border-y border-dark-border flex items-center">
                    <div 
                      className="absolute h-full bg-brand-500"
                      style={{ 
                        left: `${((minVram - GPU_MIN_VRAM) / (GPU_MAX_VRAM - GPU_MIN_VRAM)) * 100}%`, 
                        right: `${100 - ((maxVram - GPU_MIN_VRAM) / (GPU_MAX_VRAM - GPU_MIN_VRAM)) * 100}%` 
                      }}
                    />
                    <input 
                      type="range" min={GPU_MIN_VRAM} max={GPU_MAX_VRAM} step="4" 
                      value={minVram} 
                      onChange={e => {
                         const val = parseInt(e.target.value);
                         if (val <= maxVram) setMinVram(val);
                      }}
                      className="absolute w-full appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-brand-500"
                    />
                    <input 
                      type="range" min={GPU_MIN_VRAM} max={GPU_MAX_VRAM} step="4" 
                      value={maxVram} 
                      onChange={e => {
                         const val = parseInt(e.target.value);
                         if (val >= minVram) setMaxVram(val);
                      }}
                      className="absolute w-full appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-brand-500"
                    />
                  </div>
                </div>
                
                <div className="flex items-center mb-3 mt-8">
                  <h3 className="text-sm font-semibold text-brand-500 uppercase tracking-wider">Recommended PSU (W)</h3>
                  <FilterTooltip text="The minimum power supply wattage recommended by the manufacturer to safely run this graphics card." />
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 bg-dark-bg px-2 py-1 border border-dark-border">
                      <input 
                        type="number" 
                        value={minPsu} 
                        onChange={e => setMinPsu(Math.min(maxPsu, Math.max(GPU_MIN_PSU, parseInt(e.target.value) || GPU_MIN_PSU)))} 
                        min={GPU_MIN_PSU} max={GPU_MAX_PSU} step="50"
                        className="w-10 bg-transparent text-white text-xs text-center focus:outline-none appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:m-0 [&::-webkit-outer-spin-button]:m-0"
                      />
                      <span className="text-xs text-gray-500">W</span>
                    </div>
                    <span className="text-gray-500">-</span>
                    <div className="flex items-center gap-2 bg-dark-bg px-2 py-1 border border-dark-border">
                      <input 
                        type="number" 
                        value={maxPsu} 
                        onChange={e => setMaxPsu(Math.max(minPsu, Math.min(GPU_MAX_PSU, parseInt(e.target.value) || GPU_MAX_PSU)))} 
                        min={GPU_MIN_PSU} max={GPU_MAX_PSU} step="50"
                        className="w-10 bg-transparent text-white text-xs text-center focus:outline-none appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:m-0 [&::-webkit-outer-spin-button]:m-0"
                      />
                      <span className="text-xs text-gray-500">W</span>
                    </div>
                  </div>

                  <div className="relative h-1 bg-dark-bg mt-6 border-y border-dark-border flex items-center">
                    <div 
                      className="absolute h-full bg-brand-500"
                      style={{ 
                        left: `${((minPsu - GPU_MIN_PSU) / (GPU_MAX_PSU - GPU_MIN_PSU)) * 100}%`, 
                        right: `${100 - ((maxPsu - GPU_MIN_PSU) / (GPU_MAX_PSU - GPU_MIN_PSU)) * 100}%` 
                      }}
                    />
                    <input 
                      type="range" min={GPU_MIN_PSU} max={GPU_MAX_PSU} step="50" 
                      value={minPsu} 
                      onChange={e => {
                         const val = parseInt(e.target.value);
                         if (val <= maxPsu) setMinPsu(val);
                      }}
                      className="absolute w-full appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-brand-500"
                    />
                    <input 
                      type="range" min={GPU_MIN_PSU} max={GPU_MAX_PSU} step="50" 
                      value={maxPsu} 
                      onChange={e => {
                         const val = parseInt(e.target.value);
                         if (val >= minPsu) setMaxPsu(val);
                      }}
                      className="absolute w-full appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-brand-500"
                    />
                  </div>
                </div>

                <div className="flex items-center mb-3 mt-8">
                  <h3 className="text-sm font-semibold text-brand-500 uppercase tracking-wider">Max Length (mm)</h3>
                  <FilterTooltip text="The physical length of the graphics card. Ensure your PC case has enough clearance." />
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-2 bg-dark-bg px-2 py-1 border border-dark-border w-fit">
                    <input 
                      type="number" 
                      value={maxLength} 
                      onChange={e => setMaxLength(Math.min(GPU_MAX_LENGTH, Math.max(100, parseInt(e.target.value) || GPU_MAX_LENGTH)))} 
                      min={100} max={GPU_MAX_LENGTH} step="5"
                      className="w-10 bg-transparent text-white text-xs text-center focus:outline-none appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:m-0 [&::-webkit-outer-spin-button]:m-0"
                    />
                    <span className="text-xs text-gray-500">mm</span>
                  </div>
                  <div className="relative h-1 bg-dark-bg mt-6 border-y border-dark-border flex items-center">
                    <div 
                      className="absolute h-full bg-brand-500"
                      style={{ left: 0, right: `${100 - ((maxLength - 100) / (GPU_MAX_LENGTH - 100)) * 100}%` }}
                    />
                    <input 
                      type="range" min={100} max={GPU_MAX_LENGTH} step="5" 
                      value={maxLength} 
                      onChange={e => setMaxLength(parseInt(e.target.value))}
                      className="absolute w-full appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-brand-500"
                    />
                  </div>
                </div>

              </div>
            )}

            {/* RAM Deep Filters */}
            {decodedCategory === 'RAM' && (
              <div className="pt-6 border-t border-dark-border">
                
                <div className="flex items-center mb-3">
                  <h3 className="text-sm font-semibold text-brand-500 uppercase tracking-wider">Memory Type</h3>
                  <FilterTooltip text="The generation of RAM supported (e.g., DDR4 or DDR5). Must match your motherboard's supported type." />
                </div>
                <div className="space-y-2">
                  {MOTHERBOARD_MEMORY_TYPES.map((t) => {
                    const isChecked = memoryTypes.includes(t);
                    const isFilterIncompatible = incompatibleFilters.memoryTypes?.includes(t) ?? false;
                    const toggle = () => {
                       setMemoryTypes(prev => isChecked ? prev.filter(x => x !== t) : [...prev, t]);
                    };
                    return (
                    <label key={t} className={`flex items-center gap-3 cursor-pointer group select-none px-1.5 -ml-1.5 rounded transition-colors ${isFilterIncompatible ? 'border border-red-500/50 bg-red-950/30' : 'border border-transparent'}`}>
                      <input type="checkbox" checked={isChecked} onChange={toggle} className="hidden" />
                      <div className={`w-4 h-4 border flex items-center justify-center transition-all ${isChecked ? 'bg-brand-500 border-brand-500' : 'border-gray-500 group-hover:border-brand-400'}`}>
                        {isChecked && <Check className="w-3 h-3 text-white" />}
                      </div>
                      <span className={`text-sm transition-colors ${isChecked ? 'text-white font-medium' : 'text-gray-400 group-hover:text-gray-200'}`}>
                        {t}
                      </span>
                    </label>
                  )})}
                </div>

                <div className="flex items-center mb-3 mt-8">
                  <h3 className="text-sm font-semibold text-brand-500 uppercase tracking-wider">Capacity (GB)</h3>
                  <FilterTooltip text="The total amount of memory in the kit. 16GB is standard for gaming, 32GB+ for heavy multitasking." />
                </div>
                <div className="space-y-2">
                  {RAM_CAPACITIES.map((c) => {
                    const isChecked = capacities.includes(c);
                    const toggle = () => {
                       setCapacities(prev => isChecked ? prev.filter(x => x !== c) : [...prev, c]);
                    };
                    return (
                    <label key={c} className="flex items-center gap-3 cursor-pointer group select-none">
                      <input type="checkbox" checked={isChecked} onChange={toggle} className="hidden" />
                      <div className={`w-4 h-4 border flex items-center justify-center transition-all ${isChecked ? 'bg-brand-500 border-brand-500' : 'border-gray-500 group-hover:border-brand-400'}`}>
                        {isChecked && <Check className="w-3 h-3 text-white" />}
                      </div>
                      <span className={`text-sm transition-colors ${isChecked ? 'text-white font-medium' : 'text-gray-400 group-hover:text-gray-200'}`}>
                        {c}GB
                      </span>
                    </label>
                  )})}
                </div>

                <div className="flex items-center mb-3 mt-8">
                  <h3 className="text-sm font-semibold text-brand-500 uppercase tracking-wider">Speed (GHz)</h3>
                  <FilterTooltip text="The data transfer rate of the memory. Higher speeds improve performance, but check your motherboard's maximum supported speed." />
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 bg-dark-bg px-2 py-1 border border-dark-border">
                      <input 
                        type="number" 
                        value={(minRamSpeed / 1000).toFixed(1)} 
                        onChange={e => setMinRamSpeed(Math.min(maxRamSpeed, Math.max(RAM_MIN_SPEED, (parseFloat(e.target.value) || (RAM_MIN_SPEED / 1000)) * 1000)))} 
                        min={RAM_MIN_SPEED / 1000} max={RAM_MAX_SPEED / 1000} step="0.1"
                        className="w-8 bg-transparent text-white text-xs text-center focus:outline-none appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:m-0 [&::-webkit-outer-spin-button]:m-0"
                      />
                      <span className="text-xs text-gray-500">GHz</span>
                    </div>
                    <span className="text-gray-500">-</span>
                    <div className="flex items-center gap-2 bg-dark-bg px-2 py-1 border border-dark-border">
                      <input 
                        type="number" 
                        value={(maxRamSpeed / 1000).toFixed(1)} 
                        onChange={e => setMaxRamSpeed(Math.max(minRamSpeed, Math.min(RAM_MAX_SPEED, (parseFloat(e.target.value) || (RAM_MAX_SPEED / 1000)) * 1000)))} 
                        min={RAM_MIN_SPEED / 1000} max={RAM_MAX_SPEED / 1000} step="0.1"
                        className="w-8 bg-transparent text-white text-xs text-center focus:outline-none appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:m-0 [&::-webkit-outer-spin-button]:m-0"
                      />
                      <span className="text-xs text-gray-500">GHz</span>
                    </div>
                  </div>

                  <div className="relative h-1 bg-dark-bg mt-6 border-y border-dark-border flex items-center">
                    <div 
                      className="absolute h-full bg-brand-500"
                      style={{ 
                        left: `${((minRamSpeed - RAM_MIN_SPEED) / (RAM_MAX_SPEED - RAM_MIN_SPEED)) * 100}%`, 
                        right: `${100 - ((maxRamSpeed - RAM_MIN_SPEED) / (RAM_MAX_SPEED - RAM_MIN_SPEED)) * 100}%` 
                      }}
                    />
                    <input 
                      type="range" min={RAM_MIN_SPEED} max={RAM_MAX_SPEED} step="100" 
                      value={minRamSpeed} 
                      onChange={e => {
                         const val = parseInt(e.target.value);
                         if (val <= maxRamSpeed) setMinRamSpeed(val);
                      }}
                      className="absolute w-full appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-brand-500"
                    />
                    <input 
                      type="range" min={RAM_MIN_SPEED} max={RAM_MAX_SPEED} step="100" 
                      value={maxRamSpeed} 
                      onChange={e => {
                         const val = parseInt(e.target.value);
                         if (val >= minRamSpeed) setMaxRamSpeed(val);
                      }}
                      className="absolute w-full appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-brand-500"
                    />
                  </div>
                </div>

                <div className="flex items-center mb-3 mt-8">
                  <h3 className="text-sm font-semibold text-brand-500 uppercase tracking-wider">Max CAS Latency (CL)</h3>
                  <FilterTooltip text="The delay time for the RAM to respond. Lower is generally better and more responsive." />
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-2 bg-dark-bg px-2 py-1 border border-dark-border w-fit">
                    <span className="text-xs text-gray-500 mr-1">CL</span>
                    <input 
                      type="number" 
                      value={maxCasLatency} 
                      onChange={e => setMaxCasLatency(Math.min(RAM_MAX_CAS, Math.max(10, parseInt(e.target.value) || RAM_MAX_CAS)))} 
                      min={10} max={RAM_MAX_CAS} step="1"
                      className="w-8 bg-transparent text-white text-xs text-center focus:outline-none appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:m-0 [&::-webkit-outer-spin-button]:m-0"
                    />
                  </div>
                  <div className="relative h-1 bg-dark-bg mt-6 border-y border-dark-border flex items-center">
                    <div 
                      className="absolute h-full bg-brand-500"
                      style={{ left: 0, right: `${100 - ((maxCasLatency - 10) / (RAM_MAX_CAS - 10)) * 100}%` }}
                    />
                    <input 
                      type="range" min={10} max={RAM_MAX_CAS} step="1" 
                      value={maxCasLatency} 
                      onChange={e => setMaxCasLatency(parseInt(e.target.value))}
                      className="absolute w-full appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-brand-500"
                    />
                  </div>
                </div>

                <div className="flex items-center mb-3 mt-8">
                  <h3 className="text-sm font-semibold text-brand-500 uppercase tracking-wider">Modules</h3>
                  <FilterTooltip text="The configuration of the memory kit (e.g., 2 sticks of 16GB). 2 sticks is optimal for most motherboards." />
                </div>
                <div className="space-y-2">
                  {RAM_MODULES.map((m) => {
                    const isChecked = modules.includes(m);
                    const toggle = () => {
                       setModules(prev => isChecked ? prev.filter(x => x !== m) : [...prev, m]);
                    };
                    return (
                    <label key={m} className="flex items-center gap-3 cursor-pointer group select-none">
                      <input type="checkbox" checked={isChecked} onChange={toggle} className="hidden" />
                      <div className={`w-4 h-4 border flex items-center justify-center transition-all ${isChecked ? 'bg-brand-500 border-brand-500' : 'border-gray-500 group-hover:border-brand-400'}`}>
                        {isChecked && <Check className="w-3 h-3 text-white" />}
                      </div>
                      <span className={`text-sm transition-colors ${isChecked ? 'text-white font-medium' : 'text-gray-400 group-hover:text-gray-200'}`}>
                        {m}
                      </span>
                    </label>
                  )})}
                </div>

              </div>
            )}

            {/* Storage Deep Filters */}
            {decodedCategory === 'Storage' && (
              <div className="pt-6 border-t border-dark-border">
                
                <div className="flex items-center mb-3">
                  <h3 className="text-sm font-semibold text-brand-500 uppercase tracking-wider">Drive Type</h3>
                  <FilterTooltip text="HDD (Hard Disk Drive) offers cheap mass storage. SSD (Solid State Drive) is significantly faster but more expensive per GB." />
                </div>
                <div className="space-y-2 mb-8">
                  {STORAGE_TYPES.map((t) => {
                    const isChecked = storageTypes.includes(t);
                    const toggle = () => {
                       setStorageTypes(prev => isChecked ? prev.filter(x => x !== t) : [...prev, t]);
                    };
                    return (
                    <label key={t} className="flex items-center gap-3 cursor-pointer group select-none">
                      <input type="checkbox" checked={isChecked} onChange={toggle} className="hidden" />
                      <div className={`w-4 h-4 border flex items-center justify-center transition-all ${isChecked ? 'bg-brand-500 border-brand-500' : 'border-gray-500 group-hover:border-brand-400'}`}>
                        {isChecked && <Check className="w-3 h-3 text-white" />}
                      </div>
                      <span className={`text-sm transition-colors ${isChecked ? 'text-white font-medium' : 'text-gray-400 group-hover:text-gray-200'}`}>
                        {t}
                      </span>
                    </label>
                  )})}
                </div>

                <div className="flex items-center mb-3">
                  <h3 className="text-sm font-semibold text-brand-500 uppercase tracking-wider">Capacity (GB)</h3>
                  <FilterTooltip text="The total storage space available on the drive. 1000GB (1TB) or 2000GB (2TB) is typical for modern OS drives." />
                </div>
                <div className="space-y-2 mb-8">
                  {STORAGE_CAPACITIES.map((c) => {
                    const isChecked = storageCapacities.includes(c);
                    const toggle = () => {
                       setStorageCapacities(prev => isChecked ? prev.filter(x => x !== c) : [...prev, c]);
                    };
                    return (
                    <label key={c} className="flex items-center gap-3 cursor-pointer group select-none">
                      <input type="checkbox" checked={isChecked} onChange={toggle} className="hidden" />
                      <div className={`w-4 h-4 border flex items-center justify-center transition-all ${isChecked ? 'bg-brand-500 border-brand-500' : 'border-gray-500 group-hover:border-brand-400'}`}>
                        {isChecked && <Check className="w-3 h-3 text-white" />}
                      </div>
                      <span className={`text-sm transition-colors ${isChecked ? 'text-white font-medium' : 'text-gray-400 group-hover:text-gray-200'}`}>
                        {c >= 1000 ? `${c / 1000}TB` : `${c}GB`}
                      </span>
                    </label>
                  )})}
                </div>

                <div className="flex items-center mb-3">
                  <h3 className="text-sm font-semibold text-brand-500 uppercase tracking-wider">Form Factor</h3>
                  <FilterTooltip text="M.2 2280 is for modern NVMe SSDs, 2.5-inch for SATA SSDs, and 3.5-inch for standard HDDs." />
                </div>
                <div className="space-y-2 mb-8">
                  {STORAGE_FORM_FACTORS.map((f) => {
                    const isChecked = storageFormFactors.includes(f);
                    const toggle = () => {
                       setStorageFormFactors(prev => isChecked ? prev.filter(x => x !== f) : [...prev, f]);
                    };
                    return (
                    <label key={f} className="flex items-center gap-3 cursor-pointer group select-none">
                      <input type="checkbox" checked={isChecked} onChange={toggle} className="hidden" />
                      <div className={`w-4 h-4 border flex items-center justify-center transition-all ${isChecked ? 'bg-brand-500 border-brand-500' : 'border-gray-500 group-hover:border-brand-400'}`}>
                        {isChecked && <Check className="w-3 h-3 text-white" />}
                      </div>
                      <span className={`text-sm transition-colors ${isChecked ? 'text-white font-medium' : 'text-gray-400 group-hover:text-gray-200'}`}>
                        {f}
                      </span>
                    </label>
                  )})}
                </div>

                <div className="flex items-center mb-3">
                  <h3 className="text-sm font-semibold text-brand-500 uppercase tracking-wider">Interface</h3>
                  <FilterTooltip text="The connection standard used by the drive. PCIe 5.0 is the newest and fastest, but your motherboard must support it to get full speeds." />
                </div>
                <div className="space-y-2 mb-8">
                  {STORAGE_INTERFACES.map((t) => {
                    const isChecked = storageInterfaces.includes(t);
                    const toggle = () => {
                       setStorageInterfaces(prev => isChecked ? prev.filter(x => x !== t) : [...prev, t]);
                    };
                    return (
                    <label key={t} className="flex items-center gap-3 cursor-pointer group select-none">
                      <input type="checkbox" checked={isChecked} onChange={toggle} className="hidden" />
                      <div className={`w-4 h-4 border flex items-center justify-center transition-all ${isChecked ? 'bg-brand-500 border-brand-500' : 'border-gray-500 group-hover:border-brand-400'}`}>
                        {isChecked && <Check className="w-3 h-3 text-white" />}
                      </div>
                      <span className={`text-sm transition-colors ${isChecked ? 'text-white font-medium' : 'text-gray-400 group-hover:text-gray-200'}`}>
                        {t}
                      </span>
                    </label>
                  )})}
                </div>

                <div className="flex items-center mb-3">
                  <h3 className="text-sm font-semibold text-brand-500 uppercase tracking-wider">Read Speed (MB/s)</h3>
                  <FilterTooltip text="Sequential read speed of the drive. Higher means faster game loading times and faster large file transfers." />
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center bg-dark-bg px-2 py-1 border border-dark-border">
                      <input 
                        type="number" 
                        value={minReadSpeed} 
                        onChange={e => setMinReadSpeed(Math.min(maxReadSpeed, Math.max(STORAGE_MIN_READ_SPEED, parseInt(e.target.value) || STORAGE_MIN_READ_SPEED)))} 
                        min={STORAGE_MIN_READ_SPEED} max={STORAGE_MAX_READ_SPEED} step="100"
                        className="w-12 bg-transparent text-white text-xs text-center focus:outline-none appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:m-0 [&::-webkit-outer-spin-button]:m-0"
                      />
                    </div>
                    <span className="text-gray-500">-</span>
                    <div className="flex items-center bg-dark-bg px-2 py-1 border border-dark-border">
                      <input 
                        type="number" 
                        value={maxReadSpeed} 
                        onChange={e => setMaxReadSpeed(Math.max(minReadSpeed, Math.min(STORAGE_MAX_READ_SPEED, parseInt(e.target.value) || STORAGE_MAX_READ_SPEED)))} 
                        min={STORAGE_MIN_READ_SPEED} max={STORAGE_MAX_READ_SPEED} step="100"
                        className="w-12 bg-transparent text-white text-xs text-center focus:outline-none appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:m-0 [&::-webkit-outer-spin-button]:m-0"
                      />
                    </div>
                  </div>

                  <div className="relative h-1 bg-dark-bg mt-6 border-y border-dark-border flex items-center">
                    <div 
                      className="absolute h-full bg-brand-500"
                      style={{ 
                        left: `${((minReadSpeed - STORAGE_MIN_READ_SPEED) / (STORAGE_MAX_READ_SPEED - STORAGE_MIN_READ_SPEED)) * 100}%`, 
                        right: `${100 - ((maxReadSpeed - STORAGE_MIN_READ_SPEED) / (STORAGE_MAX_READ_SPEED - STORAGE_MIN_READ_SPEED)) * 100}%` 
                      }}
                    />
                    <input 
                      type="range" min={STORAGE_MIN_READ_SPEED} max={STORAGE_MAX_READ_SPEED} step="100" 
                      value={minReadSpeed} 
                      onChange={e => {
                         const val = parseInt(e.target.value);
                         if (val <= maxReadSpeed) setMinReadSpeed(val);
                      }}
                      className="absolute w-full appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-brand-500"
                    />
                    <input 
                      type="range" min={STORAGE_MIN_READ_SPEED} max={STORAGE_MAX_READ_SPEED} step="100" 
                      value={maxReadSpeed} 
                      onChange={e => {
                         const val = parseInt(e.target.value);
                         if (val >= minReadSpeed) setMaxReadSpeed(val);
                      }}
                      className="absolute w-full appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-brand-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Power Supply Deep Filters */}
            {decodedCategory === 'Power Supply' && (
              <div className="pt-6 border-t border-dark-border">
                
                <div className="flex items-center mb-3">
                  <h3 className="text-sm font-semibold text-brand-500 uppercase tracking-wider">Wattage (W)</h3>
                  <FilterTooltip text="Total power output. Ensure your PSU has enough wattage to support all your components, especially the GPU." />
                </div>
                <div className="space-y-4 mb-8">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center bg-dark-bg px-2 py-1 border border-dark-border">
                      <input 
                        type="number" 
                        value={minWattage} 
                        onChange={e => setMinWattage(Math.min(maxWattage, Math.max(PSU_MIN_WATTAGE, parseInt(e.target.value) || PSU_MIN_WATTAGE)))} 
                        min={PSU_MIN_WATTAGE} max={PSU_MAX_WATTAGE} step="50"
                        className="w-12 bg-transparent text-white text-xs text-center focus:outline-none appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:m-0 [&::-webkit-outer-spin-button]:m-0"
                      />
                    </div>
                    <span className="text-gray-500">-</span>
                    <div className="flex items-center bg-dark-bg px-2 py-1 border border-dark-border">
                      <input 
                        type="number" 
                        value={maxWattage} 
                        onChange={e => setMaxWattage(Math.max(minWattage, Math.min(PSU_MAX_WATTAGE, parseInt(e.target.value) || PSU_MAX_WATTAGE)))} 
                        min={PSU_MIN_WATTAGE} max={PSU_MAX_WATTAGE} step="50"
                        className="w-12 bg-transparent text-white text-xs text-center focus:outline-none appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:m-0 [&::-webkit-outer-spin-button]:m-0"
                      />
                    </div>
                  </div>

                  <div className="relative h-1 bg-dark-bg mt-6 border-y border-dark-border flex items-center">
                    <div 
                      className="absolute h-full bg-brand-500"
                      style={{ 
                        left: `${((minWattage - PSU_MIN_WATTAGE) / (PSU_MAX_WATTAGE - PSU_MIN_WATTAGE)) * 100}%`, 
                        right: `${100 - ((maxWattage - PSU_MIN_WATTAGE) / (PSU_MAX_WATTAGE - PSU_MIN_WATTAGE)) * 100}%` 
                      }}
                    />
                    <input 
                      type="range" min={PSU_MIN_WATTAGE} max={PSU_MAX_WATTAGE} step="50" 
                      value={minWattage} 
                      onChange={e => {
                         const val = parseInt(e.target.value);
                         if (val <= maxWattage) setMinWattage(val);
                      }}
                      className="absolute w-full appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-brand-500"
                    />
                    <input 
                      type="range" min={PSU_MIN_WATTAGE} max={PSU_MAX_WATTAGE} step="50" 
                      value={maxWattage} 
                      onChange={e => {
                         const val = parseInt(e.target.value);
                         if (val >= minWattage) setMaxWattage(val);
                      }}
                      className="absolute w-full appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-brand-500"
                    />
                  </div>
                </div>

                <div className="flex items-center mb-3">
                  <h3 className="text-sm font-semibold text-brand-500 uppercase tracking-wider">Efficiency Rating</h3>
                  <FilterTooltip text="Higher efficiency means less power wasted as heat. 80+ Gold or better is recommended for most builds." />
                </div>
                <div className="space-y-2 mb-8">
                  {PSU_EFFICIENCIES.map((e) => {
                    const isChecked = psuEfficiencies.includes(e);
                    const toggle = () => {
                       setPsuEfficiencies(prev => isChecked ? prev.filter(x => x !== e) : [...prev, e]);
                    };
                    return (
                    <label key={e} className="flex items-center gap-3 cursor-pointer group select-none">
                      <input type="checkbox" checked={isChecked} onChange={toggle} className="hidden" />
                      <div className={`w-4 h-4 border flex items-center justify-center transition-all ${isChecked ? 'bg-brand-500 border-brand-500' : 'border-gray-500 group-hover:border-brand-400'}`}>
                        {isChecked && <Check className="w-3 h-3 text-white" />}
                      </div>
                      <span className={`text-sm transition-colors ${isChecked ? 'text-white font-medium' : 'text-gray-400 group-hover:text-gray-200'}`}>
                        {e}
                      </span>
                    </label>
                  )})}
                </div>

                <div className="flex items-center mb-3">
                  <h3 className="text-sm font-semibold text-brand-500 uppercase tracking-wider">Modularity</h3>
                  <FilterTooltip text="Full-modular allows removing all cables. Semi-modular has essential cables attached. Non-modular has all cables attached permanently." />
                </div>
                <div className="space-y-2 mb-8">
                  {PSU_MODULARITIES.map((m) => {
                    const isChecked = psuModularities.includes(m);
                    const toggle = () => {
                       setPsuModularities(prev => isChecked ? prev.filter(x => x !== m) : [...prev, m]);
                    };
                    return (
                    <label key={m} className="flex items-center gap-3 cursor-pointer group select-none">
                      <input type="checkbox" checked={isChecked} onChange={toggle} className="hidden" />
                      <div className={`w-4 h-4 border flex items-center justify-center transition-all ${isChecked ? 'bg-brand-500 border-brand-500' : 'border-gray-500 group-hover:border-brand-400'}`}>
                        {isChecked && <Check className="w-3 h-3 text-white" />}
                      </div>
                      <span className={`text-sm transition-colors ${isChecked ? 'text-white font-medium' : 'text-gray-400 group-hover:text-gray-200'}`}>
                        {m}
                      </span>
                    </label>
                  )})}
                </div>

                <div className="flex items-center mb-3">
                  <h3 className="text-sm font-semibold text-brand-500 uppercase tracking-wider">Form Factor</h3>
                  <FilterTooltip text="ATX is the standard size. SFX and SFX-L are smaller sizes for compact mini-ITX builds." />
                </div>
                <div className="space-y-2">
                  {PSU_FORM_FACTORS.map((f) => {
                    const isChecked = psuFormFactors.includes(f);
                    const toggle = () => {
                       setPsuFormFactors(prev => isChecked ? prev.filter(x => x !== f) : [...prev, f]);
                    };
                    return (
                    <label key={f} className="flex items-center gap-3 cursor-pointer group select-none">
                      <input type="checkbox" checked={isChecked} onChange={toggle} className="hidden" />
                      <div className={`w-4 h-4 border flex items-center justify-center transition-all ${isChecked ? 'bg-brand-500 border-brand-500' : 'border-gray-500 group-hover:border-brand-400'}`}>
                        {isChecked && <Check className="w-3 h-3 text-white" />}
                      </div>
                      <span className={`text-sm transition-colors ${isChecked ? 'text-white font-medium' : 'text-gray-400 group-hover:text-gray-200'}`}>
                        {f}
                      </span>
                    </label>
                  )})}
                </div>

              </div>
            )}

            {/* CPU Cooler Deep Filters */}
            {decodedCategory === 'CPU Cooler' && (
              <div className="pt-6 border-t border-dark-border">
                
                <div className="flex items-center mb-3">
                  <h3 className="text-sm font-semibold text-brand-500 uppercase tracking-wider">Cooler Type</h3>
                  <FilterTooltip text="Air coolers use metal heatsinks and fans. Liquid coolers (AIOs) use pumps and radiators for heat dissipation." />
                </div>
                <div className="space-y-2 mb-8">
                  {COOLER_TYPES.map((t) => {
                    const isChecked = coolerTypes.includes(t);
                    const toggle = () => {
                       setCoolerTypes(prev => isChecked ? prev.filter(x => x !== t) : [...prev, t]);
                    };
                    return (
                    <label key={t} className="flex items-center gap-3 cursor-pointer group select-none">
                      <input type="checkbox" checked={isChecked} onChange={toggle} className="hidden" />
                      <div className={`w-4 h-4 border flex items-center justify-center transition-all ${isChecked ? 'bg-brand-500 border-brand-500' : 'border-gray-500 group-hover:border-brand-400'}`}>
                        {isChecked && <Check className="w-3 h-3 text-white" />}
                      </div>
                      <span className={`text-sm transition-colors ${isChecked ? 'text-white font-medium' : 'text-gray-400 group-hover:text-gray-200'}`}>
                        {t}
                      </span>
                    </label>
                  )})}
                </div>

                <div className="flex items-center mb-3">
                  <h3 className="text-sm font-semibold text-brand-500 uppercase tracking-wider">Supported Sockets</h3>
                  <FilterTooltip text="The CPU socket this cooler can be mounted on (e.g. AM5 for AMD, LGA1700 for Intel)." />
                </div>
                <div className="space-y-2 mb-8">
                  {MOTHERBOARD_SOCKETS.map((s) => {
                    const isChecked = sockets.includes(s);
                    const isFilterIncompatible = incompatibleFilters.sockets?.includes(s) ?? false;
                    const toggle = () => {
                       setSockets(prev => isChecked ? prev.filter(x => x !== s) : [...prev, s]);
                    };
                    return (
                    <label key={s} className={`flex items-center gap-3 cursor-pointer group select-none px-1.5 -ml-1.5 rounded transition-colors ${isFilterIncompatible ? 'border border-red-500/50 bg-red-950/30' : 'border border-transparent'}`}>
                      <input type="checkbox" checked={isChecked} onChange={toggle} className="hidden" />
                      <div className={`w-4 h-4 border flex items-center justify-center transition-all ${isChecked ? 'bg-brand-500 border-brand-500' : 'border-gray-500 group-hover:border-brand-400'}`}>
                        {isChecked && <Check className="w-3 h-3 text-white" />}
                      </div>
                      <span className={`text-sm transition-colors ${isChecked ? 'text-white font-medium' : 'text-gray-400 group-hover:text-gray-200'}`}>
                        {s}
                      </span>
                    </label>
                  )})}
                </div>

                {/* Only show Radiator Sizes if we haven't filtered to exclusively Air coolers */}
                {(!coolerTypes.includes('Air') || coolerTypes.includes('Liquid') || coolerTypes.length === 0) && (
                  <>
                    <div className="flex items-center mb-3">
                      <h3 className="text-sm font-semibold text-brand-500 uppercase tracking-wider">Radiator Size (mm)</h3>
                      <FilterTooltip text="For liquid coolers. Larger radiators (240mm+) generally dissipate more heat but take up more case space." />
                    </div>
                    <div className="space-y-2 mb-8">
                      {COOLER_RADIATOR_SIZES.map((r) => {
                        const isChecked = coolerRadiatorSizes.includes(r);
                        const toggle = () => {
                           setCoolerRadiatorSizes(prev => isChecked ? prev.filter(x => x !== r) : [...prev, r]);
                        };
                        return (
                        <label key={r} className="flex items-center gap-3 cursor-pointer group select-none">
                          <input type="checkbox" checked={isChecked} onChange={toggle} className="hidden" />
                          <div className={`w-4 h-4 border flex items-center justify-center transition-all ${isChecked ? 'bg-brand-500 border-brand-500' : 'border-gray-500 group-hover:border-brand-400'}`}>
                            {isChecked && <Check className="w-3 h-3 text-white" />}
                          </div>
                          <span className={`text-sm transition-colors ${isChecked ? 'text-white font-medium' : 'text-gray-400 group-hover:text-gray-200'}`}>
                            {r}mm
                          </span>
                        </label>
                      )})}
                    </div>
                  </>
                )}

                {/* Only show Cooler Height if we haven't filtered to exclusively Liquid coolers */}
                {(!coolerTypes.includes('Liquid') || coolerTypes.includes('Air') || coolerTypes.length === 0) && (
                  <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-semibold text-brand-500 uppercase tracking-wider">Cooler Height</h3>
                      <FilterTooltip text="For air coolers. Make sure your PC case has enough clearance for the cooler height." />
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-full">
                        <div className="flex items-center gap-2">
                          <input 
                            type="number" 
                            min={MIN_COOLER_HEIGHT} 
                            max={maxCoolerHeight} 
                            value={minCoolerHeight}
                            onChange={(e) => setMinCoolerHeight(Number(e.target.value))}
                            className="w-full bg-dark-bg border border-dark-border text-white text-sm px-2 py-1 rounded focus:border-brand-500 outline-none"
                          />
                          <span className="text-gray-500">-</span>
                          <input 
                            type="number" 
                            min={minCoolerHeight} 
                            max={MAX_COOLER_HEIGHT} 
                            value={maxCoolerHeight}
                            onChange={(e) => setMaxCoolerHeight(Number(e.target.value))}
                            className="w-full bg-dark-bg border border-dark-border text-white text-sm px-2 py-1 rounded focus:border-brand-500 outline-none"
                          />
                        </div>
                        <div className="flex justify-between text-xs text-gray-500 mt-2">
                          <span>{MIN_COOLER_HEIGHT}mm</span>
                          <span>{MAX_COOLER_HEIGHT}mm</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="mb-8">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold text-brand-500 uppercase tracking-wider">Noise Level</h3>
                    <FilterTooltip text="The noise level of the cooler at maximum RPM. Lower is quieter." />
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-full">
                      <div className="flex items-center gap-2">
                        <input 
                          type="number" 
                          min={MIN_COOLER_NOISE} 
                          max={maxCoolerNoise} 
                          value={minCoolerNoise}
                          onChange={(e) => setMinCoolerNoise(Number(e.target.value))}
                          className="w-full bg-dark-bg border border-dark-border text-white text-sm px-2 py-1 rounded focus:border-brand-500 outline-none"
                        />
                        <span className="text-gray-500">-</span>
                        <input 
                          type="number" 
                          min={minCoolerNoise} 
                          max={MAX_COOLER_NOISE} 
                          value={maxCoolerNoise}
                          onChange={(e) => setMaxCoolerNoise(Number(e.target.value))}
                          className="w-full bg-dark-bg border border-dark-border text-white text-sm px-2 py-1 rounded focus:border-brand-500 outline-none"
                        />
                      </div>
                      <div className="flex justify-between text-xs text-gray-500 mt-2">
                        <span>{MIN_COOLER_NOISE} dBA</span>
                        <span>{MAX_COOLER_NOISE} dBA</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center mb-3">
                  <h3 className="text-sm font-semibold text-brand-500 uppercase tracking-wider">Color</h3>
                  <FilterTooltip text="The primary color of the cooling block and fans." />
                </div>
                <div className="space-y-2 mb-8">
                  {COOLER_COLORS.map((c) => {
                    const isChecked = coolerColors.includes(c);
                    const toggle = () => {
                       setCoolerColors(prev => isChecked ? prev.filter(x => x !== c) : [...prev, c]);
                    };
                    return (
                    <label key={c} className="flex items-center gap-3 cursor-pointer group select-none">
                      <input type="checkbox" checked={isChecked} onChange={toggle} className="hidden" />
                      <div className={`w-4 h-4 border flex items-center justify-center transition-all ${isChecked ? 'bg-brand-500 border-brand-500' : 'border-gray-500 group-hover:border-brand-400'}`}>
                        {isChecked && <Check className="w-3 h-3 text-white" />}
                      </div>
                      <span className={`text-sm transition-colors ${isChecked ? 'text-white font-medium' : 'text-gray-400 group-hover:text-gray-200'}`}>
                        {c}
                      </span>
                    </label>
                  )})}
                </div>
              </div>
            )}
            </div>

          </div>
        </aside>

      {/* Main Grid */}
      <section className="flex-1 min-w-0 flex flex-col gap-6">
        
        {/* Toolbar */}
        <div className="relative flex flex-col sm:flex-row justify-between items-center gap-4 mb-2 w-full z-20">
           
           {/* Left Group (Moved Breadcrumb) */}
           <div className="flex items-center self-start sm:self-center">
             <Link 
               href="/catalog" 
               className="flex items-center justify-center gap-2 h-11 px-4 text-sm font-medium text-gray-400 hover:text-white hover:bg-dark-bg/60 border border-transparent hover:border-dark-border/80 rounded-sm transition-all group"
             >
                <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> 
                <span className="hidden sm:inline">Back to Categories</span>
                <span className="sm:hidden">Categories</span>
             </Link>
           </div>

           {/* Right Group: Category, Search Toggle, and Sort */}
           <div className="flex flex-col sm:flex-row items-stretch sm:items-center w-full sm:w-auto gap-2">
             
             {/* Category Select */}
             <div className="relative group flex-1 sm:flex-none h-11 rounded-sm border border-dark-border/80 bg-dark-surface/40 hover:bg-dark-bg/60 transition-colors shadow-sm hover:border-brand-500/30">
               <select 
                 value={decodedCategory}
                 onChange={(e) => router.push(`/catalog/${e.target.value}`)}
                 className="w-full sm:w-auto h-full text-base sm:text-lg font-bold tracking-normal text-white bg-transparent appearance-none focus:outline-none cursor-pointer pl-4 pr-10 relative z-10"
               >
                 {Object.keys(CATEGORY_BRAND_MAP).map(cat => (
                   <option key={cat} value={cat} className="bg-dark-bg text-sm font-normal">
                     {cat}
                   </option>
                 ))}
               </select>
               <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-500 pointer-events-none group-hover:text-brand-400 transition-colors" />
             </div>

             {/* Search Toggle */}
             <div className="relative flex items-center justify-center sm:flex-none h-11 px-3 group rounded-sm border border-dark-border/80 bg-dark-surface/40 hover:bg-dark-bg/60 transition-colors shadow-sm hover:border-brand-500/30">
               <button
                 onClick={() => setShowSearch(!showSearch)}
                 className={`p-1.5 transition-colors rounded-sm ${showSearch ? 'text-brand-500 bg-dark-bg' : 'text-gray-400 group-hover:text-white'}`}
                 title="Search Catalog"
               >
                 <Search className="w-5 h-5" />
               </button>

               {/* Expandable Input Container */}
               <div 
                 className={`absolute right-0 sm:left-1/2 sm:-translate-x-1/2 top-full mt-3 w-[calc(100vw-2rem)] sm:w-72 origin-top sm:origin-top transition-all duration-300 ease-in-out z-50 ${
                   showSearch 
                     ? 'opacity-100 scale-100 pointer-events-auto' 
                     : 'opacity-0 scale-95 pointer-events-none'
                 }`}
               >
                 <input 
                    type="text"
                    placeholder="Search catalog..."
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    className="w-full bg-dark-bg/95 backdrop-blur shadow-2xl border border-dark-border text-white px-4 py-3 focus:outline-none focus:border-brand-500 transition-colors rounded-lg"
                 />
                 {/* Little triangle pointing up at the search icon on desktop */}
                 <div className="hidden sm:block absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-dark-bg/95 border-t border-l border-dark-border rotate-45" />
               </div>
             </div>
             
             {/* Sort Select */}
             <div className="relative group flex-1 sm:flex-none h-11 rounded-sm border border-dark-border/80 bg-dark-surface/40 hover:bg-dark-bg/60 transition-colors shadow-sm hover:border-brand-500/30">
               <select 
                 value={sort}
                 onChange={e => setSort(e.target.value)}
                 className="w-full h-full sm:w-auto appearance-none bg-transparent text-gray-200 text-sm pl-4 pr-10 focus:outline-none cursor-pointer"
               >
                  <option value="price_desc">Price: High to Low</option>
                  <option value="price_asc">Price: Low to High</option>
                  {decodedCategory === 'CPU' && (
                    <>
                      <option value="cores_desc">Cores: High to Low</option>
                      <option value="speed_desc">Speed: High to Low</option>
                      <option value="tdp_desc">Max Power: High to Low</option>
                    </>
                  )}
                  {decodedCategory === 'GPU' && (
                    <>
                      <option value="vram_desc">VRAM: High to Low</option>
                      <option value="psu_desc">Required PSU: High to Low</option>
                      <option value="length_asc">Length: Shortest First</option>
                      <option value="length_desc">Length: Longest First</option>
                    </>
                  )}
                  {decodedCategory === 'Motherboard' && (
                    <>
                      <option value="memory_slots_desc">Memory Slots: High to Low</option>
                      <option value="max_memory_desc">Max Memory: High to Low</option>
                    </>
                  )}
                  {decodedCategory === 'RAM' && (
                    <>
                      <option value="ram_speed_desc">Speed: High to Low</option>
                      <option value="ram_capacity_desc">Capacity: High to Low</option>
                      <option value="cas_latency_asc">CAS Latency: Low to High</option>
                    </>
                  )}
                  {(decodedCategory === 'Storage') && (
                    <>
                      <option value="storage_capacity_desc">Capacity: High to Low</option>
                      <option value="read_speed_desc">Read Speed: High to Low</option>
                    </>
                  )}
                  {decodedCategory === 'Power Supply' && (
                    <>
                      <option value="wattage_desc">Wattage: High to Low</option>
                    </>
                  )}
                  {decodedCategory === 'CPU Cooler' && (
                    <>
                      <option value="cooler_noise_asc">Min Noise: Low to High</option>
                      <option value="cooler_height_asc">Height: Shortest First</option>
                    </>
                  )}
               </select>
               <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none group-hover:text-gray-400 transition-colors" />
             </div>
           </div>
        </div>

        {/* Loading State or Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-6 w-full mb-8">
            {[1,2,3,4,5,6,7,8].map(i => (
              <div key={i} className="h-96 bg-dark-border/30 animate-pulse border border-dark-border/50" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-20 text-center glass">
            <Cpu className="w-16 h-16 text-gray-600 mb-4" />
            <h3 className="text-xl font-bold text-gray-300">No components found</h3>
            <p className="text-gray-500 mt-2">Try adjusting your filters or search query.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-6 w-full">
            {products.map(product => {
               const specs = JSON.parse(product.specsJson);
               const potentialIncompatibilities = mode === 'build' ? checkPotentialCompatibility(
                 buildParts.map(p => ({
                   id: p.id,
                   name: p.name,
                   brand: p.brand,
                   categoryId: p.category.name,
                   specsJson: p.specsJson
                 })) as SelectedProduct[],
                 {
                   id: product.id,
                   name: product.name,
                   brand: product.brand,
                   categoryId: product.category.name,
                   specsJson: product.specsJson
                 }
               ) : [];
               const isIncompatible = potentialIncompatibilities.length > 0;

               return (
                <div key={product.id} className={`group flex flex-col min-w-0 glass transition-all duration-300 relative ${isIncompatible ? 'border-red-500/50 hover:shadow-[0_0_30px_-5px_rgba(239,68,68,0.2)] hover:z-50' : 'hover:border-brand-500/50 hover:shadow-[0_0_30px_-5px_rgba(59,130,246,0.2)] hover:z-50'}`}>
                  
                  {isIncompatible && (
                    <div className="absolute top-3 right-3 z-50 group/warn">
                      <AlertTriangle className="w-6 h-6 text-red-500 cursor-help" />
                      <div className="absolute right-0 top-full mt-2 hidden group-hover/warn:block w-64 p-3 bg-dark-bg border border-red-500/50 text-xs text-red-200 shadow-2xl z-[100] rounded">
                        <ul className="list-disc pl-4 space-y-1">
                           {potentialIncompatibilities.map((w, i) => <li key={i}>{w}</li>)}
                        </ul>
                      </div>
                    </div>
                  )}

                  {/* Image specific background gradient based on category */}
                  <div className={`h-48 w-full p-6 flex items-center justify-center bg-gradient-to-b relative overflow-hidden ${isIncompatible ? 'from-red-950/40 to-dark-bg bg-red-950/20' : 'from-dark-surface to-dark-bg'}`}>
                    <div className="absolute inset-0 bg-brand-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    {product.categoryId && (
                      <Cpu className="w-24 h-24 text-gray-600/50 group-hover:scale-110 transition-transform duration-500 ease-out drop-shadow-2xl" />
                    )}
                  </div>
                  
                  <div className="p-4 sm:p-5 flex flex-col flex-1 min-w-0">
                    <div className="text-xs font-bold text-brand-500 uppercase tracking-widest mb-2 truncate">
                       {product.brand}
                    </div>
                    <h3 className="text-base sm:text-lg font-bold text-gray-100 leading-tight mb-2 group-hover:text-white transition-colors break-words line-clamp-3">
                      {product.name}
                    </h3>
                    
                    <div className="flex flex-wrap gap-2 mb-4 mt-auto">
                      {specs.socket && <span className="text-[10px] font-mono px-2 py-1 bg-dark-bg border border-dark-border text-gray-400">{specs.socket}</span>}
                      {specs.chipset && <span className="text-[10px] font-mono px-2 py-1 bg-dark-bg border border-dark-border text-gray-400">{specs.chipset}</span>}
                      {specs.formFactor && <span className="text-[10px] font-mono px-2 py-1 bg-dark-bg border border-dark-border text-gray-400">{specs.formFactor}</span>}
                      {specs.cores && <span className="text-[10px] font-mono px-2 py-1 bg-dark-bg border border-dark-border text-gray-400">{specs.cores} Cores</span>}
                      {specs.speedGhz && <span className="text-[10px] font-mono px-2 py-1 bg-dark-bg border border-dark-border text-gray-400">{specs.speedGhz} GHz</span>}
                      {specs.memory && specs.type === 'gpu' && <span className="text-[10px] font-mono px-2 py-1 bg-dark-bg border border-dark-border text-gray-400">{specs.memory} VRAM</span>}
                      {specs.interface && specs.type === 'gpu' && <span className="text-[10px] font-mono px-2 py-1 bg-dark-bg border border-dark-border text-gray-400">{specs.interface}</span>}
                      {specs.tdp && <span className="text-[10px] font-mono px-2 py-1 bg-dark-bg border border-dark-border text-gray-400">{specs.tdp}W TDP</span>}
                      {specs.recommendedPsu && <span className="text-[10px] font-mono px-2 py-1 bg-dark-bg border border-dark-border text-gray-400">{specs.recommendedPsu}W PSU</span>}
                      {specs.lengthMm && specs.type === 'gpu' && <span className="text-[10px] font-mono px-2 py-1 bg-dark-bg border border-dark-border text-gray-400">{specs.lengthMm}mm</span>}
                      {specs.memoryType && <span className="text-[10px] font-mono px-2 py-1 bg-dark-bg border border-dark-border text-gray-400">{specs.memoryType}</span>}
                      {specs.capacity && (specs.type === 'ram' || specs.type === 'primary_storage' || specs.type === 'storage' || specs.type === 'additional_storage') && <span className="text-[10px] font-mono px-2 py-1 bg-dark-bg border border-dark-border text-gray-400">{specs.capacity >= 1000 ? `${specs.capacity / 1000}TB` : `${specs.capacity}GB`}</span>}
                      {specs.speed && specs.type === 'ram' && <span className="text-[10px] font-mono px-2 py-1 bg-dark-bg border border-dark-border text-gray-400">{(specs.speed / 1000).toFixed(1)} GHz</span>}
                      {specs.casLatency && <span className="text-[10px] font-mono px-2 py-1 bg-dark-bg border border-dark-border text-gray-400">CL{specs.casLatency}</span>}
                      {specs.modules && <span className="text-[10px] font-mono px-2 py-1 bg-dark-bg border border-dark-border text-gray-400">{specs.modules}</span>}
                      {specs.memorySlots && <span className="text-[10px] font-mono px-2 py-1 bg-dark-bg border border-dark-border text-gray-400">{specs.memorySlots} DIMMs</span>}
                      {specs.maxMemory && specs.type === 'motherboard' && <span className="text-[10px] font-mono px-2 py-1 bg-dark-bg border border-dark-border text-gray-400">Up to {specs.maxMemory}GB</span>}
                      {specs.wattage && <span className="text-[10px] font-mono px-2 py-1 bg-dark-bg border border-dark-border text-gray-400">{specs.wattage}W</span>}
                      {specs.efficiency && specs.type === 'psu' && <span className="text-[10px] font-mono px-2 py-1 bg-dark-bg border border-dark-border text-gray-400">{specs.efficiency}</span>}
                      {specs.modular && specs.type === 'psu' && <span className="text-[10px] font-mono px-2 py-1 bg-dark-bg border border-dark-border text-gray-400">{typeof specs.modular === 'boolean' ? (specs.modular ? 'Fully Modular' : 'Non-Modular') : specs.modular + ' Modular'}</span>}
                      {specs.formFactor && specs.type === 'case' && <span className="text-[10px] font-mono px-2 py-1 bg-dark-bg border border-dark-border text-gray-400">{specs.formFactor}</span>}
                      {specs.maxMainboard && specs.type === 'case' && <span className="text-[10px] font-mono px-2 py-1 bg-dark-bg border border-dark-border text-gray-400">Up to {specs.maxMainboard}</span>}
                      {specs.color && specs.type === 'case' && (
                        <span className="text-[10px] font-mono px-2 py-1 bg-dark-bg border border-dark-border text-gray-400 flex items-center gap-1.5">
                          <span className={`w-2 h-2 rounded-full border border-gray-600 ${specs.color.toLowerCase() === 'white' ? 'bg-white' : 'bg-black'}`}></span>
                          {specs.color}
                        </span>
                      )}
                      {specs.sidePanel && specs.type === 'case' && <span className="text-[10px] font-mono px-2 py-1 bg-dark-bg border border-dark-border text-gray-400">{specs.sidePanel} Panel</span>}
                      {specs.coolerType && specs.type === 'cooler' && <span className="text-[10px] font-mono px-2 py-1 bg-dark-bg border border-dark-border text-gray-400">{specs.coolerType} Cooler</span>}
                      {specs.radiatorSize && specs.type === 'cooler' && <span className="text-[10px] font-mono px-2 py-1 bg-dark-bg border border-dark-border text-gray-400">{specs.radiatorSize}mm Radiator</span>}
                      {specs.height && specs.type === 'cooler' && <span className="text-[10px] font-mono px-2 py-1 bg-dark-bg border border-dark-border text-gray-400">{specs.height}mm Height</span>}
                      {specs.maxRPM && specs.type === 'cooler' && <span className="text-[10px] font-mono px-2 py-1 bg-dark-bg border border-dark-border text-gray-400">{specs.minRPM} - {specs.maxRPM} RPM</span>}
                      {specs.maxNoise && specs.type === 'cooler' && <span className="text-[10px] font-mono px-2 py-1 bg-dark-bg border border-dark-border text-gray-400">{specs.minNoise} - {specs.maxNoise} dBA</span>}
                      {specs.color && specs.type === 'cooler' && (
                        <span className="text-[10px] font-mono px-2 py-1 bg-dark-bg border border-dark-border text-gray-400 flex items-center gap-1.5">
                          <span className={`w-2 h-2 rounded-full border border-gray-600 ${specs.color.toLowerCase() === 'white' ? 'bg-white' : specs.color.toLowerCase() === 'black' ? 'bg-black' : 'bg-[#8b4513]'}`}></span>
                          {specs.color}
                        </span>
                      )}
                      {specs.interface && (specs.type === 'primary_storage' || specs.type === 'storage' || specs.type === 'additional_storage') && <span className="text-[10px] font-mono px-2 py-1 bg-dark-bg border border-dark-border text-gray-400">{specs.interface}</span>}
                      {specs.storageType && specs.type === 'additional_storage' && <span className="text-[10px] font-mono px-2 py-1 bg-dark-bg border border-dark-border text-brand-400 font-bold">{specs.storageType}</span>}
                      {specs.rpm && specs.type === 'additional_storage' && <span className="text-[10px] font-mono px-2 py-1 bg-dark-bg border border-dark-border text-gray-400">{specs.rpm} RPM</span>}
                      {specs.cache && specs.type === 'additional_storage' && <span className="text-[10px] font-mono px-2 py-1 bg-dark-bg border border-dark-border text-gray-400">{specs.cache}MB Cache</span>}
                      {specs.readSpeed && <span className="text-[10px] font-mono px-2 py-1 bg-dark-bg border border-dark-border text-gray-400">{specs.readSpeed} MB/s Read</span>}
                      {specs.writeSpeed && <span className="text-[10px] font-mono px-2 py-1 bg-dark-bg border border-dark-border text-gray-400">{specs.writeSpeed} MB/s Write</span>}
                    </div>

                    <div className="flex flex-col gap-3 mt-auto pt-4 border-t border-dark-border w-full min-w-0">
                      <div className="flex flex-col min-w-0 w-full overflow-hidden h-full justify-center">
                        <span className="text-[10px] text-gray-500 leading-none mb-1">Price</span>
                        <span className="text-sm sm:text-base font-black text-brand-400 w-full leading-none whitespace-nowrap">{formatCurrency(product.price)}</span>
                      </div>
                      {mode === 'build' ? (
                        (() => {
                          if (product.category.name === 'Storage') {
                            const storageItem = buildStorage.find(s => s.id === product.id);
                            if (storageItem) {
                              return (
                                <div className="w-full h-8 sm:h-10 flex items-center bg-amber-600 rounded ring-2 ring-amber-400/50 shadow-lg shadow-amber-500/30 overflow-hidden font-bold text-white mt-1">
                                  <button 
                                    onClick={(e) => { e.stopPropagation(); updateBuildStorageQuantity(product.id, (storageItem.quantity || 1) - 1); }}
                                    className="flex-1 h-full hover:bg-dark-bg/20 active:bg-dark-bg/40 transition-colors flex items-center justify-center"
                                  >
                                    <Minus className="w-4 h-4" />
                                  </button>
                                  <div className="px-4 h-full flex items-center justify-center min-w-[3ch] font-mono text-sm bg-dark-bg/50 text-white font-black border-x border-amber-600/30 shadow-inner">
                                    {storageItem.quantity || 1}
                                  </div>
                                  <button 
                                    onClick={(e) => { e.stopPropagation(); updateBuildStorageQuantity(product.id, (storageItem.quantity || 1) + 1); }}
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
                                  className="w-full h-8 sm:h-10 px-2 sm:px-3 text-xs sm:text-sm font-bold text-white flex items-center justify-center shadow-lg transition-all hover:scale-[1.02] active:scale-95 gap-1 rounded bg-amber-600 hover:bg-amber-500 hover:shadow-amber-500/30"
                                >
                                  <span>Select</span>
                                </button>
                              );
                            }
                          } else {
                            const isSelected = buildSystem[product.category.name]?.id === product.id;
                            return (
                              <button 
                                onClick={() => {
                                  if (isSelected) {
                                    removeBuildComponent(product.category.name);
                                  } else {
                                    setBuildComponent(product.category.name, product);
                                  }
                                }}
                                className={`w-full h-8 sm:h-10 px-2 sm:px-3 text-xs sm:text-sm font-bold text-white flex items-center justify-center shadow-lg transition-all hover:scale-[1.02] active:scale-95 gap-1 rounded bg-brand-600 ${
                                  isSelected
                                      ? 'bg-emerald-600 hover:bg-emerald-500 hover:shadow-emerald-500/30 ring-2 ring-emerald-400/50'
                                      : 'bg-amber-600 hover:bg-amber-500 hover:shadow-amber-500/30'
                                }`}
                              >
                                {isSelected ? <span>Selected</span> : <span>Select</span>}
                              </button>
                            );
                          }
                        })()
                      ) : (() => {
                        const cartItem = cart.find(item => item.id === product.id);
                        if (cartItem) {
                          return (
                            <div className="w-full h-8 sm:h-10 flex items-center bg-brand-500 rounded ring-2 ring-brand-400/50 shadow-lg shadow-brand-500/30 overflow-hidden font-bold text-white">
                              <button 
                                onClick={(e) => { e.stopPropagation(); updateQuantity(product.id, cartItem.quantity - 1); }}
                                className="flex-1 h-full hover:bg-dark-bg/20 active:bg-dark-bg/40 transition-colors flex items-center justify-center"
                              >
                                <Minus className="w-4 h-4" />
                              </button>
                              <div className="px-4 h-full flex items-center justify-center min-w-[3ch] font-mono text-sm bg-dark-bg/50 text-white font-black border-x border-brand-600/30 shadow-inner">
                                {cartItem.quantity}
                              </div>
                              <button 
                                onClick={(e) => { e.stopPropagation(); updateQuantity(product.id, cartItem.quantity + 1); }}
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
                              setAddedItem(product.id);
                              setTimeout(() => setAddedItem(null), 2000);
                            }}
                            className={`w-full h-8 sm:h-10 px-2 sm:px-3 text-xs sm:text-sm font-bold text-white flex items-center justify-center shadow-lg transition-all hover:scale-[1.02] active:scale-95 gap-1 rounded bg-brand-600 hover:bg-brand-500 hover:shadow-brand-500/30`}
                          >
                            {addedItem === product.id ? (
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
              )
            })}
          </div>
        )}
      </section>
      </div>
    </div>
  )
}
