/**
 * DirectDriveX File Upload Component
 * Part of the new design system with ds- prefix
 * 
 * File upload components for handling file uploads with drag-and-drop
 * Following the design system rules and accessibility guidelines
 */

import React, { useCallback, useState } from 'react'
import { Upload, File, X, FileImage, FileText, FileArchive, FileVideo, FileAudio } from 'lucide-react'
import { cn } from '@/lib/utils'

// File types
export type FileType = 'image' | 'document' | 'archive' | 'video' | 'audio' | 'unknown'

// File interface
export interface UploadedFile {
  id: string
  name: string
  size: number
  type: FileType
  url?: string
  lastModified?: Date
}

// File upload zone component
export interface FileUploadZoneProps {
  /** Accepted file types */
  accept?: string
  /** Maximum file size in bytes */
  maxSize?: number
  /** Maximum number of files */
  maxFiles?: number
  /** Whether multiple files are allowed */
  multiple?: boolean
  /** Upload handler */
  onUpload?: (files: File[]) => void
  /** Remove handler */
  onRemove?: (fileId: string) => void
  /** Current files */
  files?: UploadedFile[]
  /** Disabled state */
  disabled?: boolean
  /** Additional CSS classes */
  className?: string
}

/**
 * FileUploadZone Component
 * 
 * Drag-and-drop file upload zone
 * 
 * @example
 * ```tsx
 * <FileUploadZone 
 *   accept="image/*,.pdf"
 *   maxSize={10 * 1024 * 1024} // 10MB
 *   multiple={true}
 *   onUpload={(files) => console.log('Files uploaded:', files)}
 * />
 * ```
 */
