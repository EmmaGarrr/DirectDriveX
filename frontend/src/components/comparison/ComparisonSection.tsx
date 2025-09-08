"use client";

import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { Check, Star, X } from 'lucide-react';
import React, { useState } from 'react';

const features = [
  { name: 'Free Storage', dropbox: '2GB', google: '15GB', mfc: '50GB' },
  { name: 'Max File Size', dropbox: '2GB', google: '15GB', mfc: '30GB' },
  { name: 'Transfer Speed', dropbox: '500MB/s', google: '1GB/s', mfc: '2GB/s' },
  { name: 'No Signup Required', dropbox: false, google: false, mfc: true },
  { name: 'Encryption', dropbox: 'Basic', google: 'Basic', mfc: 'E2E' },
  { name: 'Support', dropbox: 'Business hrs', google: 'Business hrs', mfc: '24/7' },
  { name: 'File Retention', dropbox: '30 days', google: 'Forever', mfc: '30 days' },
];

type Provider = 'dropbox' | 'google' | 'mfc';

export function ComparisonSection() {
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState<Provider>('mfc');

  const renderValue = (value: string | boolean, isMfc: boolean) => {
    if (typeof value === 'boolean') {
      return (
        <div className={`flex items-center justify-center font-bold ${value ? 'text-green-600' : 'text-red-500'}`}>
          {value ? <Check className="w-4 h-4 mr-1" /> : <X className="w-4 h-4 mr-1" />}
          <span>{value ? 'Optional' : 'Required'}</span>
        </div>
      );
    }
    return <div className={cn('text-slate-600', isMfc && 'text-bolt-blue font-bold')}>{value}</div>;
  };

  const DesktopView = () => (
    <div className="hidden grid-cols-4 gap-6 mb-8 md:grid">
      {/* Headers */}
      <div className="py-4 text-base font-semibold tracking-wide uppercase text-slate-700">Features</div>
      <div className="py-4 text-base font-semibold text-center text-slate-700">Dropbox</div>
      <div className="py-4 text-base font-semibold text-center text-slate-700">Google Drive</div>
      <div className="relative">
        <div className="py-2 text-base font-semibold text-center text-bolt-dark-purple">DirectDriveX</div>
      </div>

      {/* Rows */}
      <div className="space-y-3 text-base">
        {features.map(f => <div key={f.name} className="py-4 font-medium text-slate-800">{f.name}</div>)}
      </div>
      <div className="space-y-3 text-base text-center">
        {features.map(f => <div key={f.name} className="py-4">{renderValue(f.dropbox, false)}</div>)}
      </div>
      <div className="space-y-3 text-base text-center">
        {features.map(f => <div key={f.name} className="py-4">{renderValue(f.google, false)}</div>)}
      </div>
      <div className="relative p-2 space-y-3 text-base text-center transform scale-105 border-2 shadow-lg bg-gradient-to-b from-bolt-light-blue/50 to-white border-bolt-blue rounded-xl">
        <div className="absolute flex items-center px-4 py-2 text-sm font-bold text-white transform -translate-x-1/2 rounded-full shadow-lg text-nowrap -top-5 left-1/2 bg-gradient-to-r from-bolt-blue to-bolt-cyan">
          <Star className="w-4 h-4 mr-1" fill="white" /> BEST CHOICE
        </div>
        {features.map(f => <div key={f.name} className="py-4 transition-transform hover:scale-105">{renderValue(f.mfc, true)}</div>)}
      </div>
    </div>
  );

  const MobileView = () => {
    const providerData = features.map(f => f[activeTab]);
    const providerName = { dropbox: 'Dropbox', google: 'Google Drive', mfc: 'DirectDriveX' }[activeTab];

    return (
      <div className="mb-6 md:hidden">
        <div className="flex p-1 mb-6 space-x-1 rounded-lg bg-slate-100">
          {(['mfc', 'dropbox', 'google'] as Provider[]).map(p => (
            <button
              key={p}
              onClick={() => setActiveTab(p)}
              className={cn(
                "flex-1 px-4 py-3 text-sm font-medium transition-all duration-200 rounded-md",
                activeTab === p ? 'text-bolt-blue bg-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
              )}
            >
              {{ mfc: 'DirectDriveX', dropbox: 'Dropbox', google: 'Google Drive' }[p]}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2 text-sm">
            <div className="py-3 font-semibold tracking-wide uppercase text-slate-700">Features</div>
            {features.map(f => <div key={f.name} className="py-3">{f.name}</div>)}
          </div>
          <div className={cn("space-y-2 text-sm text-center", activeTab === 'mfc' && 'bg-gradient-to-b from-bolt-light-blue/50 to-white border-2 border-bolt-blue rounded-lg')}>
            <div className={cn("font-semibold py-3", activeTab === 'mfc' ? 'text-bolt-dark-purple font-bold' : 'text-slate-700')}>{providerName}</div>
            {providerData.map((value, i) => <div key={i} className="py-3">{renderValue(value, activeTab === 'mfc')}</div>)}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="px-4 py-10 mx-auto max-w-7xl lg:py-16">
      <div className="p-4 bg-white border shadow-lg rounded-2xl border-slate-200 sm:p-6">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-xl font-bold lg:text-4xl md:text-3xl text-slate-900">
            Why professionals choose DirectDriveX
          </h2>
          <p className="max-w-2xl mx-auto text-sm lg:text-lg text-slate-600">
            Compare the leading file transfer solutions and see why thousands of professionals trust us for their secure file sharing needs.
          </p>
        </div>
        
        {isMobile ? <MobileView /> : <DesktopView />}

        <div className="text-center">
          <button className="bg-gradient-to-r from-bolt-blue to-bolt-mid-blue text-white font-medium px-8 py-3 rounded-xl transition-all hover:shadow-xl hover:-translate-y-0.5">
            Get Started - 50GB Free Forever
          </button>
          <p className="mt-5 text-sm text-slate-500">
            <span className="inline-flex items-center">
              <Check className="w-4 h-4 mr-1 text-green-500" />
              1,247 files securely transferred in the last hour
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}