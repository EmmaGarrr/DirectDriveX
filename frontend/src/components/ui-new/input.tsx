/**
 * DirectDriveX New Design System - Input Component
 * Phase 1: Foundation Setup
 * 
 * This component follows the design system rules and provides a type-safe,
 * accessible, and responsive input implementation with ds- prefix.
 */

import React from 'react'
import { cn } from '@/lib/utils'
import { 
  getInputClasses, 
  getFocusClasses,
  type InputProps,
  type InputVariant
} from '@/lib/design-system-new'

// Export types for convenience
export type { InputProps, InputVariant }

/**
 * New Design System Input Component
 * 
 * A versatile input component that follows the design system rules.
 * Supports multiple variants, states, and full accessibility.
 */
const Input = React.forwardRef<HTMLInputElement, InputProps>(({
  variant = 'default',
  error = false,
  disabled = false,
  readOnly = false,
  required = false,
  type = 'text',
  className,
  leftIcon,
  rightIcon,
  onChange,
  ...props
}, ref) => {
  // Generate input classes using design system utilities
  const inputClasses = getInputClasses(variant, error, className)
  
  // Generate focus classes for accessibility
  const focusClasses = getFocusClasses(true, true)

  // Handle change events
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!disabled && !readOnly && onChange) {
      onChange(event)
    }
  }

  // Generate ARIA attributes
  const ariaAttributes = {
    'aria-invalid': error,
    'aria-disabled': disabled,
    'aria-readonly': readOnly,
    'aria-required': required,
    'aria-describedby': error ? `${props.id || props.name}-error` : undefined
  }

  return (
    <div className="ds-input-wrapper relative">
      {leftIcon && (
        <div className="ds-input-left-icon absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground pointer-events-none">
          {leftIcon}
        </div>
      )}
      
      <input
        ref={ref}
        type={type}
        className={cn(
          inputClasses,
          focusClasses,
          leftIcon && 'pl-10',
          rightIcon && 'pr-10'
        )}
        disabled={disabled}
        readOnly={readOnly}
        required={required}
        onChange={handleChange}
        {...ariaAttributes}
        {...props}
      />
      
      {rightIcon && (
        <div className="ds-input-right-icon absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground pointer-events-none">
          {rightIcon}
        </div>
      )}
      
      {error && (
        <div id={`${props.id || props.name}-error`} className="ds-input-error-message text-destructive text-sm mt-1">
          {typeof error === 'string' ? error : 'This field is required'}
        </div>
      )}
    </div>
  )
})

Input.displayName = 'Input'

export { Input }