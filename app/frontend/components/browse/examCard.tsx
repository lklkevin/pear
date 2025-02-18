export default function ExamCard({
  exam,
}: {
  exam: { color: string; title: string; author: string };
}) {
  return (
    <div
      className="relative w-full h-[200px] rounded-lg overflow-hidden bg-gradient-to-br from-zinc-900 to-zinc-800 border border-zinc-700"
      style={{ background: exam.color }}
    >
      <div className="absolute top-3 right-3 cursor-pointer text-white">❤️</div>
      <div className="absolute bottom-0 py-3 pl-3 text-white bg-zinc-800 w-full rounded-b-md border-t-1 border-white">
        <h3 className="text-md font-semibold">{exam.title}</h3>
        <p className="text-xs text-zinc-200">{exam.author}</p>
      </div>
    </div>
  );
}
