# DirectDriveX - Detailed Project Structure Documentation

## 🏗️ **Project Overview**

DirectDriveX is a comprehensive cloud storage management platform built with a Python FastAPI backend and Angular 17 frontend. It provides advanced file upload/download capabilities, multi-cloud storage integration, user management, and a comprehensive admin panel.

## 📁 **Root Project Structure**

```
DirectDriveX/
├── backend/                    # Python FastAPI Backend
├── frontend/                   # Angular 17 Frontend  
├── docs/                       # Project Documentation
├── Changes-history/            # Implementation History & Changelogs
├── Downloads/                  # Download directory
├── README.md                   # Main project documentation
└── package.json               # Root package configuration
```

---

## 🐍 **BACKEND STRUCTURE** (`/backend/`)

### **Technology Stack**
- **Framework**: FastAPI (Python 3.8+)
- **Database**: MongoDB with PyMongo
- **Authentication**: JWT + Google OAuth 2.0
- **Background Tasks**: Celery + Redis
- **File Processing**: Parallel chunk processing
- **Email**: SMTP with aiosmtplib
- **Deployment**: Docker + Supervisor

### **Root Backend Files**
```
backend/
├── app/                        # Main application package
├── requirements.txt            # Python dependencies (137 packages)
├── Dockerfile                  # Backend containerization
├── docker-compose.yml          # Service orchestration
├── docker-compose.prod.yml     # Production orchestration
├── supervisord.conf            # Process supervision
├── create_admin.py             # Admin user creation script
├── generate_token.py           # JWT token generator
├── create_password_reset_indexes.py  # Database index setup
├── migrate_datetime_fields.py  # DateTime migration script
├── migrate_google_users.py     # Google OAuth user migration
├── migrate_upload_limits.py    # Upload limits migration
├── env.dev.template            # Development environment template
├── env.prod.template           # Production environment template
├── env.staging.template        # Staging environment template
├── env.parallel_upload.template # Parallel upload configuration
├── env.upload_limits.template  # Upload limits configuration
├── test_*.py                   # Test scripts (10+ test files)
└── venv/                       # Python virtual environment
```

### **Backend Application Structure** (`/backend/app/`)

#### **Core Application Files**
```
app/
├── __init__.py                 # Package initialization
├── main.py                     # FastAPI application entry point (791 lines)
├── celery_worker.py            # Celery worker configuration
├── progress_manager.py         # Upload progress management
└── ws_manager.py              # WebSocket connection manager
```

#### **API Layer** (`/backend/app/api/v1/`)
```
api/v1/
├── __init__.py
├── routes_auth.py              # Authentication endpoints
├── routes_upload.py            # File upload endpoints
├── routes_download.py          # File download endpoints
├── routes_batch_upload.py      # Batch upload operations
├── routes_admin_auth.py        # Admin authentication
├── routes_admin_config.py      # Admin configuration
├── routes_admin_files.py       # Admin file management
├── routes_admin_monitoring.py  # Admin system monitoring
├── routes_admin_notifications.py # Admin notifications
├── routes_admin_reports.py     # Admin reports
├── routes_admin_storage.py     # Admin storage management
└── routes_admin_users.py       # Admin user management
```

