import { LoginForm } from "@/components/auth/LoginForm";
import { Upload, Zap, Lock } from "lucide-react";

const features = [
  {
    icon: <Upload className="w-6 h-6 text-white" />,
    title: "Unlimited Storage",
    description: "Store files without limits",
  },
  {
    icon: <Zap className="w-6 h-6 text-white" />,
    title: "Lightning Fast",
    description: "Instant upload and download",
  },
  {
    icon: <Lock className="w-6 h-6 text-white" />,
    title: "Secure & Private",
    description: "End-to-end encryption",
  },
];

export default function LoginPage() {
  return (
    <div className="font-inter antialiased">
      <div className="fixed top-0 left-0 w-full h-full bg-gradient-to-br from-slate-50 to-slate-100 -z-10" />
      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">
          {/* Left Side: Feature Highlights */}
          <div className="hidden lg:block space-y-10">
            <div className="space-y-4">
              <h2 className="text-4xl font-bold text-slate-900">
                Welcome back to your
                <span className="block text-bolt-blue">
                  secure file storage
                </span>
              </h2>
              <p className="text-lg text-slate-600 max-w-md">
                Access your files from anywhere, anytime. Your data, protected
                and organized.
              </p>
            </div>
            <div className="space-y-8">
              {features.map((feature, index) => (
                <div key={index} className="flex items-start space-x-4 group">
                  <div className="feature-icon flex-shrink-0 w-12 h-12 bg-bolt-blue rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:bg-gradient-to-r from-bolt-blue to-bolt-cyan">
                    {feature.icon}
                  </div>
                  <div>
                    <h4 className="font-medium text-slate-900 mb-1">
                      {feature.title}
                    </h4>
                    <p className="text-sm text-slate-600">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Side: Login Form */}
          <div className="w-full max-w-md mx-auto lg:mx-0">
            <LoginForm />
          </div>
        </div>
      </div>
    </div>
  );
}