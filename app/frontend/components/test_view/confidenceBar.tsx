export default function ConfidenceBar({ confidence }: {confidence: number}) {
    return (
      <div className=" items-center gap-2 flex">
        <span className="text-sm text-zinc-400">Confidence:</span>
        <div className="w-20 h-2 bg-zinc-800 rounded-full overflow-hidden hidden sm:flex">
          <div
            className="h-full bg-emerald-500 transition-all duration-300"
            style={{ width: `${confidence}%` }}
          />
        </div>
        <span className="text-sm text-zinc-400">{confidence}%</span>
      </div>
    );
  }