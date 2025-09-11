/**
 * DirectDriveX Radio Group Component
 * Part of the new design system with ds- prefix
 * 
 * Radio group component for single selection from multiple options
 * Following the design system rules and accessibility guidelines
 */

import React from 'react'
import * as RadioGroupPrimitive from '@radix-ui/react-radio-group'
import { Circle } from 'lucide-react'
import { cn } from '@/lib/utils'

// Radio Group Item Component
export interface RadioGroupItemProps {
  /** Radio item value */
  value: string
  /** Radio item label */
  label: string
  /** Whether the item is disabled */
  disabled?: boolean
  /** Additional CSS classes */
  className?: string
  /** Unique ID for the radio item */
  id?: string
}

/**
 * RadioGroupItem Component
 * 
 * Individual radio button within a radio group
 * 
 * @example
 * ```tsx
 * <RadioGroupItem value="option1" label="Option 1" />
 * ```
 */
export const RadioGroupItem = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item> & RadioGroupItemProps
>(({ 
  value, 
  label, 
  disabled = false, 
  className, 
  id,
  ...props 
}, ref) => {
  const itemId = id || `radio-${value}`
  
  return (
    <div className="flex items-center space-x-2">
      <RadioGroupPrimitive.Item
        ref={ref}
        value={value}
        id={itemId}
        disabled={disabled}
        className={cn(
          'aspect-square h-4 w-4 rounded-full border border-primary text-primary ring-offset-background focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
        {...props}
      >
        <RadioGroupPrimitive.Indicator className="flex items-center justify-center">
          <Circle className="h-2.5 w-2.5 fill-current text-current" />
        </RadioGroupPrimitive.Indicator>
      </RadioGroupPrimitive.Item>
      <label
        htmlFor={itemId}
        className={cn(
          'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
          disabled && 'cursor-not-allowed opacity-70'
        )}
      >
        {label}
      </label>
    </div>
  )
})
RadioGroupItem.displayName = RadioGroupPrimitive.Item.displayName

// Radio Group Component
export interface RadioGroupProps {
  /** Radio group options */
  options: Array<{
    value: string
    label: string
    disabled?: boolean
  }>
  /** Selected value */
  value?: string
  /** Default selected value */
  defaultValue?: string
  /** Change handler */
  onValueChange?: (value: string) => void
  /** Whether radio group is required */
  required?: boolean
  /** Whether group is disabled */
  disabled?: boolean
  /** Orientation */
  orientation?: 'horizontal' | 'vertical'
  /** Additional CSS classes */
  className?: string
}

/**
 * RadioGroup Component
 * 
 * Group of radio buttons for single selection
 * 
 * @example
 * ```tsx
 * <RadioGroup
 *   options={[
 *     { value: 'option1', label: 'Option 1' },
 *     { value: 'option2', label: 'Option 2' },
 *     { value: 'option3', label: 'Option 3' },
 *   ]}
 *   onValueChange={(value) => console.log(value)}
 * />
 * ```
 */
export const RadioGroup = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root> & RadioGroupProps
>(({ 
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
  return (
    <RadioGroupPrimitive.Root
      ref={ref}
      value={value}
      defaultValue={defaultValue}
      onValueChange={onValueChange}
      disabled={disabled}
      required={required}
      className={cn(
        'space-y-2',
        orientation === 'horizontal' && 'flex flex-row space-y-0 space-x-4',
        className
      )}
      {...props}
    >
      {options.map((option) => (
        <RadioGroupItem
          key={option.value}
          value={option.value}
          label={option.label}
          disabled={disabled || option.disabled}
        />
      ))}
    </RadioGroupPrimitive.Root>
  )
})
RadioGroup.displayName = RadioGroupPrimitive.Root.displayName

// Export the primitive root for advanced usage
export const RadioGroupRoot = RadioGroupPrimitive.Root
export const RadioGroupIndicator = RadioGroupPrimitive.Indicator

// Export types
export type { RadioGroupProps, RadioGroupItemProps }