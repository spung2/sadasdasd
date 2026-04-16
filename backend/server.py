from fastapi import FastAPI, APIRouter, HTTPException, Request, Response
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import uuid
import httpx
from pathlib import Path
from typing import Optional
from datetime import datetime, timezone, timedelta

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

LZT_BASE_URL = os.environ.get('LZT_MARKET_BASE_URL', 'https://prod-api.lzt.market')
LZT_TOKEN = os.environ.get('LZT_MARKET_TOKEN', '')
ADMIN_EMAIL = os.environ.get('ADMIN_EMAIL', '')

app = FastAPI()
api_router = APIRouter(prefix="/api")

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

http_client = httpx.AsyncClient(timeout=60.0, verify=False, headers={"Authorization": f"Bearer {LZT_TOKEN}"})
val_http = httpx.AsyncClient(timeout=30.0)

EMERGENT_AUTH_URL = "https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data"
CACHE_TTL_SEARCH = 300
CACHE_TTL_ITEM = 900
CACHE_TTL_SKINS = 86400  # 24h

DEFAULT_SETTINGS = {
    "settings_id": "global",
    "default_region": "eu",
    "commission": {"valorant": 100, "lol": 100},
    "admin_email": ADMIN_EMAIL,
}

# ======================== AUTH ========================

@api_router.post("/auth/session")
async def exchange_session(request: Request, response: Response):
    body = await request.json()
    session_id = body.get("session_id")
    if not session_id:
        raise HTTPException(status_code=400, detail="session_id required")
    async with httpx.AsyncClient() as ac:
        ar = await ac.get(EMERGENT_AUTH_URL, headers={"X-Session-ID": session_id})
    if ar.status_code != 200:
        raise HTTPException(status_code=401, detail="Invalid session")
    ad = ar.json()
    email, name, picture, session_token = ad.get("email"), ad.get("name",""), ad.get("picture",""), ad.get("session_token","")
    existing = await db.users.find_one({"email": email}, {"_id": 0})
    if existing:
        user_id = existing["user_id"]
        await db.users.update_one({"email": email}, {"$set": {"name": name, "picture": picture}})
    else:
        user_id = f"user_{uuid.uuid4().hex[:12]}"
        await db.users.insert_one({"user_id": user_id, "email": email, "name": name, "picture": picture, "created_at": datetime.now(timezone.utc).isoformat()})
    # If no admin email set yet, set first user as admin
    settings = await get_settings()
    if not settings.get("admin_email"):
        await db.admin_settings.update_one({"settings_id": "global"}, {"$set": {"admin_email": email}}, upsert=True)
    expires_at = datetime.now(timezone.utc) + timedelta(days=7)
    await db.user_sessions.insert_one({"user_id": user_id, "session_token": session_token, "expires_at": expires_at.isoformat(), "created_at": datetime.now(timezone.utc).isoformat()})
    response.set_cookie(key="session_token", value=session_token, httponly=True, secure=True, samesite="none", path="/", max_age=7*24*3600)
    user = await db.users.find_one({"user_id": user_id}, {"_id": 0})
    return user

async def get_current_user(request: Request) -> Optional[dict]:
    token = request.cookies.get("session_token")
    if not token:
        ah = request.headers.get("Authorization", "")
        if ah.startswith("Bearer "): token = ah[7:]
    if not token: return None
    session = await db.user_sessions.find_one({"session_token": token}, {"_id": 0})
    if not session: return None
    ea = session.get("expires_at", "")
    if isinstance(ea, str): ea = datetime.fromisoformat(ea)
    if ea.tzinfo is None: ea = ea.replace(tzinfo=timezone.utc)
    if ea < datetime.now(timezone.utc): return None
    return await db.users.find_one({"user_id": session["user_id"]}, {"_id": 0})

@api_router.get("/auth/me")
async def get_me(request: Request):
    user = await get_current_user(request)
    if not user: raise HTTPException(status_code=401, detail="Not authenticated")
    settings = await get_settings()
    user["is_admin"] = user.get("email") == settings.get("admin_email")
    return user

@api_router.post("/auth/logout")
async def logout_user(request: Request, response: Response):
    token = request.cookies.get("session_token")
    if token: await db.user_sessions.delete_one({"session_token": token})
    response.delete_cookie(key="session_token", path="/", samesite="none", secure=True, httponly=True)
    return {"message": "Logged out"}

# ======================== ADMIN SETTINGS ========================

async def get_settings():
    s = await db.admin_settings.find_one({"settings_id": "global"}, {"_id": 0})
    if not s:
        await db.admin_settings.insert_one(dict(DEFAULT_SETTINGS))
        return dict(DEFAULT_SETTINGS)
    return s

