import ExamCard from "./examCard";
import { Skeleton } from "../ui/skeleton";

/**
 * Type definition for exam data
 * @typedef {Object} Exam
 * @property {number} exam_id - Unique identifier for the exam
 * @property {string} name - Title of the exam
 * @property {string} date - Date of creation in UTC format
 * @property {number} owner - User ID of the exam owner
 * @property {string} color - Hex color code for the exam card styling
 * @property {string} description - Description text for the exam
 * @property {number} public - Whether the exam is public (1) or private (0)
 * @property {number} num_fav - Number of times the exam has been favorited
 * @property {boolean} liked - Whether the current user has favorited this exam
 */
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

/**
 * Props for the ExamGrid component
 * @interface ExamGridProps
 * @property {Exam[]} exams - Array of exam objects to display in the grid
 */
interface ExamGridProps {
  exams: Exam[];
}

/**
 * Grid component for displaying multiple exam cards
 * Handles responsive layout and shows skeleton loaders when no exams are available
 * 
 * @param {ExamGridProps} props - Component props
 * @param {Exam[]} [props.exams=[]] - Array of exam objects to display
 * @returns {JSX.Element} - Rendered grid of exam cards or skeleton loaders
 */
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
