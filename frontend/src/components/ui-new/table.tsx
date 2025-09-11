/**
 * DirectDriveX Table Component
 * Part of the new design system with ds- prefix
 * 
 * Table components for displaying structured data
 * Following the design system rules and accessibility guidelines
 */

import React from 'react'
import { cn } from '@/lib/utils'

// Table Component
export interface TableProps {
  /** Additional CSS classes */
  className?: string
  /** Table content */
  children: React.ReactNode
}

/**
 * Table Component
 * 
 * Main table container
 * 
 * @example
 * ```tsx
 * <Table>
 *   <TableHeader>
 *     <TableRow>
 *       <TableHead>Name</TableHead>
 *       <TableHead>Email</TableHead>
 *     </TableRow>
 *   </TableHeader>
 *   <TableBody>
 *     <TableRow>
 *       <TableCell>John Doe</TableCell>
 *       <TableCell>john@example.com</TableCell>
 *     </TableRow>
 *   </TableBody>
 * </Table>
 * ```
 */
export const Table = React.forwardRef<
  HTMLTableElement,
  React.HTMLAttributes<HTMLTableElement> & TableProps
>(({ className, children, ...props }, ref) => (
  <div className="relative w-full overflow-auto">
    <table
      ref={ref}
      className={cn('w-full caption-bottom text-sm', className)}
      {...props}
    >
      {children}
    </table>
  </div>
))
Table.displayName = 'Table'

// Table Header Component
export interface TableHeaderProps {
  /** Additional CSS classes */
  className?: string
  /** Header content */
  children: React.ReactNode
}

/**
 * TableHeader Component
 * 
 * Table header section
 * 
 * @example
 * ```tsx
 * <TableHeader>
 *   <TableRow>
 *     <TableHead>Name</TableHead>
 *     <TableHead>Email</TableHead>
 *   </TableRow>
 * </TableHeader>
 * ```
 */
export const TableHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement> & TableHeaderProps
>(({ className, children, ...props }, ref) => (
  <thead ref={ref} className={cn('[&_tr]:border-b', className)} {...props}>
    {children}
  </thead>
))
TableHeader.displayName = 'TableHeader'

// Table Body Component
export interface TableBodyProps {
  /** Additional CSS classes */
  className?: string
  /** Body content */
  children: React.ReactNode
}

/**
 * TableBody Component
 * 
 * Table body section
 * 
 * @example
 * ```tsx
 * <TableBody>
 *   <TableRow>
 *     <TableCell>John Doe</TableCell>
 *     <TableCell>john@example.com</TableCell>
 *   </TableRow>
 * </TableBody>
 * ```
 */
export const TableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement> & TableBodyProps
>(({ className, children, ...props }, ref) => (
  <tbody
    ref={ref}
    className={cn('[&_tr:last-child]:border-0', className)}
    {...props}
  >
    {children}
  </tbody>
))
TableBody.displayName = 'TableBody'

// Table Footer Component
export interface TableFooterProps {
  /** Additional CSS classes */
  className?: string
  /** Footer content */
  children: React.ReactNode
}

/**
 * TableFooter Component
 * 
 * Table footer section
 * 
 * @example
 * ```tsx
 * <TableFooter>
 *   <TableRow>
 *     <TableCell colSpan={2}>Total: 10 items</TableCell>
 *   </TableRow>
 * </TableFooter>
 * ```
 */
export const TableFooter = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement> & TableFooterProps
>(({ className, children, ...props }, ref) => (
  <tfoot
    ref={ref}
    className={cn(
      'border-t bg-muted/50 font-medium [&>tr]:last:border-b-0',
      className
    )}
    {...props}
  >
    {children}
  </tfoot>
))
TableFooter.displayName = 'TableFooter'

// Table Row Component
export interface TableRowProps {
  /** Whether the row is selected */
  selected?: boolean
  /** Whether the row is highlighted */
  highlighted?: boolean
  /** Click handler */
  onClick?: () => void
  /** Additional CSS classes */
  className?: string
  /** Row content */
  children: React.ReactNode
}

/**
 * TableRow Component
 * 
 * Individual table row
 * 
 * @example
 * ```tsx
 * <TableRow selected onClick={() => handleRowClick()}>
 *   <TableCell>John Doe</TableCell>
 *   <TableCell>john@example.com</TableCell>
 * </TableRow>
 * ```
 */
