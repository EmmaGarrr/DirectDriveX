# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Frontend (Next.js)
```bash
cd frontend
npm run dev          # Start development server on port 4200
npm run build        # Build for production
npm run build:vercel # Build for Vercel deployment
npm run start        # Start production server
npm run lint         # Run ESLint
```

### Backend (FastAPI)
```bash
cd backend
uvicorn app.main:app --host 0.0.0.0 --port 5000 --reload  # Development server
```

### Type Checking
```bash
cd frontend
npx tsc --noEmit --skipLibCheck  # TypeScript compilation check
```

## Architecture Overview

### Core System Architecture
DirectDriveX is a cloud storage platform with dual storage backend (Google Drive + Hetzner) and comprehensive admin panel. The system uses:

- **Frontend**: Next.js 15 with React 19, TypeScript, Tailwind CSS, and Radix UI components
- **Backend**: FastAPI with MongoDB, JWT authentication, and WebSocket support
- **Storage**: Google Drive (primary) + Hetzner WebDAV (backup) with automatic failover
- **Design System**: Currently migrating from legacy BOLT design system to new unified design system

### Key Design Patterns

#### Dual Storage System
Files are stored simultaneously on Google Drive and Hetzner for redundancy:
- **Primary Storage**: Google Drive (multiple accounts for load balancing)
- **Backup Storage**: Hetzner WebDAV
- **Automatic Failover**: If primary fails, system switches to backup
- **Background Sync**: Continuous backup process ensures consistency

#### Preview System
File previews are handled by content type detection:
- **Supported**: Video, Audio, Image, PDF (document), Text files
- **Unsupported**: Office documents, archives, executables (show download-only)
- **Preview Types**: Determined by backend based on `content_type` header

#### Admin Panel Architecture
Comprehensive admin system with:
- **Real-time Updates**: WebSocket connections for live system monitoring
- **Modular Design**: Separate routes for different admin functions (files, users, storage, monitoring)
- **Background Processes**: Automated backup, cleanup, and monitoring tasks

### Frontend Structure

#### Component Organization
```
frontend/src/components/
├── ui/              # Legacy BOLT design system components (preserve)
├── ui-new/          # New unified design system components (use for new work)
├── admin/           # Admin panel components
├── layout/          # Layout components
├── auth/            # Authentication components
└── download/        # File preview and download components
```

#### Service Layer
- **fileService.ts**: Handles file operations, preview detection, and metadata
- **uploadService.ts**: Manages file uploads with progress tracking
- **authService.ts**: User authentication and session management
- **adminAuthService.ts**: Admin-specific authentication
- **analyticsService.ts**: Usage tracking and analytics

### Backend Structure

#### API Routes Organization
```
backend/app/api/v1/
├── routes_auth.py          # User authentication
├── routes_upload.py        # File uploads (supports chunking)
├── routes_download.py      # File downloads and previews
├── routes_batch_upload.py  # Batch file operations
├── routes_admin_*.py       # Admin panel APIs (multiple files)
└── routes_*.py            # Other system APIs
```

#### Service Layer
- **google_drive_service.py**: Google Drive API integration with account pooling
- **hetzner_service.py**: Hetzner WebDAV integration
- **backup_service.py**: Automated backup between storage systems
- **upload_concurrency_manager.py**: Manages concurrent upload limits
- **video_cache_service.py**: Video preview caching and optimization

### Data Models

#### File Storage Model
Files are stored with metadata including:
- **Primary Storage**: Google Drive ID + Account ID
- **Backup Storage**: Hetzner remote path
- **Content Type**: Determines preview capabilities
- **Upload Status**: Tracks upload progress and state
- **Storage Location**: Primary, backup, or both

#### Preview Type System
```typescript
type PreviewType = 
  | 'video'     // MP4, WebM, AVI, etc. - shows video player
  | 'audio'     // MP3, WAV, OGG, etc. - shows audio player  
  | 'image'     // JPEG, PNG, GIF, etc. - shows image
  | 'document'  // PDF only - shows in iframe
  | 'text'      // TXT, JSON, XML, etc. - shows text content
  | 'thumbnail' // Same as image, for video thumbnails
  | 'viewer'    // Office docs (not implemented)
  | 'unknown'   // Unrecognized file types
  | 'unsupported' // Archives, executables (download only)
```

