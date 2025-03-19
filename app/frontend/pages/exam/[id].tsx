import ExamPage from "@/components/test_view/examPage";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import ExamSkeleton from "@/components/test_view/examSkeleton";
import ExamLayout from "@/components/layout/examLayout";

export default function Page() {
  const router = useRouter();
  const [examId, setExamId] = useState<string | null>(null);

  useEffect(() => {
    if (router.isReady) {
      const id = router.query.id;
      setExamId(typeof id === "string" ? id : "0");
    }
  }, [router.isReady, router.query.id]);

  if (!examId)
    return (
      <ExamLayout>
        <ExamSkeleton />
      </ExamLayout>
    ); // Prevent rendering before ID is ready

  return <ExamPage id={examId} />;
}
