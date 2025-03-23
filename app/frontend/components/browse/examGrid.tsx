import ExamCard from "./examCard";
import { Skeleton } from "../ui/skeleton";

export type Exam = {
  exam_id: number;
  name: string;
  date: string;
  owner: number;
  color: string;
  description: string;
  public: number;
  num_fav: number;
  liked: boolean;
};

interface ExamGridProps {
  exams: Exam[];
}

export default function ExamGrid({ exams = [] }: ExamGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-8 mt-4 sm:mt-8">
      {exams.length > 0 ? (
        exams.map((exam) => <ExamCard key={exam.exam_id} exam={exam} />)
      ) : (
        // Show 12 skeleton loaders when there are no exams
        Array.from({ length: 12 }).map((_, index) => (
          <Skeleton key={index} className="h-[200px] w-full rounded-lg" />
        ))
      )}
    </div>
  );
}
