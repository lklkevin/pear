import ExamLayout from "@/components/layout/generatedLayout";
import { AlternativeAnswer, Question, Exam } from "./exam";
import ExamContent from "./examContent";
import { useErrorStore, useLoadingStore } from "@/store/store";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import ExamSkeleton from "./examSkeleton";

/**
 * Interface for a single exam question from the API
 * @interface RawExamQuestion
 * @property {string} question - The question text
 * @property {Record<string, number>} answers - Map of answer options to their correctness scores
 */
interface RawExamQuestion {
  question: string;
  answers: Record<string, number>;
}

/**
 * Interface for a complete exam from the API
 * @interface RawExam
 * @property {string} title - Exam title
 * @property {string} description - Exam description
 * @property {RawExamQuestion[]} questions - Array of exam questions
 * @property {string} [privacy] - Privacy setting
 */
export interface RawExam {
  title: string;
  description: string;
  questions: RawExamQuestion[];
  privacy?: string;
}

/**
 * Parses raw exam data from the API into the application's exam format
 * Sorts answers by confidence and separates main and alternative answers
 * 
 * @param {RawExam} examJson - Raw exam data from the API
 * @returns {Exam} Parsed exam in the application format
 */
export function parseExam(examJson: RawExam): Exam {
  return {
    title: examJson.title,
    description: examJson.description,
    privacy: examJson.privacy || "Unsaved",
    questions: examJson.questions.map((q: any): Question => {
      // Convert the answers object into an array of [answer, confidence] pairs.
      // Use a type assertion to ensure the entries are [string, number] tuples.
      const answersEntries = Object.entries(q.answers) as [string, number][];

      // Sort the entries in descending order based on confidence.
      answersEntries.sort((a, b) => b[1] - a[1]);

      // The first entry becomes the main answer.
      const [mainAnswer, mainAnswerConfidence] = answersEntries[0];

      // The remaining entries are mapped as alternative answers.
      const alternativeAnswers: AlternativeAnswer[] = answersEntries
        .slice(1)
        .map(([answer, confidence]) => ({
          answer,
          confidence,
        }));

      return {
        question: q.question,
        mainAnswer,
        mainAnswerConfidence,
        alternativeAnswers,
      };
    }),
  };
}

/**
 * Non-authenticated user exam view component
 * Fetches and displays generated exam for non-logged-in users
 * Handles loading states and error cases
 * Redirects to generate page if no exam is available
 * 
 * @returns {JSX.Element} Exam view with content or loading skeleton
 */
export default function Page() {
  const { loading } = useLoadingStore();
  const router = useRouter();
  const [exam, setExam] = useState<Exam>();

  useEffect(() => {
    /**
     * Fetches exam data from the backend
     * Handles error cases and updates loading state
     * Redirects to generate page if needed
     */
    async function fetchData() {
      if (!sessionStorage.getItem("browserSessionId")) {
        useErrorStore
          .getState()
          .setError("You have not generated an exam yet!");
        router.push(`/generate`);
        return;
      }

      const taskId = sessionStorage.getItem("browserSessionId");

      try {
        useLoadingStore.getState().setLoading(true);
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/task/${taskId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        const data = await response.json();

        if (!response.ok || data?.state !== "SUCCESS") {
          useErrorStore.getState().setError("Cannot fetch exam");
          useLoadingStore.getState().setLoading(false);
          router.push(`/generate`);
          return;
        }

        const newExam = parseExam(data.result);
        useLoadingStore.getState().setLoading(false);
        setExam(newExam);
      } catch (error) {
        useErrorStore.getState().setError("Cannot fetch exam");
        useLoadingStore.getState().setLoading(false);
        router.push(`/generate`);
        return;
      }
    }

    fetchData();
  }, [router]);

  return (
    <ExamLayout>
      {exam && !loading ? (
        <ExamContent exam={exam} />
      ) : (
        <ExamSkeleton/>
      )}
    </ExamLayout>
  );
}
