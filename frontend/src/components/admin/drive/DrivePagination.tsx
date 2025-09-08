"use client";

import { ChevronLeft, ChevronRight } from 'lucide-react';

interface DrivePaginationProps {
  currentPage: number;
  totalPages: number;
  totalFiles: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

export function DrivePagination({ currentPage, totalPages, totalFiles, pageSize, onPageChange }: DrivePaginationProps) {
  const startItem = ((currentPage - 1) * pageSize) + 1;
  const endItem = Math.min(currentPage * pageSize, totalFiles);

  // Generate page numbers to show (max 10 pages)
  const getPageNumbers = () => {
    const maxVisiblePages = 10;
    const pages: number[] = [];
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      const startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
      const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
      
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
    }
    
    return pages;
  };

  const pageNumbers = getPageNumbers();

  if (totalPages <= 1) return null;

  return (
    <div className="flex flex-col items-center justify-between w-full gap-4 px-4 py-3 sm:flex-row">
      <div className="text-sm text-slate-700 dark:text-slate-400">
        Showing {startItem.toLocaleString()} - {endItem.toLocaleString()} of {totalFiles.toLocaleString()} files
      </div>
      
      <nav className="flex items-center gap-1">
        <button 
          onClick={() => onPageChange(currentPage - 1)} 
          disabled={currentPage === 1}
          className="relative inline-flex items-center px-2 py-2 text-sm font-medium bg-white border rounded-md text-slate-500 border-slate-300 hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        
        <div className="flex items-center gap-1">
          {pageNumbers.map(page => (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`relative inline-flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                page === currentPage
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700'
              }`}
            >
              {page}
            </button>
          ))}
        </div>
        
        <button 
          onClick={() => onPageChange(currentPage + 1)} 
          disabled={currentPage === totalPages}
          className="relative inline-flex items-center px-2 py-2 text-sm font-medium bg-white border rounded-md text-slate-500 border-slate-300 hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </nav>
    </div>
  );
}