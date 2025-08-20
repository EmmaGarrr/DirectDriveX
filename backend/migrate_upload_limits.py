#!/usr/bin/env python3
"""
Database Migration Script for Upload Limits Feature
Adds new fields to existing file records for IP tracking and anonymous user identification
"""

import asyncio
import sys
import os
from datetime import datetime

# Add the app directory to the Python path
sys.path.append(os.path.join(os.path.dirname(__file__), 'app'))

from app.db.mongodb import db
from app.core.config import settings

async def migrate_upload_limits():
    """Migrate existing file records to include upload limits tracking fields"""
    
    print("🔄 Starting upload limits migration...")
    
    try:
        # Connect to database
        print("📡 Connecting to database...")
        
        # Find all files that don't have the new fields
        files_to_update = db.files.find({
            "$or": [
                {"ip_address": {"$exists": False}},
                {"is_anonymous": {"$exists": False}},
                {"daily_quota_used": {"$exists": False}}
            ]
        })
        
        files_list = list(files_to_update)
        total_files = len(files_list)
        
        if total_files == 0:
            print("✅ No files need migration - all files already have upload limits fields")
            return
        
        print(f"📊 Found {total_files} files to migrate")
        
        # Update files in batches
        batch_size = 100
        updated_count = 0
        
        for i in range(0, total_files, batch_size):
            batch = files_list[i:i + batch_size]
            
            for file_doc in batch:
                # Set default values for missing fields
                update_data = {}
                
                if "ip_address" not in file_doc:
                    update_data["ip_address"] = "unknown"  # Default for existing files
                
                if "is_anonymous" not in file_doc:
                    # Determine if user was anonymous based on owner_id
                    update_data["is_anonymous"] = file_doc.get("owner_id") is None
                
                if "daily_quota_used" not in file_doc:
                    # Set quota used to file size for existing files
                    update_data["daily_quota_used"] = file_doc.get("size_bytes", 0)
                
                if update_data:
                    # Add migration timestamp
                    update_data["migrated_at"] = datetime.utcnow()
                    update_data["migration_version"] = "1.0"
                    
                    # Update the file record
                    result = db.files.update_one(
                        {"_id": file_doc["_id"]},
                        {"$set": update_data}
                    )
                    
                    if result.modified_count > 0:
                        updated_count += 1
            
            print(f"📈 Processed batch {i//batch_size + 1}/{(total_files + batch_size - 1)//batch_size}")
        
        print(f"✅ Migration completed successfully!")
        print(f"📊 Updated {updated_count} out of {total_files} files")
        
        # Verify migration
        remaining_files = db.files.count_documents({
            "$or": [
                {"ip_address": {"$exists": False}},
                {"is_anonymous": {"$exists": False}},
                {"daily_quota_used": {"$exists": False}}
            ]
        })
        
        if remaining_files == 0:
            print("✅ Verification passed - all files have required fields")
        else:
            print(f"⚠️  Warning: {remaining_files} files still missing required fields")
        
    except Exception as e:
        print(f"❌ Migration failed: {e}")
        raise

async def create_indexes():
    """Create indexes for upload limits queries"""
    
    print("🔍 Creating indexes for upload limits...")
    
    try:
        # Index for daily quota queries (authenticated users)
        db.files.create_index([
            ("owner_id", 1),
            ("upload_date", 1),
            ("status", 1)
        ], name="daily_quota_authenticated")
        
        # Index for daily quota queries (anonymous users by IP)
        db.files.create_index([
            ("ip_address", 1),
            ("owner_id", 1),
            ("upload_date", 1),
            ("status", 1)
        ], name="daily_quota_anonymous")
        
        # Index for file size queries
        db.files.create_index([
            ("size_bytes", 1)
        ], name="file_size")
        
        # Index for anonymous user queries
        db.files.create_index([
            ("is_anonymous", 1)
        ], name="anonymous_users")
        
        print("✅ Indexes created successfully")
        
    except Exception as e:
        print(f"❌ Failed to create indexes: {e}")
        raise

async def main():
    """Main migration function"""
    
    print("🚀 Starting upload limits database migration...")
    print("=" * 50)
    
    try:
        # Run migration
        await migrate_upload_limits()
        
        # Create indexes
        await create_indexes()
        
        print("=" * 50)
        print("🎉 Migration completed successfully!")
        print("\n📋 Summary:")
        print("✅ Added ip_address field to file records")
        print("✅ Added is_anonymous field to file records")
        print("✅ Added daily_quota_used field to file records")
        print("✅ Created database indexes for performance")
        print("\n🔧 Next steps:")
        print("1. Restart your backend application")
        print("2. Test upload limits functionality")
        print("3. Monitor quota tracking in admin panel")
        
    except Exception as e:
        print(f"❌ Migration failed: {e}")
        sys.exit(1)

if __name__ == "__main__":
    asyncio.run(main())
