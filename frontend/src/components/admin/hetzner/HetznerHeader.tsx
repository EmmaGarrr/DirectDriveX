import { Server, Filter, RefreshCw, Loader2 } from 'lucide-react';

interface HetznerHeaderProps {
  loading: boolean;
  showFilters: boolean;
  onToggleFilters: () => void;
  onRefresh: () => void;
}

export function HetznerHeader({ loading, showFilters, onToggleFilters, onRefresh }: HetznerHeaderProps) {
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-slate-700 to-slate-900 rounded-2xl shadow-xl">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.05%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20" />
      
      <div className="relative p-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-white/10 backdrop-blur-sm rounded-xl">
              <Server className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                Hetzner File Management
              </h1>
              <p className="text-slate-300 text-lg">
                Manage your Hetzner cloud storage backup files with advanced analytics and monitoring
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={onToggleFilters}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                showFilters
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm'
              }`}
            >
              <Filter className="w-4 h-4" />
              <span>Filters</span>
            </button>
            
            <button
              onClick={onRefresh}
              disabled={loading}
              className="flex items-center space-x-2 px-4 py-2 bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}