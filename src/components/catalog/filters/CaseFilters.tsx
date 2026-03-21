"use client";

import { MOTHERBOARD_FORM_FACTORS } from "@/lib/constants";
import { FilterCheckboxGroup } from "./FilterPrimitives";

export interface CaseFiltersProps {
  caseFormFactors: string[];
  setCaseFormFactors: (v: string[]) => void;
  caseMaxMainboards: string[];
  setCaseMaxMainboards: (v: string[]) => void;
  caseColors: string[];
  setCaseColors: (v: string[]) => void;
  caseSidePanels: string[];
  setCaseSidePanels: (v: string[]) => void;
  isOptionPossible: (
    key: string,
    val: string | number,
    ignoreCurrentFilters?: boolean,
  ) => boolean;
}

export function CaseFilters({
  caseFormFactors,
  setCaseFormFactors,
  caseMaxMainboards,
  setCaseMaxMainboards,
  caseColors,
  setCaseColors,
  caseSidePanels,
  setCaseSidePanels,
  isOptionPossible,
}: CaseFiltersProps) {
  const toggleFormFactor = (f: string) =>
    setCaseFormFactors(
      caseFormFactors.includes(f)
        ? caseFormFactors.filter((x) => x !== f)
        : [...caseFormFactors, f],
    );
  const toggleMaxMainboard = (m: string) =>
    setCaseMaxMainboards(
      caseMaxMainboards.includes(m)
        ? caseMaxMainboards.filter((x) => x !== m)
        : [...caseMaxMainboards, m],
    );
  const toggleColor = (c: string) =>
    setCaseColors(
      caseColors.includes(c)
        ? caseColors.filter((x) => x !== c)
        : [...caseColors, c],
    );
  const toggleSidePanel = (s: string) =>
    setCaseSidePanels(
      caseSidePanels.includes(s)
        ? caseSidePanels.filter((x) => x !== s)
        : [...caseSidePanels, s],
    );

  // Case colors usually mapped from db - a rough set:
  const CASE_COLORS = ["Black", "White", "Grey", "Silver"];
  const CASE_SIDE_PANELS = ["Tempered Glass", "Mesh", "Solid"];
  const CASE_FORM_FACTORS = [
    "Mid Tower",
    "Full Tower",
    "Mini ITX Desktop",
    "MicroATX Mid Tower",
  ];

  return (
    <div className="pt-6 border-t border-dark-border">
      <FilterCheckboxGroup
        title="Motherboard Compatibility"
        tooltip="The maximum size motherboard this case supports. ATX is standard."
        options={MOTHERBOARD_FORM_FACTORS}
        selected={caseMaxMainboards}
        onChange={toggleMaxMainboard}
        isOptionPossible={(opt) => isOptionPossible("caseMaxMainboard", opt)}
      />

      <FilterCheckboxGroup
        title="Form Factor"
        tooltip="The overall size category of the case. Mid Tower is the most common."
        options={CASE_FORM_FACTORS}
        selected={caseFormFactors}
        onChange={toggleFormFactor}
        isOptionPossible={(opt) => isOptionPossible("caseFormFactor", opt)}
      />

      <FilterCheckboxGroup
        title="Side Panel Window"
        tooltip="Tempered glass lets you see inside, solid panels are often quieter, mesh panels offer better airflow."
        options={CASE_SIDE_PANELS}
        selected={caseSidePanels}
        onChange={toggleSidePanel}
        isOptionPossible={(opt) => isOptionPossible("caseSidePanel", opt)}
      />

      <FilterCheckboxGroup
        title="Primary Color"
        tooltip="The main exterior color of the case."
        options={CASE_COLORS}
        selected={caseColors}
        onChange={toggleColor}
        isOptionPossible={(opt) => isOptionPossible("caseColor", opt)}
      />
    </div>
  );
}
