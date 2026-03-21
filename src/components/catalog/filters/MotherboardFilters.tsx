"use client";

import {
  MOTHERBOARD_SOCKETS,
  MOTHERBOARD_FORM_FACTORS,
  MOTHERBOARD_MEMORY_TYPES,
  MOTHERBOARD_CHIPSETS,
} from "@/lib/constants";
import { FilterRangeSlider, FilterCheckboxGroup } from "./FilterPrimitives";

export interface MotherboardFiltersProps {
  sockets: string[];
  setSockets: (v: string[]) => void;
  formFactors: string[];
  setFormFactors: (v: string[]) => void;
  memoryTypes: string[];
  setMemoryTypes: (v: string[]) => void;
  chipsets: string[];
  setChipsets: (v: string[]) => void;
  minMemorySlots: number;
  setMaxMemorySlots: (v: number) => void;
  maxMemorySlots: number;
  setMinMemorySlots: (v: number) => void;
  minMaxMemory: number;
  setMinMaxMemory: (v: number) => void;
  isOptionPossible: (
    key: string,
    val: string,
    ignoreCurrentFilters?: boolean,
  ) => boolean;
  incompatibleFilters: Partial<{
    sockets: string[];
    formFactors: string[];
    memoryTypes: string[];
  }>;
}

export function MotherboardFilters({
  sockets,
  setSockets,
  formFactors,
  setFormFactors,
  memoryTypes,
  setMemoryTypes,
  chipsets,
  setChipsets,
  minMemorySlots,
  maxMemorySlots,
  setMinMemorySlots,
  setMaxMemorySlots,
  minMaxMemory,
  setMinMaxMemory,
  isOptionPossible,
  incompatibleFilters,
}: MotherboardFiltersProps) {
  const toggleSocket = (s: string) =>
    setSockets(
      sockets.includes(s) ? sockets.filter((x) => x !== s) : [...sockets, s],
    );
  const toggleFormFactor = (f: string) =>
    setFormFactors(
      formFactors.includes(f)
        ? formFactors.filter((x) => x !== f)
        : [...formFactors, f],
    );
  const toggleMemoryType = (m: string) =>
    setMemoryTypes(
      memoryTypes.includes(m)
        ? memoryTypes.filter((x) => x !== m)
        : [...memoryTypes, m],
    );
  const toggleChipset = (c: string) =>
    setChipsets(
      chipsets.includes(c) ? chipsets.filter((x) => x !== c) : [...chipsets, c],
    );

  return (
    <div className="pt-6 border-t border-dark-border">
      <FilterCheckboxGroup
        title="CPU Socket"
        tooltip="Must match your chosen CPU exactly (e.g. AM5 for AMD Ryzen 7000 series)."
        options={MOTHERBOARD_SOCKETS}
        selected={sockets}
        onChange={toggleSocket}
        isOptionPossible={(opt) => isOptionPossible("socket", opt)}
        incompatibleOptions={incompatibleFilters.sockets || []}
      />

      <FilterCheckboxGroup
        title="Form Factor"
        tooltip="Physical size of the board. ATX is standard, Micro ATX (mATX) is smaller, Mini ITX is smallest."
        options={MOTHERBOARD_FORM_FACTORS}
        selected={formFactors}
        onChange={toggleFormFactor}
        isOptionPossible={(opt) => isOptionPossible("formFactor", opt)}
        incompatibleOptions={incompatibleFilters.formFactors || []}
      />

      <FilterCheckboxGroup
        title="Chipset"
        tooltip="Determines available features (PCIe lanes, overclocking support, USB ports)."
        options={MOTHERBOARD_CHIPSETS}
        selected={chipsets}
        onChange={toggleChipset}
        isOptionPossible={(opt) => isOptionPossible("chipset", opt)}
        incompatibleOptions={[]}
      />

      <FilterCheckboxGroup
        title="Memory Type"
        tooltip="DDR5 is the modern standard, DDR4 is older. Must match your RAM exactly."
        options={MOTHERBOARD_MEMORY_TYPES}
        selected={memoryTypes}
        onChange={toggleMemoryType}
        isOptionPossible={(opt) => isOptionPossible("memoryType", opt)}
        incompatibleOptions={incompatibleFilters.memoryTypes || []}
      />

      <FilterRangeSlider
        title="Memory Slots"
        tooltip="Number of physical slots for RAM sticks. 4 is standard, 2 is common on Mini ITX."
        min={minMemorySlots}
        max={maxMemorySlots}
        setMin={setMinMemorySlots}
        setMax={setMaxMemorySlots}
        globalMin={0}
        globalMax={16}
        step={2}
      />

      <FilterRangeSlider
        title="Min Max RAM Capacity"
        tooltip="The minimum maximum amount of RAM the motherboard can support."
        min={minMaxMemory}
        max={256}
        setMin={setMinMaxMemory}
        setMax={() => {}}
        globalMin={0}
        globalMax={256}
        step={16}
        suffix="GB"
      />
    </div>
  );
}
