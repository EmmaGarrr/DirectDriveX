"use client";

import { useState, useCallback } from "react";
import { 
  Eye, 
  Edit, 
  File, 
  Shield, 
  Slash, 
  CheckCircle, 
  Key, 
  MoreVertical, 
  Loader2,
  AlertTriangle, 
  Users, 
  ArrowUp, 
  ArrowDown
} from "lucide-react";
import { cn } from "@/lib/utils";
import { User, UserRole, UserStatus, SortConfig } from "@/types/admin";

interface UserTableProps {
  users: User[];
  loading: boolean;
  error: string | null;
  selectedUserIds: Set<string>;
  setSelectedUserIds: React.Dispatch<React.SetStateAction<Set<string>>>;
  onAction: (type: string, data: any) => void;
  sortConfig?: SortConfig;
  onSort?: (key: string) => void;
}

// Role badge component
const RoleBadge = ({ role }: { role: UserRole }) => {
  const roleStyles = {
    superadmin: "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400",
    admin: "bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400",
    regular: "bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300",
  };
  return <span className={cn("px-2 py-1 text-xs font-medium rounded-full", roleStyles[role])}>{role}</span>;
};

// Status badge component
const StatusBadge = ({ status }: { status: UserStatus }) => {
  const statusStyles = {
    active: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400",
    suspended: "bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400",
    banned: "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400",
  };
  return <span className={cn("px-2 py-1 text-xs font-medium rounded-full", statusStyles[status])}>{status}</span>;
};

