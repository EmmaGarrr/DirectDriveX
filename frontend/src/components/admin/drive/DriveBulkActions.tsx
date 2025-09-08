"use client";

import { Trash2, CloudUpload, ArrowRight } from 'lucide-react';
import { useState } from 'react';

interface DriveBulkActionsProps {
  selectedCount: number;
  onClear: () => void;
  onExecute: (action: string, reason?: string, targetLocation?: string) => Promise<void>;
}

export function DriveBulkActions({ selectedCount, onClear, onExecute }: DriveBulkActionsProps) {
  const [action, setAction] = useState('');
  const [reason, setReason] = useState('');
  const [targetLocation, setTargetLocation] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);

  if (selectedCount === 0) return null;

  const handleExecute = async () => {
    if (!action) return;
    
    setIsExecuting(true);
    try {
      await onExecute(action, reason || undefined, targetLocation || undefined);
      setAction('');
      setReason('');
      setTargetLocation('');
    } finally {
      setIsExecuting(false);
    }
  };

  const handleCancel = () => {
    setAction('');
    setReason('');
    setTargetLocation('');
    onClear();
  };

  return (
    <div className="flex flex-col items-center justify-between gap-4 p-3 border sm:flex-row bg-blue-50 dark:bg-blue-900/20 rounded-xl border-blue-200 dark:border-blue-800">
      <div className="text-sm font-medium text-blue-800 dark:text-blue-200">
        <span className="px-2 py-1 mr-2 text-white bg-blue-600 rounded-md">{selectedCount}</span>
        {selectedCount === 1 ? 'file selected' : 'files selected'}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <select 
          value={action}
          onChange={(e) => setAction(e.target.value)}
          className="h-9 px-3 text-sm bg-white border rounded-lg dark:bg-slate-800 border-slate-300 dark:border-slate-600"
        >
          <option value="">Choose action...</option>
          <option value="delete">Delete</option>
          <option value="force_backup">Force Backup</option>
          <option value="move">Move</option>
        </select>
        
        {action === 'move' && (
          <input
            type="text"
            placeholder="Target account ID..."
            value={targetLocation}
            onChange={(e) => setTargetLocation(e.target.value)}
            className="h-9 px-3 text-sm bg-white border rounded-lg dark:bg-slate-800 border-slate-300 dark:border-slate-600"
          />
        )}
        
        <input
          type="text"
          placeholder="Reason (optional)"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          className="h-9 px-3 text-sm bg-white border rounded-lg dark:bg-slate-800 border-slate-300 dark:border-slate-600"
        />
        
        <button 
          onClick={handleExecute}
          disabled={!action || isExecuting}
          className="flex items-center gap-2 px-3 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isExecuting ? 'Executing...' : 'Execute'}
        </button>
        
        <button 
          onClick={handleCancel}
          className="px-3 py-2 text-sm bg-white border rounded-lg text-slate-700 dark:text-slate-200 dark:bg-slate-700 border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}