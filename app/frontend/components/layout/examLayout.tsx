import Nav from "./navNormal";

export default function GenerateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Nav />
      <main className="bg-zinc-950 text-white flex-1 flex flex-col relative w-full max-w-7xl px-4 sm:px-8 pt-8 sm:pt-12 pb-4 sm:pb-8 mx-auto min-h-[calc(100vh-72px)]">
        {children}
      </main>
    </>
  );
}
