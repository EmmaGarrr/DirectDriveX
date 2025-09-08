"use client";

import { Search, X } from 'lucide-react';
import { useState } from 'react';

interface DriveFiltersProps {
  showFilters: boolean;
  filters: {
    search: string;
    fileType: string;
    owner: string;
    backupStatus: string;
    sizeMin: number | null;
    sizeMax: number | null;
  };
  onFiltersChange: (filters: any) => void;
  onSearch: () => void;
  onClearFilters: () => void;
}

export function DriveFilters({ showFilters, filters, onFiltersChange, onSearch, onClearFilters }: DriveFiltersProps) {
  const [localFilters, setLocalFilters] = useState(filters);

  const handleFilterChange = (key: string, value: any) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleSearch = () => {
    onFiltersChange(localFilters);
    onSearch();
  };

  const handleClearFilters = () => {
    const clearedFilters = {
      search: '',
      fileType: '',
      owner: '',
      backupStatus: '',
      sizeMin: null,
      sizeMax: null,
    };
    setLocalFilters(clearedFilters);
    onClearFilters();
  };

  if (!showFilters) return null;

  return (
    <div className="p-4 space-y-4 border bg-slate-100 dark:bg-slate-900/50 rounded-xl border-slate-200 dark:border-slate-700">
      <div className="relative">
        <Search className="absolute w-5 h-5 -translate-y-1/2 left-3 top-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Search drive files..."
          value={localFilters.search}
          onChange={(e) => handleFilterChange('search', e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          className="w-full pl-10 pr-4 bg-white border rounded-lg h-11 dark:bg-slate-800 border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={handleSearch}
          className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
        >
          Search
        </button>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <select 
          value={localFilters.fileType}
          onChange={(e) => handleFilterChange('fileType', e.target.value)}
          className="w-full h-11 px-3 bg-white border rounded-lg dark:bg-slate-800 border-slate-300 dark:border-slate-600"
        >
          <option value="">All Types</option>
          <option value="image">Images</option>
          <option value="video">Videos</option>
          <option value="audio">Audio</option>
          <option value="document">Documents</option>
          <option value="archive">Archives</option>
          <option value="other">Other</option>
        </select>
        <input
          type="text"
          placeholder="Owner email..."
          value={localFilters.owner}
          onChange={(e) => handleFilterChange('owner', e.target.value)}
          className="w-full h-11 px-3 bg-white border rounded-lg dark:bg-slate-800 border-slate-300 dark:border-slate-600"
        />
        <select 
          value={localFilters.backupStatus}
          onChange={(e) => handleFilterChange('backupStatus', e.target.value)}
          className="w-full h-11 px-3 bg-white border rounded-lg dark:bg-slate-800 border-slate-300 dark:border-slate-600"
        >
          <option value="">All Backup Status</option>
          <option value="none">Not Backed Up</option>
          <option value="in_progress">Transferring</option>
          <option value="completed">Backed Up</option>
          <option value="failed">Failed</option>
        </select>
        <input
          type="number"
          placeholder="Min Size (MB)"
          value={localFilters.sizeMin || ''}
          onChange={(e) => handleFilterChange('sizeMin', e.target.value ? Number(e.target.value) : null)}
          className="w-full h-11 px-3 bg-white border rounded-lg dark:bg-slate-800 border-slate-300 dark:border-slate-600"
        />
        <input
          type="number"
          placeholder="Max Size (MB)"
          value={localFilters.sizeMax || ''}
          onChange={(e) => handleFilterChange('sizeMax', e.target.value ? Number(e.target.value) : null)}
          className="w-full h-11 px-3 bg-white border rounded-lg dark:bg-slate-800 border-slate-300 dark:border-slate-600"
        />
      </div>
      <div className="flex justify-end">
        <button onClick={handleClearFilters} className="flex items-center gap-2 px-3 py-2 text-sm font-medium bg-white border rounded-lg text-slate-700 dark:text-slate-200 dark:bg-slate-700 border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600">
          <X className="w-4 h-4" /> Clear Filters
        </button>
      </div>
    </div>
  );
}