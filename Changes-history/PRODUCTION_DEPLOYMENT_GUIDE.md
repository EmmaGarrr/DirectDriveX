# 🚀 Production Deployment Guide - DirectDrive Backend

## 📋 Table of Contents
- [Overview](#overview)
- [Server Access](#server-access)
- [Initial Setup](#initial-setup)
- [Deployment Workflow](#deployment-workflow)
- [Server Management](#server-management)
- [Troubleshooting](#troubleshooting)
- [Emergency Procedures](#emergency-procedures)
- [Monitoring](#monitoring)
- [Quick Reference](#quick-reference)

---

## 🎯 Overview

This guide covers the complete production deployment and management of the DirectDrive backend server running on OHV cloud VPS.

**Current Setup:**
- **Server**: OHV Cloud VPS
- **User**: ubuntu
- **Port**: 8000
- **Method**: nohup with uvicorn
- **Location**: `/home/ubuntu/directdrive-backend/DirectDriveX/backend`

---

## 🔑 Server Access

```bash
# SSH into the server
ssh ubuntu@135.148.33.247

# Navigate to project directory
cd directdrive-backend/DirectDriveX/backend
```

---

## ⚙️ Initial Setup

### Prerequisites
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install dependencies
sudo apt install -y python3 python3-pip python3-venv git curl

# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install requirements
pip install -r requirements.txt
```

### Environment Setup
```bash
# Copy environment file
cp .env.example .env

# Edit environment variables
nano .env

# Set production values in .env file
```

---

## 🔄 Deployment Workflow

### Step 1: Stop Current Server
```bash
# Stop the running server
pkill -f "uvicorn app.main:app"

# Verify it's stopped
ps aux | grep uvicorn
```

### Step 2: Pull Latest Code
```bash
# Navigate to backend directory
cd /home/ubuntu/directdrive-backend/DirectDriveX/backend

# Pull latest code from main branch
git pull origin main

# Or pull specific branch
git pull origin your-branch-name

# Or pull specific commit
git fetch origin
git checkout commit-hash
```

### Step 3: Update Dependencies
```bash
# Activate virtual environment
source venv/bin/activate

# Install/update dependencies
pip install -r requirements.txt
```

### Step 4: Start Server
```bash
# Start server in background
nohup uvicorn app.main:app --host 0.0.0.0 --port 5000 --reload > app.log 2>&1 &

# Verify it's running
ps aux | grep uvicorn

# Check logs
tail -f app.log
```

### Step 5: Verify Deployment
```bash
# Test health endpoint
curl http://localhost:8000/health

# Check server status
curl http://localhost:5000/
```

---

## 🛠️ Server Management

### Start Server
```bash
nohup uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload > app.log 2>&1 &
```

### Stop Server
```bash
pkill -f "uvicorn app.main:app"
```

### Restart Server
```bash
# Stop
pkill -f "uvicorn app.main:app"

# Wait a moment
sleep 2

# Start
nohup uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload > app.log 2>&1 &
```

### Check Server Status
```bash
# Check if running
ps aux | grep uvicorn

# Check logs
tail -f app.log

# Test endpoint
curl http://localhost:8000/health
```

---

## 🔧 Troubleshooting

### Port Already in Use
```bash
# Check what's using port 8000
sudo lsof -i:8000

# Kill process on port 8000
sudo fuser -k 8000/tcp

# Or kill specific process
sudo kill -9 $(sudo lsof -ti:8000)
```

### Process Won't Stop
```bash
# Force kill uvicorn processes
sudo pkill -f "uvicorn app.main:app"

# Kill all Python processes (be careful!)
sudo pkill -f python
```

### Docker Conflicts (If Previously Used)
```bash
# Stop all Docker containers
sudo docker stop $(sudo docker ps -q)

# Remove containers
sudo docker rm $(sudo docker ps -aq)

# Stop Docker service
sudo systemctl stop docker
```

### Check Server Health
```bash
# Test health endpoint
curl http://localhost:8000/health

# Check response
curl -v http://localhost:8000/

# Check logs for errors
tail -f app.log
```

---

## 🚨 Emergency Procedures

### Complete Server Reset
```bash
# Kill everything
sudo pkill -f uvicorn
sudo pkill -f "python.*uvicorn"
sudo fuser -k 8000/tcp
sudo fuser -k 5000/tcp

# Stop Docker if running
sudo docker stop $(sudo docker ps -q) 2>/dev/null

# Verify cleanup
ps aux | grep uvicorn
sudo lsof -i:8000
```

### Server Won't Start
```bash
# Check for errors
tail -f app.log

# Check port availability
sudo lsof -i:8000

# Check Python environment
which python3
python3 --version

# Check virtual environment
source venv/bin/activate
pip list
```

---

## 📊 Monitoring

### Real-time Monitoring
```bash
# Watch server logs
tail -f app.log

# Monitor process
watch -n 1 'ps aux | grep uvicorn'

# Monitor resource usage
htop

# Check disk space
df -h
```

### Health Checks
```bash
# Automated health check
curl -f http://localhost:8000/health || echo "Server is down!"

# Check response time
curl -w "@-" -o /dev/null -s "http://localhost:8000/health" <<'EOF'
     time_namelookup:  %{time_namelookup}\n
        time_connect:  %{time_connect}\n
     time_appconnect:  %{time_appconnect}\n
    time_pretransfer:  %{time_pretransfer}\n
       time_redirect:  %{time_redirect}\n
  time_starttransfer:  %{time_starttransfer}\n
                     ----------\n
          time_total:  %{time_total}\n
EOF
```

---

## 📝 Quick Reference

### Essential Commands
```bash
# Start server
nohup uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload > app.log 2>&1 &

# Stop server
pkill -f "uvicorn app.main:app"

# Check status
ps aux | grep uvicorn

# View logs
tail -f app.log

# Pull latest code
git pull origin main

# Test server
curl http://localhost:8000/health
```

### Management Script
Create `manage-server.sh` for easier management:

```bash
#!/bin/bash

case "$1" in
    start)
        echo "Starting server..."
        nohup uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload > app.log 2>&1 &
        echo "Server started. PID: $!"
        ;;
    stop)
        echo "Stopping server..."
        pkill -f "uvicorn app.main:app"
        echo "Server stopped."
        ;;
    restart)
        echo "Restarting server..."
        pkill -f "uvicorn app.main:app"
        sleep 2
        nohup uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload > app.log 2>&1 &
        echo "Server restarted. PID: $!"
        ;;
    status)
        if pgrep -f "uvicorn app.main:app" > /dev/null; then
            echo "Server is running"
            ps aux | grep uvicorn | grep -v grep
        else
            echo "Server is not running"
        fi
        ;;
    logs)
        tail -f app.log
        ;;
    deploy)
        echo "Deploying latest code..."
        pkill -f "uvicorn app.main:app"
        git pull origin main
        source venv/bin/activate
        pip install -r requirements.txt
        nohup uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload > app.log 2>&1 &
        echo "Deployment complete!"
        ;;
    *)
        echo "Usage: $0 {start|stop|restart|status|logs|deploy}"
        exit 1
        ;;
esac
```

**Make executable:**
```bash
chmod +x manage-server.sh
```

**Usage:**
```bash
./manage-server.sh start
./manage-server.sh stop
./manage-server.sh restart
./manage-server.sh status
./manage-server.sh logs
./manage-server.sh deploy
```

---

## 🔍 Understanding the nohup Command

```bash
nohup uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload > app.log 2>&1 &
```

**Breakdown:**
- `nohup` = "no hang up" - keeps process running when terminal closes
- `uvicorn app.main:app` = starts the FastAPI server
- `--host 0.0.0.0` = listen on all network interfaces
- `--port 8000` = use port 8000
- `--reload` = auto-reload on code changes
- `> app.log` = redirect output to app.log file
- `2>&1` = redirect errors to same file
- `&` = run in background

---

## 📞 Support

**For issues:**
1. Check logs: `tail -f app.log`
2. Check status: `ps aux | grep uvicorn`
3. Test endpoint: `curl http://localhost:8000/health`
4. Check port: `sudo lsof -i:8000`

**Emergency contacts:**
- Team Lead: [Contact Info]
- DevOps: [Contact Info]

---

## 📅 Last Updated
- **Date**: August 2024
- **Version**: 1.0
- **Author**: DirectDrive Team
- **Status**: Production Ready

---

**⚠️ Important Notes:**
- Always backup before major deployments
- Test in staging environment first
- Monitor logs after deployment
- Keep this documentation updated
