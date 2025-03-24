"use client";

import Generated from "../sidebar/newUser";
import BaseLayout from "./sidebarLayout";

export default function GenerateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
