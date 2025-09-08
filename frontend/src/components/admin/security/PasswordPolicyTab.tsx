"use client";

import { useState } from "react";
import { PasswordPolicy, UsePasswordPolicyReturn } from "@/types/security";

const GlassCard = ({ title, children }: { title: string, children: React.ReactNode }) => (
  <div className="p-6 border shadow-lg bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl border-slate-400/20 dark:border-slate-400/10 rounded-2xl shadow-slate-900/5 dark:shadow-black/10">
    <h3 className="mb-4 text-lg font-semibold text-slate-900 dark:text-slate-50">{title}</h3>
    {children}
  </div>
);

interface PasswordPolicyTabProps {
  passwordPolicy: UsePasswordPolicyReturn;
}

export function PasswordPolicyTab({ passwordPolicy }: PasswordPolicyTabProps) {
  const { passwordPolicy: policy, updatePasswordPolicy } = passwordPolicy;

  if (!policy) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="w-8 h-8 mx-auto mb-4 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-600 dark:text-slate-400">Loading password policy...</p>
        </div>
      </div>
    );
  }

  return (
    <GlassCard title="Password Requirements">
      <div className="space-y-6">
        <div>
          <label className="block mb-2 text-sm font-medium">Minimum Length: {policy.min_length} characters</label>
          <input
            type="range"
            value={policy.min_length}
            onChange={(e) => updatePasswordPolicy({ min_length: +e.target.value })}
            min={8} max={32} step={1}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer dark:bg-slate-700 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:bg-indigo-600 [&::-webkit-slider-thumb]:rounded-full"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center space-x-2">
            <input id="require_uppercase" type="checkbox" checked={policy.require_uppercase} onChange={(e) => updatePasswordPolicy({ require_uppercase: e.target.checked })} className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500" />
            <label htmlFor="require_uppercase">Require Uppercase</label>
          </div>
          <div className="flex items-center space-x-2">
            <input id="require_lowercase" type="checkbox" checked={policy.require_lowercase} onChange={(e) => updatePasswordPolicy({ require_lowercase: e.target.checked })} className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500" />
            <label htmlFor="require_lowercase">Require Lowercase</label>
          </div>
          <div className="flex items-center space-x-2">
            <input id="require_numbers" type="checkbox" checked={policy.require_numbers} onChange={(e) => updatePasswordPolicy({ require_numbers: e.target.checked })} className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500" />
            <label htmlFor="require_numbers">Require Numbers</label>
          </div>
          <div className="flex items-center space-x-2">
            <input id="require_special_chars" type="checkbox" checked={policy.require_special_chars} onChange={(e) => updatePasswordPolicy({ require_special_chars: e.target.checked })} className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500" />
            <label htmlFor="require_special_chars">Require Special Characters</label>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block mb-1 text-sm font-medium">Password History</label>
            <input type="number" value={policy.password_history_count} onChange={(e) => updatePasswordPolicy({ password_history_count: +e.target.value })} className="w-full px-3 py-2 bg-white border rounded-md dark:bg-slate-900 border-slate-300 dark:border-slate-600" />
          </div>
          <div>
            <label className="block mb-1 text-sm font-medium">Password Expiry (days)</label>
            <input type="number" value={policy.password_expiry_days} onChange={(e) => updatePasswordPolicy({ password_expiry_days: +e.target.value })} className="w-full px-3 py-2 bg-white border rounded-md dark:bg-slate-900 border-slate-300 dark:border-slate-600" />
          </div>
        </div>
      </div>
    </GlassCard>
  );
}