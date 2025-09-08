"use client";

import { useState } from "react";
import { X, Edit, AlertTriangle, Save, RefreshCw } from "lucide-react";
import { User, UserRole, UserStatus, UpdateUserData } from "@/types/admin";

interface EditUserModalProps {
  user: User;
  isOpen?: boolean;
  onClose: () => void;
  onUpdateUser: (userId: string, data: UpdateUserData) => Promise<void>;
  loading?: boolean;
}

export function EditUserModal({ user, onClose, onUpdateUser, loading = false }: EditUserModalProps) {
  const [formData, setFormData] = useState<UpdateUserData>({
    email: user.email,
    role: user.role,
    status: user.status,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error for this field if any
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };
  
  // Validate form
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    // Validate email
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }
    
    // Set validation errors
    setErrors(newErrors);
    
    // Return true if no errors
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle form submission
  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }
    
    // Check if anything actually changed
    const hasChanges = 
      formData.email !== user.email ||
      formData.role !== user.role ||
      formData.status !== user.status;
    
    if (!hasChanges) {
      onClose();
      return;
    }
    
    // Submit changes
    await onUpdateUser(user._id, formData);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center overflow-auto bg-black/50 backdrop-blur-sm" 
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div 
        className="relative w-full max-w-lg p-6 m-4 bg-white shadow-xl dark:bg-slate-800 rounded-2xl" 
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg text-amber-500 bg-amber-100 dark:bg-amber-900/20 dark:text-amber-400">
              <Edit className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Edit User</h3>
          </div>
          <button 
            onClick={onClose} 
            className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700"
            aria-label="Close modal"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>
        
        {/* Content */}
        <div className="py-6 space-y-4">
          {/* Email */}
          <div>
            <label 
              htmlFor="email" 
              className="block mb-1 text-sm font-medium text-slate-900 dark:text-slate-100"
            >
              Email Address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              disabled={loading}
              className={`w-full px-3 py-2 border rounded-lg bg-slate-50 dark:bg-slate-800 ${
                errors.email 
                  ? 'border-red-300 dark:border-red-600 focus:border-red-500 focus:ring-red-500' 
                  : 'border-slate-300 dark:border-slate-600 focus:border-blue-500 focus:ring-blue-500'
              } text-slate-900 dark:text-slate-100 disabled:opacity-70`}
            />
            {errors.email && (
              <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.email}</p>
            )}
          </div>
          
          {/* Role */}
          <div>
            <label 
              htmlFor="role" 
              className="block mb-1 text-sm font-medium text-slate-900 dark:text-slate-100"
            >
              User Role
            </label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleInputChange}
              disabled={loading}
              className="w-full px-3 py-2 border rounded-lg bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100 focus:border-blue-500 focus:ring-blue-500 disabled:opacity-70"
            >
              <option value="regular">Regular User</option>
              <option value="admin">Admin</option>
              <option value="superadmin">Super Admin</option>
            </select>
          </div>
          
          {/* Status */}
          <div>
            <label 
              htmlFor="status" 
              className="block mb-1 text-sm font-medium text-slate-900 dark:text-slate-100"
            >
              Account Status
            </label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              disabled={loading}
              className="w-full px-3 py-2 border rounded-lg bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100 focus:border-blue-500 focus:ring-blue-500 disabled:opacity-70"
            >
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
              <option value="banned">Banned</option>
            </select>
          </div>
          
          {/* User ID - Read only */}
          <div>
            <label 
              htmlFor="userId" 
              className="block mb-1 text-sm font-medium text-slate-900 dark:text-slate-100"
            >
              User ID (read-only)
            </label>
            <input
              id="userId"
              type="text"
              value={user._id}
              disabled
              className="w-full px-3 py-2 font-mono text-sm border rounded-lg bg-slate-100 dark:bg-slate-900 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 disabled:opacity-70"
            />
          </div>
          
          {/* Info/warning about changing roles */}
          {formData.role !== user.role && (
            <div className="flex items-start gap-2 p-3 text-sm border rounded-lg border-amber-200 bg-amber-50 dark:bg-amber-900/10 dark:border-amber-900/20 text-amber-700 dark:text-amber-400">
              <AlertTriangle className="flex-shrink-0 w-5 h-5 mt-0.5" />
              <div>
                <p className="font-medium">Role change detected</p>
                <p>
                  Changing user role from {user.role} to {formData.role} will affect 
                  their permissions and access levels.
                </p>
              </div>
            </div>
          )}
          
          {/* Info/warning about changing status */}
          {formData.status !== user.status && (
            <div className="flex items-start gap-2 p-3 text-sm border rounded-lg border-amber-200 bg-amber-50 dark:bg-amber-900/10 dark:border-amber-900/20 text-amber-700 dark:text-amber-400">
              <AlertTriangle className="flex-shrink-0 w-5 h-5 mt-0.5" />
              <div>
                <p className="font-medium">Status change detected</p>
                <p>
                  {formData.status === 'active' && 'User will regain access to their account.'}
                  {formData.status === 'suspended' && 'User will temporarily lose access to their account.'}
                  {formData.status === 'banned' && 'User will permanently lose access to their account.'}
                </p>
              </div>
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="flex justify-end gap-3 pt-4 border-t dark:border-slate-700">
          <button 
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium bg-white border rounded-lg text-slate-700 border-slate-300 hover:bg-slate-50 dark:text-slate-300 dark:bg-slate-800 dark:border-slate-600 dark:hover:bg-slate-700 disabled:opacity-70"
          >
            Cancel
          </button>
          <button 
            onClick={handleSubmit}
            disabled={loading}
            className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-70"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
