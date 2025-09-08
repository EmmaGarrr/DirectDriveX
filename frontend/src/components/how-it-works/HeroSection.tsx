"use client";

import { useRouter } from "next/navigation";
import { ArrowDown, Rocket, Shield, Zap, CloudUpload } from "lucide-react";

interface HeroSectionProps {
  scrollToSection: (sectionId: string) => void;
}

export function HeroSection({ scrollToSection }: HeroSectionProps) {
  const router = useRouter();

  const onTryItNow = () => {
    router.push("/");
  };

  return (
    <section className="py-10 lg:py-14 bg-gradient-to-br from-bolt-black to-bolt-medium-black">
      <div className="container mx-auto px-4">
        <div className="text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-bolt-white mb-6">
            Send Big Files.{" "}
            <span className="text-bolt-cyan">Fast, Secure, Easy.</span>
          </h1>
          <p className="text-lg text-bolt-light-blue/80 mb-8 max-w-2xl mx-auto">
            Upload your file, share a link, done. No signup required.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
          <button
            onClick={onTryItNow}
            className="inline-flex items-center justify-center text-lg px-8 py-4 h-14 font-medium text-bolt-white bg-bolt-blue hover:bg-bolt-mid-blue rounded-xl transition-all duration-300 hover:scale-105 shadow-lg"
          >
            <Rocket className="w-5 h-5 mr-2" />
            Try It Now
          </button>
          <button
            onClick={() => scrollToSection("step-guide")}
            className="inline-flex items-center justify-center text-lg px-8 py-4 h-14 font-medium text-bolt-white border-2 border-bolt-white/50 hover:bg-bolt-white/10 rounded-xl transition-all duration-300 hover:scale-105"
          >
            <ArrowDown className="w-5 h-5 mr-2" />
            See How It Works
          </button>
        </div>
        <div className="flex justify-center flex-wrap gap-6">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-bolt-cyan/20 rounded-full flex items-center justify-center">
              <Shield className="w-4 h-4 text-bolt-cyan" />
            </div>
            <span className="text-sm text-bolt-white">Secure</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-bolt-cyan/20 rounded-full flex items-center justify-center">
              <Zap className="w-4 h-4 text-bolt-cyan" />
            </div>
            <span className="text-sm text-bolt-white">Fast</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-bolt-cyan/20 rounded-full flex items-center justify-center">
              <CloudUpload className="w-4 h-4 text-bolt-cyan" />
            </div>
            <span className="text-sm text-bolt-white">Large Files</span>
          </div>
        </div>
      </div>
    </section>
  );
}