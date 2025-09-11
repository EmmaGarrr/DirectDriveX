/**
 * DirectDriveX Textarea Component
 * Part of the new design system with ds- prefix
 * 
 * Textarea component for multi-line text input
 * Following the design system rules and accessibility guidelines
 */

import React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import type { TextareaProps } from '@/lib/design-system-types'

// Textarea variants using CVA for type-safe variant handling
const textareaVariants = cva(
  'flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      variant: {
        default: '',
        filled: 'bg-accent/50',
        outlined: 'border-2',
      },
      size: {
        sm: 'min-h-[40px] py-1 text-xs',
        default: 'min-h-[60px] py-2 text-sm',
        lg: 'min-h-[120px] py-3 text-base',
      },
      error: {
        true: 'border-destructive focus-visible:ring-destructive',
        false: '',
      },
      resize: {
        true: 'resize-y',
        false: 'resize-none',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
      error: false,
      resize: true,
    },
  }
)

/**
 * Textarea Component
 * 
 * Multi-line text input with validation states and sizing options
 * 
 * @example
 * ```tsx
 * <Textarea placeholder="Enter your message..." />
 * <Textarea variant="filled" placeholder="Filled textarea" />
 * <Textarea error placeholder="Textarea with error" />
 * <Textarea size="lg" placeholder="Large textarea" />
 * ```
 */
export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ 
    className, 
    variant = 'default',
    size = 'default',
    error = false,
    disabled = false,
    readOnly = false,
    required = false,
    placeholder,
    value,
    onChange,
    maxLength,
    minRows,
    maxRows,
    resize = true,
    ...props 
  }, ref) => {
    // Calculate rows based on minRows and maxRows
    const rows = React.useMemo(() => {
      if (minRows && maxRows) {
        return Math.min(Math.max(minRows, 3), maxRows)
      }
      return minRows || 3
    }, [minRows, maxRows])

    // Character count
    const charCount = value?.length || 0
    const showCharCount = maxLength !== undefined

    return (
      <div className="space-y-2">
        <textarea
          ref={ref}
          value={value}
          onChange={onChange}
          disabled={disabled}
          readOnly={readOnly}
          required={required}
          placeholder={placeholder}
          maxLength={maxLength}
          rows={rows}
          className={cn(
            textareaVariants({ variant, size, error, resize }),
            className
          )}
          {...props}
        />
        {showCharCount && (
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{error ? 'Please fix the error' : ' '}</span>
            <span>
              {charCount}/{maxLength}
            </span>
          </div>
        )}
      </div>
    )
  }
)
Textarea.displayName = 'Textarea'

// Export types
export type { TextareaProps }