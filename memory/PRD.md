# LZT Vault - Digital Game Account Marketplace

## Architecture
- Frontend: React + Tailwind CSS + Framer Motion
- Backend: FastAPI + MongoDB + LZT Market API proxy
- Auth: Emergent Google OAuth (first login = admin)
- External: LZT Market API, Valorant-API.com

## Routes
- / → Landing page (hero, features, CTAs)
- /market → Marketplace dashboard (filters, cards, modals)
- /admin → Admin settings (region, commission, email)
- /admin/sync-settings → LZT API parameter config (3-column layout)

## All Implemented Features
### Landing Page (NEW)
- Premium hero with "Curated for You" heading
- Live API status pill, stat pills (35K+, Real, 24/7)
- 6 feature cards, bottom CTA section

### Marketplace (/market)
- Real LZT data, Valorant + LoL categories
- Commission markup (100% default, configurable per-category)
- Dynamic cards: "Region|Rank|Skins" format
- LoL cards: Crown icon, champion count badge, region, rank
- Valorant cards: rank color, knives badge, skin count

### Real Skin Inventory (FIXED)
- Parses valorantInventory.WeaponSkins UUIDs from LZT API
- Matches against 1,287 skins from valorant-api.com by UUID
- NO randomization - only shows actual account skins
- Loads partial from search, then full from item detail

### LoL Dynamic Display (FIXED)
- Cards: lol_level, lol_skin_count, lol_champion_count, lol_rank
- Modal: Crown rank, Champions stat, Blue/Orange/Mythic Essence, RP
- Client-side filter: riot_lol_level > 0 for LoL tab

### Admin Session (FIXED)
- is_admin returned in POST /api/auth/session response
- Old sessions cleaned on new login (delete_many)
- Cookie: samesite=none, secure=true for HTTPS
- First login auto-sets admin email

## Test Results
- Backend: 6/6 API tests passing
- Frontend: 6/6 Playwright tests passing
- All screenshots verified visually
