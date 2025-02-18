import { DM_Mono } from "next/font/google";

const dmMono = DM_Mono({
  subsets: ["latin"],
  weight: "400", // adjust weight as needed, e.g., "700" for bold
});

export default function GettingStarted({
  number,
  mainText,
  text,
}: {
  number: number;
  mainText: string;
  text: string;
}) {
  return (
    <div className="flex items-center p-6 bg-zinc-800 rounded-r-xl">
      <span className={`text-5xl font-bold text-zinc-50 ${dmMono.className}`}>
        {number}
      </span>
      <div className="mx-5 h-20 border-l border-zinc-600" />
      <div className="space-y-1">
        <h2 className="text-base font-medium text-zinc-100">{mainText}</h2>
        <p className="text-xs text-zinc-400">{text}</p>
      </div>
    </div>
  );
}
