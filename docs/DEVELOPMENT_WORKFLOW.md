# mfcnextgen Development Workflow

## 🚀 Getting Started

### Prerequisites
- **Python 3.8+** for backend development
- **Node.js 18+** and **npm** for frontend development
- **Docker** and **Docker Compose** for containerized development
- **Git** for version control

### Initial Setup

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd mfcnextgen
   ```

2. **Backend Setup**
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   ```

## 🔄 Development Workflow

### Daily Development Cycle

1. **Start Development Environment**
   ```bash
   # Terminal 1: Backend
   cd backend
   source venv/bin/activate
   python main.py
   
   # Terminal 2: Frontend
   cd frontend
   ng serve
   
   # Terminal 3: Docker Services (optional)
   cd backend
   docker-compose up -d
   ```

2. **Make Changes**
   - Backend changes in `/backend/app/`
   - Frontend changes in `/frontend/src/`
   - Both will auto-reload on file changes

3. **Test Changes**
   - Backend: API endpoints, unit tests
   - Frontend: Component testing, E2E tests

4. **Commit and Push**
   ```bash
   git add .
   git commit -m "feat: add new feature"
   git push origin main
   ```

### Branch Strategy

```
main (production)
├── develop (integration)
├── feature/user-management
├── feature/file-upload
├── bugfix/login-issue
└── hotfix/security-patch
```

**Branch Naming Convention:**
- `feature/` - New features
- `bugfix/` - Bug fixes
- `hotfix/` - Critical production fixes
- `chore/` - Maintenance tasks

## 🧪 Testing

### Backend Testing
```bash
cd backend
# Run all tests
pytest

# Run specific test file
pytest tests/test_auth.py

# Run with coverage
pytest --cov=app tests/
```

### Frontend Testing
```bash
cd frontend
# Unit tests
ng test

# E2E tests
ng e2e

# Build for production
ng build --prod
```

## 🐳 Docker Development

### Start All Services
```bash
cd backend
docker-compose up -d
```

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
```

### Stop Services
```bash
docker-compose down
```

### Rebuild and Restart
```bash
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

## 📦 Package Management

### Backend Dependencies
```bash
cd backend
# Add new package
pip install package-name
pip freeze > requirements.txt

# Update all packages
pip install --upgrade -r requirements.txt
```

### Frontend Dependencies
```bash
cd frontend
# Add new package
npm install package-name

# Add dev dependency
npm install --save-dev package-name

# Update packages
npm update
```

## 🔧 Configuration Management

### Environment Variables

**Backend** (`.env` file in backend directory):
```bash
DATABASE_URL=mongodb://localhost:27017/mfcnextgen
REDIS_URL=redis://localhost:6379
SECRET_KEY=your-secret-key
DEBUG=True
```

**Frontend** (environment files):
```bash
# frontend/src/environments/environment.ts
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8000',
  wsUrl: 'ws://localhost:8000'
};
```

## 📝 Code Quality

### Backend Code Quality
```bash
cd backend
# Format code
black app/

# Lint code
flake8 app/

# Type checking
mypy app/
```

### Frontend Code Quality
```bash
cd frontend
# Lint code
ng lint

# Format code
npx prettier --write src/
```

## 🚀 Deployment

### Backend Deployment
```bash
cd backend
# Build Docker image
docker build -t mfcnextgen-backend .

# Run in production
docker run -d -p 8000:8000 mfcnextgen-backend
```

### Frontend Deployment
```bash
cd frontend
# Build for production
ng build --prod

# Deploy to static hosting (e.g., Vercel, Netlify)
# Copy dist/ directory contents to hosting service
```

## 🔍 Debugging

### Backend Debugging
```bash
cd backend
# Run with debug logging
DEBUG=True python main.py

# Use Python debugger
import pdb; pdb.set_trace()
```

### Frontend Debugging
```bash
cd frontend
# Run with source maps
ng serve --source-map

# Use browser dev tools
# Angular DevTools extension
```

## 📊 Monitoring

### Backend Monitoring
- Application logs in console
- Performance metrics
- Error tracking
- Database query monitoring

### Frontend Monitoring
- Browser console logs
- Performance profiling
- Error boundary logging
- User interaction tracking

## 🤝 Collaboration

### Code Review Process
1. Create feature branch
2. Make changes and test
3. Push to remote branch
4. Create pull request
5. Code review and approval
6. Merge to develop branch

### Communication
- Use descriptive commit messages
- Document API changes
- Update README for new features
- Tag releases with semantic versioning

## 🆘 Troubleshooting

### Common Issues

**Backend won't start:**
- Check if port 8000 is available
- Verify virtual environment is activated
- Check requirements.txt installation

**Frontend won't compile:**
- Clear node_modules and reinstall
- Check Angular version compatibility
- Verify TypeScript configuration

**Docker issues:**
- Check if Docker is running
- Clear Docker cache: `docker system prune`
- Verify docker-compose.yml syntax

**Database connection issues:**
- Check MongoDB service status
- Verify connection string
- Check network connectivity

### Getting Help
1. Check existing documentation
2. Search GitHub issues
3. Create detailed bug report
4. Ask in team chat/forum
