# mfcnextgen

A comprehensive cloud storage management platform with integrated frontend and backend systems.

## 🏗️ Project Structure

```
mfcnextgen/
├── backend/                 # Python FastAPI Backend
│   ├── app/                # Main application code
│   ├── requirements.txt    # Python dependencies
│   ├── Dockerfile         # Backend containerization
│   └── docker-compose.yml # Docker orchestration
├── frontend/               # Angular Frontend
│   ├── src/               # Source code
│   ├── package.json       # Node dependencies
│   └── angular.json       # Angular configuration
└── docs/                  # Documentation
```

## 🚀 Quick Start

### Backend Setup
```bash
cd backend
python -m venv venv
venv/Scripts/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 5000 --reload
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### Docker Setup
```bash
cd backend
docker-compose up -d
```

## 🔧 Development

### Backend Development
- **Framework**: FastAPI
- **Database**: MongoDB
- **Task Queue**: Celery + Redis
- **Authentication**: JWT tokens

### Frontend Development
- **Framework**: Angular 17
- **Styling**: Tailwind CSS
- **State Management**: Angular Services
- **UI Components**: Custom BOLT design system

## 📁 Key Features

- **User Management**: Authentication, authorization, profile management
- **File Operations**: Upload, download, batch processing
- **Storage Management**: Google Drive, Hetzner integration
- **Admin Panel**: Comprehensive system monitoring and management
- **Real-time Updates**: WebSocket integration for live updates

## 🐳 Docker

The project includes Docker support for easy deployment:
- Backend container with FastAPI
- Redis container for caching and task queues
- MongoDB container for data persistence

## 📚 Documentation

See the `docs/` folder for detailed documentation on:
- API endpoints
- Database schemas
- Deployment guides
- Development workflows

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is proprietary software. All rights reserved.
