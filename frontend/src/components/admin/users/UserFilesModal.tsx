"use client";

import { useState, useEffect } from "react";
import { 
  X, 
  File, 
  FileText, 
  FileImage, 
  FileVideo, 
  FileAudio, 
  FileArchive,
  FileQuestion,
  Database,
  ChevronLeft, 
  ChevronRight, 
  Loader2,
  Download,
  ExternalLink,
  Eye
} from "lucide-react";
import { userManagementService } from "@/services/admin/userManagementService";
import { User, UserFile } from "@/types/admin";

interface UserFilesModalProps {
  user: User;
  isOpen?: boolean;
  onClose: () => void;
  onStorageDetails?: (fileId: string) => void;
}

// Function to get file icon based on file type
const getFileIcon = (fileType: UserFile['file_type']) => {
  switch (fileType) {
    case 'document': return FileText;
    case 'image': return FileImage;
    case 'video': return FileVideo;
    case 'audio': return FileAudio;
    case 'archive': return FileArchive;
    default: return FileQuestion;
  }
};

// File badge component
const FileBadge = ({ type }: { type: UserFile['file_type'] }) => {
  const badgeStyles = {
    document: "bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400",
    image: "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400",
    video: "bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400",
    audio: "bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400",
    archive: "bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300",
    other: "bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300",
  };
  
  return (
    <span className={`px-2 py-1 text-xs font-medium rounded-full ${badgeStyles[type]}`}>
      {type.charAt(0).toUpperCase() + type.slice(1)}
    </span>
  );
};

