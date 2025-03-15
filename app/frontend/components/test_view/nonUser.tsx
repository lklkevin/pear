import ExamLayout from "@/components/layout/generatedLayout";
import { AlternativeAnswer, Question, Exam } from "./exam";
import ExamContent from "./examContent";
import { useErrorStore, useLoadingStore } from "@/store/store";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";

interface RawExamQuestion {
  question: string;
  answers: Record<string, number>;
}

export interface RawExam {
  title: string;
  description: string;
  questions: RawExamQuestion[];
  privacy?: string;
}

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

export default function Page() {
  const { loading } = useLoadingStore();
  const router = useRouter();
  const [exam, setExam] = useState<Exam>();

  useEffect(() => {
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
        <div className="fixed inset-0 bg-zinc-950/25 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="flex flex-col items-center gap-2">
            <div className="drop-shadow-xl h-12 w-12 rounded-full border-4 border-emerald-600 border-t-white animate-spin mb-4"></div>
            <p className="text-lg font-medium text-white">Loading...</p>
          </div>
        </div>
      )}
    </ExamLayout>
  );
}
