"use client";

import { useState, useEffect, ReactNode } from "react";
import Navbar from "./navNormal";
import Sidebar from "./sideBar";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";

// Function to calculate scrollbar width
export function getScrollbarWidth() {
  // Create a temporary div
  const outer = document.createElement("div");
  outer.style.visibility = "hidden";
  outer.style.overflow = "scroll";
  document.body.appendChild(outer);

  // Create an inner div to measure the difference
  const inner = document.createElement("div");
  outer.appendChild(inner);

  // Calculate the width difference
  const scrollbarWidth = outer.offsetWidth - inner.offsetWidth;

  // Clean up
  outer.parentNode?.removeChild(outer);

  return scrollbarWidth;
}

interface BaseLayoutProps {
  children: ReactNode;
  sidebarContent: ReactNode;
  otherContent?: ReactNode;
}

export default function BaseLayout({
  children,
  sidebarContent,
  otherContent,
}: BaseLayoutProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // State for sidebar collapse and initial animation flag
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [initialRender, setInitialRender] = useState(true);

  // Set isCollapsed based on URL parameter after initial render
  useEffect(() => {
    const paramValue = searchParams.get("s");
    const newIsCollapsed = paramValue === "e" ? false : true;

    setIsCollapsed(newIsCollapsed);

    // Mark initial render as complete after first parameter-based state change
    if (initialRender) {
      setInitialRender(false);
    }
  }, [searchParams, initialRender]);

  const expandedWidth = 360; // pixels in expanded state
  const gapSize = 32; // 32px gap between sidebar and content
  const { status } = useSession();
  const [shouldPad, setShouldPad] = useState(false);
  const [adjustedPadding, setAdjustedPadding] = useState(0);
  const [scrollbarWidth, setScrollbarWidth] = useState(0);
  const [isLargeScreen, setIsLargeScreen] = useState(() => {
    if (typeof window !== "undefined") {
      return window.innerWidth >= 800;
    }
    return false;
  });

  // Custom setIsCollapsed function that also updates URL
  const updateSidebarState = (collapsed: boolean) => {
    setIsCollapsed(collapsed);

    // Update URL query parameter
    const params = new URLSearchParams(searchParams.toString());
    if (collapsed) {
      params.delete("s");
    } else {
      params.set("s", "e");
    }

    // Replace URL without causing a navigation
    router.replace(`?${params.toString()}`, { scroll: false });
  };

  // Detect scrollbar width on component mount
  useEffect(() => {
    if (typeof window === "undefined") return;
    const detectedWidth = getScrollbarWidth();
    setScrollbarWidth(detectedWidth);
  }, []);

  // Check if we need to add padding based on content position
  useEffect(() => {
    if (typeof window === "undefined") return;

    const checkOverlap = () => {
      const windowWidth = window.innerWidth;

      setIsLargeScreen(windowWidth >= 800);

      if (windowWidth >= 2000 || windowWidth < 800) {
        setShouldPad(false);
        return;
      }

      // Adjust calculations to account for scrollbar width
      const adjustedWindowWidth = windowWidth - scrollbarWidth;
      const margin = Math.max((adjustedWindowWidth - 1280) / 2, 0);
      const wouldOverlap = !isCollapsed && margin < expandedWidth + gapSize;

      if (
        wouldOverlap &&
        adjustedWindowWidth >= 1280 &&
        adjustedWindowWidth < 2000
      ) {
        // For window sizes between 1280px and 2000px, we need to consider the existing margin
        const adjustedPadding = Math.max(0, expandedWidth - margin);
        setShouldPad(true);
        setAdjustedPadding(adjustedPadding);
      } else {
        // For smaller windows, use the original logic
        setShouldPad(wouldOverlap);
        setAdjustedPadding(0);
      }
    };

    // Check initially and on resize
    checkOverlap();
    window.addEventListener("resize", checkOverlap);

    return () => window.removeEventListener("resize", checkOverlap);
  }, [isCollapsed, expandedWidth, gapSize, scrollbarWidth]);

  // Calculate the padding value based on current state
  const getPaddingValue = (basePadding: number) => {
    if (shouldPad && !isCollapsed) {
      return adjustedPadding > 0
        ? basePadding + adjustedPadding
        : basePadding + expandedWidth;
    }

    return basePadding;
  };

  // Calculate the blur value based on current state
  const getBlurValue = () => {
    if (!isLargeScreen && !isCollapsed) {
      return "blur(8px)";
    }
    return "blur(0px)";
  };

  return (
    <div className="min-h-screen flex flex-col bg-zinc-950">
      <Navbar />

      <div className="h-full relative flex-1 sm:block hidden">
        {/* Main Content with Framer Motion animations */}
        <motion.main
          initial={false}
          animate={{
            paddingLeft: `${getPaddingValue(32)}px`,
            filter: getBlurValue(),
          }}
          transition={{
            duration: 0.3,
            ease: "easeInOut",
          }}
          className={`flex bg-zinc-950 text-white flex-1 flex-col max-w-7xl mx-auto min-h-[calc(100vh-72px)] py-8 sm:py-12 pr-4 sm:pr-8`}
        >
          {children}
        </motion.main>

        {/* Sidebar */}
        {status !== "loading" && (
          <div
            className="fixed top-[72px] left-0"
            style={{
              zIndex: 30,
              height: "calc(100vh - 72px)",
            }}
          >
            <Sidebar
              isCollapsed={isCollapsed}
              setIsCollapsed={updateSidebarState}
            >
              {sidebarContent}
            </Sidebar>
          </div>
        )}
      </div>
      <div className="h-full relative flex-1 sm:hidden block">
        {/* Main Content with Framer Motion animations */}
        <motion.main
          initial={false}
          animate={{
            paddingLeft: `${getPaddingValue(16)}px`,
            filter: getBlurValue(),
          }}
          transition={{
            duration: 0.3,
            ease: "easeInOut",
          }}
          className={`flex bg-zinc-950 text-white flex-1 flex-col max-w-7xl mx-auto min-h-[calc(100vh-72px)] py-8 sm:py-12 pr-4 sm:pr-8`}
        >
          {children}
        </motion.main>

        {/* Sidebar */}
        {status !== "loading" && (
          <div
            className="fixed top-[72px] left-0"
            style={{
              zIndex: 30,
              height: "calc(100vh - 72px)",
            }}
          >
            <Sidebar
              isCollapsed={isCollapsed}
              setIsCollapsed={updateSidebarState}
            >
              {sidebarContent}
            </Sidebar>
          </div>
        )}
      </div>

      {/* Optional content (for progress bar, etc.) */}
      {otherContent}
    </div>
  );
}
