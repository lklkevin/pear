import React from "react";

/**
 * Type defining the available visibility options for content
 * @typedef {"private" | "public" | "unsaved"} Visibility
 */
export type Visibility = "private" | "public" | "unsaved";

/**
 * Props for the VisibilityOption component
 * @interface VisibilityOptionProps
 * @property {Visibility} option - The visibility option value
 * @property {boolean} selected - Whether this option is currently selected
 * @property {string} label - Main text label for the option
 * @property {string} subText - Secondary descriptive text for the option
 * @property {Function} onChange - Callback function when the option is selected
 */
interface VisibilityOptionProps {
  option: Visibility;
  selected: boolean;
  label: string;
  subText: string;
  onChange: () => void;
}

/**
 * Radio button component for selecting content visibility options
 * Provides styled radio inputs with labels and descriptions
 * 
 * @param {VisibilityOptionProps} props - Component props
 * @returns {JSX.Element} - Rendered radio option with label and styling
 */
export function VisibilityOption({
  selected,
  label,
  subText,
  onChange,
}: VisibilityOptionProps) {
  // Apply different border styling based on selection state
  const borderClass = selected
    ? "border border-emerald-500"
    : "border border-zinc-800";
  return (
    <label
      className={`min-w-28 flex-1 ${borderClass} flex items-center gap-3 p-3 rounded-md pl-4 cursor-pointer hover:bg-zinc-800 transition-colors`}
    >
      <div className="relative flex items-center">
        <input
          type="radio"
          name="visibility"
          checked={selected}
          onChange={onChange}
          className="appearance-none w-4 h-4 rounded-full border-2 border-zinc-600 checked:border-emerald-500 checked:bg-emerald-500 focus:border-emerald-500 focus:outline-none transition-colors cursor-pointer"
          style={{
            backgroundImage: selected ? "none" : "none",
            backgroundColor: selected ? "rgb(16 185 129)" : "transparent",
            borderColor: selected ? "rgb(16 185 129)" : undefined,
          }}
        />
        <span className="absolute inset-0 flex items-center justify-center pointer-events-none">
          {selected && (
            <span className="block w-1.5 h-1.5 rounded-full bg-white" />
          )}
        </span>
      </div>
      <div className="ml-1">
        <div className="font-medium">{label}</div>
        <div className="text-xs text-zinc-400">{subText}</div>
      </div>
    </label>
  );
}
