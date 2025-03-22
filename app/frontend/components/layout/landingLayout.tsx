import React from "react";
import Nav from "../layout/navNormal";
import ImageCompare from "../ui/imageCompare";
import CTA from "@/components/landing/cta";
import Graphic from "@/components/landing/graphic";

const LandingLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex flex-col min-h-screen">
      <Nav landing={true} />
      <div className="flex flex-col flex-1 overflow-hidden">
        <section className="h-[calc(100vh-72px)] w-full">
          <div className="h-full max-w-7xl mx-auto w-full p-4 sm:p-8">
            <div className="flex flex-col h-full rounded-xl sm:rounded-2xl bg-gradient-to-b from-zinc-900 to-zinc-950 w-full p-4 sm:p-8">
              <div className="flex flex-col items-center text-center mb-auto pt-8 sm:pt-12">
                <h1 className="mt-4 text-5xl sm:text-4xl md:text-5xl font-bold text-white mb-6">
                  Custom Practice Tests,<br></br>
                  Built Instantly from Your Exams
                </h1>
                <p className="text-zinc-400 text-lg max-w-2xl mb-8">
                  AI-powered, tailored math practice—built just for you.
                </p>

                {/* CTA Button */}
                <CTA />
              </div>

              {/* Graphic positioned at the bottom */}
              <div className="w-full mt-auto">
                <Graphic />
              </div>
            </div>
          </div>
        </section>
        <section className="min-h-96 bg-zinc-900"></section>
      </div>
      {children}
    </div>
  );
};

export default LandingLayout;
