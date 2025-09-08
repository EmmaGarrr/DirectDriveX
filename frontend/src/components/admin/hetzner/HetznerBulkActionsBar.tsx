import { useState } from 'react';
import { Download, RotateCcw, Trash2, X, Loader2 } from 'lucide-react';

interface HetznerBulkActionsBarProps {
  selectedCount: number;
  onExecute: (action: string, reason?: string) => void;
  onClear: () => void;
}

export function HetznerBulkActionsBar({ selectedCount, onExecute, onClear }: HetznerBulkActionsBarProps) {
  const [action, setAction] = useState('');
  const [reason, setReason] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);

  const handleExecute = async () => {
    if (!action) return;
    
    setIsExecuting(true);
    try {
      await onExecute(action, reason || undefined);
      setAction('');
      setReason('');
    } finally {
      setIsExecuting(false);
    }
  };

  if (selectedCount === 0) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-2xl shadow-lg p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 text-white">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
            <span className="font-medium">
              {selectedCount} file{selectedCount !== 1 ? 's' : ''} selected
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <select
            value={action}
            onChange={(e) => setAction(e.target.value)}
            className="px-3 py-2 bg-white/20 text-white rounded-lg border border-white/30 focus:outline-none focus:ring-2 focus:ring-white/50"
            disabled={isExecuting}
          >
            <option value="">Select Action</option>
            <option value="download">Download Selected</option>
            <option value="recover">Recover from Backup</option>
            <option value="delete">Delete from Backup</option>
          </select>

          {action === 'recover' || action === 'delete' ? (
            <input
              type="text"
              placeholder="Reason (optional)"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="px-3 py-2 bg-white/20 text-white placeholder-white/70 rounded-lg border border-white/30 focus:outline-none focus:ring-2 focus:ring-white/50 w-48"
              disabled={isExecuting}
            />
          ) : null}

          <button
            onClick={handleExecute}
            disabled={!action || isExecuting}
            className="flex items-center space-x-2 px-4 py-2 bg-white text-emerald-600 rounded-lg hover:bg-white/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {isExecuting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : action === 'download' ? (
              <Download className="w-4 h-4" />
            ) : action === 'recover' ? (
              <RotateCcw className="w-4 h-4" />
            ) : action === 'delete' ? (
              <Trash2 className="w-4 h-4" />
            ) : null}
            <span>
              {isExecuting ? 'Executing...' : 'Execute'}
            </span>
          </button>

          <button
            onClick={onClear}
            disabled={isExecuting}
            className="p-2 text-white hover:bg-white/20 rounded-lg transition-colors disabled:opacity-50"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}