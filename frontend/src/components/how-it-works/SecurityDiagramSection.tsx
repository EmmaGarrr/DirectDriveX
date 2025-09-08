import { User, Server, Download, ArrowRight, ShieldCheck } from "lucide-react";

export function SecurityDiagramSection() {
  return (
    <section className="py-10 lg:py-14">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-bolt-black mb-8 lg:mb-16">
          How Your Files Stay Secure
        </h2>
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-4">
            {/* Step 1 */}
            <div className="text-center flex-1 group">
              <div className="w-20 h-20 bg-gradient-to-br from-bolt-blue to-bolt-mid-blue rounded-full flex items-center justify-center mx-auto mb-4 transition-transform duration-300 group-hover:scale-110">
                <User className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-bolt-black mb-2">
                Upload
              </h3>
              <p className="text-sm text-bolt-medium-black">
                Files encrypted during transfer
              </p>
            </div>

            {/* Arrow */}
            <ArrowRight className="w-12 h-12 text-bolt-light-blue rotate-90 lg:rotate-0 transition-transform duration-300 hover:scale-125" />

            {/* Step 2 */}
            <div className="text-center flex-1 group">
              <div className="w-20 h-20 bg-gradient-to-br from-bolt-purple to-bolt-dark-purple rounded-full flex items-center justify-center mx-auto mb-4 transition-transform duration-300 group-hover:scale-110">
                <Server className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-bolt-black mb-2">
                Secure Storage
              </h3>
              <p className="text-sm text-bolt-medium-black">
                Encrypted at rest on our servers
              </p>
            </div>

            {/* Arrow */}
            <ArrowRight className="w-12 h-12 text-bolt-light-blue rotate-90 lg:rotate-0 transition-transform duration-300 hover:scale-125" />

            {/* Step 3 */}
            <div className="text-center flex-1 group">
              <div className="w-20 h-20 bg-gradient-to-br from-bolt-cyan to-bolt-blue rounded-full flex items-center justify-center mx-auto mb-4 transition-transform duration-300 group-hover:scale-110">
                <Download className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-bolt-black mb-2">
                Download
              </h3>
              <p className="text-sm text-bolt-medium-black">
                Secure download via encrypted link
              </p>
            </div>
          </div>

          <div className="mt-12 flex justify-center">
            <div className="relative backdrop-blur-md bg-white/70 border border-bolt-light-blue shadow-xl rounded-2xl p-6 max-w-2xl w-full">
              <div className="flex justify-center">
                <div className="bg-bolt-light-blue text-bolt-blue w-12 h-12 flex items-center justify-center rounded-full shadow-sm mb-4">
                  <ShieldCheck className="w-6 h-6" />
                </div>
              </div>
              <div className="text-center">
                <h3 className="text-lg font-semibold text-bolt-black mb-2">
                  Privacy First
                </h3>
                <p className="text-bolt-medium-black leading-relaxed text-sm sm:text-base">
                  We never keep files forever. They automatically expire after{" "}
                  <span className="font-semibold text-bolt-blue">30 days</span>{" "}
                  and are permanently deleted from our servers.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}