**Key Endpoints:**
- `POST /api/v1/auth/login` - User authentication
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/google/auth` - Google OAuth initiation
- `POST /api/v1/auth/google/callback` - Google OAuth callback
- `POST /api/v1/auth/forgot-password` - Password reset request
- `POST /api/v1/auth/reset-password` - Password reset execution
- `POST /api/v1/upload/` - File upload
- `GET /api/v1/download/{file_id}` - File download
- `POST /api/v1/batch-upload/` - Batch file upload
- `WebSocket /ws_api/upload_parallel/{file_id}` - Parallel upload WebSocket

#### **Core Configuration** (`/backend/app/core/`)
```
core/
├── __init__.py
└── config.py                   # Environment configuration & settings
```

**Configuration Features:**
- Environment-based settings (dev/staging/prod)
- Database connection configuration
- Google OAuth settings
- Email SMTP configuration
- JWT token settings
- Upload limits and storage configuration
- Security settings and CORS configuration

#### **Database Layer** (`/backend/app/db/`)
```
db/
└── mongodb.py                  # MongoDB connection and database setup
```

#### **Data Models** (`/backend/app/models/`)
```
models/
├── admin.py                    # Admin user models
├── batch.py                    # Batch operation models
├── file.py                     # File metadata models
├── google_drive_account.py     # Google Drive account models
├── google_oauth.py             # Google OAuth models
└── user.py                     # User authentication models
```

**Key Models:**
- `User`: User account with auth credentials
- `UserInDB`: Database user representation
- `GoogleUserInfo`: Google OAuth user data
- `FileMetadata`: File information and storage details
- `BatchUpload`: Batch operation tracking
- `AdminUser`: Administrative user accounts

#### **Business Logic Services** (`/backend/app/services/`)
```
services/
├── __init__.py
├── auth_service.py             # User authentication service
├── admin_auth_service.py       # Admin authentication service
├── google_oauth_service.py     # Google OAuth integration
├── email_service.py            # Email notification service
├── password_reset_service.py   # Password reset functionality
├── google_drive_service.py     # Google Drive API integration
├── google_drive_account_service.py # Google Drive account management
├── hetzner_service.py          # Hetzner Cloud integration
├── storage_service.py          # Storage orchestration
├── backup_service.py           # Backup and restoration
├── telegram_service.py         # Telegram integration
├── file_metadata_service.py    # File metadata management
├── upload_limits_service.py    # Upload quota management
├── zipping_service.py          # File compression service
├── video_cache_service.py      # Video processing cache
├── background_process_manager.py # Background task management
├── parallel_chunk_processor.py # Parallel upload processor
├── upload_concurrency_manager.py # Upload concurrency control
├── memory_monitor.py           # System memory monitoring
└── chunk_buffer_pool.py        # Memory buffer management
```

**Critical Services:**
- **Parallel Upload System**: 5x faster uploads with concurrent chunk processing
- **Memory Management**: Real-time monitoring with 80% memory limits
- **Concurrency Control**: 20 global uploads, 3 per user limits
- **Google Drive Integration**: Full API with resumable uploads
- **Authentication**: JWT + OAuth 2.0 with secure session management

#### **Background Tasks** (`/backend/app/tasks/`)
```
tasks/
├── file_transfer_task.py       # File transfer background tasks
└── telegram_uploader_task.py   # Telegram upload tasks
```

#### **Data Schemas** (`/backend/app/schemas/`)
```
schemas/
├── __init__.py
└── file.py                     # File validation schemas
```

#### **Middleware** (`/backend/app/middleware/`)
```
middleware/
└── priority_middleware.py      # Request priority handling
```

#### **Email Templates** (`/backend/app/templates/`)
```
templates/
├── password_reset_email.html   # HTML password reset template
└── password_reset_email.txt    # Text password reset template
```

---

## 🌐 **FRONTEND STRUCTURE** (`/frontend/`)

### **Technology Stack**
- **Framework**: Angular 17 with TypeScript
- **Styling**: Tailwind CSS + Custom BOLT design system
- **State Management**: Angular Services + RxJS
- **UI Components**: Custom components + Angular Material
- **Authentication**: JWT token management
- **Real-time**: WebSocket integration
- **Analytics**: Hotjar integration

### **Root Frontend Files**
```
frontend/
├── src/                        # Source code
├── package.json                # Node dependencies (48 packages)
├── package-lock.json           # Dependency lock file
├── angular.json                # Angular CLI configuration
├── tailwind.config.js          # Tailwind CSS configuration
├── tsconfig.json               # TypeScript configuration
├── tsconfig.app.json           # App-specific TypeScript config
├── tsconfig.spec.json          # Test TypeScript config
├── Dockerfile                  # Frontend containerization
├── nginx.conf                  # Nginx configuration
├── vercel.json                 # Vercel deployment config
├── scripts/                    # Build scripts
│   └── prepare-env.js         # Environment preparation
├── api/                        # API utilities
│   └── download-proxy.ts      # Download proxy service
├── README.md                   # Frontend documentation
├── ENVIRONMENT_SETUP.md        # Environment setup guide
├── MIGRATION_GUIDE.md          # Migration documentation
├── FOOTER_IMPLEMENTATION.md    # Footer implementation guide
└── node_modules/              # Node.js dependencies
```

### **Frontend Source Structure** (`/frontend/src/`)

#### **Core Application Files**
```
src/
├── main.ts                     # Application bootstrap
├── index.html                  # Main HTML template
├── styles.css                  # Global styles (1601 lines)
├── custom-theme.scss           # Custom theme variables
├── favicon.svg                 # Application favicon
├── environments/               # Environment configurations
│   ├── environment.ts         # Development environment
│   └── environment.prod.ts    # Production environment
└── assets/                     # Static assets
```

#### **Main Application Module** (`/frontend/src/app/`)
```
app/
├── app.component.ts            # Root application component
├── app.component.html          # Root template
├── app.component.css           # Root styles
├── app.component.spec.ts       # Root component tests
├── app.module.ts               # Main application module
└── app-routing.module.ts       # Application routing configuration
```

#### **Main User Components** (`/frontend/src/app/componet/`)
```
componet/
├── home/                       # Landing page component
│   ├── home.component.ts
│   ├── home.component.html
│   └── home.component.css
├── login/                      # User login component
│   ├── login.component.ts
│   ├── login.component.html
│   ├── login.component.css
│   └── login.component.spec.ts
├── register/                   # User registration component
│   ├── register.component.ts
│   ├── register.component.html
│   ├── register.component.css
│   └── register.component.spec.ts
├── dashboard/                  # User dashboard
│   ├── dashboard.component.ts
│   ├── dashboard.component.html
│   ├── dashboard.component.css
│   └── dashboard.component.spec.ts
├── profile/                    # User profile management
│   ├── profile.component.ts
│   ├── profile.component.html
│   └── profile.component.css
├── forgot-password/            # Password reset request
│   ├── forgot-password.component.ts
│   ├── forgot-password.component.html
│   └── forgot-password.component.css
├── reset-password/             # Password reset execution
│   ├── reset-password.component.ts
│   ├── reset-password.component.html
│   └── reset-password.component.css
├── file-preview/               # File preview system
│   ├── file-preview.component.ts
│   ├── file-preview.component.html
│   ├── file-preview.component.css
│   ├── image-preview.component.ts
│   ├── image-preview.component.html
│   └── image-preview.component.css
├── download/                   # File download component
│   ├── download.component.ts
│   ├── download.component.html
│   └── download.component.css
├── batch-upload.component.ts   # Batch file upload
├── batch-upload.component.html
├── batch-upload.component.css
├── batch-download.component.ts # Batch file download
├── batch-download.component.html
├── batch-download.component.css
├── how-it-works/               # How it works page
│   ├── how-it-works.component.ts
│   ├── how-it-works.component.html
│   ├── how-it-works.component.css
│   └── how-it-works.component.spec.ts
└── error-monitoring/           # Error monitoring component
```

#### **Authentication Module** (`/frontend/src/app/auth/`)
```
auth/
└── google-callback/            # Google OAuth callback handler
    ├── google-callback.component.ts
    └── google-callback.component.spec.ts
