"use client";

import { use, useEffect, useState, useCallback, useMemo } from "react";
import {
  Cpu,
  ChevronDown,
  ChevronLeft,
  HelpCircle,
  Filter,
  Search,
  Check,
  Loader2,
} from "lucide-react";
import { useStore } from "@/lib/store";
import { getIncompatibleFilterOptions, SelectedProduct } from "@/lib/compatibility";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ProductCard } from "@/components/catalog/ProductCard";
import { CpuFilters } from "@/components/catalog/filters/CpuFilters";
import { GpuFilters } from "@/components/catalog/filters/GpuFilters";
import { MotherboardFilters } from "@/components/catalog/filters/MotherboardFilters";
import { RamFilters } from "@/components/catalog/filters/RamFilters";
import { StorageFilters } from "@/components/catalog/filters/StorageFilters";
import { PsuFilters } from "@/components/catalog/filters/PsuFilters";
import { CaseFilters } from "@/components/catalog/filters/CaseFilters";
import { CpuCoolerFilters } from "@/components/catalog/filters/CpuCoolerFilters";

import {
  CATEGORY_BRAND_MAP,
  CPU_MIN_SPEED,
  CPU_MAX_SPEED,
  CPU_MIN_CORES,
  CPU_MAX_CORES,
  CPU_MAX_TDP,
  GPU_MIN_VRAM,
  GPU_MAX_VRAM,
  GPU_MIN_PSU,
  GPU_MAX_PSU,
  GPU_CHIPSETS,
  GPU_MAX_LENGTH,
  RAM_MIN_SPEED,
  RAM_MAX_SPEED,
  RAM_MAX_CAS,
  STORAGE_MIN_READ_SPEED,
  STORAGE_MAX_READ_SPEED,
  PSU_MIN_WATTAGE,
  PSU_MAX_WATTAGE,
  MIN_COOLER_NOISE,
  MAX_COOLER_NOISE,
  MIN_COOLER_HEIGHT,
  MAX_COOLER_HEIGHT,
} from "@/lib/constants";

