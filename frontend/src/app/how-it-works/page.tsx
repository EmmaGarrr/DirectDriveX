"use client";

import { HeroSection } from "@/components/how-it-works/HeroSection";
import { StepGuideSection } from "@/components/how-it-works/StepGuideSection";
import { FeaturesSection } from "@/components/how-it-works/FeaturesSection";
import { SecurityDiagramSection } from "@/components/how-it-works/SecurityDiagramSection";
import { FaqSection } from "@/components/how-it-works/FaqSection";
import { CtaSection } from "@/components/how-it-works/CtaSection";

export default function HowItWorksPage() {
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="bg-bolt-white font-sans">
      <HeroSection scrollToSection={scrollToSection} />
      <StepGuideSection />
      <FeaturesSection />
      <SecurityDiagramSection />
      <FaqSection />
      <CtaSection />
    </div>
  );
}