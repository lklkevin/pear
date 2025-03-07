"use client"

import { useState } from "react"
import Favorite from "./buttonFavorite"
import Link from "next/link"

export default function ExamCard({
  exam,
}: {
  exam: {
    color: string
    title: string
    author: string
    description?: string
  }
}) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <Link href="/exam" className="block">
      <div
        className="relative w-full h-[200px] rounded-lg overflow-hidden bg-gradient-to-br from-zinc-900 to-zinc-800 border border-zinc-700 z-0 transition-all duration-300 ease-in-out"
        style={{ background: exam.color }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Favorite />

        <div
          className={`absolute inset-0 flex flex-col justify-end transition-transform duration-300 ease-in-out ${
            isHovered && exam.description ? "translate-y-0" : "translate-y-[calc(100%-56px)]"
          }`}
        >
          <div className="bg-zinc-800 w-full p-3 border-t border-zinc-700">
            <h3 className="text-md font-semibold text-white">{exam.title}</h3>
            <p className="text-xs text-zinc-200">{exam.author}</p>
          </div>

          {exam.description && (
            <div className="bg-zinc-800 w-full p-3 pt-0 text-zinc-200 text-sm leading-relaxed">{exam.description}</div>
          )}
        </div>
      </div>
    </Link>
  )
}