// Utility function to format bytes to human-readable format
const formatBytes = (bytes: number) => {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

// Sort header component
interface SortHeaderProps {
  label: string;
  sortKey: string;
  currentSortConfig?: SortConfig;
  onSort?: (key: string) => void;
}

const SortHeader: React.FC<SortHeaderProps> = ({ label, sortKey, currentSortConfig, onSort }) => {
  const isSorted = currentSortConfig?.key === sortKey;
  const direction = isSorted ? currentSortConfig.direction : undefined;
  
  return (
    <th 
      scope="col" 
      className={cn(
        "px-6 py-3 text-xs text-slate-700 uppercase dark:text-slate-300", 
        onSort ? "cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-600/30" : ""
      )}
      onClick={() => onSort && onSort(sortKey)}
    >
      <div className="flex items-center gap-1">
        {label}
        {isSorted && (
          direction === 'asc' ? 
            <ArrowUp className="w-3 h-3" /> : 
            <ArrowDown className="w-3 h-3" />
        )}
      </div>
    </th>
  );
};

// Table skeleton loader
const TableSkeleton: React.FC = () => (
  <div className="space-y-4">
    <div className="flex gap-2">
      {Array.from({ length: 5 }).map((_, i) => (
        <div 
          key={i}
          className="h-8 rounded-md bg-slate-200 dark:bg-slate-700 animate-pulse"
          style={{ width: `${Math.floor(Math.random() * 80) + 60}px` }}
        />
      ))}
    </div>
    {Array.from({ length: 5 }).map((_, i) => (
      <div key={i} className="flex items-center gap-3">
        <div className="w-5 h-5 rounded-md bg-slate-200 dark:bg-slate-700 animate-pulse" />
        <div 
          className="h-12 rounded-md bg-slate-200 dark:bg-slate-700 animate-pulse"
          style={{ width: `${Math.floor(Math.random() * 200) + 300}px` }}
        />
      </div>
    ))}
  </div>
);

// Main UserTable component
export function UserTable({
  users,
  loading,
  error, 
  selectedUserIds,
  setSelectedUserIds, 
  onAction,
  sortConfig,
  onSort
}: UserTableProps) {
  const handleSelectAll = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedUserIds(new Set(users.map(u => u._id)));
    } else {
      setSelectedUserIds(new Set());
    }
  }, [users, setSelectedUserIds]);

  const handleSelectOne = useCallback((userId: string) => {
    setSelectedUserIds(prev => {
      const newSelection = new Set(prev);
      if (newSelection.has(userId)) {
        newSelection.delete(userId);
      } else {
        newSelection.add(userId);
      }
      return newSelection;
    });
  }, [setSelectedUserIds]);

  // Determine if all items are selected
  const isAllSelected = users.length > 0 && selectedUserIds.size === users.length;
  
  // Determine if some items are selected (indeterminate state)
  const isIndeterminate = selectedUserIds.size > 0 && selectedUserIds.size < users.length;

  // If loading, show loading skeleton
  if (loading) {
    return (
      <div className="p-6 overflow-hidden bg-white border shadow-md dark:bg-slate-800 dark:border-slate-700 rounded-xl">
        <TableSkeleton />
      </div>
    );
  }

  // If error, show error message
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-red-500">
        <AlertTriangle className="w-12 h-12 mb-4" />
        <p className="text-lg font-semibold">Failed to load users</p>
        <p>{error}</p>
      </div>
    );
  }

  // If no users, show empty state
  if (users.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-slate-500">
        <Users className="w-12 h-12 mb-4" />
        <p className="text-lg font-semibold">No users found</p>
        <p>Try adjusting your filters or search criteria.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left text-slate-500 dark:text-slate-400">
        <thead className="text-xs uppercase text-slate-700 bg-slate-50 dark:bg-slate-700 dark:text-slate-300">
          <tr>
            <th scope="col" className="p-4">
              <div className="flex items-center">
                <input 
                  type="checkbox" 
                  onChange={handleSelectAll} 
                checked={isAllSelected}
                  ref={el => {
                  if (el) {
                    el.indeterminate = isIndeterminate;
                  }
                }}
                  className="w-4 h-4 text-blue-500 rounded border-slate-300 dark:text-blue-400 dark:border-slate-600 focus:ring-blue-500 dark:focus:ring-blue-400" 
                />
                <label className="sr-only">Select all users</label>
              </div>
            </th>
            <SortHeader label="User" sortKey="email" currentSortConfig={sortConfig} onSort={onSort} />
            <SortHeader label="Role" sortKey="role" currentSortConfig={sortConfig} onSort={onSort} />
            <SortHeader label="Status" sortKey="status" currentSortConfig={sortConfig} onSort={onSort} />
            <SortHeader label="Files" sortKey="files_count" currentSortConfig={sortConfig} onSort={onSort} />
            <SortHeader label="Storage" sortKey="storage_used" currentSortConfig={sortConfig} onSort={onSort} />
            <SortHeader label="Created" sortKey="created_at" currentSortConfig={sortConfig} onSort={onSort} />
            <SortHeader label="Last Login" sortKey="last_login" currentSortConfig={sortConfig} onSort={onSort} />
            <th scope="col" className="px-6 py-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr 
              key={user._id} 
              className="transition-colors duration-150 bg-white border-b dark:bg-slate-800 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600/20"
            >
              <td className="p-4">
                <div className="flex items-center">
                  <input 
                    type="checkbox" 
                  checked={selectedUserIds.has(user._id)}
                    onChange={() => handleSelectOne(user._id)}
                    className="w-4 h-4 text-blue-500 rounded border-slate-300 dark:text-blue-400 dark:border-slate-600 focus:ring-blue-500 dark:focus:ring-blue-400" 
                  />
                  <label className="sr-only">Select user</label>
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="font-medium text-slate-900 dark:text-white">{user.email}</div>
                <div className="text-xs text-slate-500">{user._id}</div>
              </td>
              <td className="px-6 py-4"><RoleBadge role={user.role} /></td>
              <td className="px-6 py-4"><StatusBadge status={user.status} /></td>
              <td className="px-6 py-4">{user.files_count}</td>
              <td className="px-6 py-4">{formatBytes(user.storage_used)}</td>
              <td className="px-6 py-4">{new Date(user.created_at).toLocaleDateString()}</td>
              <td className="px-6 py-4">{user.last_login ? new Date(user.last_login).toLocaleDateString() : 'Never'}</td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-1">
                  <button 
                    onClick={() => onAction('view', user)} 
                    className="p-1.5 text-blue-500 hover:bg-blue-100 dark:hover:bg-blue-900/20 rounded-md transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => onAction('files', user)} 
                    className="p-1.5 text-emerald-500 hover:bg-emerald-100 dark:hover:bg-emerald-900/20 rounded-md transition-colors"
                  >
                    <File className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => onAction('edit', user)} 
                    className="p-1.5 text-amber-500 hover:bg-amber-100 dark:hover:bg-amber-900/20 rounded-md transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  {user.status === 'active' && (
                    <button 
                      onClick={() => onAction('suspend', user)} 
                      className="p-1.5 text-yellow-500 hover:bg-yellow-100 dark:hover:bg-yellow-900/20 rounded-md transition-colors"
                      aria-label="Suspend user"
                    >
                      <Shield className="w-4 h-4" />
                    </button>
                  )}
                  {user.status !== 'banned' && (
                    <button 
                      onClick={() => onAction('ban', user)} 
                      className="p-1.5 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-md transition-colors"
                      aria-label="Ban user"
                    >
                      <Slash className="w-4 h-4" />
                    </button>
                  )}
                  {user.status !== 'active' && (
                    <button 
                      onClick={() => onAction('activate', user)} 
                      className="p-1.5 text-green-500 hover:bg-green-100 dark:hover:bg-green-900/20 rounded-md transition-colors"
                      aria-label="Activate user"
                    >
                      <CheckCircle className="w-4 h-4" />
                    </button>
                  )}
                  <button 
                    onClick={() => onAction('reset_password', user)} 
                    className="p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md transition-colors"
                    aria-label="Reset password"
                  >
                    <Key className="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}