"use client";

import { useState, useEffect } from "react";
import { SecurityConfig, UseSecuritySettingsReturn } from "@/types/security";
import { Trash2, Plus, Globe, AlertTriangle, CheckCircle, Info } from "lucide-react";
import { cn } from "@/lib/utils";

// Custom Switch Component
const CustomSwitch = ({ checked, onCheckedChange }: { checked: boolean, onCheckedChange: (checked: boolean) => void }) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    onClick={() => onCheckedChange(!checked)}
    className={cn(
      "relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2",
      checked ? "bg-indigo-600" : "bg-slate-200 dark:bg-slate-700"
    )}
  >
    <span
      aria-hidden="true"
      className={cn(
        "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
        checked ? "translate-x-5" : "translate-x-0"
      )}
    />
  </button>
);

const GlassCard = ({ title, children }: { title: string, children: React.ReactNode }) => (
  <div className="p-6 border shadow-lg bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl border-slate-400/20 dark:border-slate-400/10 rounded-2xl shadow-slate-900/5 dark:shadow-black/10">
    <h3 className="mb-4 text-lg font-semibold text-slate-900 dark:text-slate-50">{title}</h3>
    {children}
  </div>
);

interface GeneralSecurityTabProps {
  securitySettings: UseSecuritySettingsReturn;
}

