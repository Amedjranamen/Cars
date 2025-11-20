import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime
import bcrypt
from dotenv import load_dotenv

# Images placeholder base64 (small colored squares)
PLACEHOLDER_IMAGES = {
    "suv_blue": "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iIzAwNjZGRiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LXNpemU9IjQ4IiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSI+U1VWPC90ZXh0Pjwvc3ZnPg==",
    "berline_red": "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI0ZGMzMzMyIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LXNpemU9IjQ4IiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSI+QkVSTElORTwvdGV4dD48L3N2Zz4=",
    "sport_yellow": "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI0ZGOTkwMCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LXNpemU9IjQ4IiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSI+U1BPUlQ8L3RleHQ+PC9zdmc+",
    "4x4_green": "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iIzM0Qzc1OSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LXNpemU9IjQ4IiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSI+NHg0PC90ZXh0Pjwvc3ZnPg==",
    "utilitaire_gray": "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iIzhFOEU5MyIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LXNpemU9IjM2IiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSI+VVRJTElUQUlSRTwvdGV4dD48L3N2Zz4=",
}

load_dotenv()

async def seed_database():
    # Connect to MongoDB
    mongo_url = os.environ['MONGO_URL']
    client = AsyncIOMotorClient(mongo_url)
    db = client[os.environ['DB_NAME']]
    
    print("🌱 Seeding database...")
    
    # Clear existing data
    await db.vehicles.delete_many({})
    await db.users.delete_many({})
    print("✅ Cleared existing data")
    
    # Create admin user
    admin_password = bcrypt.hashpw("admin123".encode('utf-8'), bcrypt.gensalt())
    admin_user = {
        "email": "admin@autorent.com",
        "password": admin_password.decode('utf-8'),
        "full_name": "Administrateur",
        "phone": "+33612345678",
        "role": "admin",
        "created_at": datetime.utcnow()
    }
    await db.users.insert_one(admin_user)
    print("✅ Created admin user (admin@autorent.com / admin123)")
    
    # Create regular user
    user_password = bcrypt.hashpw("user123".encode('utf-8'), bcrypt.gensalt())
    regular_user = {
        "email": "user@autorent.com",
        "password": user_password.decode('utf-8'),
        "full_name": "Utilisateur Test",
        "phone": "+33687654321",
        "role": "user",
        "created_at": datetime.utcnow()
    }
    await db.users.insert_one(regular_user)
    print("✅ Created regular user (user@autorent.com / user123)")
    
    # Create vehicles
    vehicles = [
        # SUVs
        {
            "name": "BMW X5",
            "brand": "BMW",
            "category": "SUV",
            "type": "both",
            "price_sale": 45000,
            "price_per_day": 85,
            "year": 2023,
            "transmission": "auto",
            "fuel": "hybrid",
            "mileage": 15000,
            "description": "SUV premium avec intérieur luxueux et performances exceptionnelles. Équipé des dernières technologies BMW.",
            "images": [PLACEHOLDER_IMAGES["suv_blue"], PLACEHOLDER_IMAGES["suv_blue"]],
            "features": ["GPS", "Caméra 360°", "Sièges chauffants", "Toit panoramique", "Régulateur adaptatif"],
            "available": True,
            "created_at": datetime.utcnow(),
            "current_location": {
                "latitude": 48.8566,
                "longitude": 2.3522,
                "last_updated": datetime.utcnow()
            }
        },
        {
            "name": "Audi Q7",
            "brand": "Audi",
            "category": "SUV",
            "type": "location",
            "price_per_day": 95,
            "year": 2024,
            "transmission": "auto",
            "fuel": "diesel",
            "mileage": 8000,
            "description": "SUV 7 places spacieux et confortable, parfait pour les familles. Design élégant Audi.",
            "images": [PLACEHOLDER_IMAGES["suv_blue"]],
            "features": ["7 places", "GPS", "Régulateur", "Climatisation tri-zone", "Android Auto"],
            "available": True,
            "created_at": datetime.utcnow(),
        },
        # Berlines
        {
            "name": "Mercedes Classe E",
            "brand": "Mercedes",
            "category": "Berline",
            "type": "both",
            "price_sale": 38000,
            "price_per_day": 75,
            "year": 2023,
            "transmission": "auto",
            "fuel": "diesel",
            "mileage": 22000,
            "description": "Berline de luxe allemande, confort optimal pour vos déplacements professionnels.",
            "images": [PLACEHOLDER_IMAGES["berline_red"], PLACEHOLDER_IMAGES["berline_red"]],
            "features": ["GPS", "Sièges cuir", "Aide au stationnement", "Climatisation automatique"],
            "available": True,
            "created_at": datetime.utcnow(),
            "current_location": {
                "latitude": 48.8584,
                "longitude": 2.2945,
                "last_updated": datetime.utcnow()
            }
        },
        {
            "name": "BMW Série 5",
            "brand": "BMW",
            "category": "Berline",
            "type": "location",
            "price_per_day": 80,
            "year": 2023,
            "transmission": "auto",
            "fuel": "hybrid",
            "mileage": 18000,
            "description": "Berline sportive et élégante, alliance parfaite entre performance et efficience énergétique.",
            "images": [PLACEHOLDER_IMAGES["berline_red"]],
            "features": ["GPS", "CarPlay", "Régulateur adaptatif", "Sièges sport", "Ambiance LED"],
            "available": True,
            "created_at": datetime.utcnow(),
        },
        # Sport
        {
            "name": "Porsche 911",
            "brand": "Porsche",
            "category": "Sport",
            "type": "location",
            "price_per_day": 250,
            "year": 2024,
            "transmission": "auto",
            "fuel": "essence",
            "mileage": 5000,
            "description": "Icône sportive allemande, sensations garanties. Pour les amateurs de conduite sportive.",
            "images": [PLACEHOLDER_IMAGES["sport_yellow"], PLACEHOLDER_IMAGES["sport_yellow"]],
            "features": ["Mode Sport+", "Échappement sport", "Sièges baquets", "Chrono", "PASM"],
            "available": True,
            "created_at": datetime.utcnow(),
        },
        {
            "name": "Audi R8",
            "brand": "Audi",
            "category": "Sport",
            "type": "vente",
            "price_sale": 125000,
            "year": 2023,
            "transmission": "auto",
            "fuel": "essence",
            "mileage": 12000,
            "description": "Supercar V10, design racé et performances explosives. Un rêve accessible.",
            "images": [PLACEHOLDER_IMAGES["sport_yellow"]],
            "features": ["V10", "Quattro", "Sièges carbone", "Bang & Olufsen", "Virtual Cockpit"],
            "available": True,
            "created_at": datetime.utcnow(),
        },
        # 4x4
        {
            "name": "Land Rover Defender",
            "brand": "Land Rover",
            "category": "4x4",
            "type": "both",
            "price_sale": 55000,
            "price_per_day": 110,
            "year": 2023,
            "transmission": "auto",
            "fuel": "diesel",
            "mileage": 28000,
            "description": "Légende du tout-terrain modernisée. Capable partout, confortable sur route.",
            "images": [PLACEHOLDER_IMAGES["4x4_green"], PLACEHOLDER_IMAGES["4x4_green"]],
            "features": ["Terrain Response", "Wade Sensing", "Caméras", "Treuil", "Protections"],
            "available": True,
            "created_at": datetime.utcnow(),
            "current_location": {
                "latitude": 48.8738,
                "longitude": 2.2950,
                "last_updated": datetime.utcnow()
            }
        },
        {
            "name": "Jeep Wrangler",
            "brand": "Jeep",
            "category": "4x4",
            "type": "location",
            "price_per_day": 95,
            "year": 2023,
            "transmission": "manual",
            "fuel": "essence",
            "mileage": 35000,
            "description": "4x4 iconique américain, aventure et liberté. Toit et portes amovibles.",
            "images": [PLACEHOLDER_IMAGES["4x4_green"]],
            "features": ["4x4", "Toit souple", "Treuil", "Pneus TT", "Caméra recul"],
            "available": True,
            "created_at": datetime.utcnow(),
        },
        # Utilitaires
        {
            "name": "Ford Transit",
            "brand": "Ford",
            "category": "Utilitaire",
            "type": "location",
            "price_per_day": 55,
            "year": 2022,
            "transmission": "manual",
            "fuel": "diesel",
            "mileage": 65000,
            "description": "Fourgon spacieux pour déménagements et livraisons. Fiable et économique.",
            "images": [PLACEHOLDER_IMAGES["utilitaire_gray"]],
            "features": ["12m³", "Bluetooth", "Crochet remorque", "Aide au démarrage"],
            "available": True,
            "created_at": datetime.utcnow(),
        },
        {
            "name": "Renault Master",
            "brand": "Renault",
            "category": "Utilitaire",
            "type": "vente",
            "price_sale": 28000,
            "year": 2021,
            "transmission": "manual",
            "fuel": "diesel",
            "mileage": 85000,
            "description": "Utilitaire français robuste, excellent rapport charge utile/prix.",
            "images": [PLACEHOLDER_IMAGES["utilitaire_gray"]],
            "features": ["15m³", "Radar recul", "Régulateur", "Cloison"],
            "available": True,
            "created_at": datetime.utcnow(),
        },
    ]
    
    result = await db.vehicles.insert_many(vehicles)
    print(f"✅ Created {len(result.inserted_ids)} vehicles")
    
    print("\n🎉 Database seeded successfully!")
    print("\n📝 Test accounts:")
    print("   Admin: admin@autorent.com / admin123")
    print("   User:  user@autorent.com / user123")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(seed_database())
