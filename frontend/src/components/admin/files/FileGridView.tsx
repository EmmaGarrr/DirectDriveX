"use client";

import { useState, useEffect } from "react";
import { FileItem } from "@/types/file-browser";
import { cn } from "@/lib/utils";
import { FileImage, FileVideo, FileText, FileArchive, FileAudio, FileQuestion, MoreVertical, Download, Edit, Trash2, Shield, CheckCircle, ArrowRight, CloudUpload, RotateCcw, Eye } from "lucide-react";
import { FaGoogleDrive } from "react-icons/fa";
import { FaServer } from "react-icons/fa6";

const fileTypeConfig = {
  image: { icon: FileImage, color: "text-blue-500", bgColor: "bg-blue-50 dark:bg-blue-900/20" },
  video: { icon: FileVideo, color: "text-purple-500", bgColor: "bg-purple-50 dark:bg-purple-900/20" },
  document: { icon: FileText, color: "text-orange-500", bgColor: "bg-orange-50 dark:bg-orange-900/20" },
  archive: { icon: FileArchive, color: "text-pink-500", bgColor: "bg-pink-50 dark:bg-pink-900/20" },
  audio: { icon: FileAudio, color: "text-green-500", bgColor: "bg-green-50 dark:bg-green-900/20" },
  other: { icon: FileQuestion, color: "text-slate-500", bgColor: "bg-slate-100 dark:bg-slate-700" },
};

const formatBytes = (bytes: number) => {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};

interface FileGridViewProps {
  files: FileItem[];
  selectedFileIds: Set<string>;
  setSelectedFileIds: React.Dispatch<React.SetStateAction<Set<string>>>;
  onFileOperation?: (operation: string, file: FileItem, params?: any) => void;
}

export function FileGridView({ files, selectedFileIds, setSelectedFileIds, onFileOperation }: FileGridViewProps) {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

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
    console.log('FileGridView: File operation triggered:', { operation, fileId: file._id, fileName: file.filename });
    onFileOperation?.(operation, file);
    setActiveDropdown(null);
  };

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
      {files.map(file => {
        const { icon: Icon, color, bgColor } = fileTypeConfig[file.file_type];
        const isSelected = selectedFileIds.has(file._id);
        return (
          <div key={file._id} className={cn("relative group border rounded-xl transition-all duration-200", isSelected ? "border-blue-500 ring-2 ring-blue-500" : "border-slate-200 dark:border-slate-700 hover:shadow-lg hover:-translate-y-1")}>
            <div className="absolute z-10 top-2 left-2">
              <input type="checkbox" checked={isSelected} onChange={() => handleSelectOne(file._id)} className="w-4 h-4 text-blue-600 rounded" />
            </div>
            <div className="absolute z-10 top-2 right-2">
              <div className="relative">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveDropdown(activeDropdown === file._id ? null : file._id);
                  }}
                  className="p-1.5 rounded-full bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>
                {activeDropdown === file._id && (
                  <div className="absolute right-0 z-20 w-56 mt-1 bg-white border rounded-md shadow-lg dark:bg-slate-900 border-slate-200 dark:border-slate-700">
                    <div className="py-1">
                      {/* Primary Actions */}
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleFileOperation('download', file);
                        }}
                        className="flex items-center w-full gap-2 px-3 py-1.5 text-sm text-left rounded hover:bg-slate-100 dark:hover:bg-slate-800"
                      >
                        <Download className="w-4 h-4" /> Download
                      </button>
                      {file.preview_available && (
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleFileOperation('preview', file);
                          }}
                          className="flex items-center w-full gap-2 px-3 py-1.5 text-sm text-left rounded hover:bg-slate-100 dark:hover:bg-slate-800"
                        >
                          <Eye className="w-4 h-4" /> Preview
                        </button>
                      )}
                      
                      {/* Separator */}
                      <hr className="my-1 border-slate-200 dark:border-slate-700" />
                      
                      {/* File Operations */}
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleFileOperation('integrity_check', file);
                        }}
                        className="flex items-center w-full gap-2 px-3 py-1.5 text-sm text-left rounded hover:bg-slate-100 dark:hover:bg-slate-800"
                      >
                        <CheckCircle className="w-4 h-4" /> Check Integrity
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleFileOperation('move', file);
                        }}
                        className="flex items-center w-full gap-2 px-3 py-1.5 text-sm text-left rounded hover:bg-slate-100 dark:hover:bg-slate-800"
                      >
                        <ArrowRight className="w-4 h-4" /> Move File
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleFileOperation('force_backup', file);
                        }}
                        className="flex items-center w-full gap-2 px-3 py-1.5 text-sm text-left rounded hover:bg-slate-100 dark:hover:bg-slate-800"
                      >
                        <CloudUpload className="w-4 h-4" /> Force Backup
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleFileOperation('recover', file);
                        }}
                        className="flex items-center w-full gap-2 px-3 py-1.5 text-sm text-left rounded hover:bg-slate-100 dark:hover:bg-slate-800"
                      >
                        <RotateCcw className="w-4 h-4" /> Recover File
                      </button>
                      
                      {/* Separator */}
                      <hr className="my-1 border-slate-200 dark:border-slate-700" />
                      
                      {/* Admin Actions */}
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleFileOperation('quarantine', file);
                        }}
                        className="flex items-center w-full gap-2 px-3 py-1.5 text-sm text-left rounded text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20"
                      >
                        <Shield className="w-4 h-4" /> Quarantine
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleFileOperation('delete', file);
                        }}
                        className="flex items-center w-full gap-2 px-3 py-1.5 text-sm text-left rounded text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        <Trash2 className="w-4 h-4" /> Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className={cn("flex items-center justify-center h-32 rounded-t-xl", bgColor)}>
              <Icon className={cn("w-12 h-12", color)} />
            </div>
            <div className="p-3 bg-white dark:bg-slate-800 rounded-b-xl">
              <p className="text-sm font-medium truncate text-slate-900 dark:text-white" title={file.filename}>{file.filename}</p>
              <div className="flex items-center justify-between mt-1 text-xs text-slate-500 dark:text-slate-400">
                <span>{file.size_formatted}</span>
                {file.storage_location === 'gdrive' ? <FaGoogleDrive className="w-4 h-4 text-green-500" /> : <FaServer className="w-4 h-4 text-blue-500" />}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}