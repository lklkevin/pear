import { useState } from "react";
import BrowseLayout from "../layout/browseLayout";
import Tabs from "../ui/tabs";
import SearchBar from "../layout/searchBar";
import ExamGrid from "./examGrid";

const exams = [
  { title: "MAT223 Practice Final", author: "kimlan07", color: "linear-gradient(to bottom, #1e3a8a, #1e293b)" },
  { title: "MAT223 Practice Final", author: "kimlan07", color: "linear-gradient(to bottom, #059669, #065f46)" },
  { title: "MAT223 Practice Final", author: "kimlan07", color: "linear-gradient(to bottom, #b91c1c, #7f1d1d)" },
  { title: "MAT223 Practice Final", author: "kimlan07", color: "linear-gradient(to bottom, #9333ea, #6b21a8)" },
];

export default function BrowsePage() {
  const [activeTab, setActiveTab] = useState("My Exams");

  const tabTitles: { [key: string]: string } = {
    "My Exams": "My Exams",
    "Popular": "Popular Exams",
    "Favorites": "My Favorites",
    "Explore": "Explore Exams",
  };

  return (
    <BrowseLayout>
      <div className="flex justify-between mt-4">
      <h1 className="text-3xl font-bold text-white">{tabTitles[activeTab] || "My Exams"}</h1>
        <SearchBar />
      </div>
      <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />
      <ExamGrid exams={exams} />
    </BrowseLayout>
  );
}
