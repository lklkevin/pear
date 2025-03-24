import React from "react";

interface SearchBarProps {
  placeholder: string;
  value: string;
  onChange: React.ChangeEventHandler<HTMLInputElement>;
  onSearch: () => void;
}

export default function SearchBar({ placeholder, value, onChange, onSearch }: SearchBarProps) {
  return (
    <div className="relative">
      <span
        className="material-icons absolute left-3 top-2.5 text-zinc-400 cursor-pointer"
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
