from pymongo import MongoClient
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from app.core.config import settings

# Synchronous client for existing code
client = MongoClient(settings.MONGODB_URI)
db = client[settings.DATABASE_NAME]

# Async client for new streaming endpoints
async_client = AsyncIOMotorClient(settings.MONGODB_URI)
async_db = async_client[settings.DATABASE_NAME]

async def get_database() -> AsyncIOMotorDatabase:
    """Get async database instance for dependency injection"""
    return async_db