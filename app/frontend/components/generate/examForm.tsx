import InputField from "../form/inputField";
import FileUpload from "../form/fileUpload";
import GreenButton from "../ui/longButtonGreen";
import { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { useSession, getSession } from "next-auth/react";
import Counter from "./counter";
import { useErrorStore, useLoadingStore } from "@/store/store";
import { useRouter } from "next/router";

export default function ExamForm() {
  const router = useRouter();
  const [files, setFiles] = useState<File[]>([]);
  const [count, setCount] = useState(5);
  const [examTitle, setExamTitle] = useState("");
  const [examDescription, setExamDescription] = useState("");
  const { data: session } = useSession();

  useEffect(() => {
    if (!localStorage.getItem("browserSessionId")) {
      localStorage.setItem("browserSessionId", uuidv4());
    }
  }, []);

  const handleGenerate = async () => {
    // If there's no active session (i.e., guest user)
    if (!session) {
      // Clear any previous errors in the global state
      useErrorStore.getState().setError(null);

      // Prepare the FormData with all required fields and files
      const formData = new FormData();
      files.forEach((file) => formData.append("files", file));
      formData.append("title", examTitle || "Untitled Exam");
      formData.append(
        "description",
        examDescription || "No description was provided"
      );
      formData.append("num_questions", count.toString());
      console.log(formData);

      try {
        // Make the POST request to the backend endpoint
        useLoadingStore.getState().setLoading(true);
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/exam/generate`,
          {
            method: "POST",
            body: formData,
          }
        );

        const result = await response.json();

        if (!response.ok) {
          useErrorStore.getState().setError("Error generating exam");
          useLoadingStore.getState().setLoading(false);
          return;
        }

        if (result.message) {
          useErrorStore.getState().setError(result.message);
          useLoadingStore.getState().setLoading(false);
          return;
        } else {
          const browserSessionId = localStorage.getItem("browserSessionId");
          try {
            const cacheResponse = await fetch(`/api/cacheExam`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                sessionId: browserSessionId,
                results: result,
              }),
            });

            const cacheResult = await cacheResponse.json();

            if (!cacheResponse.ok || cacheResult.message) {
              useErrorStore
                .getState()
                .setError("Error retrieving the generated exam");
              useLoadingStore.getState().setLoading(false);
              return;
            }

            useLoadingStore.getState().setLoading(false);
            router.push("/generated");
          } catch (error) {
            useErrorStore
              .getState()
              .setError("Error retrieving the generated exam");
          }
          useLoadingStore.getState().setLoading(false);
        }
      } catch (error) {
        // Handle errors by setting the global error state
        if (error instanceof Error) {
          useErrorStore
            .getState()
            .setError(error.message || "Error generating exam");
        } else {
          useErrorStore.getState().setError("Error generating exam");
        }
        useLoadingStore.getState().setLoading(false);
      }
    } else {
      // Optionally handle the case for authenticated users
      console.log("Authenticated user detected. Handle accordingly if needed.");
    }
  };

  return (
    <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8  h-full">
      {/* Left: File Upload */}
      <div className="flex flex-col h-full">
        <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-4">
          File Upload
        </h3>
        {/* The container below will fill the remaining space */}
        <div className="flex-1">
          <FileUpload files={files} setFiles={setFiles} />
        </div>
      </div>

      {/* Right: Form Fields */}
      <div className="flex flex-col h-full gap-8">
        <div>
          <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-4">
            Exam Title
          </h3>
          <InputField
            placeholder="Untitled Exam"
            value={examTitle}
            onChange={(e) => setExamTitle(e.target.value)}
          />

          <h3 className="text-lg sm:text-xl font-semibold mt-4 sm:mt-8 mb-2 sm:mb-4">
            Description
          </h3>
          <InputField
            placeholder="What do you want the exam to focus on?"
            textarea={true}
            value={examDescription}
            onChange={(e) => setExamDescription(e.target.value)}
          />

          <div className="mt-4 sm:mt-8 mb-2 sm:mb-4 flex flex-row justify-between">
            <h3 className="text-lg sm:text-xl font-semibold">Questions</h3>
            <Counter
              value={count}
              onChange={setCount}
              min={1}
              max={10}
              step={1}
            />
          </div>
        </div>
        {/* mt-auto pushes the button container to the bottom */}
        <div className="text-lg mt-auto">
          <GreenButton text="Generate" onClick={handleGenerate} />
        </div>
      </div>
    </div>
  );
}
