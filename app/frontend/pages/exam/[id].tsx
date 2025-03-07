import ExamPage from "@/components/test_view/examPage";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

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
      <div className="fixed inset-0 bg-zinc-950/25 backdrop-blur-sm z-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <div className="drop-shadow-xl h-12 w-12 rounded-full border-4 border-emerald-600 border-t-white animate-spin mb-4"></div>
          <p className="text-lg font-medium text-white">Loading...</p>
        </div>
      </div>
    ); // Prevent rendering before ID is ready

  return <ExamPage id={examId} />;
}
