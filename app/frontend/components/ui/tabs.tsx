// Define available tab names
const TABS = ["My Exams", "Popular", "Favorites", "Explore"] as const;

interface TabsProps {
  activeTab: typeof TABS[number];
  setActiveTab: React.Dispatch<React.SetStateAction<typeof TABS[number]>>;
  className?: string;
}

interface TabButtonProps {
  tab: typeof TABS[number];
  activeTab: typeof TABS[number];
  setActiveTab: React.Dispatch<React.SetStateAction<typeof TABS[number]>>;
  className?: string;
}

const TabButton: React.FC<TabButtonProps> = ({ tab, activeTab, setActiveTab, className }) => (
  <button
    key={tab}
    className={`pb-1 transition-colors ${
      activeTab === tab ? "text-white border-b-2 border-emerald-500" : "text-zinc-400 hover:text-white"
    } ${className}`}
    onClick={() => setActiveTab(tab)}
  >
    {tab}
  </button>
);

const Tabs: React.FC<TabsProps> = ({ activeTab, setActiveTab, className }) => (
  <div className={`flex border-b border-zinc-800 ${className}`}>
    {TABS.map((tab) => (
      <TabButton key={tab} tab={tab} activeTab={activeTab} setActiveTab={setActiveTab} className={className} />
    ))}
  </div>
);

export default Tabs;