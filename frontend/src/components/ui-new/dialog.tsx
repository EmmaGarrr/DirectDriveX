/**
 * DirectDriveX Dialog Component
 * Part of the new design system with ds- prefix
 * 
 * Dialog component for modal windows and overlays
 * Following the design system rules and accessibility guidelines
 */

import React from 'react'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

// Dialog Overlay Component
export interface DialogOverlayProps {
  /** Additional CSS classes */
  className?: string
}

/**
 * DialogOverlay Component
 * 
 * Overlay backdrop for dialog
 * 
 * @example
 * ```tsx
 * <DialogOverlay />
 * ```
 */
export const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay> & DialogOverlayProps
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      'fixed inset-0 z-50 bg-black/80 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
      className
    )}
    {...props}
  />
))
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName

// Dialog Content Component
export interface DialogContentProps {
  /** Dialog title */
  title?: string
  /** Dialog description */
  description?: string
  /** Whether the dialog can be closed */
  closable?: boolean
  /** Additional CSS classes */
  className?: string
  /** Dialog content */
  children: React.ReactNode
}

/**
 * DialogContent Component
 * 
 * Main dialog content container
 * 
 * @example
 * ```tsx
 * <DialogContent title="Dialog Title" description="Dialog description">
 *   <p>Dialog content goes here</p>
 * </DialogContent>
 * ```
 */
export const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & DialogContentProps
>(({ 
  title,
  description,
  closable = true,
  className,
  children,
  ...props 
}, ref) => (
  <DialogPrimitive.Portal>
    <DialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        'fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg md:w-full',
        className
      )}
      {...props}
    >
      {title && (
        <DialogPrimitive.Title className="text-lg font-semibold leading-none tracking-tight">
          {title}
        </DialogPrimitive.Title>
      )}
      {description && (
        <DialogPrimitive.Description className="text-sm text-muted-foreground">
          {description}
        </DialogPrimitive.Description>
      )}
      {children}
      {closable && (
        <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </DialogPrimitive.Close>
      )}
    </DialogPrimitive.Content>
  </DialogPrimitive.Portal>
))
DialogContent.displayName = DialogPrimitive.Content.displayName

// Dialog Header Component
export interface DialogHeaderProps {
  /** Additional CSS classes */
  className?: string
  /** Header content */
  children: React.ReactNode
}

/**
 * DialogHeader Component
 * 
 * Container for dialog title and description
 * 
 * @example
 * ```tsx
 * <DialogHeader>
 *   <DialogTitle>Dialog Title</DialogTitle>
 *   <DialogDescription>Dialog description</DialogDescription>
 * </DialogHeader>
 * ```
 */
export const DialogHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & DialogHeaderProps
>(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'flex flex-col space-y-1.5 text-center sm:text-left',
      className
    )}
    {...props}
  >
    {children}
  </div>
))
DialogHeader.displayName = 'DialogHeader'

// Dialog Footer Component
export interface DialogFooterProps {
  /** Additional CSS classes */
  className?: string
  /** Footer content */
  children: React.ReactNode
}

/**
 * DialogFooter Component
 * 
 * Container for dialog actions and buttons
 * 
 * @example
 * ```tsx
 * <DialogFooter>
 *   <Button variant="outline" onClick={onCancel}>Cancel</Button>
 *   <Button onClick={onConfirm}>Confirm</Button>
 * </DialogFooter>
 * ```
 */
export const DialogFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & DialogFooterProps
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
DialogFooter.displayName = 'DialogFooter'

// Dialog Title Component
export interface DialogTitleProps {
  /** Additional CSS classes */
  className?: string
  /** Title content */
  children: React.ReactNode
}

/**
 * DialogTitle Component
 * 
 * Dialog title component
 * 
 * @example
 * ```tsx
 * <DialogTitle>Dialog Title</DialogTitle>
 * ```
 */
export const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title> & DialogTitleProps
>(({ className, children, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn(
      'text-lg font-semibold leading-none tracking-tight',
      className
    )}
    {...props}
  >
    {children}
  </DialogPrimitive.Title>
))
DialogTitle.displayName = DialogPrimitive.Title.displayName

