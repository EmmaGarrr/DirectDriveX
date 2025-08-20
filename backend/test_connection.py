#!/usr/bin/env python3
"""
Simple test script to check backend configuration and dependencies
"""

import os
import sys
from pathlib import Path

# Add the current directory to Python path
sys.path.append(str(Path(__file__).parent))

def test_imports():
    """Test if all required modules can be imported"""
    print("Testing imports...")
    
    try:
        import fastapi
        print("✅ FastAPI imported successfully")
    except ImportError as e:
        print(f"❌ FastAPI import failed: {e}")
        return False
    
    try:
        import uvicorn
        print("✅ Uvicorn imported successfully")
    except ImportError as e:
        print(f"❌ Uvicorn import failed: {e}")
        return False
    
    try:
        import pymongo
        print("✅ PyMongo imported successfully")
    except ImportError as e:
        print(f"❌ PyMongo import failed: {e}")
        return False
    
    try:
        from app.core.config import settings
        print("✅ Settings imported successfully")
        print(f"   MongoDB URI: {settings.MONGODB_URI}")
        print(f"   Database Name: {settings.DATABASE_NAME}")
        print(f"   JWT Algorithm: {settings.JWT_ALGORITHM}")
    except Exception as e:
        print(f"❌ Settings import failed: {e}")
        return False
    
    return True

def test_mongodb_connection():
    """Test MongoDB connection"""
    print("\nTesting MongoDB connection...")
    
    try:
        from pymongo import MongoClient
        from app.core.config import settings
        
        client = MongoClient(settings.MONGODB_URI, serverSelectionTimeoutMS=5000)
        # Test the connection
        client.admin.command('ping')
        print("✅ MongoDB connection successful")
        client.close()
        return True
    except Exception as e:
        print(f"❌ MongoDB connection failed: {e}")
        print("   This is expected if MongoDB is not running locally")
        return False

def test_app_creation():
    """Test if the FastAPI app can be created"""
    print("\nTesting FastAPI app creation...")
    
    try:
        from app.main import app
        print("✅ FastAPI app created successfully")
        print(f"   App title: {app.title}")
        return True
    except Exception as e:
        print(f"❌ FastAPI app creation failed: {e}")
        return False

def main():
    """Main test function"""
    print("=" * 50)
    print("DirectDriveX Backend Configuration Test")
    print("=" * 50)
    
    # Test imports
    if not test_imports():
        print("\n❌ Import tests failed. Please check your dependencies.")
        return
    
    # Test MongoDB connection
    mongodb_ok = test_mongodb_connection()
    
    # Test app creation
    if not test_app_creation():
        print("\n❌ App creation failed. Please check your configuration.")
        return
    
    print("\n" + "=" * 50)
    if mongodb_ok:
        print("✅ All tests passed! Backend should work correctly.")
    else:
        print("⚠️  Tests passed but MongoDB is not available.")
        print("   You need to install and start MongoDB to use the full application.")
    print("=" * 50)

if __name__ == "__main__":
    main()

