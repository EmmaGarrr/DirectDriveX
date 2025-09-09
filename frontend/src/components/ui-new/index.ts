/**
 * DirectDriveX New Design System Components
 * Phase 1: Foundation Setup
 * 
 * This file exports all new design system components with ds- prefix.
 * All components follow the design system rules and provide type-safe,
 * accessible, and responsive implementations.
 */

// Core Components
export { Button } from './button'
export { Card, CardHeader, CardContent, CardFooter, CardTitle, CardDescription } from './card'
export { Input } from './input'

// Form Components - Coming soon
// export { Label } from './label'
// export { Textarea } from './textarea'
// export { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select'
// export { Checkbox } from './checkbox'
// export { RadioGroup, RadioGroupItem } from './radio-group'

// Feedback Components - Coming soon
// export { Badge } from './badge'
// export { Alert, AlertDescription, AlertTitle } from './alert'
// export { Toast, ToastProvider, ToastViewport, ToastTitle, ToastDescription } from './toast'

// Navigation Components - Coming soon
// export { Tabs, TabsContent, TabsList, TabsTrigger } from './tabs'
// export { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger } from './navigation-menu'

// Layout Components - Coming soon
// export { Separator } from './separator'
// export { Divider } from './divider'
// export { Container } from './container'
// export { Grid } from './grid'

// Data Display Components - Coming soon
// export { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './table'
// export { Skeleton } from './skeleton'
// export { Progress } from './progress'

// Interactive Components - Coming soon
// export { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './dialog'
// export { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from './sheet'
// export { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './tooltip'
// export { Popover, PopoverContent, PopoverTrigger } from './popover'

// Utility Components - Coming soon
// export { LoadingSpinner } from './loading-spinner'
// export { EmptyState } from './empty-state'
// export { ErrorState } from './error-state'

// Type exports
export type {
  ButtonProps,
  ButtonVariant,
  ButtonSize
} from './button'

export type {
  CardProps,
  CardVariant
} from './card'

export type {
  InputProps,
  InputVariant
} from './input'

// export type {
//   BadgeProps,
//   BadgeVariant
// } from './badge'

// export type {
//   AlertProps,
//   AlertVariant
// } from './alert'

// Re-export design system utilities for convenience
export {
  // Core utilities
  dcn,
  getColor,
  getSpacing,
  getTypography,
  getFontWeight,
  getShadow,
  getAnimationDuration,
  getRadius,

  // Component utilities
  getButtonClasses,
  getCardClasses,
  getInputClasses,
  getBadgeClasses,

  // Layout utilities
  getContainerClasses,
  getGridClasses,

  // Animation utilities
  getAnimationClasses,

  // Responsive utilities
  getResponsiveClasses,

  // Theme utilities
  isDarkMode,
  getThemeColor,

  // Accessibility utilities
  getAriaAttributes,
  getFocusClasses,

  // Types
  type DesignSystemColor,
  type DesignSystemSize,
  type DesignSystemSpacing,
  type DesignSystemTypography,
  type DesignSystemFontWeight,
  type DesignSystemShadow,
  type DesignSystemAnimation,
  type ButtonVariant as DSButtonVariant,
  type ButtonSize as DSButtonSize,
  type CardVariant as DSCardVariant,
  type InputVariant as DSInputVariant,
  type BadgeVariant as DSBadgeVariant
} from '@/lib/design-system-new'