export const TableRow = React.forwardRef<
  HTMLTableRowElement,
  React.HTMLAttributes<HTMLTableRowElement> & TableRowProps
>(({ 
  selected = false,
  highlighted = false,
  onClick,
  className,
  children,
  ...props 
}, ref) => (
  <tr
    ref={ref}
    className={cn(
      'border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted',
      selected && 'bg-muted',
      highlighted && 'bg-muted/30',
      onClick && 'cursor-pointer',
      className
    )}
    data-state={selected ? 'selected' : undefined}
    onClick={onClick}
    {...props}
  >
    {children}
  </tr>
))
TableRow.displayName = 'TableRow'

// Table Head Component
export interface TableHeadProps {
  /** Column span */
  colSpan?: number
  /** Row span */
  rowSpan?: number
  /** Text alignment */
  align?: 'left' | 'center' | 'right'
  /** Sort direction */
  sortDirection?: 'asc' | 'desc' | 'none'
  /** Sort handler */
  onSort?: () => void
  /** Additional CSS classes */
  className?: string
  /** Header content */
  children: React.ReactNode
}

/**
 * TableHead Component
 * 
 * Table header cell
 * 
 * @example
 * ```tsx
 * <TableHead sortDirection="asc" onSort={() => handleSort()}>
 *   Name
 * </TableHead>
 * ```
 */
export const TableHead = React.forwardRef<
  HTMLTableCellElement,
  React.ThHTMLAttributes<HTMLTableCellElement> & TableHeadProps
>(({ 
  colSpan,
  rowSpan,
  align = 'left',
  sortDirection = 'none',
  onSort,
  className,
  children,
  ...props 
}, ref) => {
  const alignClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right'
  }

  return (
    <th
      ref={ref}
      colSpan={colSpan}
      rowSpan={rowSpan}
      className={cn(
        'h-10 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0',
        alignClasses[align],
        onSort && 'cursor-pointer hover:text-foreground',
        className
      )}
      onClick={onSort}
      {...props}
    >
      <div className="flex items-center space-x-1">
        <span>{children}</span>
        {sortDirection !== 'none' && (
          <span className="text-xs">
            {sortDirection === 'asc' ? '↑' : '↓'}
          </span>
        )}
      </div>
    </th>
  )
})
TableHead.displayName = 'TableHead'

// Table Cell Component
export interface TableCellProps {
  /** Column span */
  colSpan?: number
  /** Row span */
  rowSpan?: number
  /** Text alignment */
  align?: 'left' | 'center' | 'right'
  /** Vertical alignment */
  valign?: 'top' | 'middle' | 'bottom'
  /** Whether the cell is a header cell */
  header?: boolean
  /** Additional CSS classes */
  className?: string
  /** Cell content */
  children: React.ReactNode
}

/**
 * TableCell Component
 * 
 * Table data cell
 * 
 * @example
 * ```tsx
 * <TableCell align="center">John Doe</TableCell>
 * ```
 */
export const TableCell = React.forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement> & TableCellProps
>(({ 
  colSpan,
  rowSpan,
  align = 'left',
  valign = 'middle',
  header = false,
  className,
  children,
  ...props 
}, ref) => {
  const alignClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right'
  }

  const valignClasses = {
    top: 'align-top',
    middle: 'align-middle',
    bottom: 'align-bottom'
  }

  const Cell = header ? 'th' : 'td'

  return (
    <Cell
      ref={ref}
      colSpan={colSpan}
      rowSpan={rowSpan}
      className={cn(
        'p-4 align-middle [&:has([role=checkbox])]:pr-0',
        alignClasses[align],
        valignClasses[valign],
        header && 'font-medium text-muted-foreground',
        className
      )}
      {...props}
    >
      {children}
    </Cell>
  )
})
TableCell.displayName = 'TableCell'

// Table Caption Component
export interface TableCaptionProps {
  /** Additional CSS classes */
  className?: string
  /** Caption content */
  children: React.ReactNode
}

/**
 * TableCaption Component
 * 
 * Table caption for accessibility
 * 
 * @example
 * ```tsx
 * <TableCaption>User data table</TableCaption>
 * ```
 */
export const TableCaption = React.forwardRef<
  HTMLTableCaptionElement,
  React.HTMLAttributes<HTMLTableCaptionElement> & TableCaptionProps
