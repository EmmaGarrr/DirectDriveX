/**
 * DirectDriveX Checkbox Component
 * Part of the new design system with ds- prefix
 * 
 * Checkbox component for boolean input selections
 * Following the design system rules and accessibility guidelines
 */

import React from 'react'
import * as CheckboxPrimitive from '@radix-ui/react-checkbox'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { CheckboxProps } from '@/lib/design-system-types'

/**
 * Checkbox Component
 * 
 * Boolean input component with proper accessibility and states
 * 
 * @example
 * ```tsx
 * <Checkbox />
 * <Checkbox checked={true} />
 * <Checkbox disabled />
 * <Checkbox required />
 * ```
 */
export const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  CheckboxProps
>(({ 
  className, 
  checked,
  defaultChecked,
  disabled = false,
  required = false,
  onCheckedChange,
  ...props 
}, ref) => {
  return (
    <CheckboxPrimitive.Root
      ref={ref}
      checked={checked}
      defaultChecked={defaultChecked}
      disabled={disabled}
      required={required}
      onCheckedChange={onCheckedChange}
      className={cn(
        'peer h-4 w-4 shrink-0 rounded-sm border border-primary ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground',
        className
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        className={cn('flex items-center justify-center text-current')}
      >
        <Check className="h-4 w-4" />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
})
Checkbox.displayName = CheckboxPrimitive.Root.displayName

// Checkbox Group Component
export interface CheckboxGroupProps {
  /** Checkbox options */
  options: Array<{
    value: string
    label: string
    disabled?: boolean
  }>
  /** Selected values */
  value?: string[]
  /** Default selected values */
  defaultValue?: string[]
  /** Change handler */
  onValueChange?: (value: string[]) => void
  /** Whether checkboxes are required */
  required?: boolean
  /** Whether group is disabled */
  disabled?: boolean
  /** Orientation */
  orientation?: 'horizontal' | 'vertical'
  /** Additional CSS classes */
  className?: string
}

/**
 * CheckboxGroup Component
 * 
 * Group of checkboxes for multiple selections
 * 
 * @example
 * ```tsx
 * <CheckboxGroup
 *   options={[
 *     { value: 'option1', label: 'Option 1' },
 *     { value: 'option2', label: 'Option 2' },
 *     { value: 'option3', label: 'Option 3' },
 *   ]}
 *   onValueChange={(value) => console.log(value)}
 * />
 * ```
 */
export const CheckboxGroup = React.forwardRef<HTMLDivElement, CheckboxGroupProps>(
  ({ 
    options,
    value,
    defaultValue,
    onValueChange,
    required = false,
    disabled = false,
    orientation = 'vertical',
    className,
    ...props 
  }, ref) => {
    const [internalValue, setInternalValue] = React.useState<string[]>(
      value || defaultValue || []
    )

    React.useEffect(() => {
      if (value !== undefined) {
        setInternalValue(value)
      }
    }, [value])

    const handleChange = (optionValue: string, checked: boolean) => {
      const newValue = checked
        ? [...internalValue, optionValue]
        : internalValue.filter(v => v !== optionValue)
      
      setInternalValue(newValue)
      onValueChange?.(newValue)
    }

    return (
      <div
        ref={ref}
        className={cn(
          'space-y-2',
          orientation === 'horizontal' && 'flex flex-row space-y-0 space-x-4',
          className
        )}
        {...props}
      >
        {options.map((option) => (
          <div key={option.value} className="flex items-center space-x-2">
            <Checkbox
              id={`checkbox-${option.value}`}
              checked={internalValue.includes(option.value)}
              onCheckedChange={(checked) => handleChange(option.value, checked as boolean)}
              disabled={disabled || option.disabled}
              required={required}
            />
            <label
              htmlFor={`checkbox-${option.value}`}
              className={cn(
                'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
                (disabled || option.disabled) && 'cursor-not-allowed opacity-70'
              )}
            >
              {option.label}
            </label>
          </div>
        ))}
      </div>
    )
  }
)
CheckboxGroup.displayName = 'CheckboxGroup'

// Export types
export type { CheckboxProps, CheckboxGroupProps }