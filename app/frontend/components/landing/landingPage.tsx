import LandingLayout from "../layout/landingLayout";
import Graphic from "./graphic";

export default function Home() {
  return (
    <LandingLayout>
      {/* Headings Section */}
      <section
        className="text-center mb-24"
        style={{ zIndex: "-10" }}
      >
        <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold md:mb-2 tracking-tight sm:tracking-normal">
          Custom Practice Tests,
        </h1>
        <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold mb-3 md:mb-6 tracking-tight sm:tracking-normal">
          Built Instantly from Your Exams
        </h1>
        <h3 className="font-medium text-sm md:text-base lg:text-lg text-zinc-300 -z-10 tracking-tight sm:tracking-normal">
          AI-powered, tailored math practice—built just for you.
        </h3>
      </section>
      {/* Graphic Section */}
      <section>
        <Graphic />
      </section>
    </LandingLayout>
  );
}