/**
 * DirectDriveX New Design System Types
 * Phase 1: Foundation Setup
 * 
 * This file contains all TypeScript types and interfaces for the new design system.
 * All types follow the design system rules and provide type safety for components.
 */

import React from 'react'

// =====================================
// BASE DESIGN TOKEN TYPES
// =====================================

export type DesignSystemColor = 
  | 'primary'
  | 'secondary'
  | 'accent'
  | 'destructive'
  | 'muted'
  | 'background'
  | 'foreground'
  | 'card'
  | 'card-foreground'
  | 'popover'
  | 'popover-foreground'
  | 'border'
  | 'input'
  | 'ring'
  | 'chart-1'
  | 'chart-2'
  | 'chart-3'
  | 'chart-4'
  | 'chart-5'

export type DesignSystemSize = 
  | 'xs'
  | 'sm'
  | 'md'
  | 'lg'
  | 'xl'
  | '2xl'

export type DesignSystemSpacing = 
  | 'xs'
  | 'sm'
  | 'md'
  | 'lg'
  | 'xl'
  | '2xl'

export type DesignSystemTypography = 
  | 'xs'
  | 'sm'
  | 'base'
  | 'lg'
  | 'xl'
  | '2xl'
  | '3xl'
  | '4xl'
  | '5xl'

export type DesignSystemFontWeight = 
  | 'light'
  | 'normal'
  | 'medium'
  | 'semibold'
  | 'bold'
  | 'extrabold'

export type DesignSystemShadow = 
  | 'sm'
  | 'md'
  | 'lg'
  | 'xl'

export type DesignSystemAnimation = 
  | 'fast'
  | 'normal'
  | 'slow'

// =====================================
// COMPONENT PROP TYPES
// =====================================

// Button Component Types
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Button style variant */
  variant?: ButtonVariant
  /** Button size */
  size?: ButtonSize
  /** Whether the button is disabled */
  disabled?: boolean
  /** Whether the button is in loading state */
  loading?: boolean
  /** Button content */
  children: React.ReactNode
  /** Additional CSS classes */
  className?: string
  /** Left icon */
  leftIcon?: React.ReactNode
  /** Right icon */
  rightIcon?: React.ReactNode
}

export type ButtonVariant = 
  | 'primary'
  | 'secondary'
  | 'destructive'
  | 'outline'
  | 'ghost'
  | 'link'

export type ButtonSize = 
  | 'sm'
  | 'default'
  | 'lg'

// Card Component Types
export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Card style variant */
  variant?: CardVariant
  /** Whether the card is interactive */
  interactive?: boolean
  /** Whether the card is selected */
  selected?: boolean
  /** Additional CSS classes */
  className?: string
  /** Card content */
  children: React.ReactNode
}

export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Additional CSS classes */
  className?: string
  /** Header content */
  children: React.ReactNode
}

export interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  /** Title level */
  level?: 1 | 2 | 3 | 4 | 5 | 6
  /** Additional CSS classes */
  className?: string
  /** Title content */
  children: React.ReactNode
}

export interface CardDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {
  /** Additional CSS classes */
  className?: string
  /** Description content */
  children: React.ReactNode
}

export interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Additional CSS classes */
  className?: string
  /** Content */
  children: React.ReactNode
}

export interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Additional CSS classes */
  className?: string
  /** Footer content */
  children: React.ReactNode
}

export type CardVariant = 
  | 'default'
  | 'outlined'
  | 'elevated'

// Input Component Types
export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /** Input style variant */
  variant?: InputVariant
  /** Input type */
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search'
  /** Whether the input has an error */
  error?: boolean
  /** Whether the input is disabled */
  disabled?: boolean
  /** Whether the input is read-only */
  readOnly?: boolean
  /** Whether the input is required */
  required?: boolean
  /** Input placeholder */
  placeholder?: string
  /** Input value */
  value?: string | number
  /** Input change handler */
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void
  /** Additional CSS classes */
  className?: string
  /** Left icon */
  leftIcon?: React.ReactNode
  /** Right icon */
  rightIcon?: React.ReactNode
}

