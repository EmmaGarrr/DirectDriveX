import {
  ShieldCheck,
  Zap,
  Database,
  Clock,
  LineChart,
  Smartphone,
} from "lucide-react";

const features = [
  {
    title: "Military-Grade Security",
    description:
      "Files are encrypted in transit and at rest with 256-bit AES encryption.",
    icon: <ShieldCheck className="w-6 h-6 text-white" />,
    gradient: "from-bolt-blue to-bolt-mid-blue",
  },
  {
    title: "Lightning Fast",
    description:
      "Resumable uploads and optimized transfer speeds for large files.",
    icon: <Zap className="w-6 h-6 text-white" />,
    gradient: "from-bolt-cyan to-bolt-blue",
  },
  {
    title: "Massive File Support",
    description: "Send files up to 30GB with no compression or quality loss.",
    icon: <Database className="w-6 h-6 text-white" />,
    gradient: "from-bolt-purple to-bolt-dark-purple",
  },
  {
    title: "Auto-Expiry",
    description:
      "Files automatically delete after 30 days for enhanced security.",
    icon: <Clock className="w-6 h-6 text-white" />,
    gradient: "from-bolt-medium-black to-bolt-black",
  },
  {
    title: "Download Tracking",
    description:
      "Know when your files are downloaded with real-time notifications.",
    icon: <LineChart className="w-6 h-6 text-white" />,
    gradient: "from-bolt-light-purple to-bolt-purple",
  },
  {
    title: "Mobile Optimized",
    description: "Works perfectly on phones, tablets, and desktop devices.",
    icon: <Smartphone className="w-6 h-6 text-white" />,
    gradient: "from-bolt-light-cyan to-bolt-cyan",
  },
];

export function FeaturesSection() {
  return (
    <section className="py-10 lg:py-14 bg-slate-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-bolt-black mb-8 lg:mb-16">
          Why Choose DirectDriveX?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="p-4 sm:p-6 rounded-2xl shadow-lg border border-slate-200 bg-white/80 hover:scale-105 hover:shadow-xl transition-all duration-300 group"
            >
              <div
                className={`w-12 h-12 bg-gradient-to-br ${feature.gradient} rounded-lg flex items-center justify-center mb-4 transition-all duration-300 group-hover:scale-110 group-hover:rotate-6`}
              >
                {feature.icon}
              </div>
              <h3 className="text-lg font-semibold text-bolt-black mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-bolt-medium-black">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}