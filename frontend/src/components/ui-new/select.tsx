/**
 * DirectDriveX Select Component
 * Part of the new design system with ds- prefix
 * 
 * Select component for dropdown selections
 * Following the design system rules and accessibility guidelines
 */

import React from 'react'
import * as SelectPrimitive from '@radix-ui/react-select'
import { Check, ChevronDown, ChevronUp } from 'lucide-react'
import { cn } from '@/lib/utils'

// Select Trigger Component
export interface SelectTriggerProps {
  /** Placeholder text */
  placeholder?: string
  /** Whether the select is disabled */
  disabled?: boolean
  /** Additional CSS classes */
  className?: string
  /** Select content */
  children: React.ReactNode
}

/**
 * SelectTrigger Component
 * 
 * The trigger button that opens the select dropdown
 * 
 * @example
 * ```tsx
 * <SelectTrigger placeholder="Select an option...">
 *   <SelectValue />
 * </SelectTrigger>
 * ```
 */
export const SelectTrigger = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger> & SelectTriggerProps
>(({ 
  className, 
  placeholder = "Select an option...",
  disabled = false,
  children, 
  ...props 
}, ref) => (
  <SelectPrimitive.Trigger
    ref={ref}
    className={cn(
      'flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1',
      className
    )}
    disabled={disabled}
    {...props}
  >
    {children}
    <SelectPrimitive.Icon asChild>
      <ChevronDown className="h-4 w-4 opacity-50" />
    </SelectPrimitive.Icon>
  </SelectPrimitive.Trigger>
))
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName

// Select Value Component
export interface SelectValueProps {
  /** Placeholder text when no value is selected */
  placeholder?: string
  /** Additional CSS classes */
  className?: string
}

/**
 * SelectValue Component
 * 
 * Displays the selected value in the trigger
 * 
 * @example
 * ```tsx
 * <SelectValue placeholder="Select an option..." />
 * ```
 */
export const SelectValue = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Value>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Value> & SelectValueProps
>(({ className, placeholder, ...props }, ref) => (
  <SelectPrimitive.Value
    ref={ref}
    placeholder={placeholder}
    className={cn(className)}
    {...props}
  />
))
SelectValue.displayName = SelectPrimitive.Value.displayName

// Select Content Component
export interface SelectContentProps {
  /** Additional CSS classes */
  className?: string
  /** Select content */
  children: React.ReactNode
  /** Position of the dropdown */
  position?: 'popper' | 'item-aligned'
}

/**
 * SelectContent Component
 * 
 * The dropdown content container
 * 
 * @example
 * ```tsx
 * <SelectContent>
 *   <SelectItem value="option1">Option 1</SelectItem>
 *   <SelectItem value="option2">Option 2</SelectItem>
 * </SelectContent>
 * ```
 */
export const SelectContent = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content> & SelectContentProps
>(({ 
  className, 
  children, 
  position = 'popper',
  ...props 
}, ref) => (
  <SelectPrimitive.Portal>
    <SelectPrimitive.Content
      ref={ref}
      className={cn(
        'relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
        position === 'popper' &&
          'data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1',
        className
      )}
      position={position}
      {...props}
    >
      <SelectPrimitive.Viewport
        className={cn(
          'p-1',
          position === 'popper' &&
            'h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]'
        )}
      >
        {children}
      </SelectPrimitive.Viewport>
    </SelectPrimitive.Content>
  </SelectPrimitive.Portal>
))
SelectContent.displayName = SelectPrimitive.Content.displayName

// Select Label Component
export interface SelectLabelProps {
  /** Label text */
  children: React.ReactNode
  /** Additional CSS classes */
  className?: string
}

/**
 * SelectLabel Component
 * 
 * Label for grouping select items
 * 
 * @example
 * ```tsx
 * <SelectLabel>Group Label</SelectLabel>
 * ```
 */
export const SelectLabel = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Label> & SelectLabelProps
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Label
    ref={ref}
    className={cn('px-2 py-1.5 text-sm font-semibold', className)}
    {...props}
  >
    {children}
  </SelectPrimitive.Label>
))
SelectLabel.displayName = SelectPrimitive.Label.displayName

// Select Item Component
export interface SelectItemProps {
  /** Item value */
  value: string
  /** Item display text */
  children: React.ReactNode
  /** Whether the item is disabled */
  disabled?: boolean
  /** Additional CSS classes */
  className?: string
}

