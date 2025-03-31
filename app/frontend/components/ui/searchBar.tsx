import React from "react";

/**
 * Props for the SearchBar component
 * @interface SearchBarProps
 * @property {string} placeholder - Placeholder text for the input
 * @property {string} value - Current input value
 * @property {React.ChangeEventHandler<HTMLInputElement>} onChange - Handler for input changes
 * @property {() => void} onSearch - Handler for search action (click or Enter key)
 */
interface SearchBarProps {
  placeholder: string;
  value: string;
  onChange: React.ChangeEventHandler<HTMLInputElement>;
  onSearch: () => void;
}

/**
 * Search input component with icon
 * Features:
 * - Search icon button
 * - Enter key support
 * - Character limit (100)
 * - Focus states
 * - Responsive design
 * 
 * @param {SearchBarProps} props - Component props
 * @returns {JSX.Element} Search input with icon
 */
export default function SearchBar({ placeholder, value, onChange, onSearch }: SearchBarProps) {
  return (
    <div className="relative">
      <span
        className="select-none material-icons absolute left-3 top-2.5 text-zinc-400 cursor-pointer"
        onClick={onSearch}
      >
        search
      </span>
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            onSearch();
          }
        }}
        maxLength={100}
        className="w-full pl-10 pr-4 py-2 bg-zinc-900 border border-zinc-800 rounded-md text-white placeholder:text-zinc-400 focus:outline-none focus:border-zinc-700"
      />
    </div>
  );
}
