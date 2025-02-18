import ExamCard from "./examCard";
import Link from "next/link";

export default function ExamGrid({ exams }: { exams: any[] }) {
  return (
    <Link href="/exam">
      <div className="grid grid-cols-4 gap-6 mt-6">
        {exams.map((exam, index) => (
          <ExamCard key={index} exam={exam} />
        ))}
      </div>
    </Link>
  );
}
