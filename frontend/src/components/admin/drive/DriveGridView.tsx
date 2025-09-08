"use client";

import { File, Image, Video, Music, FileText, FileArchive, Download, Eye, Trash } from 'lucide-react';
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
  none: { text: 'Not Backed Up', color: 'border-amber-500' },
  in_progress: { text: 'Transferring to Hetzner', color: 'border-blue-500' },
  completed: { text: 'Backed Up to Hetzner', color: 'border-emerald-500' },
  failed: { text: 'Backup Failed', color: 'border-red-500' },
};

interface DriveGridViewProps {
  files: DriveFileItem[];
  selectedFiles: string[];
  onToggleSelection: (fileId: string) => void;
  onDownload: (file: DriveFileItem) => Promise<void>;
  onPreview: (file: DriveFileItem) => Promise<void>;
  onDelete: (file: DriveFileItem) => Promise<void>;
}

export function DriveGridView({ 
  files, 
  selectedFiles, 
  onToggleSelection, 
  onDownload, 
  onPreview, 
  onDelete 
}: DriveGridViewProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
      {files.map(file => {
        const Icon = fileTypeIcons[file.file_type || 'other'] || File;
        const status = backupStatusConfig[file.backup_status || 'none'];
        const isSelected = selectedFiles.includes(file._id);
        
        return (
          <div 
            key={file._id} 
            className={cn(
              "relative group border rounded-xl transition-all duration-200 hover:shadow-lg hover:-translate-y-1",
              status.color,
              isSelected && "ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/20"
            )}
          >
            <div className="absolute z-10 top-2 left-2">
              <input 
                type="checkbox" 
                checked={isSelected}
                onChange={() => onToggleSelection(file._id)}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
              />
            </div>
            
            <div className="flex items-center justify-center h-32 rounded-t-xl bg-slate-100 dark:bg-slate-800">
              <Icon className="w-12 h-12 text-slate-400" />
            </div>
            
            <div className="p-3 bg-white dark:bg-slate-900 rounded-b-xl">
              <p className="text-sm font-medium truncate text-slate-900 dark:text-white" title={file.filename}>
                {file.filename || 'Unknown'}
              </p>
              
              <div className="flex items-center justify-between mt-1 text-xs text-slate-500 dark:text-slate-400">
                <span>{file.size_formatted || 'Unknown'}</span>
                <span>{file.upload_date ? formatDate(file.upload_date) : 'Unknown'}</span>
              </div>
              
              <div className="mt-2 flex items-center justify-between">
                <span className="px-2 py-1 text-xs font-medium bg-slate-100 dark:bg-slate-700 rounded">
                  {file.file_type ? file.file_type.charAt(0).toUpperCase() + file.file_type.slice(1) : 'Other'}
                </span>
                <span className="px-2 py-1 text-xs font-mono bg-slate-100 dark:bg-slate-700 rounded">
                  {file.gdrive_account_id || 'Unknown'}
                </span>
              </div>
              
              <div className="mt-2">
                <span className={cn("px-2 py-1 text-xs font-medium rounded-full", status.color.replace('border-', 'bg-'), "text-white")}>
                  {status.text}
                </span>
              </div>
              
              <div className="absolute bottom-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => onDownload(file)}
                  className="p-1.5 bg-white dark:bg-slate-700 rounded-md shadow-md hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                  title="Download"
                >
                  <Download className="w-3 h-3 text-blue-500" />
                </button>
                {file.preview_available && (
                  <button 
                    onClick={() => onPreview(file)}
                    className="p-1.5 bg-white dark:bg-slate-700 rounded-md shadow-md hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors"
                    title="Preview"
                  >
                    <Eye className="w-3 h-3 text-slate-500" />
                  </button>
                )}
                <button 
                  onClick={() => onDelete(file)}
                  className="p-1.5 bg-white dark:bg-slate-700 rounded-md shadow-md hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  title="Delete"
                >
                  <Trash className="w-3 h-3 text-red-500" />
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}