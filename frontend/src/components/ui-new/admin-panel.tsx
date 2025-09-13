/**
 * DirectDriveX Admin Panel Components
 * Part of the new design system with ds- prefix
 * 
 * Admin panel components for dashboards and management interfaces
 * Following the design system rules and accessibility guidelines
 */

import React from 'react'
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  FileText, 
  Download, 
  Upload, 
  Activity,
  DollarSign,
  ShoppingCart,
  Eye,
  MousePointer,
  BarChart3,
  PieChart,
  Target,
  Zap,
  AlertTriangle,
  CheckCircle,
  Clock,
  MoreHorizontal
} from 'lucide-react'
import { cn } from '@/lib/utils'

// Stat Card Component
export interface StatCardProps {
  /** Title of the stat */
  title: string
  /** Main value */
  value: string | number
  /** Change value */
  change?: {
    value: number
    type: 'increase' | 'decrease'
    label?: string
  }
  /** Icon */
  icon?: React.ReactNode
  /** Description */
  description?: string
  /** Additional CSS classes */
  className?: string
  /** Click handler */
  onClick?: () => void
}

/**
 * StatCard Component
 * 
 * Statistics card for displaying key metrics
 * 
 * @example
 * ```tsx
 * <StatCard 
 *   title="Total Users"
 *   value="1,234"
 *   change={{ value: 12, type: 'increase', label: 'vs last month' }}
 *   icon={<Users className="h-4 w-4" />}
 * />
 * ```
 */
export const StatCard = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & StatCardProps
>(({ 
  title,
  value,
  change,
  icon,
  description,
  className,
  onClick,
  ...props 
}, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        'bg-card border rounded-lg p-6 hover:shadow-md transition-shadow',
        onClick && 'cursor-pointer',
        className
      )}
      onClick={onClick}
      {...props}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
        {icon && (
          <div className="p-2 bg-primary/10 rounded-lg">
            {icon}
          </div>
        )}
      </div>
      
      <div className="space-y-2">
        <div className="text-2xl font-bold">{value}</div>
        
        {change && (
          <div className="flex items-center space-x-2">
            <div className={cn(
              'flex items-center space-x-1 text-sm',
              change.type === 'increase' ? 'text-green-600' : 'text-red-600'
            )}>
              {change.type === 'increase' ? (
                <TrendingUp className="h-4 w-4" />
              ) : (
                <TrendingDown className="h-4 w-4" />
              )}
              <span>{Math.abs(change.value)}%</span>
            </div>
            {change.label && (
              <span className="text-sm text-muted-foreground">{change.label}</span>
            )}
          </div>
        )}
        
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
    </div>
  )
})
StatCard.displayName = 'StatCard'

// Activity Feed Component
export interface ActivityItem {
  id: string
  type: 'user' | 'file' | 'system' | 'security' | 'success' | 'warning' | 'error'
  title: string
  description?: string
  timestamp: string | Date
  user?: {
    name: string
    avatar?: string
  }
  icon?: React.ReactNode
}

export interface ActivityFeedProps {
  /** Activity items */
  items: ActivityItem[]
  /** Maximum items to show */
  maxItems?: number
  /** Show timestamps */
  showTimestamps?: boolean
  /** Show user info */
  showUsers?: boolean
  /** Additional CSS classes */
  className?: string
}

/**
 * ActivityFeed Component
 * 
 * Activity feed for displaying recent actions and events
 * 
 * @example
 * ```tsx
 * <ActivityFeed 
 *   items={activities}
 *   maxItems={5}
 *   showTimestamps={true}
 *   showUsers={true}
 * />
 * ```
 */
