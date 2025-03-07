import { useState } from "react";
import BrowseLayout from "../layout/browseLayout";
import Tabs from "../ui/tabs";
import SearchBar from "../ui/searchBar";
import ExamGrid from "./examGrid";


const exams = [
  {
    title: "MAT223 Practice Final",
    author: "kimlan07",
    color: "linear-gradient(to bottom, #1e3a8a, #1e293b)",
    description: "This is a practice final exam for MAT223. It covers all the topics that will be on the final exam.",
  },
  {
    title: "MAT223 Practice Final",
    author: "kimlan07",
    color: "linear-gradient(to bottom, #059669, #065f46)",
    description: "This is a practice final exam for MAT223. It covers all the topics that will be on the final exam.",
  },
  {
    title: "MAT223 Practice Final",
    author: "kimlan07",
    color: "linear-gradient(to bottom, #b91c1c, #7f1d1d)",
  },
  {
    title: "MAT223 Practice Final",
    author: "kimlan07",
    color: "linear-gradient(to bottom, #9333ea, #6b21a8)",
  },
  {
    title: "MAT223 Practice Final",
    author: "kimlan07",
    color: "linear-gradient(to bottom, #9333ea, #6b21a8)",
  },
];

export default function BrowsePage() {
  const [activeTab, setActiveTab] = useState<"My Exams" | "Popular" | "Favorites" | "Explore">("My Exams");

  const tabTitles: { [key: string]: string } = {
    "My Exams": "My Exams",
    Popular: "Popular Exams",
    Favorites: "My Favorites",
    Explore: "Explore Exams",
  };

  return (
    <BrowseLayout>
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <h1 className="text-3xl sm:text-5xl font-bold tracking-tight min-w-[200px] md:min-w-[330px]">
          {tabTitles[activeTab] || "My Exams"}
        </h1>
        <div className="w-full md:w-auto md:flex-1 md:max-w-[550px] min-w-[250px] md:mb-0 mb-4">
          <SearchBar placeholder="Search" />
        </div>
      </div>
      <div className="mt-6">
        <Tabs activeTab={activeTab} setActiveTab={setActiveTab} className="text-md gap-6" />
      </div>
      <ExamGrid exams={exams} />
    </BrowseLayout>
  );

}
