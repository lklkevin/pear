import Nav from './navNormal';

export default function BrowseLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <Nav />
      <main className="px-10 py-6">{children}</main>
    </div>
  );
}
