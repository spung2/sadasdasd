# LZT Vault - Digital Game Account Marketplace

## Architecture
- **Frontend**: React + Tailwind CSS + Framer Motion + Lucide React
- **Backend**: FastAPI (LZT proxy, auth, admin settings, favorites, skin proxy)
- **Database**: MongoDB (sessions, cache with TTL, admin settings, favorites)
- **Auth**: Emergent Google OAuth (first login becomes admin)
- **External APIs**: LZT Market (prod-api.lzt.market), Valorant-API (valorant-api.com)

## Implemented Features (Phase 3 - Current)
### Core Marketplace
- [x] Real LZT Market API with server-side MongoDB caching (5min search, 15min items)
- [x] Only Valorant + League of Legends categories
- [x] 100% commission markup (configurable per-category via Admin)
- [x] Default EU region filter (configurable via Admin)
- [x] Data-rich cards: dynamic "Region|Rank|Skins" titles, stat badges
- [x] Commission prices with strikethrough original

### Admin Dashboard (/admin)
- [x] Default fetch region selector
- [x] Per-category commission slider (0-300%)
- [x] Admin email management
- [x] Protected by Google OAuth + admin email check

### Skin Gallery
- [x] Real Valorant weapon skin images from valorant-api.com
- [x] Tier-colored masonry grid (Exclusive/Premium/Deluxe/Select)
- [x] 24h cache in MongoDB

### Account Comparison
- [x] Select 2 accounts with compare buttons on cards
- [x] Bottom bar showing selected items
- [x] Side-by-side modal: Price, Region, Rank, Level, Skins, Knives, VP, RP, Agents

### Advanced Filters
- [x] Rank range slider (Unranked to Radiant)
- [x] Min skins slider (0-200)
- [x] Knife toggle
- [x] Region, origin, price, sort, currency

### Auth & Favorites
- [x] Google OAuth via Emergent Auth
- [x] Favorites: localStorage for guests, MongoDB sync for logged-in
- [x] First login auto-sets admin email

## Test Results
- Phase 3: 38/38 tests passed (100% backend + frontend)
