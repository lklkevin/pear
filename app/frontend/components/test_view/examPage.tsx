import ExamLayout from "../layout/examLayout";
import ExamContent from "./examContent";
import { parseExam } from "./nonUser";
import { Exam } from "./exam";
import { useErrorStore, useLoadingStore } from "@/store/store";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { getSession } from "next-auth/react";

export default function Page({ id }: { id: string }) {
  const { loading } = useLoadingStore();
  const router = useRouter();
  const [exam, setExam] = useState<Exam>();

  useEffect(() => {
    async function fetchData() {
      try {
        useLoadingStore.getState().setLoading(true);

        const currSession = await getSession(); // Get session

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_OTHER_BACKEND_URL}/api/exam/${id}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              ...(currSession?.accessToken && {
                Authorization: `Bearer ${currSession.accessToken}`,
              }),
            },
          }
        );

        const result = await response.json();

        if (!response.ok) {
          useErrorStore.getState().setError("Cannot fetch exam");
          useLoadingStore.getState().setLoading(false);
          router.push(`/`);
          return;
        }

        if (result.message) {
          useErrorStore.getState().setError(result.message);
          router.push(`/`);
          return;
        } else {
          const newExam = parseExam(result);
          setExam(newExam);
        }
        useLoadingStore.getState().setLoading(false);
      } catch (error) {
        useErrorStore.getState().setError("Cannot fetch exam");
        useLoadingStore.getState().setLoading(false);
        router.push(`/`);
        return;
      }
    }

    fetchData();
  }, [router, id]);

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
