import GenerateLayout from "../layout/generateLayout";
import ExamForm from "./examForm";

/**
 * Main page component for exam generation
 * Provides a form for users to upload past exams and generate new ones
 * Includes descriptive text and wrapped in the GenerateLayout with sidebar instructions
 * 
 * @returns {JSX.Element} - Rendered generation page with form
 */
export default function GeneratePage() {
  return (
    <GenerateLayout>
      <div className="grid grid-cols-1 gap-8 xl:gap-16">
        <div>
          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight">Create Exam</h1>
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
