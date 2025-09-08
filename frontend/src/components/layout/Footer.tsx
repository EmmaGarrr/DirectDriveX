"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  CloudUpload,
  Mail,
  Twitter,
  Facebook,
  Linkedin,
  ArrowUp,
  Loader2,
} from "lucide-react";
import { SocialIcon, WhatsAppIcon } from "./SocialIcon";
import { toastService } from "@/services/toastService";

export function Footer() {
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [isSubscribing, setIsSubscribing] = useState(false);

  const toggleVisibility = () => {
    setShowBackToTop(window.pageYOffset > 300);
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    window.addEventListener("scroll", toggleVisibility);
    return () => {
      window.removeEventListener("scroll", toggleVisibility);
    };
  }, []);

  // Newsletter form validation
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };
  
  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newsletterEmail.trim()) {
      toastService.error('Please enter your email address.', 2500);
      return;
    }
    
    if (!validateEmail(newsletterEmail)) {
      toastService.error('Please enter a valid email address.', 2500);
      return;
    }
    
    setIsSubscribing(true);
    
    try {
      // TODO: Implement actual newsletter subscription API call
      // For now, simulate the subscription
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toastService.success('Thank you for subscribing to our newsletter!', 2500);
      setNewsletterEmail('');
    } catch (error) {
      toastService.error('Subscription failed. Please try again later.', 2500);
    } finally {
      setIsSubscribing(false);
    }
  };
  
  // Social media link tracking
  const handleSocialClick = (platform: string, url: string) => {
    // Analytics tracking (if needed)
    if (typeof window !== 'undefined' && (window as any).va) {
      (window as any).va('event', 'footer_social_click', { platform });
    }
    
    // Open in new tab
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <footer className="bg-bolt-white border-t border-slate-200 shadow-sm font-sans">
      <div className="container mx-auto px-4 py-10 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Information */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-10 h-10 bg-bolt-blue rounded-xl shadow-lg">
                <CloudUpload className="w-5 h-5 text-white" />
              </div>
              <span className="text-2xl font-bold text-bolt-black">
                Mfcnextgen
              </span>
            </Link>
            <p className="text-sm text-bolt-medium-black/80 leading-relaxed">
              Secure, fast, and reliable file storage solution for individuals
              and businesses. Transfer your files with confidence using our
              enterprise-grade infrastructure.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold text-bolt-medium-black mb-4">
              Quick Links
            </h3>
            <ul className="space-y-2">
              <li><Link href="/how-it-works" className="text-sm text-bolt-medium-black/80 hover:text-bolt-blue transition-colors duration-300">How it Works</Link></li>
              <li><Link href="/security" className="text-sm text-bolt-medium-black/80 hover:text-bolt-blue transition-colors duration-300">Security</Link></li>
              <li><Link href="/enterprise" className="text-sm text-bolt-medium-black/80 hover:text-bolt-blue transition-colors duration-300">Enterprise</Link></li>
              <li><Link href="/support" className="text-sm text-bolt-medium-black/80 hover:text-bolt-blue transition-colors duration-300">Support</Link></li>
            </ul>
          </div>

          {/* Legal & Resources */}
          <div>
            <h3 className="text-lg font-semibold text-bolt-medium-black mb-4">
              Legal & Resources
            </h3>
            <ul className="space-y-2">
              <li><Link href="/privacy" className="text-sm text-bolt-medium-black/80 hover:text-bolt-blue transition-colors duration-300">Privacy Policy</Link></li>
              <li><Link href="/terms" className="text-sm text-bolt-medium-black/80 hover:text-bolt-blue transition-colors duration-300">Terms of Service</Link></li>
              <li><Link href="/cookies" className="text-sm text-bolt-medium-black/80 hover:text-bolt-blue transition-colors duration-300">Cookie Policy</Link></li>
              <li><Link href="/status" className="text-sm text-bolt-medium-black/80 hover:text-bolt-blue transition-colors duration-300">System Status</Link></li>
              <li><Link href="/api-docs" className="text-sm text-bolt-medium-black/80 hover:text-bolt-blue transition-colors duration-300">API Documentation</Link></li>
            </ul>
          </div>

          {/* Newsletter & Contact */}
          <div>
            <h3 className="text-lg font-semibold text-bolt-medium-black mb-4">
              Stay Updated
            </h3>
            <p className="text-sm text-bolt-medium-black/80 mb-4">
              Get the latest updates on new features and security enhancements.
            </p>
            <form onSubmit={handleNewsletterSubmit} className="space-y-3">
              <input
                type="email"
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full h-12 px-4 text-sm text-bolt-black bg-white/70 border border-white/30 rounded-xl shadow-lg focus:outline-none focus:ring-2 focus:ring-bolt-cyan backdrop-blur-xl transition-all"
                required
                disabled={isSubscribing}
              />
              <button
                type="submit"
                disabled={isSubscribing}
                className="w-full h-12 text-sm font-medium text-white bg-gradient-to-r from-bolt-blue to-bolt-mid-blue rounded-xl hover:from-bolt-mid-blue hover:to-bolt-blue hover:scale-105 transition-all duration-300 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center"
              >
                {isSubscribing ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Subscribe"
                )}
              </button>
            </form>
            <div className="flex items-center space-x-2 mt-4">
              <Mail className="w-4 h-4 text-bolt-blue" />
              <a
                href="mailto:support&#64;mfcnextgen.com"
                className="text-sm text-bolt-medium-black/80 hover:text-bolt-blue transition-colors duration-300"
              >
                support&#64;mfcnextgen.com
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-10 pt-8 border-t border-slate-200 flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-sm text-bolt-medium-black/80 text-center md:text-left">
            &copy; {new Date().getFullYear()} Mfcnextgen. All rights reserved.
          </p>
          <div className="flex items-center space-x-3">
            <SocialIcon 
              href="https://twitter.com" 
              icon={<Twitter className="w-5 h-5 text-white" />} 
              onClick={() => handleSocialClick('twitter', 'https://twitter.com')}
            />
            <SocialIcon 
              href="https://facebook.com" 
              icon={<Facebook className="w-5 h-5 text-white" />}
              onClick={() => handleSocialClick('facebook', 'https://facebook.com')}
            />
            <SocialIcon 
              href="https://linkedin.com" 
              icon={<Linkedin className="w-5 h-5 text-white" />}
              onClick={() => handleSocialClick('linkedin', 'https://linkedin.com')}
            />
            <SocialIcon 
              href="https://whatsapp.com" 
              icon={<WhatsAppIcon />}
              onClick={() => handleSocialClick('whatsapp', 'https://whatsapp.com')}
            />
          </div>
        </div>
      </div>

      {/* Back to Top Button */}
      {showBackToTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 w-12 h-12 flex items-center justify-center bg-gradient-to-r from-bolt-blue to-bolt-mid-blue text-white rounded-full shadow-xl animate-float hover:animate-none hover:scale-110 transition-all duration-300 z-50"
          aria-label="Back to top"
        >
          <ArrowUp className="w-6 h-6" />
        </button>
      )}
    </footer>
  );
}