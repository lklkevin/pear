import ExamCard from "./examCard";

export default function ExamGrid({ exams }: { exams: any[] }) {
  return (
    <div className="grid grid-cols-4 gap-6 mt-6">
      {exams.map((exam, index) => (
        <ExamCard key={index} exam={exam} />
      ))}
    </div>
  );
}
