import { useState } from "react";
import Navbar from "./navNormal";
import Sidebar from "./sideBar";
import { motion } from "framer-motion";
import Generated from "../sidebar/newUser";

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
          className={`overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-zinc-950 max-w-screen flex-1 flex flex-col max-w-7xl px-4 sm:px-8 py-8 sm:py-12 mx-auto min-h-[calc(100vh-72px)] ${
            isCollapsed
              ? ""
              : "w-0 sm:w-full opacity-0 sm:opacity-100"
          }`}
        >
          {children}
        </div>

        {/* Absolutely Positioned Sidebar */}
        <div className="absolute left-0 h-full">
          <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed}>
            <div className="px-8">
              <h2 className="text-2xl sm:text-3xl font-semibold">
                Saving & Sharing
              </h2>
              <Generated />
            </div>
          </Sidebar>
        </div>
      </div>
    </div>
  );
}
