import ExamLayout from "@/components/layout/generatedLayout";
import { sampleExam } from "./sampleExam";
import ExamContent from "./examContent";

export default function Page() {
  return (
    <ExamLayout>
      <ExamContent exam={sampleExam} />
    </ExamLayout>
  );
}