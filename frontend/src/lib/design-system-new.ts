/**
 * DirectDriveX New Design System Utilities
 * Phase 1: Foundation Setup
 * 
 * This file contains utilities for the new design system with ds- prefix.
 * All utilities follow the design system rules and provide type-safe access
 * to design tokens and component utilities.
 */

import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

// Import types from design-system-types
import type {
  ButtonProps,
  ButtonVariant,
  ButtonSize,
  CardProps,
  CardHeaderProps,
  CardTitleProps,
  CardDescriptionProps,
  CardContentProps,
  CardFooterProps,
  CardVariant,
  InputProps,
  InputVariant,
  BadgeProps,
  BadgeVariant,
  BadgeSize,
  DesignSystemColor,
  DesignSystemSize,
  DesignSystemSpacing,
  DesignSystemTypography,
  DesignSystemFontWeight,
  DesignSystemShadow,
  DesignSystemAnimation
} from './design-system-types'

// Export types from design-system-types
export type {
  ButtonProps,
  ButtonVariant,
  ButtonSize,
  CardProps,
  CardHeaderProps,
  CardTitleProps,
  CardDescriptionProps,
  CardContentProps,
  CardFooterProps,
  CardVariant,
  InputProps,
  InputVariant,
  BadgeProps,
  BadgeVariant,
  BadgeSize,
  DesignSystemColor,
  DesignSystemSize,
  DesignSystemSpacing,
  DesignSystemTypography,
  DesignSystemFontWeight,
  DesignSystemShadow,
  DesignSystemAnimation
} from './design-system-types'

// =====================================
// UTILITY FUNCTIONS
// =====================================

/**
 * Design System class name utility with type safety
 * Similar to cn() but enforces design system rules
 */
export function dcn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Get CSS variable for design system color
 */
export function getColor(color: DesignSystemColor): string {
  return `hsl(var(--ds-${color}))`
}

/**
 * Get CSS variable for design system spacing
 */
export function getSpacing(spacing: DesignSystemSpacing): string {
  return `var(--ds-spacing-${spacing})`
}

/**
 * Get CSS variable for design system typography
 */
export function getTypography(size: DesignSystemTypography): string {
  return `var(--ds-typography-${size})`
}

/**
 * Get CSS variable for design system font weight
 */
export function getFontWeight(weight: DesignSystemFontWeight): string {
  return `var(--ds-font-weight-${weight})`
}

/**
 * Get CSS variable for design system shadow
 */
export function getShadow(shadow: DesignSystemShadow): string {
  return `var(--ds-shadow-${shadow})`
}

/**
 * Get CSS variable for design system animation duration
 */
export function getAnimationDuration(duration: DesignSystemAnimation): string {
  return `var(--ds-animation-${duration})`
}

/**
 * Get CSS variable for design system border radius
 */
export function getRadius(): string {
  return `var(--ds-radius)`
}

// =====================================
// COMPONENT CLASS GENERATORS
// =====================================

/**
 * Generate classes for Button component
 */
export function getButtonClasses(
  variant: ButtonVariant = 'primary',
  size: ButtonSize = 'default',
  disabled = false,
  className?: string
): string {
  const baseClasses = [
    'ds-btn-base',
    'inline-flex',
    'items-center',
    'justify-center',
    'whitespace-nowrap',
    'rounded-md',
    'text-sm',
    'font-medium',
    'transition-colors',
    'focus-visible:outline-none',
    'focus-visible:ring-2',
    'focus-visible:ring-ring',
    'focus-visible:ring-offset-2',
    'disabled:pointer-events-none',
    'disabled:opacity-50'
  ]

  const variantClasses = {
    primary: [
      'bg-primary',
      'text-primary-foreground',
      'hover:bg-primary/90'
    ],
    secondary: [
      'bg-secondary',
      'text-secondary-foreground',
      'hover:bg-secondary/80'
    ],
    destructive: [
      'bg-destructive',
      'text-destructive-foreground',
      'hover:bg-destructive/90'
    ],
    outline: [
      'border',
      'border-input',
      'bg-background',
      'hover:bg-accent',
      'hover:text-accent-foreground'
    ],
    ghost: [
      'hover:bg-accent',
      'hover:text-accent-foreground'
    ],
    link: [
      'text-primary',
      'underline-offset-4',
      'hover:underline'
    ]
  }

  const sizeClasses = {
    xs: ['h-7', 'px-2', 'text-xs'],
    sm: ['h-8', 'px-3', 'text-sm'],
    default: ['h-9', 'px-4', 'text-sm'],
    lg: ['h-10', 'px-6', 'text-base'],
    xl: ['h-11', 'px-8', 'text-lg'],
    icon: ['h-9', 'w-9']
  }

  return dcn(
    ...baseClasses,
    ...variantClasses[variant],
    ...sizeClasses[size],
    className
  )
}

/**
 * Generate classes for Card component
 */
export function getCardClasses(
  variant: CardVariant = 'default',
  className?: string
): string {
  const baseClasses = [
    'ds-card-base',
    'rounded-lg',
    'border',
    'bg-card',
    'text-card-foreground',
    'shadow-sm'
  ]

  const variantClasses = {
    default: [],
    outlined: ['border-2'],
    elevated: ['shadow-lg'],
    filled: ['bg-accent/50']
  }

  return dcn(
    ...baseClasses,
    ...variantClasses[variant],
    className
  )
}

/**
 * Generate classes for Input component
 */
