import Nav from "../layout/navNormal";
import HeroSection from "@/components/landing/heroSection";
import FeaturesSection from "@/components/landing/featuresSection";
import BrowseSection from "@/components/landing/browseSection";
import CtaSection from "@/components/landing/ctaSection";

/**
 * Main landing page component
 * Composes the landing page from multiple sections:
 * - Navigation bar
 * - Hero section with main message
 * - Features showcase
 * - Browse section
 * - Call-to-action section
 * 
 * @returns {JSX.Element} Complete landing page layout
 */
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