## Design System Migration

### Current State
The project is migrating from legacy BOLT design system to a new unified design system:

#### Legacy System (Preserve)
- Location: `/frontend/src/components/ui/`
- CSS variables: `--primary`, `--bolt-*`
- Components: Must remain untouched until explicit removal

#### New System (Use for New Work)
- Location: `/frontend/src/components/ui-new/`
- CSS variables: `--ds-*` prefix
- Components: Use for all new development

### Migration Rules
1. **Never mix** old and new design systems in the same component
2. **New components** must use the new design system (`ui-new/`)
3. **Existing components** remain in legacy system until migrated
4. **No visual changes** during migration - maintain exact appearance

## WebSocket System

### Real-time Features
- **Admin Dashboard**: Live system statistics and monitoring
- **Upload Progress**: Real-time upload status updates
- **System Alerts**: Instant notification of system issues

### Connection Management
- **Auto-reconnection**: Handles connection drops gracefully
- **Periodic Updates**: System stats sent every 30 seconds
- **Admin Auth**: WebSocket connections require admin authentication

## File Processing Architecture

### Upload System
- **Chunked Uploads**: Large files split into manageable chunks
- **Parallel Processing**: Multiple chunks processed simultaneously
- **Progress Tracking**: Real-time upload progress with WebSocket updates
- **Concurrency Limits**: Server-side limits prevent resource exhaustion

### Preview Generation
- **Content Detection**: Backend determines preview capability by content type
- **Video Optimization**: Thumbnail generation and streaming support
- **Document Handling**: PDF preview via iframe embedding
- **Text Processing**: Safe text content display with formatting

## Security Considerations

### Authentication
- **JWT Tokens**: User and admin authentication with configurable expiration
- **Admin Auth**: Separate admin authentication system with enhanced security
- **WebSocket Security**: Admin WebSocket connections require valid admin tokens

### File Security
- **Access Control**: Files accessible only by owners and admins
- **Preview Restrictions**: Certain file types restricted to download-only
- **Storage Security**: Google Drive and Hetzner credentials properly secured

## Development Guidelines

### Working with Files
- **File Operations**: Always use `fileService.ts` for consistent file handling
- **Preview Types**: Check `previewMeta.preview_available` before showing preview options
- **Upload Progress**: Use WebSocket connections for real-time upload status
- **Error Handling**: Implement proper error states for file operations

### Admin Panel Development
- **WebSocket Usage**: Use `adminSocketService.ts` for real-time admin features
- **Data Fetching**: Use admin-specific services for admin panel data
- **Security**: Ensure all admin routes require proper authentication
- **Real-time Updates**: Implement WebSocket listeners for live data updates

### Component Development
- **Design System**: Use new `ui-new/` components for all new work
- **TypeScript**: Strict TypeScript configuration enabled
- **Testing**: Components should handle loading and error states properly
- **Accessibility**: Follow ARIA guidelines for interactive elements

## Environment Configuration

### Required Environment Variables
```bash
# Frontend (frontend/.env.local)
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000
NEXT_PUBLIC_WS_URL=ws://localhost:5000/ws_api

# Backend (backend/.env)
MONGODB_URI=mongodb://localhost:27017/directdrivex
JWT_SECRET_KEY=your-secret-key-here
GDRIVE_ACCOUNT_1_CLIENT_ID=your-client-id
GDRIVE_ACCOUNT_1_CLIENT_SECRET=your-client-secret
GDRIVE_ACCOUNT_1_REFRESH_TOKEN=your-refresh-token
HETZNER_USERNAME=your-hetzner-username
HETZNER_PASSWORD=your-hetzner-password
HETZNER_WEBDAV_URL=your-webdav-url
```

## Testing and Quality

### TypeScript Configuration
- **Strict Mode**: Enabled in `tsconfig.json`
- **No Implicit Any**: Prevents unsafe type usage
- **Build Verification**: Use `npx tsc --noEmit --skipLibCheck` for type checking

### Linting
- **ESLint**: Configured with Next.js recommended rules
- **No Lint Errors**: All lint errors must be resolved before commits

### Common Issues
- **Build Cache**: Run `rm -rf .next` if build issues persist
- **Type Errors**: Use `--skipLibCheck` flag to focus on relevant errors
- **WebSocket Connections**: Ensure proper cleanup in component unmount