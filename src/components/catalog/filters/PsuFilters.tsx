"use client";

import {
  PSU_MIN_WATTAGE,
  PSU_MAX_WATTAGE,
  PSU_EFFICIENCIES,
  PSU_MODULARITIES,
  PSU_FORM_FACTORS,
} from "@/lib/constants";
import { FilterRangeSlider, FilterCheckboxGroup } from "./FilterPrimitives";

export interface PsuFiltersProps {
  minWattage: number;
  setMaxWattage: (v: number) => void;
  maxWattage: number;
  setMinWattage: (v: number) => void;
  psuEfficiencies: string[];
  setPsuEfficiencies: (v: string[]) => void;
  psuModularities: string[];
  setPsuModularities: (v: string[]) => void;
  psuFormFactors: string[];
  setPsuFormFactors: (v: string[]) => void;
  isOptionPossible: (
    key: string,
    val: string | number,
    ignoreCurrentFilters?: boolean,
  ) => boolean;
}

export function PsuFilters({
  minWattage,
  maxWattage,
  setMinWattage,
  setMaxWattage,
  psuEfficiencies,
  setPsuEfficiencies,
  psuModularities,
  setPsuModularities,
  psuFormFactors,
  setPsuFormFactors,
  isOptionPossible,
}: PsuFiltersProps) {
  const toggleEfficiency = (e: string) =>
    setPsuEfficiencies(
      psuEfficiencies.includes(e)
        ? psuEfficiencies.filter((x) => x !== e)
        : [...psuEfficiencies, e],
    );
  const toggleModularity = (m: string) =>
    setPsuModularities(
      psuModularities.includes(m)
        ? psuModularities.filter((x) => x !== m)
        : [...psuModularities, m],
    );
  const toggleFormFactor = (f: string) =>
    setPsuFormFactors(
      psuFormFactors.includes(f)
        ? psuFormFactors.filter((x) => x !== f)
        : [...psuFormFactors, f],
    );

  return (
    <div className="pt-6 border-t border-dark-border">
      <FilterRangeSlider
        title="Wattage (W)"
        tooltip="Total power output. Ensure your PSU has enough wattage to support all your components, especially the GPU."
        min={minWattage}
        max={maxWattage}
        setMin={setMinWattage}
        setMax={setMaxWattage}
        globalMin={PSU_MIN_WATTAGE}
        globalMax={PSU_MAX_WATTAGE}
        step={50}
      />

      <FilterCheckboxGroup
        title="Efficiency Rating"
        tooltip="Higher efficiency means less power wasted as heat. 80+ Gold or better is recommended for most builds."
        options={PSU_EFFICIENCIES}
        selected={psuEfficiencies}
        onChange={toggleEfficiency}
        isOptionPossible={(opt) => isOptionPossible("psuEfficiency", opt)}
      />

      <FilterCheckboxGroup
        title="Modularity"
        tooltip="Full-modular allows removing all cables. Semi-modular has essential cables attached. Non-modular has all cables attached permanently."
        options={PSU_MODULARITIES}
        selected={psuModularities}
        onChange={toggleModularity}
        isOptionPossible={(opt) => isOptionPossible("psuModularity", opt)}
      />

      <FilterCheckboxGroup
        title="Form Factor"
        tooltip="ATX is the standard size. SFX and SFX-L are smaller sizes for compact mini-ITX builds."
        options={PSU_FORM_FACTORS}
        selected={psuFormFactors}
        onChange={toggleFormFactor}
        isOptionPossible={(opt) => isOptionPossible("psuFormFactor", opt)}
      />
    </div>
  );
}