export const FileUploadZone = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & FileUploadZoneProps
>(({ 
  accept,
  maxSize = 10 * 1024 * 1024, // 10MB default
  maxFiles = 10,
  multiple = true,
  onUpload,
  onRemove,
  files = [],
  disabled = false,
  className,
  ...props 
}, ref) => {
  const [isDragOver, setIsDragOver] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const getFileType = (file: File): FileType => {
    if (file.type.startsWith('image/')) return 'image'
    if (file.type.startsWith('video/')) return 'video'
    if (file.type.startsWith('audio/')) return 'audio'
    if (file.type.includes('zip') || file.type.includes('rar') || file.type.includes('7z')) return 'archive'
    if (file.type.includes('pdf') || file.type.includes('doc') || file.type.includes('text')) return 'document'
    return 'unknown'
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const validateFile = (file: File): string | null => {
    if (maxSize && file.size > maxSize) {
      return `File size exceeds maximum limit of ${formatFileSize(maxSize)}`
    }
    if (accept && !file.type.match(accept.replace('*', '.*'))) {
      return `File type ${file.type} is not accepted`
    }
    return null
  }

  const handleFiles = useCallback((newFiles: FileList | File[]) => {
    setError(null)
    
    const filesArray = Array.from(newFiles)
    const validFiles: File[] = []
    const errors: string[] = []

    filesArray.forEach(file => {
      const validationError = validateFile(file)
      if (validationError) {
        errors.push(`${file.name}: ${validationError}`)
      } else {
        validFiles.push(file)
      }
    })

    if (errors.length > 0) {
      setError(errors.join(', '))
    }

    if (validFiles.length > 0) {
      const uploadedFiles: UploadedFile[] = validFiles.map(file => ({
        id: Math.random().toString(36).substr(2, 9),
        name: file.name,
        size: file.size,
        type: getFileType(file),
        lastModified: new Date(file.lastModified)
      }))

      onUpload?.(validFiles)
    }
  }, [accept, maxSize, onUpload])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    
    if (disabled) return
    
    const droppedFiles = e.dataTransfer.files
    handleFiles(droppedFiles)
  }, [disabled, handleFiles])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    if (!disabled) {
      setIsDragOver(true)
    }
  }, [disabled])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files
    if (selectedFiles) {
      handleFiles(selectedFiles)
    }
  }, [handleFiles])

  const removeFile = (fileId: string) => {
    onRemove?.(fileId)
  }

  const getFileIcon = (type: FileType) => {
    switch (type) {
      case 'image': return <FileImage className="h-8 w-8 text-blue-500" />
      case 'document': return <FileText className="h-8 w-8 text-green-500" />
      case 'archive': return <FileArchive className="h-8 w-8 text-orange-500" />
      case 'video': return <FileVideo className="h-8 w-8 text-purple-500" />
      case 'audio': return <FileAudio className="h-8 w-8 text-pink-500" />
      default: return <File className="h-8 w-8 text-gray-500" />
    }
  }

  return (
    <div ref={ref} className={cn('space-y-4', className)} {...props}>
      {/* Upload Zone */}
      <div
        className={cn(
          'border-2 border-dashed rounded-lg p-8 text-center transition-colors',
          isDragOver && 'border-primary bg-primary/5',
          disabled && 'opacity-50 cursor-not-allowed',
          !disabled && 'cursor-pointer hover:border-primary/50'
        )}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => !disabled && document.getElementById('file-input')?.click()}
      >
        <input
          id="file-input"
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleFileSelect}
          className="hidden"
          disabled={disabled}
        />
        
        <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        <div className="space-y-2">
          <p className="text-lg font-medium">
            {isDragOver ? 'Drop files here' : 'Drag & drop files here'}
          </p>
          <p className="text-sm text-muted-foreground">
            or click to browse files
          </p>
          <p className="text-xs text-muted-foreground">
            {accept && `Accepted: ${accept}`}
            {maxSize && ` • Max size: ${formatFileSize(maxSize)}`}
            {maxFiles && ` • Max files: ${maxFiles}`}
          </p>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-medium">Uploaded Files ({files.length}/{maxFiles})</h4>
          <div className="space-y-2">
            {files.map((file) => (
              <div key={file.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center space-x-3">
                  {getFileIcon(file.type)}
                  <div>
                    <p className="font-medium text-sm">{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(file.size)} • {file.type}
                    </p>
                  </div>
                </div>
                {!disabled && (
                  <button
                    onClick={() => removeFile(file.id)}
                    className="p-1 hover:bg-destructive/20 rounded transition-colors"
                  >
                    <X className="h-4 w-4 text-destructive" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
})
FileUploadZone.displayName = 'FileUploadZone'

// File Card Component
export interface FileCardProps {
  /** File information */
  file: UploadedFile
  /** Click handler */
  onClick?: () => void
  /** Remove handler */
  onRemove?: () => void
  /** Download handler */
  onDownload?: () => void
  /** Show actions */
  showActions?: boolean
  /** Compact view */
  compact?: boolean
  /** Additional CSS classes */
  className?: string
}

/**
 * FileCard Component
 * 
 * Individual file card with preview and actions
 * 
 * @example
 * ```tsx
 * <FileCard 
 *   file={file}
 *   onDownload={() => downloadFile(file)}
 *   onRemove={() => removeFile(file.id)}
 * />
 * ```
 */
export const FileCard = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & FileCardProps
>(({ 
  file,
  onClick,
  onRemove,
  onDownload,
  showActions = true,
  compact = false,
  className,
  ...props 
}, ref) => {
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getFileIcon = (type: FileType) => {
    switch (type) {
      case 'image': return <FileImage className="h-6 w-6 text-blue-500" />
      case 'document': return <FileText className="h-6 w-6 text-green-500" />
      case 'archive': return <FileArchive className="h-6 w-6 text-orange-500" />
      case 'video': return <FileVideo className="h-6 w-6 text-purple-500" />
      case 'audio': return <FileAudio className="h-6 w-6 text-pink-500" />
      default: return <File className="h-6 w-6 text-gray-500" />
    }
  }

  if (compact) {
    return (
      <div
        ref={ref}
        className={cn(
          'flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors cursor-pointer',
          onClick && 'hover:bg-muted/70',
          className
        )}
        onClick={onClick}
        {...props}
      >
        <div className="flex items-center space-x-3">
          {getFileIcon(file.type)}
          <div className="min-w-0 flex-1">
            <p className="font-medium text-sm truncate">{file.name}</p>
            <p className="text-xs text-muted-foreground">
              {formatFileSize(file.size)}
            </p>
          </div>
        </div>
        {showActions && (
          <div className="flex items-center space-x-1">
            {onDownload && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onDownload()
                }}
                className="p-1 hover:bg-accent rounded transition-colors"
              >
                <Upload className="h-4 w-4" />
              </button>
            )}
            {onRemove && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onRemove()
                }}
                className="p-1 hover:bg-destructive/20 rounded transition-colors"
              >
                <X className="h-4 w-4 text-destructive" />
              </button>
            )}
          </div>
        )}
      </div>
    )
  }

  return (
    <div
      ref={ref}
      className={cn(
        'bg-card border rounded-lg p-4 hover:shadow-md transition-shadow',
        onClick && 'cursor-pointer',
        className
      )}
      onClick={onClick}
      {...props}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          {getFileIcon(file.type)}
          <div className="min-w-0 flex-1">
            <h3 className="font-medium text-sm truncate">{file.name}</h3>
            <p className="text-xs text-muted-foreground">
              {formatFileSize(file.size)} • {file.type}
            </p>
            {file.lastModified && (
              <p className="text-xs text-muted-foreground">
                Modified: {file.lastModified.toLocaleDateString()}
              </p>
            )}
          </div>
        </div>
        {showActions && (
          <div className="flex items-center space-x-1">
            {onDownload && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onDownload()
                }}
                className="p-1 hover:bg-accent rounded transition-colors"
                title="Download"
              >
                <Upload className="h-4 w-4" />
              </button>
            )}
            {onRemove && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onRemove()
                }}
                className="p-1 hover:bg-destructive/20 rounded transition-colors"
                title="Remove"
              >
                <X className="h-4 w-4 text-destructive" />
              </button>
            )}
          </div>
        )}
      </div>
      
      {/* Preview for images */}
      {file.type === 'image' && file.url && (
        <div className="mt-3">
          <img
            src={file.url}
            alt={file.name}
            className="w-full h-32 object-cover rounded-md"
          />
        </div>
      )}
    </div>
  )
})
FileCard.displayName = 'FileCard'

