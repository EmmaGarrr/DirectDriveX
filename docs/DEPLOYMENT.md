# DirectDriveX Deployment Guide

## 🚀 Overview

This guide covers deploying DirectDriveX to various environments including development, staging, and production.

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │   Database      │
│   (Angular)     │◄──►│   (FastAPI)     │◄──►│   (MongoDB)     │
│                 │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Web Server    │    │   Load Balancer │    │   Redis Cache   │
│   (Nginx)       │    │   (HAProxy)     │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🔧 Prerequisites

### System Requirements
- **CPU**: 2+ cores
- **RAM**: 4GB+ (8GB recommended)
- **Storage**: 20GB+ SSD
- **OS**: Ubuntu 20.04+, CentOS 8+, or macOS 10.15+

### Software Requirements
- **Docker**: 20.10+
- **Docker Compose**: 2.0+
- **Git**: 2.30+
- **Make**: 4.0+ (optional, for automation)

## 🐳 Docker Deployment (Recommended)

### 1. Production Docker Compose

Create `backend/docker-compose.prod.yml`:

```yaml
version: '3.8'

services:
  backend:
    build: .
    container_name: directdrive-backend
    restart: unless-stopped
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=mongodb://mongo:27017/directdrive
      - REDIS_URL=redis://redis:6379
      - SECRET_KEY=${SECRET_KEY}
      - DEBUG=False
    depends_on:
      - mongo
      - redis
    volumes:
      - ./uploads:/app/uploads
      - ./logs:/app/logs

  frontend:
    build: ../frontend
    container_name: directdrive-frontend
    restart: unless-stopped
    ports:
      - "80:80"
    depends_on:
      - backend

  mongo:
    image: mongo:6.0
    container_name: directdrive-mongo
    restart: unless-stopped
    environment:
      - MONGO_INITDB_ROOT_USERNAME=${MONGO_USER}
      - MONGO_INITDB_ROOT_PASSWORD=${MONGO_PASSWORD}
    volumes:
      - mongo_data:/data/db
      - ./mongo-init:/docker-entrypoint-initdb.d

  redis:
    image: redis:7-alpine
    container_name: directdrive-redis
    restart: unless-stopped
    command: redis-server --appendonly yes
    volumes:
      - redis_data:/data

  nginx:
    image: nginx:alpine
    container_name: directdrive-nginx
    restart: unless-stopped
    ports:
      - "443:443"
      - "80:80"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - backend
      - frontend

volumes:
  mongo_data:
  redis_data:
```

### 2. Frontend Dockerfile

Create `frontend/Dockerfile`:

```dockerfile
# Build stage
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine

COPY --from=builder /app/dist/directdrive-frontend /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### 3. Nginx Configuration

Create `backend/nginx.conf`:

```nginx
events {
    worker_connections 1024;
}

