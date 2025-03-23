"use client";

import InfoCard from "../sidebar/infoCard";
import { useLoadingStore } from "@/store/store";
import ProgressBar from "../ui/loading";
import BaseLayout from "./sidebarLayout";

export default function GenerateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { loading, loadingMessage, progressPercentage } = useLoadingStore();
  
  const sidebarContent = (
    <div className="pr-4 sm:pr-8">
      <h2 className="ml-5 sm:ml-9 text-2xl sm:text-3xl font-semibold">
        Getting Started
      </h2>
      <ul className="sm:mt-6 mt-4 space-y-4 sm:space-y-8">
        {[
          {
            number: 1,
            mainText: "Upload Past Exams",
            text: "Drop up to 5 past exams in the file upload box. We will analyze their contents and generate new exams.",
          },
          {
            number: 2,
            mainText: "Include Optional Info",
            text: "You can write a title and description to help us align the content of the new exam to your exact needs.",
          },
          {
            number: 3,
            mainText: "Generate!",
            text: "Click generate and we will work our magic. Check back in a minute or two to see your new exam!",
          },
          {
            number: 4,
            mainText: "Sign Up and Save",
            text: "Sign up for an account to save your exam and share it with others. You can also specify the visibility.",
          },
        ].map((step, index) => (
          <InfoCard
            key={index}
            number={step.number}
            mainText={step.mainText}
            text={step.text}
          />
        ))}
      </ul>
    </div>
  );

  const footerContent = loading ? (
    <ProgressBar
      progressPercentage={progressPercentage}
      loadingMessage={
        loadingMessage ? loadingMessage : "Generating your new exam..."
      }
    />
  ) : null;

  return (
    <BaseLayout 
      sidebarContent={sidebarContent} 
      otherContent={footerContent}
    >
      {children}
    </BaseLayout>
  );
}
