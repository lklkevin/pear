import React from "react";
import CTA from "@/components/landing/cta";
import Graphic from "@/components/landing/graphic";
import Image from "next/image";

const HeroSection = () => {
  return (
    <section className="min-h-[700px] sm:min-h-[800px] md:min-h-[850px] lg:min-h-[900px] h-[calc(100vh-72px)] w-full bg-zinc-950">
      <div className="h-full max-w-7xl mx-auto w-full sm:py-4 px-4 sm:p-8">
        <div className="flex flex-col h-full rounded-xl sm:rounded-2xl w-full relative overflow-hidden bg-zinc-950">
          {/* Background Image */}
          <div className="absolute inset-0">
            <Image
              src="/images/hero.png"
              alt="Hero background"
              fill
              className="object-cover object-center [filter:brightness(0.8)_contrast(1.1)_saturate(1.2)_hue-rotate(-45deg)]"
              priority
            />
            {/* Grain texture */}
            <div
              className="absolute inset-0 opacity-[0.25] mix-blend-multiply"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='2' numOctaves='10' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                backgroundRepeat: "repeat",
              }}
            />
          </div>
          {/* Dark overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-zinc-900/50 to-zinc-950" />

          {/* Content container with padding */}
          <div className="flex flex-col h-full w-full p-4 sm:p-8 relative z-10">
            <div className="flex flex-col items-center text-center mb-auto pt-6 md:pt-8 lg:pt-10">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-2 sm:mb-3 md:mb-4 lg:mb-6">
                Pear Helps You Stay Prepared
              </h1>
              <p className="text-base sm:text-lg md:text-xl text-zinc-300 max-w-2xl mb-4 sm:mb-5 md:mb-6 lg:mb-8">
                AI-powered, tailored math practice—built instantly from your
                exams.
              </p>

              {/* CTA Button */}
              <CTA />
            </div>

            {/* Graphic positioned at the bottom */}
            <div className="w-full mt-auto relative">
              <div
                className="absolute inset-x-0 bottom-0 h-[25%] bg-gradient-to-t from-zinc-950/75 to-zinc-950/0 z-20 pointer-events-none"
                style={{ left: "-2rem", right: "-2rem", bottom: "-2rem" }}
              />
              <Graphic />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
