# LZT Vault - Digital Game Account Marketplace

## Original Problem Statement
Build a highly advanced, visually stunning, frontend-only prototype for a "Digital Game Account Marketplace" targeting Valorant accounts from LZT Market. Premium dark mode gaming aesthetic with glassmorphism, micro-animations, heavy interactivity.

## Architecture
- **Frontend**: React (CRA) + Tailwind CSS + Framer Motion + Lucide React
- **Backend**: FastAPI (unchanged, not used for this prototype)
- **Data Layer**: Mock data in `mockData.js` simulating LZT API responses
- **Components**: Shadcn UI (Select, Slider, Switch, Badge, Separator, Tooltip)
- **Fonts**: Outfit (headings) + Manrope (body) via Google Fonts

## User Personas
1. **Gamer/Buyer**: Browsing Valorant accounts, filtering by rank/price/region, previewing details
2. **Reseller**: Viewing marketplace listings, comparing accounts

## Core Requirements (Static)
1. Premium dark mode gaming aesthetic (#09090b background, #ff4655 primary, #00e5ff secondary)
2. Glassmorphism on modals/sidebars
3. Micro-animations via Framer Motion
4. Dashboard with advanced filter sidebar
5. Responsive product grid (1-3 columns)
6. Account cards with badges, rank indicator, stats
7. 80% screen preview modal with full account details
8. Skin showcase in masonry grid with tier-based colors
9. Security status banners (Safe/Flagged)
10. Skeleton loaders with shimmer effect
11. Mock data layer with 28 Valorant accounts

## What's Been Implemented (Feb 2026)
- [x] Full dashboard layout with navbar, search, sidebar, grid
- [x] Filter sidebar: price range, min level, rank, region, origin, sort, skin toggle
- [x] Product cards with gradient headers, badges, hover animations
- [x] 80% screen preview modal with glassmorphism
- [x] Stat grid (Rank, Level, VP, Radianite)
- [x] Skin showcase masonry grid with tier colors
- [x] Security banner (Safe to Play / Account Flagged)
- [x] Seller notes blockquote
- [x] Skeleton loading shimmer effect
- [x] Empty state
- [x] Mobile responsive with filter drawer
- [x] All 24 features tested and passing (100% success rate)

## Prioritized Backlog
### P0 (Complete)
- All core features implemented and tested

### P1
- Real LZT API integration (requires OAuth token)
- Pagination / infinite scroll for large result sets
- Account comparison feature (side-by-side)

### P2
- User authentication / favorites system
- Wishlist / cart functionality
- Currency toggle (USD/RUB)
- Advanced skin search within accounts
- Price history charts

## Next Tasks
1. Real LZT API integration with OAuth
2. User auth (sign in/register)
3. Favorites/wishlist persistence
4. Pagination for large datasets
