"use client";

import { useState, KeyboardEvent, useRef, useEffect } from "react";
import { Search, X, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { PaginationState } from "@/types/admin";

interface UserFiltersProps {
  filters: { search: string; role: string; status: string };
  setFilters: (filters: any) => void;
  pagination?: PaginationState;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  onClearFilters?: () => void;
  loading?: boolean;
}

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  loading?: boolean;
}

const pageSizeOptions = [10, 20, 50, 100];

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  onPageSizeChange,
  loading = false
}) => {
  // Calculate range of items being displayed
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);
  
  // Generate visible page numbers
  const getPageNumbers = () => {
    // Always show current page, and at most 2 pages on either side
    const pageNumbers: number[] = [];
    const maxPagesToShow = 5;
    
    // Calculate range to display
    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = startPage + maxPagesToShow - 1;
    
    // Adjust if we're near the end
    if (endPage > totalPages) {
      endPage = totalPages;
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }
    
    // Generate page numbers
    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }
    
    return pageNumbers;
  };

  const pageNumbers = getPageNumbers();
  
  return (
    <div className="flex flex-col items-center justify-between w-full px-4 py-3 space-y-3 sm:flex-row sm:space-y-0">
      <div className="text-sm text-slate-700 dark:text-slate-400">
        {totalItems > 0 ? (
          <p>
            Showing <span className="font-medium">{startItem}</span> to{" "}
            <span className="font-medium">{endItem}</span> of{" "}
            <span className="font-medium">{totalItems}</span> users
          </p>
        ) : (
          <p>No users found</p>
        )}
      </div>
      
      <div className="inline-flex items-center space-x-2">
        <span className="text-sm text-slate-700 dark:text-slate-400">Rows per page:</span>
        <select
          value={itemsPerPage}
          onChange={(e) => onPageSizeChange(Number(e.target.value))}
          disabled={loading}
          className="px-2 py-1 text-sm bg-white border rounded-md dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300"
        >
          {pageSizeOptions.map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>
        
        <nav className="inline-flex -space-x-px" aria-label="Pagination">
          <button
            onClick={() => onPageChange(1)}
            disabled={currentPage === 1 || loading}
            className="px-2 py-2 text-sm font-medium bg-white border text-slate-700 rounded-l-md dark:bg-slate-800 dark:text-slate-400 border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="sr-only">First</span>
            <ChevronsLeft className="w-4 h-4" />
          </button>
          
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1 || loading}
            className="px-2 py-2 text-sm font-medium bg-white border text-slate-700 dark:bg-slate-800 dark:text-slate-400 border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="sr-only">Previous</span>
            <ChevronLeft className="w-4 h-4" />
          </button>
          
          {/* Page numbers */}
          {pageNumbers.map(number => (
            <button
              key={number}
              onClick={() => onPageChange(number)}
              disabled={loading}
              className={`px-3 py-2 text-sm font-medium ${
                currentPage === number 
                  ? 'z-10 bg-blue-50 border-blue-500 text-blue-600 dark:bg-blue-900/20 dark:border-blue-500 dark:text-blue-400' 
                  : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-400 dark:hover:bg-slate-700'
              } border`}
            >
              {number}
            </button>
          ))}
          
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages || totalPages === 0 || loading}
            className="px-2 py-2 text-sm font-medium bg-white border text-slate-700 dark:bg-slate-800 dark:text-slate-400 border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="sr-only">Next</span>
            <ChevronRight className="w-4 h-4" />
          </button>
          
          <button
            onClick={() => onPageChange(totalPages)}
            disabled={currentPage === totalPages || totalPages === 0 || loading}
            className="px-2 py-2 text-sm font-medium bg-white border text-slate-700 rounded-r-md dark:bg-slate-800 dark:text-slate-400 border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="sr-only">Last</span>
            <ChevronsRight className="w-4 h-4" />
          </button>
        </nav>
      </div>
    </div>
  );
};

