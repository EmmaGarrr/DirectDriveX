"use client";

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { FileItem, IntegrityResult, MoveResult, BackupResult, RecoveryResult } from '@/types/file-browser';
import { CheckCircle, XCircle, AlertTriangle, Shield, ArrowRight, CloudUpload, RotateCcw } from 'lucide-react';

interface FileOperationModalProps {
  isOpen: boolean;
  onClose: () => void;
  file: FileItem | null;
  operation: 'integrity_check' | 'move' | 'backup' | 'recovery' | 'quarantine' | null;
  result?: IntegrityResult | MoveResult | BackupResult | RecoveryResult;
  onConfirm?: (params: any) => void;
}

export function FileOperationModal({ 
  isOpen, 
  onClose, 
  file, 
  operation, 
  result, 
  onConfirm 
}: FileOperationModalProps) {
  const [reason, setReason] = useState('');
  const [targetLocation, setTargetLocation] = useState('');
  const [quarantineReason, setQuarantineReason] = useState('');

  if (!file || !operation) return null;

  const handleConfirm = () => {
    if (operation === 'move' && !targetLocation) {
      alert('Please enter a target location');
      return;
    }
    if (operation === 'quarantine' && !quarantineReason) {
      alert('Reason is required for quarantine');
      return;
    }

    const params = {
      reason: reason || undefined,
      targetLocation: targetLocation || undefined,
      quarantineReason: quarantineReason || undefined,
    };

    onConfirm?.(params);
    onClose();
  };

  const renderIntegrityResult = (result: IntegrityResult) => (
    <div className="space-y-4">
      <div className="flex items-center gap-3 p-4 border rounded-lg">
        {result.status === 'verified' && <CheckCircle className="w-6 h-6 text-emerald-600" />}
        {result.status === 'corrupted' && <XCircle className="w-6 h-6 text-red-600" />}
        {result.status === 'inaccessible' && <AlertTriangle className="w-6 h-6 text-amber-600" />}
        <div>
          <h3 className="font-semibold">Integrity Check Result</h3>
          <Badge variant={result.status === 'verified' ? 'default' : 'destructive'}>
            {result.status.toUpperCase()}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <Label className="text-slate-600">Checksum Match</Label>
          <p className="font-medium">{result.checksum_match ? 'Yes' : 'No'}</p>
        </div>
        <div>
          <Label className="text-slate-600">Last Check</Label>
          <p className="font-medium">
            {result.last_check ? new Date(result.last_check).toLocaleString() : 'N/A'}
          </p>
        </div>
        {result.corruption_detected && (
          <div className="col-span-2">
            <Label className="text-slate-600">Corruption Type</Label>
            <p className="font-medium">{result.corruption_type || 'Unknown'}</p>
          </div>
        )}
        {result.error && (
          <div className="col-span-2">
            <Label className="text-slate-600">Error</Label>
            <p className="font-medium text-red-600">{result.error}</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderMoveDialog = () => (
    <div className="space-y-4">
      <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20">
        <div className="flex items-center gap-2">
          <ArrowRight className="w-5 h-5 text-blue-600" />
          <span className="font-medium">Move File to Different Storage</span>
        </div>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          Move "{file.filename}" to a different Google Drive account
        </p>
      </div>

      <div className="space-y-3">
        <div>
          <Label htmlFor="target-location">Target Google Drive Account ID</Label>
          <Input
            id="target-location"
            placeholder="e.g., account_1, account_2, account_3"
            value={targetLocation}
            onChange={(e) => setTargetLocation(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="move-reason">Reason (Optional)</Label>
          <Textarea
            id="move-reason"
            placeholder="Reason for moving this file..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
          />
        </div>
      </div>
    </div>
  );

  const renderBackupDialog = () => (
    <div className="space-y-4">
      <div className="p-4 rounded-lg bg-emerald-50 dark:bg-emerald-900/20">
        <div className="flex items-center gap-2">
          <CloudUpload className="w-5 h-5 text-emerald-600" />
          <span className="font-medium">Force Backup to Hetzner Storage</span>
        </div>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          Create a backup of "{file.filename}" in Hetzner storage
        </p>
      </div>

      <div>
        <Label htmlFor="backup-reason">Reason (Optional)</Label>
        <Textarea
          id="backup-reason"
          placeholder="Reason for forcing backup..."
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={3}
        />
      </div>
    </div>
  );

  const renderRecoveryDialog = () => (
    <div className="space-y-4">
      <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-900/20">
        <div className="flex items-center gap-2">
          <RotateCcw className="w-5 h-5 text-amber-600" />
          <span className="font-medium">Recover File from Backup</span>
        </div>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          Restore "{file.filename}" from the most recent backup
        </p>
      </div>

      <div>
        <Label htmlFor="recovery-reason">Reason (Optional)</Label>
        <Textarea
          id="recovery-reason"
          placeholder="Reason for file recovery..."
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={3}
        />
      </div>
    </div>
  );

  const renderQuarantineDialog = () => (
    <div className="space-y-4">
      <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-red-600" />
          <span className="font-medium">Quarantine File</span>
        </div>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          Mark "{file.filename}" as suspicious and prevent access
        </p>
      </div>

      <div>
        <Label htmlFor="quarantine-reason">Reason (Required)</Label>
        <Textarea
          id="quarantine-reason"
          placeholder="Reason for quarantining this file..."
          value={quarantineReason}
          onChange={(e) => setQuarantineReason(e.target.value)}
          rows={3}
          required
        />
      </div>
    </div>
  );

  const getTitle = () => {
    switch (operation) {
      case 'integrity_check': return 'File Integrity Check';
      case 'move': return 'Move File';
      case 'backup': return 'Force Backup';
      case 'recovery': return 'Recover File';
      case 'quarantine': return 'Quarantine File';
      default: return 'File Operation';
    }
  };

  const getContent = () => {
    if (operation === 'integrity_check' && result) {
      return renderIntegrityResult(result as IntegrityResult);
    }
    if (operation === 'move') {
      return renderMoveDialog();
    }
    if (operation === 'backup') {
      return renderBackupDialog();
    }
    if (operation === 'recovery') {
      return renderRecoveryDialog();
    }
    if (operation === 'quarantine') {
      return renderQuarantineDialog();
    }
    return null;
  };

  const isConfirmDisabled = () => {
    if (operation === 'move' && !targetLocation) return true;
    if (operation === 'quarantine' && !quarantineReason) return true;
    return false;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{getTitle()}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* File Info */}
          <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-lg dark:bg-blue-900">
                <span className="font-semibold text-blue-600">
                  {file.filename.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <h3 className="font-medium">{file.filename}</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {file.size_formatted} • {file.file_type} • {file.owner_email}
                </p>
              </div>
            </div>
          </div>

          {/* Operation Content */}
          {getContent()}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          {operation !== 'integrity_check' && (
            <Button 
              onClick={handleConfirm}
              disabled={isConfirmDisabled()}
              variant={operation === 'quarantine' ? 'destructive' : 'default'}
            >
              {operation === 'move' && 'Move File'}
              {operation === 'backup' && 'Create Backup'}
              {operation === 'recovery' && 'Recover File'}
              {operation === 'quarantine' && 'Quarantine File'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
