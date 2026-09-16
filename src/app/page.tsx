import { Hero } from "@/components/Hero";
import { AboutDeMolay } from "@/components/AboutDeMolay";
import { AboutSeniors } from "@/components/AboutSeniors";
import { ExecutiveBoard } from "@/components/ExecutiveBoard";
import { SiteLayout } from "@/components/SiteLayout";
import { LandingFlowBackground } from "@/components/landing/LandingBackgrounds";
export default function HomePage() {
  return (
    <SiteLayout>
      <Hero />
      <div className="landing-flow relative">
        <LandingFlowBackground />
        <div className="landing-flow-content relative z-[1]">
          <AboutDeMolay />
          <AboutSeniors />
          <ExecutiveBoard />
        </div>
      </div>
    </SiteLayout>
  );
}
