import GenerateLayout from "../layout/generateLayout";
import ExamForm from "./examForm";

export default function GeneratePage() {
  return (
    <GenerateLayout>
      <h1 className="text-3xl font-bold">Create Exam</h1>
      <p className="text-zinc-400 mt-2">
        Simply upload your past exam and press generate. You can optionally include a title 
        and description to better tailor your focus.</p>
      <ExamForm />
    </GenerateLayout>
  );
}
