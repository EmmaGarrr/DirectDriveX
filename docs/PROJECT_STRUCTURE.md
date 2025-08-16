# mfcnextgen Project Structure

## Overview
mfcnextgen is a monorepo containing both the backend (Python/FastAPI) and frontend (Angular) components of the cloud storage management platform.

## Directory Structure

### Root Level
```
mfcnextgen/
├── README.md              # Main project documentation
├── .gitignore            # Git ignore patterns
├── backend/              # Backend application
├── frontend/             # Frontend application
└── docs/                 # Project documentation
```

### Backend (`/backend`)
```
backend/
├── app/                  # Main application package
│   ├── __init__.py
│   ├── api/             # API route definitions
│   │   ├── v1/          # API version 1
│   │   │   ├── routes_admin_auth.py
│   │   │   ├── routes_admin_config.py
│   │   │   ├── routes_admin_files.py
│   │   │   ├── routes_admin_monitoring.py
│   │   │   ├── routes_admin_notifications.py
│   │   │   ├── routes_admin_reports.py
│   │   │   ├── routes_admin_storage.py
│   │   │   ├── routes_admin_users.py
│   │   │   ├── routes_auth.py
│   │   │   ├── routes_batch_upload.py
│   │   │   ├── routes_download.py
│   │   │   └── routes_upload.py
│   ├── core/            # Core configuration
│   │   └── config.py
│   ├── db/              # Database models and connections
│   │   └── mongodb.py
│   ├── middleware/      # Custom middleware
│   │   └── priority_middleware.py
│   ├── models/          # Data models
│   │   ├── admin.py
│   │   ├── batch.py
│   │   ├── file.py
│   │   ├── google_drive_account.py
│   │   └── user.py
│   ├── schemas/         # Pydantic schemas
│   │   └── file.py
│   ├── services/        # Business logic services
│   │   ├── admin_auth_service.py
│   │   ├── auth_service.py
│   │   ├── background_process_manager.py
│   │   ├── backup_service.py
│   │   ├── file_metadata_service.py
│   │   ├── google_drive_account_service.py
│   │   ├── google_drive_service.py
│   │   ├── hetzner_service.py
│   │   ├── storage_service.py
│   │   ├── telegram_service.py
│   │   └── zipping_service.py
│   ├── tasks/           # Celery background tasks
│   │   ├── file_transfer_task.py
│   │   └── telegram_uploader_task.py
│   ├── celery_worker.py # Celery worker configuration
│   ├── main.py          # FastAPI application entry point
│   ├── progress_manager.py
│   └── ws_manager.py    # WebSocket manager
├── requirements.txt      # Python dependencies
├── Dockerfile           # Backend containerization
├── docker-compose.yml   # Docker orchestration
├── create_admin.py      # Admin user creation script
├── generate_token.py    # Token generation utility
└── supervisord.conf     # Process supervision
```

### Frontend (`/frontend`)
```
frontend/
├── src/                 # Source code
│   ├── app/            # Main application
│   │   ├── admin-panel/ # Admin panel components
│   │   │   ├── activity-logs/
│   │   │   ├── admin-auth/
│   │   │   ├── background-processes/
│   │   │   ├── backup-management/
│   │   │   ├── create-admin/
│   │   │   ├── drive-file-management/
│   │   │   ├── file-browser/
│   │   │   ├── google-drive-management/
│   │   │   ├── hetzner-file-management/
│   │   │   ├── notification-system/
│   │   │   ├── reports-export/
│   │   │   ├── security-settings/
│   │   │   ├── storage-cleanup/
│   │   │   ├── system-monitoring/
│   │   │   ├── user-analytics/
│   │   │   └── user-management/
│   │   ├── componet/   # Main application components
│   │   │   ├── batch-download/
│   │   │   ├── batch-upload/
│   │   │   ├── dashboard/
│   │   │   ├── download/
│   │   │   ├── file-preview/
│   │   │   ├── forgot-password/
│   │   │   ├── home/
│   │   │   ├── login/
│   │   │   ├── profile/
│   │   │   ├── register/
│   │   │   └── reset-password/
│   │   ├── guards/     # Route guards
│   │   ├── interceptors/ # HTTP interceptors
│   │   ├── models/     # TypeScript interfaces
│   │   ├── services/   # Angular services
│   │   └── shared/     # Shared components and utilities
│   ├── assets/         # Static assets
│   ├── environments/   # Environment configurations
│   ├── styles.css      # Global styles
│   ├── custom-theme.scss
│   └── main.ts         # Application entry point
├── package.json         # Node dependencies
├── angular.json         # Angular configuration
├── tailwind.config.js   # Tailwind CSS configuration
└── tsconfig.json        # TypeScript configuration
```

## Key Technologies

### Backend
- **FastAPI**: Modern Python web framework
- **MongoDB**: NoSQL database
- **Celery**: Asynchronous task queue
- **Redis**: Caching and message broker
- **JWT**: Authentication tokens
- **WebSockets**: Real-time communication

### Frontend
- **Angular 17**: Modern frontend framework
- **TypeScript**: Type-safe JavaScript
- **Tailwind CSS**: Utility-first CSS framework
- **RxJS**: Reactive programming
- **Angular Material**: UI component library

## Development Workflow

### Backend Development
1. Navigate to `/backend`
2. Activate virtual environment
3. Install dependencies: `pip install -r requirements.txt`
4. Run development server: `python main.py`

### Frontend Development
1. Navigate to `/frontend`
2. Install dependencies: `npm install`
3. Run development server: `ng serve`

### Docker Development
1. Navigate to `/backend`
2. Start services: `docker-compose up -d`
3. Access services at configured ports

## Configuration Files

### Backend Configuration
- `backend/app/core/config.py`: Environment variables and settings
- `backend/docker-compose.yml`: Service orchestration
- `backend/requirements.txt`: Python package dependencies

### Frontend Configuration
- `frontend/angular.json`: Angular build and serve configuration
- `frontend/tailwind.config.js`: CSS framework configuration
- `frontend/tsconfig.json`: TypeScript compilation settings

## Deployment

### Backend Deployment
- Docker containers for production
- Environment-specific configuration
- Process supervision with Supervisor

### Frontend Deployment
- Build optimization for production
- Static file serving
- CDN integration support

## Monitoring and Logging

- Application logs in backend
- Error tracking and reporting
- Performance monitoring
- User activity tracking
