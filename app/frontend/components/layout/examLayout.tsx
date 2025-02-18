import { useState } from "react";
import Navbar from "./navNormal";
import Sidebar from "./sideBar";
import { motion } from "framer-motion";
import TestSearch from "@/components/sidebar/testSideSearch"

export default function GenerateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const expandedWidth = 360; // pixels

  return (
    <div className="min-h-screen bg-zinc-950 text-white overflow-hidden">
      <Navbar />

      {/* Page Content with Sidebar */}
      <div className="flex relative h-full">
        {/* Animated placeholder that reserves sidebar space */}
        <motion.div
          className="flex-shrink-0 "
          animate={{ width: isCollapsed ? 0 : expandedWidth }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        />

        {/* Main Content*/}
        <div
          className={`flex-1 flex flex-col max-w-7xl px-8 py-8 sm:pt-12 sm:pb-16 mx-auto min-h-[calc(100vh-72px)] ${
            !isCollapsed ? "hidden sm:flex" : ""
          }`}
        >
          {children}
        </div>

        {/* Absolutely Positioned Sidebar */}
        <div className="absolute left-0 h-full">
          <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed}>
            <div className="p-8">
              <TestSearch/>
            </div>
          </Sidebar>
        </div>
      </div>
    </div>
  );
}
