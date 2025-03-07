import Nav from './navNormal';

export default function BrowseLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-zinc-950 text-white overflow-hidden flex flex-col">
      <Nav />
      <main className="flex-1 flex flex-col relative w-full max-w-7xl mx-auto py-8 px-8 sm:py-12">{children}</main>
    </div>
  );
}
