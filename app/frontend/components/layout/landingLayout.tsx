import React from "react";
import Nav from "../layout/navNormal";
import HeroSection from "@/components/landing/heroSection";

const LandingLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex flex-col min-h-screen">
      <Nav landing={true} />
      <div className="flex flex-col flex-1 overflow-hidden">
        <HeroSection />
        <section className="min-h-96 bg-zinc-900"></section>
      </div>
      {children}
    </div>
  );
};

export default LandingLayout;
