/**
 * DirectDriveX Sheet Component
 * Part of the new design system with ds- prefix
 * 
 * Sheet component for side panels and drawers
 * Following the design system rules and accessibility guidelines
 */

import React from 'react'
import * as SheetPrimitive from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

// Sheet Overlay Component
export interface SheetOverlayProps {
  /** Additional CSS classes */
  className?: string
}

/**
 * SheetOverlay Component
 * 
 * Overlay backdrop for sheet
 * 
 * @example
 * ```tsx
 * <SheetOverlay />
 * ```
 */
export const SheetOverlay = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Overlay> & SheetOverlayProps
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Overlay
    ref={ref}
    className={cn(
      'fixed inset-0 z-50 bg-black/80 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
      className
    )}
    {...props}
  />
))
SheetOverlay.displayName = SheetPrimitive.Overlay.displayName

// Sheet Content Component
export interface SheetContentProps {
  /** Sheet title */
  title?: string
  /** Sheet description */
  description?: string
  /** Whether the sheet can be closed */
  closable?: boolean
  /** Sheet position */
  side?: 'top' | 'right' | 'bottom' | 'left'
  /** Additional CSS classes */
  className?: string
  /** Sheet content */
  children: React.ReactNode
}

/**
 * SheetContent Component
 * 
 * Main sheet content container
 * 
 * @example
 * ```tsx
 * <SheetContent title="Sheet Title" side="right">
 *   <p>Sheet content goes here</p>
 * </SheetContent>
 * ```
 */
export const SheetContent = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Content> & SheetContentProps
>(({ 
  title,
  description,
  closable = true,
  side = 'right',
  className,
  children,
  ...props 
}, ref) => {
  const sideClasses = {
    top: 'inset-x-0 top-0 border-b data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top',
    right: 'inset-y-0 right-0 h-full w-3/4 border-l data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right sm:max-w-sm',
    bottom: 'inset-x-0 bottom-0 border-t data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom',
    left: 'inset-y-0 left-0 h-full w-3/4 border-r data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left sm:max-w-sm',
  }

  return (
    <SheetPrimitive.Portal>
      <SheetOverlay />
      <SheetPrimitive.Content
        ref={ref}
        className={cn(
          'fixed z-50 gap-4 bg-background p-6 shadow-lg transition ease-in-out data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:duration-300 data-[state=open]:duration-500',
          sideClasses[side],
          className
        )}
        {...props}
      >
        {title && (
          <SheetPrimitive.Title className="text-lg font-semibold leading-none tracking-tight">
            {title}
          </SheetPrimitive.Title>
        )}
        {description && (
          <SheetPrimitive.Description className="text-sm text-muted-foreground">
            {description}
          </SheetPrimitive.Description>
        )}
        {children}
        {closable && (
          <SheetPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-secondary">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </SheetPrimitive.Close>
        )}
      </SheetPrimitive.Content>
    </SheetPrimitive.Portal>
  )
})
SheetContent.displayName = SheetPrimitive.Content.displayName

// Sheet Header Component
export interface SheetHeaderProps {
  /** Additional CSS classes */
  className?: string
  /** Header content */
  children: React.ReactNode
}

/**
 * SheetHeader Component
 * 
 * Container for sheet title and description
 * 
 * @example
 * ```tsx
 * <SheetHeader>
 *   <SheetTitle>Sheet Title</SheetTitle>
 *   <SheetDescription>Sheet description</SheetDescription>
 * </SheetHeader>
 * ```
 */
export const SheetHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & SheetHeaderProps
>(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'flex flex-col space-y-2 text-center sm:text-left',
      className
    )}
    {...props}
  >
    {children}
  </div>
))
SheetHeader.displayName = 'SheetHeader'

// Sheet Footer Component
export interface SheetFooterProps {
  /** Additional CSS classes */
  className?: string
  /** Footer content */
  children: React.ReactNode
}

/**
 * SheetFooter Component
 * 
 * Container for sheet actions and buttons
 * 
 * @example
 * ```tsx
 * <SheetFooter>
 *   <Button variant="outline" onClick={onCancel}>Cancel</Button>
 *   <Button onClick={onConfirm}>Confirm</Button>
 * </SheetFooter>
 * ```
 */
export const SheetFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & SheetFooterProps
>(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2',
      className
    )}
    {...props}
  >
    {children}
  </div>
))
SheetFooter.displayName = 'SheetFooter'

// Sheet Title Component
export interface SheetTitleProps {
  /** Additional CSS classes */
  className?: string
  /** Title content */
  children: React.ReactNode
}

/**
 * SheetTitle Component
 * 
 * Sheet title component
 * 
 * @example
 * ```tsx
 * <SheetTitle>Sheet Title</SheetTitle>
 * ```
 */
