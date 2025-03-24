"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { cn } from "../../utils/utils";

interface CardProps {
  id: number;
  title: string;
  className?: string;
  hoverClassName?: string;
  href?: string;
}

export default function ExpandingCardGrid() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isHoveringRef = useRef(false);

  // Clear any lingering timeout on unmount
  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);

  const handleMouseEnter = (index: number) => {
    // Clear any existing timeout
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }

    isHoveringRef.current = true;
    setHoveredIndex(index);
  };

  const handleMouseLeave = () => {
    isHoveringRef.current = false;

    // Set a small delay before actually removing hover state
    // This gives the user time to move to another card
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }

    hoverTimeoutRef.current = setTimeout(() => {
      if (!isHoveringRef.current) {
        setHoveredIndex(null);
      }
      hoverTimeoutRef.current = null;
    }, 150);
  };

  const cards: CardProps[] = [
    {
      id: 1,
      title: "Arithmetic",
      className:
        "bg-gradient-to-t from-emerald-950 to-emerald-700 border border-emerald-700",
      hoverClassName: "bg-gradient-to-t from-emerald-950 to-emerald-600",
      href: "/browse?tab=Popular&page=1&search=arithmetic",
    },
    {
      id: 2,
      title: "Geometry",
      className:
        "bg-gradient-to-t from-teal-950 to-teal-700 border border-teal-700",
      hoverClassName: "bg-gradient-to-t from-teal-950 to-teal-600",
      href: "/browse?tab=Popular&page=1&search=geometry",
    },
    {
      id: 3,
      title: "Algebra",
      className:
        "bg-gradient-to-t from-cyan-950 to-cyan-700 border border-cyan-700",
      hoverClassName: "bg-gradient-to-t from-cyan-950 to-cyan-600",
      href: "/browse?tab=Popular&page=1&search=algebra",
    },
    {
      id: 4,
      title: "Trigonometry",
      className:
        "bg-gradient-to-t from-sky-950 to-sky-700 border border-sky-700",
      hoverClassName: "bg-gradient-to-t from-sky-950 to-sky-600",
      href: "/browse?tab=Popular&page=1&search=trig",
    },
    {
      id: 5,
      title: "Statistics",
      className:
        "bg-gradient-to-t from-blue-950 to-blue-700 border border-blue-700",
      hoverClassName: "bg-gradient-to-t from-blue-950 to-blue-600",
      href: "/browse?tab=Popular&page=1&search=statistics",
    },
    {
      id: 6,
      title: "Univariate Calculus",
      className:
        "bg-gradient-to-t from-indigo-950 to-indigo-700 border border-indigo-700",
      hoverClassName: "bg-gradient-to-t from-indigo-950 to-indigo-600",
      href: "/browse?tab=Popular&page=1&search=univariate+calculus",
    },
    {
      id: 7,
      title: "Linear Algebra",
      className:
        "bg-gradient-to-t from-violet-950 to-violet-700 border border-violet-700",
      hoverClassName: "bg-gradient-to-t from-violet-950 to-violet-600",
      href: "/browse?tab=Popular&page=1&search=linear+algebra",
    },
    {
      id: 8,
      title: "Multivariate Calculus",
      className:
        "bg-gradient-to-t from-purple-950 to-purple-700 border border-purple-700",
      hoverClassName: "bg-gradient-to-t from-purple-950 to-purple-600",
      href: "/browse?tab=Popular&page=1&search=multivariate+calculus",
    },
  ];

  // Calculate grid template based on hovered index and screen size
  const getGridTemplate = () => {
    // Default equal sizing
    let colTemplate = "1fr 1fr 1fr 1fr";
    let rowTemplate = "1fr 1fr";

    if (hoveredIndex !== null) {
      // Determine row and column of hovered item
      const row = Math.floor(hoveredIndex / 4);
      const col = hoveredIndex % 4;

      // Create column template with expanded column
      const colSizes = ["1fr", "1fr", "1fr", "1fr"];
      colSizes[col] = "2fr"; // Make hovered column 3x larger
      colTemplate = colSizes.join(" ");

      // Create row template with expanded row
      const rowSizes = ["1fr", "1fr"];
      rowSizes[row] = "2fr"; // Make hovered row 3x larger
      rowTemplate = rowSizes.join(" ");
    }

    return { colTemplate, rowTemplate };
  };

  const { colTemplate, rowTemplate } = getGridTemplate();

  // Function to render card content
  const renderCardContent = (card: CardProps) => {
    // Check if title has multiple words
    const hasMultipleWords = card.title.trim().includes(" ");

    return (
      <div className="flex flex-col h-full justify-between">
        <h3
          className={cn(
            "text-xl font-semibold mb-2 text-white",
            hasMultipleWords ? "break-words" : "truncate"
          )}
        >
          {card.title}
        </h3>
        <div className="flex items-center mt-auto transition-all duration-500 ease-in-out opacity-0 transform translate-y-2 group-hover:opacity-100 group-hover:translate-y-0">
          <span className="text-white text-sm">Explore</span>
          <span className="mt-[1px] material-icons text-white text-base transition-transform duration-300 ease-out group-hover:translate-x-1">
            arrow_forward
          </span>
        </div>
      </div>
    );
  };

  // Function to wrap card content with Link if href is provided
  const CardWrapper = ({
    card,
    children,
  }: {
    card: CardProps;
    children: React.ReactNode;
  }) => {
    if (card.href) {
      return (
        <Link href={card.href} className="h-full pointer-events-auto">
          {children}
        </Link>
      );
    }
    return <>{children}</>;
  };

  return (
    <div className=" w-full mt-8 sm:mt-12">
      {/* Mobile view (below sm breakpoint) */}
      <div className="grid grid-cols-1 sm:hidden gap-4 h-auto">
        {cards.map((card, index) => {
          const isHovered = hoveredIndex === index;

          return (
            <CardWrapper key={card.id} card={card}>
              <div
                className={cn(
                  "rounded-xl p-4 overflow-hidden flex flex-col transition-all duration-300 ease-out group pointer-events-none",
                  card.className,
                  isHovered && card.hoverClassName
                )}
                onMouseEnter={() => handleMouseEnter(index)}
                onMouseLeave={handleMouseLeave}
              >
                {renderCardContent(card)}
              </div>
            </CardWrapper>
          );
        })}
      </div>

      <div className="hidden sm:grid lg:hidden grid-cols-2 grid-rows-4 gap-6 h-auto min-h-[720px] w-full">
        {cards.map((card, index) => {
          const isHovered = hoveredIndex === index;

          return (
            <CardWrapper key={card.id} card={card}>
              <div
                className={cn(
                  "rounded-2xl p-6 overflow-hidden flex flex-col h-full transition-all duration-300 ease-out group",
                  card.className,
                  isHovered && card.hoverClassName
                )}
                onMouseEnter={() => handleMouseEnter(index)}
                onMouseLeave={handleMouseLeave}
              >
                {renderCardContent(card)}
              </div>
            </CardWrapper>
          );
        })}
      </div>

      {/* Desktop view (md and above) */}
      <motion.div
        className="hidden lg:grid gap-8 min-h-[544px]"
        layout
        style={{
          gridTemplateColumns: colTemplate,
          gridTemplateRows: rowTemplate,
          transition:
            "grid-template-columns 0.25s cubic-bezier(0.4, 0, 0.2, 1), grid-template-rows 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        {cards.map((card, index) => {
          // Calculate row and column for this card
          const row = Math.floor(index / 4);
          const col = index % 4;

          // Handle hover state with Tailwind classes
          const isHovered = hoveredIndex === index;

          return (
            <motion.div
              key={card.id}
              className={cn(
                "rounded-2xl p-6 overflow-hidden flex flex-col cursor-pointer transition-all duration-300 ease-out group",
                card.className,
                isHovered && card.hoverClassName
              )}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{
                opacity: 1,
                y: 0,
                transition: {
                  duration: 0.4,
                  ease: [0.25, 0.1, 0.25, 1.0], // cubic-bezier easing
                },
              }}
              transition={{
                layout: {
                  duration: 0.3,
                  ease: [0.25, 0.1, 0.25, 1.0],
                  type: "tween",
                },
              }}
              onMouseEnter={() => handleMouseEnter(index)}
              onMouseLeave={handleMouseLeave}
              style={{
                gridRow: row + 1,
                gridColumn: col + 1,
                zIndex: hoveredIndex === index ? 10 : 1,
              }}
              whileHover={{
                transition: {
                  duration: 0.2,
                  ease: "easeOut",
                },
              }}
            >
              <CardWrapper card={card}>
                <motion.div
                  layout
                  className="flex flex-col h-full justify-between"
                  transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1.0] }}
                >
                  <motion.h3
                    layout="position"
                    className={cn(
                      "text-xl font-semibold mb-2 text-white",
                      card.title.trim().includes(" ")
                        ? "break-words"
                        : "truncate"
                    )}
                    transition={{
                      duration: 0.25,
                      ease: [0.25, 0.1, 0.25, 1.0],
                    }}
                  >
                    {card.title}
                  </motion.h3>
                  <motion.div
                    layout
                    initial={{ opacity: 0 }}
                    animate={{
                      opacity: isHovered ? 1 : 0,
                    }}
                    className="flex items-center mt-auto gap-1 sm:gap-1.5"
                    transition={{
                      opacity: { duration: 0.3, ease: "easeInOut" },
                      layout: { duration: 0.25, ease: [0.25, 0.1, 0.25, 1.0] },
                    }}
                  >
                    <span className="text-white text-sm sm:text-base">Explore</span>
                    <span className="mt-[1px] material-icons text-white text-base sm:text-lg">
                      arrow_forward
                    </span>
                  </motion.div>
                </motion.div>
              </CardWrapper>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}
