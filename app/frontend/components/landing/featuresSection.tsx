import useEmblaCarousel from "embla-carousel-react";
import type { EmblaOptionsType } from "embla-carousel";
import FeatureCards from "./featureCards";

/**
 * Features section component for the landing page
 * Displays a carousel of feature cards on mobile/tablet and a static grid on desktop
 * Includes a title and description of the product's key benefits
 * Uses Embla Carousel for smooth mobile scrolling
 * 
 * @returns {JSX.Element} Features section with responsive layout
 */
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
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight pt-4 sm:pt-8 px-4 sm:px-8">
          Features
        </h1>
        <p className="text-base sm:text-lg text-zinc-400 mt-3 sm:mt-4 md:max-w-[75%] lg:max-w-[60%] xl:max-w-[55%] px-4 sm:px-8">
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