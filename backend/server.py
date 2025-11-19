from fastapi import FastAPI, APIRouter, HTTPException, Depends, UploadFile, File, Form, Header
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
from pathlib import Path
import os
import logging
import uuid
import jwt
import bcrypt
from bson import ObjectId
from emergentintegrations.llm.chat import LlmChat, UserMessage

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# JWT Configuration
SECRET_KEY = os.environ.get('JWT_SECRET', 'your-secret-key-change-in-production')
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  # 7 days

# Emergent LLM Key
EMERGENT_LLM_KEY = os.environ.get('EMERGENT_LLM_KEY', '')

# Create the main app
app = FastAPI()
api_router = APIRouter(prefix="/api")
security = HTTPBearer()

# ==================== MODELS ====================

class PyObjectId(str):
    @classmethod
    def __get_validators__(cls):
        yield cls.validate
    
    @classmethod
    def validate(cls, v):
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid ObjectId")
        return str(v)

# User Models
class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    phone: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class User(BaseModel):
    id: Optional[str] = Field(default=None, alias="_id")
    email: EmailStr
    full_name: str
    phone: str
    role: str = "user"  # user or admin
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        populate_by_name = True

# Vehicle Models
class VehicleCreate(BaseModel):
    name: str
    brand: str
    category: str  # SUV, berline, 4x4, etc.
    type: str  # vente, location, both
    price_sale: Optional[float] = None
    price_per_day: Optional[float] = None
    year: int
    transmission: str  # auto, manual
    fuel: str  # essence, diesel, electric, hybrid
    mileage: int
    description: str
    images: List[str] = []  # base64 images
    features: List[str] = []
    available: bool = True

class Vehicle(VehicleCreate):
    id: Optional[str] = Field(default=None, alias="_id")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        populate_by_name = True

# Reservation Models
class ReservationCreate(BaseModel):
    vehicle_id: str
    start_date: datetime
    end_date: datetime
    driver_license: str  # base64
    id_document: str  # base64

class Reservation(BaseModel):
    id: Optional[str] = Field(default=None, alias="_id")
    user_id: str
    vehicle_id: str
    start_date: datetime
    end_date: datetime
    driver_license: str
    id_document: str
    status: str = "pending"  # pending, accepted, rejected, completed
    total_price: float
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        populate_by_name = True

# Purchase Models
class PurchaseCreate(BaseModel):
    vehicle_id: str
    message: Optional[str] = None

class Purchase(BaseModel):
    id: Optional[str] = Field(default=None, alias="_id")
    user_id: str
    vehicle_id: str
    message: Optional[str] = None
    status: str = "pending"  # pending, accepted, rejected, completed
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        populate_by_name = True

# Chat Models
class ChatMessage(BaseModel):
    message: str
    session_id: Optional[str] = None

class ChatResponse(BaseModel):
    response: str
    session_id: str

# GPS Location Models
class LocationUpdate(BaseModel):
    vehicle_id: str
    latitude: float
    longitude: float
    speed: Optional[float] = 0.0
    heading: Optional[float] = 0.0

class VehicleLocation(BaseModel):
    id: Optional[str] = Field(default=None, alias="_id")
    vehicle_id: str
    latitude: float
    longitude: float
    speed: float = 0.0
    heading: float = 0.0
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        populate_by_name = True

# Statistics Models
class StatsResponse(BaseModel):
    total_vehicles: int
    available_vehicles: int
    total_reservations: int
    pending_reservations: int
    total_purchases: int
    total_users: int
    total_revenue: float
    monthly_reservations: int
    monthly_revenue: float

# ==================== HELPER FUNCTIONS ====================

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def verify_token(token: str) -> dict:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    token = credentials.credentials
    payload = verify_token(token)
    user = await db.users.find_one({"_id": ObjectId(payload.get("user_id"))})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user["_id"] = str(user["_id"])
    return user

async def get_admin_user(current_user: dict = Depends(get_current_user)) -> dict:
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return current_user

# ==================== AUTH ROUTES ====================

