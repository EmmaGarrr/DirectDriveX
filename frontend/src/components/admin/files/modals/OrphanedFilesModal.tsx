"use client";

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { OrphanedFile, OrphanedFilesResponse, CleanupResult } from '@/types/file-browser';
import { fileManagementService } from '@/services/admin/fileManagementService';
import { Trash2, AlertTriangle, FileX, Clock } from 'lucide-react';

interface OrphanedFilesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCleanupComplete?: (result: CleanupResult) => void;
}

export function OrphanedFilesModal({ isOpen, onClose, onCleanupComplete }: OrphanedFilesModalProps) {
  const [orphanedFiles, setOrphanedFiles] = useState<OrphanedFile[]>([]);
  const [totalFiles, setTotalFiles] = useState(0);
  const [loading, setLoading] = useState(false);
  const [cleanupLoading, setCleanupLoading] = useState(false);
  const [cleanupProgress, setCleanupProgress] = useState(0);
  const [cleanupType, setCleanupType] = useState<'soft' | 'hard'>('soft');
  const [daysOld, setDaysOld] = useState(7);
  const [cleanupResult, setCleanupResult] = useState<CleanupResult | null>(null);

  // Load orphaned files when modal opens
  useEffect(() => {
    if (isOpen) {
      loadOrphanedFiles();
    }
  }, [isOpen]);

  const loadOrphanedFiles = async () => {
    setLoading(true);
    try {
      const response = await fileManagementService.getOrphanedFiles(1, 50);
      setOrphanedFiles(response.orphaned_files);
      setTotalFiles(response.total);
    } catch (error) {
      console.error('Error loading orphaned files:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCleanup = async () => {
    setCleanupLoading(true);
    setCleanupProgress(0);
    
    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setCleanupProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const result = await fileManagementService.cleanupOrphanedFiles(cleanupType, daysOld);
      
      clearInterval(progressInterval);
      setCleanupProgress(100);
      setCleanupResult(result);
      
      // Refresh the orphaned files list
      await loadOrphanedFiles();
      
      onCleanupComplete?.(result);
    } catch (error) {
      console.error('Error during cleanup:', error);
    } finally {
      setCleanupLoading(false);
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  };

  const getOrphanReasonColor = (reason: string) => {
    if (reason.includes('deleted')) return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
    if (reason.includes('corrupted')) return 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200';
    if (reason.includes('missing')) return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
    return 'bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-200';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Trash2 className="w-5 h-5" />
            Orphaned Files Management
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col flex-1 space-y-4 overflow-hidden">
          {/* Summary Stats */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20">
              <div className="flex items-center gap-2">
                <FileX className="w-5 h-5 text-red-600" />
                <span className="font-medium">Total Orphaned</span>
              </div>
              <p className="text-2xl font-bold text-red-600">{totalFiles}</p>
            </div>
            <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-900/20">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
                <span className="font-medium">Showing</span>
              </div>
              <p className="text-2xl font-bold text-amber-600">{orphanedFiles.length}</p>
            </div>
            <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-600" />
                <span className="font-medium">Days Old</span>
              </div>
              <p className="text-2xl font-bold text-blue-600">{daysOld}</p>
            </div>
          </div>

          {/* Cleanup Configuration */}
          <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800">
            <h3 className="mb-3 font-medium">Cleanup Configuration</h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="cleanup-type">Cleanup Type</Label>
                <Select value={cleanupType} onValueChange={(value: 'soft' | 'hard') => setCleanupType(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="soft">Soft Delete (Mark as deleted)</SelectItem>
                    <SelectItem value="hard">Hard Delete (Remove from database)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="days-old">Files Older Than (Days)</Label>
                <Input
                  id="days-old"
                  type="number"
                  min="1"
                  value={daysOld}
                  onChange={(e) => setDaysOld(Number(e.target.value))}
                />
              </div>
            </div>
          </div>

          {/* Cleanup Progress */}
          {cleanupLoading && (
            <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-4 h-4 border-2 border-blue-600 rounded-full border-t-transparent animate-spin" />
                <span className="font-medium">Cleaning up orphaned files...</span>
              </div>
              <Progress value={cleanupProgress} className="w-full" />
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                {cleanupProgress}% complete
              </p>
            </div>
          )}

          {/* Cleanup Result */}
          {cleanupResult && (
            <div className="p-4 rounded-lg bg-emerald-50 dark:bg-emerald-900/20">
              <h3 className="mb-2 font-medium text-emerald-800 dark:text-emerald-200">
                Cleanup Completed Successfully
              </h3>
              <p className="text-sm text-emerald-700 dark:text-emerald-300">
                {cleanupResult.message}
              </p>
              <p className="mt-1 text-sm text-emerald-700 dark:text-emerald-300">
                Files affected: {cleanupResult.files_affected}
              </p>
            </div>
          )}

          {/* Orphaned Files List */}
          <div className="flex-1 overflow-hidden">
            <h3 className="mb-3 font-medium">Orphaned Files</h3>
            <div className="h-64 overflow-y-auto border rounded-lg">
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="w-8 h-8 mx-auto mb-2 border-2 border-blue-600 rounded-full border-t-transparent animate-spin" />
                    <p className="text-slate-600 dark:text-slate-400">Loading orphaned files...</p>
                  </div>
                </div>
              ) : orphanedFiles.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <FileX className="w-12 h-12 mx-auto mb-2 text-slate-400" />
                    <p className="text-slate-600 dark:text-slate-400">No orphaned files found</p>
                  </div>
                </div>
              ) : (
                <div className="divide-y">
                  {orphanedFiles.map((file) => (
                    <div key={file._id} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800">
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium truncate">{file.filename}</span>
                            <Badge className={getOrphanReasonColor(file.orphan_reason)}>
                              {file.orphan_reason}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
                            <span>{file.size_formatted}</span>
                            <span>{file.file_type}</span>
                            <span>{file.owner_email}</span>
                            <span>{new Date(file.upload_date).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button 
            onClick={handleCleanup}
            disabled={cleanupLoading || orphanedFiles.length === 0}
            variant="destructive"
          >
            {cleanupLoading ? 'Cleaning Up...' : 'Cleanup Orphaned Files'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
