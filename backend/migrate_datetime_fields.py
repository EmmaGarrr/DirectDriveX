#!/usr/bin/env python3
"""
Migration script to convert datetime objects to ISO format strings
for existing users in the database.
"""

import sys
import os
from datetime import datetime

# Add the backend directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.db.mongodb import db
from app.core.config import settings

def migrate_datetime_fields():
    """Convert datetime objects to ISO format strings for existing users"""
    print("Starting datetime fields migration...")
    
    # Get all users from the database
    users = list(db.users.find({}))
    print(f"Found {len(users)} users to migrate")
    
    migrated_count = 0
    error_count = 0
    
    for user in users:
        try:
            update_needed = False
            update_data = {}
            
            # Check and convert created_at field
            if 'created_at' in user and isinstance(user['created_at'], datetime):
                update_data['created_at'] = user['created_at'].isoformat()
                update_needed = True
                print(f"Converting created_at for user {user.get('email', 'unknown')}")
            
            # Check and convert last_login field
            if 'last_login' in user and isinstance(user['last_login'], datetime):
                update_data['last_login'] = user['last_login'].isoformat()
                update_needed = True
                print(f"Converting last_login for user {user.get('email', 'unknown')}")
            
            # Update the user if needed
            if update_needed:
                db.users.update_one(
                    {"_id": user["_id"]},
                    {"$set": update_data}
                )
                migrated_count += 1
                print(f"✅ Migrated user: {user.get('email', 'unknown')}")
            
        except Exception as e:
            error_count += 1
            print(f"❌ Error migrating user {user.get('email', 'unknown')}: {e}")
    
    print(f"\nMigration completed!")
    print(f"✅ Successfully migrated: {migrated_count} users")
    print(f"❌ Errors: {error_count} users")
    
    if error_count > 0:
        print("⚠️  Some users could not be migrated. Check the logs above.")
    else:
        print("🎉 All users migrated successfully!")

if __name__ == "__main__":
    try:
        migrate_datetime_fields()
    except Exception as e:
        print(f"❌ Migration failed: {e}")
        sys.exit(1)
