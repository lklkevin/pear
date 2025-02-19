import ExamLayout from "../layout/examLayout";
import { sampleExam } from "./sampleExam";
import ExamContent from "./examContent";

export default function Page() {
  return (
    <ExamLayout>
      <ExamContent exam={sampleExam} />
    </ExamLayout>
  );
}