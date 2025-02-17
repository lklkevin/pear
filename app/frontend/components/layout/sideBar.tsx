import { useState } from "react";

export default function Sidebar({
    isCollapsed,
    setIsCollapsed,
  }: {
    isCollapsed: boolean;
    setIsCollapsed: (value: boolean) => void;
  }) {
  
  return (
    <div className={`bg-zinc-900 transition-all duration-300 ${isCollapsed ? "w-16" : "w-64"} p-4 h-screen `}>
      <button
        className="text-white text-sm mb-4"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        {isCollapsed ? "→ Expand" : "← Collapse"}
      </button>

      {!isCollapsed && (
        <div>
          <h2 className="text-lg font-semibold">Getting Started</h2>
          <ul className="mt-4 space-y-4">
            {[
              { number: "1", text: "Upload Past Exams" },
              { number: "2", text: "Include Optional Information" },
              { number: "3", text: "Generate!" },
              { number: "4", text: "Sign Up and Save" },
            ].map((step, index) => (
              <li key={index} className="p-3 bg-zinc-800 rounded-md">
                <span className="font-bold">{step.number}</span> {step.text}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
