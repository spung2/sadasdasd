from fastapi import FastAPI, APIRouter, HTTPException, Request, Response
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import uuid
import httpx
from pathlib import Path
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime, timezone, timedelta

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# LZT Market config
LZT_BASE_URL = os.environ.get('LZT_MARKET_BASE_URL', 'https://prod-api.lzt.market')
LZT_TOKEN = os.environ.get('LZT_MARKET_TOKEN', '')

# Create the main app
app = FastAPI()
api_router = APIRouter(prefix="/api")

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# HTTP client for LZT API
http_client = httpx.AsyncClient(
    timeout=60.0,
    verify=False,
    headers={"Authorization": f"Bearer {LZT_TOKEN}"}
)

EMERGENT_AUTH_URL = "https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data"

# ======================== MODELS ========================
class UserOut(BaseModel):
    user_id: str
    email: str
    name: str
    picture: Optional[str] = None
    created_at: Optional[str] = None

# ======================== AUTH ENDPOINTS ========================

@api_router.post("/auth/session")
async def exchange_session(request: Request, response: Response):
    body = await request.json()
    session_id = body.get("session_id")
    if not session_id:
        raise HTTPException(status_code=400, detail="session_id required")

    async with httpx.AsyncClient() as auth_client:
        auth_resp = await auth_client.get(
            EMERGENT_AUTH_URL,
            headers={"X-Session-ID": session_id}
        )

    if auth_resp.status_code != 200:
        raise HTTPException(status_code=401, detail="Invalid session")

    auth_data = auth_resp.json()
    email = auth_data.get("email")
    name = auth_data.get("name", "")
    picture = auth_data.get("picture", "")
    session_token = auth_data.get("session_token", "")

    # Upsert user
    existing = await db.users.find_one({"email": email}, {"_id": 0})
    if existing:
        user_id = existing["user_id"]
        await db.users.update_one({"email": email}, {"$set": {"name": name, "picture": picture}})
    else:
        user_id = f"user_{uuid.uuid4().hex[:12]}"
        await db.users.insert_one({
            "user_id": user_id,
            "email": email,
            "name": name,
            "picture": picture,
            "created_at": datetime.now(timezone.utc).isoformat()
        })

    # Store session
    expires_at = datetime.now(timezone.utc) + timedelta(days=7)
    await db.user_sessions.insert_one({
        "user_id": user_id,
        "session_token": session_token,
        "expires_at": expires_at.isoformat(),
        "created_at": datetime.now(timezone.utc).isoformat()
    })

    response.set_cookie(
        key="session_token",
        value=session_token,
        httponly=True,
        secure=True,
        samesite="none",
        path="/",
        max_age=7 * 24 * 3600
    )

    user = await db.users.find_one({"user_id": user_id}, {"_id": 0})
    return user


async def get_current_user(request: Request) -> Optional[dict]:
    token = request.cookies.get("session_token")
    if not token:
        auth_header = request.headers.get("Authorization", "")
        if auth_header.startswith("Bearer "):
            token = auth_header[7:]
    if not token:
        return None

    session = await db.user_sessions.find_one({"session_token": token}, {"_id": 0})
    if not session:
        return None

    expires_at = session.get("expires_at", "")
    if isinstance(expires_at, str):
        expires_at = datetime.fromisoformat(expires_at)
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    if expires_at < datetime.now(timezone.utc):
        return None

    user = await db.users.find_one({"user_id": session["user_id"]}, {"_id": 0})
    return user


@api_router.get("/auth/me")
async def get_me(request: Request):
    user = await get_current_user(request)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return user


@api_router.post("/auth/logout")
async def logout(request: Request, response: Response):
    token = request.cookies.get("session_token")
    if token:
        await db.user_sessions.delete_one({"session_token": token})
    response.delete_cookie(key="session_token", path="/", samesite="none", secure=True, httponly=True)
    return {"message": "Logged out"}


# ======================== LZT MARKET PROXY ========================

SUPPORTED_CATEGORIES = {
    "all": "/",
    "riot": "/riot",
    "steam": "/steam",
    "fortnite": "/fortnite",
    "mihoyo": "/mihoyo",
    "supercell": "/supercell",
    "ea": "/ea",
    "telegram": "/telegram",
    "minecraft": "/minecraft",
    "roblox": "/roblox",
}

CACHE_TTL_SEARCH = 300   # 5 minutes
CACHE_TTL_ITEM = 900     # 15 minutes