export function getInputClasses(
  variant: InputVariant = 'default',
  error = false,
  className?: string
): string {
  const baseClasses = [
    'ds-input-base',
    'flex',
    'h-9',
    'w-full',
    'rounded-md',
    'border',
    'border-input',
    'bg-background',
    'px-3',
    'py-1',
    'text-sm',
    'shadow-sm',
    'transition-colors',
    'file:border-0',
    'file:bg-transparent',
    'file:text-sm',
    'file:font-medium',
    'placeholder:text-muted-foreground',
    'focus-visible:outline-none',
    'focus-visible:ring-2',
    'focus-visible:ring-ring',
    'focus-visible:ring-offset-2',
    'disabled:cursor-not-allowed',
    'disabled:opacity-50'
  ]

  const variantClasses = {
    default: [],
    filled: ['bg-accent/50'],
    outlined: ['border-2']
  }

  const stateClasses = error 
    ? ['border-destructive', 'focus-visible:ring-destructive']
    : []

  return dcn(
    ...baseClasses,
    ...variantClasses[variant],
    ...stateClasses,
    className
  )
}

/**
 * Generate classes for Badge component
 */
export function getBadgeClasses(
  variant: BadgeVariant = 'default',
  size: BadgeSize = 'default',
  className?: string
): string {
  const baseClasses = [
    'ds-badge-base',
    'inline-flex',
    'items-center',
    'rounded-full',
    'border',
    'px-2.5',
    'py-0.5',
    'text-xs',
    'font-semibold',
    'transition-colors',
    'focus:outline-none',
    'focus:ring-2',
    'focus:ring-ring',
    'focus:ring-offset-2'
  ]

  const variantClasses = {
    default: [
      'border-transparent',
      'bg-primary',
      'text-primary-foreground',
      'hover:bg-primary/80'
    ],
    secondary: [
      'border-transparent',
      'bg-secondary',
      'text-secondary-foreground',
      'hover:bg-secondary/80'
    ],
    destructive: [
      'border-transparent',
      'bg-destructive',
      'text-destructive-foreground',
      'hover:bg-destructive/80'
    ],
    outline: [
      'text-foreground'
    ]
  }

  const sizeClasses = {
    xs: ['px-1.5', 'py-0.5', 'text-xs'],
    sm: ['px-2', 'py-1', 'text-xs'],
    default: ['px-2.5', 'py-0.5', 'text-xs'],
    lg: ['px-3', 'py-1', 'text-sm'],
    xl: ['px-4', 'py-1.5', 'text-sm']
  }

  return dcn(
    ...baseClasses,
    ...variantClasses[variant],
    ...sizeClasses[size],
    className
  )
}

// =====================================
// LAYOUT UTILITIES
// =====================================

/**
 * Generate classes for Container component
 */
export function getContainerClasses(
  size: DesignSystemSize = 'lg',
  className?: string
): string {
  const sizeClasses = {
    xs: ['max-w-xs'],
    sm: ['max-w-sm'],
    md: ['max-w-md'],
    lg: ['max-w-4xl'],
    xl: ['max-w-6xl'],
    '2xl': ['max-w-7xl']
  }

  return dcn(
    'mx-auto',
    'px-4',
    'sm:px-6',
    'lg:px-8',
    ...sizeClasses[size],
    className
  )
}

/**
 * Generate classes for Grid component
 */
export function getGridClasses(
  cols: number = 12,
  gap: DesignSystemSpacing = 'md',
  className?: string
): string {
  return dcn(
    'grid',
    `grid-cols-${cols}`,
    `gap-${gap}`,
    className
  )
}

// =====================================
// ANIMATION UTILITIES
// =====================================

/**
 * Generate classes for animations
 */
export function getAnimationClasses(
  animation: DesignSystemAnimation = 'normal',
  className?: string
): string {
  const animationClasses = {
    none: [],
    fast: ['duration-200'],
    normal: ['duration-300'],
    slow: ['duration-500']
  }

  return dcn(
    'transition-all',
    'ease-in-out',
    ...animationClasses[animation],
    className
  )
}

// =====================================
// RESPONSIVE UTILITIES
// =====================================

/**
 * Generate responsive classes
 */
export function getResponsiveClasses(
  breakpoint: DesignSystemSize = 'md',
  className?: string
): string {
  const breakpointClasses = {
    xs: ['sm:'],
    sm: ['sm:'],
    md: ['md:'],
    lg: ['lg:'],
    xl: ['xl:'],
    '2xl': ['2xl:']
  }

  return dcn(
    ...breakpointClasses[breakpoint].map(bp => `${bp}${className}`),
    className
  )
}

// =====================================
// THEME UTILITIES
// =====================================

/**
 * Check if dark mode is active
 */
export function isDarkMode(): boolean {
  if (typeof window === 'undefined') return false
  return document.documentElement.classList.contains('dark')
}

/**
 * Get theme-aware color
 */
export function getThemeColor(lightColor: DesignSystemColor, darkColor: DesignSystemColor): string {
  return isDarkMode() ? getColor(darkColor) : getColor(lightColor)
}

// =====================================
// ACCESSIBILITY UTILITIES
// =====================================

/**
 * Generate ARIA attributes for accessibility
 */
export function getAriaAttributes(
  label?: string,
  describedBy?: string,
  role?: string
): Record<string, string> {
  const attrs: Record<string, string> = {}
  
  if (label) attrs['aria-label'] = label
  if (describedBy) attrs['aria-describedby'] = describedBy
  if (role) attrs['role'] = role
  
  return attrs
}

/**
 * Generate focus management classes
 */
export function getFocusClasses(
  ring = true,
  offset = true
): string {
  const classes = [
    'focus:outline-none',
    'focus-visible:outline-none'
  ]

  if (ring) classes.push('focus-visible:ring-2')
  if (offset) classes.push('focus-visible:ring-offset-2')

  return dcn(...classes)
}