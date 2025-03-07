import Nav from './navNormal';

export default function BrowseLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-zinc-950 text-white overflow-hidden flex flex-col">
      <Nav />
      <main className="flex-1 flex flex-col relative w-full max-w-7xl px-4 sm:px-8 py-8 sm:py-12 mx-auto min-h-[calc(100vh-72px)]">{children}</main>
    </div>
  );
}
