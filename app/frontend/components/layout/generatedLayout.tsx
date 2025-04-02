"use client";

import Generated from "../sidebar/newUser";
import BaseLayout from "./sidebarLayout";

/**
 * Layout component for generated content pages
 * Provides sidebar with saving and sharing options alongside main content
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to render within the main content area
 * @returns {JSX.Element} - Rendered layout with sidebar containing saving/sharing options
 */
export default function GeneratedExamLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Define sidebar content for saving and sharing generated content
  const sidebarContent = (
    <div className="px-4 sm:px-8">
      <h2 className="pl-1 text-2xl sm:text-3xl font-semibold">
        Saving & Sharing
      </h2>
      <Generated />
    </div>
  );

  return <BaseLayout sidebarContent={sidebarContent}>{children}</BaseLayout>;
}
