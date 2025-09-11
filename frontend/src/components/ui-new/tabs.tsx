/**
 * DirectDriveX Tabs Component
 * Part of the new design system with ds- prefix
 * 
 * Tabs component for organizing content into separate sections
 * Following the design system rules and accessibility guidelines
 */

import React from 'react'
import * as TabsPrimitive from '@radix-ui/react-tabs'
import { cn } from '@/lib/utils'

// Tabs List Component
export interface TabsListProps {
  /** Additional CSS classes */
  className?: string
  /** Tabs content */
  children: React.ReactNode
}

/**
 * TabsList Component
 * 
 * Container for tab triggers
 * 
 * @example
 * ```tsx
 * <TabsList>
 *   <TabsTrigger value="tab1">Tab 1</TabsTrigger>
 *   <TabsTrigger value="tab2">Tab 2</TabsTrigger>
 * </TabsList>
 * ```
 */
export const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List> & TabsListProps
>(({ className, children, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      'inline-flex h-9 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground',
      className
    )}
    {...props}
  >
    {children}
  </TabsPrimitive.List>
))
TabsList.displayName = TabsPrimitive.List.displayName

// Tabs Trigger Component
export interface TabsTriggerProps {
  /** Tab value */
  value: string
  /** Tab label */
  children: React.ReactNode
  /** Whether the tab is disabled */
  disabled?: boolean
  /** Additional CSS classes */
  className?: string
}

/**
 * TabsTrigger Component
 * 
 * Individual tab button that switches between content
 * 
 * @example
 * ```tsx
 * <TabsTrigger value="tab1">Tab 1</TabsTrigger>
 * ```
 */
export const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger> & TabsTriggerProps
>(({ className, children, disabled = false, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      'inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow',
      className
    )}
    disabled={disabled}
    {...props}
  >
    {children}
  </TabsPrimitive.Trigger>
))
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName

// Tabs Content Component
export interface TabsContentProps {
  /** Tab value */
  value: string
  /** Tab content */
  children: React.ReactNode
  /** Force mount content */
  forceMount?: boolean
  /** Additional CSS classes */
  className?: string
}

/**
 * TabsContent Component
 * 
 * Content panel for a specific tab
 * 
 * @example
 * ```tsx
 * <TabsContent value="tab1">
 *   <p>Content for Tab 1</p>
 * </TabsContent>
 * ```
 */
export const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content> & TabsContentProps
>(({ className, children, forceMount, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      'mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
      className
    )}
    forceMount={forceMount}
    {...props}
  >
    {children}
  </TabsPrimitive.Content>
))
TabsContent.displayName = TabsPrimitive.Content.displayName

// Main Tabs Component
export interface TabsProps {
  /** Default active tab */
  defaultValue?: string
  /** Currently active tab */
  value?: string
  /** Tab change handler */
  onValueChange?: (value: string) => void
  /** Tab orientation */
  orientation?: 'horizontal' | 'vertical'
  /** Additional CSS classes */
  className?: string
  /** Tabs content */
  children: React.ReactNode
}

/**
 * Tabs Component
 * 
 * Main tabs component that manages tab state and content
 * 
 * @example
 * ```tsx
 * <Tabs defaultValue="tab1">
 *   <TabsList>
 *     <TabsTrigger value="tab1">Tab 1</TabsTrigger>
 *     <TabsTrigger value="tab2">Tab 2</TabsTrigger>
 *   </TabsList>
 *   <TabsContent value="tab1">
 *     <p>Content for Tab 1</p>
 *   </TabsContent>
 *   <TabsContent value="tab2">
 *     <p>Content for Tab 2</p>
 *   </TabsContent>
 * </Tabs>
 * ```
 */
export const Tabs = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Root> & TabsProps
>(({ 
  defaultValue,
  value,
  onValueChange,
  orientation = 'horizontal',
  className,
  children,
  ...props 
}, ref) => (
  <TabsPrimitive.Root
    ref={ref}
    defaultValue={defaultValue}
    value={value}
    onValueChange={onValueChange}
    orientation={orientation}
    className={cn('w-full', className)}
    {...props}
  >
    {children}
  </TabsPrimitive.Root>
))
Tabs.displayName = TabsPrimitive.Root.displayName

// Export types
export type { 
  TabsProps, 
  TabsListProps, 
  TabsTriggerProps, 
  TabsContentProps 
}