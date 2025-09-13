/**
 * DirectDriveX Pagination Component
 * Part of the new design system with ds- prefix
 * 
 * Pagination component for navigating through pages
 * Following the design system rules and accessibility guidelines
 */

import React from 'react'
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react'
import { cn } from '@/lib/utils'

// Pagination Item Component
export interface PaginationItemProps {
  /** Item content */
  children: React.ReactNode
  /** Whether the item is active */
  isActive?: boolean
  /** Whether the item is disabled */
  disabled?: boolean
  /** Click handler */
  onClick?: () => void
  /** Additional CSS classes */
  className?: string
}

/**
 * PaginationItem Component
 * 
 * Individual pagination item (page number)
 * 
 * @example
 * ```tsx
 * <PaginationItem isActive>1</PaginationItem>
 * <PaginationItem onClick={() => goToPage(2)}>2</PaginationItem>
 * ```
 */
export const PaginationItem = React.forwardRef<
  HTMLButtonElement,
  PaginationItemProps
>(({ 
  children, 
  isActive = false, 
  disabled = false,
  onClick,
  className,
  ...props 
}, ref) => (
  <button
    ref={ref}
    onClick={onClick}
    disabled={disabled}
    className={cn(
      'h-9 w-9 rounded-md text-sm font-medium transition-colors',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
      isActive
        ? 'bg-primary text-primary-foreground'
        : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
      disabled && 'pointer-events-none opacity-50',
      className
    )}
    aria-current={isActive ? 'page' : undefined}
    {...props}
  >
    {children}
  </button>
))
PaginationItem.displayName = 'PaginationItem'

// Pagination Ellipsis Component
export interface PaginationEllipsisProps {
  /** Additional CSS classes */
  className?: string
}

/**
 * PaginationEllipsis Component
 * 
 * Ellipsis indicator for skipped pages
 * 
 * @example
 * ```tsx
 * <PaginationEllipsis />
 * ```
 */
export const PaginationEllipsis = React.forwardRef<
  HTMLSpanElement,
  PaginationEllipsisProps
>(({ className, ...props }, ref) => (
  <span
    ref={ref}
    className={cn('flex h-9 w-9 items-center justify-center text-muted-foreground', className)}
    {...props}
  >
    <MoreHorizontal className="h-4 w-4" />
    <span className="sr-only">More pages</span>
  </span>
))
PaginationEllipsis.displayName = 'PaginationEllipsis'

// Pagination Previous Component
export interface PaginationPreviousProps {
  /** Whether the button is disabled */
  disabled?: boolean
  /** Click handler */
  onClick?: () => void
  /** Additional CSS classes */
  className?: string
}

/**
 * PaginationPrevious Component
 * 
 * Previous page button
 * 
 * @example
 * ```tsx
 * <PaginationPrevious onClick={() => goToPreviousPage()} />
 * ```
 */
export const PaginationPrevious = React.forwardRef<
  HTMLButtonElement,
  PaginationPreviousProps
>(({ 
  disabled = false,
  onClick,
  className,
  ...props 
}, ref) => (
  <button
    ref={ref}
    onClick={onClick}
    disabled={disabled}
    className={cn(
      'h-9 w-9 rounded-md text-sm font-medium transition-colors',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
      'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
      disabled && 'pointer-events-none opacity-50',
      className
    )}
    {...props}
  >
    <ChevronLeft className="h-4 w-4" />
    <span className="sr-only">Previous page</span>
  </button>
))
PaginationPrevious.displayName = 'PaginationPrevious'

// Pagination Next Component
export interface PaginationNextProps {
  /** Whether the button is disabled */
  disabled?: boolean
  /** Click handler */
  onClick?: () => void
  /** Additional CSS classes */
  className?: string
}

/**
 * PaginationNext Component
 * 
 * Next page button
 * 
 * @example
 * ```tsx
 * <PaginationNext onClick={() => goToNextPage()} />
 * ```
 */
export const PaginationNext = React.forwardRef<
  HTMLButtonElement,
  PaginationNextProps
