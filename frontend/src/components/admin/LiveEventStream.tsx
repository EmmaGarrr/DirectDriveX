"use client";

import { RefreshCw, Rss, Trash2 } from "lucide-react";

interface LiveEventStreamProps {
  events: string[];
  isConnected: boolean;
  onClear: () => void;
  onRefresh: () => void;
  isLoading: boolean;
}

export function LiveEventStream({ events, isConnected, onClear, onRefresh, isLoading }: LiveEventStreamProps) {
  return (
    <div className="p-6 bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl border border-slate-400/20 dark:border-slate-400/10 rounded-2xl shadow-lg shadow-slate-900/5 dark:shadow-black/10">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50 flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
          Live Event Stream
        </h3>
        <div className="flex gap-2">
          <button onClick={onRefresh} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700" disabled={isLoading}>
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <button onClick={onClear} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
      <div className="max-h-60 overflow-y-auto space-y-2 pr-2">
        {events.map((event, index) => (
          <div key={index} className="text-sm flex items-start gap-3 p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700/30">
            <span className="font-mono text-xs text-slate-500 dark:text-slate-400 mt-0.5 whitespace-nowrap">
              {new Date(Date.now() - index * 1000).toLocaleTimeString()}
            </span>
            <p className="text-slate-700 dark:text-slate-200">{event}</p>
          </div>
        ))}
      </div>
    </div>
  );
}