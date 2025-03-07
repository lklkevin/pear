import React from "react";

export type Visibility = "private" | "public" | "unsaved";

interface VisibilityOptionProps {
  option: Visibility;
  selected: boolean;
  label: string;
  subText: string;
  onChange: () => void;
}

export function VisibilityOption({
  selected,
  label,
  subText,
  onChange,
}: VisibilityOptionProps) {
  const borderClass = selected ? "border border-emerald-500" : "border border-zinc-800";
  return (
    <label
      className={`flex-1 ${borderClass} flex items-center gap-3 p-3 rounded-lg pl-4 cursor-pointer hover:bg-zinc-800`}
    >
      <div className="relative flex items-center">
        <input
          type="radio"
          name="visibility"
          checked={selected}
          onChange={onChange}
          className="appearance-none w-4 h-4 rounded-full border-2 border-zinc-600 checked:border-emerald-500 checked:bg-emerald-500 transition-colors cursor-pointer"
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
