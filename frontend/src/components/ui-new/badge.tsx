/**
 * DirectDriveX Badge Component
 * Part of the new design system with ds- prefix
 * 
 * Badge components for displaying status indicators and tags
 * Following the design system rules and accessibility guidelines
 */

import React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { dcn } from '@/lib/design-system-new'
import type { BadgeProps } from '@/lib/design-system-types'

// Badge variants using CVA for type-safe variant handling
const badgeVariants = cva(
  'inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default:
          'border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/80',
        secondary:
          'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80',
        destructive:
          'border-transparent bg-destructive text-destructive-foreground shadow hover:bg-destructive/80',
        outline: 'text-foreground',
        success:
          'border-transparent bg-success text-success-foreground shadow hover:bg-success/80',
        warning:
          'border-transparent bg-warning text-warning-foreground shadow hover:bg-warning/80',
        info:
          'border-transparent bg-info text-info-foreground shadow hover:bg-info/80',
      },
      size: {
        sm: 'px-2 py-0.5 text-xs',
        default: 'px-2.5 py-0.5 text-xs',
        lg: 'px-3 py-1 text-sm',
        xl: 'px-4 py-1.5 text-sm',
      },
      rounded: {
        true: 'rounded-full',
        false: 'rounded-md',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
      rounded: true,
    },
  }
)

/**
 * Badge Component
 * 
 * Displays status indicators, tags, and small pieces of information
 * 
 * @example
 * ```tsx
 * <Badge variant="success">Completed</Badge>
 * <Badge variant="warning" size="sm">Pending</Badge>
 * <Badge variant="outline" rounded={false}>Beta</Badge>
 * ```
 */
export const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ 
    className, 
    variant = 'default', 
    size = 'default', 
    rounded = true,
    children, 
    ...props 
  }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(badgeVariants({ variant, size, rounded }), className)}
        {...props}
      >
        {children}
      </div>
    )
  }
)
Badge.displayName = 'Badge'

// Export types
export type { BadgeProps }