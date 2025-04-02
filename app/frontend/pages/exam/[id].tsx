import ExamPage from "@/components/test_view/examPage";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import ExamSkeleton from "@/components/test_view/examSkeleton";
import ExamLayout from "@/components/layout/examLayout";

/**
 * Dynamic exam page route component
 * Features:
 * - Dynamic routing based on exam ID
 * - Loading state handling
 * - Exam content display
 * - Consistent layout
 * 
 * @returns {JSX.Element} Exam page with content or loading skeleton
 */
export default function Page() {
  const router = useRouter();
  const [examId, setExamId] = useState<string | null>(null);

  /**
   * Effect to handle exam ID extraction from route
   * - Waits for router to be ready
   * - Validates and sets exam ID
   * - Defaults to "0" if ID is invalid
   */
  useEffect(() => {
    if (router.isReady) {
      const id = router.query.id;
      setExamId(typeof id === "string" ? id : "0");
    }
  }, [router.isReady, router.query.id]);

  // Show loading skeleton while exam ID is being resolved
  if (!examId)
    return (
      <ExamLayout>
        <ExamSkeleton />
      </ExamLayout>
    );

  return <ExamPage id={examId} />;
}
