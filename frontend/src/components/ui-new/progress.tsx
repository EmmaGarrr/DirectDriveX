/**
 * DirectDriveX Progress Component
 * Part of the new design system with ds- prefix
 * 
 * Progress components for displaying loading states and completion indicators
 * Following the design system rules and accessibility guidelines
 */

import React from 'react'
import * as ProgressPrimitive from '@radix-ui/react-progress'
import { cn } from '@/lib/utils'
import { dcn } from '@/lib/design-system-new'

// Progress component types
export interface ProgressProps extends React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> {
  /** Current progress value (0-100) */
  value?: number
  /** Maximum progress value */
  max?: number
  /** Progress variant */
  variant?: 'default' | 'success' | 'warning' | 'destructive' | 'indeterminate'
  /** Progress size */
  size?: 'sm' | 'default' | 'lg'
  /** Whether to show percentage label */
  showLabel?: boolean
  /** Custom label text */
  label?: string
}

// Progress variants
const progressVariants = {
  default: 'bg-primary',
  success: 'bg-success',
  warning: 'bg-warning',
  destructive: 'bg-destructive',
  indeterminate: 'bg-primary animate-pulse',
}

// Progress sizes
const progressSizes = {
  sm: 'h-1',
  default: 'h-2',
  lg: 'h-3',
}

/**
 * Progress Component
 * 
 * Displays progress indicators for loading, completion, and status tracking
 * 
 * @example
 * ```tsx
 * <Progress value={75} />
 * <Progress variant="success" value={100} />
 * <Progress variant="indeterminate" />
 * <Progress value={50} showLabel />
 * ```
 */
export const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  ProgressProps
>(({ 
  className, 
  value = 0, 
  max = 100, 
  variant = 'default',
  size = 'default',
  showLabel = false,
  label,
  ...props 
}, ref) => {
  const percentage = Math.round((value / max) * 100)
  const displayLabel = label || `${percentage}%`
  const isIndeterminate = variant === 'indeterminate'

  return (
    <div className="space-y-2">
      {showLabel && (
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Progress</span>
          <span className="font-medium">{displayLabel}</span>
        </div>
      )}
      <ProgressPrimitive.Root
        ref={ref}
        className={cn(
          'relative w-full overflow-hidden rounded-full bg-secondary',
          progressSizes[size],
          className
        )}
        {...props}
      >
        <ProgressPrimitive.Indicator
          className={cn(
            'h-full w-full flex-1 transition-all duration-300 ease-out',
            progressVariants[variant]
          )}
          style={{
            transform: isIndeterminate ? 'translateX(-100%)' : `translateX(-${100 - percentage}%)`,
          }}
        />
      </ProgressPrimitive.Root>
    </div>
  )
})
Progress.displayName = ProgressPrimitive.Root.displayName

// Loading Spinner Component
export interface LoadingSpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Spinner size */
  size?: 'xs' | 'sm' | 'default' | 'lg' | 'xl'
  /** Spinner color */
  color?: 'primary' | 'success' | 'warning' | 'destructive' | 'info'
  /** Whether the spinner is visible */
  visible?: boolean
  /** Custom label text */
  label?: string
}

const spinnerSizes = {
  xs: 'h-3 w-3 border',
  sm: 'h-4 w-4 border-2',
  default: 'h-6 w-6 border-2',
  lg: 'h-8 w-8 border-2',
  xl: 'h-12 w-12 border-2',
}

const spinnerColors = {
  primary: 'border-primary border-t-transparent',
  success: 'border-success border-t-transparent',
  warning: 'border-warning border-t-transparent',
  destructive: 'border-destructive border-t-transparent',
  info: 'border-info border-t-transparent',
}

/**
 * LoadingSpinner Component
 * 
 * Animated spinner for loading states
 * 
 * @example
 * ```tsx
 * <LoadingSpinner />
 * <LoadingSpinner size="lg" color="primary" />
 * <LoadingSpinner label="Loading..." />
 * ```
 */
export const LoadingSpinner = React.forwardRef<HTMLDivElement, LoadingSpinnerProps>(
  ({ 
    className, 
    size = 'default', 
    color = 'primary',
    visible = true,
    label,
    ...props 
  }, ref) => {
    if (!visible) return null

    return (
      <div
        ref={ref}
        className={cn('flex items-center justify-center', className)}
        {...props}
      >
        <div
          className={cn(
            'animate-spin rounded-full',
            spinnerSizes[size],
            spinnerColors[color]
          )}
        />
        {label && (
          <span className="ml-2 text-sm text-muted-foreground">{label}</span>
        )}
      </div>
    )
  }
)
LoadingSpinner.displayName = 'LoadingSpinner'

// Skeleton Loading Component
export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Whether the skeleton is animated */
  animated?: boolean
  /** Number of lines to show */
  lines?: number
  /** Whether lines should have random widths */
  randomWidth?: boolean
}

/**
 * Skeleton Component
 * 
 * Loading placeholder for content
 * 
 * @example
 * ```tsx
 * <Skeleton className="h-4 w-[250px]" />
 * <Skeleton lines={3} randomWidth />
 * ```
 */
export const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  ({ 
    className, 
    animated = true,
    lines = 1,
    randomWidth = false,
    ...props 
  }, ref) => {
    const skeletonLines = Array.from({ length: lines }, (_, i) => {
      const widthClass = randomWidth 
        ? `w-[${Math.floor(Math.random() * 40) + 60}%]`
        : 'w-full'
      
      return (
        <div
          key={i}
          className={cn(
            'h-4 bg-muted rounded',
            animated && 'animate-pulse',
            widthClass,
            i > 0 && 'mt-2'
          )}
        />
      )
    })

    return (
      <div
        ref={ref}
        className={cn('space-y-2', className)}
        {...props}
      >
        {skeletonLines}
      </div>
    )
  }
)
Skeleton.displayName = 'Skeleton'

// Export types
export type { ProgressProps, LoadingSpinnerProps, SkeletonProps }