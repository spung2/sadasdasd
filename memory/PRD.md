# LZT Vault - Digital Game Account Marketplace

## Architecture
- Frontend: React + Tailwind CSS + Framer Motion
- Backend: FastAPI + MongoDB + LZT Market API proxy
- Auth: Emergent Google OAuth
- External: LZT Market API, Valorant-API.com

## All Implemented Features
### Marketplace (/)
- Real LZT data, Valorant + LoL categories, commission markup, dynamic cards
- Skin gallery with real Valorant weapon images from valorant-api.com
- Account comparison (2 side-by-side), favorites sync, pagination
- Advanced filters: rank range, min skins, knife toggle, region, origin

### Admin Panel (/admin)
- Default region, per-category commission sliders, admin email config

### Sync Settings (/admin/sync-settings) ← NEW
- Exact 1:1 clone of LZT Market advanced filtering layout
- 3-column layout: General | Valorant | League of Legends
- All form values saved to MongoDB fetch_settings collection
- Maps directly to LZT API query parameters
- Includes: origins, country, email/phone toggles, email type/domain/provider,
  sold before checkboxes, rank ranges, skins, knives, VP, RP, inventory, agents,
  LoL champions, blue/orange/mythic essence, riot points

## Test Results
- Phase 4: 34/34 tests passed (15 backend + 19 frontend = 100%)
- Cumulative: All phases passing
