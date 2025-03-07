import React from "react";

// Default tab list in case none is provided.
const DEFAULT_TABS = ["Popular", "Explore", "My Exams", "Favorites"];

interface TabsProps {
  activeTab: string;
  setActiveTab: React.Dispatch<React.SetStateAction<string>>;
  className?: string;
  tabs?: string[];
}

interface TabButtonProps {
  tab: string;
  activeTab: string;
  setActiveTab: React.Dispatch<React.SetStateAction<string>>;
  className?: string;
}

const TabButton: React.FC<TabButtonProps> = ({ tab, activeTab, setActiveTab, className }) => (
  <button
    key={tab}
    className={`pb-1 transition-colors ${
      activeTab === tab
        ? "text-white border-b-2 border-emerald-500"
        : "text-zinc-400 hover:text-white"
    } ${className}`}
    onClick={() => setActiveTab(tab)}
  >
    {tab}
  </button>
);

const Tabs: React.FC<TabsProps> = ({ activeTab, setActiveTab, className, tabs = DEFAULT_TABS }) => (
  <div className={`flex border-b border-zinc-800 ${className}`}>
    {tabs.map((tab) => (
      <TabButton key={tab} tab={tab} activeTab={activeTab} setActiveTab={setActiveTab} className={className} />
    ))}
  </div>
);

export default Tabs;
