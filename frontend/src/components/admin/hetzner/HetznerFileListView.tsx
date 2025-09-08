import { useState } from 'react';
import { 
  Download, 
  Eye, 
  RotateCcw, 
  Trash2, 
  ChevronUp, 
  ChevronDown, 
  Check,
  FileText,
  Image,
  Video,
  Music,
  Archive,
  File,
  Server,
  Shield
} from 'lucide-react';
import { HetznerFileItem } from '@/types/hetzner';
import { getEnhancedFileType } from '@/lib/fileTypeUtils';
import { cn } from '@/lib/utils';

interface HetznerFileListViewProps {
  files: HetznerFileItem[];
  selectedFiles: string[];
  onToggleSelection: (fileId: string) => void;
  onSelectAll: () => void;
  onSort: (field: string) => void;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  onDownload: (file: HetznerFileItem) => void;
  onPreview: (file: HetznerFileItem) => void;
  onCheckIntegrity: (file: HetznerFileItem) => void;
  onRecover: (file: HetznerFileItem) => void;
  onDelete: (file: HetznerFileItem) => void;
}

const fileTypeIcons = {
  document: FileText,
  image: Image,
  video: Video,
  audio: Music,
  archive: Archive,
  other: File,
};

const fileTypeBadgeColors = {
  document: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  image: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
  video: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
  audio: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
  archive: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  other: 'bg-slate-100 text-slate-800 dark:bg-slate-900/30 dark:text-slate-300',
};

const backupStatusConfig = {
  completed: {
    label: 'Backed Up to Hetzner',
    color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  },
  failed: {
    label: 'Backup Failed',
    color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  },
  in_progress: {
    label: 'Transferring to Hetzner',
    color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
  },
  not_backed_up: {
    label: 'Not Backed Up',
    color: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300',
  },
};

