"use client";

import {
  STORAGE_TYPES,
  STORAGE_CAPACITIES,
  STORAGE_FORM_FACTORS,
  STORAGE_INTERFACES,
  STORAGE_MIN_READ_SPEED,
  STORAGE_MAX_READ_SPEED,
} from "@/lib/constants";
import { FilterRangeSlider, FilterCheckboxGroup } from "./FilterPrimitives";

export interface StorageFiltersProps {
  storageTypes: string[];
  setStorageTypes: (v: string[]) => void;
  storageCapacities: number[];
  setStorageCapacities: (v: number[]) => void;
  storageFormFactors: string[];
  setStorageFormFactors: (v: string[]) => void;
  storageInterfaces: string[];
  setStorageInterfaces: (v: string[]) => void;
  minReadSpeed: number;
  setMaxReadSpeed: (v: number) => void;
  maxReadSpeed: number;
  setMinReadSpeed: (v: number) => void;
  isOptionPossible: (
    key: string,
    val: string | number,
    ignoreCurrentFilters?: boolean,
  ) => boolean;
}

export function StorageFilters({
  storageTypes,
  setStorageTypes,
  storageCapacities,
  setStorageCapacities,
  storageFormFactors,
  setStorageFormFactors,
  storageInterfaces,
  setStorageInterfaces,
  minReadSpeed,
  maxReadSpeed,
  setMinReadSpeed,
  setMaxReadSpeed,
  isOptionPossible,
}: StorageFiltersProps) {
  const toggleType = (t: string) =>
    setStorageTypes(
      storageTypes.includes(t)
        ? storageTypes.filter((x) => x !== t)
        : [...storageTypes, t],
    );
  const toggleCapacity = (c: number) =>
    setStorageCapacities(
      storageCapacities.includes(c)
        ? storageCapacities.filter((x) => x !== c)
        : [...storageCapacities, c],
    );
  const toggleFormFactor = (f: string) =>
    setStorageFormFactors(
      storageFormFactors.includes(f)
        ? storageFormFactors.filter((x) => x !== f)
        : [...storageFormFactors, f],
    );
  const toggleInterface = (i: string) =>
    setStorageInterfaces(
      storageInterfaces.includes(i)
        ? storageInterfaces.filter((x) => x !== i)
        : [...storageInterfaces, i],
    );

  return (
    <div className="pt-6 border-t border-dark-border">
      <FilterCheckboxGroup
        title="Storage Type"
        tooltip="NVMe SSDs are the fastest, SATA SSDs are good for bulk storage, HDDs are slow but cheap for mass storage."
        options={STORAGE_TYPES}
        selected={storageTypes}
        onChange={toggleType}
        isOptionPossible={(opt) => isOptionPossible("storageType", opt)}
      />

      <FilterCheckboxGroup
        title="Capacity"
        tooltip="Total storage space."
        options={STORAGE_CAPACITIES.map((c) => c.toString())}
        selected={storageCapacities.map((c) => c.toString())}
        onChange={(val) => toggleCapacity(parseInt(val))}
        isOptionPossible={(opt) =>
          isOptionPossible("storageCapacity", parseInt(opt))
        }
        renderOptionLabel={(opt) =>
          parseInt(opt) >= 1000 ? `${parseInt(opt) / 1000}TB` : `${opt}GB`
        }
      />

      <FilterCheckboxGroup
        title="Form Factor"
        tooltip="M.2 drives mount straight into the motherboard. 2.5/3.5 inch drives need cables and mounting bays."
        options={STORAGE_FORM_FACTORS}
        selected={storageFormFactors}
        onChange={toggleFormFactor}
        isOptionPossible={(opt) => isOptionPossible("storageFormFactor", opt)}
      />

      <FilterCheckboxGroup
        title="Interface"
        tooltip="PCIe Gen4/Gen5 are the fastest interfaces for NVMe drives."
        options={STORAGE_INTERFACES}
        selected={storageInterfaces}
        onChange={toggleInterface}
        isOptionPossible={(opt) => isOptionPossible("storageInterface", opt)}
      />

      <FilterRangeSlider
        title="Read Speed (MB/s)"
        tooltip="Sequential read speed of the drive. Higher means faster game loading times and faster large file transfers."
        min={minReadSpeed}
        max={maxReadSpeed}
        setMin={setMinReadSpeed}
        setMax={setMaxReadSpeed}
        globalMin={STORAGE_MIN_READ_SPEED}
        globalMax={STORAGE_MAX_READ_SPEED}
        step={100}
      />
    </div>
  );
}