// File Grid Component
export interface FileGridProps {
  /** Files to display */
  files: UploadedFile[]
  /** Click handler */
  onFileClick?: (file: UploadedFile) => void
  /** Remove handler */
  onFileRemove?: (fileId: string) => void
  /** Download handler */
  onFileDownload?: (file: UploadedFile) => void
  /** Grid columns */
  columns?: 1 | 2 | 3 | 4
  /** Compact view */
  compact?: boolean
  /** Additional CSS classes */
  className?: string
}

/**
 * FileGrid Component
 * 
 * Grid layout for multiple file cards
 * 
 * @example
 * ```tsx
 * <FileGrid 
 *   files={files}
 *   columns={3}
 *   onFileClick={(file) => openFile(file)}
 *   onFileRemove={(fileId) => removeFile(fileId)}
 * />
 * ```
 */
export const FileGrid = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & FileGridProps
>(({ 
  files,
  onFileClick,
  onFileRemove,
  onFileDownload,
  columns = 3,
  compact = false,
  className,
  ...props 
}, ref) => {
  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
  }

  return (
    <div
      ref={ref}
      className={cn(
        'grid gap-4',
        gridCols[columns],
        className
      )}
      {...props}
    >
      {files.map((file) => (
        <FileCard
          key={file.id}
          file={file}
          compact={compact}
          onClick={() => onFileClick?.(file)}
          onRemove={() => onFileRemove?.(file.id)}
          onDownload={() => onFileDownload?.(file)}
        />
      ))}
    </div>
  )
})
FileGrid.displayName = 'FileGrid'

// Export types
export type { 
  FileUploadZoneProps, 
  FileCardProps, 
  FileGridProps,
  UploadedFile,
  FileType 
}