const FilterTooltip = ({ text }: { text: string }) => (
  <div className="group relative inline-flex items-center ml-2 align-middle">
    <HelpCircle className="w-3.5 h-3.5 text-orange-500 cursor-help" />
    <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover:block w-56 p-2 bg-dark-bg border border-dark-border text-xs text-gray-300  shadow-2xl z-50 normal-case tracking-normal text-center pointer-events-none">
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

export default function CategoryGrid({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category: activeCategory } = use(params);
  const router = useRouter();
  const decodedCategory = decodeURIComponent(activeCategory);

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Zustand Store
  const { mode, buildSystem, buildStorage } = useStore();

  const buildParts = useMemo(
    () => [...Object.values(buildSystem), ...buildStorage],
    [buildSystem, buildStorage],
  );

  const incompatibleFilters = useMemo(() => {
    if (mode !== "build") return {};
    const checkArray = buildParts.map((p) => ({
      id: p.id,
      name: p.name,
      brand: p.brand,
      categoryId: p.category.name,
      specsJson: p.specsJson,
    }));
    return getIncompatibleFilterOptions(checkArray as SelectedProduct[], decodedCategory);
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
  const [minReadSpeed, setMinReadSpeed] = useState<number>(
    STORAGE_MIN_READ_SPEED,
  );
  const [maxReadSpeed, setMaxReadSpeed] = useState<number>(
    STORAGE_MAX_READ_SPEED,
  );
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
  const [minCoolerNoise, setMinCoolerNoise] =
    useState<number>(MIN_COOLER_NOISE);
  const [maxCoolerNoise, setMaxCoolerNoise] =
    useState<number>(MAX_COOLER_NOISE);
  const [minCoolerHeight, setMinCoolerHeight] =
    useState<number>(MIN_COOLER_HEIGHT);
  const [maxCoolerHeight, setMaxCoolerHeight] =
    useState<number>(MAX_COOLER_HEIGHT);

  const [allCategoryProducts, setAllCategoryProducts] = useState<Product[]>([]);
  useEffect(() => {
    let active = true;
    fetch(`/api/products?category=${encodeURIComponent(decodedCategory)}`)
      .then((res) => res.json())
      .then((data) => {
        if (active && Array.isArray(data)) setAllCategoryProducts(data);
      })
      .catch(console.error);
    return () => {
      active = false;
    };
  }, [decodedCategory]);

  interface ParsedSpecs {
    socket?: string;
    compatibleSockets?: string[];
    chipset?: string;
    formFactor?: string;
    memoryType?: string;
    interface?: string;
    capacity?: number;
    modules?: string;
    storageType?: string;
    efficiency?: string;
    modular?: string;
    maxMainboard?: string;
    color?: string;
    sidePanel?: string;
    coolerType?: string;
    radiatorSize?: number;
    [key: string]: unknown;
  }

  const isOptionPossible = useCallback(
    (
      filterType: string,
      optionValue: string | number,
      ignoreCurrentFilters = false,
    ) => {
      if (allCategoryProducts.length === 0) return true; // Keep visible while loading

      return allCategoryProducts.some((p) => {
        let specs: ParsedSpecs = {};
        try {
          specs = JSON.parse(p.specsJson || "{}");
        } catch {}

        if (!ignoreCurrentFilters) {
          if (
            filterType !== "brand" &&
            brands.length > 0 &&
            !brands.includes(p.brand)
          )
            return false;
          if (
            filterType !== "socket" &&
            sockets.length > 0 &&
            !(
              sockets.includes(specs.socket as string) ||
              (specs.compatibleSockets &&
                specs.compatibleSockets.includes(optionValue as string))
            )
          )
            return false;
          if (
            filterType !== "chipset" &&
            chipsets.length > 0 &&
            !chipsets.includes(specs.chipset as string)
          )
            return false;
          if (
            filterType !== "formFactor" &&
            formFactors.length > 0 &&
            !formFactors.includes(specs.formFactor as string)
          )
            return false;
          if (
            filterType !== "memoryType" &&
            memoryTypes.length > 0 &&
            !memoryTypes.includes(specs.memoryType as string)
          )
            return false;
          if (
            filterType !== "interface" &&
            interfaces.length > 0 &&
            !interfaces.includes(specs.interface as string)
          )
            return false;
          if (
            filterType !== "capacity" &&
            capacities.length > 0 &&
            !capacities.includes(specs.capacity as number)
          )
            return false;
          if (
            filterType !== "modules" &&
            modules.length > 0 &&
            !modules.includes(specs.modules as string)
          )
            return false;

          if (
            filterType !== "storageInterface" &&
            storageInterfaces.length > 0 &&
            !storageInterfaces.includes(specs.interface as string)
          )
            return false;
          if (
            filterType !== "storageCapacity" &&
            storageCapacities.length > 0 &&
            !storageCapacities.includes(specs.capacity as number)
          )
            return false;
          if (
            filterType !== "storageType" &&
            storageTypes.length > 0 &&
            !storageTypes.includes(specs.storageType as string)
          )
            return false;
          if (
            filterType !== "storageFormFactor" &&
            storageFormFactors.length > 0 &&
            !storageFormFactors.includes(specs.formFactor as string)
          )
            return false;

          if (
            filterType !== "psuEfficiency" &&
            psuEfficiencies.length > 0 &&
            !psuEfficiencies.includes(specs.efficiency as string)
          )
            return false;
          if (
            filterType !== "psuModularity" &&
            psuModularities.length > 0 &&
            !psuModularities.includes(specs.modular as string)
          )
            return false;
          if (
            filterType !== "psuFormFactor" &&
            psuFormFactors.length > 0 &&
            !psuFormFactors.includes(specs.formFactor as string)
          )
            return false;

          if (
            filterType !== "caseFormFactor" &&
            caseFormFactors.length > 0 &&
            !caseFormFactors.includes(specs.formFactor as string)
          )
            return false;
          if (
            filterType !== "caseMaxMainboard" &&
            caseMaxMainboards.length > 0 &&
            !caseMaxMainboards.includes(specs.maxMainboard as string)
          )
            return false;
          if (
            filterType !== "caseColor" &&
            caseColors.length > 0 &&
            !caseColors.includes(specs.color as string)
          )
            return false;
          if (
            filterType !== "caseSidePanel" &&
            caseSidePanels.length > 0 &&
            !caseSidePanels.includes(specs.sidePanel as string)
          )
            return false;

          if (
            filterType !== "coolerType" &&
            coolerTypes.length > 0 &&
            !coolerTypes.includes(specs.coolerType as string)
          )
            return false;
          if (
            filterType !== "coolerRadiatorSize" &&
            coolerRadiatorSizes.length > 0 &&
            !coolerRadiatorSizes.includes(specs.radiatorSize as number)
          )
            return false;
          if (
            filterType !== "coolerColor" &&
            coolerColors.length > 0 &&
            !coolerColors.includes(specs.color as string)
          )
            return false;
        }

        if (filterType === "brand") return p.brand === optionValue;
        if (filterType === "socket")
          return (
            specs.socket === optionValue ||
            (specs.compatibleSockets &&
              specs.compatibleSockets.includes(optionValue as string))
          );
        if (filterType === "chipset") return specs.chipset === optionValue;
        if (
          filterType === "formFactor" ||
          filterType === "storageFormFactor" ||
          filterType === "psuFormFactor" ||
          filterType === "caseFormFactor"
        )
          return specs.formFactor === optionValue;
        if (filterType === "memoryType")
          return specs.memoryType === optionValue;
        if (filterType === "interface" || filterType === "storageInterface")
          return specs.interface === optionValue;
        if (filterType === "capacity" || filterType === "storageCapacity")
          return specs.capacity === optionValue;
        if (filterType === "modules") return specs.modules === optionValue;
        if (filterType === "storageType")
          return specs.storageType === optionValue;
        if (filterType === "psuEfficiency")
          return specs.efficiency === optionValue;
        if (filterType === "psuModularity")
          return specs.modular === optionValue;
        if (filterType === "caseMaxMainboard")
          return specs.maxMainboard === optionValue;
        if (filterType === "caseColor" || filterType === "coolerColor")
          return specs.color === optionValue;
        if (filterType === "caseSidePanel")
          return specs.sidePanel === optionValue;
        if (filterType === "coolerType")
          return specs.coolerType === optionValue;
        if (filterType === "coolerRadiatorSize")
          return specs.radiatorSize === optionValue;

        return true;
      });
    },
    [
      allCategoryProducts,
      brands,
      sockets,
      chipsets,
      formFactors,
      memoryTypes,
      interfaces,
      capacities,
      modules,
      storageInterfaces,
      storageCapacities,
      storageTypes,
      storageFormFactors,
      psuEfficiencies,
      psuModularities,
      psuFormFactors,
      caseFormFactors,
      caseMaxMainboards,
      caseColors,
      caseSidePanels,
      coolerTypes,
      coolerRadiatorSizes,
      coolerColors,
    ],
  );

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    let url = `/api/products?sort=${sort}`;
    if (query) url += `&q=${encodeURIComponent(query)}`;
    url += `&category=${encodeURIComponent(decodedCategory)}`;
    if (brands.length > 0)
      url += `&brand=${encodeURIComponent(brands.join(","))}`;

    if (decodedCategory === "CPU") {
      if (minSpeed > CPU_MIN_SPEED) url += `&minSpeed=${minSpeed}`;
      if (maxSpeed < CPU_MAX_SPEED) url += `&maxSpeed=${maxSpeed}`;
      if (minCores > CPU_MIN_CORES) url += `&minCores=${minCores}`;
      if (maxCores < CPU_MAX_CORES) url += `&maxCores=${maxCores}`;
      if (maxTDP < CPU_MAX_TDP) url += `&maxTDP=${maxTDP}`;
      if (sockets.length > 0)
        url += `&sockets=${encodeURIComponent(sockets.join(","))}`;
    }

    if (decodedCategory === "GPU") {
      if (minVram > GPU_MIN_VRAM) url += `&minVram=${minVram}`;
      if (maxVram < GPU_MAX_VRAM) url += `&maxVram=${maxVram}`;
      if (minPsu > GPU_MIN_PSU) url += `&minPsu=${minPsu}`;
      if (maxPsu < GPU_MAX_PSU) url += `&maxPsu=${maxPsu}`;
      if (interfaces.length > 0)
        url += `&interfaces=${encodeURIComponent(interfaces.join(","))}`;
      if (chipsets.length > 0)
        url += `&chipsets=${encodeURIComponent(chipsets.join(","))}`;
      if (maxLength < GPU_MAX_LENGTH) url += `&maxLength=${maxLength}`;
    }

    if (decodedCategory === "Motherboard") {
      if (sockets.length > 0)
        url += `&sockets=${encodeURIComponent(sockets.join(","))}`;
      if (formFactors.length > 0)
        url += `&formFactor=${encodeURIComponent(formFactors.join(","))}`;
      if (memoryTypes.length > 0)
        url += `&memoryType=${encodeURIComponent(memoryTypes.join(","))}`;
      if (minMemorySlots > 0) url += `&minMemorySlots=${minMemorySlots}`;
      if (maxMemorySlots < 16) url += `&maxMemorySlots=${maxMemorySlots}`;
      if (minMaxMemory > 0) url += `&minMaxMemory=${minMaxMemory}`;
      if (chipsets.length > 0)
        url += `&chipsets=${encodeURIComponent(chipsets.join(","))}`;
    }

    if (decodedCategory === "RAM") {
      if (memoryTypes.length > 0)
        url += `&memoryType=${encodeURIComponent(memoryTypes.join(","))}`;
      if (capacities.length > 0)
        url += `&capacities=${encodeURIComponent(capacities.join(","))}`;
      if (modules.length > 0)
        url += `&modules=${encodeURIComponent(modules.join(","))}`;
      if (minRamSpeed > RAM_MIN_SPEED) url += `&minRamSpeed=${minRamSpeed}`;
      if (maxRamSpeed < RAM_MAX_SPEED) url += `&maxRamSpeed=${maxRamSpeed}`;
      if (maxCasLatency < RAM_MAX_CAS) url += `&maxCasLatency=${maxCasLatency}`;
    }

    if (decodedCategory === "Storage") {
      if (storageInterfaces.length > 0)
        url += `&storageInterfaces=${encodeURIComponent(storageInterfaces.join(","))}`;
      if (storageCapacities.length > 0)
        url += `&storageCapacities=${encodeURIComponent(storageCapacities.join(","))}`;
      if (minReadSpeed > STORAGE_MIN_READ_SPEED)
        url += `&minReadSpeed=${minReadSpeed}`;
      if (maxReadSpeed < STORAGE_MAX_READ_SPEED)
        url += `&maxReadSpeed=${maxReadSpeed}`;
      if (storageTypes.length > 0)
        url += `&storageTypes=${encodeURIComponent(storageTypes.join(","))}`;
      if (storageFormFactors.length > 0)
        url += `&storageFormFactors=${encodeURIComponent(storageFormFactors.join(","))}`;
    }

    if (decodedCategory === "Power Supply") {
      if (minWattage > PSU_MIN_WATTAGE) url += `&minWattage=${minWattage}`;
      if (maxWattage < PSU_MAX_WATTAGE) url += `&maxWattage=${maxWattage}`;
      if (psuEfficiencies.length > 0)
        url += `&psuEfficiencies=${encodeURIComponent(psuEfficiencies.join(","))}`;
      if (psuModularities.length > 0)
        url += `&psuModularities=${encodeURIComponent(psuModularities.join(","))}`;
      if (psuFormFactors.length > 0)
        url += `&psuFormFactors=${encodeURIComponent(psuFormFactors.join(","))}`;
    }

    if (decodedCategory === "Case") {
      if (caseFormFactors.length > 0)
        url += `&caseFormFactors=${encodeURIComponent(caseFormFactors.join(","))}`;
      if (caseMaxMainboards.length > 0)
        url += `&caseMaxMainboards=${encodeURIComponent(caseMaxMainboards.join(","))}`;
      if (caseColors.length > 0)
        url += `&caseColors=${encodeURIComponent(caseColors.join(","))}`;
      if (caseSidePanels.length > 0)
        url += `&caseSidePanels=${encodeURIComponent(caseSidePanels.join(","))}`;
    }

    if (decodedCategory === "CPU Cooler") {
      if (coolerTypes.length > 0)
        url += `&coolerTypes=${encodeURIComponent(coolerTypes.join(","))}`;
      if (coolerRadiatorSizes.length > 0)
        url += `&coolerRadiatorSizes=${encodeURIComponent(coolerRadiatorSizes.join(","))}`;
      if (coolerColors.length > 0)
        url += `&coolerColors=${encodeURIComponent(coolerColors.join(","))}`;
      if (minCoolerNoise > MIN_COOLER_NOISE)
        url += `&minCoolerNoise=${minCoolerNoise}`;
      if (maxCoolerNoise < MAX_COOLER_NOISE)
        url += `&maxCoolerNoise=${maxCoolerNoise}`;
      if (minCoolerHeight > MIN_COOLER_HEIGHT)
        url += `&minCoolerHeight=${minCoolerHeight}`;
      if (maxCoolerHeight < MAX_COOLER_HEIGHT)
        url += `&maxCoolerHeight=${maxCoolerHeight}`;
      // Note: socket compatibility is handled via the existing 'sockets' state variable
    }

    try {
      const res = await fetch(url);
      if (!res.ok) {
        console.error("API returned a non-200 status:", res.status);
        setProducts([]);
        return;
      }
      const data = await res.json();
      if (Array.isArray(data)) {
        setProducts(data);
      } else {
        console.error("API returned non-array data:", data);
        setProducts([]);
      }
    } catch (e) {
      console.error("Network or parsing error:", e);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [
    query,
    brands,
    sort,
    decodedCategory,
    minSpeed,
    maxSpeed,
    minCores,
    maxCores,
    maxTDP,
    sockets,
    minVram,
    maxVram,
    minPsu,
    maxPsu,
    interfaces,
    chipsets,
    maxLength,
    formFactors,
    memoryTypes,
    minMemorySlots,
    maxMemorySlots,
    minMaxMemory,
    minRamSpeed,
    maxRamSpeed,
    maxCasLatency,
    capacities,
    modules,
    storageInterfaces,
    storageCapacities,
    minReadSpeed,
    maxReadSpeed,
    storageTypes,
    storageFormFactors,
    minWattage,
    maxWattage,
    psuEfficiencies,
    psuModularities,
    psuFormFactors,
    caseFormFactors,
    caseMaxMainboards,
    caseColors,
    caseSidePanels,
    coolerTypes,
    coolerRadiatorSizes,
    coolerColors,
    minCoolerNoise,
    maxCoolerNoise,
    minCoolerHeight,
    maxCoolerHeight,
  ]);

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
            className={`fixed inset-0 bg-black/60 z-40 backdrop-blur-sm transition-opacity duration-300 ${showFilters ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
            onClick={() => setShowFilters(false)}
          />

          {/* Floating Left Tab Button */}
          <button
            onClick={() => setShowFilters(true)}
            className={`fixed left-0 top-1/2 -translate-y-1/2 z-[100] flex items-center justify-center bg-brand-500 hover:bg-brand-400  shadow-xl transition-all h-24 overflow-hidden group ${showFilters ? "-translate-x-full" : "translate-x-0 w-10 hover:w-14"}`}
            title="Open Filters"
          >
            <div className="flex flex-col items-center justify-center gap-2 group-hover:scale-110 transition-transform">
              <Filter className="w-5 h-5 text-dark-bg" />
            </div>
          </button>
        </div>

        {/* Sidebar filters */}
        <aside
          className={`w-[85vw] sm:w-[360px] lg:w-64 shrink-0 flex flex-col gap-6 min-w-0 fixed lg:static top-0 bottom-0 left-0 z-50 lg:z-auto transition-transform duration-300 ease-in-out bg-dark-bg/95 lg:bg-transparent border-r lg:border-none border-dark-border overflow-y-auto lg:overflow-visible ${showFilters ? "translate-x-0" : "-translate-x-full lg:translate-x-0"} `}
        >
          <div className="glass flex-1 shrink-0 flex flex-col p-6 pb-20 lg:pb-6 lg:shadow-xl relative border-none lg:border-solid border-dark-border">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold tracking-tight">Filters</h2>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    setBrands([]);
                    setQuery("");
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
                  className="text-sm font-medium text-gray-400 hover:text-brand-500 transition-colors py-1 px-2  hover:bg-brand-500/10"
                  title="Clear All Filters"
                >
                  Clear filters
                </button>

                {/* Mobile Close Button */}
                <button
                  onClick={() => setShowFilters(false)}
                  className="lg:hidden flex items-center justify-center w-8 h-8 bg-brand-500 hover:bg-brand-400 text-dark-bg  transition-colors shadow-lg"
                  title="Close Filters"
                >
                  <div className="relative w-4 h-4">
                    <div className="absolute top-1/2 left-0 w-full h-[2px] bg-current -translate-y-1/2 rotate-45 " />
                    <div className="absolute top-1/2 left-0 w-full h-[2px] bg-current -translate-y-1/2 -rotate-45 " />
                  </div>
                </button>
              </div>
            </div>

            <div className="space-y-6">
              {/* GPU Chipset (Top Level) */}
              {decodedCategory === "GPU" && (
                <div>
                  <div className="flex items-center mb-3">
                    <h3 className="text-sm font-semibold text-brand-500  ">
                      Chipset
                    </h3>
                    <FilterTooltip text="The core graphics processor designer (e.g., NVIDIA, AMD)." />
                  </div>
                  <div className="space-y-2 mb-6">
                    {GPU_CHIPSETS.map((c) => {
                      if (!isOptionPossible("chipset", c, true)) return null;
                      const isChecked = chipsets.includes(c);
                      const isPossible = isOptionPossible("chipset", c);
                      const isDisabled = !isPossible;
                      const toggle = () => {
                        if (isDisabled) return;
                        setChipsets((prev) =>
                          isChecked
                            ? prev.filter((x) => x !== c)
                            : [...prev, c],
                        );
                      };
                      return (
                        <label
                          key={c}
                          className={`flex items-center gap-3 select-none ${isDisabled ? "opacity-40 cursor-not-allowed grayscale" : "cursor-pointer group"}`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={toggle}
                            className="hidden"
                          />
                          <div
                            className={`w-4 h-4 border flex items-center justify-center transition-all ${isChecked ? "bg-brand-500 border-brand-500" : "border-gray-500 group-hover:border-brand-400"}`}
                          >
                            {isChecked && (
                              <Check className="w-3 h-3 text-white" />
                            )}
                          </div>
                          <span
                            className={`text-sm transition-colors ${isChecked ? "text-white font-medium" : "text-gray-400 group-hover:text-gray-200"}`}
                          >
                            {c}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Brands */}
              <div className="flex flex-col gap-8 transition-all duration-300">
                {/* Brands */}
                <div>
                  <div className="flex items-center mb-4">
                    <h3 className="text-sm font-semibold text-brand-500  ">
                      Brand
                    </h3>
                    <FilterTooltip text="The manufacturer of the component." />
                  </div>
                  <div className="space-y-2">
                    {(CATEGORY_BRAND_MAP[decodedCategory] || [])
                      .filter((b) => isOptionPossible("brand", b, true))
                      .map((b, index, filteredArray) => {
                        const isChecked = brands.includes(b);
                        const isPossible = isOptionPossible("brand", b);
                        const isDisabled = !isPossible;

                        const toggle = (
                          e: React.ChangeEvent<HTMLInputElement>,
                          currentCheckedValue: boolean,
                        ) => {
                          if (isDisabled) return;
                          if (
                            (e.nativeEvent as MouseEvent).shiftKey &&
                            lastClickedBrand !== null
                          ) {
                            const start = Math.min(lastClickedBrand, index);
                            const end = Math.max(lastClickedBrand, index);
                            const range = filteredArray.slice(start, end + 1);
                            if (currentCheckedValue) {
                              setBrands((prev) =>
                                prev.filter((c) => !range.includes(c)),
                              );
                            } else {
                              setBrands((prev) =>
                                Array.from(new Set([...prev, ...range])),
                              );
                            }
                          } else {
                            setBrands((prev) =>
                              currentCheckedValue
                                ? prev.filter((c) => c !== b)
                                : [...prev, b],
                            );
                          }
                          setLastClickedBrand(index);
                        };
                        return (
                          <label
                            key={b}
                            className={`flex items-center gap-3 select-none ${isDisabled ? "opacity-40 cursor-not-allowed grayscale" : "cursor-pointer group"}`}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={(e) => toggle(e, isChecked)}
                              className="hidden"
                            />
                            <div
                              className={`w-4 h-4 border flex items-center justify-center transition-all ${isChecked ? "bg-brand-500 border-brand-500" : "border-gray-500 group-hover:border-brand-400"}`}
                            >
                              {isChecked && (
                                <Check className="w-3 h-3 text-white" />
                              )}
                            </div>
                            <span
                              className={`text-sm transition-colors ${isChecked ? "text-white font-medium" : "text-gray-400 group-hover:text-gray-200"}`}
                            >
                              {b}
                            </span>
                          </label>
                        );
                      })}
                  </div>
                </div>
              </div>

              {/* Modular Deep Filters */}
              {decodedCategory === "CPU" && (
                <CpuFilters
                  minCores={minCores}
                  setMinCores={setMinCores}
                  maxCores={maxCores}
                  setMaxCores={setMaxCores}
                  minSpeed={minSpeed}
                  setMinSpeed={setMinSpeed}
                  maxSpeed={maxSpeed}
                  setMaxSpeed={setMaxSpeed}
                  maxTDP={maxTDP}
                  setMaxTDP={setMaxTDP}
                  sockets={sockets}
                  setSockets={setSockets}
                  isOptionPossible={isOptionPossible}
                  incompatibleFilters={incompatibleFilters}
                />
              )}
              {decodedCategory === "GPU" && (
                <GpuFilters
                  chipsets={chipsets}
                  setChipsets={setChipsets}
                  interfaces={interfaces}
                  setInterfaces={setInterfaces}
                  minVram={minVram}
                  setMinVram={setMinVram}
                  maxVram={maxVram}
                  setMaxVram={setMaxVram}
                  minPsu={minPsu}
                  setMinPsu={setMinPsu}
                  maxPsu={maxPsu}
                  setMaxPsu={setMaxPsu}
                  maxLength={maxLength}
                  setMaxLength={setMaxLength}
                  isOptionPossible={isOptionPossible}
                  incompatibleFilters={incompatibleFilters}
                />
              )}
              {decodedCategory === "Motherboard" && (
                <MotherboardFilters
                  sockets={sockets}
                  setSockets={setSockets}
                  formFactors={formFactors}
                  setFormFactors={setFormFactors}
                  memoryTypes={memoryTypes}
                  setMemoryTypes={setMemoryTypes}
                  chipsets={chipsets}
                  setChipsets={setChipsets}
                  minMemorySlots={minMemorySlots}
                  setMinMemorySlots={setMinMemorySlots}
                  maxMemorySlots={maxMemorySlots}
                  setMaxMemorySlots={setMaxMemorySlots}
                  minMaxMemory={minMaxMemory}
                  setMinMaxMemory={setMinMaxMemory}
                  isOptionPossible={isOptionPossible}
                  incompatibleFilters={incompatibleFilters}
                />
              )}
              {decodedCategory === "RAM" && (
                <RamFilters
                  memoryTypes={memoryTypes}
                  setMemoryTypes={setMemoryTypes}
                  capacities={capacities}
                  setCapacities={setCapacities}
                  modules={modules}
                  setModules={setModules}
                  minRamSpeed={minRamSpeed}
                  setMinRamSpeed={setMinRamSpeed}
                  maxRamSpeed={maxRamSpeed}
                  setMaxRamSpeed={setMaxRamSpeed}
                  maxCasLatency={maxCasLatency}
                  setMaxCasLatency={setMaxCasLatency}
                  isOptionPossible={isOptionPossible}
                  incompatibleFilters={incompatibleFilters}
                />
              )}
              {decodedCategory === "Storage" && (
                <StorageFilters
                  storageTypes={storageTypes}
                  setStorageTypes={setStorageTypes}
                  storageCapacities={storageCapacities}
                  setStorageCapacities={setStorageCapacities}
                  storageFormFactors={storageFormFactors}
                  setStorageFormFactors={setStorageFormFactors}
                  storageInterfaces={storageInterfaces}
                  setStorageInterfaces={setStorageInterfaces}
                  minReadSpeed={minReadSpeed}
                  setMinReadSpeed={setMinReadSpeed}
                  maxReadSpeed={maxReadSpeed}
                  setMaxReadSpeed={setMaxReadSpeed}
                  isOptionPossible={isOptionPossible}
                />
              )}
              {decodedCategory === "Power Supply" && (
                <PsuFilters
                  minWattage={minWattage}
                  setMinWattage={setMinWattage}
                  maxWattage={maxWattage}
                  setMaxWattage={setMaxWattage}
                  psuEfficiencies={psuEfficiencies}
                  setPsuEfficiencies={setPsuEfficiencies}
                  psuModularities={psuModularities}
                  setPsuModularities={setPsuModularities}
                  psuFormFactors={psuFormFactors}
                  setPsuFormFactors={setPsuFormFactors}
                  isOptionPossible={isOptionPossible}
                />
              )}
              {decodedCategory === "Case" && (
                <CaseFilters
                  caseFormFactors={caseFormFactors}
                  setCaseFormFactors={setCaseFormFactors}
                  caseMaxMainboards={caseMaxMainboards}
                  setCaseMaxMainboards={setCaseMaxMainboards}
                  caseColors={caseColors}
                  setCaseColors={setCaseColors}
                  caseSidePanels={caseSidePanels}
                  setCaseSidePanels={setCaseSidePanels}
                  isOptionPossible={isOptionPossible}
                />
              )}
              {decodedCategory === "CPU Cooler" && (
                <CpuCoolerFilters
                  coolerTypes={coolerTypes}
                  setCoolerTypes={setCoolerTypes}
                  sockets={sockets}
                  setSockets={setSockets}
                  coolerRadiatorSizes={coolerRadiatorSizes}
                  setCoolerRadiatorSizes={setCoolerRadiatorSizes}
                  coolerColors={coolerColors}
                  setCoolerColors={setCoolerColors}
                  minCoolerNoise={minCoolerNoise}
                  setMinCoolerNoise={setMinCoolerNoise}
                  maxCoolerNoise={maxCoolerNoise}
                  setMaxCoolerNoise={setMaxCoolerNoise}
                  minCoolerHeight={minCoolerHeight}
                  setMinCoolerHeight={setMinCoolerHeight}
                  maxCoolerHeight={maxCoolerHeight}
                  setMaxCoolerHeight={setMaxCoolerHeight}
                  isOptionPossible={isOptionPossible}
                  incompatibleFilters={incompatibleFilters}
                />
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
                className="flex items-center justify-center gap-2 h-11 px-4 text-sm font-medium text-gray-400 hover:text-white hover:bg-dark-bg/60 border border-transparent hover:border-dark-border/80  transition-all group"
              >
                <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                <span className="hidden sm:inline">Back to Categories</span>
                <span className="sm:hidden">Categories</span>
              </Link>
            </div>

            {/* Right Group: Category, Search Toggle, and Sort */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center w-full sm:w-auto gap-2">
              {/* Category Select */}
              <div className="relative group flex-1 sm:flex-none h-11  border border-dark-border/80 bg-dark-surface/40 hover:bg-dark-bg/60 transition-colors shadow-sm hover:border-brand-500/30">
                <select
                  value={decodedCategory}
                  onChange={(e) => router.push(`/catalog/${e.target.value}`)}
                  className="w-full sm:w-auto h-full text-base sm:text-lg font-bold tracking-normal text-white bg-transparent appearance-none focus:outline-none cursor-pointer pl-4 pr-10 relative z-10"
                >
                  {Object.keys(CATEGORY_BRAND_MAP).map((cat) => (
                    <option
                      key={cat}
                      value={cat}
                      className="bg-dark-bg text-sm font-normal"
                    >
                      {cat}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-500 pointer-events-none group-hover:text-brand-400 transition-colors" />
              </div>

              {/* Search Toggle */}
              <div className="relative flex items-center justify-center sm:flex-none h-11 px-3 group  border border-dark-border/80 bg-dark-surface/40 hover:bg-dark-bg/60 transition-colors shadow-sm hover:border-brand-500/30">
                <button
                  onClick={() => setShowSearch(!showSearch)}
                  className={`p-1.5 transition-colors  ${showSearch ? "text-brand-500 bg-dark-bg" : "text-gray-400 group-hover:text-white"}`}
                  title="Search Catalog"
                >
                  <Search className="w-5 h-5" />
                </button>

                {/* Expandable Input Container */}
                <div
                  className={`absolute right-0 sm:left-1/2 sm:-translate-x-1/2 top-full mt-3 w-[calc(100vw-2rem)] sm:w-72 origin-top sm:origin-top transition-all duration-300 ease-in-out z-50 ${
                    showSearch
                      ? "opacity-100 scale-100 pointer-events-auto"
                      : "opacity-0 scale-95 pointer-events-none"
                  }`}
                >
                  <input
                    type="text"
                    placeholder="Search catalog..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="w-full bg-dark-bg/95 backdrop-blur shadow-2xl border border-dark-border text-white px-4 py-3 focus:outline-none focus:border-brand-500 transition-colors "
                  />
                  {/* Little triangle pointing up at the search icon on desktop */}
                  <div className="hidden sm:block absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-dark-bg/95 border-t border-l border-dark-border rotate-45" />
                </div>
              </div>

              {/* Sort Select */}
              <div className="relative group flex-1 sm:flex-none h-11  border border-dark-border/80 bg-dark-surface/40 hover:bg-dark-bg/60 transition-colors shadow-sm hover:border-brand-500/30">
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  className="w-full h-full sm:w-auto appearance-none bg-transparent text-gray-200 text-sm pl-4 pr-10 focus:outline-none cursor-pointer"
                >
                  <option value="price_desc">Price: High to Low</option>
                  <option value="price_asc">Price: Low to High</option>
                  {decodedCategory === "CPU" && (
                    <>
                      <option value="cores_desc">Cores: High to Low</option>
                      <option value="speed_desc">Speed: High to Low</option>
                      <option value="tdp_desc">Max Power: High to Low</option>
                    </>
                  )}
                  {decodedCategory === "GPU" && (
                    <>
                      <option value="vram_desc">VRAM: High to Low</option>
                      <option value="psu_desc">
                        Required PSU: High to Low
                      </option>
                      <option value="length_asc">Length: Shortest First</option>
                      <option value="length_desc">Length: Longest First</option>
                    </>
                  )}
                  {decodedCategory === "Motherboard" && (
                    <>
                      <option value="memory_slots_desc">
                        Memory Slots: High to Low
                      </option>
                      <option value="max_memory_desc">
                        Max Memory: High to Low
                      </option>
                    </>
                  )}
                  {decodedCategory === "RAM" && (
                    <>
                      <option value="ram_speed_desc">Speed: High to Low</option>
                      <option value="ram_capacity_desc">
                        Capacity: High to Low
                      </option>
                      <option value="cas_latency_asc">
                        CAS Latency: Low to High
                      </option>
                    </>
                  )}
                  {decodedCategory === "Storage" && (
                    <>
                      <option value="storage_capacity_desc">
                        Capacity: High to Low
                      </option>
                      <option value="read_speed_desc">
                        Read Speed: High to Low
                      </option>
                    </>
                  )}
                  {decodedCategory === "Power Supply" && (
                    <>
                      <option value="wattage_desc">Wattage: High to Low</option>
                    </>
                  )}
                  {decodedCategory === "CPU Cooler" && (
                    <>
                      <option value="cooler_noise_asc">
                        Min Noise: Low to High
                      </option>
                      <option value="cooler_height_asc">
                        Height: Shortest First
                      </option>
                    </>
                  )}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none group-hover:text-gray-400 transition-colors" />
              </div>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-6 w-full mb-8">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div
                  key={i}
                  className="group flex flex-col min-w-0 glass border border-dark-border/50 h-[380px] relative overflow-hidden"
                >
                  {/* Premium Animated Pulse Effect */}
                  <div className="absolute inset-0 bg-gradient-to-br from-brand-500/5 via-transparent to-transparent opacity-50 animate-pulse" />

                  {/* Spinning Wheel Container */}
                  <div className="h-48 w-full p-6 flex flex-col items-center justify-center bg-gradient-to-b from-dark-surface to-dark-bg border-b border-dark-border/50 relative">
                    <div className="absolute inset-0 bg-brand-500/5" />
                    <Loader2 className="w-12 h-12 text-brand-500 animate-spin drop-shadow-[0_0_15px_rgba(59,130,246,0.5)] mb-4 relative z-10" />
                    <span className="text-xs font-bold text-gray-500   animate-pulse relative z-10">
                      Fetching Specs...
                    </span>
                  </div>

                  {/* Skeleton Data Rows */}
                  <div className="p-4 sm:p-5 flex flex-col flex-1 min-w-0 justify-between">
                    <div className="space-y-3">
                      <div className="h-3 w-16 bg-gray-700/50  animate-pulse" />
                      <div className="h-5 w-3/4 bg-gray-600/50  animate-pulse" />
                      <div className="flex flex-wrap gap-2 pt-2">
                        <div className="h-4 w-12 bg-gray-800  animate-pulse" />
                        <div className="h-4 w-20 bg-gray-800  animate-pulse" />
                        <div className="h-4 w-16 bg-gray-800  animate-pulse" />
                      </div>
                    </div>

                    <div className="w-full flex justify-between items-end mt-4">
                      <div className="space-y-1">
                        <div className="h-2 w-8 bg-gray-700/50  animate-pulse" />
                        <div className="h-6 w-20 bg-gray-600/50  animate-pulse" />
                      </div>
                      <div className="h-8 w-24 bg-brand-600/20  animate-pulse" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-20 text-center glass">
              <Cpu className="w-16 h-16 text-gray-600 mb-4" />
              <h3 className="text-xl font-bold text-gray-300">
                No components found
              </h3>
              <p className="text-gray-500 mt-2">
                Try adjusting your filters or search query.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-6 w-full">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
