"""
Seed script to create default admin user
Run: python seed_admin.py
"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
from pathlib import Path
import os
import bcrypt
from datetime import datetime

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

async def seed_admin():
    # MongoDB connection
    mongo_url = os.environ['MONGO_URL']
    client = AsyncIOMotorClient(mongo_url)
    db = client[os.environ['DB_NAME']]
    
    # Check if admin already exists
    existing_admin = await db.users.find_one({"email": "admin@carloc.com"})
    
    if existing_admin:
        print("✓ Admin user already exists!")
        print(f"Email: admin@carloc.com")
        return
    
    # Create admin user
    hashed_password = bcrypt.hashpw("Admin123!".encode('utf-8'), bcrypt.gensalt())
    
    admin_user = {
        "email": "admin@carloc.com",
        "password": hashed_password.decode('utf-8'),
        "full_name": "Administrateur",
        "phone": "+226 70 00 00 00",
        "role": "admin",
        "created_at": datetime.utcnow()
    }
    
    result = await db.users.insert_one(admin_user)
    
    print("✓ Admin user created successfully!")
    print(f"Email: admin@carloc.com")
    print(f"Password: Admin123!")
    print(f"ID: {result.inserted_id}")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(seed_admin())
