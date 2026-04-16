# LZT Vault - Digital Game Account Marketplace

## Architecture
- Frontend: React + Tailwind + Framer Motion | Backend: FastAPI + MongoDB
- Auth: Emergent Google OAuth | External: LZT Market API, Valorant-API.com

## Routes
- / → Landing page | /market → Marketplace | /admin → Admin panel

## URL Profile System (NEW)
- Admin pastes LZT Market URLs in admin panel
- Backend parses URL params (urllib.parse), saves as profile
- Profiles appear as clickable sub-category tabs on marketplace
- GET /api/market/profile/{id} fetches using saved params
- Public GET /api/profiles, Admin POST/PUT/DELETE

## All Features
- Landing page with hero, features, CTAs
- Marketplace: Valorant + LoL with profile sub-tabs
- Real skin inventory (UUID matching from valorant-api.com)
- LoL dynamic display (rank, champions, essences)
- Commission markup (configurable per-category)
- Account comparison (2 side-by-side)
- Favorites (localStorage + MongoDB sync)
- Pagination, search, advanced filters
- Admin: profile management, region, commission, email settings

## Test Results: 37/37 passed (19 backend + 18 frontend = 100%)
