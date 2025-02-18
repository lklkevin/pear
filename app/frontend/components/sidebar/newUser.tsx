import { useState } from "react";
import Link from "next/link";
import Button from "../ui/buttonGreen";

// Define types for visibility and color selection
type Visibility = "private" | "public";
type Color = "teal" | "blue" | "purple" | "red" | "brown" | "gray" | "pink";

export default function Sidebar() {
  // State for managing visibility setting (Private/Public)
  const [visibility, setVisibility] = useState<Visibility>("private");

  // State for managing selected styling color
  const [selectedColor, setSelectedColor] = useState<Color>("teal");

  // Array of available color options with their corresponding CSS classes
  const colors: { value: Color; class: string }[] = [
    { value: "teal", class: "bg-teal-700" },
    { value: "blue", class: "bg-blue-700" },
    { value: "purple", class: "bg-purple-700" },
    { value: "pink", class: "bg-pink-700" },
    { value: "red", class: "bg-red-700" },
    { value: "brown", class: "bg-amber-600" },
    { value: "gray", class: "bg-zinc-700" },
  ];

  return (
    <div>
      {/* Information Text */}
      <p className="text-zinc-300 my-4">Enjoy your new exam!</p>

      {/* Login/Signup Call to Action */}
      <p className="text-zinc-300 mb-6">
        If you want to save it for later or share it with the world, first{" "}
        <Link href="/signup" className="text-emerald-500 hover:text-emerald-400">
          sign up
        </Link>{" "}
        or{" "}
        <Link href="/login" className="text-emerald-500 hover:text-emerald-400">
          login
        </Link>
        .
      </p>

      {/* Visibility Selection (Private/Public) */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3">Visibility</h3>
        <div className="space-y-2">
          {/* Private Visibility Option */}
          <label
            className={`${
              visibility === "private" ? "border border-emerald-500" : ""
            } flex items-center gap-3 p-3 rounded-lg pl-4 cursor-pointer hover:bg-zinc-800`}
          >
            <div className="relative flex items-center">
              <input
                type="radio"
                name="visibility"
                checked={visibility === "private"}
                onChange={() => setVisibility("private")}
                className="appearance-none w-4 h-4 rounded-full border-2 border-zinc-600 checked:border-emerald-500 checked:bg-emerald-500 transition-colors cursor-pointer"
              />
              {/* Custom Radio Button Indicator */}
              <span className="absolute inset-0 flex items-center justify-center pointer-events-none">
                {visibility === "private" && (
                  <span className="block w-1.5 h-1.5 rounded-full bg-white" />
                )}
              </span>
            </div>
            <div className="ml-1">
              <div className="font-medium">Private</div>
              <div className="text-sm text-zinc-400">Exam is only visible to you</div>
            </div>
          </label>

          {/* Public Visibility Option */}
          <label
            className={`${
              visibility === "public" ? "border border-emerald-500" : ""
            } flex items-center gap-3 p-3 rounded-lg pl-4 cursor-pointer hover:bg-zinc-800`}
          >
            <div className="relative flex items-center">
              <input
                type="radio"
                name="visibility"
                checked={visibility === "public"}
                onChange={() => setVisibility("public")}
                className="appearance-none w-4 h-4 rounded-full border-2 border-zinc-600 checked:border-emerald-500 checked:bg-emerald-500 transition-colors cursor-pointer"
              />
              {/* Custom Radio Button Indicator */}
              <span className="absolute inset-0 flex items-center justify-center pointer-events-none">
                {visibility === "public" && (
                  <span className="block w-1.5 h-1.5 rounded-full bg-white" />
                )}
              </span>
            </div>
            <div className="ml-1">
              <div className="font-medium">Public</div>
              <div className="text-sm text-zinc-400">Exam is visible to everyone</div>
            </div>
          </label>
        </div>
      </div>

      {/* Styling Selection */}
      <div className="mb-8 flex justify-between">
        <h3 className="flex text-lg font-semibold">Styling</h3>
        {/* Color Selection Buttons */}
        <div className="flex gap-2 items-center">
          {colors.map((color) => (
            <button
              key={color.value}
              onClick={() => setSelectedColor(color.value)}
              className={`w-5 h-5 rounded-full flex items-center justify-center transition-transform ${
                selectedColor === color.value ? "ring-2 ring-zinc-100" : ""
              }`}
            >
              {/* Color Preview Circle */}
              <div className={`w-full h-full rounded-full ${color.class}`} />
            </button>
          ))}
        </div>
      </div>

      {/* Save Button */}
      <Button text={"Save"} />
    </div>
  );
}
