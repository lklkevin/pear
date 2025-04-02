/**
 * Type defining the available color options for styling
 * @typedef {"teal" | "cyan" | "sky" | "blue" | "indigo" | "violet" | "purple"} Color
 */
export type Color = "teal" | "cyan" | "sky" | "blue" | "indigo" | "violet" | "purple";

/**
 * Interface for color option configuration
 * @interface ColorOption
 * @property {Color} value - The color identifier
 * @property {string} class - Tailwind CSS class for the color background
 * @property {string} outline - Tailwind CSS class for the color outline/ring
 * @property {string} hex - Hex color code for the color
 */
interface ColorOption {
  value: Color;
  class: string;
  outline: string;
  hex: string;
}

/**
 * Array of predefined color options available for selection
 */
export const colors: ColorOption[] = [
  {
    value: "teal",
    class: "bg-teal-700",
    outline: "ring-teal-300",
    hex: "#0f766e",
  },
  {
    value: "cyan",
    class: "bg-cyan-700",
    outline: "ring-cyan-300",
    hex: "#0e7490",
  },
  {
    value: "sky",
    class: "bg-sky-700",
    outline: "ring-sky-300",
    hex: "#0369a1",
  },
  {
    value: "blue",
    class: "bg-blue-700",
    outline: "ring-blue-300",
    hex: "#1d4ed8",
  },
  {
    value: "indigo",
    class: "bg-indigo-700",
    outline: "ring-indigo-300",
    hex: "#4338ca",
  },
  {
    value: "violet",
    class: "bg-violet-700",
    outline: "ring-violet-300",
    hex: "#6d28d9",
  },
  {
    value: "purple",
    class: "bg-purple-700",
    outline: "ring-purple-300",
    hex: "#7e22ce",
  },
];

/**
 * Props for the StylingOptions component
 * @interface StylingOptionsProps
 * @property {Color} selectedColor - Currently selected color
 * @property {Function} setSelectedColor - Callback function to update the selected color
 */
interface StylingOptionsProps {
  selectedColor: Color;
  setSelectedColor: (color: Color) => void;
}

/**
 * Component for displaying and selecting color styling options
 * Renders a row of color buttons with the currently selected color highlighted
 * 
 * @param {StylingOptionsProps} props - Component props
 * @returns {JSX.Element} - Rendered styling options with color selection buttons
 */
export function StylingOptions({ selectedColor, setSelectedColor }: StylingOptionsProps) {
  return (
    <div className="flex flex-row justify-between mt-4 sm:mt-8 mb-2 sm:mb-4">
      <h3 className="text-lg sm:text-xl font-semibold">Styling</h3>
      <div className="flex gap-2 items-center mr-0.5">
        {colors.map((color) => (
          <button
            key={color.value}
            onClick={() => setSelectedColor(color.value)}
            className={`w-5 h-5 rounded-full flex items-center justify-center transition-transform ${
              selectedColor === color.value ? `ring-2 ${color.outline}` : ""
            }`}
          >
            <div className={`w-full h-full rounded-full ${color.class}`} />
          </button>
        ))}
      </div>
    </div>
  );
}
