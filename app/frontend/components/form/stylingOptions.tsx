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
    class: "bg-blue-700",
    outline: "ring-blue-300",
    hex: "#1d4ed8",
  },
  {
    value: "purple",
    class: "bg-purple-700",
    outline: "ring-purple-300",
    hex: "#6b21a8",
  },
  {
    value: "pink",
    class: "bg-pink-700",
    outline: "ring-pink-300",
    hex: "#be185d",
  },
  {
    value: "red",
    class: "bg-red-700",
    outline: "ring-red-300",
    hex: "#b91c1c",
  },
  {
    value: "orange",
    class: "bg-orange-700",
    outline: "ring-orange-300",
    hex: "#c2410c",
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
