"use client";

import { useState } from "react";
import { X, Info, Edit, Shield, AlertTriangle, CheckCircle, Key, Trash2, FileQuestion } from "lucide-react";
import { ModalState, User, UserRole } from "@/types/admin";
import { BulkActionsModal } from "./BulkActionsModal";
import { UserFilesModal } from "./UserFilesModal";
import { StorageInsightsModal } from "./StorageInsightsModal";
import { EditUserModal } from "./EditUserModal";

interface UserModalsProps {
  modalState: ModalState;
  onClose: () => void;
  onConfirmAction?: (userId: string, action: string, reason?: string) => Promise<void>;
  onBulkAction?: (userIds: string[], action: string, reason?: string) => Promise<void>;
  onUpdateUser?: (userId: string, data: any) => Promise<void>;
  onResetPassword?: (userId: string, newPassword?: string) => Promise<void>;
  loading?: boolean;
}

// Base modal component
const Modal = ({ 
  title, 
  children, 
  onClose, 
  icon: Icon, 
  size = "md" 
}: { 
  title: string; 
  children: React.ReactNode; 
  onClose: () => void; 
  icon: React.ElementType; 
  size?: "sm" | "md" | "lg" | "xl"
}) => {
  // Determine max width based on size
  const maxWidthClass = {
    sm: "max-w-md",
    md: "max-w-2xl",
    lg: "max-w-4xl",
    xl: "max-w-6xl"
  }[size];
  
  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center overflow-auto bg-black/50 backdrop-blur-sm" 
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div 
        className={`relative w-full ${maxWidthClass} p-6 m-4 bg-white shadow-xl dark:bg-slate-800 rounded-2xl`} 
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-4 border-b dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 text-blue-500 bg-blue-100 rounded-lg dark:bg-blue-900/20 dark:text-blue-400">
              <Icon className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{title}</h3>
          </div>
          <button 
            onClick={onClose} 
            className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700"
            aria-label="Close modal"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>
        <div className="pt-6">{children}</div>
      </div>
    </div>
  );
};

// User details modal component
const UserDetailsModal = ({ user, onClose }: { user: User; onClose: () => void }) => {
  return (
    <Modal title="User Details" onClose={onClose} icon={Info}>
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium text-slate-500 dark:text-slate-400">Email</h4>
            <p className="text-base font-medium text-slate-900 dark:text-white">{user.email}</p>
          </div>
          
          <div>
            <h4 className="text-sm font-medium text-slate-500 dark:text-slate-400">User ID</h4>
            <p className="font-mono text-sm text-slate-700 dark:text-slate-300">{user._id}</p>
          </div>
          
          <div>
            <h4 className="text-sm font-medium text-slate-500 dark:text-slate-400">Role</h4>
            <div className="mt-1">
              {user.role === 'superadmin' && (
                <span className="px-2 py-1 text-xs font-medium text-red-700 bg-red-100 rounded-full dark:bg-red-900/20 dark:text-red-400">
                  Super Admin
                </span>
              )}
              {user.role === 'admin' && (
                <span className="px-2 py-1 text-xs font-medium text-blue-700 bg-blue-100 rounded-full dark:bg-blue-900/20 dark:text-blue-400">
                  Admin
                </span>
              )}
              {user.role === 'regular' && (
                <span className="px-2 py-1 text-xs font-medium rounded-full text-slate-700 bg-slate-100 dark:bg-slate-700 dark:text-slate-300">
                  Regular User
                </span>
              )}
            </div>
          </div>
          
          <div>
            <h4 className="text-sm font-medium text-slate-500 dark:text-slate-400">Status</h4>
            <div className="mt-1">
              {user.status === 'active' && (
                <span className="px-2 py-1 text-xs font-medium rounded-full text-emerald-700 bg-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400">
                  Active
                </span>
              )}
              {user.status === 'suspended' && (
                <span className="px-2 py-1 text-xs font-medium rounded-full text-amber-700 bg-amber-100 dark:bg-amber-900/20 dark:text-amber-400">
                  Suspended
                </span>
              )}
              {user.status === 'banned' && (
                <span className="px-2 py-1 text-xs font-medium text-red-700 bg-red-100 rounded-full dark:bg-red-900/20 dark:text-red-400">
                  Banned
                </span>
              )}
            </div>
          </div>
        </div>
        
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium text-slate-500 dark:text-slate-400">Created</h4>
            <p className="text-base text-slate-900 dark:text-white">
              {new Date(user.created_at).toLocaleString()}
            </p>
          </div>
          
          <div>
            <h4 className="text-sm font-medium text-slate-500 dark:text-slate-400">Last Login</h4>
            <p className="text-base text-slate-900 dark:text-white">
              {user.last_login ? new Date(user.last_login).toLocaleString() : 'Never'}
            </p>
          </div>
          
          <div>
            <h4 className="text-sm font-medium text-slate-500 dark:text-slate-400">Storage Used</h4>
            <p className="text-base font-medium text-slate-900 dark:text-white">
              {formatBytes(user.storage_used)}
            </p>
          </div>
          
          <div>
            <h4 className="text-sm font-medium text-slate-500 dark:text-slate-400">Files Count</h4>
            <p className="text-base font-medium text-slate-900 dark:text-white">
              {user.files_count.toLocaleString()}
            </p>
          </div>
        </div>
      </div>
      
      <div className="flex justify-end gap-3 pt-4 mt-6 border-t dark:border-slate-700">
        <button 
          onClick={onClose}
          className="px-4 py-2 text-sm font-medium bg-white border rounded-lg text-slate-700 border-slate-300 hover:bg-slate-50 dark:text-slate-300 dark:bg-slate-800 dark:border-slate-600 dark:hover:bg-slate-700"
        >
          Close
        </button>
      </div>
    </Modal>
  );
};