export const ActivityFeed = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & ActivityFeedProps
>(({ 
  items,
  maxItems = 10,
  showTimestamps = true,
  showUsers = true,
  className,
  ...props 
}, ref) => {
  const getActivityIcon = (type: ActivityItem['type']) => {
    const iconClasses = 'h-4 w-4'
    switch (type) {
      case 'user': return <Users className={cn(iconClasses, 'text-blue-500')} />
      case 'file': return <FileText className={cn(iconClasses, 'text-green-500')} />
      case 'system': return <Activity className={cn(iconClasses, 'text-purple-500')} />
      case 'security': return <AlertTriangle className={cn(iconClasses, 'text-orange-500')} />
      case 'success': return <CheckCircle className={cn(iconClasses, 'text-green-500')} />
      case 'warning': return <AlertTriangle className={cn(iconClasses, 'text-yellow-500')} />
      case 'error': return <AlertTriangle className={cn(iconClasses, 'text-red-500')} />
      default: return <Activity className={cn(iconClasses, 'text-gray-500')} />
    }
  }

  const formatTimestamp = (timestamp: string | Date) => {
    const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    
    if (diff < 60000) return 'Just now'
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`
    if (diff < 604800000) return `${Math.floor(diff / 86400000)}d ago`
    
    return date.toLocaleDateString()
  }

  const displayItems = items.slice(0, maxItems)

  return (
    <div ref={ref} className={cn('space-y-4', className)} {...props}>
      {displayItems.map((item) => (
        <div key={item.id} className="flex items-start space-x-3 p-3 bg-muted/30 rounded-lg">
          <div className="flex-shrink-0 mt-0.5">
            {item.icon || getActivityIcon(item.type)}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium truncate">{item.title}</h4>
              {showTimestamps && (
                <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                  {formatTimestamp(item.timestamp)}
                </span>
              )}
            </div>
            
            {item.description && (
              <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
            )}
            
            {showUsers && item.user && (
              <div className="flex items-center space-x-2 mt-2">
                {item.user.avatar ? (
                  <img 
                    src={item.user.avatar} 
                    alt={item.user.name}
                    className="h-6 w-6 rounded-full"
                  />
                ) : (
                  <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-xs font-medium">
                      {item.user.name.charAt(0)}
                    </span>
                  </div>
                )}
                <span className="text-xs text-muted-foreground">{item.user.name}</span>
              </div>
            )}
          </div>
        </div>
      ))}
      
      {items.length > maxItems && (
        <div className="text-center pt-2">
          <button className="text-sm text-primary hover:underline">
            View all {items.length} activities
          </button>
        </div>
      )}
    </div>
  )
})
ActivityFeed.displayName = 'ActivityFeed'

// Quick Actions Component
export interface QuickAction {
  id: string
  title: string
  description?: string
  icon: React.ReactNode
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger'
  onClick?: () => void
  disabled?: boolean
}

export interface QuickActionsProps {
  /** Quick actions */
  actions: QuickAction[]
  /** Layout direction */
  direction?: 'horizontal' | 'vertical'
  /** Additional CSS classes */
  className?: string
}

/**
 * QuickActions Component
 * 
 * Quick action buttons for common admin tasks
 * 
 * @example
 * ```tsx
 * <QuickActions 
 *   actions={[
 *     { id: 'add-user', title: 'Add User', icon: <Users />, onClick: addUser },
 *     { id: 'export', title: 'Export Data', icon: <Download />, onClick: exportData }
 *   ]}
 *   direction="horizontal"
 * />
 * ```
 */
export const QuickActions = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & QuickActionsProps
>(({ 
  actions,
  direction = 'horizontal',
  className,
  ...props 
}, ref) => {
  const variantClasses = {
    default: 'bg-muted hover:bg-muted/80 text-muted-foreground',
    primary: 'bg-primary hover:bg-primary/90 text-primary-foreground',
    success: 'bg-green-500 hover:bg-green-600 text-white',
    warning: 'bg-yellow-500 hover:bg-yellow-600 text-white',
    danger: 'bg-red-500 hover:bg-red-600 text-white'
  }

  const layoutClasses = {
    horizontal: 'flex flex-wrap gap-3',
    vertical: 'space-y-3'
  }

  return (
    <div
      ref={ref}
      className={cn(
        layoutClasses[direction],
        className
      )}
      {...props}
    >
      {actions.map((action) => (
        <button
          key={action.id}
          onClick={action.onClick}
          disabled={action.disabled}
          className={cn(
            'flex items-center space-x-3 p-4 rounded-lg transition-colors',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            variantClasses[action.variant || 'default']
          )}
        >
          <div className="flex-shrink-0">
            {action.icon}
          </div>
          <div className="text-left">
            <div className="font-medium text-sm">{action.title}</div>
            {action.description && (
              <div className="text-xs opacity-80">{action.description}</div>
            )}
          </div>
        </button>
      ))}
    </div>
  )
})
QuickActions.displayName = 'QuickActions'

// System Status Component
export interface SystemStatus {
  id: string
  name: string
  status: 'operational' | 'degraded' | 'outage' | 'maintenance'
  description?: string
  lastUpdated: string | Date
  metrics?: {
    label: string
    value: string
    trend?: 'up' | 'down' | 'stable'
  }[]
}

export interface SystemStatusProps {
  /** System status items */
  systems: SystemStatus[]
  /** Show detailed metrics */
  showMetrics?: boolean
  /** Additional CSS classes */
  className?: string
}

/**
 * SystemStatus Component
 * 
 * System status overview for monitoring services
 * 
 * @example
 * ```tsx
 * <SystemStatus 
 *   systems={systemStatuses}
 *   showMetrics={true}
 * />
 * ```
 */
export const SystemStatus = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & SystemStatusProps
>(({ 
  systems,
  showMetrics = false,
  className,
  ...props 
}, ref) => {
  const getStatusColor = (status: SystemStatus['status']) => {
    switch (status) {
      case 'operational': return 'text-green-600 bg-green-100'
      case 'degraded': return 'text-yellow-600 bg-yellow-100'
      case 'outage': return 'text-red-600 bg-red-100'
      case 'maintenance': return 'text-blue-600 bg-blue-100'
    }
  }

  const getStatusIcon = (status: SystemStatus['status']) => {
    const iconClasses = 'h-4 w-4'
    switch (status) {
      case 'operational': return <CheckCircle className={cn(iconClasses, 'text-green-600')} />
      case 'degraded': return <AlertTriangle className={cn(iconClasses, 'text-yellow-600')} />
      case 'outage': return <AlertTriangle className={cn(iconClasses, 'text-red-600')} />
      case 'maintenance': return <Clock className={cn(iconClasses, 'text-blue-600')} />
    }
  }

  const formatTimestamp = (timestamp: string | Date) => {
    const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp
    return date.toLocaleString()
  }

  return (
    <div ref={ref} className={cn('space-y-4', className)} {...props}>
      {systems.map((system) => (
        <div key={system.id} className="border rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-3">
              {getStatusIcon(system.status)}
              <div>
                <h3 className="font-medium">{system.name}</h3>
                <div className="flex items-center space-x-2">
                  <span className={cn(
                    'px-2 py-1 rounded-full text-xs font-medium',
                    getStatusColor(system.status)
                  )}>
                    {system.status.charAt(0).toUpperCase() + system.status.slice(1)}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Updated: {formatTimestamp(system.lastUpdated)}
                  </span>
                </div>
              </div>
            </div>
            
            <button className="p-1 hover:bg-muted rounded">
              <MoreHorizontal className="h-4 w-4" />
            </button>
          </div>
          
          {system.description && (
            <p className="text-sm text-muted-foreground mb-3">{system.description}</p>
          )}
          
          {showMetrics && system.metrics && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {system.metrics.map((metric, index) => (
                <div key={index} className="text-center p-2 bg-muted/30 rounded">
                  <div className="text-lg font-semibold">{metric.value}</div>
                  <div className="text-xs text-muted-foreground">{metric.label}</div>
                  {metric.trend && (
                    <div className="mt-1">
                      {metric.trend === 'up' && <TrendingUp className="h-3 w-3 text-green-600 mx-auto" />}
                      {metric.trend === 'down' && <TrendingDown className="h-3 w-3 text-red-600 mx-auto" />}
                      {metric.trend === 'stable' && <div className="h-3 w-3 flex items-center justify-center text-gray-600">—</div>}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  )
})
SystemStatus.displayName = 'SystemStatus'

// Admin Data Table Component (enhanced for admin use)
export interface AdminTableColumn {
  key: string
  label: string
  type?: 'text' | 'number' | 'date' | 'status' | 'action' | 'avatar'
  align?: 'left' | 'center' | 'right'
  width?: string
  sortable?: boolean
  render?: (value: any, row: any) => React.ReactNode
}

export interface AdminTableProps {
  /** Table columns */
  columns: AdminTableColumn[]
  /** Table data */
  data: any[]
  /** Loading state */
  loading?: boolean
  /** Empty state message */
  emptyMessage?: string
  /** Row click handler */
  onRowClick?: (row: any) => void
  /** Sort handler */
  onSort?: (column: string, direction: 'asc' | 'desc') => void
  /** Additional CSS classes */
  className?: string
}

/**
 * AdminTable Component
 * 
 * Enhanced table component for admin interfaces
 * 
 * @example
 * ```tsx
 * <AdminTable 
 *   columns={columns}
 *   data={users}
 *   loading={loading}
 *   onRowClick={(user) => showUserDetails(user)}
 * />
 * ```
 */
export const AdminTable = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & AdminTableProps
>(({ 
  columns,
  data,
  loading = false,
  emptyMessage = 'No data available',
  onRowClick,
  onSort,
  className,
  ...props 
}, ref) => {
  const [sortColumn, setSortColumn] = React.useState<string>('')
  const [sortDirection, setSortDirection] = React.useState<'asc' | 'desc'>('asc')

  const handleSort = (column: AdminTableColumn) => {
    if (!column.sortable) return
    
    const newDirection = sortColumn === column.key && sortDirection === 'asc' ? 'desc' : 'asc'
    setSortColumn(column.key)
    setSortDirection(newDirection)
    onSort?.(column.key, newDirection)
  }

  const renderCell = (column: AdminTableColumn, row: any) => {
    const value = row[column.key]
    
    if (column.render) {
      return column.render(value, row)
    }

    switch (column.type) {
      case 'status':
        const statusColors = {
          active: 'bg-green-100 text-green-800',
          inactive: 'bg-gray-100 text-gray-800',
          pending: 'bg-yellow-100 text-yellow-800',
          suspended: 'bg-red-100 text-red-800'
        }
        return (
          <span className={cn(
            'px-2 py-1 rounded-full text-xs font-medium',
            statusColors[value] || statusColors.inactive
          )}>
            {value}
          </span>
        )
      
      case 'date':
        return value ? new Date(value).toLocaleDateString() : '-'
      
      case 'number':
        return typeof value === 'number' ? value.toLocaleString() : '-'
      
      case 'action':
        return (
          <div className="flex items-center space-x-2">
            <button className="p-1 hover:bg-muted rounded" title="Edit">
              ✏️
            </button>
            <button className="p-1 hover:bg-muted rounded" title="Delete">
              🗑️
            </button>
          </div>
        )
      
      case 'avatar':
        return (
          <div className="flex items-center space-x-2">
            {value?.avatar ? (
              <img src={value.avatar} alt={value.name} className="h-8 w-8 rounded-full" />
            ) : (
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-sm font-medium">
                  {value?.name?.charAt(0) || '?'}
                </span>
              </div>
            )}
            <span>{value?.name || '-'}</span>
          </div>
        )
      
      default:
        return value || '-'
    }
  }

  if (loading) {
    return (
      <div ref={ref} className={cn('space-y-2', className)} {...props}>
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="flex space-x-4 p-4 bg-muted/30 rounded-lg animate-pulse">
            {columns.map((_, colIndex) => (
              <div key={colIndex} className="h-4 bg-muted rounded flex-1"></div>
            ))}
          </div>
        ))}
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div ref={ref} className={cn('text-center py-8', className)} {...props}>
        <div className="text-4xl mb-4">📋</div>
        <h3 className="text-lg font-semibold mb-2">No Data Found</h3>
        <p className="text-muted-foreground">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <div ref={ref} className={cn('overflow-hidden', className)} {...props}>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={cn(
                    'px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider',
                    column.align === 'center' && 'text-center',
                    column.align === 'right' && 'text-right',
                    column.sortable && 'cursor-pointer hover:text-foreground'
                  )}
                  style={{ width: column.width }}
                  onClick={() => handleSort(column)}
                >
                  <div className="flex items-center space-x-1">
                    <span>{column.label}</span>
                    {column.sortable && sortColumn === column.key && (
                      <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-card divide-y">
            {data.map((row, index) => (
              <tr
                key={index}
                className={cn(
                  'hover:bg-muted/50 transition-colors',
                  onRowClick && 'cursor-pointer'
                )}
                onClick={() => onRowClick?.(row)}
              >
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className={cn(
                      'px-4 py-3 text-sm',
                      column.align === 'center' && 'text-center',
                      column.align === 'right' && 'text-right'
                    )}
                  >
                    {renderCell(column, row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
})
AdminTable.displayName = 'AdminTable'

// Export types
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
}