@api_router.post("/auth/register")
async def register(user_data: UserCreate):
    # Check if user exists
    existing_user = await db.users.find_one({"email": user_data.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Hash password
    hashed_password = bcrypt.hashpw(user_data.password.encode('utf-8'), bcrypt.gensalt())
    
    # Create user
    user_dict = {
        "email": user_data.email,
        "password": hashed_password.decode('utf-8'),
        "full_name": user_data.full_name,
        "phone": user_data.phone,
        "role": "user",
        "created_at": datetime.utcnow()
    }
    
    result = await db.users.insert_one(user_dict)
    
    # Create token
    token = create_access_token({"user_id": str(result.inserted_id)})
    
    return {
        "token": token,
        "user": {
            "id": str(result.inserted_id),
            "email": user_data.email,
            "full_name": user_data.full_name,
            "role": "user"
        }
    }

@api_router.post("/auth/login")
async def login(credentials: UserLogin):
    user = await db.users.find_one({"email": credentials.email})
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # Verify password
    if not bcrypt.checkpw(credentials.password.encode('utf-8'), user["password"].encode('utf-8')):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # Create token
    token = create_access_token({"user_id": str(user["_id"])})
    
    return {
        "token": token,
        "user": {
            "id": str(user["_id"]),
            "email": user["email"],
            "full_name": user["full_name"],
            "role": user.get("role", "user")
        }
    }

@api_router.get("/auth/me")
async def get_me(current_user: dict = Depends(get_current_user)):
    return current_user

# ==================== VEHICLE ROUTES ====================

@api_router.get("/vehicles")
async def get_vehicles(
    type: Optional[str] = None,
    category: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    transmission: Optional[str] = None,
    fuel: Optional[str] = None
):
    query = {}
    
    if type:
        query["type"] = {"$in": [type, "both"]}
    if category:
        query["category"] = category
    if transmission:
        query["transmission"] = transmission
    if fuel:
        query["fuel"] = fuel
    
    vehicles = await db.vehicles.find(query).to_list(1000)
    
    # Filter by price
    if min_price is not None or max_price is not None:
        filtered_vehicles = []
        for vehicle in vehicles:
            price = vehicle.get("price_sale") or vehicle.get("price_per_day")
            if price:
                if min_price and price < min_price:
                    continue
                if max_price and price > max_price:
                    continue
            filtered_vehicles.append(vehicle)
        vehicles = filtered_vehicles
    
    for vehicle in vehicles:
        vehicle["_id"] = str(vehicle["_id"])
    
    return vehicles

@api_router.get("/vehicles/{vehicle_id}")
async def get_vehicle(vehicle_id: str):
    if not ObjectId.is_valid(vehicle_id):
        raise HTTPException(status_code=400, detail="Invalid vehicle ID")
    
    vehicle = await db.vehicles.find_one({"_id": ObjectId(vehicle_id)})
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    
    vehicle["_id"] = str(vehicle["_id"])
    return vehicle

@api_router.post("/vehicles", dependencies=[Depends(get_admin_user)])
async def create_vehicle(vehicle_data: VehicleCreate):
    vehicle_dict = vehicle_data.model_dump()
    vehicle_dict["created_at"] = datetime.utcnow()
    
    result = await db.vehicles.insert_one(vehicle_dict)
    vehicle_dict["_id"] = str(result.inserted_id)
    
    return vehicle_dict

@api_router.put("/vehicles/{vehicle_id}", dependencies=[Depends(get_admin_user)])
async def update_vehicle(vehicle_id: str, vehicle_data: VehicleCreate):
    if not ObjectId.is_valid(vehicle_id):
        raise HTTPException(status_code=400, detail="Invalid vehicle ID")
    
    vehicle_dict = vehicle_data.model_dump()
    
    result = await db.vehicles.update_one(
        {"_id": ObjectId(vehicle_id)},
        {"$set": vehicle_dict}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    
    return {"message": "Vehicle updated successfully"}

@api_router.delete("/vehicles/{vehicle_id}", dependencies=[Depends(get_admin_user)])
async def delete_vehicle(vehicle_id: str):
    if not ObjectId.is_valid(vehicle_id):
        raise HTTPException(status_code=400, detail="Invalid vehicle ID")
    
    result = await db.vehicles.delete_one({"_id": ObjectId(vehicle_id)})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    
    return {"message": "Vehicle deleted successfully"}

# ==================== RESERVATION ROUTES ====================

@api_router.post("/reservations")
async def create_reservation(
    reservation_data: ReservationCreate,
    current_user: dict = Depends(get_current_user)
):
    # Check if vehicle exists
    vehicle = await db.vehicles.find_one({"_id": ObjectId(reservation_data.vehicle_id)})
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    
    # Check availability
    conflicting_reservations = await db.reservations.find_one({
        "vehicle_id": reservation_data.vehicle_id,
        "status": {"$in": ["pending", "accepted"]},
        "$or": [
            {
                "start_date": {"$lte": reservation_data.end_date},
                "end_date": {"$gte": reservation_data.start_date}
            }
        ]
    })
    
    if conflicting_reservations:
        raise HTTPException(status_code=400, detail="Vehicle not available for selected dates")
    
    # Calculate total price
    days = (reservation_data.end_date - reservation_data.start_date).days
    if days <= 0:
        raise HTTPException(status_code=400, detail="Invalid date range")
    
    total_price = vehicle.get("price_per_day", 0) * days
    
    # Create reservation
    reservation_dict = {
        "user_id": current_user["_id"],
        "vehicle_id": reservation_data.vehicle_id,
        "start_date": reservation_data.start_date,
        "end_date": reservation_data.end_date,
        "driver_license": reservation_data.driver_license,
        "id_document": reservation_data.id_document,
        "status": "pending",
        "total_price": total_price,
        "created_at": datetime.utcnow()
    }
    
    result = await db.reservations.insert_one(reservation_dict)
    reservation_dict["_id"] = str(result.inserted_id)
    
    return reservation_dict

@api_router.get("/reservations/my")
async def get_my_reservations(current_user: dict = Depends(get_current_user)):
    reservations = await db.reservations.find({"user_id": current_user["_id"]}).to_list(1000)
    
    # Populate vehicle data
    for reservation in reservations:
        reservation["_id"] = str(reservation["_id"])
        vehicle = await db.vehicles.find_one({"_id": ObjectId(reservation["vehicle_id"])})
        if vehicle:
            vehicle["_id"] = str(vehicle["_id"])
            reservation["vehicle"] = vehicle
    
    return reservations

@api_router.get("/reservations", dependencies=[Depends(get_admin_user)])
async def get_all_reservations():
    reservations = await db.reservations.find().to_list(1000)
    
    # Populate vehicle and user data
    for reservation in reservations:
        reservation["_id"] = str(reservation["_id"])
        vehicle = await db.vehicles.find_one({"_id": ObjectId(reservation["vehicle_id"])})
        user = await db.users.find_one({"_id": ObjectId(reservation["user_id"])})
        
        if vehicle:
            vehicle["_id"] = str(vehicle["_id"])
            reservation["vehicle"] = vehicle
        
        if user:
            user["_id"] = str(user["_id"])
            reservation["user"] = {
                "id": user["_id"],
                "full_name": user["full_name"],
                "email": user["email"],
                "phone": user["phone"]
            }
    
    return reservations

@api_router.patch("/reservations/{reservation_id}/status", dependencies=[Depends(get_admin_user)])
async def update_reservation_status(reservation_id: str, status: str):
    if not ObjectId.is_valid(reservation_id):
        raise HTTPException(status_code=400, detail="Invalid reservation ID")
    
    if status not in ["pending", "accepted", "rejected", "completed"]:
        raise HTTPException(status_code=400, detail="Invalid status")
    
    result = await db.reservations.update_one(
        {"_id": ObjectId(reservation_id)},
        {"$set": {"status": status}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Reservation not found")
    
    return {"message": "Reservation status updated"}

# ==================== PURCHASE ROUTES ====================

@api_router.post("/purchases")
async def create_purchase(
    purchase_data: PurchaseCreate,
    current_user: dict = Depends(get_current_user)
):
    # Check if vehicle exists
    vehicle = await db.vehicles.find_one({"_id": ObjectId(purchase_data.vehicle_id)})
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    
    # Create purchase
    purchase_dict = {
        "user_id": current_user["_id"],
        "vehicle_id": purchase_data.vehicle_id,
        "message": purchase_data.message,
        "status": "pending",
        "created_at": datetime.utcnow()
    }
    
    result = await db.purchases.insert_one(purchase_dict)
    purchase_dict["_id"] = str(result.inserted_id)
    
    return purchase_dict

@api_router.get("/purchases/my")
async def get_my_purchases(current_user: dict = Depends(get_current_user)):
    purchases = await db.purchases.find({"user_id": current_user["_id"]}).to_list(1000)
    
    # Populate vehicle data
    for purchase in purchases:
        purchase["_id"] = str(purchase["_id"])
        vehicle = await db.vehicles.find_one({"_id": ObjectId(purchase["vehicle_id"])})
        if vehicle:
            vehicle["_id"] = str(vehicle["_id"])
            purchase["vehicle"] = vehicle
    
    return purchases

@api_router.get("/purchases", dependencies=[Depends(get_admin_user)])
async def get_all_purchases():
    purchases = await db.purchases.find().to_list(1000)
    
    # Populate vehicle and user data
    for purchase in purchases:
        purchase["_id"] = str(purchase["_id"])
        vehicle = await db.vehicles.find_one({"_id": ObjectId(purchase["vehicle_id"])})
        user = await db.users.find_one({"_id": ObjectId(purchase["user_id"])})
        
        if vehicle:
            vehicle["_id"] = str(vehicle["_id"])
            purchase["vehicle"] = vehicle
        
        if user:
            user["_id"] = str(user["_id"])
            purchase["user"] = {
                "id": user["_id"],
                "full_name": user["full_name"],
                "email": user["email"],
                "phone": user["phone"]
            }
    
    return purchases

# ==================== ADMIN ROUTES ====================

@api_router.get("/admin/stats", dependencies=[Depends(get_admin_user)])
async def get_admin_stats():
    # Count documents
    total_vehicles = await db.vehicles.count_documents({})
    available_vehicles = await db.vehicles.count_documents({"available": True})
    total_reservations = await db.reservations.count_documents({})
    pending_reservations = await db.reservations.count_documents({"status": "pending"})
    total_purchases = await db.purchases.count_documents({})
    total_users = await db.users.count_documents({"role": "user"})
    
    # Calculate total revenue
    reservations = await db.reservations.find({"status": {"$in": ["accepted", "completed"]}}).to_list(1000)
    total_revenue = sum([r.get("total_price", 0) for r in reservations])
    
    # Calculate monthly stats (current month)
    current_month_start = datetime.utcnow().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    monthly_reservations = await db.reservations.count_documents({
        "created_at": {"$gte": current_month_start},
        "status": {"$in": ["accepted", "completed"]}
    })
    
    monthly_reservations_list = await db.reservations.find({
        "created_at": {"$gte": current_month_start},
        "status": {"$in": ["accepted", "completed"]}
    }).to_list(1000)
    monthly_revenue = sum([r.get("total_price", 0) for r in monthly_reservations_list])
    
    return {
        "total_vehicles": total_vehicles,
        "available_vehicles": available_vehicles,
        "total_reservations": total_reservations,
        "pending_reservations": pending_reservations,
        "total_purchases": total_purchases,
        "total_users": total_users,
        "total_revenue": total_revenue,
        "monthly_reservations": monthly_reservations,
        "monthly_revenue": monthly_revenue
    }

# ==================== CHAT AI ROUTES ====================

@api_router.post("/chat", response_model=ChatResponse)
async def chat(chat_data: ChatMessage):
    try:
        # Create session ID if not provided
        session_id = chat_data.session_id or str(uuid.uuid4())
        
        # Initialize LLM Chat
        chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=session_id,
            system_message="Tu es un assistant virtuel pour une agence de location et vente de voitures. Tu aides les clients à trouver des véhicules, répondre à leurs questions sur les locations, les achats, les prix, et les conditions. Sois poli, professionnel et informatif. Réponds toujours en français."
        ).with_model("openai", "gpt-4o-mini")
        
        # Send message
        user_message = UserMessage(text=chat_data.message)
        response = await chat.send_message(user_message)
        
        # Store chat history in database
        await db.chat_messages.insert_one({
            "session_id": session_id,
            "user_message": chat_data.message,
            "bot_response": response,
            "created_at": datetime.utcnow()
        })
        
        return ChatResponse(response=response, session_id=session_id)
    
    except Exception as e:
        logger.error(f"Chat error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Chat error: {str(e)}")

@api_router.get("/chat/history/{session_id}")
async def get_chat_history(session_id: str):
    messages = await db.chat_messages.find({"session_id": session_id}).to_list(1000)
    for msg in messages:
        msg["_id"] = str(msg["_id"])
    return messages

# ==================== GPS TRACKING ROUTES ====================

@api_router.post("/vehicles/{vehicle_id}/location", dependencies=[Depends(get_admin_user)])
async def update_vehicle_location(vehicle_id: str, location: LocationUpdate):
    """Update vehicle GPS location (admin only - simulates GPS tracker)"""
    if not ObjectId.is_valid(vehicle_id):
        raise HTTPException(status_code=400, detail="Invalid vehicle ID")
    
    # Verify vehicle exists
    vehicle = await db.vehicles.find_one({"_id": ObjectId(vehicle_id)})
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    
    # Store location in history
    location_dict = {
        "vehicle_id": vehicle_id,
        "latitude": location.latitude,
        "longitude": location.longitude,
        "speed": location.speed,
        "heading": location.heading,
        "timestamp": datetime.utcnow()
    }
    
    await db.vehicle_locations.insert_one(location_dict)
    
    # Update vehicle's current location
    await db.vehicles.update_one(
        {"_id": ObjectId(vehicle_id)},
        {"$set": {
            "current_location": {
                "latitude": location.latitude,
                "longitude": location.longitude,
                "last_updated": datetime.utcnow()
            }
        }}
    )
    
    return {"message": "Location updated successfully"}

@api_router.get("/vehicles/{vehicle_id}/location")
async def get_vehicle_current_location(vehicle_id: str):
    """Get current vehicle GPS location"""
    if not ObjectId.is_valid(vehicle_id):
        raise HTTPException(status_code=400, detail="Invalid vehicle ID")
    
    vehicle = await db.vehicles.find_one({"_id": ObjectId(vehicle_id)})
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    
    return vehicle.get("current_location", {})

@api_router.get("/vehicles/{vehicle_id}/location/history")
async def get_vehicle_location_history(
    vehicle_id: str,
    limit: int = 100,
    current_user: dict = Depends(get_current_user)
):
    """Get vehicle GPS location history"""
    if not ObjectId.is_valid(vehicle_id):
        raise HTTPException(status_code=400, detail="Invalid vehicle ID")
    
    # Check if user is admin or has active reservation for this vehicle
    is_admin = current_user.get("role") == "admin"
    has_reservation = False
    
    if not is_admin:
        reservation = await db.reservations.find_one({
            "vehicle_id": vehicle_id,
            "user_id": current_user["_id"],
            "status": {"$in": ["accepted"]},
            "start_date": {"$lte": datetime.utcnow()},
            "end_date": {"$gte": datetime.utcnow()}
        })
        has_reservation = reservation is not None
    
    if not is_admin and not has_reservation:
        raise HTTPException(status_code=403, detail="Access denied")
    
    locations = await db.vehicle_locations.find(
        {"vehicle_id": vehicle_id}
    ).sort("timestamp", -1).limit(limit).to_list(limit)
    
    for loc in locations:
        loc["_id"] = str(loc["_id"])
    
    return locations

@api_router.get("/vehicles/map/all")
async def get_all_vehicles_on_map():
    """Get all vehicles with their current locations for map display"""
    vehicles = await db.vehicles.find({"available": True}).to_list(1000)
    
    vehicles_on_map = []
    for vehicle in vehicles:
        if "current_location" in vehicle:
            vehicles_on_map.append({
                "_id": str(vehicle["_id"]),
                "name": vehicle["name"],
                "brand": vehicle["brand"],
                "category": vehicle["category"],
                "type": vehicle["type"],
                "image": vehicle["images"][0] if vehicle.get("images") else None,
                "location": vehicle["current_location"]
            })
    
    return vehicles_on_map

# ==================== MAIN APP SETUP ====================

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
