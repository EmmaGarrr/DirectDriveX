import {
  CloudUpload,
  Lock,
  Share2,
  Download,
} from "lucide-react";

const steps = [
  {
    num: 1,
    title: "Upload",
    description: "Drag & drop or click to select files up to 30GB",
    icon: <CloudUpload className="w-6 h-6 text-bolt-blue" />,
    gradient: "from-bolt-blue to-bolt-mid-blue",
  },
  {
    num: 2,
    title: "Secure & Customize",
    description: "Add password, expiry date, or download limits",
    icon: <Lock className="w-6 h-6 text-bolt-purple" />,
    gradient: "from-bolt-purple to-bolt-dark-purple",
  },
  {
    num: 3,
    title: "Share",
    description: "Copy your link or email it directly",
    icon: <Share2 className="w-6 h-6 text-bolt-cyan" />,
    gradient: "from-bolt-cyan to-bolt-blue",
  },
  {
    num: 4,
    title: "Download",
    description: "Recipient clicks link & downloads securely",
    icon: <Download className="w-6 h-6 text-bolt-medium-black" />,
    gradient: "from-bolt-medium-black to-bolt-black",
  },
];

export function StepGuideSection() {
  return (
    <section id="step-guide" className="py-10 lg:py-14">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-bolt-black mb-8 lg:mb-16">
          How It Works in 4 Simple Steps
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {steps.map((step) => (
            <div
              key={step.num}
              className="text-center p-4 sm:p-6 rounded-2xl shadow-lg border border-slate-200 bg-white/50 group"
            >
              <div
                className={`w-16 h-16 bg-gradient-to-br ${step.gradient} rounded-full flex items-center justify-center mx-auto mb-4 transition-all duration-300 group-hover:scale-110 group-hover:shadow-xl`}
              >
                <span className="text-white font-bold text-xl">{step.num}</span>
              </div>
              <div className="w-12 h-12 bg-bolt-light-blue/50 rounded-lg flex items-center justify-center mx-auto mb-4 transition-all duration-300 group-hover:scale-110 group-hover:rotate-6">
                {step.icon}
              </div>
              <h3 className="text-lg font-semibold text-bolt-black mb-2">
                {step.title}
              </h3>
              <p className="text-sm text-bolt-medium-black">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}