const getSortIcon = (field: string, currentSortBy: string, currentSortOrder: 'asc' | 'desc') => {
  if (field !== currentSortBy) {
    return <ChevronUp className="w-4 h-4 text-slate-400" />;
  }
  return currentSortOrder === 'asc' ? 
    <ChevronUp className="w-4 h-4 text-blue-500" /> : 
    <ChevronDown className="w-4 h-4 text-blue-500" />;
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export function HetznerFileListView({
  files,
  selectedFiles,
  onToggleSelection,
  onSelectAll,
  onSort,
  sortBy,
  sortOrder,
  onDownload,
  onPreview,
  onCheckIntegrity,
  onRecover,
  onDelete,
}: HetznerFileListViewProps) {
  const allSelected = files.length > 0 && selectedFiles.length === files.length;
  const someSelected = selectedFiles.length > 0 && selectedFiles.length < files.length;

  return (
    <div className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50 dark:bg-slate-800/50">
            <tr>
              <th className="px-6 py-4 text-left">
                <button
                  onClick={onSelectAll}
                  className="flex items-center space-x-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                >
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      ref={(input) => {
                        if (input) input.indeterminate = someSelected;
                      }}
                      onChange={onSelectAll}
                      className="w-4 h-4 text-blue-600 bg-white rounded border-slate-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-slate-800 focus:ring-2 dark:bg-slate-700 dark:border-slate-600"
                    />
                    {someSelected && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </div>
                  <span className="text-sm font-medium">Select</span>
                </button>
              </th>
              <th className="px-6 py-4 text-left">
                <button
                  onClick={() => onSort('filename')}
                  className="flex items-center space-x-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                >
                  <span className="text-sm font-medium">Filename</span>
                  {getSortIcon('filename', sortBy, sortOrder)}
                </button>
              </th>
              <th className="px-6 py-4 text-left">
                <button
                  onClick={() => onSort('size_bytes')}
                  className="flex items-center space-x-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                >
                  <span className="text-sm font-medium">Size</span>
                  {getSortIcon('size_bytes', sortBy, sortOrder)}
                </button>
              </th>
              <th className="px-6 py-4 text-left">
                <button
                  onClick={() => onSort('file_type')}
                  className="flex items-center space-x-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                >
                  <span className="text-sm font-medium">Type</span>
                  {getSortIcon('file_type', sortBy, sortOrder)}
                </button>
              </th>
              <th className="px-6 py-4 text-left">
                <button
                  onClick={() => onSort('backup_status')}
                  className="flex items-center space-x-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                >
                  <span className="text-sm font-medium">Status</span>
                  {getSortIcon('backup_status', sortBy, sortOrder)}
                </button>
              </th>
              <th className="px-6 py-4 text-left">
                <button
                  onClick={() => onSort('owner_email')}
                  className="flex items-center space-x-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                >
                  <span className="text-sm font-medium">Owner</span>
                  {getSortIcon('owner_email', sortBy, sortOrder)}
                </button>
              </th>
              <th className="px-6 py-4 text-left">
                <button
                  onClick={() => onSort('upload_date')}
                  className="flex items-center space-x-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                >
                  <span className="text-sm font-medium">Upload Date</span>
                  {getSortIcon('upload_date', sortBy, sortOrder)}
                </button>
              </th>
              <th className="px-6 py-4 text-left">
                <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Account</span>
              </th>
              <th className="px-6 py-4 text-left">
                <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Path</span>
              </th>
              <th className="px-6 py-4 text-left">
                <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
            {files.map(file => {
              const enhancedFileType = getEnhancedFileType(file);
              const Icon = fileTypeIcons[enhancedFileType] || File;
              const status = backupStatusConfig[file.backup_status || 'not_backed_up'];
              const isSelected = selectedFiles.includes(file._id);

              return (
                <tr
                  key={file._id}
                  className={cn(
                    "hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors",
                    isSelected && "bg-blue-50 dark:bg-blue-900/20"
                  )}
                >
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => onToggleSelection(file._id)}
                      className="w-4 h-4 text-blue-600 bg-white rounded border-slate-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-slate-800 focus:ring-2 dark:bg-slate-700 dark:border-slate-600"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <Icon className="w-5 h-5 text-slate-500 dark:text-slate-400" />
                      <div>
                        <p className="max-w-xs text-sm font-medium truncate text-slate-900 dark:text-white" title={file.filename}>
                          {file.filename || 'Unknown'}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {file.content_type || 'Unknown type'}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-900 dark:text-white">
                    {file.size_formatted || 'Unknown'}
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn("px-2 py-1 text-xs font-medium rounded-full", fileTypeBadgeColors[enhancedFileType])}>
                      {enhancedFileType.charAt(0).toUpperCase() + enhancedFileType.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn("px-2 py-1 text-xs font-medium rounded-full", status.color)}>
                      {status.label}
                    </span>
                  </td>
                  <td className="max-w-xs px-6 py-4 truncate" title={file.owner_email}>{file.owner_email || 'Unknown'}</td>
                  <td className="px-6 py-4">{file.upload_date ? formatDate(file.upload_date) : 'Unknown'}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <Server className="w-4 h-4 text-slate-400" />
                      <span className="text-sm text-slate-600 dark:text-slate-400">
                        {file.gdrive_account_id || 'Unknown'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="max-w-xs text-xs truncate text-slate-500 dark:text-slate-400" title={file.hetzner_remote_path}>
                      {file.hetzner_remote_path || 'Unknown'}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => onDownload(file)}
                        className="p-1.5 text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                        title="Download"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      {file.preview_available && (
                        <button
                          onClick={() => onPreview(file)}
                          className="p-1.5 text-slate-600 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded transition-colors"
                          title="Preview"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => onCheckIntegrity(file)}
                        className="p-1.5 text-slate-600 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded transition-colors"
                        title="Check Integrity"
                      >
                        <Shield className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onRecover(file)}
                        className="p-1.5 text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded transition-colors"
                        title="Recover"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDelete(file)}
                        className="p-1.5 text-slate-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}