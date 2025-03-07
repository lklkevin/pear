import React from "react"
import Nav from "../layout/navNormal"
import Glow from "../landing/glow"
import CTA from "../landing/cta"

const LandingLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex flex-col min-h-screen overflow-hidden">
      <Nav landing={true} />
      <main className="flex flex-1 flex-col h-full relative container w-screen mx-auto py-8 pb-[var(--cta-height,80px)] tracking-normal justify-center items-center">
        {/* White Glow on the right */}
        <Glow
          className="top-[30%] sm:top-[35%] md:top-[30%] lg:top-[20%] right-[25%] sm:right-[30%] md:right-[20%] xl:right-[25%] 2xl:right-[30%]
             w-[450px] h-[450px] md:w-[600px] md:h-[600px] lg:w-[900px] lg:h-[900px]"
          background="radial-gradient(ellipse, rgba(255,255,255,0.75) 0%, transparent 60%)"
        />
        {/* Green Glow on the left */}
        <Glow
          className="top-[30%] sm:top-[35%] md:top-[30%] lg:top-[20%] left-[25%] sm:left-[30%] md:left-[20%] xl:left-[25%] 2xl:left-[30%]
             w-[450px] h-[450px] md:w-[600px] md:h-[600px] lg:w-[900px] lg:h-[900px]"
          background="radial-gradient(ellipse, rgba(6,95,70,0.75) 0%, transparent 70%)"
        />
        {children}
      </main>
      {/* Fixed CTA at the bottom of the viewport */}
      <div className="fixed bottom-12 left-0 right-0 z-50">
        <CTA />
      </div>
    </div>
  );
};

export default LandingLayout

