import Nav from "@/components/nav/navNormal";
import Graphic from "@/components/landing/graphic";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen overflow-hidden">
      <Nav />
      <main className="relative flex-grow container mx-auto px-4 py-8 tracking-normal overflow-hidden">
        <div
          className="absolute pointer-events-none"
          style={{
            top: "10%",
            left: "10%",
            width: "900px",
            height: "900px",
            background:
              "radial-gradient(ellipse, rgba(255,255,255,0.5) 0%, transparent 60%)",
            filter: "blur(50px)",
            zIndex: -1,
          }}
        />
        <div
          className="absolute pointer-events-none"
          style={{
            top: "10%",
            right: "10%",
            width: "900px",
            height: "900px",
            background:
              "radial-gradient(ellipse, rgba(6,95,70,0.5) 0%, transparent 70%)",
            filter: "blur(50px)",
            zIndex: -1,
          }}
        />
        {/* Headings Section */}
        <section className="text-center mt-20 mb-28">
          <h1 className="text-5xl font-bold mb-2 -z-10">
            Custom Practice Tests,
          </h1>
          <h1 className="text-5xl font-bold mb-6 -z-10">
            Built Instantly from Your Exams
          </h1>
          <h3 className="font-medium text-lg text-zinc-300 -z-10">
            AI-powered, tailored math practice—built just for you.
          </h3>
        </section>
        {/* Graphic Section */}
        <section>
          <Graphic />
        </section>
        {/* Call-to-Action Button */}
        <section className="text-center mt-28">
          <button className="group mx-auto w-96 max-w-lg flex items-center justify-between rounded-3xl bg-emerald-200 bg-opacity-25 text-white py-4 px-6 border border-white font-medium text-lg text-left transition-colors duration-200 hover:bg-emerald-900 hover:bg-opacity-100">
            <span>Try now for free</span>
            <span className="material-icons text-3xl transition-transform duration-200 group-hover:translate-x-2">
              arrow_forward
            </span>
          </button>
        </section>
      </main>
    </div>
  );
}
