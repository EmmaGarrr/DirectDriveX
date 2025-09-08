"use client";

import { useState, useEffect } from 'react';
import { FileItem, SortConfig } from "@/types/file-browser";
import { cn } from "@/lib/utils";
import { 
  FileImage, FileVideo, FileText, FileArchive, FileAudio, FileQuestion, 
  MoreVertical, Download, Edit, Trash2, Shield, ArrowUp, ArrowDown, 
  Eye, ArrowRight, CloudUpload, RotateCcw, CheckCircle
} from "lucide-react";
import { FaGoogleDrive } from "react-icons/fa";
import { FaServer } from "react-icons/fa6";
import { FileOperationModal } from './modals/FileOperationModal';

const fileTypeConfig = {
  image: { icon: FileImage, color: "text-blue-500" },
  video: { icon: FileVideo, color: "text-purple-500" },
  document: { icon: FileText, color: "text-orange-500" },
  archive: { icon: FileArchive, color: "text-pink-500" },
  audio: { icon: FileAudio, color: "text-green-500" },
  other: { icon: FileQuestion, color: "text-slate-500" },
};

const statusConfig = {
  completed: { color: "bg-emerald-500" },
  pending: { color: "bg-amber-500" },
  uploading: { color: "bg-blue-500" },
  failed: { color: "bg-red-500" },
  deleted: { color: "bg-slate-500" },
  quarantined: { color: "bg-red-600" },
};

const formatBytes = (bytes: number) => {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};

const SortableHeader = ({ label, sortKey, sortConfig, onSortChange }: { 
  label: string, 
  sortKey: string, 
  sortConfig: SortConfig, 
  onSortChange: (key: string) => void 
}) => (
  <th scope="col" className="px-4 py-3 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-600" onClick={() => onSortChange(sortKey)}>
    <div className="flex items-center gap-1">
      {label}
      {sortConfig.key === sortKey && (
        sortConfig.direction === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
      )}
    </div>
  </th>
);

interface FileListViewProps {
  files: FileItem[];
  selectedFileIds: Set<string>;
  setSelectedFileIds: React.Dispatch<React.SetStateAction<Set<string>>>;
  sortConfig: SortConfig;
  onSortChange: (key: string) => void;
  onFileOperation?: (operation: string, file: FileItem, params?: any) => void;
}