// Dialog Description Component
export interface DialogDescriptionProps {
  /** Additional CSS classes */
  className?: string
  /** Description content */
  children: React.ReactNode
}

/**
 * DialogDescription Component
 * 
 * Dialog description component
 * 
 * @example
 * ```tsx
 * <DialogDescription>Dialog description text</DialogDescription>
 * ```
 */
export const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description> & DialogDescriptionProps
>(({ className, children, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn('text-sm text-muted-foreground', className)}
    {...props}
  >
    {children}
  </DialogPrimitive.Description>
))
DialogDescription.displayName = DialogPrimitive.Description.displayName

// Dialog Trigger Component
export interface DialogTriggerProps {
  /** Additional CSS classes */
  className?: string
  /** Trigger content */
  children: React.ReactNode
  /** Click handler */
  onClick?: () => void
}

/**
 * DialogTrigger Component
 * 
 * Button that opens the dialog
 * 
 * @example
 * ```tsx
 * <DialogTrigger>
 *   <Button>Open Dialog</Button>
 * </DialogTrigger>
 * ```
 */
export const DialogTrigger = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Trigger> & DialogTriggerProps
>(({ className, children, ...props }, ref) => (
  <DialogPrimitive.Trigger
    ref={ref}
    className={cn(className)}
    {...props}
  >
    {children}
  </DialogPrimitive.Trigger>
))
DialogTrigger.displayName = DialogPrimitive.Trigger.displayName

// Dialog Close Component
export interface DialogCloseProps {
  /** Additional CSS classes */
  className?: string
  /** Close button content */
  children?: React.ReactNode
}

/**
 * DialogClose Component
 * 
 * Button that closes the dialog
 * 
 * @example
 * ```tsx
 * <DialogClose asChild>
 *   <Button variant="outline">Cancel</Button>
 * </DialogClose>
 * ```
 */
export const DialogClose = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Close>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Close> & DialogCloseProps
>(({ className, children, ...props }, ref) => (
  <DialogPrimitive.Close
    ref={ref}
    className={cn(
      'mt-2 inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground ring-offset-background transition-colors hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
      className
    )}
    {...props}
  >
    {children || 'Close'}
  </DialogPrimitive.Close>
))
DialogClose.displayName = DialogPrimitive.Close.displayName

// Main Dialog Component
export interface DialogProps {
  /** Whether the dialog is open */
  open?: boolean
  /** Default open state */
  defaultOpen?: boolean
  /** Open change handler */
  onOpenChange?: (open: boolean) => void
  /** Whether the dialog is modal */
  modal?: boolean
  /** Additional CSS classes */
  className?: string
  /** Dialog content */
  children: React.ReactNode
}

/**
 * Dialog Component
 * 
 * Main dialog component that manages dialog state
 * 
 * @example
 * ```tsx
 * <Dialog>
 *   <DialogTrigger asChild>
 *     <Button>Open Dialog</Button>
 *   </DialogTrigger>
 *   <DialogContent title="Dialog Title">
 *     <p>Dialog content goes here</p>
 *     <DialogFooter>
 *       <DialogClose asChild>
 *         <Button variant="outline">Cancel</Button>
 *       </DialogClose>
 *       <Button>Confirm</Button>
 *     </DialogFooter>
 *   </DialogContent>
 * </Dialog>
 * ```
 */
export const Dialog = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Root> & DialogProps
>(({ 
  open,
  defaultOpen,
  onOpenChange,
  modal = true,
  className,
  children,
  ...props 
}, ref) => (
  <DialogPrimitive.Root
    ref={ref}
    open={open}
    defaultOpen={defaultOpen}
    onOpenChange={onOpenChange}
    modal={modal}
    className={cn(className)}
    {...props}
  >
    {children}
  </DialogPrimitive.Root>
))
Dialog.displayName = DialogPrimitive.Root.displayName

// Export types
export type { 
  DialogProps, 
  DialogContentProps, 
  DialogHeaderProps, 
  DialogFooterProps, 
  DialogTitleProps, 
  DialogDescriptionProps, 
  DialogTriggerProps, 
  DialogCloseProps, 
  DialogOverlayProps 
}