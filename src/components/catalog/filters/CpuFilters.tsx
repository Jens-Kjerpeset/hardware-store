"use client";

import {
  CPU_MIN_CORES,
  CPU_MAX_CORES,
  CPU_MIN_SPEED,
  CPU_MAX_SPEED,
  CPU_MAX_TDP,
  CPU_SOCKETS,
} from "@/lib/constants";
import { FilterRangeSlider, FilterCheckboxGroup } from "./FilterPrimitives";

export interface CpuFiltersProps {
  sockets: string[];
  setSockets: (v: string[]) => void;
  minCores: number;
  setMaxCores: (v: number) => void;
  maxCores: number;
  setMinCores: (v: number) => void;
  minSpeed: number;
  setMaxSpeed: (v: number) => void;
  maxSpeed: number;
  setMinSpeed: (v: number) => void;
  maxTDP: number;
  setMaxTDP: (v: number) => void;
  isOptionPossible: (
    key: string,
    val: string,
    ignoreCurrentFilters?: boolean,
  ) => boolean;
  incompatibleFilters: Partial<{ sockets: string[] }>;
}

export function CpuFilters({
  sockets,
  setSockets,
  minCores,
  maxCores,
  setMinCores,
  setMaxCores,
  minSpeed,
  maxSpeed,
  setMinSpeed,
  setMaxSpeed,
  maxTDP,
  setMaxTDP,
  isOptionPossible,
  incompatibleFilters,
}: CpuFiltersProps) {
  const toggleSocket = (s: string) => {
    setSockets(
      sockets.includes(s) ? sockets.filter((x) => x !== s) : [...sockets, s],
    );
  };

  return (
    <div className="pt-6 border-t border-dark-border">
      <FilterCheckboxGroup
        title="Socket"
        tooltip="The physical slot on the motherboard that the CPU connects to (e.g., AM5 for AMD, LGA1700 for Intel)."
        options={CPU_SOCKETS}
        selected={sockets}
        onChange={toggleSocket}
        isOptionPossible={(opt) => isOptionPossible("socket", opt)}
        incompatibleOptions={incompatibleFilters.sockets || []}
      />

      <FilterRangeSlider
        title="Speed (GHz)"
        tooltip="The operating frequency of the CPU. Higher means faster processing, but generates more heat."
        min={minSpeed}
        max={maxSpeed}
        setMin={setMinSpeed}
        setMax={setMaxSpeed}
        globalMin={CPU_MIN_SPEED}
        globalMax={CPU_MAX_SPEED}
        step={0.1}
        suffix="GHz"
        isFloat
      />

      <FilterRangeSlider
        title="Cores"
        tooltip="Number of physical processing cores. More cores are better for multitasking and heavy workloads like rendering."
        min={minCores}
        max={maxCores}
        setMin={setMinCores}
        setMax={setMaxCores}
        globalMin={CPU_MIN_CORES}
        globalMax={CPU_MAX_CORES}
        step={2}
      />

      {/* Target Max TDP Slider */}
      <div className="mb-8">
        <FilterRangeSlider
          title="Max TDP (Watts)"
          tooltip="Thermal Design Power. Maximum amount of heat the CPU generates under load. Lower means cooler and less power hungry."
          min={10}
          max={maxTDP}
          setMin={() => {}}
          setMax={setMaxTDP} // Only max bound is adjustable in the original UI
          globalMin={10}
          globalMax={CPU_MAX_TDP}
          step={10}
          suffix="W"
        />
      </div>
    </div>
  );
}
