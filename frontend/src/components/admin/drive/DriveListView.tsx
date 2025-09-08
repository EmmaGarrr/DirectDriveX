"use client";

import { File, Image, Video, Music, FileText, FileArchive, Download, Eye, Shield, ArrowRight, CloudUpload, RotateCcw, Trash, CheckCircle, ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';
import { DriveFileItem } from '@/types/drive';
import { cn } from '@/lib/utils';

const fileTypeIcons = {
  image: Image,
  video: Video,
  audio: Music,
  document: FileText,
  archive: FileArchive,
  other: File,
};

const backupStatusConfig = {
  none: { text: 'Not Backed Up', color: 'bg-amber-500' },
  in_progress: { text: 'Transferring to Hetzner', color: 'bg-blue-500' },
  completed: { text: 'Backed Up to Hetzner', color: 'bg-emerald-500' },
  failed: { text: 'Backup Failed', color: 'bg-red-500' },
};

const fileTypeBadgeColors = {
  image: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300',
  video: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300',
  audio: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300',
  document: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300',
  archive: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300',
  other: 'bg-slate-100 text-slate-800 dark:bg-slate-900/20 dark:text-slate-300',
};

interface DriveListViewProps {
  files: DriveFileItem[];
  selectedFiles: string[];
  onToggleSelection: (fileId: string) => void;
  onSelectAll: () => void;
  onSort: (field: string) => void;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  onDownload: (file: DriveFileItem) => Promise<void>;
  onCheckIntegrity: (file: DriveFileItem) => Promise<void>;
  onMove: (file: DriveFileItem) => Promise<void>;
  onForceBackup: (file: DriveFileItem) => Promise<void>;
  onRecover: (file: DriveFileItem) => Promise<void>;
  onDelete: (file: DriveFileItem) => Promise<void>;
  onPreview: (file: DriveFileItem) => Promise<void>;
}

export function DriveListView({ 
  files, 
  selectedFiles, 
  onToggleSelection, 
  onSelectAll, 
  onSort, 
  sortBy, 
  sortOrder,
  onDownload,
  onCheckIntegrity,
  onMove,
  onForceBackup,
  onRecover,
  onDelete,
  onPreview
}: DriveListViewProps) {
  const isAllSelected = selectedFiles.length === files.length && files.length > 0;
  const isIndeterminate = selectedFiles.length > 0 && selectedFiles.length < files.length;

  const getSortIcon = (field: string) => {
    if (sortBy !== field) return <ChevronsUpDown className="w-4 h-4" />;
    return sortOrder === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left text-slate-500 dark:text-slate-400">
        <thead className="text-xs uppercase text-slate-700 bg-slate-50 dark:bg-slate-700 dark:text-slate-300">
          <tr>
            <th scope="col" className="p-4">
              <input 
                type="checkbox" 
                checked={isAllSelected}
                ref={(el) => {
                  if (el) el.indeterminate = isIndeterminate;
                }}
                onChange={onSelectAll}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
              />
            </th>
            <th 
              scope="col" 
              className="px-6 py-3 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-600 select-none"
              onClick={() => onSort('filename')}
            >
              <div className="flex items-center gap-1">
                Filename
                {getSortIcon('filename')}
              </div>
            </th>
            <th 
              scope="col" 
              className="px-6 py-3 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-600 select-none"
              onClick={() => onSort('size_bytes')}
            >
              <div className="flex items-center gap-1">
                Size
                {getSortIcon('size_bytes')}
              </div>
            </th>
            <th scope="col" className="px-6 py-3">Type</th>
            <th scope="col" className="px-6 py-3">Owner</th>
            <th 
              scope="col" 
              className="px-6 py-3 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-600 select-none"
              onClick={() => onSort('upload_date')}
            >
              <div className="flex items-center gap-1">
                Upload Date
                {getSortIcon('upload_date')}
              </div>
            </th>
            <th scope="col" className="px-6 py-3">Drive Account</th>
            <th scope="col" className="px-6 py-3">Backup Status</th>
            <th scope="col" className="px-6 py-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {files.map(file => {
            const Icon = fileTypeIcons[file.file_type || 'other'] || File;
            const status = backupStatusConfig[file.backup_status || 'none'];
            const isSelected = selectedFiles.includes(file._id);
            
            return (
              <tr 
                key={file._id} 
                className={cn(
                  "bg-white border-b dark:bg-slate-800 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600/20",
                  isSelected && "bg-blue-50 dark:bg-blue-900/20"
                )}
              >
                <td className="p-4">
                  <input 
                    type="checkbox" 
                    checked={isSelected}
                    onChange={() => onToggleSelection(file._id)}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                  />
                </td>
                <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4 text-slate-500" />
                    <span className="truncate max-w-xs" title={file.filename}>{file.filename}</span>
                  </div>
                </td>
                <td className="px-6 py-4">{file.size_formatted}</td>
                <td className="px-6 py-4">
                  <span className={cn("px-2 py-1 text-xs font-medium rounded-full", fileTypeBadgeColors[file.file_type || 'other'])}>
                    {file.file_type ? file.file_type.charAt(0).toUpperCase() + file.file_type.slice(1) : 'Other'}
                  </span>
                </td>
                <td className="px-6 py-4 truncate max-w-xs" title={file.owner_email}>{file.owner_email || 'Unknown'}</td>
                <td className="px-6 py-4">{file.upload_date ? formatDate(file.upload_date) : 'Unknown'}</td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 text-xs font-mono bg-slate-100 dark:bg-slate-700 rounded">
                    {file.gdrive_account_id || 'Unknown'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={cn("px-2 py-1 text-xs font-medium rounded-full", status.color, "text-white")}>
                    {status.text}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-1 flex-wrap">
                    {/* Group 1: Download & Preview */}
                    <div className="flex items-center gap-1">
                      <button 
                        onClick={() => onDownload(file)}
                        className="p-1.5 text-blue-500 hover:bg-blue-100 dark:hover:bg-blue-900/20 rounded-md transition-colors"
                        title="Download"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      {file.preview_available && (
                        <button 
                          onClick={() => onPreview(file)}
                          className="p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md transition-colors"
                          title="Preview"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    
                    {/* Group 2: Integrity, Move, Backup */}
                    <div className="flex items-center gap-1">
                      <button 
                        onClick={() => onCheckIntegrity(file)}
                        className="p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md transition-colors"
                        title="Check Integrity"
                      >
                        <Shield className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => onMove(file)}
                        className="p-1.5 text-amber-500 hover:bg-amber-100 dark:hover:bg-amber-900/20 rounded-md transition-colors"
                        title="Move File"
                      >
                        <ArrowRight className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => onForceBackup(file)}
                        className="p-1.5 text-green-500 hover:bg-green-100 dark:hover:bg-green-900/20 rounded-md transition-colors"
                        title="Force Backup to Hetzner"
                      >
                        <CloudUpload className="w-4 h-4" />
                      </button>
                    </div>
                    
                    {/* Group 3: Recover & Delete */}
                    <div className="flex items-center gap-1">
                      <button 
                        onClick={() => onRecover(file)}
                        className="p-1.5 text-blue-500 hover:bg-blue-100 dark:hover:bg-blue-900/20 rounded-md transition-colors"
                        title="Recover from Backup"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => onDelete(file)}
                        className="p-1.5 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-md transition-colors"
                        title="Delete"
                      >
                        <Trash className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}