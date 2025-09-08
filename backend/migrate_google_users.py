#!/usr/bin/env python3
"""
Migration script to update existing Google OAuth users with proper flags
This script ensures all Google OAuth users have the correct is_google_user flag
"""

import sys
import os

# Add the backend directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.db.mongodb import db
from app.core.config import settings

def migrate_google_users():
    """Update existing Google OAuth users with proper flags"""
    print("🔄 Starting Google OAuth users migration...")
    
    try:
        # Find users with Google ID but missing is_google_user flag
        google_users = db.users.find({
            "google_id": {"$exists": True},
            "$or": [
                {"is_google_user": {"$exists": False}},
                {"is_google_user": None}
            ]
        })
        
        updated_count = 0
        for user in google_users:
            db.users.update_one(
                {"_id": user["_id"]},
                {"$set": {"is_google_user": True}}
            )
            updated_count += 1
            print(f"✅ Updated user: {user['email']}")
        
        print(f"\n📊 Migration completed!")
        print(f"   Total users updated: {updated_count}")
        
        # Also check for users with is_google_user=True but no google_id
        inconsistent_users = db.users.find({
            "is_google_user": True,
            "google_id": {"$exists": False}
        })
        
        inconsistent_count = 0
        for user in inconsistent_users:
            print(f"⚠️  Inconsistent user found: {user['email']} (is_google_user=True but no google_id)")
            inconsistent_count += 1
        
        if inconsistent_count > 0:
            print(f"\n⚠️  Found {inconsistent_count} users with inconsistent flags")
            print("   These users have is_google_user=True but no google_id")
            print("   Consider reviewing these accounts manually")
        
        return True
        
    except Exception as e:
        print(f"❌ Migration failed: {e}")
        return False

def check_google_users_status():
    """Check the current status of Google OAuth users"""
    print("\n📋 Checking Google OAuth users status...")
    
    try:
        # Count total users
        total_users = db.users.count_documents({})
        print(f"   Total users: {total_users}")
        
        # Count Google OAuth users
        google_users = db.users.count_documents({"is_google_user": True})
        print(f"   Google OAuth users: {google_users}")
        
        # Count users with google_id
        users_with_google_id = db.users.count_documents({"google_id": {"$exists": True}})
        print(f"   Users with google_id: {users_with_google_id}")
        
        # Count users with hashed_password=None
        users_without_password = db.users.count_documents({"hashed_password": None})
        print(f"   Users without password: {users_without_password}")
        
        # Find users that might need attention
        users_needing_attention = db.users.find({
            "$or": [
                {"is_google_user": True, "google_id": {"$exists": False}},
                {"google_id": {"$exists": True}, "is_google_user": {"$ne": True}}
            ]
        })
        
        attention_count = 0
        for user in users_needing_attention:
            print(f"   ⚠️  User needing attention: {user['email']}")
            attention_count += 1
        
        if attention_count == 0:
            print("   ✅ All Google OAuth users appear to be consistent")
        
        return True
        
    except Exception as e:
        print(f"❌ Status check failed: {e}")
        return False

def main():
    """Main migration function"""
    print("🚀 Google OAuth Users Migration Tool")
    print("=" * 50)
    
    # Check current status
    if not check_google_users_status():
        print("❌ Cannot proceed with migration due to status check failure")
        return
    
    # Ask for confirmation
    response = input("\nDo you want to proceed with the migration? (y/N): ")
    if response.lower() != 'y':
        print("❌ Migration cancelled by user")
        return
    
    # Run migration
    if migrate_google_users():
        print("\n✅ Migration completed successfully!")
        
        # Check status again
        print("\n📋 Post-migration status:")
        check_google_users_status()
    else:
        print("\n❌ Migration failed!")

if __name__ == "__main__":
    main()