export type InputVariant = 
  | 'default'
  | 'filled'
  | 'outlined'

// Badge Component Types
export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Badge style variant */
  variant?: BadgeVariant
  /** Badge size */
  size?: BadgeSize
  /** Whether the badge is rounded */
  rounded?: boolean
  /** Additional CSS classes */
  className?: string
  /** Badge content */
  children: React.ReactNode
}

export type BadgeVariant = 
  | 'default'
  | 'secondary'
  | 'destructive'
  | 'outline'

export type BadgeSize = 
  | 'sm'
  | 'default'
  | 'lg'

// Alert Component Types
export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Alert style variant */
  variant?: AlertVariant
  /** Whether the alert has an icon */
  hasIcon?: boolean
  /** Whether the alert is dismissible */
  dismissible?: boolean
  /** Dismiss handler */
  onDismiss?: () => void
  /** Additional CSS classes */
  className?: string
  /** Alert content */
  children: React.ReactNode
}

export interface AlertTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  /** Additional CSS classes */
  className?: string
  /** Title content */
  children: React.ReactNode
}

export interface AlertDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {
  /** Additional CSS classes */
  className?: string
  /** Description content */
  children: React.ReactNode
}

export type AlertVariant = 
  | 'default'
  | 'destructive'
  | 'warning'
  | 'info'
  | 'success'

// =====================================
// LAYOUT COMPONENT TYPES
// =====================================

export interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Container size */
  size?: DesignSystemSize
  /** Whether the container is fluid */
  fluid?: boolean
  /** Additional CSS classes */
  className?: string
  /** Container content */
  children: React.ReactNode
}

export interface GridProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Number of columns */
  cols?: number
  /** Grid gap */
  gap?: DesignSystemSpacing
  /** Whether the grid is responsive */
  responsive?: boolean
  /** Additional CSS classes */
  className?: string
  /** Grid content */
  children: React.ReactNode
}

export interface GridItemProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Column span */
  colSpan?: number
  /** Row span */
  rowSpan?: number
  /** Column start */
  colStart?: number
  /** Column end */
  colEnd?: number
  /** Additional CSS classes */
  className?: string
  /** Grid item content */
  children: React.ReactNode
}

// =====================================
// UTILITY COMPONENT TYPES
// =====================================

export interface LoadingSpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Spinner size */
  size?: DesignSystemSize
  /** Spinner color */
  color?: DesignSystemColor
  /** Whether the spinner is visible */
  visible?: boolean
  /** Additional CSS classes */
  className?: string
}

export interface EmptyStateProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  /** Empty state title */
  title: React.ReactNode
  /** Empty state description */
  description?: React.ReactNode
  /** Empty state icon */
  icon?: React.ReactNode
  /** Empty state action */
  action?: React.ReactNode
  /** Additional CSS classes */
  className?: string
}

export interface ErrorStateProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  /** Error state title */
  title: React.ReactNode
  /** Error state description */
  description?: React.ReactNode
  /** Error state action */
  action?: React.ReactNode
  /** Error details */
  error?: Error | string
  /** Additional CSS classes */
  className?: string
}

// =====================================
// FORM COMPONENT TYPES
// =====================================

export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  /** Whether the label is required */
  required?: boolean
  /** Whether the label is disabled */
  disabled?: boolean
  /** Form control id */
  htmlFor?: string
  /** Additional CSS classes */
  className?: string
  /** Label content */
  children: React.ReactNode
}

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  /** Textarea style variant */
  variant?: InputVariant
  /** Whether the textarea has an error */
  error?: boolean
  /** Whether the textarea is disabled */
  disabled?: boolean
  /** Whether the textarea is read-only */
  readOnly?: boolean
  /** Whether the textarea is required */
  required?: boolean
  /** Textarea placeholder */
  placeholder?: string
  /** Textarea value */
  value?: string
  /** Textarea change handler */
  onChange?: (event: React.ChangeEvent<HTMLTextAreaElement>) => void
  /** Maximum number of characters */
  maxLength?: number
  /** Minimum number of rows */
  minRows?: number
  /** Maximum number of rows */
  maxRows?: number
  /** Additional CSS classes */
  className?: string
}

