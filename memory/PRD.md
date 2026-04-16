# LZT Vault - Digital Game Account Marketplace

## Architecture
- Frontend: React + Tailwind + Framer Motion | Backend: FastAPI + MongoDB
- Auth: Emergent Google OAuth | External: LZT Market API, Valorant-API.com, DataDragon

## All Features
### Marketplace (/market)
- URL Profile sub-categories, Base URL filtering (admin-curated)
- Commission markup with fake higher strikethrough (price*1.25)
- Character splash backgrounds on cards (agents/champions, 15% opacity)
- Dynamic "Region|Rank|Skins" titles

### Visual Galleries (Modal)
- Valorant: Agent gallery + Weapon skin gallery (UUID-matched, tier colors)
- LoL: Champion gallery (DataDragon icons) + Skin splash art gallery
- Tracker links: Valorant Tracker, op.gg, u.gg (NO LZT exposure)

### Admin (/admin)
- Base Fetch URLs for All Valorant / All LoL
- URL Profile management (paste LZT URLs)
- Commission sliders, region, email settings

## Test Results: 28/28 passed (14 backend + 14 frontend = 100%)
