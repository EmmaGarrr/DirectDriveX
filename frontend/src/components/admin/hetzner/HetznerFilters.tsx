import { useState } from 'react';
import { Search, X, Server } from 'lucide-react';
import { HetznerFileFilters } from '@/types/hetzner';

interface HetznerFiltersProps {
  filters: HetznerFileFilters;
  onFiltersChange: (filters: Partial<HetznerFileFilters>) => void;
  onSearch: () => void;
  onSearchInput: (searchTerm: string) => void;
  onClearFilters: () => void;
}

export function HetznerFilters({ filters, onFiltersChange, onSearch, onSearchInput, onClearFilters }: HetznerFiltersProps) {
  const [localFilters, setLocalFilters] = useState(filters);

  const handleChange = (field: keyof HetznerFileFilters, value: any) => {
    const newFilters = { ...localFilters, [field]: value };
    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleSearch = () => {
    onSearch();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleClear = () => {
    setLocalFilters({
      search: '',
      fileType: '',
      owner: '',
      backupStatus: '',
      sizeMin: null,
      sizeMax: null,
    });
    onClearFilters();
  };

  return (
    <div className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl border border-slate-200/50 dark:border-slate-700/50 rounded-2xl shadow-lg p-6">
      <div className="space-y-6">
        {/* Search Bar */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-slate-400" />
          </div>
          <input
            type="text"
            placeholder="Search Hetzner backup files..."
            value={localFilters.search}
            onChange={(e) => {
              const value = e.target.value;
              setLocalFilters(prev => ({ ...prev, search: value }));
              onSearchInput(value);
            }}
            onKeyDown={handleKeyDown}
            className="block w-full pl-10 pr-3 py-3 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Filter Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* File Type Filter */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              File Type
            </label>
            <select
              value={localFilters.fileType}
              onChange={(e) => handleChange('fileType', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Types</option>
              <option value="image">Images</option>
              <option value="video">Videos</option>
              <option value="audio">Audio</option>
              <option value="document">Documents</option>
              <option value="archive">Archives</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Owner Filter */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Owner
            </label>
            <input
              type="text"
              placeholder="Owner email..."
              value={localFilters.owner}
              onChange={(e) => handleChange('owner', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Backup Status Filter */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Backup Status
            </label>
            <select
              value={localFilters.backupStatus}
              onChange={(e) => handleChange('backupStatus', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Status</option>
              <option value="completed">Completed</option>
              <option value="failed">Failed</option>
              <option value="in_progress">In Progress</option>
              <option value="not_backed_up">Not Backed Up</option>
            </select>
          </div>

          {/* Size Min Filter */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Min Size (MB)
            </label>
            <input
              type="number"
              placeholder="0"
              value={localFilters.sizeMin || ''}
              onChange={(e) => handleChange('sizeMin', e.target.value ? parseInt(e.target.value) : null)}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Size Max Filter */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Max Size (MB)
            </label>
            <input
              type="number"
              placeholder="∞"
              value={localFilters.sizeMax || ''}
              onChange={(e) => handleChange('sizeMax', e.target.value ? parseInt(e.target.value) : null)}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-700">
          <button
            onClick={handleClear}
            className="flex items-center space-x-2 px-4 py-2 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
          >
            <X className="w-4 h-4" />
            <span>Clear Filters</span>
          </button>
          
          <button
            onClick={handleSearch}
            className="flex items-center space-x-2 px-6 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <Server className="w-4 h-4" />
            <span>Search Files</span>
          </button>
        </div>
      </div>
    </div>
  );
}