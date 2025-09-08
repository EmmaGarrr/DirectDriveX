import { 
  Download, 
  Eye, 
  Trash2, 
  FileText,
  Image,
  Video,
  Music,
  Archive,
  File,
  Server,
  Check
} from 'lucide-react';
import { HetznerFileItem } from '@/types/hetzner';
import { getEnhancedFileType } from '@/lib/fileTypeUtils';
import { cn } from '@/lib/utils';

interface HetznerFileGridViewProps {
  files: HetznerFileItem[];
  selectedFiles: string[];
  onToggleSelection: (fileId: string) => void;
  onDownload: (file: HetznerFileItem) => void;
  onPreview: (file: HetznerFileItem) => void;
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

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export function HetznerFileGridView({
  files,
  selectedFiles,
  onToggleSelection,
  onDownload,
  onPreview,
  onDelete,
}: HetznerFileGridViewProps) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {files.map(file => {
        const enhancedFileType = getEnhancedFileType(file);
        const Icon = fileTypeIcons[enhancedFileType] || File;
        const status = backupStatusConfig[file.backup_status || 'not_backed_up'];
        const isSelected = selectedFiles.includes(file._id);

        return (
          <div
            key={file._id}
            className={cn(
              "relative group bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-lg transition-all duration-200 overflow-hidden",
              isSelected && "ring-2 ring-blue-500 dark:ring-blue-400"
            )}
          >
            {/* Selection Checkbox */}
            <div className="absolute z-10 top-3 left-3">
              <label className="relative cursor-pointer">
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => onToggleSelection(file._id)}
                  className="sr-only"
                />
                <div className={cn(
                  "w-5 h-5 rounded border-2 flex items-center justify-center transition-all",
                  isSelected 
                    ? "bg-blue-500 border-blue-500" 
                    : "bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 group-hover:border-blue-400"
                )}>
                  {isSelected && <Check className="w-3 h-3 text-white" />}
                </div>
              </label>
            </div>

            {/* File Icon */}
            <div className="p-6 pb-4">
              <div className="flex items-center justify-center mb-4">
                <div className="p-4 bg-slate-100 dark:bg-slate-700 rounded-xl">
                  <Icon className="w-8 h-8 text-slate-600 dark:text-slate-400" />
                </div>
              </div>

                          {/* File Info */}
            <div className="space-y-2 text-center">
              <h3 className="text-sm font-medium truncate text-slate-900 dark:text-white" title={file.filename}>
                {file.filename || 'Unknown'}
              </h3>
              <div className="space-y-1">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {file.size_formatted || 'Unknown'}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {file.upload_date ? formatDate(file.upload_date) : 'Unknown'}
                </p>
                <p className="text-xs truncate text-slate-500 dark:text-slate-400" title={file.owner_email}>
                  {file.owner_email || 'Unknown'}
                </p>
              </div>
            </div>
            </div>

            {/* File Type Badge */}
            <div className="px-4 pb-2">
              <span className={cn("px-2 py-1 text-xs font-medium bg-slate-100 dark:bg-slate-700 rounded", fileTypeBadgeColors[enhancedFileType])}>
                {enhancedFileType.charAt(0).toUpperCase() + enhancedFileType.slice(1)}
              </span>
            </div>

            {/* Status Badge */}
            <div className="px-4 pb-2">
              <span className={cn("px-2 py-1 text-xs font-medium rounded", status.color)}>
                {status.label}
              </span>
            </div>

            {/* Account Info */}
            <div className="px-4 pb-2">
              <div className="flex items-center space-x-2 text-xs text-slate-500 dark:text-slate-400">
                <Server className="w-3 h-3" />
                <span className="truncate">{file.gdrive_account_id || 'Unknown'}</span>
              </div>
            </div>

            {/* Backup Path Info */}
            <div className="px-4 pb-2">
              <div className="text-xs truncate text-slate-500 dark:text-slate-400" title={file.hetzner_remote_path}>
                {file.hetzner_remote_path || 'Unknown path'}
              </div>
            </div>

            {/* Actions */}
            <div className="p-4 pt-2 border-t border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-center space-x-2">
                <button
                  onClick={() => onDownload(file)}
                  className="p-2 transition-colors rounded-lg text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                  title="Download"
                >
                  <Download className="w-4 h-4" />
                </button>
                {file.preview_available && (
                  <button
                    onClick={() => onPreview(file)}
                    className="p-2 transition-colors rounded-lg text-slate-600 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20"
                    title="Preview"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={() => onDelete(file)}
                  className="p-2 transition-colors rounded-lg text-slate-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}