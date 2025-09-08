import { RegisterForm } from "@/components/auth/RegisterForm";
import {
  ShieldCheck,
  Zap,
  Cloud,
  Users,
  Archive,
  Lock,
} from "lucide-react";
import Link from "next/link";

const features = [
  {
    icon: <Cloud className="w-6 h-6 text-white" />,
    title: "Unlimited Storage",
    description: "Store files without any size limits",
  },
  {
    icon: <Users className="w-6 h-6 text-white" />,
    title: "Advanced Sharing",
    description: "Share files with custom permissions",
  },
  {
    icon: <Archive className="w-6 h-6 text-white" />,
    title: "Batch Operations",
    description: "Upload and manage multiple files at once",
  },
  {
    icon: <Lock className="w-6 h-6 text-white" />,
    title: "Enterprise Security",
    description: "End-to-end encryption and secure storage",
  },
];

export default function RegisterPage() {
  return (
    <div className="font-inter antialiased">
      <div className="fixed top-0 left-0 w-full h-full bg-gradient-to-br from-slate-50 to-slate-100 -z-10" />
      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">
          {/* Left Side: Feature Highlights */}
          <div className="hidden lg:block space-y-10">
            <div className="space-y-4">
              <h2 className="text-4xl font-bold text-slate-900">
                Join thousands of users
                <span className="block text-bolt-blue">
                  securing their files
                </span>
              </h2>
              <p className="text-lg text-slate-600 max-w-md">
                Get started with DirectDrive and experience the most secure and
                efficient file storage platform.
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

          {/* Right Side: Registration Form */}
          <div className="w-full max-w-md mx-auto lg:mx-0">
            <RegisterForm />
          </div>
        </div>
      </div>
    </div>
  );
}