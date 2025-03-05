import { useState } from "react";
import Navbar from "./navNormal";
import Sidebar from "./sideBar";
import { motion } from "framer-motion";
import InfoCard from "../sidebar/infoCard";
import { useLoadingStore } from "@/store/store";

export default function GenerateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const expandedWidth = 360; // pixels
  const { loading } = useLoadingStore()

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
          className={`flex-1 flex flex-col max-w-7xl px-8 py-8 sm:py-12 mx-auto min-h-[calc(100vh-72px)] ${
            !isCollapsed ? "hidden sm:flex" : ""
          }`}
        >
          {children}
        </div>

        {/* Absolutely Positioned Sidebar */}
        <div className="absolute left-0 h-full">
          <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed}>
            <div className="pr-8">
              <h2 className="ml-8 text-2xl sm:text-3xl font-semibold">
                Getting Started
              </h2>
              <ul className="mt-6 mb-16 space-y-8">
                {[
                  {
                    number: 1,
                    mainText: "Upload Past Exams",
                    text: "Drop up to 5 past exams in the file upload box. We will analyze their contents and generate new exams.",
                  },
                  {
                    number: 2,
                    mainText: "Include Optional Info",
                    text: "You can write a title and description to help us align the content of the new exam to your exact needs.",
                  },
                  {
                    number: 3,
                    mainText: "Generate!",
                    text: "Click generate and we will work our magic. Check back in a minute or two to see your new exam!",
                  },
                  {
                    number: 4,
                    mainText: "Sign Up and Save",
                    text: "Sign up for an account to save your exam and share it with others. You can also specify the visibility of the exam.",
                  },
                ].map((step, index) => (
                  <InfoCard
                    key={index}
                    number={step.number}
                    mainText={step.mainText}
                    text={step.text}
                  ></InfoCard>
                ))}
              </ul>
            </div>
          </Sidebar>
        </div>
      </div>
      {loading && (
        <div className="fixed inset-0 bg-zinc-950/25 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="flex flex-col items-center gap-2">
            <div className="h-12 w-12 rounded-full border-4 border-zinc-900 border-t-white animate-spin mb-4"></div>
            <p className="text-lg font-medium text-white">Generating your new exam...</p>
            <p className=" font-medium text-zinc-400">Check back in a few minutes, do not refresh this page</p>
          </div>
        </div>
      )}
    </div>
  );
}