// Confirmation dialog component
const ConfirmActionModal = ({ 
  data, 
  onClose, 
  onConfirm, 
  loading = false
}: { 
  data: { user: User; action: string }; 
  onClose: () => void; 
  onConfirm: (userId: string, action: string, reason?: string) => Promise<void>;
  loading?: boolean;
}) => {
  const [reason, setReason] = useState("");
  const { user, action } = data;
  
  // Generate title and message based on action
  const getActionDetails = () => {
    switch (action) {
      case 'suspend':
        return {
          title: 'Suspend User',
          message: `Are you sure you want to suspend ${user.email}?`,
          icon: AlertTriangle,
          buttonText: 'Suspend User',
          buttonClass: 'bg-amber-600 hover:bg-amber-700'
        };
      case 'ban':
        return {
          title: 'Ban User',
          message: `Are you sure you want to ban ${user.email}? This will prevent them from logging in.`,
          icon: AlertTriangle,
          buttonText: 'Ban User',
          buttonClass: 'bg-red-600 hover:bg-red-700'
        };
      case 'activate':
        return {
          title: 'Activate User',
          message: `Are you sure you want to activate ${user.email}?`,
          icon: CheckCircle,
          buttonText: 'Activate User',
          buttonClass: 'bg-emerald-600 hover:bg-emerald-700'
        };
      case 'delete':
        return {
          title: 'Delete User',
          message: `Are you sure you want to delete ${user.email}? This action cannot be undone.`,
          icon: Trash2,
          buttonText: 'Delete User',
          buttonClass: 'bg-red-600 hover:bg-red-700'
        };
      default:
        return {
          title: `Confirm ${action.charAt(0).toUpperCase() + action.slice(1)}`,
          message: `Are you sure you want to ${action} ${user.email}?`,
          icon: AlertTriangle,
          buttonText: `Confirm ${action.charAt(0).toUpperCase() + action.slice(1)}`,
          buttonClass: 'bg-blue-600 hover:bg-blue-700'
        };
    }
  };
  
  const { title, message, icon: ActionIcon, buttonText, buttonClass } = getActionDetails();
  
  const handleConfirm = async () => {
    await onConfirm(user._id, action, reason || undefined);
  };
  
  return (
    <Modal title={title} onClose={onClose} icon={ActionIcon} size="sm">
      <p className="text-base text-slate-700 dark:text-slate-300">{message}</p>
      
      <div className="mt-4">
        <label htmlFor="reason" className="block mb-2 text-sm font-medium text-slate-900 dark:text-slate-100">
          Reason (optional)
        </label>
        <textarea
          id="reason"
          rows={3}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Enter a reason for this action..."
          disabled={loading}
          className="w-full p-3 border rounded-lg resize-none bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-70"
        />
      </div>
      
      <div className="flex justify-end gap-3 mt-6">
        <button 
          onClick={onClose}
          disabled={loading}
          className="px-4 py-2 text-sm font-medium bg-white border rounded-lg text-slate-700 border-slate-300 hover:bg-slate-50 dark:text-slate-300 dark:bg-slate-800 dark:border-slate-600 dark:hover:bg-slate-700 disabled:opacity-70"
        >
          Cancel
        </button>
        <button 
          onClick={handleConfirm}
          disabled={loading}
          className={`px-4 py-2 text-sm font-medium text-white rounded-lg ${buttonClass} disabled:opacity-70`}
        >
          {loading ? 'Processing...' : buttonText}
        </button>
      </div>
    </Modal>
  );
};

