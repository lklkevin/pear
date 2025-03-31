import { useState } from "react";
import Link from "next/link";
import Button from "../ui/longButtonGreen";
import {
  VisibilityOption,
  Visibility,
} from "@/components/form/visibilityOption";
import {
  StylingOptions,
  Color,
  colors,
} from "@/components/form/stylingOptions";
import { useErrorStore, useLoadingStore, useSuccStore } from "@/store/store";
import { getSession, useSession } from "next-auth/react";
import { useRouter } from "next/router";

/**
 * Interface for a single exam question
 * @interface RawExamQuestion
 * @property {string} question - The question text
 * @property {Record<string, number>} answers - Map of answer options to their correctness scores
 */
interface RawExamQuestion {
  question: string;
  answers: Record<string, number>;
}

/**
 * Interface for a complete exam
 * @interface RawExam
 * @property {string} title - Exam title
 * @property {string} description - Exam description
 * @property {RawExamQuestion[]} questions - Array of exam questions
 * @property {string} [privacy] - Privacy setting (0 for private, 1 for public)
 * @property {string} [color] - Theme color in hex format
 */
export interface RawExam {
  title: string;
  description: string;
  questions: RawExamQuestion[];
  privacy?: string;
  color?: string;
}

/**
 * Sidebar component for new users
 * Provides options for saving generated exams
 * Features visibility settings and styling options
 * Handles authentication state and exam saving
 * 
 * @returns {JSX.Element} Sidebar with save options and authentication prompts
 */
export default function Sidebar() {
  // State for managing visibility setting (Private/Public)
  const [visibility, setVisibility] = useState<Visibility>("private");
  const { data: session, status } = useSession();

  // State for managing selected styling color
  const [selectedColor, setSelectedColor] = useState<Color>("teal");
  const router = useRouter();

  /**
   * Handles the exam saving process
   * Fetches the generated exam from the backend
   * Updates privacy and color settings
   * Saves the exam for authenticated users
   * 
   * @async
   * @throws {Error} If exam cannot be fetched or saved
   */
  const handleSave = async () => {
    useLoadingStore.getState().setLoading(true);
    useSuccStore.getState().setSuccess("");

    if (!sessionStorage.getItem("browserSessionId")) {
      useErrorStore.getState().setError("Cannot fetch exam");
      useLoadingStore.getState().setLoading(false);
      return;
    }

    const taskId = sessionStorage.getItem("browserSessionId");

    try {
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
        useErrorStore
          .getState()
          .setError("Cannot fetch exam, please try again");
        useLoadingStore.getState().setLoading(false);
        return;
      }

      const privacyValue = visibility === "public" ? "1" : "0";
      const selectedColorHex =
        colors.find((c) => c.value === selectedColor)?.hex || "#3f3f46";

      data.result.privacy = privacyValue;
      data.result.color = selectedColorHex;

      const currSession = await getSession();

      if (!currSession?.accessToken) {
        useErrorStore.getState().setError("Please sign in to save your exam");
        useLoadingStore.getState().setLoading(false);
        return;
      }

      const saveResponse = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/exam/generate/save-after`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${currSession?.accessToken}`,
          },
          method: "POST",
          body: JSON.stringify(data.result),
        }
      );

      const saveResult = await saveResponse.json();
      if (!saveResponse.ok || saveResult?.message) {
        useErrorStore
          .getState()
          .setError(
            saveResult?.message ||
              "Error saving exam, make sure you are signed in"
          );
        useLoadingStore.getState().setLoading(false);
        return;
      }

      sessionStorage.removeItem("browserSessionId");
      useLoadingStore.getState().setLoading(false);
      useSuccStore.getState().setSuccess("Exam saved successfully!");
      router.push(`/exam/${saveResult.exam_id}`);
    } catch (error) {
      useErrorStore
        .getState()
        .setError("Error saving exam, make sure you are signed in");
      useLoadingStore.getState().setLoading(false);
      return;
    }
  };

  const callbackUrl = encodeURIComponent(router.asPath);

  // Array of available color options with their corresponding CSS classes
  return (
    <div className="pl-1 flex flex-col">
      {/* Login/Signup Call to Action */}
      {session && status === "authenticated" ? (
        <>
          <p className="text-zinc-300 my-4">Enjoy your new exam!</p>
          <p className="text-zinc-300">
            Want to save? Choose your options below and press save.
          </p>
        </>
      ) : (
        <>
          <p className="text-zinc-300 my-4">Enjoy your new exam!</p>
          <p className="text-zinc-300">
            If you want to save it for later or share it with the world, first{" "}
            <Link
              href={`/signup?callbackUrl=${callbackUrl}`}
              className="text-emerald-500 hover:text-emerald-400"
            >
              sign up
            </Link>{" "}
            or{" "}
            <Link
              href={`/login?callbackUrl=${callbackUrl}`}
              className="text-emerald-500 hover:text-emerald-400"
            >
              login
            </Link>
            .
          </p>
        </>
      )}

      {/* Visibility Selection (Private/Public) */}
      <div>
        <h3 className="text-lg sm:text-xl font-semibold mt-4 sm:mt-8 mb-2 sm:mb-4">
          Visibility
        </h3>
        <div className="flex-col flex gap-4 w-full">
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
        </div>
      </div>

      {/* Styling Selection */}
      <StylingOptions
        selectedColor={selectedColor}
        setSelectedColor={setSelectedColor}
      />

      {/* Save Button */}
      <div className="mt-4 text-lg">
        <Button text={"Save"} onClick={handleSave} />
      </div>
    </div>
  );
}
