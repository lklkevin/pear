import ExamCard from "./examCard";
import Link from "next/link";


export default function ExamGrid({ exams }: { exams: { color: string; title: string; author: string }[] }) {
  return (
    // <Link href="/exam">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 mt-6">
        {exams.map((exam, index) => (
          <ExamCard key={index} exam={exam} />
        ))}
      </div>
    // </Link>
  );
}
