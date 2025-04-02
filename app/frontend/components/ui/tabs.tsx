import React from "react";

/**
 * Default tab options if none are provided
 */
const DEFAULT_TABS = ["Popular", "Explore", "My Exams", "Favorites"];

/**
 * Props for the Tabs component
 * @interface TabsProps
 * @property {string} activeTab - Currently selected tab
 * @property {React.Dispatch<React.SetStateAction<string>>} setActiveTab - Function to update active tab
 * @property {string} [className] - Additional CSS classes
 * @property {string[]} [tabs] - Array of tab labels (defaults to DEFAULT_TABS)
 */
interface TabsProps {
  activeTab: string;
  setActiveTab: React.Dispatch<React.SetStateAction<string>>;
  className?: string;
  tabs?: string[];
}

/**
 * Props for the TabButton component
 * @interface TabButtonProps
 * @property {string} tab - Tab label text
 * @property {string} activeTab - Currently selected tab
 * @property {React.Dispatch<React.SetStateAction<string>>} setActiveTab - Function to update active tab
 * @property {string} [className] - Additional CSS classes
 */
interface TabButtonProps {
  tab: string;
  activeTab: string;
  setActiveTab: React.Dispatch<React.SetStateAction<string>>;
  className?: string;
}

/**
 * Individual tab button component
 * Features:
 * - Active state indicator
 * - Hover effects
 * - Smooth transitions
 * - Customizable styling
 * 
 * @param {TabButtonProps} props - Component props
 * @returns {JSX.Element} Styled tab button
 */
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

/**
 * Tab navigation component
 * Features:
 * - Multiple tab support
 * - Active tab highlighting
 * - Customizable tab options
 * - Responsive design
 * - Smooth transitions
 * 
 * @param {TabsProps} props - Component props
 * @returns {JSX.Element} Tab navigation bar
 */
const Tabs: React.FC<TabsProps> = ({ activeTab, setActiveTab, className, tabs = DEFAULT_TABS }) => (
  <div className={`flex border-b border-zinc-800 ${className}`}>
    {tabs.map((tab) => (
      <TabButton key={tab} tab={tab} activeTab={activeTab} setActiveTab={setActiveTab} className={className} />
    ))}
  </div>
);

export default Tabs;
