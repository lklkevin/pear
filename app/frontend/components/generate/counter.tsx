import { useState, useEffect } from "react";
import { DM_Mono } from "next/font/google";

// Load the DM Mono font from Google Fonts
const dmMono = DM_Mono({
  subsets: ["latin"],
  weight: "500",
});

/**
 * Props for the Counter component
 * @interface CounterProps
 * @property {number} value - Current counter value
 * @property {Function} onChange - Callback function when value changes
 * @property {number} [min=0] - Minimum allowed value
 * @property {number} [max=100] - Maximum allowed value
 * @property {number} [step=1] - Increment/decrement step size
 */
interface CounterProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
}

/**
 * Numeric counter component with increment/decrement buttons
 * Allows direct input with validation against min/max boundaries
 * Provides accessibility features for screen readers
 * 
 * @param {CounterProps} props - Component props
 * @returns {JSX.Element} - Rendered counter with buttons and input field
 */
export default function Counter({
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
}: CounterProps) {
  // Track the raw input value separately
  const [inputValue, setInputValue] = useState(value.toString());

  // Update the input value when the prop value changes
  useEffect(() => {
    setInputValue(value.toString());
  }, [value]);

  /**
   * Increases the counter value by one step
   * Respects the maximum boundary
   */
  const increment = () => {
    onChange(Math.min(value + step, max));
  };

  /**
   * Decreases the counter value by one step
   * Respects the minimum boundary
   */
  const decrement = () => {
    onChange(Math.max(value - step, min));
  };

  /**
   * Handles changes to the input field
   * Updates local state immediately but parent state only if valid
   * 
   * @param {React.ChangeEvent<HTMLInputElement>} e - Input change event
   */
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;

    // Allow empty input or partial input while typing
    setInputValue(rawValue);

    // Only update parent state if it's a valid number
    if (rawValue !== "" && !isNaN(Number(rawValue))) {
      const newValue = Number.parseInt(rawValue, 10);
      onChange(Math.max(min, Math.min(newValue, max)));
    }
  };

  /**
   * Handles input field blur event
   * Ensures the final value is valid and within boundaries
   * Resets to minimum value if input is invalid
   */
  const handleBlur = () => {
    // When the input loses focus, ensure we have a valid value
    if (inputValue === "" || isNaN(Number(inputValue))) {
      setInputValue(min.toString());
      onChange(min);
    } else {
      const newValue = Number.parseInt(inputValue, 10);
      const boundedValue = Math.max(min, Math.min(newValue, max));
      setInputValue(boundedValue.toString());
      onChange(boundedValue);
    }
  };

  return (
    <div className="flex items-center justify-end gap-3 w-full max-w-[240px]">
      <button
        className="select-none flex items-center justify-center w-9 h-9 border border-zinc-800 rounded bg-zinc-950 hover:bg-zinc-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-zinc-950"
        onClick={decrement}
        disabled={value <= min}
        aria-label="Decrease value"
      >
        <span className="material-icons text-zinc-400">remove</span>
      </button>

      <input
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        value={inputValue}
        onChange={handleInputChange}
        onBlur={handleBlur}
        className={`sm:text-lg ${dmMono.className} bg-zinc-900 w-16 h-9 px-2 border border-zinc-800 rounded text-center focus:outline-none focus:ring-1 focus:ring-zinc-500 focus:border-transparent text-white`}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={value}
        role="spinbutton"
      />

      <button
        className="select-none flex items-center justify-center w-9 h-9 border border-zinc-800 rounded bg-zinc-950 hover:bg-zinc-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-zinc-950"
        onClick={increment}
        disabled={value >= max}
        aria-label="Increase value"
      >
        <span className="material-icons text-zinc-400">add</span>
      </button>
    </div>
  );
}
