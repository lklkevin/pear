import ExpandingCardGrid from "./browseGrid";

export default function BrowseSection() {
  return (
    <section className="min-h-96 bg-zinc-900">
      <div className="max-w-7xl mx-auto p-4 sm:p-8">
        <h1 className="text-3xl sm:text-5xl font-bold tracking-tight ">
          Explore
        </h1>
        <p className="text-sm sm:text-base text-zinc-400 mt-2 sm:mt-4 md:max-w-[75%] lg:max-w-[60%] xl:max-w-[50%]">
          Browse through a curated collection of practice materials created by
          other learners across all levels—from kindergarten to university.
        </p>
        <ExpandingCardGrid />
      </div>
    </section>
  );
}