```

#### **Admin Panel** (`/frontend/src/app/admin-panel/`)
```
admin-panel/
├── admin-panel.component.ts    # Main admin panel component
├── admin-panel.component.html
├── admin-panel.component.css
├── admin-auth/                 # Admin authentication module
│   ├── admin-auth.module.ts
│   ├── admin-login.component.ts
│   ├── admin-login.component.html
│   ├── admin-login.component.scss
│   └── admin-login.component.spec.ts
├── user-management/            # User administration
│   ├── user-management.component.ts
│   ├── user-management.component.html
│   ├── user-management.component.css
│   └── user-management.component.spec.ts
├── file-browser/               # System file browser
│   ├── file-browser.component.ts
│   ├── file-browser.component.html
│   └── file-browser.component.css
├── system-monitoring/          # System health monitoring
│   ├── system-monitoring.component.ts
│   ├── system-monitoring.component.html
│   └── system-monitoring.component.css
├── activity-logs/              # Activity audit logs
│   ├── activity-logs.component.ts
│   ├── activity-logs.component.html
│   ├── activity-logs.component.css
│   └── activity-logs.component.spec.ts
├── background-processes/       # Background task monitoring
│   ├── background-processes.component.ts
│   ├── background-processes.component.html
│   └── background-processes.component.css
├── backup-management/          # Backup system management
│   ├── backup-management.component.ts
│   ├── backup-management.component.html
│   └── backup-management.component.css
├── create-admin/               # Admin user creation
│   ├── create-admin.component.ts
│   ├── create-admin.component.html
│   ├── create-admin.component.css
│   └── create-admin.component.spec.ts
├── drive-file-management/      # Google Drive file management
│   ├── drive-file-management.component.ts
│   ├── drive-file-management.component.html
│   └── drive-file-management.component.css
├── google-drive-management/    # Google Drive account management
│   ├── google-drive-management.component.ts
│   ├── google-drive-management.component.html
│   └── google-drive-management.component.css
├── hetzner-file-management/    # Hetzner Cloud file management
│   ├── hetzner-file-management.component.ts
│   ├── hetzner-file-management.component.html
│   └── hetzner-file-management.component.css
├── notification-system/        # Admin notification system
│   ├── notification-system.component.ts
│   ├── notification-system.component.html
│   └── notification-system.component.css
├── reports-export/             # System reports and export
│   ├── reports-export.component.ts
│   ├── reports-export.component.html
│   └── reports-export.component.css
├── security-settings/          # Security configuration
│   ├── security-settings.component.ts
│   ├── security-settings.component.html
│   └── security-settings.component.css
├── storage-cleanup/            # Storage cleanup tools
│   ├── storage-cleanup.component.ts
│   ├── storage-cleanup.component.html
│   └── storage-cleanup.component.css
└── user-analytics/             # User behavior analytics
    ├── user-analytics.component.ts
    ├── user-analytics.component.html
    └── user-analytics.component.css
