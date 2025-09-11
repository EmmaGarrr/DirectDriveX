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

// Form Components
export { Label } from './label'
export { Textarea } from './textarea'
export { Select, SelectTrigger, SelectValue, SelectContent, SelectItem, SelectLabel, SelectSeparator, SelectScrollUpButton, SelectScrollDownButton } from './select'
export { Checkbox, CheckboxGroup } from './checkbox'
export { RadioGroup, RadioGroupItem } from './radio-group'

// Feedback Components
export { Badge } from './badge'
export { Alert, AlertDescription, AlertTitle } from './alert'
export { Progress, LoadingSpinner, Skeleton } from './progress'

// Toast Components - Coming soon
// export { Toast, ToastProvider, ToastViewport, ToastTitle, ToastDescription } from './toast'

// Navigation Components
export { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from './tabs'

export { 
  Breadcrumb, 
  BreadcrumbItem, 
  BreadcrumbSeparator, 
  BreadcrumbHome 
} from './breadcrumb'

export { 
  Pagination, 
  PaginationItem, 
  PaginationEllipsis, 
  PaginationPrevious, 
  PaginationNext, 
  PaginationContent 
} from './pagination'

// Navigation Menu Components - Coming soon
// export { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger } from './navigation-menu'

// Layout Components - Coming soon
// export { Separator } from './separator'
// export { Divider } from './divider'
// export { Container } from './container'
// export { Grid } from './grid'

// Modal Components
export { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogFooter, 
  DialogTitle, 
  DialogDescription, 
  DialogTrigger, 
  DialogClose, 
  DialogOverlay 
} from './dialog'

export { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetFooter, 
  SheetTitle, 
  SheetDescription, 
  SheetTrigger, 
  SheetClose, 
  SheetOverlay 
} from './sheet'

// Data Display Components
export { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow, 
  TableFooter, 
  TableCaption, 
  TableCheckbox, 
  TableEmptyState, 
  TableLoadingState 
} from './table'

// Interactive Components - Coming soon
// export { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './dialog'
// export { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from './sheet'
// export { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './tooltip'
// export { Popover, PopoverContent, PopoverTrigger } from './popover'

// Utility Components - Coming soon
// export { LoadingSpinner } from './loading-spinner'
// export { EmptyState } from './empty-state'
// export { ErrorState } from './error-state'

// File Management Components
export { 
  FileUploadZone, 
  FileCard, 
  FileGrid 
} from './file-upload'

// Admin Panel Components
export { 
  StatCard, 
  ActivityFeed, 
  QuickActions, 
  SystemStatus, 
  AdminTable 
} from './admin-panel'

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

export type {
  BadgeProps,
  BadgeVariant
} from './badge'

export type {
  AlertProps,
  AlertVariant
} from './alert'

export type {
  ProgressProps,
  LoadingSpinnerProps,
  SkeletonProps
} from './progress'

export type {
  TabsProps,
  TabsListProps,
  TabsTriggerProps,
  TabsContentProps
} from './tabs'

export type {
  BreadcrumbProps,
  BreadcrumbItemProps,
  BreadcrumbSeparatorProps,
  BreadcrumbHomeProps
} from './breadcrumb'

export type {
  PaginationProps,
  PaginationItemProps,
  PaginationEllipsisProps,
  PaginationPreviousProps,
  PaginationNextProps,
  PaginationContentProps
} from './pagination'

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
} from './dialog'

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
} from './sheet'

export type {
  TableProps,
  TableHeaderProps,
  TableBodyProps,
  TableFooterProps,
  TableRowProps,
  TableHeadProps,
  TableCellProps,
  TableCaptionProps,
  TableCheckboxProps,
  TableEmptyStateProps,
  TableLoadingStateProps
} from './table'

export type {
  FileUploadZoneProps,
  FileCardProps,
  FileGridProps,
  UploadedFile,
  FileType
} from './file-upload'

export type {
  StatCardProps,
  ActivityFeedProps,
  ActivityItem,
  QuickActionsProps,
  QuickAction,
  SystemStatusProps,
  SystemStatus,
  AdminTableProps,
  AdminTableColumn
} from './admin-panel'

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