// Status badge component
const StatusBadge = ({ status }: { status: UserFile['status'] }) => {
  const statusStyles = {
    completed: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400",
    uploading: "bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400",
    failed: "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400",
    pending: "bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400",
  };
  
  return (
    <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusStyles[status]}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

export function UserFilesModal({ user, onClose, onStorageDetails }: UserFilesModalProps) {
  const [files, setFiles] = useState<UserFile[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalFiles, setTotalFiles] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Load user's files
  useEffect(() => {
    const loadFiles = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await userManagementService.getUserFiles(user._id, currentPage);
        
        setFiles(response.files);
        setTotalPages(response.total_pages);
        setTotalFiles(response.total);
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load files');
        setLoading(false);
      }
    };
    
    loadFiles();
  }, [user._id, currentPage]);

  // Format bytes to human-readable string
  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };
  
  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center overflow-auto bg-black/50 backdrop-blur-sm" 
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div 
        className="relative w-full max-w-4xl p-6 m-4 bg-white shadow-xl dark:bg-slate-800 rounded-2xl" 
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 text-blue-500 bg-blue-100 rounded-lg dark:bg-blue-900/20 dark:text-blue-400">
              <File className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Files for {user.email}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Viewing {files.length} of {totalFiles} files
              </p>
            </div>
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
        <div className="py-6">
          {/* File summary */}
          <div className="grid gap-4 mb-6 md:grid-cols-3">
            <div className="p-4 border border-blue-100 rounded-lg bg-blue-50 dark:bg-blue-900/10 dark:border-blue-900/20">
              <p className="text-sm text-blue-600 dark:text-blue-400">Total Files</p>
              <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">{totalFiles}</p>
            </div>
            <div className="p-4 border border-green-100 rounded-lg bg-green-50 dark:bg-green-900/10 dark:border-green-900/20">
              <p className="text-sm text-green-600 dark:text-green-400">Total Storage</p>
              <p className="text-2xl font-bold text-green-700 dark:text-green-300">{formatBytes(user.storage_used)}</p>
            </div>
            <div className="p-4 border rounded-lg bg-amber-50 border-amber-100 dark:bg-amber-900/10 dark:border-amber-900/20">
              <p className="text-sm text-amber-600 dark:text-amber-400">Avg. File Size</p>
              <p className="text-2xl font-bold text-amber-700 dark:text-amber-300">
                {user.files_count > 0 ? formatBytes(user.storage_used / user.files_count) : '0 B'}
              </p>
            </div>
          </div>
          
          {/* File list */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="w-8 h-8 mb-3 text-blue-500 animate-spin" />
              <p className="text-sm text-slate-600 dark:text-slate-400">Loading files...</p>
            </div>
          ) : error ? (
            <div className="p-6 text-center text-red-600 dark:text-red-400">
              <p className="text-xl font-semibold">Failed to load files</p>
              <p className="mt-2">{error}</p>
            </div>
          ) : files.length === 0 ? (
            <div className="p-6 text-center text-slate-600 dark:text-slate-400">
              <FileQuestion className="w-12 h-12 mx-auto mb-3 text-slate-400" />
              <p className="text-xl font-semibold">No files found</p>
              <p className="mt-2">This user has not uploaded any files yet.</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-slate-500 dark:text-slate-400">
                  <thead className="text-xs uppercase text-slate-700 bg-slate-50 dark:bg-slate-700 dark:text-slate-300">
                    <tr>
                      <th scope="col" className="px-4 py-3">File</th>
                      <th scope="col" className="px-4 py-3">Type</th>
                      <th scope="col" className="px-4 py-3">Size</th>
                      <th scope="col" className="px-4 py-3">Upload Date</th>
                      <th scope="col" className="px-4 py-3">Status</th>
                      <th scope="col" className="px-4 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {files.map((file) => {
                      const FileIcon = getFileIcon(file.file_type);
                      return (
                        <tr 
                          key={file._id} 
                          className="bg-white border-b dark:bg-slate-800 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/30"
                        >
                          <td className="px-4 py-3">
                            <div className="flex items-center space-x-3">
                              <FileIcon className="flex-shrink-0 w-5 h-5 text-slate-500" />
                              <div className="font-medium text-slate-900 dark:text-white truncate max-w-[200px]" title={file.filename}>
                                {file.filename}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <FileBadge type={file.file_type} />
                          </td>
                          <td className="px-4 py-3 font-medium">
                            {file.size_formatted}
                          </td>
                          <td className="px-4 py-3">
                            {file.upload_date_formatted}
                          </td>
                          <td className="px-4 py-3">
                            <StatusBadge status={file.status} />
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center space-x-2">
                              <button 
                                className="p-1 text-blue-500 rounded hover:bg-blue-100 dark:hover:bg-blue-900/20" 
                                title="View file"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button 
                                className="p-1 text-green-500 rounded hover:bg-green-100 dark:hover:bg-green-900/20"
                                title="Download file"
                              >
                                <Download className="w-4 h-4" />
                              </button>
                              <button 
                                className="p-1 rounded text-amber-500 hover:bg-amber-100 dark:hover:bg-amber-900/20"
                                title="View storage details"
                                onClick={() => onStorageDetails && onStorageDetails(file._id)}
                              >
                                <Database className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center mt-4 space-x-1">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1 || loading}
                    className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    // Display 5 page numbers centered around the current page
                    let pageToShow;
                    if (totalPages <= 5) {
                      pageToShow = i + 1;
                    } else if (currentPage <= 3) {
                      pageToShow = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageToShow = totalPages - 4 + i;
                    } else {
                      pageToShow = currentPage - 2 + i;
                    }
                    
                    return (
                      <button
                        key={pageToShow}
                        onClick={() => setCurrentPage(pageToShow)}
                        disabled={loading}
                        className={`flex items-center justify-center w-8 h-8 rounded-full ${
                          currentPage === pageToShow 
                            ? 'bg-blue-500 text-white' 
                            : 'hover:bg-slate-100 dark:hover:bg-slate-700'
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        {pageToShow}
                      </button>
                    );
                  })}
                  
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages || loading}
                    className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
        
        {/* Footer */}
        <div className="flex justify-end pt-4 border-t dark:border-slate-700">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium bg-white border rounded-lg text-slate-700 border-slate-300 hover:bg-slate-50 dark:text-slate-300 dark:bg-slate-800 dark:border-slate-600 dark:hover:bg-slate-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
