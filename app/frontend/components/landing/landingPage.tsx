import Nav from "../layout/navNormal";
import HeroSection from "@/components/landing/heroSection";
import FeaturesSection from "@/components/landing/featuresSection";
import BrowseSection from "@/components/landing/browseSection";
import CtaSection from "@/components/landing/ctaSection";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Nav landing={true} />
      <div className="select-none flex flex-col flex-1 overflow-hidden">
        <HeroSection />
        <FeaturesSection />
        <BrowseSection />
        <CtaSection />
      </div>
    </div>
  );
}
