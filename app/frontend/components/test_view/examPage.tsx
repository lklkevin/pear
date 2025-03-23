import ExamLayout from "../layout/examLayout";
import ExamContent from "./examContent";
import { parseExam } from "./nonUser";
import { Exam } from "./exam";
import { useErrorStore, useLoadingStore } from "../../store/store";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { getSession } from "next-auth/react";
import ExamSkeleton from "./examSkeleton";

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
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/exam/${id}`,
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
        <ExamSkeleton/>
      )}
    </ExamLayout>
  );
}
