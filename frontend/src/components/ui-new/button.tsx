/**
 * DirectDriveX New Design System - Button Component
 * Phase 1: Foundation Setup
 * 
 * This component follows the design system rules and provides a type-safe,
 * accessible, and responsive button implementation with ds- prefix.
 */

import React from 'react'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { 
  getButtonClasses, 
  getAriaAttributes, 
  getFocusClasses,
  type ButtonProps,
  type ButtonVariant,
  type ButtonSize
} from '@/lib/design-system-new'

// Export types for convenience
export type { ButtonProps, ButtonVariant, ButtonSize }

/**
 * New Design System Button Component
 * 
 * A versatile button component that follows the design system rules.
 * Supports multiple variants, sizes, and states with full accessibility.
 */
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({
  variant = 'primary',
  size = 'default',
  disabled = false,
  loading = false,
  children,
  className,
  leftIcon,
  rightIcon,
  onClick,
  type = 'button',
  ...props
}, ref) => {
  // Generate button classes using design system utilities
  const buttonClasses = getButtonClasses(variant, size, disabled || loading, className)
  
  // Generate focus classes for accessibility
  const focusClasses = getFocusClasses(true, true)
  
  // Generate ARIA attributes
  const ariaAttributes = getAriaAttributes(
    props['aria-label'],
    props['aria-describedby'],
    undefined
  )

  // Handle click events when not disabled or loading
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (!disabled && !loading && onClick) {
      onClick(event)
    }
  }

  return (
    <button
      ref={ref}
      type={type}
      className={cn(buttonClasses, focusClasses)}
      disabled={disabled || loading}
      onClick={handleClick}
      {...ariaAttributes}
      {...props}
    >
      {loading && (
        <Loader2 className="ds-icon-sm ds-icon-animate-spin mr-2" />
      )}
      {leftIcon && !loading && (
        <span className="ds-icon-sm mr-2">{leftIcon}</span>
      )}
      {children}
      {rightIcon && !loading && (
        <span className="ds-icon-sm ml-2">{rightIcon}</span>
      )}
    </button>
  )
})

Button.displayName = 'Button'

export { Button }