http {
    upstream backend {
        server backend:8000;
    }

    upstream frontend {
        server frontend:80;
    }

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=login:10m rate=5r/m;

    server {
        listen 80;
        server_name _;
        return 301 https://$host$request_uri;
    }

    server {
        listen 443 ssl http2;
        server_name _;

        ssl_certificate /etc/nginx/ssl/cert.pem;
        ssl_certificate_key /etc/nginx/ssl/key.pem;
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;

        # Frontend
        location / {
            proxy_pass http://frontend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
        }

        # Backend API
        location /api/ {
            limit_req zone=api burst=20 nodelay;
            proxy_pass http://backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        }

        # WebSocket support
        location /ws/ {
            proxy_pass http://backend;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "upgrade";
            proxy_set_header Host $host;
        }
    }
}
```

### 4. Environment Variables

Create `backend/.env.prod`:

```bash
# Database
MONGO_USER=admin
MONGO_PASSWORD=secure_password_here
DATABASE_URL=mongodb://admin:secure_password_here@mongo:27017/directdrive

# Redis
REDIS_URL=redis://redis:6379

# Security
SECRET_KEY=your_very_long_secret_key_here
DEBUG=False

# External Services
GOOGLE_DRIVE_CLIENT_ID=your_google_client_id
GOOGLE_DRIVE_CLIENT_SECRET=your_google_client_secret
HETZNER_API_TOKEN=your_hetzner_token
TELEGRAM_BOT_TOKEN=your_telegram_token
```

## 🚀 Deployment Steps

### 1. Clone and Setup

```bash
# Clone the repository
git clone <your-repo-url>
cd DirectDriveX

# Create production environment file
cp backend/.env.prod backend/.env
# Edit .env with your actual values
nano backend/.env
```

### 2. SSL Certificate Setup

```bash
cd backend
mkdir ssl
# Copy your SSL certificates
cp /path/to/your/cert.pem ssl/
cp /path/to/your/key.pem ssl/
```

### 3. Deploy

```bash
# Start all services
docker-compose -f docker-compose.prod.yml up -d

# Check status
docker-compose -f docker-compose.prod.yml ps

# View logs
docker-compose -f docker-compose.prod.yml logs -f
```

## ☁️ Cloud Deployment

### AWS Deployment

#### 1. EC2 Setup
```bash
# Launch EC2 instance (t3.medium or larger)
# Connect via SSH
ssh -i your-key.pem ubuntu@your-ec2-ip

# Install Docker
sudo apt update
sudo apt install -y docker.io docker-compose
sudo usermod -aG docker $USER
newgrp docker
```

#### 2. Deploy to EC2
```bash
# Clone repository
git clone <your-repo-url>
cd DirectDriveX/backend

# Start services
docker-compose -f docker-compose.prod.yml up -d
```

#### 3. Security Groups
- **Port 22**: SSH (your IP only)
- **Port 80**: HTTP
- **Port 443**: HTTPS
- **Port 8000**: Backend API (optional, for direct access)

### Google Cloud Platform

#### 1. Compute Engine Setup
```bash
# Create VM instance
gcloud compute instances create directdrive \
    --zone=us-central1-a \
    --machine-type=e2-medium \
    --image-family=ubuntu-2004-lts \
    --image-project=ubuntu-os-cloud

# Connect via SSH
gcloud compute ssh directdrive --zone=us-central1-a
```

#### 2. Deploy to GCP
```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
newgrp docker

# Clone and deploy
git clone <your-repo-url>
cd DirectDriveX/backend
docker-compose -f docker-compose.prod.yml up -d
```

### Azure Deployment

#### 1. VM Setup
```bash
# Create VM via Azure Portal or CLI
az vm create \
    --resource-group DirectDriveRG \
    --name DirectDriveVM \
    --image UbuntuLTS \
    --size Standard_D2s_v3 \
    --admin-username azureuser

# Connect via SSH
ssh azureuser@your-vm-ip
```

#### 2. Deploy to Azure
```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
newgrp docker

# Clone and deploy
git clone <your-repo-url>
cd DirectDriveX/backend
docker-compose -f docker-compose.prod.yml up -d
```

## 🔄 CI/CD Pipeline

### GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Deploy to server
      uses: appleboy/ssh-action@v0.1.5
      with:
        host: ${{ secrets.HOST }}
        username: ${{ secrets.USERNAME }}
        key: ${{ secrets.KEY }}
        script: |
          cd DirectDriveX/backend
          git pull origin main
          docker-compose -f docker-compose.prod.yml down
          docker-compose -f docker-compose.prod.yml up -d --build
```

### GitLab CI/CD

Create `.gitlab-ci.yml`:

```yaml
stages:
  - build
  - deploy

build:
  stage: build
  image: docker:latest
  services:
    - docker:dind
  script:
    - docker build -t directdrive-backend ./backend
    - docker build -t directdrive-frontend ./frontend

deploy:
  stage: deploy
  script:
    - ssh user@server "cd DirectDriveX/backend && git pull && docker-compose -f docker-compose.prod.yml up -d --build"
  only:
    - main
```

## 📊 Monitoring and Maintenance

### Health Checks

```bash
# Check service status
docker-compose -f docker-compose.prod.yml ps

# Check logs
docker-compose -f docker-compose.prod.yml logs -f

# Check resource usage
docker stats
```

### Backup Strategy

```bash
# Database backup
docker exec directdrive-mongo mongodump --out /backup/$(date +%Y%m%d)

# File backup
tar -czf uploads_backup_$(date +%Y%m%d).tar.gz uploads/

# Configuration backup
cp .env .env.backup.$(date +%Y%m%d)
```

### Update Process

```bash
# Pull latest code
git pull origin main

# Rebuild and restart
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml up -d --build

# Verify deployment
docker-compose -f docker-compose.prod.yml ps
```

## 🆘 Troubleshooting

### Common Issues

**Service won't start:**
```bash
# Check logs
docker-compose -f docker-compose.prod.yml logs service-name

# Check resource usage
docker stats

# Restart service
docker-compose -f docker-compose.prod.yml restart service-name
```

**Database connection issues:**
```bash
# Check MongoDB status
docker exec directdrive-mongo mongosh --eval "db.adminCommand('ping')"

# Check network connectivity
docker network ls
docker network inspect directdrivex_default
```

**SSL certificate issues:**
```bash
# Verify certificate paths
ls -la ssl/

# Check nginx configuration
docker exec directdrive-nginx nginx -t
```

### Performance Optimization

```bash
# Enable gzip compression in nginx
# Add to nginx.conf:
gzip on;
gzip_types text/plain text/css application/json application/javascript;

# Optimize MongoDB
# Add to docker-compose:
    command: mongod --wiredTigerCacheSizeGB 1

# Redis optimization
# Add to docker-compose:
    command: redis-server --maxmemory 256mb --maxmemory-policy allkeys-lru
```

## 📈 Scaling

### Horizontal Scaling

```yaml
# Add to docker-compose.prod.yml
services:
  backend:
    deploy:
      replicas: 3
    environment:
      - INSTANCE_ID=${HOSTNAME}
```

### Load Balancer

```yaml
# Add HAProxy service
  haproxy:
    image: haproxy:latest
    ports:
      - "80:80"
      - "8000:8000"
    volumes:
      - ./haproxy.cfg:/usr/local/etc/haproxy/haproxy.cfg
```

This deployment guide provides comprehensive coverage for deploying DirectDriveX in various environments. Choose the approach that best fits your infrastructure and requirements.
