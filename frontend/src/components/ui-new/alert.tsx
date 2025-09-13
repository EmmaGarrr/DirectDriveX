/**
 * DirectDriveX Alert Component
 * Part of the new design system with ds- prefix
 * 
 * Alert components for displaying important messages to users
 * Following the design system rules and accessibility guidelines
 */

import React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { dcn } from '@/lib/design-system-new'
import type { AlertProps, AlertTitleProps, AlertDescriptionProps } from '@/lib/design-system-types'

// Alert variants using CVA for type-safe variant handling
const alertVariants = cva(
  'relative w-full rounded-lg border px-4 py-3 text-sm [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg~*]:pl-7',
  {
    variants: {
      variant: {
        default: 'bg-background text-foreground',
        destructive: 'border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive',
        warning: 'border-warning/50 text-warning dark:border-warning [&>svg]:text-warning',
        info: 'border-info/50 text-info dark:border-info [&>svg]:text-info',
        success: 'border-success/50 text-success dark:border-success [&>svg]:text-success',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

// Alert icons mapping
const alertIcons = {
  default: null,
  destructive: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="currentColor"
      className="h-4 w-4"
    >
      <path
        fillRule="evenodd"
        d="M8 15A7 7 0 118 1a7 7 0 010 14zm0 1A8 8 0 108 0a8 8 0 000 16z"
        clipRule="evenodd"
      />
      <path d="M5.52 5.52a.5.5 0 01.707 0L8 7.293l1.773-1.773a.5.5 0 11.707.707L8.707 8l1.773 1.773a.5.5 0 01-.707.707L8 8.707l-1.773 1.773a.5.5 0 01-.707-.707L7.293 8 5.52 6.227a.5.5 0 010-.707z" />
    </svg>
  ),
  warning: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="currentColor"
      className="h-4 w-4"
    >
      <path d="M8.982 1.566a1.13 1.13 0 00-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 01-1.1 0L7.1 5.995A.905.905 0 018 5zm.002 6a1 1 0 110 2 1 1 0 010-2z" />
    </svg>
  ),
  info: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="currentColor"
      className="h-4 w-4"
    >
      <path d="M8 15A7 7 0 118 1a7 7 0 010 14zm0 1A8 8 0 108 0a8 8 0 000 16z" />
      <path d="M8.93 6.588l-2.29.287-.082.38.45.083c.294.07.352.176.288.469l-.738 3.468c-.194.897.105 1.319.808 1.319.545 0 1.178-.252 1.465-.598l.088-.416c-.2.176-.492.246-.686.246-.275 0-.375-.193-.304-.533L8.93 6.588zM9 4.5a1 1 0 11-2 0 1 1 0 012 0z" />
    </svg>
  ),
  success: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="currentColor"
      className="h-4 w-4"
    >
      <path
        fillRule="evenodd"
        d="M8 16A8 8 0 108 0a8 8 0 000 16zm3.78-9.72a.75.75 0 00-1.06-1.06L6.75 9.19 5.28 7.72a.75.75 0 00-1.06 1.06l2 2a.75.75 0 001.06 0l4.5-4.5z"
        clipRule="evenodd"
      />
    </svg>
  ),
}

/**
 * Alert Component
 * 
 * Displays important messages to users with different severity levels
 * 
 * @example
 * ```tsx
 * <Alert variant="warning">
 *   <AlertTitle>Warning</AlertTitle>
 *   <AlertDescription>This action cannot be undone.</AlertDescription>
 * </Alert>
 * ```
 */
export const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ 
    className, 
    variant = 'default', 
    hasIcon = true,
    dismissible = false,
    onDismiss,
    children, 
    ...props 
  }, ref) => {
    const [isVisible, setIsVisible] = React.useState(true)

    const handleDismiss = () => {
      setIsVisible(false)
      onDismiss?.()
    }

    if (!isVisible) return null

    return (
      <div
        ref={ref}
        role="alert"
        className={cn(alertVariants({ variant }), className)}
        {...props}
      >
        {hasIcon && alertIcons[variant]}
        <div className="flex-1">
          {children}
        </div>
        {dismissible && (
          <button
            onClick={handleDismiss}
            className="ml-4 rounded-lg opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            aria-label="Dismiss alert"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="currentColor"
              className="h-4 w-4"
            >
              <path d="M4.646 4.646a.5.5 0 01.708 0L8 7.293l2.646-2.647a.5.5 0 01.708.708L8.707 8l2.647 2.646a.5.5 0 01-.708.708L8 8.707l-2.646 2.647a.5.5 0 01-.708-.708L7.293 8 4.646 5.354a.5.5 0 010-.708z" />
            </svg>
          </button>
        )}
      </div>
    )
  }
)
Alert.displayName = 'Alert'

/**
 * AlertTitle Component
 * 
 * Title text for alert messages
 * 
 * @example
 * ```tsx
 * <AlertTitle>Important Notice</AlertTitle>
 * ```
 */
export const AlertTitle = React.forwardRef<HTMLParagraphElement, AlertTitleProps>(
  ({ className, children, ...props }, ref) => (
    <h5
      ref={ref}
      className={cn('mb-1 font-medium leading-none tracking-tight', className)}
      {...props}
    >
      {children}
    </h5>
  )
)
AlertTitle.displayName = 'AlertTitle'

/**
 * AlertDescription Component
 * 
 * Detailed description text for alert messages
 * 
 * @example
 * ```tsx
 * <AlertDescription>
 *   This is a detailed description of the alert message.
 * </AlertDescription>
 * ```
 */
export const AlertDescription = React.forwardRef<HTMLParagraphElement, AlertDescriptionProps>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('text-sm [&_p]:leading-relaxed', className)}
      {...props}
    >
      {children}
    </div>
  )
)
AlertDescription.displayName = 'AlertDescription'

// Export types
export type { AlertProps, AlertTitleProps, AlertDescriptionProps }