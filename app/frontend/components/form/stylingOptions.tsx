export type Color = "teal" | "blue" | "purple" | "red" | "orange" | "gray" | "pink";

interface ColorOption {
  value: Color;
  class: string;
  outline: string;
  hex: string;
}

export const colors: ColorOption[] = [
  {
    value: "teal",
    class: "bg-cyan-700",
    outline: "ring-cyan-300",
    hex: "#0f766e",
  },
  {
    value: "blue",
    class: "bg-indigo-700",
    outline: "ring-indigo-300",
    hex: "#4338ca",
  },
  {
    value: "purple",
    class: "bg-violet-700",
    outline: "ring-violet-300",
    hex: "#6d28d9",
  },
  {
    value: "pink",
    class: "bg-rose-700",
    outline: "ring-rose-300",
    hex: "#be123c",
  },
  {
    value: "red",
    class: "bg-red-700",
    outline: "ring-red-300",
    hex: "#b91c1c",
  },
  {
    value: "orange",
    class: "bg-amber-700",
    outline: "ring-amber-300",
    hex: "#b45309",
  },
  {
    value: "gray",
    class: "bg-zinc-700",
    outline: "ring-zinc-300",
    hex: "#3f3f46",
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
