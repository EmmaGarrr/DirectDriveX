/**
 * DirectDriveX Label Component
 * Part of the new design system with ds- prefix
 * 
 * Label component for form inputs and accessibility
 * Following the design system rules and accessibility guidelines
 */

import React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import type { LabelProps } from '@/lib/design-system-types'

// Label variants using CVA for type-safe variant handling
const labelVariants = cva(
  'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
  {
    variants: {
      required: {
        true: 'after:content-[\'*\'] after:ml-0.5 after:text-destructive',
        false: '',
      },
      optional: {
        true: 'after:content-[\'(optional)\'] after:ml-1 after:text-muted-foreground',
        false: '',
      },
    },
    defaultVariants: {
      required: false,
      optional: false,
    },
  }
)

/**
 * Label Component
 * 
 * Accessible label component for form inputs
 * 
 * @example
 * ```tsx
 * <Label htmlFor="email">Email Address</Label>
 * <Label htmlFor="password" required>Password</Label>
 * <Label htmlFor="phone" optional>Phone Number</Label>
 * ```
 */
export const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ 
    className, 
    required = false,
    optional = false,
    disabled = false,
    htmlFor,
    children, 
    ...props 
  }, ref) => {
    return (
      <label
        ref={ref}
        htmlFor={htmlFor}
        className={cn(
          labelVariants({ required, optional }),
          disabled && 'cursor-not-allowed opacity-70',
          className
        )}
        {...props}
      >
        {children}
      </label>
    )
  }
)
Label.displayName = 'Label'

// Export types
export type { LabelProps }