export type Color = "teal" | "cyan" | "sky" | "blue" | "indigo" | "violet" | "purple";

interface ColorOption {
  value: Color;
  class: string;
  outline: string;
  hex: string;
}

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

interface StylingOptionsProps {
  selectedColor: Color;
  setSelectedColor: (color: Color) => void;
}

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
