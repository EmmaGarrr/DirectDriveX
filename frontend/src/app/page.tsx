import { ComparisonSection } from "@/components/comparison/ComparisonSection";
import { HeroSection } from "@/components/hero/HeroSection";
import { UploadWidget } from "@/components/hero/UploadWidget";

export default function Home() {
  return (
    <div className="bg-gradient-to-br from-slate-50 to-white font-[family-name:var(--font-geist-sans)]">
      <div className="px-4 pt-6 pb-12 mx-auto max-w-7xl sm:px-6 lg:px-8 sm:pt-8 lg:pt-12 sm:pb-16 lg:pb-20">
        <div className="grid items-start grid-cols-1 gap-8 lg:grid-cols-5 sm:gap-10 lg:gap-12 lg:items-center">
          {/* Left Side - 60% Main Content */}
          <div className="space-y-6 lg:col-span-3 sm:space-y-8 lg:space-y-10">
            <HeroSection />
          </div>
          
          {/* Right Side - 40% Upload Widget */}
          <div className="lg:col-span-2">
            <div className="h-full p-4 bg-white border shadow-lg rounded-2xl border-slate-200 sm:p-6 lg:p-8">
              <UploadWidget />
            </div>
          </div>
        </div>
      </div>
      <ComparisonSection />
    </div>
  );
}