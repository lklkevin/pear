import InputField from "../form/inputField";
import FileUpload from "../form/fileUpload";
import GreenButton from "../ui/longButtonGreen";
import { useState } from "react";
import { useSession, getSession } from "next-auth/react";
import Counter from "./counter";
import { useErrorStore, useLoadingStore } from "@/store/store";

export default function ExamForm() {
  const [files, setFiles] = useState<File[]>([]);
  const [count, setCount] = useState(5);
  const [examTitle, setExamTitle] = useState("");
  const [examDescription, setExamDescription] = useState("");
  const { data: session } = useSession();

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
          // Throw an error to be caught below if response not OK
          useErrorStore.getState().setError("Error generating exam");
          useLoadingStore.getState().setLoading(false);
          return;
        }

        if (result.message) {
          useErrorStore.getState().setError(result.message);
          useLoadingStore.getState().setLoading(false);
          return;
        } else {
          //cache it here -> redirect
          console.log("Exam generated successfully:", result);
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
    <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-8 xl:gap-16 h-full">
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
