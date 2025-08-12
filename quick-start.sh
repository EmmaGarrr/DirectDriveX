#!/bin/bash

# DirectDriveX Quick Start Script
# This script helps you get started with the DirectDriveX monorepo

set -e

echo "🚀 DirectDriveX Quick Start"
echo "============================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if required tools are installed
check_requirements() {
    print_status "Checking system requirements..."
    
    # Check Docker
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    # Check Docker Compose
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
    
    # Check Python
    if ! command -v python3 &> /dev/null; then
        print_error "Python 3 is not installed. Please install Python 3 first."
        exit 1
    fi
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js first."
        exit 1
    fi
    
    # Check npm
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed. Please install npm first."
        exit 1
    fi
    
    print_success "All requirements are met!"
}

# Setup development environment
setup_dev() {
    print_status "Setting up development environment..."
    
    # Backend setup
    print_status "Setting up backend..."
    cd backend
    
    # Create virtual environment
    if [ ! -d "venv" ]; then
        print_status "Creating Python virtual environment..."
        python3 -m venv venv
    fi
    
    # Activate virtual environment and install dependencies
    print_status "Installing Python dependencies..."
    source venv/bin/activate
    pip install -r requirements.txt
    deactivate
    
    cd ..
    
    # Frontend setup
    print_status "Setting up frontend..."
    cd frontend
    print_status "Installing Node.js dependencies..."
    npm install
    cd ..
    
    print_success "Development environment setup completed!"
}

# Setup production environment
setup_prod() {
    print_status "Setting up production environment..."
    
    cd backend
    
    # Create production environment file
    if [ ! -f ".env" ]; then
        if [ -f "env.prod.template" ]; then
            print_status "Creating production environment file..."
            cp env.prod.template .env
            print_warning "Please edit .env file with your production values before starting services."
        else
            print_error "Production environment template not found!"
            exit 1
        fi
    fi
    
    # Create required directories
    mkdir -p uploads logs ssl mongo-init
    
    cd ..
    
    print_success "Production environment setup completed!"
}

# Start development services
start_dev() {
    print_status "Starting development services..."
    
    cd backend
    
    # Start MongoDB and Redis
    print_status "Starting MongoDB and Redis..."
    docker-compose up -d mongo redis
    
    print_success "Development services started!"
    echo ""
    echo "Next steps:"
    echo "1. Backend: cd backend && source venv/bin/activate && python main.py"
    echo "2. Frontend: cd frontend && ng serve"
    echo "3. View logs: make logs"
    echo ""
    
    cd ..
}

# Start production services
start_prod() {
    print_status "Starting production services..."
    
    cd backend
    
    # Check if .env exists
    if [ ! -f ".env" ]; then
        print_error "Production environment file (.env) not found!"
        print_status "Please run: ./quick-start.sh --setup-prod"
        exit 1
    fi
    
    # Start all services
    print_status "Starting all production services..."
    docker-compose -f docker-compose.prod.yml up -d
    
    print_success "Production services started!"
    echo ""
    echo "Services are running on:"
    echo "- Frontend: http://localhost"
    echo "- Backend API: http://localhost:8000"
    echo "- MongoDB: localhost:27017"
    echo "- Redis: localhost:6379"
    echo ""
    echo "View logs: make logs-prod"
    echo "Stop services: make stop"
    
    cd ..
}

# Show help
show_help() {
    echo "DirectDriveX Quick Start Script"
    echo ""
    echo "Usage: $0 [OPTION]"
    echo ""
    echo "Options:"
    echo "  --setup-dev      Setup development environment"
    echo "  --setup-prod     Setup production environment"
    echo "  --start-dev      Start development services"
    echo "  --start-prod     Start production services"
    echo "  --full-dev       Setup and start development environment"
    echo "  --full-prod      Setup and start production environment"
    echo "  --help           Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 --setup-dev      # Setup development environment only"
    echo "  $0 --start-dev      # Start development services only"
    echo "  $0 --full-dev       # Setup and start development environment"
    echo "  $0 --full-prod      # Setup and start production environment"
}

# Main script logic
main() {
    case "${1:-}" in
        --setup-dev)
            check_requirements
            setup_dev
            ;;
        --setup-prod)
            check_requirements
            setup_prod
            ;;
        --start-dev)
            start_dev
            ;;
        --start-prod)
            start_prod
            ;;
        --full-dev)
            check_requirements
            setup_dev
            start_dev
            ;;
        --full-prod)
            check_requirements
            setup_prod
            start_prod
            ;;
        --help|-h|help)
            show_help
            ;;
        "")
            print_status "No option specified. Showing help..."
            echo ""
            show_help
            ;;
        *)
            print_error "Unknown option: $1"
            echo ""
            show_help
            exit 1
            ;;
    esac
}

# Run main function with all arguments
main "$@"