>(({ 
  disabled = false,
  onClick,
  className,
  ...props 
}, ref) => (
  <button
    ref={ref}
    onClick={onClick}
    disabled={disabled}
    className={cn(
      'h-9 w-9 rounded-md text-sm font-medium transition-colors',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
      'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
      disabled && 'pointer-events-none opacity-50',
      className
    )}
    {...props}
  >
    <span className="sr-only">Next page</span>
    <ChevronRight className="h-4 w-4" />
  </button>
))
PaginationNext.displayName = 'PaginationNext'

// Pagination Content Component
export interface PaginationContentProps {
  /** Additional CSS classes */
  className?: string
  /** Pagination content */
  children: React.ReactNode
}

/**
 * PaginationContent Component
 * 
 * Container for pagination items
 * 
 * @example
 * ```tsx
 * <PaginationContent>
 *   <PaginationPrevious />
 *   <PaginationItem isActive>1</PaginationItem>
 *   <PaginationNext />
 * </PaginationContent>
 * ```
 */
export const PaginationContent = React.forwardRef<
  HTMLDivElement,
  PaginationContentProps
>(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex items-center space-x-1', className)}
    {...props}
  >
    {children}
  </div>
))
PaginationContent.displayName = 'PaginationContent'

// Main Pagination Component
export interface PaginationProps {
  /** Current page number */
  page: number
  /** Total number of pages */
  totalPages: number
  /** Page change handler */
  onPageChange: (page: number) => void
  /** Number of pages to show on each side */
  siblingCount?: number
  /** Whether to show ellipsis */
  showEllipsis?: boolean
  /** Additional CSS classes */
  className?: string
}

/**
 * Pagination Component
 * 
 * Main pagination component with automatic page range calculation
 * 
 * @example
 * ```tsx
 * <Pagination 
 *   page={currentPage}
 *   totalPages={10}
 *   onPageChange={(page) => setCurrentPage(page)}
 * />
 * ```
 */
export const Pagination = React.forwardRef<
  HTMLElement,
  PaginationProps
>(({ 
  page,
  totalPages,
  onPageChange,
  siblingCount = 1,
  showEllipsis = true,
  className,
  ...props 
}, ref) => {
  const generatePages = () => {
    const pages: (number | 'ellipsis')[] = []
    
    // Always show first page
    pages.push(1)
    
    // Calculate range around current page
    const startPage = Math.max(2, page - siblingCount)
    const endPage = Math.min(totalPages - 1, page + siblingCount)
    
    // Add ellipsis after first page if needed
    if (startPage > 2) {
      pages.push('ellipsis')
    }
    
    // Add pages in range
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i)
    }
    
    // Add ellipsis before last page if needed
    if (endPage < totalPages - 1) {
      pages.push('ellipsis')
    }
    
    // Always show last page if more than 1 page
    if (totalPages > 1) {
      pages.push(totalPages)
    }
    
    return pages
  }

  const pages = generatePages()

  return (
    <nav
      ref={ref}
      aria-label="Pagination"
      className={cn('flex items-center justify-center space-x-2', className)}
      {...props}
    >
      <PaginationContent>
        <PaginationPrevious 
          disabled={page === 1}
          onClick={() => onPageChange(page - 1)}
        />
        
        {pages.map((pageNum, index) => {
          if (pageNum === 'ellipsis') {
            return <PaginationEllipsis key={`ellipsis-${index}`} />
          }
          
          return (
            <PaginationItem
              key={pageNum}
              isActive={pageNum === page}
              onClick={() => onPageChange(pageNum)}
            >
              {pageNum}
            </PaginationItem>
          )
        })}
        
        <PaginationNext 
          disabled={page === totalPages}
          onClick={() => onPageChange(page + 1)}
        />
      </PaginationContent>
    </nav>
  )
})
Pagination.displayName = 'Pagination'

// Export types
export type { 
  PaginationProps, 
  PaginationItemProps, 
  PaginationEllipsisProps, 
  PaginationPreviousProps, 
  PaginationNextProps, 
  PaginationContentProps 
}