# DirectDriveX Development Makefile

.PHONY: help install-dev install-prod start-dev start-prod stop clean logs test build deploy

# Default target
help:
	@echo "DirectDriveX Development Commands:"
	@echo ""
	@echo "Development:"
	@echo "  install-dev    Install development dependencies"
	@echo "  start-dev      Start development environment"
	@echo "  stop           Stop all services"
	@echo "  logs           View service logs"
	@echo "  test           Run tests"
	@echo ""
	@echo "Production:"
	@echo "  install-prod   Install production dependencies"
	@echo "  start-prod     Start production environment"
	@echo "  build          Build production images"
	@echo "  deploy         Deploy to production"
	@echo ""
	@echo "Maintenance:"
	@echo "  clean          Clean up containers and volumes"
	@echo "  backup         Create database backup"
	@echo "  update         Update dependencies"

# Development Setup
install-dev:
	@echo "Installing development dependencies..."
	@cd backend && python -m venv venv
	@cd backend && . venv/bin/activate && pip install -r requirements.txt
	@cd frontend && npm install
	@echo "Development dependencies installed successfully!"

install-prod:
	@echo "Installing production dependencies..."
	@cd backend && pip install -r requirements.txt
	@cd frontend && npm ci --only=production
	@echo "Production dependencies installed successfully!"

# Development Environment
start-dev:
	@echo "Starting development environment..."
	@cd backend && docker-compose up -d mongo redis
	@echo "Backend services started. Run 'cd backend && source venv/bin/activate && python main.py' in another terminal"
	@echo "Frontend: Run 'cd frontend && ng serve' in another terminal"

start-prod:
	@echo "Starting production environment..."
	@cd backend && docker-compose -f docker-compose.prod.yml up -d
	@echo "Production environment started!"

stop:
	@echo "Stopping all services..."
	@cd backend && docker-compose down
	@cd backend && docker-compose -f docker-compose.prod.yml down 2>/dev/null || true
	@echo "All services stopped!"

# Logs and Monitoring
logs:
	@echo "Viewing service logs..."
	@cd backend && docker-compose logs -f

logs-prod:
	@echo "Viewing production service logs..."
	@cd backend && docker-compose -f docker-compose.prod.yml logs -f

# Testing
test:
	@echo "Running tests..."
	@cd backend && source venv/bin/activate && pytest
	@cd frontend && ng test --watch=false

test-backend:
	@echo "Running backend tests..."
	@cd backend && source venv/bin/activate && pytest

test-frontend:
	@echo "Running frontend tests..."
	@cd frontend && ng test --watch=false

# Building and Deployment
build:
	@echo "Building production images..."
	@cd backend && docker build -t directdrive-backend .
	@cd frontend && docker build -t directdrive-frontend .
	@echo "Images built successfully!"

deploy:
	@echo "Deploying to production..."
	@cd backend && docker-compose -f docker-compose.prod.yml up -d --build
	@echo "Deployment completed!"

# Maintenance
clean:
	@echo "Cleaning up containers and volumes..."
	@cd backend && docker-compose down -v
	@cd backend && docker-compose -f docker-compose.prod.yml down -v 2>/dev/null || true
	@docker system prune -f
	@echo "Cleanup completed!"

backup:
	@echo "Creating database backup..."
	@mkdir -p backups
	@cd backend && docker exec directdrive-mongo mongodump --out /backup/$(shell date +%Y%m%d) 2>/dev/null || echo "MongoDB container not running"
	@echo "Backup completed!"

update:
	@echo "Updating dependencies..."
	@cd backend && source venv/bin/activate && pip install --upgrade -r requirements.txt
	@cd frontend && npm update
	@echo "Dependencies updated!"

# Database Management
db-shell:
	@echo "Opening MongoDB shell..."
	@cd backend && docker exec -it directdrive-mongo mongosh

db-reset:
	@echo "Resetting database..."
	@cd backend && docker-compose down -v
	@cd backend && docker-compose up -d mongo
	@echo "Database reset completed!"

# Frontend Development
frontend-serve:
	@echo "Starting frontend development server..."
	@cd frontend && ng serve

frontend-build:
	@echo "Building frontend for production..."
	@cd frontend && ng build --prod

# Backend Development
backend-serve:
	@echo "Starting backend development server..."
	@cd backend && source venv/bin/activate && python main.py

backend-shell:
	@echo "Opening Python shell..."
	@cd backend && source venv/bin/activate && python

# Docker Management
docker-status:
	@echo "Docker service status:"
	@cd backend && docker-compose ps
	@echo ""
	@echo "Docker resource usage:"
	@docker stats --no-stream

docker-rebuild:
	@echo "Rebuilding Docker images..."
	@cd backend && docker-compose build --no-cache
	@cd frontend && docker build --no-cache -t directdrive-frontend .
	@echo "Images rebuilt successfully!"

# Quick Commands
dev: install-dev start-dev
prod: install-prod start-prod
restart: stop start-dev
status: docker-status
