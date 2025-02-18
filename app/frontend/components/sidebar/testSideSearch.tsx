import { useState } from "react";
import Link from "next/link";

// Define the structure of an exam item
interface ExamItem {
  id: string;
  title: string;
  color: string;
}

// Define available tab names
const TABS = ["My Exams", "Popular", "Favorites", "Explore"] as const;
type Tab = (typeof TABS)[number];

// Define available colors for exams
const COLORS = [
  "blue",
  "purple",
  "red",
  "emerald",
  "orange",
  "blue",
  "purple",
  "red",
  "gray",
] as const;
type Color = (typeof COLORS)[number];

export default function SideSearch() {
  // State to track the active tab
  const [activeTab, setActiveTab] = useState<Tab>("My Exams");

  // Generate a list of mock exam items, assigning a color from COLORS array
  const exams: ExamItem[] = COLORS.map((color, index) => ({
    id: `exam-${index}`,
    title: "MAT223 Midterm 2", // Placeholder title for all exams
    color,
  }));

  // Mapping color names to TailwindCSS color classes
  const colorMap: Record<Color, string> = {
    blue: "bg-blue-500",
    purple: "bg-purple-500",
    red: "bg-red-500",
    emerald: "bg-emerald-500",
    orange: "bg-orange-500",
    gray: "bg-gray-500",
  };

  return (
    <>
      {/* Search Bar */}
      <div className="relative mb-4">
        <span className="material-icons absolute left-3 top-2.5 text-zinc-400">
          search
        </span>
        <input
          type="text"
          placeholder="Search exams"
          className="w-full pl-10 pr-4 py-2 bg-zinc-900 border border-zinc-800 rounded-md text-white placeholder:text-zinc-400 focus:outline-none focus:border-zinc-700"
        />
      </div>

      {/* Tabs for filtering exams */}
      <div className="mb-4 border-b border-zinc-800">
        <div className="flex gap-4 justify-center">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-2 text-sm transition-colors ${
                activeTab === tab
                  ? "text-white border-b-2 border-emerald-500"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* List of available exams */}
      <div className="space-y-1">
        {exams.map((exam) => (
          <Link href="/exam" key={exam.id}>
            <button
              className="w-full flex items-center gap-4 py-2 px-3 mb-1 hover:bg-zinc-800 rounded-lg text-left transition-colors group"
            >
              {/* Colored circle representing the exam's assigned color */}
              <div
                className={`w-3 h-3 rounded-full ${
                  colorMap[exam.color as Color]
                }`}
              />
              {/* Exam title */}
              <span className="font-medium text-zinc-300 group-hover:text-white transition-colors">
                {exam.title}
              </span>
            </button>
          </Link>
        ))}
      </div>
    </>
  );
}
