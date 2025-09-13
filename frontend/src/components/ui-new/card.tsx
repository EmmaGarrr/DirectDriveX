/**
 * DirectDriveX New Design System - Card Component
 * Phase 1: Foundation Setup
 * 
 * This component follows the design system rules and provides a type-safe,
 * accessible, and responsive card implementation with ds- prefix.
 */

import React from 'react'
import { cn } from '@/lib/utils'
import { 
  getCardClasses, 
  getFocusClasses,
  type CardProps,
  type CardHeaderProps,
  type CardTitleProps,
  type CardDescriptionProps,
  type CardContentProps,
  type CardFooterProps,
  type CardVariant
} from '@/lib/design-system-new'

// Export types for convenience
export type { 
  CardProps, 
  CardHeaderProps, 
  CardTitleProps, 
  CardDescriptionProps, 
  CardContentProps, 
  CardFooterProps, 
  CardVariant 
}

/**
 * New Design System Card Component
 * 
 * A versatile card component that follows the design system rules.
 * Supports multiple variants and states with full accessibility.
 */
const Card = React.forwardRef<HTMLDivElement, CardProps>(({
  variant = 'default',
  interactive = false,
  selected = false,
  children,
  className,
  onClick,
  ...props
}, ref) => {
  // Generate card classes using design system utilities
  const cardClasses = getCardClasses(variant, className)
  
  // Generate focus classes for interactive cards
  const focusClasses = interactive ? getFocusClasses(true, true) : ''
  
  // Additional state classes
  const stateClasses = cn(
    interactive && 'cursor-pointer transition-all duration-200 hover:shadow-md',
    selected && 'ring-2 ring-primary'
  )

  // Handle click events for interactive cards
  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (interactive && onClick) {
      onClick(event)
    }
  }

  return (
    <div
      ref={ref}
      className={cn(cardClasses, focusClasses, stateClasses)}
      onClick={handleClick}
      {...props}
    >
      {children}
    </div>
  )
})

Card.displayName = 'Card'

/**
 * Card Header Component
 * 
 * Header section for cards with proper spacing and layout.
 */
const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(({
  children,
  className,
  ...props
}, ref) => {
  return (
    <div
      ref={ref}
      className={cn('ds-card-header flex flex-col space-y-1.5 p-6', className)}
      {...props}
    >
      {children}
    </div>
  )
})

CardHeader.displayName = 'CardHeader'

/**
 * Card Title Component
 * 
 * Title component for cards with proper typography and hierarchy.
 */
const CardTitle = React.forwardRef<HTMLHeadingElement, CardTitleProps>(({
  level = 3,
  children,
  className,
  ...props
}, ref) => {
  const HeadingTag = `h${level}` as const
  const headingClasses = {
    1: 'ds-heading-1 text-2xl font-semibold leading-none tracking-tight',
    2: 'ds-heading-2 text-xl font-semibold leading-none tracking-tight',
    3: 'ds-heading-3 text-lg font-semibold leading-none tracking-tight',
    4: 'ds-heading-4 text-base font-semibold leading-none tracking-tight',
    5: 'ds-heading-5 text-sm font-semibold leading-none tracking-tight',
    6: 'ds-heading-6 text-xs font-semibold leading-none tracking-tight'
  }

  return (
    <HeadingTag
      ref={ref}
      className={cn(headingClasses[level], className)}
      {...props}
    >
      {children}
    </HeadingTag>
  )
})

CardTitle.displayName = 'CardTitle'

/**
 * Card Description Component
 * 
 * Description component for cards with proper typography and spacing.
 */
const CardDescription = React.forwardRef<HTMLParagraphElement, CardDescriptionProps>(({
  children,
  className,
  ...props
}, ref) => {
  return (
    <p
      ref={ref}
      className={cn('ds-card-description text-sm text-muted-foreground', className)}
      {...props}
    >
      {children}
    </p>
  )
})

CardDescription.displayName = 'CardDescription'

/**
 * Card Content Component
 * 
 * Main content area for cards with proper spacing.
 */
const CardContent = React.forwardRef<HTMLDivElement, CardContentProps>(({
  children,
  className,
  ...props
}, ref) => {
  return (
    <div
      ref={ref}
      className={cn('ds-card-content p-6 pt-0', className)}
      {...props}
    >
      {children}
    </div>
  )
})

CardContent.displayName = 'CardContent'

/**
 * Card Footer Component
 * 
 * Footer section for cards with proper spacing and layout.
 */
const CardFooter = React.forwardRef<HTMLDivElement, CardFooterProps>(({
  children,
  className,
  ...props
}, ref) => {
  return (
    <div
      ref={ref}
      className={cn('ds-card-footer flex items-center p-6 pt-0', className)}
      {...props}
    >
      {children}
    </div>
  )
})

CardFooter.displayName = 'CardFooter'

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }