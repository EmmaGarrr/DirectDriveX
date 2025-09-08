"use client";

import { useState, useEffect } from "react";
import { Cog, Shield, Key, Users, Save, RotateCcw, AlertTriangle } from "lucide-react";
import { GeneralSecurityTab } from "./GeneralSecurityTab";
import { AccessRulesTab } from "./AccessRulesTab";
import { PasswordPolicyTab } from "./PasswordPolicyTab";
import { ActiveSessionsTab } from "./ActiveSessionsTab";
import { useSecuritySettings } from "@/hooks/useSecuritySettings";
import { useAccessRules } from "@/hooks/useAccessRules";
import { usePasswordPolicy } from "@/hooks/usePasswordPolicy";
import { useActiveSessions } from "@/hooks/useActiveSessions";
import { cn } from "@/lib/utils";

const tabs = [
  { id: "general", label: "General", icon: Cog },
  { id: "access-rules", label: "Access Rules", icon: Shield },
  { id: "password-policy", label: "Password Policy", icon: Key },
  { id: "sessions", label: "Active Sessions", icon: Users },
];

export function SecuritySettings() {
  const [activeTab, setActiveTab] = useState("general");
  const [globalError, setGlobalError] = useState("");

  // Initialize all security hooks
  const securitySettings = useSecuritySettings();
  const accessRules = useAccessRules();
  const passwordPolicy = usePasswordPolicy();
  const activeSessions = useActiveSessions();

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        await Promise.all([
          securitySettings.loadSecurityConfig(),
          accessRules.loadAccessRules(),
          passwordPolicy.loadPasswordPolicy(),
          activeSessions.loadActiveSessions()
        ]);
      } catch (error) {
        console.error('Error loading initial security data:', error);
        setGlobalError('Failed to load security configuration');
      }
    };

    loadInitialData();
  }, []);

  // Handle save all settings
  const handleSaveAll = async () => {
    try {
      setGlobalError("");
      await Promise.all([
        securitySettings.saveSecurityConfig(),
        passwordPolicy.savePasswordPolicy()
      ]);
    } catch (error) {
      console.error('Error saving security settings:', error);
      setGlobalError('Failed to save some security settings');
    }
  };

  // Handle reset all changes
  const handleResetAll = () => {
    securitySettings.resetSecurityConfig();
    passwordPolicy.resetPasswordPolicy();
    setGlobalError("");
  };

  // Check if there are any unsaved changes
  const hasUnsavedChanges = securitySettings.hasChanges || passwordPolicy.hasChanges;
  const isLoading = securitySettings.loading || accessRules.loading || passwordPolicy.loading || activeSessions.loading;

    return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-4">
          <div className="flex items-center justify-center w-12 h-12 text-white rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-600">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Security Settings</h1>
            <p className="text-sm text-slate-600 dark:text-slate-400">Manage your system's security configuration.</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={handleResetAll}
            disabled={!hasUnsavedChanges || isLoading}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium bg-white border rounded-lg text-slate-700 dark:text-slate-200 dark:bg-slate-700 border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RotateCcw className="w-4 h-4" /> Reset Changes
          </button>
          <button
            onClick={handleSaveAll}
            disabled={!hasUnsavedChanges || isLoading}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-4 h-4" /> Save All Settings
          </button>
        </div>
            </div>

      {/* Global Error Display */}
      {globalError && (
        <div className="flex items-center gap-3 p-4 text-red-800 bg-red-50 border border-red-200 rounded-lg dark:bg-red-900/20 dark:text-red-200 dark:border-red-800">
          <AlertTriangle className="w-5 h-5" />
          <span className="text-sm font-medium">{globalError}</span>
            <button
            onClick={() => setGlobalError("")}
            className="ml-auto text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-200"
            >
              ×
            </button>
          </div>
        )}

      {/* Custom Tabs */}
      <div>
        <div className="grid w-full grid-cols-2 p-1 rounded-lg md:grid-cols-4 bg-slate-100 dark:bg-slate-800">
          {tabs.map(tab => (
                <button
                  key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "inline-flex items-center justify-center px-3 py-2 text-sm font-medium transition-colors rounded-md",
                activeTab === tab.id
                  ? "bg-white text-indigo-600 shadow-sm dark:bg-slate-700 dark:text-white"
                  : "text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
              )}
            >
              <tab.icon className="w-4 h-4 mr-2" />
                  {tab.label}
                </button>
          ))}
        </div>
        <div className="mt-6">
            {activeTab === 'general' && (
              <GeneralSecurityTab
                securitySettings={securitySettings}
              />
            )}
            {activeTab === 'access-rules' && (
              <AccessRulesTab
                accessRules={accessRules}
              />
            )}
            {activeTab === 'password-policy' && (
              <PasswordPolicyTab
                passwordPolicy={passwordPolicy}
              />
            )}
            {activeTab === 'sessions' && (
              <ActiveSessionsTab
                activeSessions={activeSessions}
              />
            )}
        </div>
      </div>
    </div>
  );
}