export const SheetTitle = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Title> & SheetTitleProps
>(({ className, children, ...props }, ref) => (
  <SheetPrimitive.Title
    ref={ref}
    className={cn(
      'text-lg font-semibold leading-none tracking-tight',
      className
    )}
    {...props}
  >
    {children}
  </SheetPrimitive.Title>
))
SheetTitle.displayName = SheetPrimitive.Title.displayName

// Sheet Description Component
export interface SheetDescriptionProps {
  /** Additional CSS classes */
  className?: string
  /** Description content */
  children: React.ReactNode
}

/**
 * SheetDescription Component
 * 
 * Sheet description component
 * 
 * @example
 * ```tsx
 * <SheetDescription>Sheet description text</SheetDescription>
 * ```
 */
export const SheetDescription = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Description> & SheetDescriptionProps
>(({ className, children, ...props }, ref) => (
  <SheetPrimitive.Description
    ref={ref}
    className={cn('text-sm text-muted-foreground', className)}
    {...props}
  >
    {children}
  </SheetPrimitive.Description>
))
SheetDescription.displayName = SheetPrimitive.Description.displayName

// Sheet Trigger Component
export interface SheetTriggerProps {
  /** Additional CSS classes */
  className?: string
  /** Trigger content */
  children: React.ReactNode
  /** Click handler */
  onClick?: () => void
}

/**
 * SheetTrigger Component
 * 
 * Button that opens the sheet
 * 
 * @example
 * ```tsx
 * <SheetTrigger>
 *   <Button>Open Sheet</Button>
 * </SheetTrigger>
 * ```
 */
export const SheetTrigger = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Trigger> & SheetTriggerProps
>(({ className, children, ...props }, ref) => (
  <SheetPrimitive.Trigger
    ref={ref}
    className={cn(className)}
    {...props}
  >
    {children}
  </SheetPrimitive.Trigger>
))
SheetTrigger.displayName = SheetPrimitive.Trigger.displayName

// Sheet Close Component
export interface SheetCloseProps {
  /** Additional CSS classes */
  className?: string
  /** Close button content */
  children?: React.ReactNode
}

/**
 * SheetClose Component
 * 
 * Button that closes the sheet
 * 
 * @example
 * ```tsx
 * <SheetClose asChild>
 *   <Button variant="outline">Cancel</Button>
 * </SheetClose>
 * ```
 */
export const SheetClose = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Close>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Close> & SheetCloseProps
>(({ className, children, ...props }, ref) => (
  <SheetPrimitive.Close
    ref={ref}
    className={cn(
      'mt-2 inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground ring-offset-background transition-colors hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
      className
    )}
    {...props}
  >
    {children || 'Close'}
  </SheetPrimitive.Close>
))
SheetClose.displayName = SheetPrimitive.Close.displayName

// Main Sheet Component
export interface SheetProps {
  /** Whether the sheet is open */
  open?: boolean
  /** Default open state */
  defaultOpen?: boolean
  /** Open change handler */
  onOpenChange?: (open: boolean) => void
  /** Whether the sheet is modal */
  modal?: boolean
  /** Additional CSS classes */
  className?: string
  /** Sheet content */
  children: React.ReactNode
}

/**
 * Sheet Component
 * 
 * Main sheet component that manages sheet state
 * 
 * @example
 * ```tsx
 * <Sheet>
 *   <SheetTrigger asChild>
 *     <Button>Open Sheet</Button>
 *   </SheetTrigger>
 *   <SheetContent title="Sheet Title" side="right">
 *     <p>Sheet content goes here</p>
 *     <SheetFooter>
 *       <SheetClose asChild>
 *         <Button variant="outline">Cancel</Button>
 *       </SheetClose>
 *       <Button>Confirm</Button>
 *     </SheetFooter>
 *   </SheetContent>
 * </Sheet>
 * ```
 */
export const Sheet = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Root> & SheetProps
>(({ 
  open,
  defaultOpen,
  onOpenChange,
  modal = true,
  className,
  children,
  ...props 
}, ref) => (
  <SheetPrimitive.Root
    ref={ref}
    open={open}
    defaultOpen={defaultOpen}
    onOpenChange={onOpenChange}
    modal={modal}
    className={cn(className)}
    {...props}
  >
    {children}
  </SheetPrimitive.Root>
))
Sheet.displayName = SheetPrimitive.Root.displayName

// Export types
export type { 
  SheetProps, 
  SheetContentProps, 
  SheetHeaderProps, 
  SheetFooterProps, 
  SheetTitleProps, 
  SheetDescriptionProps, 
  SheetTriggerProps, 
  SheetCloseProps, 
  SheetOverlayProps 
}