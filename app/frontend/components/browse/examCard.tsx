import { DM_Mono } from "next/font/google";
import Favorite from "./buttonFavorite";
import Link from "next/link";

const dmMono = DM_Mono({
  subsets: ["latin"],
  weight: "400",
});

// Helper function to darken a hex color by a given percentage
function darkenColor(hex: string, percent: number): string {
  // Remove the hash if present
  hex = hex.replace(/^#/, "");
  // Parse r, g, b values
  const num = parseInt(hex, 16);
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
  const darkerColor = darkenColor(exam.color, 0.75);

  return (
    <Link href={`/exam/${exam.exam_id}`} className="block">
      <div
        className="relative w-full h-[200px] rounded-lg overflow-hidden border border-zinc-800 z-0"
        style={{
          background: `linear-gradient(to bottom, ${exam.color}, ${darkerColor})`,
        }}
      >
        <Favorite examId={exam.exam_id} initialFavorite={exam.liked} />
        <div className="absolute bottom-0 py-3 px-4 text-white bg-zinc-900 w-full rounded-b-lg border-t border-zinc-800">
          <h3 className="text-md font-medium mb-1">{exam.name}</h3>
          <p className={`text-xs text-zinc-400 ${dmMono.className}`}>{exam.date}</p>
        </div>
      </div>
    </Link>
  );
}