async def ensure_cache_indexes():
    try:
        await db.lzt_cache.create_index("expires_at", expireAfterSeconds=0)
    except Exception:
        pass


@api_router.get("/market/categories")
async def get_categories():
    return {
        "categories": [
            {"id": "all", "name": "All", "path": "/"},
            {"id": "riot", "name": "Riot (Valorant/LoL)", "path": "/riot"},
            {"id": "steam", "name": "Steam", "path": "/steam"},
            {"id": "fortnite", "name": "Fortnite", "path": "/fortnite"},
            {"id": "mihoyo", "name": "miHoYo (Genshin/HSR)", "path": "/mihoyo"},
            {"id": "supercell", "name": "Supercell", "path": "/supercell"},
            {"id": "ea", "name": "EA (Origin)", "path": "/ea"},
            {"id": "telegram", "name": "Telegram", "path": "/telegram"},
            {"id": "minecraft", "name": "Minecraft", "path": "/minecraft"},
            {"id": "roblox", "name": "Roblox", "path": "/roblox"},
        ]
    }


@api_router.get("/market/search/{category}")
async def search_market(category: str, request: Request):
    if category not in SUPPORTED_CATEGORIES:
        raise HTTPException(status_code=400, detail=f"Unsupported category: {category}")

    # Build query params from request
    params = dict(request.query_params)
    cache_key = f"search:{category}:{str(sorted(params.items()))}"

    # Check cache
    cached = await db.lzt_cache.find_one({"cache_key": cache_key}, {"_id": 0})
    if cached and cached.get("data"):
        logger.info(f"Cache HIT for {category} search")
        return cached["data"]

    # Call LZT API
    api_path = SUPPORTED_CATEGORIES[category]
    url = f"{LZT_BASE_URL}{api_path}"
    logger.info(f"Fetching LZT API: {url} params={params}")

    try:
        resp = await http_client.get(url, params=params)
        resp.raise_for_status()
        data = resp.json()
    except httpx.HTTPStatusError as e:
        logger.error(f"LZT API error: {e.response.status_code} {e.response.text[:500]}")
        raise HTTPException(status_code=e.response.status_code, detail=f"LZT API error: {e.response.status_code}")
    except Exception as e:
        logger.error(f"LZT API connection error: {str(e)}")
        raise HTTPException(status_code=502, detail=f"Failed to connect to LZT API: {str(e)}")

    # Cache the result
    try:
        expires_at = datetime.now(timezone.utc) + timedelta(seconds=CACHE_TTL_SEARCH)
        await db.lzt_cache.update_one(
            {"cache_key": cache_key},
            {"$set": {"cache_key": cache_key, "data": data, "expires_at": expires_at}},
            upsert=True
        )
    except Exception as e:
        logger.warning(f"Cache write failed: {e}")

    return data


@api_router.get("/market/item/{item_id}")
async def get_market_item(item_id: int):
    cache_key = f"item:{item_id}"

    cached = await db.lzt_cache.find_one({"cache_key": cache_key}, {"_id": 0})
    if cached and cached.get("data"):
        logger.info(f"Cache HIT for item {item_id}")
        return cached["data"]

    url = f"{LZT_BASE_URL}/{item_id}"
    logger.info(f"Fetching LZT item: {url}")

    try:
        resp = await http_client.get(url)
        resp.raise_for_status()
        data = resp.json()
    except httpx.HTTPStatusError as e:
        logger.error(f"LZT API error: {e.response.status_code}")
        raise HTTPException(status_code=e.response.status_code, detail=f"LZT API error")
    except Exception as e:
        logger.error(f"LZT API connection error: {str(e)}")
        raise HTTPException(status_code=502, detail="Failed to connect to LZT API")

    # Cache
    try:
        expires_at = datetime.now(timezone.utc) + timedelta(seconds=CACHE_TTL_ITEM)
        await db.lzt_cache.update_one(
            {"cache_key": cache_key},
            {"$set": {"cache_key": cache_key, "data": data, "expires_at": expires_at}},
            upsert=True
        )
    except Exception as e:
        logger.warning(f"Cache write failed: {e}")

    return data


# ======================== HEALTH CHECK ========================

@api_router.get("/")
async def root():
    return {"message": "LZT Vault API", "status": "ok"}


# ======================== APP SETUP ========================

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup():
    await ensure_cache_indexes()
    logger.info("LZT Vault API started")


@app.on_event("shutdown")
async def shutdown_db_client():
    await http_client.aclose()
    client.close()
