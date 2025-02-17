export default function Tabs({ activeTab, setActiveTab }: { activeTab: string; setActiveTab: (tab: string) => void }) {
    const tabs = ["My Exams", "Popular", "Favorites", "Explore"];
  
    return (
      <div className="flex space-x-6 border-b border-zinc-800 pb-3">
        {tabs.map((tab) => (
          <button
            key={tab}
            className={`text-md font-semibold ${
              activeTab === tab ? "text-white border-b-2 border-emerald-500" : "text-zinc-500"
            } pb-2`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>
    );
  }
  