import FeatureCard from "./featureCard";
import DraggableIcon from "./draggableIcon";
import GenerateButton from "./generateButton";
import ReactCompareImage from "react-compare-image";
import { useRef, useEffect } from "react";

/**
 * Feature cards section component
 * Displays three interactive feature cards showcasing key product capabilities:
 * - Drop and Generate: Interactive upload and customization flow
 * - Relevant Questions: Before/after comparison of question generation
 * - Confident Answers: Visual representation of answer validation system
 * 
 * @returns {JSX.Element} Grid of feature cards with interactive elements
 */
export default function FeatureCards() {
  const compareContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = compareContainerRef.current;
    if (!container) return;

    /**
     * Prevents default touch behavior on the compare image container
     * Ensures smooth interaction with the image comparison slider
     * 
     * @param {TouchEvent} e - Touch event object
     */
    const handleTouchStart = (e: TouchEvent) => {
      e.preventDefault();
    };

    container.addEventListener("touchstart", handleTouchStart, {
      passive: false,
    });

    return () => {
      container.removeEventListener("touchstart", handleTouchStart);
    };
  }, []);

  return (
    <div className="flex gap-4 sm:gap-8 min-w-full">
      <div className="flex-shrink-0">
        <FeatureCard
          title="Drop and Generate"
          description="Simply drag and drop your existing test or homework, and Pear instantly generates customized practice problems matching your content—no setup required."
        >
          <div className="w-full h-full grid grid-cols-3 grid-rows-3 gap-4 sm:gap-6">
            <DraggableIcon
              icon="upload"
              bgColor="bg-emerald-950"
              borderColor="border-emerald-400"
              textColor="text-emerald-400"
            />
            <GenerateButton text="Upload" />
            <GenerateButton text="Customize" />
            <DraggableIcon
              icon="palette"
              bgColor="bg-indigo-950"
              borderColor="border-indigo-400"
              textColor="text-indigo-400"
            />
            <DraggableIcon
              icon="arrow_forward"
              bgColor="bg-emerald-950"
              borderColor="border-emerald-400"
              textColor="text-emerald-400"
            />
            <GenerateButton text="Generate" />
          </div>
        </FeatureCard>
      </div>

      <div className="flex-shrink-0">
        <FeatureCard
          title="Relevant Questions"
          description="Our AI technology analyzes your materials to extract key concepts and problem types, then generates fresh practice questions that perfectly align with what you're studying."
        >
          <div
            ref={compareContainerRef}
            className="w-full h-full flex items-center justify-center rounded-lg sm:rounded-xl overflow-hidden border-2 border-zinc-700"
          >
            <ReactCompareImage
              leftImage="/images/example1.png"
              rightImage="/images/example2.png"
              vertical={true}
              hover={false}
              sliderLineColor="#3f3f46"
            />
          </div>
        </FeatureCard>
      </div>

      <div className="flex-shrink-0">
        <FeatureCard
          title="Confident Answers"
          description="Pear eliminates uncertainty with its advanced answer validation system. Using ensembling techniques, we overcome hallucination issues common in other tools."
        >
          <div className="w-full h-full grid grid-cols-3 grid-rows-3 gap-4 sm:gap-6">
            <DraggableIcon
              icon="lightbulb"
              bgColor="bg-emerald-950"
              borderColor="border-emerald-400"
              textColor="text-emerald-400"
              rounded="rounded-full"
            />
            <DraggableIcon
              icon="lightbulb"
              bgColor="bg-indigo-950"
              borderColor="border-indigo-400"
              textColor="text-indigo-400"
              rounded="rounded-full"
            />
            <DraggableIcon
              icon="lightbulb"
              bgColor="bg-emerald-950"
              borderColor="border-emerald-400"
              textColor="text-emerald-400"
              rounded="rounded-full"
            />
            <div className="font-semibold sm:text-lg col-span-3 w-full h-full border-2 border-zinc-700 items-center justify-center rounded-b-[6rem] flex gap-2 sm:gap-3">
              <span className="material-icons text-zinc-600 font-medium text-2xl sm:text-3xl -mt-0.5">
                arrow_downward
              </span>
              <div className="-mt-0.5">Validation System</div>
              <span className="material-icons text-zinc-600 font-medium text-2xl sm:text-3xl -mt-0.5">
                arrow_downward
              </span>
            </div>
            <div className="col-span-2 font-semibold sm:text-lg w-full h-full border-2 border-zinc-700 flex items-center justify-center rounded-full">
              Final Answer
            </div>
            <DraggableIcon
              icon="check_circle"
              bgColor="bg-emerald-950"
              borderColor="border-emerald-400"
              textColor="text-emerald-400"
              rounded="rounded-full"
            />
          </div>
        </FeatureCard>
      </div>
    </div>
  );
}