// Reset password modal component
const ResetPasswordModal = ({ 
  user, 
  onClose, 
  onResetPassword, 
  loading = false
}: { 
  user: User; 
  onClose: () => void; 
  onResetPassword: (userId: string, newPassword?: string) => Promise<void>;
  loading?: boolean;
}) => {
  const [newPassword, setNewPassword] = useState("");
  const [generateRandom, setGenerateRandom] = useState(true);
  
  const handleResetPassword = async () => {
    if (generateRandom) {
      await onResetPassword(user._id);
    } else {
      if (newPassword.trim().length < 8) {
        // Show error
        return;
      }
      await onResetPassword(user._id, newPassword);
    }
  };
  
  return (
    <Modal title="Reset User Password" onClose={onClose} icon={Key} size="sm">
      <div className="space-y-4">
        <p className="text-base text-slate-700 dark:text-slate-300">
          Reset password for user: <span className="font-medium text-slate-900 dark:text-white">{user.email}</span>
        </p>
        
        <div className="flex items-center">
          <input
            id="generateRandom"
            type="radio"
            name="passwordOption"
            checked={generateRandom}
            onChange={() => setGenerateRandom(true)}
            className="w-4 h-4 text-blue-600 border-slate-300 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-700"
          />
          <label htmlFor="generateRandom" className="ml-2 text-sm text-slate-700 dark:text-slate-300">
            Generate random secure password
          </label>
        </div>
        
        <div className="flex items-center">
          <input
            id="specifyPassword"
            type="radio"
            name="passwordOption"
            checked={!generateRandom}
            onChange={() => setGenerateRandom(false)}
            className="w-4 h-4 text-blue-600 border-slate-300 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-700"
          />
          <label htmlFor="specifyPassword" className="ml-2 text-sm text-slate-700 dark:text-slate-300">
            Specify a password
          </label>
        </div>
        
        {!generateRandom && (
          <div>
            <label htmlFor="newPassword" className="block mb-2 text-sm font-medium text-slate-900 dark:text-slate-100">
              New Password
            </label>
            <input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password"
              disabled={loading || generateRandom}
              className="w-full p-3 border rounded-lg bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-70"
            />
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Password must be at least 8 characters long
            </p>
          </div>
        )}
      </div>
      
      <div className="flex justify-end gap-3 mt-6">
        <button 
          onClick={onClose}
          disabled={loading}
          className="px-4 py-2 text-sm font-medium bg-white border rounded-lg text-slate-700 border-slate-300 hover:bg-slate-50 dark:text-slate-300 dark:bg-slate-800 dark:border-slate-600 dark:hover:bg-slate-700 disabled:opacity-70"
        >
          Cancel
        </button>
        <button 
          onClick={handleResetPassword}
          disabled={loading || (!generateRandom && newPassword.trim().length < 8)}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-70"
        >
          {loading ? 'Processing...' : 'Reset Password'}
        </button>
      </div>
    </Modal>
  );
};

// Format bytes for display
const formatBytes = (bytes: number) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Main component that manages all modals
export function UserModals({ 
  modalState, 
  onClose, 
  onConfirmAction,
  onBulkAction,
  onUpdateUser,
  onResetPassword,
  loading = false
}: UserModalsProps) {
  if (!modalState.type) return null;
  
  // For view, confirm, and reset_password modals
  if (modalState.type === 'view') {
    return <UserDetailsModal user={modalState.data} onClose={onClose} />;
  }
  
  if (modalState.type === 'confirm' && onConfirmAction) {
    return (
      <ConfirmActionModal 
        data={modalState.data} 
        onClose={onClose} 
        onConfirm={onConfirmAction}
        loading={loading} 
      />
    );
  }
  
  if (modalState.type === 'reset_password' && onResetPassword) {
    return (
      <ResetPasswordModal 
        user={modalState.data} 
        onClose={onClose} 
        onResetPassword={onResetPassword}
        loading={loading}
      />
    );
  }
  
  // For specialized modals, render the appropriate component
  switch (modalState.type) {
    case 'edit':
      return onUpdateUser ? (
        <EditUserModal 
          user={modalState.data} 
          onClose={onClose} 
          onUpdateUser={onUpdateUser}
          loading={loading}
        />
      ) : null;
      
    case 'bulk':
      return onBulkAction ? (
        <BulkActionsModal 
          selectedUsers={modalState.data.userIds} 
          action={modalState.data.action}
          onClose={onClose} 
          onBulkAction={onBulkAction}
          loading={loading}
        />
      ) : null;
      
    case 'files':
      return (
        <UserFilesModal 
          user={modalState.data} 
          onClose={onClose}
          onStorageDetails={(fileId) => {
            onClose();
            // Re-open with storage view for this file
            setTimeout(() => {
              const storageModalState: ModalState = {
                type: 'storage',
                data: { fileId, user: modalState.data }
              };
              // You need to handle this state change elsewhere
              // This is a placeholder to show the pattern
            }, 0);
          }} 
        />
      );
      
    case 'storage':
      return (
        <StorageInsightsModal 
          fileId={modalState.data.fileId}
          user={modalState.data.user}
          onClose={onClose} 
        />
      );
      
    default:
      return (
        <Modal title="Not Implemented" onClose={onClose} icon={FileQuestion} size="sm">
          <p className="text-slate-700 dark:text-slate-300">
            Modal type "{modalState.type}" is not yet implemented.
          </p>
          <div className="flex justify-end mt-6">
            <button 
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
            >
              Close
            </button>
          </div>
        </Modal>
      );
  }
}