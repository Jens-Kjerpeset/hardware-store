"use client";

import {
  MOTHERBOARD_MEMORY_TYPES,
  RAM_MIN_SPEED,
  RAM_MAX_SPEED,
  RAM_MAX_CAS,
  RAM_CAPACITIES,
  RAM_MODULES,
} from "@/lib/constants";
import { FilterRangeSlider, FilterCheckboxGroup } from "./FilterPrimitives";

export interface RamFiltersProps {
  memoryTypes: string[];
  setMemoryTypes: (v: string[]) => void;
  capacities: number[];
  setCapacities: (v: number[]) => void;
  modules: string[];
  setModules: (v: string[]) => void;
  minRamSpeed: number;
  setMaxRamSpeed: (v: number) => void;
  maxRamSpeed: number;
  setMinRamSpeed: (v: number) => void;
  maxCasLatency: number;
  setMaxCasLatency: (v: number) => void;
  isOptionPossible: (
    key: string,
    val: string | number,
    ignoreCurrentFilters?: boolean,
  ) => boolean;
  incompatibleFilters: Partial<{ memoryTypes: string[]; modules: string[] }>;
}

export function RamFilters({
  memoryTypes,
  setMemoryTypes,
  capacities,
  setCapacities,
  modules,
  setModules,
  minRamSpeed,
  maxRamSpeed,
  setMinRamSpeed,
  setMaxRamSpeed,
  maxCasLatency,
  setMaxCasLatency,
  isOptionPossible,
  incompatibleFilters,
}: RamFiltersProps) {
  const toggleMemoryType = (m: string) =>
    setMemoryTypes(
      memoryTypes.includes(m)
        ? memoryTypes.filter((x) => x !== m)
        : [...memoryTypes, m],
    );
  const toggleCapacity = (c: number) =>
    setCapacities(
      capacities.includes(c)
        ? capacities.filter((x) => x !== c)
        : [...capacities, c],
    );
  const toggleModule = (m: string) =>
    setModules(
      modules.includes(m) ? modules.filter((x) => x !== m) : [...modules, m],
    );

  return (
    <div className="pt-6 border-t border-dark-border">
      <FilterCheckboxGroup
        title="DDR Generation"
        tooltip="Must match what your motherboard supports."
        options={MOTHERBOARD_MEMORY_TYPES}
        selected={memoryTypes}
        onChange={toggleMemoryType}
        isOptionPossible={(opt) => isOptionPossible("memoryType", opt)}
        incompatibleOptions={incompatibleFilters.memoryTypes || []}
      />

      <FilterCheckboxGroup
        title="Total Capacity"
        tooltip="Total RAM across all sticks in the kit. 32GB is recommended for modern gaming and editing."
        options={RAM_CAPACITIES.map((c) => c.toString())}
        selected={capacities.map((c) => c.toString())}
        onChange={(val) => toggleCapacity(parseInt(val))}
        isOptionPossible={(opt) => isOptionPossible("capacity", parseInt(opt))}
        renderOptionLabel={(opt) => `${opt}GB`}
      />

      <FilterCheckboxGroup
        title="Modules / Sticks"
        tooltip="How many physical sticks make up the kit. 2 sticks (Dual Channel) is optimal for performance."
        options={RAM_MODULES}
        selected={modules}
        onChange={toggleModule}
        isOptionPossible={(opt) => isOptionPossible("modules", opt)}
        incompatibleOptions={incompatibleFilters.modules || []}
      />

      <FilterRangeSlider
        title="Speed (MT/s)"
        tooltip="Megatransfers per second. Higher speeds can improve CPU performance, especially for AMD Ryzen processors."
        min={minRamSpeed}
        max={maxRamSpeed}
        setMin={setMinRamSpeed}
        setMax={setMaxRamSpeed}
        globalMin={RAM_MIN_SPEED}
        globalMax={RAM_MAX_SPEED}
        step={200}
        suffix="MT/s"
      />

      <FilterRangeSlider
        title="Max CAS Latency (CL)"
        tooltip="The delay time for RAM to access data. Lower is faster and better."
        min={10}
        max={maxCasLatency}
        setMin={() => {}}
        setMax={setMaxCasLatency}
        globalMin={10}
        globalMax={RAM_MAX_CAS}
        step={2}
        suffix="CL"
      />
    </div>
  );
}