```

#### **Route Guards** (`/frontend/src/app/guards/`)
```
guards/
├── auth.guard.ts               # User authentication guard
├── admin-auth.guard.ts         # Admin authentication guard
├── admin-auth.guard.spec.ts    # Admin guard tests
├── super-admin.guard.ts        # Super admin guard
└── super-admin.guard.spec.ts   # Super admin guard tests
```

#### **HTTP Interceptors** (`/frontend/src/app/interceptors/`)
```
interceptors/
└── auth.interceptor.ts         # JWT token interceptor
```

#### **Data Models** (`/frontend/src/app/models/`)
```
models/
└── admin.model.ts              # Admin user TypeScript interfaces
```

#### **Angular Services** (`/frontend/src/app/services/`)
```
services/
├── auth.service.ts             # User authentication service
├── admin-auth.service.ts       # Admin authentication service
├── admin-auth.service.spec.ts  # Admin auth service tests
├── admin-socket.service.ts     # Admin WebSocket service
└── admin-stats.service.ts      # Admin statistics service
```

#### **Shared Components & Services** (`/frontend/src/app/shared/`)
```
shared/
├── component/                  # Reusable components
│   ├── header/                # Application header
│   │   ├── header.component.ts
│   │   ├── header.component.html
│   │   └── header.component.css
│   ├── footer/                # Application footer
│   │   ├── footer.component.ts
│   │   ├── footer.component.html
│   │   └── footer.component.css
│   └── toast/                 # Toast notification system
│       ├── toast.component.ts
│       ├── toast.component.html
│       └── toast.component.css
├── pipes/                      # Custom Angular pipes
│   └── safe.pipe.ts           # Safe HTML/URL pipe
└── services/                   # Shared services
    ├── auth.service.ts        # Authentication service
    ├── batch-upload.service.ts # Batch upload service
    ├── file.service.ts        # File operations service
    ├── google-auth.service.ts  # Google OAuth service
    ├── toast.service.ts       # Toast notification service
    └── upload.service.ts      # File upload service
