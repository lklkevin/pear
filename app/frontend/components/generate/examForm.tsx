import InputField from "../form/inputField";
import FileUpload from "../form/fileUpload";
import GreenButton from "../ui/longButtonGreen";
import { useState } from "react";
import { useSession, getSession } from "next-auth/react";
import Counter from "./counter";
import { useErrorStore, useLoadingStore } from "@/store/store";
import { useRouter } from "next/router";
import { Skeleton } from "../ui/skeleton";
import {
  VisibilityOption,
  Visibility,
} from "@/components/form/visibilityOption";
import {
  StylingOptions,
  Color,
  colors,
} from "@/components/form/stylingOptions";

export default function ExamForm() {
  const router = useRouter();
  const [files, setFiles] = useState<File[]>([]);
  const [count, setCount] = useState(5);
  const [examTitle, setExamTitle] = useState("");
  const [examDescription, setExamDescription] = useState("");
  const { data: session, status } = useSession();
  const [visibility, setVisibility] = useState<Visibility>("private");
  const [selectedColor, setSelectedColor] = useState<Color>("teal");

  // Polling function
  const pollTask = async (
    taskId: string,
    onSuccess: (taskResult: any, taskId: string) => void
  ) => {
    useLoadingStore.getState().setProgress(0);
    const pollInterval = 5000; // Poll every 5 seconds
    const maxPollTime = 6 * 60 * 1000; // 5 minutes max
    const startTime = Date.now();

    const poll = async () => {
      try {
        const taskResponse = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/task/${taskId}`
        );
        if (!taskResponse.ok) {
          useErrorStore
            .getState()
            .setError("Error generating exam, please try again later");
          useLoadingStore.getState().setLoading(false);
          useLoadingStore.getState().setLoadingMessage(null);
          useLoadingStore.getState().setProgress(0);
          return;
        }

        const taskResult = await taskResponse.json();

        if (taskResult.state === "SUCCESS") {
          // Execute the provided success callback based on the mode
          onSuccess(taskResult, taskId);
          useLoadingStore.getState().setLoading(false);
          useLoadingStore.getState().setLoadingMessage(null);
          useLoadingStore.getState().setProgress(0);
          return;
        } else if (taskResult.state === "FAILURE") {
          const errorMsg = taskResult.result
            ? typeof taskResult.result === "object"
              ? JSON.stringify(taskResult.result)
              : String(taskResult.result)
            : "Error generating exam, please try again later";
          useErrorStore.getState().setError(errorMsg);
          useLoadingStore.getState().setLoading(false);
          useLoadingStore.getState().setLoadingMessage(null);
          useLoadingStore.getState().setProgress(0);
          return;
        } else if (taskResult.state === "PROGRESS") {
          const progressInfo = taskResult.result?.status || "Processing...";
          useLoadingStore.getState().setLoadingMessage(progressInfo);

          if (
            taskResult.result?.current != null &&
            taskResult.result?.total != null
          ) {
            const { current, total } = taskResult.result;
            const percentage = Math.floor((current / total) * 100);
            useLoadingStore.getState().setProgress(percentage);
          }
        }

        // Check if we've reached maximum polling time
        if (Date.now() - startTime >= maxPollTime) {
          useErrorStore
            .getState()
            .setError("Error generating exam, please try again later");
          useLoadingStore.getState().setLoading(false);
          useLoadingStore.getState().setLoadingMessage(null);
          useLoadingStore.getState().setProgress(0);
          return;
        }

        // Schedule next poll
        setTimeout(poll, pollInterval);
      } catch (error) {
        useErrorStore
          .getState()
          .setError("Error generating exam, please try again later");
        useLoadingStore.getState().setLoading(false);
        useLoadingStore.getState().setLoadingMessage(null);
        useLoadingStore.getState().setProgress(0);
      }
    };

    poll();
  };

  const handleGenerate = async () => {
    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));
    formData.append("title", examTitle || "Untitled Exam");
    formData.append(
      "description",
      examDescription || "No description was provided"
    );
    formData.append("num_questions", count.toString() || "3");
    useErrorStore.getState().setError(null);

    // Determine which endpoint to call
    let endpoint = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/exam/generate`;
    let requestOptions: RequestInit = {
      method: "POST",
      body: formData,
    };

    // Flag to determine which success action to use
    let isGenerateSave = false;
    if (session && visibility !== "unsaved") {
      endpoint = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/exam/generate/save`;
      isGenerateSave = true;

      const privacyValue = visibility === "public" ? "1" : "0";
      formData.append("privacy", privacyValue);

      const selectedColorHex =
        colors.find((c) => c.value === selectedColor)?.hex || "#3f3f46";
      formData.append("color", selectedColorHex);

      const currSession = await getSession();
      requestOptions = {
        ...requestOptions,
        headers: {
          Authorization: `Bearer ${currSession?.accessToken}`,
        },
      };
      useLoadingStore
        .getState()
        .setLoadingMessage("Generating and saving your exam...");
    } else {
      useLoadingStore
        .getState()
        .setLoadingMessage("Preparing to generate exam...");
    }

    try {
      useLoadingStore.getState().setLoading(true);
      const response = await fetch(endpoint, requestOptions);
      const result = await response.json();

      if (!response.ok || result?.message) {
        useErrorStore
          .getState()
          .setError(result?.message || "Error generating exam");
        useLoadingStore.getState().setLoading(false);
        useLoadingStore.getState().setLoadingMessage(null);
        return;
      }

      const taskId = result?.task_id;
      if (!taskId) {
        useErrorStore
          .getState()
          .setError("Error generating exam, please try again later");
        useLoadingStore.getState().setLoading(false);
        useLoadingStore.getState().setLoadingMessage(null);
        return;
      }

      // Pass a different success callback based on the endpoint used
      pollTask(taskId, (taskResult, taskId) => {
        if (isGenerateSave) {
          router.push(`/exam/${taskResult.result.exam_id}`);
        } else {
          sessionStorage.setItem("browserSessionId", taskId);
          router.push("/generated");
        }
      });
    } catch (error) {
      if (error instanceof Error) {
        useErrorStore
          .getState()
          .setError(
            error.message || "Error generating exam, please try again later"
          );
      } else {
        useErrorStore
          .getState()
          .setError("Error generating exam, please try again later");
      }
      useLoadingStore.getState().setLoading(false);
      useLoadingStore.getState().setLoadingMessage(null);
    }
  };

  return (
    <div className="mt-6 sm:mt-8 grid grid-cols-1 lg:grid-cols-2 sm:gap-8 h-full">
      {/* Left: File Upload */}
      <div className="flex flex-col h-full">
        {status === "loading" ? (
          <>
            <Skeleton className="h-[1.75rem] mb-2 sm:mb-4 w-1/3"></Skeleton>
            <Skeleton className="min-h-[260px] sm:min-h-[284px] flex-1 rounded-lg"></Skeleton>
          </>
        ) : (
          <>
            <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-4">
              File Upload
            </h3>
            <div className="flex-1">
              <FileUpload files={files} setFiles={setFiles} />
            </div>
          </>
        )}
      </div>

      {/* Right: Form Fields */}
      {status === "loading" ? (
        <div className="flex flex-col h-full gap-8 justify-between">
          <div>
            <Skeleton className="h-7 mt-4 sm:mt-0 mb-2 sm:mb-4 w-1/3"></Skeleton>
            <Skeleton className="rounded-md h-[42px]"></Skeleton>
            <Skeleton className="h-7 mt-4 sm:mt-8 mb-2 sm:mb-4 w-1/3"></Skeleton>
            <Skeleton className="rounded-md h-[114px]"></Skeleton>
            <div className="mt-4 sm:mt-8 mb-2 sm:mb-4 h-9 flex flex-row justify-between">
              <Skeleton className="w-1/4 h-full"></Skeleton>
              <Skeleton className="w-1/3 h-full"></Skeleton>
            </div>
            <Skeleton className="h-7 mt-4 sm:mt-8 mb-2 sm:mb-4 w-1/3"></Skeleton>
            <div className="flex-col xl:flex-row flex gap-4 w-full">
              <Skeleton className="h-[66px] w-full"></Skeleton>
              <Skeleton className="h-[66px] w-full"></Skeleton>
              <Skeleton className="h-[66px] w-full"></Skeleton>
            </div>
            <div className="mt-4 sm:mt-8 mb-2 sm:mb-4 h-7 flex flex-row justify-between">
              <Skeleton className="w-1/4 h-full"></Skeleton>
              <Skeleton className="w-2/5 h-full"></Skeleton>
            </div>
          </div>
          <Skeleton className="w-full h-[46px]"></Skeleton>
        </div>
      ) : (
        <div className="flex flex-col h-full gap-8 justify-between">
          <div>
            <h3 className="text-lg sm:text-xl font-semibold mt-4 sm:mt-0 mb-2 sm:mb-4">
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

            {session && (
              <>
                <h3 className="text-lg sm:text-xl font-semibold mt-4 sm:mt-8 mb-2 sm:mb-4">
                  Visibility
                </h3>
                <div className="flex-col xl:flex-row flex gap-4 w-full overflow-x-auto scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-zinc-950">
                  <VisibilityOption
                    option="private"
                    selected={visibility === "private"}
                    label="Private"
                    subText="Only visible to you"
                    onChange={() => setVisibility("private")}
                  />
                  <VisibilityOption
                    option="public"
                    selected={visibility === "public"}
                    label="Public"
                    subText="Visible to everyone"
                    onChange={() => setVisibility("public")}
                  />
                  <VisibilityOption
                    option="unsaved"
                    selected={visibility === "unsaved"}
                    label="Unsaved"
                    subText="Will not be saved"
                    onChange={() => setVisibility("unsaved")}
                  />
                </div>
              </>
            )}

            {session && visibility !== "unsaved" && (
              <StylingOptions
                selectedColor={selectedColor}
                setSelectedColor={setSelectedColor}
              />
            )}
          </div>
          <div className="text-lg">
            <GreenButton text="Generate" onClick={handleGenerate} />
          </div>
        </div>
      )}
    </div>
  );
}