/**
 * SelectItem Component
 * 
 * Individual selectable item in the dropdown
 * 
 * @example
 * ```tsx
 * <SelectItem value="option1">Option 1</SelectItem>
 * ```
 */
export const SelectItem = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item> & SelectItemProps
>(({ 
  className, 
  children, 
  disabled = false,
  ...props 
}, ref) => (
  <SelectPrimitive.Item
    ref={ref}
    className={cn(
      'relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-2 pr-8 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
      className
    )}
    disabled={disabled}
    {...props}
  >
    <span className="absolute right-2 flex h-3.5 w-3.5 items-center justify-center">
      <SelectPrimitive.ItemIndicator>
        <Check className="h-4 w-4" />
      </SelectPrimitive.ItemIndicator>
    </span>
    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
  </SelectPrimitive.Item>
))
SelectItem.displayName = SelectPrimitive.Item.displayName

// Select Separator Component
export interface SelectSeparatorProps {
  /** Additional CSS classes */
  className?: string
}

/**
 * SelectSeparator Component
 * 
 * Visual separator between select items
 * 
 * @example
 * ```tsx
 * <SelectSeparator />
 * ```
 */
export const SelectSeparator = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Separator> & SelectSeparatorProps
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Separator
    ref={ref}
    className={cn('-mx-1 my-1 h-px bg-muted', className)}
    {...props}
  />
))
SelectSeparator.displayName = SelectPrimitive.Separator.displayName

// Select Scroll Up Button Component
export const SelectScrollUpButton = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.ScrollUpButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollUpButton>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollUpButton
    ref={ref}
    className={cn(
      'flex cursor-default items-center justify-center py-1',
      className
    )}
    {...props}
  >
    <ChevronUp className="h-4 w-4" />
  </SelectPrimitive.ScrollUpButton>
))
SelectScrollUpButton.displayName = SelectPrimitive.ScrollUpButton.displayName

// Select Scroll Down Button Component
export const SelectScrollDownButton = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.ScrollDownButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollDownButton>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollDownButton
    ref={ref}
    className={cn(
      'flex cursor-default items-center justify-center py-1',
      className
    )}
    {...props}
  >
    <ChevronDown className="h-4 w-4" />
  </SelectPrimitive.ScrollDownButton>
))
SelectScrollDownButton.displayName = SelectPrimitive.ScrollDownButton.displayName

// Main Select Component
export interface SelectProps {
  /** Select value */
  value?: string
  /** Default select value */
  defaultValue?: string
  /** Change handler */
  onValueChange?: (value: string) => void
  /** Whether the select is disabled */
  disabled?: boolean
  /** Whether the select is required */
  required?: boolean
  /** Additional CSS classes */
  className?: string
  /** Select content */
  children: React.ReactNode
}

/**
 * Select Component
 * 
 * Main select component that wraps all select elements
 * 
 * @example
 * ```tsx
 * <Select value={selectedValue} onValueChange={setSelectedValue}>
 *   <SelectTrigger>
 *     <SelectValue placeholder="Select an option..." />
 *   </SelectTrigger>
 *   <SelectContent>
 *     <SelectItem value="option1">Option 1</SelectItem>
 *     <SelectItem value="option2">Option 2</SelectItem>
 *     <SelectItem value="option3">Option 3</SelectItem>
 *   </SelectContent>
 * </Select>
 * ```
 */
export const Select = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Root> & SelectProps
>(({ 
  value,
  defaultValue,
  onValueChange,
  disabled = false,
  required = false,
  className,
  children,
  ...props 
}, ref) => (
  <SelectPrimitive.Root
    ref={ref}
    value={value}
    defaultValue={defaultValue}
    onValueChange={onValueChange}
    disabled={disabled}
    required={required}
    {...props}
  >
    {children}
  </SelectPrimitive.Root>
))
Select.displayName = SelectPrimitive.Root.displayName

// Export the primitive components for advanced usage
export const SelectRoot = SelectPrimitive.Root
export const SelectGroup = SelectPrimitive.Group

// Export types
export type { 
  SelectProps, 
  SelectTriggerProps, 
  SelectValueProps, 
  SelectContentProps, 
  SelectLabelProps, 
  SelectItemProps, 
  SelectSeparatorProps 
}