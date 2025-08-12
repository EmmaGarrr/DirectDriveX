# Migration Guide: From Separate Repositories to DirectDriveX Monorepo

## 🎯 Overview

This guide helps you migrate from managing separate `DirectDrive` (backend) and `Directdrive-frontend` repositories to the new consolidated `DirectDriveX` monorepo.

## 🚀 Benefits of the Monorepo

- **Single Repository**: One place to manage all code
- **Unified Versioning**: Coordinated releases and deployments
- **Easier Collaboration**: Team members work on related changes together
- **Simplified CI/CD**: Single pipeline for both frontend and backend
- **Better Dependency Management**: Shared configurations and tools
- **Easier Testing**: Test both systems together

## 📋 Pre-Migration Checklist

Before starting the migration, ensure you have:

- [ ] Backed up both repositories
- [ ] Noted any uncommitted changes
- [ ] Documented current deployment configurations
- [ ] Notified team members about the migration
- [ ] Scheduled a maintenance window if needed

## 🔄 Migration Steps

### Step 1: Backup Current Repositories

```bash
# Create backups of current repositories
cp -r DirectDrive DirectDrive_backup_$(date +%Y%m%d)
cp -r Directdrive-frontend Directdrive-frontend_backup_$(date +%Y%m%d)
```

### Step 2: Clone the New Monorepo

```bash
# Clone the new DirectDriveX repository
git clone <your-new-repo-url> DirectDriveX
cd DirectDriveX
```

### Step 3: Verify Structure

Ensure the monorepo has the correct structure:

```
DirectDriveX/
├── backend/          # Your Python/FastAPI backend
├── frontend/         # Your Angular frontend
├── docs/            # Documentation
├── Makefile         # Development commands
├── quick-start.sh   # Setup script
└── README.md        # Project overview
```

### Step 4: Update Remote URLs

```bash
# Update your local repositories to point to the new monorepo
cd ../DirectDrive
git remote set-url origin <new-monorepo-url>

cd ../Directdrive-frontend
git remote set-url origin <new-monorepo-url>
```

### Step 5: Test the New Setup

```bash
cd ../DirectDriveX

# Test development setup
./quick-start.sh --full-dev

# Or use Make commands
make dev
```

## 🔧 Configuration Updates

### Backend Configuration

1. **Environment Variables**: Copy your existing `.env` file to `backend/.env`
2. **Docker Compose**: Update any custom Docker configurations
3. **Database Connections**: Verify MongoDB and Redis connection strings

### Frontend Configuration

1. **API Endpoints**: Update API base URLs if needed
2. **Environment Files**: Copy your environment configurations
3. **Build Settings**: Verify Angular build configurations

## 🚀 Deployment Migration

### Development Environment

```bash
# Old way (separate repos)
cd DirectDrive && python main.py
cd Directdrive-frontend && ng serve

# New way (monorepo)
cd DirectDriveX
make dev
# Or
./quick-start.sh --full-dev
```

### Production Environment

```bash
# Old way
cd DirectDrive && docker-compose up -d
cd Directdrive-frontend && ng build --prod

# New way
cd DirectDriveX
make prod
# Or
./quick-start.sh --full-prod
```

## 📝 Git Workflow Changes

### Before (Separate Repositories)

```bash
# Backend changes
cd DirectDrive
git add .
git commit -m "feat: add new API endpoint"
git push origin main

# Frontend changes
cd Directdrive-frontend
git add .
git commit -m "feat: add new component"
git push origin main
```

### After (Monorepo)

```bash
# All changes in one place
cd DirectDriveX
git add .
git commit -m "feat: add new API endpoint and component"
git push origin main
```

### Branch Strategy

```bash
# Create feature branches for related changes
git checkout -b feature/user-management
# Make changes to both backend and frontend
git add .
git commit -m "feat: complete user management system"
git push origin feature/user-management
```

## 🐳 Docker Changes

### Development

```bash
# Old way
cd DirectDrive && docker-compose up -d

# New way
cd DirectDriveX/backend && docker-compose up -d
```

### Production

```bash
# Old way
cd DirectDrive && docker-compose -f docker-compose.prod.yml up -d

# New way
cd DirectDriveX/backend && docker-compose -f docker-compose.prod.yml up -d
```

## 🔍 Troubleshooting Migration Issues

### Common Issues

1. **Path References**: Update any hardcoded paths in your code
2. **Import Statements**: Verify Python and TypeScript imports still work
3. **Environment Variables**: Ensure all environment variables are properly set
4. **Docker Volumes**: Check volume mounting paths in Docker configurations

### Verification Commands

```bash
# Check if services are running
make status

# View logs
make logs

# Test backend
curl http://localhost:8000/health

# Test frontend
curl http://localhost:4200
```

## 📚 Post-Migration Tasks

### 1. Update Documentation

- Update team documentation
- Update deployment guides
- Update CI/CD pipelines

### 2. Team Training

- Train team on new workflow
- Update development guidelines
- Share new commands and shortcuts

### 3. Monitor and Optimize

- Monitor deployment success rates
- Gather feedback from team
- Optimize workflow based on usage

## 🎉 Migration Complete!

Once migration is complete:

- ✅ All code is in one repository
- ✅ Development workflow is simplified
- ✅ Deployment process is unified
- ✅ Team collaboration is improved
- ✅ Maintenance is easier

## 🆘 Getting Help

If you encounter issues during migration:

1. Check the troubleshooting section above
2. Review the documentation in the `docs/` folder
3. Use the `make help` command for available options
4. Run `./quick-start.sh --help` for setup options
5. Check the logs with `make logs`

## 🔄 Rollback Plan

If you need to rollback:

```bash
# Restore from backups
cp -r DirectDrive_backup_$(date +%Y%m%d) DirectDrive
cp -r Directdrive-frontend_backup_$(date +%Y%m%d) Directdrive-frontend

# Update remote URLs back to original repositories
cd DirectDrive
git remote set-url origin <original-backend-repo-url>

cd ../Directdrive-frontend
git remote set-url origin <original-frontend-repo-url>
```

---

**Note**: This migration guide assumes you're moving from the exact repository structure described. Adjust the paths and commands according to your specific setup.
