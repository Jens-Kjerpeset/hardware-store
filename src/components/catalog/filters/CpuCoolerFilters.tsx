"use client";

import {
  COOLER_TYPES,
  COOLER_RADIATOR_SIZES,
  COOLER_COLORS,
  MIN_COOLER_NOISE,
  MAX_COOLER_NOISE,
  MIN_COOLER_HEIGHT,
  MAX_COOLER_HEIGHT,
  MOTHERBOARD_SOCKETS,
} from "@/lib/constants";
import { FilterRangeSlider, FilterCheckboxGroup } from "./FilterPrimitives";

export interface CpuCoolerFiltersProps {
  coolerTypes: string[];
  setCoolerTypes: (v: string[]) => void;
  sockets: string[];
  setSockets: (v: string[]) => void;
  coolerRadiatorSizes: number[];
  setCoolerRadiatorSizes: (v: number[]) => void;
  coolerColors: string[];
  setCoolerColors: (v: string[]) => void;
  minCoolerNoise: number;
  setMaxCoolerNoise: (v: number) => void;
  maxCoolerNoise: number;
  setMinCoolerNoise: (v: number) => void;
  minCoolerHeight: number;
  setMaxCoolerHeight: (v: number) => void;
  maxCoolerHeight: number;
  setMinCoolerHeight: (v: number) => void;
  isOptionPossible: (
    key: string,
    val: string | number,
    ignoreCurrentFilters?: boolean,
  ) => boolean;
  incompatibleFilters: Partial<{ sockets: string[] }>;
}

export function CpuCoolerFilters({
  coolerTypes,
  setCoolerTypes,
  sockets,
  setSockets,
  coolerRadiatorSizes,
  setCoolerRadiatorSizes,
  coolerColors,
  setCoolerColors,
  minCoolerNoise,
  maxCoolerNoise,
  setMinCoolerNoise,
  setMaxCoolerNoise,
  minCoolerHeight,
  maxCoolerHeight,
  setMinCoolerHeight,
  setMaxCoolerHeight,
  isOptionPossible,
  incompatibleFilters,
}: CpuCoolerFiltersProps) {
  const toggleType = (t: string) =>
    setCoolerTypes(
      coolerTypes.includes(t)
        ? coolerTypes.filter((x) => x !== t)
        : [...coolerTypes, t],
    );
  const toggleSocket = (s: string) =>
    setSockets(
      sockets.includes(s) ? sockets.filter((x) => x !== s) : [...sockets, s],
    );
  const toggleRadiatorSize = (r: number) =>
    setCoolerRadiatorSizes(
      coolerRadiatorSizes.includes(r)
        ? coolerRadiatorSizes.filter((x) => x !== r)
        : [...coolerRadiatorSizes, r],
    );
  const toggleColor = (c: string) =>
    setCoolerColors(
      coolerColors.includes(c)
        ? coolerColors.filter((x) => x !== c)
        : [...coolerColors, c],
    );

  return (
    <div className="pt-6 border-t border-dark-border">
      <FilterCheckboxGroup
        title="Cooler Type"
        tooltip="Air coolers use metal heatsinks and fans. Liquid coolers (AIOs) use pumps and radiators for heat dissipation."
        options={COOLER_TYPES}
        selected={coolerTypes}
        onChange={toggleType}
        isOptionPossible={(opt) => isOptionPossible("coolerType", opt)}
      />

      <FilterCheckboxGroup
        title="Supported Sockets"
        tooltip="The CPU socket this cooler can be mounted on (e.g. AM5 for AMD, LGA1700 for Intel)."
        options={MOTHERBOARD_SOCKETS}
        selected={sockets}
        onChange={toggleSocket}
        isOptionPossible={(opt) => isOptionPossible("socket", opt)}
        incompatibleOptions={incompatibleFilters.sockets || []}
      />

      {(!coolerTypes.includes("Air") ||
        coolerTypes.includes("Liquid") ||
        coolerTypes.length === 0) && (
        <FilterCheckboxGroup
          title="Radiator Size (mm)"
          tooltip="For liquid coolers. Larger radiators (240mm+) generally dissipate more heat but take up more case space."
          options={COOLER_RADIATOR_SIZES.map((r) => r.toString())}
          selected={coolerRadiatorSizes.map((r) => r.toString())}
          onChange={(val) => toggleRadiatorSize(parseInt(val))}
          isOptionPossible={(opt) =>
            isOptionPossible("coolerRadiatorSize", parseInt(opt))
          }
          renderOptionLabel={(opt) => `${opt}mm`}
        />
      )}

      {(!coolerTypes.includes("Liquid") ||
        coolerTypes.includes("Air") ||
        coolerTypes.length === 0) && (
        <FilterRangeSlider
          title="Cooler Height (mm)"
          tooltip="For air coolers. Make sure your PC case has enough clearance for the cooler height."
          min={minCoolerHeight}
          max={maxCoolerHeight}
          setMin={setMinCoolerHeight}
          setMax={setMaxCoolerHeight}
          globalMin={MIN_COOLER_HEIGHT}
          globalMax={MAX_COOLER_HEIGHT}
          step={5}
        />
      )}

      <FilterRangeSlider
        title="Noise Level (dBA)"
        tooltip="The noise level of the cooler at maximum RPM. Lower is quieter."
        min={minCoolerNoise}
        max={maxCoolerNoise}
        setMin={setMinCoolerNoise}
        setMax={setMaxCoolerNoise}
        globalMin={MIN_COOLER_NOISE}
        globalMax={MAX_COOLER_NOISE}
        step={1}
      />

      <FilterCheckboxGroup
        title="Color"
        tooltip="The primary color of the cooling block and fans."
        options={COOLER_COLORS}
        selected={coolerColors}
        onChange={toggleColor}
        isOptionPossible={(opt) => isOptionPossible("coolerColor", opt)}
      />
    </div>
  );
}