export function FileListView({ 
  files, 
  selectedFileIds, 
  setSelectedFileIds, 
  sortConfig, 
  onSortChange,
  onFileOperation 
}: FileListViewProps) {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [operationModal, setOperationModal] = useState<{
    isOpen: boolean;
    file: FileItem | null;
    operation: string | null;
  }>({ isOpen: false, file: null, operation: null });

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setActiveDropdown(null);
    };

    if (activeDropdown) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [activeDropdown]);

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedFileIds(new Set(files.map(f => f._id)));
    } else {
      setSelectedFileIds(new Set());
    }
  };

  const handleSelectOne = (id: string) => {
    const newSelection = new Set(selectedFileIds);
    if (newSelection.has(id)) {
      newSelection.delete(id);
    } else {
      newSelection.add(id);
    }
    setSelectedFileIds(newSelection);
  };

  const handleFileOperation = (operation: string, file: FileItem) => {
    console.log('FileListView: File operation triggered:', { operation, fileId: file._id, fileName: file.filename });
    if (['move', 'backup', 'recovery', 'quarantine'].includes(operation)) {
      console.log('FileListView: Opening modal for operation:', operation);
      setOperationModal({ isOpen: true, file, operation });
    } else {
      console.log('FileListView: Calling onFileOperation directly for:', operation);
      onFileOperation?.(operation, file);
    }
    setActiveDropdown(null);
  };

  const handleOperationConfirm = (params: any) => {
    if (operationModal.file) {
      onFileOperation?.(operationModal.operation!, operationModal.file, params);
    }
  };

  return (
    <>
    <div className="overflow-hidden border shadow-lg bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl border-slate-400/20 dark:border-slate-400/10 rounded-2xl shadow-slate-900/5 dark:shadow-black/10">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-slate-500 dark:text-slate-400">
          <thead className="text-xs uppercase text-slate-700 bg-slate-50 dark:bg-slate-700 dark:text-slate-300">
            <tr>
                <th scope="col" className="p-4">
                  <input 
                    type="checkbox" 
                    onChange={handleSelectAll} 
                    checked={selectedFileIds.size === files.length && files.length > 0} 
                  />
                </th>
                <SortableHeader label="Filename" sortKey="filename" sortConfig={sortConfig} onSortChange={onSortChange} />
                <SortableHeader label="Size" sortKey="size_bytes" sortConfig={sortConfig} onSortChange={onSortChange} />
                <SortableHeader label="Type" sortKey="file_type" sortConfig={sortConfig} onSortChange={onSortChange} />
                <SortableHeader label="Owner" sortKey="owner_email" sortConfig={sortConfig} onSortChange={onSortChange} />
                <SortableHeader label="Upload Date" sortKey="upload_date" sortConfig={sortConfig} onSortChange={onSortChange} />
              <th scope="col" className="px-4 py-3">Status</th>
              <th scope="col" className="px-4 py-3">Storage</th>
              <th scope="col" className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {files.map(file => {
                const { icon: Icon, color } = fileTypeConfig[file.file_type];
                const isSelected = selectedFileIds.has(file._id);
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
                        onChange={() => handleSelectOne(file._id)} 
                      />
                    </td>
                  <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">
                    <div className="flex items-center gap-3">
                      <Icon className={cn("w-5 h-5", color)} />
                        <span className="max-w-xs truncate" title={file.filename}>
                          {file.filename}
                        </span>
                    </div>
                  </td>
                    <td className="px-4 py-3">{file.size_formatted}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 text-xs font-medium rounded bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200">
                        {file.file_type}
                      </span>
                    </td>
                    <td className="max-w-xs px-4 py-3 truncate" title={file.owner_email}>
                      {file.owner_email}
                    </td>
                    <td className="px-4 py-3">{new Date(file.upload_date).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                        <div className={cn("w-2 h-2 rounded-full", statusConfig[file.status]?.color || "bg-slate-500")} />
                        <span className="capitalize">{file.status}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                      {file.storage_location === 'gdrive' ? (
                        <FaGoogleDrive className="w-5 h-5 text-green-500" title="Google Drive" />
                      ) : (
                        <FaServer className="w-5 h-5 text-blue-500" title="Hetzner" />
                      )}
                  </td>
                  <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        {/* Primary Actions */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            console.log('FileListView: Download button clicked for file:', file._id, file.filename);
                            handleFileOperation('download', file);
                          }}
                          className="p-2 text-blue-600 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20"
                          title="Download"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        {file.preview_available && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              console.log('FileListView: Preview button clicked for file:', file._id, file.filename);
                              handleFileOperation('preview', file);
                            }}
                            className="p-2 text-green-600 rounded hover:bg-green-50 dark:hover:bg-green-900/20"
                            title="Preview"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        )}
                        
                        {/* Dropdown Menu */}
                        <div className="relative">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveDropdown(activeDropdown === file._id ? null : file._id);
                            }}
                            className="p-2 rounded hover:bg-slate-200 dark:hover:bg-slate-700"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>
                          
                          {activeDropdown === file._id && (
                            <div className="absolute right-0 z-20 w-48 mt-1 bg-white border rounded-md shadow-lg dark:bg-slate-900 border-slate-200 dark:border-slate-700">
                              <div className="py-1">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleFileOperation('integrity_check', file);
                                  }}
                                  className="flex items-center w-full gap-2 px-3 py-2 text-sm text-left hover:bg-slate-100 dark:hover:bg-slate-800"
                                >
                                  <CheckCircle className="w-4 h-4" />
                                  Check Integrity
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleFileOperation('move', file);
                                  }}
                                  className="flex items-center w-full gap-2 px-3 py-2 text-sm text-left hover:bg-slate-100 dark:hover:bg-slate-800"
                                >
                                  <ArrowRight className="w-4 h-4" />
                                  Move File
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleFileOperation('force_backup', file);
                                  }}
                                  className="flex items-center w-full gap-2 px-3 py-2 text-sm text-left hover:bg-slate-100 dark:hover:bg-slate-800"
                                >
                                  <CloudUpload className="w-4 h-4" />
                                  Force Backup
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleFileOperation('recover', file);
                                  }}
                                  className="flex items-center w-full gap-2 px-3 py-2 text-sm text-left hover:bg-slate-100 dark:hover:bg-slate-800"
                                >
                                  <RotateCcw className="w-4 h-4" />
                                  Recover File
                                </button>
                                <hr className="my-1 border-slate-200 dark:border-slate-700" />
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleFileOperation('quarantine', file);
                                  }}
                                  className="flex items-center w-full gap-2 px-3 py-2 text-sm text-left text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20"
                                >
                                  <Shield className="w-4 h-4" />
                                  Quarantine
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleFileOperation('delete', file);
                                  }}
                                  className="flex items-center w-full gap-2 px-3 py-2 text-sm text-left text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                                >
                                  <Trash2 className="w-4 h-4" />
                                  Delete
                                </button>
                              </div>
                            </div>
                          )}
                      </div>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>

      {/* Operation Modal */}
      <FileOperationModal
        isOpen={operationModal.isOpen}
        onClose={() => setOperationModal({ isOpen: false, file: null, operation: null })}
        file={operationModal.file}
        operation={operationModal.operation as any}
        onConfirm={handleOperationConfirm}
      />
    </>
  );
}