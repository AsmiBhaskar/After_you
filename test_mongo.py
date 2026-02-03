import os
import sys
from pathlib import Path

# Add project root to path
BASE_DIR = Path(__file__).resolve().parent
sys.path.append(str(BASE_DIR))

# Load environment variables
from decouple import config
from mongoengine import connect, disconnect

print("="*60)
print("Testing MongoDB Atlas Connection")
print("="*60)

try:
    # Get credentials from .env
    mongodb_uri = config('MONGODB_URI')
    db_name = config('MONGODB_DB_NAME', default='afteryou_db')
    
    # Hide password in output
    safe_uri = mongodb_uri.replace(mongodb_uri.split('@')[0].split(':')[-1], '****')
    print(f"\nConnection URI: {safe_uri}")
    print(f"Database Name: {db_name}\n")
    
    # Disconnect any existing connections
    disconnect()
    
    # Connect to Atlas
    print("Attempting connection...")
    connect(
        db=db_name,
        host=mongodb_uri,
        alias='default',
        serverSelectionTimeoutMS=5000
    )
    
    print("✓ Successfully connected to MongoDB Atlas!\n")
    
    # Try to list collections
    from mongoengine.connection import get_db
    db = get_db()
    collections = db.list_collection_names()
    
    print(f"Collections in database '{db_name}':")
    if collections:
        for collection in collections:
            count = db[collection].count_documents({})
            print(f"  - {collection}: {count} documents")
    else:
        print("  (No collections yet - database is empty)")
    
    print("\n" + "="*60)
    print("✓ Test completed successfully!")
    print("="*60)
    
except Exception as e:
    print(f"\n✗ Connection failed!")
    print(f"Error: {str(e)}")
    print("\n" + "="*60)
    print("Troubleshooting tips:")
    print("1. Check your password in .env file")
    print("2. Verify Network Access in MongoDB Atlas (allow 0.0.0.0/0)")
    print("3. Confirm database user has read/write permissions")
    print("="*60)
    sys.exit(1)