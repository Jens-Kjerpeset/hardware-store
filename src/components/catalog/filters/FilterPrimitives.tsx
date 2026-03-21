"use client";

import { Check, HelpCircle } from "lucide-react";

export const FilterTooltip = ({ text }: { text: string }) => (
  <div className="group relative inline-flex items-center ml-2 align-middle z-50">
    <HelpCircle className="w-3.5 h-3.5 text-orange-500 cursor-help" />
    <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover:block w-56 p-2 bg-dark-bg border border-dark-border text-xs text-gray-300 shadow-2xl z-50 normal-case tracking-normal text-center pointer-events-none">
      {text}
      <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-dark-border" />
    </div>
  </div>
);

interface FilterRangeSliderProps {
  title: string;
  tooltip: string;
  min: number;
  max: number;
  setMin: (v: number) => void;
  setMax: (v: number) => void;
  globalMin: number;
  globalMax: number;
  step: number | string;
  suffix?: string;
  isFloat?: boolean;
}

export function FilterRangeSlider({
  title,
  tooltip,
  min,
  max,
  setMin,
  setMax,
  globalMin,
  globalMax,
  step,
  suffix = "",
  isFloat = false,
}: FilterRangeSliderProps) {
  const parseStr = (val: string) => (isFloat ? parseFloat(val) : parseInt(val));

  return (
    <div className="mb-8">
      <div className="flex items-center mb-3">
        <h3 className="text-sm font-semibold text-brand-500">{title}</h3>
        <FilterTooltip text={tooltip} />
      </div>
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 bg-dark-bg px-2 py-1 border border-dark-border">
            <input
              type="number"
              value={min}
              onChange={(e) =>
                setMin(
                  Math.min(
                    max,
                    Math.max(globalMin, parseStr(e.target.value) || globalMin),
                  ),
                )
              }
              min={globalMin}
              max={globalMax}
              step={step}
              className="w-12 bg-transparent text-white text-xs text-center focus:outline-none appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
            {suffix && <span className="text-xs text-gray-500">{suffix}</span>}
          </div>
          <span className="text-gray-500">-</span>
          <div className="flex items-center gap-2 bg-dark-bg px-2 py-1 border border-dark-border">
            <input
              type="number"
              value={max}
              onChange={(e) =>
                setMax(
                  Math.max(
                    min,
                    Math.min(globalMax, parseStr(e.target.value) || globalMax),
                  ),
                )
              }
              min={globalMin}
              max={globalMax}
              step={step}
              className="w-12 bg-transparent text-white text-xs text-center focus:outline-none appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
            {suffix && <span className="text-xs text-gray-500">{suffix}</span>}
          </div>
        </div>

        <div className="relative h-1 bg-dark-bg mt-6 border-y border-dark-border flex items-center">
          <div
            className="absolute h-full bg-brand-500"
            style={{
              left: `${((min - globalMin) / (globalMax - globalMin)) * 100}%`,
              right: `${100 - ((max - globalMin) / (globalMax - globalMin)) * 100}%`,
            }}
          />
          <input
            type="range"
            min={globalMin}
            max={globalMax}
            step={step}
            value={min}
            onChange={(e) => {
              const val = parseStr(e.target.value);
              if (val <= max) setMin(val);
            }}
            className="absolute w-full appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-brand-500"
          />
          <input
            type="range"
            min={globalMin}
            max={globalMax}
            step={step}
            value={max}
            onChange={(e) => {
              const val = parseStr(e.target.value);
              if (val >= min) setMax(val);
            }}
            className="absolute w-full appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-brand-500"
          />
        </div>
      </div>
    </div>
  );
}

interface FilterCheckboxGroupProps {
  title: string;
  tooltip: string;
  options: string[];
  selected: string[];
  onChange: (val: string) => void;
  isOptionPossible: (opt: string) => boolean;
  incompatibleOptions?: string[];
  renderOptionLabel?: (opt: string) => React.ReactNode;
}

export function FilterCheckboxGroup({
  title,
  tooltip,
  options,
  selected,
  onChange,
  isOptionPossible,
  incompatibleOptions = [],
  renderOptionLabel,
}: FilterCheckboxGroupProps) {
  return (
    <div className="mb-8">
      <div className="flex items-center mb-3">
        <h3 className="text-sm font-semibold text-brand-500">{title}</h3>
        <FilterTooltip text={tooltip} />
      </div>
      <div className="space-y-2">
        {options.map((opt) => {
          if (!isOptionPossible(opt)) return null;
          const isChecked = selected.includes(opt);
          const isFilterIncompatible = incompatibleOptions.includes(opt);
          // if true, we fade it out in the UI
          const isDisabled = isFilterIncompatible;

          return (
            <label
              key={opt}
              className={`flex items-center gap-3 select-none ${isDisabled ? "opacity-40 cursor-not-allowed grayscale" : "cursor-pointer group"} transition-colors`}
            >
              <input
                type="checkbox"
                checked={isChecked}
                onChange={() => {
                  if (!isDisabled) onChange(opt);
                }}
                className="hidden"
              />
              <div
                className={`w-4 h-4 border flex items-center justify-center transition-all ${isChecked ? "bg-brand-500 border-brand-500" : "border-gray-500 group-hover:border-brand-400"}`}
              >
                {isChecked && <Check className="w-3 h-3 text-white" />}
              </div>
              <span
                className={`text-sm transition-colors ${isChecked ? "text-white font-medium" : "text-gray-400 group-hover:text-gray-200"}`}
              >
                {renderOptionLabel ? renderOptionLabel(opt) : opt}
              </span>
            </label>
          );
        })}
      </div>
    </div>
  );
}
