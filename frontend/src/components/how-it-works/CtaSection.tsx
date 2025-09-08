"use client";

import { useRouter } from "next/navigation";
import { Rocket, Tag, CheckCircle, Shield } from "lucide-react";

export function CtaSection() {
  const router = useRouter();

  const onStartUploading = () => {
    router.push("/");
  };

  return (
    <section className="py-10 lg:py-14 bg-gradient-to-r from-bolt-blue via-bolt-dark-purple to-bolt-purple relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%22100%22%20height%3D%22100%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cpath%20d%3D%22M11%2018.574L4.426%2015.237l-1.16%202.01%206.574%203.337%206.574-3.337-1.16-2.01L11%2018.574zM11%2030l6.574-3.337-1.16-2.01L11%2027.99l-5.414-2.737-1.16%202.01L11%2030zm0%2011.426L4.426%2038.09l-1.16%202.01%206.574%203.337%206.574-3.337-1.16-2.01L11%2041.426z%22%20fill%3D%22%23fff%22%20fill-opacity%3D%220.1%22%20fill-rule%3D%22evenodd%22/%3E%3C/svg%3E')] opacity-20 animate-pattern-move"></div>
      <div className="container mx-auto px-4 text-center relative z-10">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
          Ready to send your first file?
        </h2>
        <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
          Join thousands of users who trust DirectDriveX for secure file
          sharing.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
          <button
            onClick={onStartUploading}
            className="inline-flex items-center justify-center bg-white text-bolt-blue px-8 py-4 rounded-xl font-bold text-lg hover:bg-slate-100 transition-all hover:scale-105 duration-300 shadow-lg h-14"
          >
            <Rocket className="w-5 h-5 mr-2" />
            Start Uploading Now
          </button>
          <button className="inline-flex items-center justify-center border-2 border-white text-white px-8 py-4 rounded-xl font-bold text-lg transition-all hover:scale-105 duration-300 h-14">
            <Tag className="w-5 h-5 mr-2" />
            See Pricing
          </button>
        </div>
        <div className="flex justify-center items-center flex-wrap gap-4 text-white/80">
          <span className="text-sm flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            No signup required
          </span>
          <span className="hidden sm:inline">•</span>
          <span className="text-sm flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Secure
          </span>
        </div>
      </div>
    </section>
  );
}