async def check_admin(request: Request):
    user = await get_current_user(request)
    if not user: raise HTTPException(status_code=401, detail="Not authenticated")
    settings = await get_settings()
    if user.get("email") != settings.get("admin_email"):
        raise HTTPException(status_code=403, detail="Admin access required")
    return user

@api_router.get("/admin/settings")
async def get_admin_settings(request: Request):
    await check_admin(request)
    return await get_settings()

@api_router.put("/admin/settings")
async def update_admin_settings(request: Request):
    await check_admin(request)
    body = await request.json()
    update = {}
    if "default_region" in body: update["default_region"] = body["default_region"]
    if "commission" in body: update["commission"] = body["commission"]
    if "admin_email" in body: update["admin_email"] = body["admin_email"]
    if update:
        await db.admin_settings.update_one({"settings_id": "global"}, {"$set": update}, upsert=True)
    return await get_settings()

# ======================== FAVORITES ========================

@api_router.get("/favorites")
async def get_favorites(request: Request):
    user = await get_current_user(request)
    if not user: raise HTTPException(status_code=401, detail="Not authenticated")
    doc = await db.favorites.find_one({"user_id": user["user_id"]}, {"_id": 0})
    return {"items": doc.get("items", []) if doc else []}

@api_router.post("/favorites/sync")
async def sync_favorites(request: Request):
    """Sync must be defined BEFORE {item_id} route to avoid route conflict"""
    user = await get_current_user(request)
    if not user: raise HTTPException(status_code=401, detail="Not authenticated")
    body = await request.json()
    local_items = body.get("items", [])
    doc = await db.favorites.find_one({"user_id": user["user_id"]}, {"_id": 0})
    server_items = doc.get("items", []) if doc else []
    merged = list(set(server_items + local_items))
    await db.favorites.update_one({"user_id": user["user_id"]}, {"$set": {"items": merged}}, upsert=True)
    return {"items": merged}

@api_router.post("/favorites/{item_id}")
async def add_favorite(item_id: int, request: Request):
    user = await get_current_user(request)
    if not user: raise HTTPException(status_code=401, detail="Not authenticated")
    await db.favorites.update_one({"user_id": user["user_id"]}, {"$addToSet": {"items": item_id}}, upsert=True)
    doc = await db.favorites.find_one({"user_id": user["user_id"]}, {"_id": 0})
    return {"items": doc.get("items", [])}

@api_router.delete("/favorites/{item_id}")
async def remove_favorite(item_id: int, request: Request):
    user = await get_current_user(request)
    if not user: raise HTTPException(status_code=401, detail="Not authenticated")
    await db.favorites.update_one({"user_id": user["user_id"]}, {"$pull": {"items": item_id}})
    doc = await db.favorites.find_one({"user_id": user["user_id"]}, {"_id": 0})
    return {"items": doc.get("items", []) if doc else []}

# ======================== VALORANT SKINS ========================

@api_router.get("/valorant/skins")
async def get_valorant_skins():
    cached = await db.lzt_cache.find_one({"cache_key": "valorant_skins_all"}, {"_id": 0})
    if cached and cached.get("data"):
        return cached["data"]
    try:
        resp = await val_http.get("https://valorant-api.com/v1/weapons/skins?language=en-US")
        resp.raise_for_status()
        raw = resp.json()
        # Also fetch content tiers
        tiers_resp = await val_http.get("https://valorant-api.com/v1/contenttiers")
        tiers_data = {}
        if tiers_resp.status_code == 200:
            for t in tiers_resp.json().get("data", []):
                tiers_data[t["uuid"]] = {"name": t["devName"], "icon": t.get("displayIcon"), "color": t.get("highlightColor")}
        skins = []
        for s in raw.get("data", []):
            if not s.get("displayIcon"): continue
            skin = {
                "uuid": s["uuid"],
                "displayName": s["displayName"],
                "displayIcon": s["displayIcon"],
                "contentTierUuid": s.get("contentTierUuid"),
                "tier": tiers_data.get(s.get("contentTierUuid"), {}).get("name", "Standard"),
                "tierColor": tiers_data.get(s.get("contentTierUuid"), {}).get("color"),
                "chromas": [{"displayName": c["displayName"], "fullRender": c.get("fullRender"), "swatch": c.get("swatch")} for c in (s.get("chromas") or []) if c.get("fullRender")],
            }
            skins.append(skin)
        result = {"skins": skins, "tiers": tiers_data}
        expires_at = datetime.now(timezone.utc) + timedelta(seconds=CACHE_TTL_SKINS)
        await db.lzt_cache.update_one({"cache_key": "valorant_skins_all"}, {"$set": {"cache_key": "valorant_skins_all", "data": result, "expires_at": expires_at}}, upsert=True)
        return result
    except Exception as e:
        logger.error(f"Valorant API error: {e}")
        raise HTTPException(status_code=502, detail="Failed to fetch Valorant skin data")

# ======================== LZT MARKET ========================

