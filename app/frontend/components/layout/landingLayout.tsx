// /components/layout/LandingLayout.js
import Nav from "../layout/navNormal";
import Glow from "../landing/glow";
import CTA from "../landing/cta";

const LandingLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex flex-col min-h-screen overflow-hidden">
      <Nav landing={true} />
      <main className="relative container w-screen mx-auto py-8 tracking-normal">
        {/* White Glow on the right */}
        <Glow
          className="top-[25%] md:top-[20%] lg:top-[10%] right-[25%] sm:right-[30%] md:right-[20%] xl:right-[25%] 2xl:right-[30%]
             w-[450px] h-[450px] md:w-[600px] md:h-[600px] lg:w-[900px] lg:h-[900px]"
          background="radial-gradient(ellipse, rgba(255,255,255,0.75) 0%, transparent 60%)"
        />
        {/* Green Glow on the left */}
        <Glow
          className="top-[25%] md:top-[20%] lg:top-[10%] left-[25%] sm:left-[30%] md:left-[20%] xl:left-[25%] 2xl:left-[30%]
             w-[450px] h-[450px] md:w-[600px] md:h-[600px] lg:w-[900px] lg:h-[900px]"
          background="radial-gradient(ellipse, rgba(6,95,70,0.75) 0%, transparent 70%)"
        />
        {children}
        <CTA />
      </main>
    </div>
  );
};

export default LandingLayout;
