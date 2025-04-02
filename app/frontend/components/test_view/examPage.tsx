import ExamLayout from "../layout/examLayout";
import ExamContent from "./examContent";
import { parseExam } from "./nonUser";
import { Exam } from "./exam";
import { useErrorStore, useLoadingStore } from "../../store/store";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { getSession } from "next-auth/react";
import ExamSkeleton from "./examSkeleton";

/**
 * Props for the Page component
 * @interface PageProps
 * @property {string} id - ID of the exam to fetch and display
 */
interface PageProps {
  id: string;
}

/**
 * Authenticated user exam view component
 * Fetches and displays a saved exam by ID
 * Handles authentication and loading states
 * Redirects to home page on error
 * 
 * @param {PageProps} props - Component props
 * @returns {JSX.Element} Exam view with content or loading skeleton
 */
export default function Page({ id }: PageProps) {
  const { loading } = useLoadingStore();
  const router = useRouter();
  const [exam, setExam] = useState<Exam>();

  useEffect(() => {
    /**
     * Fetches exam data from the backend
     * Handles authentication and error cases
     * Updates loading state and redirects on error
     */
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
