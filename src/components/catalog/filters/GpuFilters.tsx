"use client";

import {
  GPU_MIN_VRAM,
  GPU_MAX_VRAM,
  GPU_MIN_PSU,
  GPU_MAX_PSU,
  GPU_MAX_LENGTH,
  GPU_INTERFACES,
  GPU_CHIPSETS,
} from "@/lib/constants";
import { FilterRangeSlider, FilterCheckboxGroup } from "./FilterPrimitives";

export interface GpuFiltersProps {
  chipsets: string[];
  setChipsets: (v: string[]) => void;
  interfaces: string[];
  setInterfaces: (v: string[]) => void;
  minVram: number;
  setMaxVram: (v: number) => void;
  maxVram: number;
  setMinVram: (v: number) => void;
  minPsu: number;
  setMaxPsu: (v: number) => void;
  maxPsu: number;
  setMinPsu: (v: number) => void;
  maxLength: number;
  setMaxLength: (v: number) => void;
  isOptionPossible: (
    key: string,
    val: string,
    ignoreCurrentFilters?: boolean,
  ) => boolean;
  incompatibleFilters: Partial<{ [key: string]: string[] }>;
}

export function GpuFilters({
  chipsets,
  setChipsets,
  interfaces,
  setInterfaces,
  minVram,
  maxVram,
  setMinVram,
  setMaxVram,
  minPsu,
  maxPsu,
  setMinPsu,
  setMaxPsu,
  maxLength,
  setMaxLength,
  isOptionPossible,
  incompatibleFilters,
}: GpuFiltersProps) {
  const toggleChipset = (c: string) =>
    setChipsets(
      chipsets.includes(c) ? chipsets.filter((x) => x !== c) : [...chipsets, c],
    );
  const toggleInterface = (i: string) =>
    setInterfaces(
      interfaces.includes(i)
        ? interfaces.filter((x) => x !== i)
        : [...interfaces, i],
    );

  return (
    <div className="pt-6 border-t border-dark-border">
      <FilterCheckboxGroup
        title="Chipset Series"
        tooltip="The core GPU processor family (e.g., RTX 40-series, RX 7000-series)."
        options={GPU_CHIPSETS}
        selected={chipsets}
        onChange={toggleChipset}
        isOptionPossible={(opt) => isOptionPossible("chipset", opt)}
        incompatibleOptions={[]}
      />

      <FilterRangeSlider
        title="VRAM (GB)"
        tooltip="Video RAM. Essential for high resolution gaming (1440p/4K) and rendering large textures."
        min={minVram}
        max={maxVram}
        setMin={setMinVram}
        setMax={setMaxVram}
        globalMin={GPU_MIN_VRAM}
        globalMax={GPU_MAX_VRAM}
        step={2}
        suffix="GB"
      />

      <FilterRangeSlider
        title="Max Length (mm)"
        tooltip="Physical length of the graphics card. Crucial to check against your PC Case maximum GPU length clearance."
        min={100}
        max={maxLength}
        setMin={() => {}}
        setMax={setMaxLength}
        globalMin={100}
        globalMax={GPU_MAX_LENGTH}
        step={10}
        suffix="mm"
      />

      <FilterRangeSlider
        title="Recommended PSU (Watts)"
        tooltip="The minimum power supply wattage recommended by the manufacturer to safely run this graphics card."
        min={minPsu}
        max={maxPsu}
        setMin={setMinPsu}
        setMax={setMaxPsu}
        globalMin={GPU_MIN_PSU}
        globalMax={GPU_MAX_PSU}
        step={50}
        suffix="W"
      />

      <FilterCheckboxGroup
        title="PCIe Interface"
        tooltip="The connection standard. PCIe 4.0 is modern standard, backwards compatible with 3.0."
        options={GPU_INTERFACES}
        selected={interfaces}
        onChange={toggleInterface}
        isOptionPossible={(opt) => isOptionPossible("interface", opt)}
        incompatibleOptions={incompatibleFilters.interfaces || []}
      />
    </div>
  );
}
