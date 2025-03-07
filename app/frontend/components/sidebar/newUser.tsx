import { useState } from "react";
import Link from "next/link";
import Button from "../ui/buttonGreen";
import {
  VisibilityOption,
  Visibility,
} from "@/components/form/visibilityOption";
import {
  StylingOptions,
  Color,
  colors,
} from "@/components/form/stylingOptions";
import { useErrorStore, useLoadingStore } from "@/store/store";
import { getSession } from "next-auth/react";
import { useRouter } from "next/router";

interface RawExamQuestion {
  question: string;
  answers: Record<string, number>;
}

export interface RawExam {
  title: string;
  description: string;
  questions: RawExamQuestion[];
  privacy?: string;
  color?: string;
}

export default function Sidebar() {
  // State for managing visibility setting (Private/Public)
  const [visibility, setVisibility] = useState<Visibility>("private");

  // State for managing selected styling color
  const [selectedColor, setSelectedColor] = useState<Color>("teal");
  const router = useRouter();

  const handleSave = async () => {
    useLoadingStore.getState().setLoading(true);

    if (!localStorage.getItem("browserSessionId")) {
      useErrorStore.getState().setError("Cannot fetch exam");
      useLoadingStore.getState().setLoading(false);
      return;
    }

    const sessionId = localStorage.getItem("browserSessionId");
    const cacheKey = `exam:${sessionId}`;

    try {
      const response = await fetch(`/api/fetchExam`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cacheKey: cacheKey,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        useErrorStore.getState().setError("Cannot fetch exam");
        useLoadingStore.getState().setLoading(false);
        return;
      }

      if (result.message) {
        useErrorStore.getState().setError(result.message);
        useLoadingStore.getState().setLoading(false);
        return;
      } else {
        const privacyValue = visibility === "public" ? "1" : "0";
        const selectedColorHex =
          colors.find((c) => c.value === selectedColor)?.hex || "#3f3f46";

        result.privacy = privacyValue;
        result.color = selectedColorHex;

        const currSession = await getSession();
        const saveResponse = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/exam/generate/save-after`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${currSession?.accessToken}`,
            },
            method: "POST",
            body: JSON.stringify(result),
          }
        );

        const saveResult = await saveResponse.json();
        if (!saveResponse.ok) {
          useErrorStore
            .getState()
            .setError("Error saving exam, make sure you are signed in");
          useLoadingStore.getState().setLoading(false);
          return;
        }

        if (saveResult.message) {
          useErrorStore.getState().setError(saveResult.message);
          useLoadingStore.getState().setLoading(false);
        } else {
          localStorage.removeItem("browserSessionId");
          useLoadingStore.getState().setLoading(false);
          router.push(`/exam/${saveResult.exam_id}`);
        }
      }
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
      {/* Information Text */}
      <p className="text-zinc-300 my-4">Enjoy your new exam!</p>

      {/* Login/Signup Call to Action */}
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
      <div className="mt-4 mb-8">
        <Button text={"Save"} onClick={handleSave} />
      </div>
    </div>
  );
}