export function GeneralSecurityTab({ securitySettings }: GeneralSecurityTabProps) {
  const [validation, setValidation] = useState<any>(null);
  const [securityScore, setSecurityScore] = useState<any>(null);

  const { securityConfig, updateSecurityConfig, validateSecurityConfig, getSecurityScore } = securitySettings;

  // Validate configuration when it changes
  useEffect(() => {
    if (securityConfig) {
      const validationResult = validateSecurityConfig();
      setValidation(validationResult);
    }
  }, [securityConfig, validateSecurityConfig]);

  // Load security score
  useEffect(() => {
    const loadSecurityScore = async () => {
      try {
        const score = await getSecurityScore();
        setSecurityScore(score);
      } catch (error) {
        console.error('Error loading security score:', error);
      }
    };

    if (securityConfig) {
      loadSecurityScore();
    }
  }, [securityConfig, getSecurityScore]);

  const handleOriginChange = (index: number, value: string) => {
    if (!securityConfig) return;
    const newOrigins = [...securityConfig.allowed_cors_origins];
    newOrigins[index] = value;
    updateSecurityConfig({ allowed_cors_origins: newOrigins });
  };

  const addOrigin = () => {
    if (!securityConfig) return;
    updateSecurityConfig({ 
      allowed_cors_origins: [...securityConfig.allowed_cors_origins, ''] 
    });
  };

  const removeOrigin = (index: number) => {
    if (!securityConfig) return;
    const newOrigins = securityConfig.allowed_cors_origins.filter((_, i) => i !== index);
    updateSecurityConfig({ allowed_cors_origins: newOrigins });
  };

  if (!securityConfig) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="w-8 h-8 mx-auto mb-4 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-600 dark:text-slate-400">Loading security configuration...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Security Score Display */}
      {securityScore && (
        <GlassCard title="Security Score">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold text-slate-900 dark:text-white">
                {securityScore.overall_score}/100
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-400">
                Overall Security Rating
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-slate-600 dark:text-slate-400">Last Updated</div>
              <div className="text-sm font-medium text-slate-900 dark:text-white">
                {new Date(securityScore.last_updated).toLocaleDateString()}
              </div>
            </div>
          </div>
          {securityScore.recommendations.length > 0 && (
            <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
              <div className="flex items-start gap-2">
                <Info className="w-4 h-4 mt-0.5 text-amber-600 dark:text-amber-400" />
                <div>
                  <div className="text-sm font-medium text-amber-800 dark:text-amber-200">Recommendations</div>
                  <ul className="mt-1 text-sm text-amber-700 dark:text-amber-300">
                    {securityScore.recommendations.map((rec: string, index: number) => (
                      <li key={index}>• {rec}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </GlassCard>
      )}

      {/* Validation Errors/Warnings */}
      {validation && (validation.errors.length > 0 || validation.warnings.length > 0) && (
        <div className="space-y-2">
          {validation.errors.length > 0 && (
            <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <AlertTriangle className="w-4 h-4 mt-0.5 text-red-600 dark:text-red-400" />
              <div>
                <div className="text-sm font-medium text-red-800 dark:text-red-200">Configuration Errors</div>
                <ul className="mt-1 text-sm text-red-700 dark:text-red-300">
                  {validation.errors.map((error: string, index: number) => (
                    <li key={index}>• {error}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
          {validation.warnings.length > 0 && (
            <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
              <Info className="w-4 h-4 mt-0.5 text-amber-600 dark:text-amber-400" />
              <div>
                <div className="text-sm font-medium text-amber-800 dark:text-amber-200">Warnings</div>
                <ul className="mt-1 text-sm text-amber-700 dark:text-amber-300">
                  {validation.warnings.map((warning: string, index: number) => (
                    <li key={index}>• {warning}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <GlassCard title="Authentication Settings">
            <div className="space-y-6">
              <div>
                <label className="block mb-2 text-sm font-medium">Session Timeout: {securityConfig.session_timeout_minutes} mins</label>
                <input
                  type="range"
                  value={securityConfig.session_timeout_minutes}
                  onChange={(e) => updateSecurityConfig({ session_timeout_minutes: +e.target.value })}
                  min={5} max={10080} step={5}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer dark:bg-slate-700 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:bg-indigo-600 [&::-webkit-slider-thumb]:rounded-full"
                />
                <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mt-1">
                  <span>5 min</span>
                  <span>1 week</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1 text-sm font-medium">Max Login Attempts</label>
                  <input 
                    type="number" 
                    value={securityConfig.max_login_attempts} 
                    onChange={(e) => updateSecurityConfig({ max_login_attempts: +e.target.value })}
                    min={1} max={100}
                    className="w-full px-3 py-2 bg-white border rounded-md dark:bg-slate-900 border-slate-300 dark:border-slate-600" 
                  />
                </div>
                <div>
                  <label className="block mb-1 text-sm font-medium">Lockout Duration (mins)</label>
                  <input 
                    type="number" 
                    value={securityConfig.lockout_duration_minutes} 
                    onChange={(e) => updateSecurityConfig({ lockout_duration_minutes: +e.target.value })}
                    min={1} max={1440}
                    className="w-full px-3 py-2 bg-white border rounded-md dark:bg-slate-900 border-slate-300 dark:border-slate-600" 
                  />
                </div>
              </div>
            </div>
          </GlassCard>
          <GlassCard title="Security Features">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-900/20">
                <div>
                  <label className="font-medium">Strong Password Requirements</label>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Enforce complex password requirements</p>
                </div>
                <CustomSwitch 
                  checked={securityConfig.require_strong_passwords} 
                  onCheckedChange={(checked) => updateSecurityConfig({ require_strong_passwords: checked })} 
                />
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-900/20">
                <div>
                  <label className="font-medium">Two-Factor Authentication</label>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Require 2FA for admin accounts</p>
                </div>
                <CustomSwitch 
                  checked={securityConfig.enable_two_factor_auth} 
                  onCheckedChange={(checked) => updateSecurityConfig({ enable_two_factor_auth: checked })} 
                />
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-900/20">
                <div>
                  <label className="font-medium">API Rate Limiting</label>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Limit API requests to prevent abuse</p>
                </div>
                <CustomSwitch 
                  checked={securityConfig.enable_api_rate_limiting} 
                  onCheckedChange={(checked) => updateSecurityConfig({ enable_api_rate_limiting: checked })} 
                />
              </div>
            </div>
          </GlassCard>
        </div>
        <GlassCard title="CORS Origins">
          <div className="space-y-3">
            {securityConfig.allowed_cors_origins.map((origin, index) => (
              <div key={index} className="flex items-center gap-2">
                <div className="relative flex-grow">
                  <Globe className="absolute w-4 h-4 -translate-y-1/2 left-3 top-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={origin}
                    onChange={(e) => handleOriginChange(index, e.target.value)}
                    placeholder="https://example.com"
                    className="w-full pl-9 pr-3 py-2 bg-white border rounded-md dark:bg-slate-900 border-slate-300 dark:border-slate-600"
                  />
                </div>
                <button 
                  className="p-2 transition-colors rounded-md hover:bg-slate-100 dark:hover:bg-slate-700" 
                  onClick={() => removeOrigin(index)}
                >
                  <Trash2 className="w-4 h-4 text-red-500" />
                </button>
              </div>
            ))}
            <button 
              className="flex items-center justify-center w-full gap-2 px-3 py-2 text-sm font-medium bg-white border rounded-lg text-slate-700 dark:text-slate-200 dark:bg-slate-700 border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600" 
              onClick={addOrigin}
            >
              <Plus className="w-4 h-4 mr-2" /> Add Origin
            </button>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}