"use client";

import { useState } from "react";
import { X, AlertTriangle, CheckCircle, Shield, Trash2, UserCheck, UserX } from "lucide-react";

interface BulkActionsModalProps {
  selectedUsers: string[];
  action?: string;
  isOpen?: boolean;
  onClose: () => void;
  onBulkAction: (userIds: string[], action: string, reason?: string) => Promise<void>;
  loading?: boolean;
}

export function BulkActionsModal({
  selectedUsers,
  action: initialAction,
  onClose,
  onBulkAction,
  loading = false
}: BulkActionsModalProps) {
  const [action, setAction] = useState<string>(initialAction || 'suspend');
  const [reason, setReason] = useState<string>('');
  
  // Get action configuration
  const getActionConfig = (actionType: string) => {
    switch (actionType) {
      case 'suspend':
        return {
          title: 'Suspend Users',
          description: 'Temporarily disable access for these users',
          icon: Shield,
          color: 'text-amber-500',
          buttonClass: 'bg-amber-600 hover:bg-amber-700',
        };
      case 'ban':
        return {
          title: 'Ban Users',
          description: 'Permanently disable access for these users',
          icon: UserX,
          color: 'text-red-500',
          buttonClass: 'bg-red-600 hover:bg-red-700',
        };
      case 'activate':
        return {
          title: 'Activate Users',
          description: 'Restore access for these users',
          icon: UserCheck,
          color: 'text-green-500',
          buttonClass: 'bg-green-600 hover:bg-green-700',
        };
      case 'delete':
        return {
          title: 'Delete Users',
          description: 'Permanently remove these users and their data',
          icon: Trash2,
          color: 'text-red-500',
          buttonClass: 'bg-red-600 hover:bg-red-700',
        };
      default:
        return {
          title: 'Process Users',
          description: 'Perform action on selected users',
          icon: AlertTriangle,
          color: 'text-blue-500',
          buttonClass: 'bg-blue-600 hover:bg-blue-700',
        };
    }
  };
  
  const currentAction = getActionConfig(action);
  const ActionIcon = currentAction.icon;
  
  // Handle submit
  const handleSubmit = async () => {
    await onBulkAction(selectedUsers, action, reason || undefined);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center overflow-auto bg-black/50 backdrop-blur-sm" 
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div 
        className="relative w-full max-w-md p-6 m-4 bg-white shadow-xl dark:bg-slate-800 rounded-2xl" 
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-4 border-b dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className={`flex items-center justify-center w-8 h-8 ${currentAction.color} rounded-lg bg-opacity-20`}>
              <ActionIcon className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Bulk Action</h3>
          </div>
          <button 
            onClick={onClose} 
            className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700"
            aria-label="Close modal"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>
        
        <div className="pt-6 space-y-4">
          {/* User count */}
          <div className="flex items-center justify-center p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20">
            <span className="text-blue-700 dark:text-blue-400">
              {selectedUsers.length} {selectedUsers.length === 1 ? 'user' : 'users'} selected
            </span>
          </div>
          
          {/* Action selection */}
          <div>
            <label htmlFor="action" className="block mb-2 text-sm font-medium text-slate-900 dark:text-slate-100">
              Select Action
            </label>
            <select
              id="action"
              value={action}
              onChange={(e) => setAction(e.target.value)}
              disabled={loading}
              className="w-full p-3 border rounded-lg bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-70"
            >
              <option value="suspend">Suspend Users</option>
              <option value="ban">Ban Users</option>
              <option value="activate">Activate Users</option>
              <option value="delete">Delete Users</option>
            </select>
          </div>
          
          {/* Action description */}
          <div className="p-4 border rounded-lg border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-2">
              <ActionIcon className={`w-5 h-5 ${currentAction.color}`} />
              <h4 className="font-medium text-slate-900 dark:text-white">{currentAction.title}</h4>
            </div>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
              {currentAction.description}
            </p>
          </div>
          
          {/* Reason input */}
          <div>
            <label htmlFor="reason" className="block mb-2 text-sm font-medium text-slate-900 dark:text-slate-100">
              Reason (optional)
            </label>
            <textarea
              id="reason"
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={`Enter reason for ${action} action...`}
              disabled={loading}
              className="w-full p-3 border rounded-lg resize-none bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-70"
            />
          </div>
        </div>
        
        {/* Action buttons */}
        <div className="flex justify-end gap-3 pt-4 mt-6 border-t dark:border-slate-700">
          <button 
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium bg-white border rounded-lg text-slate-700 border-slate-300 hover:bg-slate-50 dark:text-slate-300 dark:bg-slate-800 dark:border-slate-600 dark:hover:bg-slate-700 disabled:opacity-70"
          >
            Cancel
          </button>
          <button 
            onClick={handleSubmit}
            disabled={loading || selectedUsers.length === 0}
            className={`px-4 py-2 text-sm font-medium text-white rounded-lg ${currentAction.buttonClass} disabled:opacity-70`}
          >
            {loading 
              ? 'Processing...' 
              : `${action.charAt(0).toUpperCase() + action.slice(1)} ${selectedUsers.length} ${selectedUsers.length === 1 ? 'User' : 'Users'}`
            }
          </button>
        </div>
      </div>
    </div>
  );
}
