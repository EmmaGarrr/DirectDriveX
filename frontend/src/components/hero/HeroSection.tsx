"use client";

import { Check } from 'lucide-react';
import React from 'react';

export function HeroSection() {
  return (
    <div className="space-y-6 sm:space-y-8 lg:space-y-10">
      {/* Live Transfer Counter - Moved to Top */}
      <div className="inline-flex items-center px-3 py-2 text-xs font-medium text-green-700 rounded-full bg-green-50 sm:px-4 sm:text-sm">
        <div className="w-2 h-2 mr-2 bg-green-500 rounded-full animate-pulse"></div>
        <span className="font-semibold">12,847 users-</span> joined this week
      </div>

      {/* Premium Headlines */}
      <div className="space-y-3 sm:space-y-4 lg:space-y-5">
        <h1 className="text-2xl font-extrabold leading-tight hero-headline sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl text-slate-900 sm:leading-tight lg:leading-tight">
          Secure File Sharing <span className="text-bolt-blue">Made Simple</span>
        </h1>
        <p className="text-lg font-medium leading-relaxed hero-subheadline sm:text-xl md:text-2xl text-slate-600">
          Transfer files up to <span className="font-bold text-bolt-blue">30GB</span> with bank-level security
        </p>
      </div>

      {/* Primary CTA with Urgency */}
      <div className="space-y-4 sm:space-y-5">
        <button className="w-full px-6 py-3 mb-3 text-base font-bold text-white transition-all shadow-lg bg-gradient-to-r from-bolt-blue to-bolt-mid-blue sm:py-4 sm:px-8 rounded-xl hover:shadow-xl hover:-translate-y-1 sm:text-lg sm:w-auto">
          Claim Your 50GB Now - Free Forever
        </button>
        {/* Enhanced Urgency Element */}
        <div className="space-y-3 sm:space-y-4">
          <div className="p-3 transition-all duration-300 border-2 border-bolt-light-blue shadow-sm bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl sm:p-4 hover:shadow-md">
            <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className="flex items-center justify-center flex-shrink-0 w-6 h-6 rounded-full sm:w-8 sm:h-8 bg-gradient-to-r from-bolt-blue to-bolt-mid-blue">
                  <Check className="w-3 h-3 text-white sm:w-4 sm:h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="block text-xs font-semibold text-bolt-dark-purple sm:text-sm">🔥 Free 50GB Accounts Claimed</span>
                  <p className="text-xs text-bolt-blue">Limited time offer - Act fast!</p>
                </div>
              </div>
              <div className="text-center sm:text-right">
                <span className="text-base font-bold text-bolt-dark-purple sm:text-lg">78%</span>
                <p className="text-xs text-bolt-blue">claimed</p>
              </div>
            </div>
            <div className="mt-3 space-y-2 sm:mt-4">
              <div className="w-full h-2 rounded-full shadow-inner bg-bolt-light-blue sm:h-3">
                <div className="h-2 transition-all duration-500 ease-out rounded-full shadow-sm bg-gradient-to-r from-bolt-blue to-bolt-cyan sm:h-3" style={{ width: '78%' }}></div>
              </div>
            </div>
          </div>

          <p className="flex items-start text-xs sm:text-sm text-slate-500 sm:items-center">
            <Check className="w-3 h-3 sm:w-4 sm:h-4 mr-2 text-green-500 mt-0.5 sm:mt-0 flex-shrink-0" />
            <span className="leading-relaxed">No credit card required • Your privacy protected: Files auto-delete after 30 days</span>
          </p>
        </div>
      </div>

      {/* Trust Badges in Two Rows for Better Organization */}
      <div className="space-y-4 sm:space-y-5">
        {/* First Row - Security Features */}
        <div className="grid items-center grid-cols-2 gap-3 sm:flex sm:flex-wrap sm:gap-4 lg:gap-6">
          {[
            { text: '256-bit Encryption', color: 'bg-green-500' },
            { text: 'SOC2 Compliant', color: 'bg-bolt-blue' },
            { text: 'Zero-Knowledge', color: 'bg-bolt-purple' },
            { text: '99.9% Uptime', color: 'bg-emerald-500' }
          ].map(({ text, color }) => (
            <div key={text} className="flex items-center space-x-2">
              <div className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center ${color}`}>
                <Check className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white" />
              </div>
              <span className="text-xs sm:text-sm text-slate-600">{text}</span>
            </div>
          ))}
        </div>
        {/* Second Row - Live Stats */}
        <div className="flex flex-col space-y-2 text-xs sm:flex-row sm:items-center sm:space-x-6 sm:space-y-0 sm:text-sm text-slate-500">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
            <span className="font-medium">1,247 files transferred in the last hour</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 rounded-full bg-bolt-blue animate-pulse"></div>
            <span className="font-medium">Bank-level encryption on every transfer</span>
          </div>
        </div>
      </div>
    </div>
  );
}