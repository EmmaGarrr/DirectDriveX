"use client";

import { useState } from "react";
import { Search, X, List, LayoutGrid, SlidersHorizontal, Calendar } from "lucide-react";
import { FilterState } from "@/types/file-browser";
import { cn } from "@/lib/utils";

interface FileFiltersProps {
  filters: FilterState;
  onFilterChange: (newFilters: Partial<FilterState>) => void;
  viewMode: 'list' | 'grid';
  onViewModeChange: (mode: 'list' | 'grid') => void;
}

export function FileFilters({ filters, onFilterChange, viewMode, onViewModeChange }: FileFiltersProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'sizeMin' || name === 'sizeMax') {
      onFilterChange({ [name]: Number(value) });
    } else {
      onFilterChange({ [name]: value });
    }
  };

  const clearFilters = () => {
    onFilterChange({
      search: '', 
      type: 'all', 
      owner: '', 
      storage: 'all', 
      status: 'all',
      sizeMin: 0,
      sizeMax: 50 * 1024 * 1024 * 1024, // 50GB
    });
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  };

  return (
    <div className="p-4 space-y-4 border bg-slate-100 dark:bg-slate-900/50 rounded-xl border-slate-200 dark:border-slate-700">
      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <div className="relative flex-grow">
          <Search className="absolute w-5 h-5 -translate-y-1/2 left-3 top-1/2 text-slate-400" />
          <input
            type="text"
            name="search"
            value={filters.search}
            onChange={handleInputChange}
            placeholder="Search by file name or owner..."
            className="w-full pl-10 pr-4 bg-white border rounded-lg h-11 dark:bg-slate-800 border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowAdvanced(!showAdvanced)} className="flex items-center justify-center w-full gap-2 px-3 text-sm font-medium bg-white border rounded-lg h-11 text-slate-700 dark:text-slate-200 dark:bg-slate-700 border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600 md:w-auto">
            <SlidersHorizontal className="w-4 h-4" />
            <span className="md:hidden">Advanced Filters</span>
          </button>
          <div className="flex items-center p-1 bg-white border rounded-lg dark:bg-slate-800 border-slate-300 dark:border-slate-600">
            <button onClick={() => onViewModeChange('list')} className={cn("p-2 rounded-md", viewMode === 'list' && "bg-blue-600 text-white")}>
              <List className="w-4 h-4" />
            </button>
            <button onClick={() => onViewModeChange('grid')} className={cn("p-2 rounded-md", viewMode === 'grid' && "bg-blue-600 text-white")}>
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {showAdvanced && (
        <div className="space-y-4 pt-4 border-t border-slate-300 dark:border-slate-700">
          {/* Basic Filters Row */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <select name="type" value={filters.type} onChange={handleInputChange} className="w-full h-11 px-3 bg-white border rounded-lg dark:bg-slate-800 border-slate-300 dark:border-slate-600">
              <option value="all">All Types</option>
              <option value="image">Image</option>
              <option value="video">Video</option>
              <option value="document">Document</option>
              <option value="archive">Archive</option>
              <option value="audio">Audio</option>
              <option value="other">Other</option>
            </select>
            <select name="storage" value={filters.storage} onChange={handleInputChange} className="w-full h-11 px-3 bg-white border rounded-lg dark:bg-slate-800 border-slate-300 dark:border-slate-600">
              <option value="all">All Storage</option>
              <option value="gdrive">Google Drive</option>
              <option value="hetzner">Hetzner</option>
            </select>
            <select name="status" value={filters.status} onChange={handleInputChange} className="w-full h-11 px-3 bg-white border rounded-lg dark:bg-slate-800 border-slate-300 dark:border-slate-600">
              <option value="all">All Statuses</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="uploading">Uploading</option>
              <option value="failed">Failed</option>
              <option value="deleted">Deleted</option>
              <option value="quarantined">Quarantined</option>
            </select>
            <input type="text" name="owner" value={filters.owner} onChange={handleInputChange} placeholder="Filter by owner..." className="w-full h-11 px-3 bg-white border rounded-lg dark:bg-slate-800 border-slate-300 dark:border-slate-600" />
            <button onClick={clearFilters} className="flex items-center justify-center w-full gap-2 px-3 text-sm font-medium bg-white border rounded-lg h-11 text-slate-700 dark:text-slate-200 dark:bg-slate-700 border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600">
              <X className="w-4 h-4" /> Clear
            </button>
          </div>

          {/* Size Range Filters */}
          <div className="p-4 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <h4 className="mb-3 text-sm font-medium text-slate-700 dark:text-slate-300">File Size Range</h4>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block mb-1 text-xs text-slate-600 dark:text-slate-400">Minimum Size</label>
                <div className="flex items-center gap-2">
                  <input 
                    type="range" 
                    name="sizeMin" 
                    min="0" 
                    max={50 * 1024 * 1024 * 1024} 
                    step={1024 * 1024} 
                    value={filters.sizeMin} 
                    onChange={handleInputChange} 
                    className="flex-1"
                  />
                  <span className="text-xs text-slate-600 dark:text-slate-400 min-w-[60px]">
                    {formatSize(filters.sizeMin)}
                  </span>
                </div>
              </div>
              <div>
                <label className="block mb-1 text-xs text-slate-600 dark:text-slate-400">Maximum Size</label>
                <div className="flex items-center gap-2">
                  <input 
                    type="range" 
                    name="sizeMax" 
                    min="0" 
                    max={50 * 1024 * 1024 * 1024} 
                    step={1024 * 1024} 
                    value={filters.sizeMax} 
                    onChange={handleInputChange} 
                    className="flex-1"
                  />
                  <span className="text-xs text-slate-600 dark:text-slate-400 min-w-[60px]">
                    {formatSize(filters.sizeMax)}
                  </span>
                </div>
              </div>
            </div>
            <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
              Range: {formatSize(filters.sizeMin)} - {formatSize(filters.sizeMax)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}