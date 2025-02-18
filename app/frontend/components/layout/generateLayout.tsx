import { useState } from "react";
import Navbar from "./navNormal";
import Sidebar from "./sideBar";

export default function GenerateLayout({ children }: { children: React.ReactNode }) {
    const [isCollapsed, setIsCollapsed] = useState(false);

    return (
      <div className="min-h-screen bg-zinc-950 text-white">
        <Navbar />
  
        {/* Page Content with Sidebar */}
        <div className="flex">
          {/* Sidebar - Absolute Position (Does Not Affect Navbar) */}
          <div className="absolute left-0 top-[72px] h-full">
            <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed}/>
          </div>
  
          {/* Main Content - Does Not Get Pushed */}
          <div className={`flex-1 p-8 ${isCollapsed ? "ml-16" : "ml-64"} transition-all duration-300`}>
            {children}
          </div>
        </div>
      </div>
    );
  }
