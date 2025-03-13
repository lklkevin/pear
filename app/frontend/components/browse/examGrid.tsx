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
  liked: boolean;
};

interface ExamGridProps {
  exams: Exam[];
}

export default function ExamGrid({ exams = [] }: ExamGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-8 mt-4 sm:mt-8">
      {(exams && Array.isArray(exams)) ? (
        exams.map((exam) => <ExamCard key={exam.exam_id} exam={exam} />)
      ) : (
        <div className="fixed inset-0 bg-zinc-950/25 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="flex flex-col items-center gap-2">
            <div className="drop-shadow-xl h-12 w-12 rounded-full border-4 border-emerald-600 border-t-white animate-spin mb-4"></div>
            <p className="text-lg font-medium text-white">Loading...</p>
          </div>
        </div>
      )}
    </div>
  );
}
