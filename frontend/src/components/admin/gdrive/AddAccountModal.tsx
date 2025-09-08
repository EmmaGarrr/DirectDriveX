"use client";

import { useState, useEffect } from 'react';
import { X, Plus, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { AddAccountModalProps, AddAccountRequest, FormValidationResult } from '@/types/google-drive';
import { useGoogleDriveOperations } from '@/hooks/useGoogleDriveOperations';
import { cn } from '@/lib/utils';

export function AddAccountModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  loading, 
  error 
}: AddAccountModalProps) {
  const { 
    addAccountForm, 
    setAddAccountForm, 
    resetAddAccountForm, 
    validateForm, 
    validateServiceAccountKey 
  } = useGoogleDriveOperations();

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [isValidating, setIsValidating] = useState(false);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      resetAddAccountForm();
      setValidationErrors({});
    }
  }, [isOpen, resetAddAccountForm]);

  // Real-time validation
  useEffect(() => {
    if (addAccountForm.service_account_key) {
      setIsValidating(true);
      const keyValidation = validateServiceAccountKey(addAccountForm.service_account_key);
      if (!keyValidation.isValid) {
        setValidationErrors(prev => ({
          ...prev,
          service_account_key: keyValidation.error || 'Invalid service account key'
        }));
      } else {
        setValidationErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.service_account_key;
          return newErrors;
        });
      }
      setIsValidating(false);
    }
  }, [addAccountForm.service_account_key, validateServiceAccountKey]);

  const handleInputChange = (field: keyof AddAccountRequest, value: string) => {
    setAddAccountForm({ ...addAccountForm, [field]: value });
    
    // Clear validation error for this field
    if (validationErrors[field]) {
      setValidationErrors((prev: Record<string, string>) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validation = validateForm();
    if (!validation.isValid) {
      setValidationErrors(validation.errors);
      return;
    }

    try {
      await onSubmit(addAccountForm);
      onClose();
    } catch (error) {
      // Error handling is done by the parent component
      console.error('Add account submission error:', error);
    }
  };

  const handleClose = () => {
    resetAddAccountForm();
    setValidationErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-2xl mx-4 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 text-white rounded-lg bg-gradient-to-br from-blue-500 to-blue-600">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                Add Google Drive Account
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Configure a new Google Drive service account
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Error Display */}
          {error && (
            <div className="flex items-center gap-3 p-4 text-red-700 bg-red-50 dark:bg-red-900/20 dark:text-red-400 rounded-lg border border-red-200 dark:border-red-800">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {/* Account Email */}
          <div className="space-y-2">
            <label htmlFor="account-email" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              Account Email *
            </label>
            <input
              type="email"
              id="account-email"
              value={addAccountForm.account_email}
              onChange={(e) => handleInputChange('account_email', e.target.value)}
              placeholder="service-account@project.iam.gserviceaccount.com"
              className={cn(
                "w-full px-4 py-3 border rounded-lg transition-colors",
                "bg-white dark:bg-slate-700 text-slate-900 dark:text-white",
                "border-slate-300 dark:border-slate-600",
                "focus:ring-2 focus:ring-blue-500 focus:border-transparent",
                validationErrors.account_email && "border-red-500 focus:ring-red-500"
              )}
              required
            />
            {validationErrors.account_email && (
              <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {validationErrors.account_email}
              </p>
            )}
          </div>

          {/* Account Alias */}
          <div className="space-y-2">
            <label htmlFor="account-alias" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              Account Alias *
            </label>
            <input
              type="text"
              id="account-alias"
              value={addAccountForm.account_alias}
              onChange={(e) => handleInputChange('account_alias', e.target.value)}
              placeholder="Primary Storage Account"
              className={cn(
                "w-full px-4 py-3 border rounded-lg transition-colors",
                "bg-white dark:bg-slate-700 text-slate-900 dark:text-white",
                "border-slate-300 dark:border-slate-600",
                "focus:ring-2 focus:ring-blue-500 focus:border-transparent",
                validationErrors.account_alias && "border-red-500 focus:ring-red-500"
              )}
              required
            />
            {validationErrors.account_alias && (
              <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {validationErrors.account_alias}
              </p>
            )}
          </div>

          {/* Service Account Key */}
          <div className="space-y-2">
            <label htmlFor="service-key" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              Service Account Key (JSON) *
            </label>
            <div className="relative">
              <textarea
                id="service-key"
                value={addAccountForm.service_account_key}
                onChange={(e) => handleInputChange('service_account_key', e.target.value)}
                placeholder='{"type": "service_account", "project_id": "...", ...}'
                rows={10}
                className={cn(
                  "w-full px-4 py-3 border rounded-lg transition-colors resize-none",
                  "bg-white dark:bg-slate-700 text-slate-900 dark:text-white",
                  "border-slate-300 dark:border-slate-600",
                  "focus:ring-2 focus:ring-blue-500 focus:border-transparent",
                  "font-mono text-sm",
                  validationErrors.service_account_key && "border-red-500 focus:ring-red-500"
                )}
                required
              />
              {isValidating && (
                <div className="absolute top-3 right-3">
                  <Loader2 className="w-4 h-4 text-slate-400 animate-spin" />
                </div>
              )}
              {!isValidating && addAccountForm.service_account_key && !validationErrors.service_account_key && (
                <div className="absolute top-3 right-3">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                </div>
              )}
            </div>
            {validationErrors.service_account_key && (
              <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {validationErrors.service_account_key}
              </p>
            )}
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Paste the complete JSON service account key file content here.
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || Object.keys(validationErrors).length > 0}
              className={cn(
                "flex items-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors",
                "bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 disabled:cursor-not-allowed"
              )}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Adding Account...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  Add Account
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