```

---

## 🚀 **Key Features & Capabilities**

### **Backend Features**
1. **Parallel Upload System**: 5x faster uploads with concurrent chunk processing
2. **Multi-Cloud Storage**: Google Drive + Hetzner Cloud integration
3. **Advanced Authentication**: JWT + Google OAuth 2.0
4. **Admin Panel APIs**: Comprehensive administrative endpoints
5. **Email System**: Password reset, notifications with SMTP
6. **Background Tasks**: Celery-based asynchronous processing
7. **Memory Management**: Real-time monitoring and optimization
8. **WebSocket Support**: Real-time progress updates

### **Frontend Features**
1. **Modern UI/UX**: Tailwind CSS + custom design system
2. **Responsive Design**: Mobile-first responsive layouts
3. **Real-time Updates**: WebSocket integration for live progress
4. **Admin Dashboard**: Complete administrative interface
5. **File Management**: Upload, download, preview, batch operations
6. **Authentication Flow**: Login, register, OAuth, password reset
7. **Progress Tracking**: Real-time upload/download progress
8. **Error Handling**: Comprehensive error management and user feedback

### **Security Features**
1. **Authentication**: JWT tokens with secure refresh mechanisms
2. **Authorization**: Role-based access control (user/admin/super-admin)
3. **Rate Limiting**: API rate limiting for abuse prevention
4. **Input Validation**: Comprehensive data validation on both ends
5. **CORS Configuration**: Environment-specific CORS policies
6. **Password Security**: bcrypt hashing, secure reset flows
7. **File Validation**: Secure file upload validation and scanning

### **Performance Optimizations**
1. **Parallel Processing**: 8 concurrent upload chunks
2. **Memory Pooling**: Buffer reuse for efficient memory usage
3. **Caching**: Strategic caching for improved performance
4. **Connection Pooling**: HTTP/2 client optimization
5. **Lazy Loading**: Component lazy loading for faster page loads
6. **Code Splitting**: Angular build optimization

---

## 🔧 **Development & Deployment**

### **Development Setup**
```bash
# Backend
cd backend
python -m venv venv
venv/Scripts/activate
pip install -r requirements.txt
python main.py

# Frontend  
cd frontend
npm install
npm run prepare-env
ng serve
```

### **Production Deployment**
```bash
# Docker deployment
cd backend
docker-compose -f docker-compose.prod.yml up -d

# Frontend build
cd frontend
npm run build
```

### **Environment Configuration**
- **Development**: `env.dev.template`
- **Staging**: `env.staging.template`  
- **Production**: `env.prod.template`
- **Parallel Upload**: `env.parallel_upload.template`
- **Upload Limits**: `env.upload_limits.template`

---

## 📊 **Performance Metrics**

### **Upload Performance**
- **100MB**: 42s → 14s (3x faster)
- **500MB**: 3:30 → 1:10 (3x faster)
- **900MB**: 6:18 → 1:15 (5x faster)
- **2GB**: 14:00 → 2:30 (5.6x faster)

### **System Capacity**
- **Concurrent Users**: 15-20 (vs 2-3 previously)
- **Memory Efficiency**: 60% reduction through pooling
- **Processing**: 8x faster with parallel chunks
- **Reliability**: 99%+ uptime with error handling

---

## 🎯 **Architecture Patterns**

### **Backend Patterns**
- **Service Layer Architecture**: Clean separation of business logic
- **Repository Pattern**: Data access abstraction
- **Dependency Injection**: FastAPI's built-in DI system
- **Middleware Pattern**: Request/response processing
- **Observer Pattern**: WebSocket event broadcasting
- **Factory Pattern**: Service instantiation
- **Strategy Pattern**: Storage provider selection

### **Frontend Patterns**
- **Component-Based Architecture**: Reusable Angular components
- **Service Layer**: Business logic in Angular services
- **Guard Pattern**: Route protection with guards
- **Interceptor Pattern**: HTTP request/response manipulation
- **Observable Pattern**: RxJS for reactive programming
- **Module Pattern**: Feature-based module organization

---

## 📝 **Documentation Files**

### **Implementation History** (`/Changes-history/`)
- `PARALLEL_UPLOAD_IMPLEMENTATION_SUMMARY.md` - Parallel upload system
- `GOOGLE_OAUTH_IMPLEMENTATION.md` - Google OAuth integration
- `FORGOT_PASSWORD_IMPLEMENTATION.md` - Password reset system
- `EMAIL_TEMPLATE_DESIGN_SYSTEM_UPDATE.md` - Email system
- `FRONTEND_5_FILE_UPLOAD_LIMIT_IMPLEMENTATION_SUMMARY.md` - Upload limits
- Plus 25+ other implementation documentation files

### **Technical Documentation** (`/docs/`)
- `PROJECT_STRUCTURE.md` - Project architecture overview
- `DEPLOYMENT.md` - Deployment instructions
- `DEVELOPMENT_WORKFLOW.md` - Development guidelines
- `ENVIRONMENT_MEMORY_LIMITS.md` - Memory configuration
- `UPLOAD_LIMITS_IMPLEMENTATION.md` - Upload quota system

---

This documentation provides a comprehensive overview of the DirectDriveX project structure, enabling Claude to understand the complete architecture, features, and capabilities of both the frontend and backend systems.
