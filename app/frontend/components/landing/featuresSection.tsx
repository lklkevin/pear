import useEmblaCarousel from "embla-carousel-react";
import type { EmblaOptionsType } from "embla-carousel";
import FeatureCards from "./featureCards";

export default function FeaturesSection() {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    skipSnaps: false,
    dragFree: false,
    containScroll: "trimSnaps",
    dragThreshold: 50,
  } as EmblaOptionsType);

  return (
    <section className="min-h-96 bg-gradient-to-b from-zinc-950 to-zinc-900">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl sm:text-5xl font-bold tracking-tight pt-4 sm:pt-8 px-4 sm:px-8">
          Features
        </h1>
        <p className="text-sm sm:text-base text-zinc-400 mt-2 sm:mt-4 md:max-w-[75%] lg:max-w-[60%] xl:max-w-[50%] px-4 sm:px-8">
          Transform your math preparation with Pear. It takes less than 2
          minutes to create personalized practice sets based on your actual
          tests.
        </p>

        <div className="relative mt-8 sm:mt-12 pb-4 sm:pb-8">
          {/* Embla Carousel */}
          <div className="xl:hidden block overflow-hidden px-4 sm:px-8" ref={emblaRef}>
            <FeatureCards />
          </div>
          <div className="hidden xl:block px-4 sm:px-8"><FeatureCards/></div>
        </div>
      </div>
    </section>
  );
} 