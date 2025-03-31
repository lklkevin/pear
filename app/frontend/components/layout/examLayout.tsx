import Nav from "./navNormal";

/**
 * Layout component for exam/test pages
 * Provides consistent structure with navigation and content area for exam views
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to render within the layout
 * @returns {JSX.Element} - Rendered exam page layout with navigation
 */
export default function ExamLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Nav />
      <main className="bg-zinc-950 text-white flex-1 flex flex-col relative w-full max-w-7xl px-4 sm:px-8 pt-8 sm:pt-12 pb-6 sm:pb-8 mx-auto min-h-[calc(100vh-72px)]">
        {children}
      </main>
    </>
  );
}
