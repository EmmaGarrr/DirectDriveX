"use client";

import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";

interface FilePaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems: number;
  itemsPerPage: number;
}

export function FilePagination({ currentPage, totalPages, onPageChange, totalItems, itemsPerPage }: FilePaginationProps) {
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className="flex flex-col items-center justify-between w-full gap-4 px-4 py-3 sm:flex-row">
      <div className="text-sm text-slate-700 dark:text-slate-400">
        Showing <span className="font-medium">{startItem}</span> to <span className="font-medium">{endItem}</span> of <span className="font-medium">{totalItems}</span> files
      </div>
      <nav className="inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
        <button onClick={() => onPageChange(1)} disabled={currentPage === 1} className="relative inline-flex items-center px-2 py-2 text-sm font-medium bg-white border rounded-l-md text-slate-500 border-slate-300 hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700 disabled:opacity-50">
          <ChevronsLeft className="w-4 h-4" />
        </button>
        <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1} className="relative inline-flex items-center px-2 py-2 text-sm font-medium bg-white border text-slate-500 border-slate-300 hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700 disabled:opacity-50">
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="relative inline-flex items-center px-4 py-2 text-sm font-medium bg-white border text-slate-700 border-slate-300 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-200">
          Page {currentPage} of {totalPages}
        </span>
        <button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages} className="relative inline-flex items-center px-2 py-2 text-sm font-medium bg-white border text-slate-500 border-slate-300 hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700 disabled:opacity-50">
          <ChevronRight className="w-4 h-4" />
        </button>
        <button onClick={() => onPageChange(totalPages)} disabled={currentPage === totalPages} className="relative inline-flex items-center px-2 py-2 text-sm font-medium bg-white border rounded-r-md text-slate-500 border-slate-300 hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700 disabled:opacity-50">
          <ChevronsRight className="w-4 h-4" />
        </button>
      </nav>
    </div>
  );
}