>(({ className, children, ...props }, ref) => (
  <caption
    ref={ref}
    className={cn('mt-4 text-sm text-muted-foreground', className)}
    {...props}
  >
    {children}
  </caption>
))
TableCaption.displayName = 'TableCaption'

// Table Checkbox Component
export interface TableCheckboxProps {
  /** Whether the checkbox is checked */
  checked?: boolean
  /** Default checked state */
  defaultChecked?: boolean
  /** Change handler */
  onCheckedChange?: (checked: boolean) => void
  /** Additional CSS classes */
  className?: string
}

/**
 * TableCheckbox Component
 * 
 * Checkbox component optimized for table rows
 * 
 * @example
 * ```tsx
 * <TableCheckbox 
 *   checked={isSelected}
 *   onCheckedChange={(checked) => setSelected(checked)}
 * />
 * ```
 */
export const TableCheckbox = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement> & TableCheckboxProps
>(({ 
  checked,
  defaultChecked,
  onCheckedChange,
  className,
  ...props 
}, ref) => (
  <input
    ref={ref}
    type="checkbox"
    checked={checked}
    defaultChecked={defaultChecked}
    onChange={(e) => onCheckedChange?.(e.target.checked)}
    className={cn(
      'h-4 w-4 rounded border border-primary ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
      className
    )}
    {...props}
  />
))
TableCheckbox.displayName = 'TableCheckbox'

// Table Empty State Component
export interface TableEmptyStateProps {
  /** Title for empty state */
  title?: string
  /** Description for empty state */
  description?: string
  /** Action button */
  action?: React.ReactNode
  /** Icon */
  icon?: React.ReactNode
  /** Additional CSS classes */
  className?: string
}

/**
 * TableEmptyState Component
 * 
 * Empty state component for tables
 * 
 * @example
 * ```tsx
 * <TableEmptyState 
 *   title="No data found"
 *   description="Try adjusting your filters or search terms"
 *   icon={<SearchIcon />}
 * />
 * ```
 */
export const TableEmptyState = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & TableEmptyStateProps
>(({ 
  title = 'No data found',
  description = 'There are no items to display',
  action,
  icon,
  className,
  ...props 
}, ref) => (
  <div
    ref={ref}
    className={cn(
      'flex flex-col items-center justify-center p-8 text-center',
      className
    )}
    {...props}
  >
    {icon && <div className="mb-4 text-muted-foreground">{icon}</div>}
    <h3 className="text-lg font-medium mb-2">{title}</h3>
    <p className="text-sm text-muted-foreground mb-4">{description}</p>
    {action}
  </div>
))
TableEmptyState.displayName = 'TableEmptyState'

// Table Loading State Component
export interface TableLoadingStateProps {
  /** Number of rows to show */
  rows?: number
  /** Additional CSS classes */
  className?: string
}

/**
 * TableLoadingState Component
 * 
 * Loading state component for tables
 * 
 * @example
 * ```tsx
 * <TableLoadingState rows={5} />
 * ```
 */
export const TableLoadingState = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & TableLoadingStateProps
>(({ 
  rows = 5,
  className,
  ...props 
}, ref) => (
  <div ref={ref} className={cn('space-y-2', className)} {...props}>
    {Array.from({ length: rows }).map((_, index) => (
      <div key={index} className="flex space-x-4 p-4">
        <div className="space-y-2 flex-1">
          <div className="h-4 bg-muted rounded w-3/4"></div>
          <div className="h-4 bg-muted rounded w-1/2"></div>
        </div>
        <div className="space-y-2 flex-1">
          <div className="h-4 bg-muted rounded w-full"></div>
          <div className="h-4 bg-muted rounded w-2/3"></div>
        </div>
        <div className="space-y-2 flex-1">
          <div className="h-4 bg-muted rounded w-4/5"></div>
          <div className="h-4 bg-muted rounded w-1/3"></div>
        </div>
      </div>
    ))}
  </div>
))
TableLoadingState.displayName = 'TableLoadingState'

// Export types
export type { 
  TableProps, 
  TableHeaderProps, 
  TableBodyProps, 
  TableFooterProps, 
  TableRowProps, 
  TableHeadProps, 
  TableCellProps, 
  TableCaptionProps, 
  TableCheckboxProps, 
  TableEmptyStateProps, 
  TableLoadingStateProps 
}