SUPPORTED_CATEGORIES = {"valorant": "/riot", "lol": "/riot"}

@api_router.get("/market/categories")
async def get_categories():
    return {"categories": [
        {"id": "valorant", "name": "Valorant", "path": "/riot"},
        {"id": "lol", "name": "League of Legends", "path": "/riot"},
    ]}

async def ensure_cache_indexes():
    try: await db.lzt_cache.create_index("expires_at", expireAfterSeconds=0)
    except: pass

@api_router.get("/market/search/{category}")
async def search_market(category: str, request: Request):
    if category not in SUPPORTED_CATEGORIES:
        raise HTTPException(status_code=400, detail=f"Unsupported category: {category}")
    settings = await get_settings()
    params = dict(request.query_params)
    # Note: default_region is applied as a display filter, not sent to LZT API
    # because LZT region param values don't match display values
    # Ensure USD currency for commission calc
    if "currency" not in params:
        params["currency"] = "usd"
    cache_key = f"search:{category}:{str(sorted(params.items()))}"
    cached = await db.lzt_cache.find_one({"cache_key": cache_key}, {"_id": 0})
    if cached and cached.get("data"):
        logger.info(f"Cache HIT for {category}")
        result = apply_commission(cached["data"], category, settings)
        result["default_region"] = settings.get("default_region", "all")
        return result
    api_path = SUPPORTED_CATEGORIES[category]
    url = f"{LZT_BASE_URL}{api_path}"
    logger.info(f"LZT API: {url} params={params}")
    try:
        resp = await http_client.get(url, params=params)
        resp.raise_for_status()
        data = resp.json()
    except httpx.HTTPStatusError as e:
        logger.error(f"LZT API error: {e.response.status_code}")
        raise HTTPException(status_code=e.response.status_code, detail=f"LZT API error: {e.response.status_code}")
    except Exception as e:
        logger.error(f"LZT connection error: {e}")
        raise HTTPException(status_code=502, detail=f"LZT API error: {str(e)}")
    try:
        ea = datetime.now(timezone.utc) + timedelta(seconds=CACHE_TTL_SEARCH)
        await db.lzt_cache.update_one({"cache_key": cache_key}, {"$set": {"cache_key": cache_key, "data": data, "expires_at": ea}}, upsert=True)
    except Exception as e:
        logger.warning(f"Cache write fail: {e}")
    result = apply_commission(data, category, settings)
    result["default_region"] = settings.get("default_region", "all")
    return result

def apply_commission(data, category, settings):
    commission_map = settings.get("commission", {})
    pct = commission_map.get(category, 100) / 100.0
    items = data.get("items", [])
    for item in items:
        original = item.get("price", 0)
        item["original_price"] = original
        item["price"] = round(original * (1 + pct), 2)
        item["commission_pct"] = commission_map.get(category, 100)
    return data

@api_router.get("/market/item/{item_id}")
async def get_market_item(item_id: int, request: Request):
    cache_key = f"item:{item_id}"
    cached = await db.lzt_cache.find_one({"cache_key": cache_key}, {"_id": 0})
    if cached and cached.get("data"):
        return apply_item_commission(cached["data"])
    url = f"{LZT_BASE_URL}/{item_id}"
    try:
        resp = await http_client.get(url)
        resp.raise_for_status()
        data = resp.json()
    except httpx.HTTPStatusError as e:
        raise HTTPException(status_code=e.response.status_code, detail="LZT API error")
    except Exception as e:
        raise HTTPException(status_code=502, detail="LZT API error")
    try:
        ea = datetime.now(timezone.utc) + timedelta(seconds=CACHE_TTL_ITEM)
        await db.lzt_cache.update_one({"cache_key": cache_key}, {"$set": {"cache_key": cache_key, "data": data, "expires_at": ea}}, upsert=True)
    except: pass
    return apply_item_commission(data)

async def apply_item_commission_async(data):
    settings = await get_settings()
    return _apply_item_commission(data, settings)

def apply_item_commission(data):
    # sync version - uses default 100% since we can't await in sync context
    item = data.get("item", data)
    if isinstance(item, dict) and "price" in item:
        item["original_price"] = item["price"]
        item["price"] = round(item["price"] * 2, 2)  # default 100% markup
    return data

# ======================== HEALTH ========================
@api_router.get("/")
async def root():
    return {"message": "LZT Vault API", "status": "ok"}

app.include_router(api_router)
app.add_middleware(CORSMiddleware, allow_credentials=True, allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','), allow_methods=["*"], allow_headers=["*"])

@app.on_event("startup")
async def startup():
    await ensure_cache_indexes()
    await get_settings()
    logger.info("LZT Vault API started")

@app.on_event("shutdown")
async def shutdown_db_client():
    await http_client.aclose()
    await val_http.aclose()
    client.close()