export function UserFilters({ 
  filters, 
  setFilters, 
  pagination, 
  onPageChange, 
  onPageSizeChange,
  onClearFilters,
  loading = false
}: UserFiltersProps) {
  const [localSearch, setLocalSearch] = useState(filters.search);
  const searchInputRef = useRef<HTMLInputElement>(null);
  
  // Handle input change for role and status
  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
  };

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalSearch(e.target.value);
  };
  
  // Apply search on Enter key press or when the user stops typing
  const handleSearchKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      setFilters({ ...filters, search: localSearch });
    }
  };
  
  // Handle search button click
  const handleSearchButtonClick = () => {
    setFilters({ ...filters, search: localSearch });
  };
  
  // Handle search clear
  const handleSearchClear = () => {
    setLocalSearch('');
    setFilters({ ...filters, search: '' });
    searchInputRef.current?.focus();
  };
  
  // Handle clear all filters
  const handleClearAllFilters = () => {
    setLocalSearch('');
    if (onClearFilters) {
      onClearFilters();
    }
  };
  
  // Sync local search when filters.search changes externally
  useEffect(() => {
    setLocalSearch(filters.search);
  }, [filters.search]);

  return (
    <div>
      <div className="p-4 border bg-slate-100 dark:bg-slate-900/50 rounded-xl border-slate-200 dark:border-slate-700">
        <div className="flex flex-col gap-4 md:flex-row md:items-end">
          <div className="flex-1 md:flex-grow">
            <label htmlFor="search" className="block mb-1 text-sm font-medium text-slate-700 dark:text-slate-300">
              Search Users
            </label>
            <div className="relative">
              <Search className="absolute w-5 h-5 -translate-y-1/2 left-3 top-1/2 text-slate-400" />
              <input
                ref={searchInputRef}
                type="text"
                id="search"
                name="search"
                value={localSearch}
                onChange={handleSearchChange}
                onKeyDown={handleSearchKeyDown}
                placeholder="Search by email..."
                disabled={loading}
                className="w-full pl-10 pr-10 bg-white border rounded-lg h-11 dark:bg-slate-800 border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-70"
              />
              {localSearch && (
                <button
                  type="button"
                  onClick={handleSearchClear}
                  className="absolute p-1 -translate-y-1/2 rounded-full right-3 top-1/2 hover:bg-slate-100 dark:hover:bg-slate-700"
                  aria-label="Clear search"
                >
                  <X className="w-4 h-4 text-slate-500" />
                </button>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="role" className="block mb-1 text-sm font-medium text-slate-700 dark:text-slate-300">
                Role
              </label>
              <select
                id="role"
                name="role"
                value={filters.role}
                onChange={handleSelectChange}
                disabled={loading}
                className="w-full px-3 bg-white border rounded-lg h-11 dark:bg-slate-800 border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-70"
              >
                <option value="all">All Roles</option>
                <option value="regular">Regular</option>
                <option value="admin">Admin</option>
                <option value="superadmin">Super Admin</option>
              </select>
            </div>
            <div>
              <label htmlFor="status" className="block mb-1 text-sm font-medium text-slate-700 dark:text-slate-300">
                Status
              </label>
              <select
                id="status"
                name="status"
                value={filters.status}
                onChange={handleSelectChange}
                disabled={loading}
                className="w-full px-3 bg-white border rounded-lg h-11 dark:bg-slate-800 border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-70"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
                <option value="banned">Banned</option>
              </select>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSearchButtonClick}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg h-11 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-70"
            >
              Apply Filters
            </button>
            <button
              type="button"
              onClick={handleClearAllFilters}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium bg-white border rounded-lg h-11 text-slate-700 dark:text-slate-200 dark:bg-slate-700 border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-500 disabled:opacity-70"
            >
              Clear
            </button>
          </div>
        </div>
      </div>
      
      {/* Pagination */}
      {pagination && onPageChange && onPageSizeChange && (
        <Pagination
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          totalItems={pagination.totalItems}
          itemsPerPage={pagination.pageSize}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
          loading={loading}
        />
      )}
    </div>
  );
}