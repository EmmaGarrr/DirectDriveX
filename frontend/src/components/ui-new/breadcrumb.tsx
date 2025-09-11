/**
 * DirectDriveX Breadcrumbs Component
 * Part of the new design system with ds- prefix
 * 
 * Breadcrumbs component for navigation hierarchy
 * Following the design system rules and accessibility guidelines
 */

import React from 'react'
import { ChevronRight, Home } from 'lucide-react'
import { cn } from '@/lib/utils'

// Breadcrumb Item Component
export interface BreadcrumbItemProps {
  /** Item text */
  children: React.ReactNode
  /** Item href (if clickable) */
  href?: string
  /** Whether this is the current page */
  current?: boolean
  /** Click handler */
  onClick?: () => void
  /** Additional CSS classes */
  className?: string
}

/**
 * BreadcrumbItem Component
 * 
 * Individual breadcrumb item
 * 
 * @example
 * ```tsx
 * <BreadcrumbItem href="/home">Home</BreadcrumbItem>
 * <BreadcrumbItem current>Current Page</BreadcrumbItem>
 * ```
 */
export const BreadcrumbItem = React.forwardRef<
  HTMLLIElement,
  BreadcrumbItemProps
>(({ 
  children, 
  href, 
  current = false, 
  onClick,
  className,
  ...props 
}, ref) => {
  const Content = href && !current ? 'a' : 'span'
  
  return (
    <li ref={ref} className={cn('flex items-center', className)} {...props}>
      <Content
        href={href}
        onClick={onClick}
        className={cn(
          'text-sm transition-colors hover:text-foreground',
          current
            ? 'text-foreground font-medium'
            : 'text-muted-foreground'
        )}
        aria-current={current ? 'page' : undefined}
      >
        {children}
      </Content>
    </li>
  )
})
BreadcrumbItem.displayName = 'BreadcrumbItem'

// Breadcrumb Separator Component
export interface BreadcrumbSeparatorProps {
  /** Custom separator */
  children?: React.ReactNode
  /** Additional CSS classes */
  className?: string
}

/**
 * BreadcrumbSeparator Component
 * 
 * Separator between breadcrumb items
 * 
 * @example
 * ```tsx
 * <BreadcrumbSeparator />
 * ```
 */
export const BreadcrumbSeparator = React.forwardRef<
  HTMLLIElement,
  BreadcrumbSeparatorProps
>(({ 
  children = <ChevronRight className="h-4 w-4" />, 
  className,
  ...props 
}, ref) => (
  <li 
    ref={ref} 
    className={cn('flex items-center text-muted-foreground', className)} 
    {...props}
  >
    {children}
  </li>
))
BreadcrumbSeparator.displayName = 'BreadcrumbSeparator'

// Breadcrumb Home Component
export interface BreadcrumbHomeProps {
  /** Home href */
  href?: string
  /** Click handler */
  onClick?: () => void
  /** Additional CSS classes */
  className?: string
}

/**
 * BreadcrumbHome Component
 * 
 * Home breadcrumb item with icon
 * 
 * @example
 * ```tsx
 * <BreadcrumbHome href="/home" />
 * ```
 */
export const BreadcrumbHome = React.forwardRef<
  HTMLLIElement,
  BreadcrumbHomeProps
>(({ 
  href = '/', 
  onClick,
  className,
  ...props 
}, ref) => (
  <li ref={ref} className={cn('flex items-center', className)} {...props}>
    <a
      href={href}
      onClick={onClick}
      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
    >
      <Home className="h-4 w-4" />
      <span className="sr-only">Home</span>
    </a>
  </li>
))
BreadcrumbHome.displayName = 'BreadcrumbHome'

// Main Breadcrumb Component
export interface BreadcrumbProps {
  /** Breadcrumb items */
  items?: Array<{
    label: React.ReactNode
    href?: string
    current?: boolean
    onClick?: () => void
  }>
  /** Whether to show home icon */
  showHome?: boolean
  /** Home href */
  homeHref?: string
  /** Custom separator */
  separator?: React.ReactNode
  /** Additional CSS classes */
  className?: string
  /** Breadcrumb content */
  children?: React.ReactNode
}

/**
 * Breadcrumb Component
 * 
 * Main breadcrumb navigation component
 * 
 * @example
 * ```tsx
 * <Breadcrumb 
 *   items={[
 *     { label: 'Home', href: '/' },
 *     { label: 'Products', href: '/products' },
 *     { label: 'Current Product', current: true }
 *   ]}
 * />
 * ```
 */
export const Breadcrumb = React.forwardRef<
  HTMLElement,
  BreadcrumbProps
>(({ 
  items = [],
  showHome = true,
  homeHref = '/',
  separator,
  className,
  children,
  ...props 
}, ref) => {
  const Separator = separator || <BreadcrumbSeparator />

  const renderItems = () => {
    const allItems = showHome 
      ? [{ label: <BreadcrumbHome href={homeHref} /> }, ...items]
      : items

    return allItems.map((item, index) => {
      const isLast = index === allItems.length - 1
      
      if (typeof item.label === 'string') {
        return (
          <React.Fragment key={index}>
            <BreadcrumbItem
              href={item.href}
              current={item.current || isLast}
              onClick={item.onClick}
            >
              {item.label}
            </BreadcrumbItem>
            {!isLast && Separator}
          </React.Fragment>
        )
      }
      
      return (
        <React.Fragment key={index}>
          {item.label}
          {!isLast && Separator}
        </React.Fragment>
      )
    })
  }

  return (
    <nav
      ref={ref}
      aria-label="Breadcrumb"
      className={cn('flex items-center space-x-1 text-sm', className)}
      {...props}
    >
      <ol className="flex items-center space-x-1">
        {children || renderItems()}
      </ol>
    </nav>
  )
})
Breadcrumb.displayName = 'Breadcrumb'

// Export types
export type { 
  BreadcrumbProps, 
  BreadcrumbItemProps, 
  BreadcrumbSeparatorProps, 
  BreadcrumbHomeProps 
}