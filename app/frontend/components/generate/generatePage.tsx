import GenerateLayout from "../layout/generateLayout";
import ExamForm from "./examForm";

export default function GeneratePage() {
  return (
    <GenerateLayout>
      <div className="grid grid-cols-1 lg:grid-cols-2">
        <div>
          <h1 className="text-3xl sm:text-5xl font-bold">Create Exam</h1>
          <p className="text-sm sm:text-base text-zinc-400 mt-2 sm:mt-4">
            Simply upload your past exam and press generate. You can optionally
            include a title and description to better tailor your focus.
          </p>
        </div>
      </div>
      <ExamForm />
    </GenerateLayout>
  );
}
