import ExamCard from "./examCard";

export type Exam = {
  exam_id: number;
  name: string;
  date: string;
  owner: number;
  color: string;
  description: string;
  public: number;
  num_fav: number;
};

interface ExamGridProps {
  exams: Exam[];
}

export default function ExamGrid({ exams }: ExamGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-8 mt-4 sm:mt-8">
      {exams.map((exam) => (
        <ExamCard key={exam.exam_id} exam={exam} />
      ))}
    </div>
  );
}
