"use client";

import { DM_Mono } from "next/font/google";
import Favorite from "./buttonFavorite";
import Link from "next/link";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";

const dmMono = DM_Mono({
  subsets: ["latin"],
  weight: "400",
});

// Helper function to darken a hex color by a given percentage
function darkenColor(hex: string, percent: number): string {
  // Remove the hash if present
  hex = hex.replace(/^#/, "");
  // Parse r, g, b values
  const num = Number.parseInt(hex, 16);
  let r = (num >> 16) & 0xff;
  let g = (num >> 8) & 0xff;
  let b = num & 0xff;

  // Decrease each channel by the given percentage
  r = Math.max(0, Math.round(r * (1 - percent)));
  g = Math.max(0, Math.round(g * (1 - percent)));
  b = Math.max(0, Math.round(b * (1 - percent)));

  // Convert back to hex and ensure 2-digit format
  const newColor =
    "#" +
    ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
  return newColor;
}

export default function ExamCard({
  exam,
}: {
  exam: {
    exam_id: number;
    name: string;
    date: string;
    color: string;
    description: string;
    liked: boolean;
    // ...other exam properties if needed
  };
}) {
  const darkerColor = darkenColor(exam.color, 0.85);
  const { data: session } = useSession();

  // Animation variants
  const bottomBarVariants = {
    initial: {
      borderTop: "1px solid rgb(39, 39, 42)",
      y: 0,
      backgroundColor: "rgb(24, 24, 27)", // zinc-900
    },
    hover: {
      borderTop: "0px solid rgb(39, 39, 42)",
      y: -130,
      backgroundColor: exam.color,
      transition: {
        duration: 0.3,
        ease: "easeInOut",
        backgroundColor: {
          duration: 0.3,
          delay: 0.1,
          ease: "easeInOut",
        },
      },
    },
  };

  return (
    <Link href={`/exam/${exam.exam_id}`} className="block">
      <motion.div
        className="relative w-full h-[200px] rounded-lg overflow-hidden border border-zinc-800 z-0"
        style={{
          background: `linear-gradient(to bottom, ${exam.color}, ${darkerColor})`,
        }}
        initial="initial"
        whileHover="hover"
      >
        <div className="absolute top-2 right-2 z-10">
          <Favorite examId={exam.exam_id} initialFavorite={exam.liked} />
        </div>

        {/* BOTTOM BAR (Title + Date) */}
        <motion.div
          className="absolute inset-x-0 bottom-0 py-3 px-4 text-white"
          variants={bottomBarVariants}
        >
          <motion.h3
            className="text-md font-medium mb-1 truncate"
            variants={{
              initial: { paddingRight: "0rem" },
              hover: { paddingRight: session ? "2.5rem" : "0rem" },
            }}
          >
            {exam.name}
          </motion.h3>
          <motion.p
            className={`text-xs ${dmMono.className}`}
            variants={{
              initial: { color: "rgb(161, 161, 170)" }, // zinc-400
              hover: { color: "rgb(244, 244, 245)" }, // zinc-200
            }}
          >
            {exam.date}
          </motion.p>
        </motion.div>

        {/* DESCRIPTION BAR */}
        <motion.div
          className="absolute inset-x-0 bottom-0 h-[130px] px-4 py-3 text-white"
          variants={{
            initial: {
              y: 130,
              borderTop: "1px solid rgb(24, 24, 27)",
              backgroundColor: "rgba(24, 24, 27)",
              transition: {
                duration: 0.3,
                ease: "easeInOut",
                borderTop: {
                  duration: 0.2,
                  ease: "easeInOut",
                },
                backgroundColor: {
                  duration: 0.2,
                  ease: "easeInOut",
                },
              },
            },
            hover: {
              y: 0,
              borderTop: "1px solid rgb(39, 39, 42)", // zinc-800
              backgroundColor: "rgba(24, 24, 27, 0.8)", // zinc-900/80
              transition: {
                duration: 0.3,
                ease: "easeInOut",
                borderTop: {
                  duration: 0.2,
                  ease: "easeInOut",
                },
                backgroundColor: {
                  duration: 0.2,
                  ease: "easeInOut",
                },
              },
            },
          }}
        >
          <p className="text-sm break-words line-clamp-5">{exam.description}</p>
        </motion.div>
      </motion.div>
    </Link>
  );
}