// =====================================
// ANIMATION TYPES
// =====================================

export interface AnimationProps {
  /** Animation type */
  type: 'fade' | 'slide' | 'scale' | 'bounce'
  /** Animation duration */
  duration?: DesignSystemAnimation
  /** Animation delay */
  delay?: string
  /** Whether the animation repeats */
  repeat?: boolean
  /** Animation direction */
  direction?: 'normal' | 'reverse' | 'alternate' | 'alternate-reverse'
}

// =====================================
// THEME TYPES
// =====================================

export type ThemeMode = 'light' | 'dark' | 'system'

export interface ThemeContextType {
  /** Current theme mode */
  mode: ThemeMode
  /** Whether dark mode is active */
  isDark: boolean
  /** Set theme mode */
  setMode: (mode: ThemeMode) => void
  /** Toggle between light and dark mode */
  toggleMode: () => void
}

// =====================================
// ACCESSIBILITY TYPES
// =====================================

export interface AriaAttributes {
  'aria-label'?: string
  'aria-labelledby'?: string
  'aria-describedby'?: string
  'aria-expanded'?: boolean
  'aria-pressed'?: boolean
  'aria-selected'?: boolean
  'aria-checked'?: boolean
  'aria-disabled'?: boolean
  'aria-required'?: boolean
  'aria-invalid'?: boolean
  'aria-hidden'?: boolean
  'aria-modal'?: boolean
  'aria-busy'?: boolean
  'aria-live'?: 'off' | 'polite' | 'assertive'
  'aria-atomic'?: boolean
  'aria-relevant'?: 'additions' | 'removals' | 'text' | 'all'
}

export interface FocusManagementProps {
  /** Whether the element is focusable */
  focusable?: boolean
  /** Focus order */
  tabIndex?: number
  /** Focus handler */
  onFocus?: (event: React.FocusEvent) => void
  /** Blur handler */
  onBlur?: (event: React.FocusEvent) => void
  /** Whether to show focus ring */
  showFocusRing?: boolean
}

// =====================================
// RESPONSIVE TYPES
// =====================================

export interface ResponsiveProps {
  /** Responsive breakpoints */
  breakpoints?: {
    sm?: string
    md?: string
    lg?: string
    xl?: string
    '2xl'?: string
  }
  /** Whether the component is responsive */
  responsive?: boolean
  /** Default value for non-responsive view */
  defaultValue?: string
}

// =====================================
// EVENT HANDLER TYPES
// =====================================

export interface EventHandlerProps {
  /** Click handler */
  onClick?: (event: React.MouseEvent) => void
  /** Double click handler */
  onDoubleClick?: (event: React.MouseEvent) => void
  /** Mouse enter handler */
  onMouseEnter?: (event: React.MouseEvent) => void
  /** Mouse leave handler */
  onMouseLeave?: (event: React.MouseEvent) => void
  /** Key down handler */
  onKeyDown?: (event: React.KeyboardEvent) => void
  /** Key up handler */
  onKeyUp?: (event: React.KeyboardEvent) => void
  /** Focus handler */
  onFocus?: (event: React.FocusEvent) => void
  /** Blur handler */
  onBlur?: (event: React.FocusEvent) => void
  /** Change handler */
  onChange?: (event: React.ChangeEvent) => void
  /** Submit handler */
  onSubmit?: (event: React.FormEvent) => void
}

// =====================================
// UTILITY TYPES
// =====================================

export type OmitProps<T, K extends keyof T> = Omit<T, K>
export type MergeProps<T, U> = T & U
export type RequiredProps<T, K extends keyof T> = T & Required<Pick<T, K>>

export type SizeClass<T> = {
  [K in DesignSystemSize]?: T
}

export type VariantClass<T> = {
  [K in string]?: T
}

export type StateClass<T> = {
  disabled?: T
  error?: T
  loading?: T
  selected?: T
  focused?: T
  hovered?: T
  active?: T
}

