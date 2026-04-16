const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export async function fetchMarketSearch(category = 'riot', params = {}) {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, val]) => {
    if (val !== undefined && val !== null && val !== '') {
      searchParams.set(key, String(val));
    }
  });
  const url = `${API}/market/search/${category}?${searchParams.toString()}`;
  const resp = await fetch(url);
  if (!resp.ok) throw new Error(`API error: ${resp.status}`);
  return resp.json();
}

export async function fetchMarketItem(itemId) {
  const resp = await fetch(`${API}/market/item/${itemId}`);
  if (!resp.ok) throw new Error(`API error: ${resp.status}`);
  return resp.json();
}

export async function fetchCategories() {
  const resp = await fetch(`${API}/market/categories`);
  if (!resp.ok) throw new Error(`API error: ${resp.status}`);
  return resp.json();
}

export async function exchangeSession(sessionId) {
  const resp = await fetch(`${API}/auth/session`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ session_id: sessionId }),
  });
  if (!resp.ok) throw new Error('Auth failed');
  return resp.json();
}

export async function fetchMe() {
  const resp = await fetch(`${API}/auth/me`, { credentials: 'include' });
  if (!resp.ok) throw new Error('Not authenticated');
  return resp.json();
}

export async function logout() {
  await fetch(`${API}/auth/logout`, { method: 'POST', credentials: 'include' });
}

// Valorant rank mapping (rank integer -> display name)
const VALORANT_RANKS = {
  0: 'Unranked', 1: 'Unused', 2: 'Unused',
  3: 'Iron 1', 4: 'Iron 2', 5: 'Iron 3',
  6: 'Bronze 1', 7: 'Bronze 2', 8: 'Bronze 3',
  9: 'Silver 1', 10: 'Silver 2', 11: 'Silver 3',
  12: 'Gold 1', 13: 'Gold 2', 14: 'Gold 3',
  15: 'Platinum 1', 16: 'Platinum 2', 17: 'Platinum 3',
  18: 'Diamond 1', 19: 'Diamond 2', 20: 'Diamond 3',
  21: 'Ascendant 1', 22: 'Ascendant 2', 23: 'Ascendant 3',
  24: 'Immortal 1', 25: 'Immortal 2', 26: 'Immortal 3',
  27: 'Radiant',
};

export function getValorantRankName(rankInt) {
  return VALORANT_RANKS[rankInt] || 'Unranked';
}

export function getRankColorFromInt(rankInt) {
  if (rankInt <= 2) return '#a1a1aa';
  if (rankInt <= 5) return '#8c8c8c';
  if (rankInt <= 8) return '#b87333';
  if (rankInt <= 11) return '#c0c0c0';
  if (rankInt <= 14) return '#ffd700';
  if (rankInt <= 17) return '#00bcd4';
  if (rankInt <= 20) return '#b388ff';
  if (rankInt <= 23) return '#00e676';
  if (rankInt <= 26) return '#ff4655';
  if (rankInt === 27) return '#ffe57f';
  return '#a1a1aa';
}

export function getOriginLabel(origin) {
  const map = { personal: 'Personal', brute: 'Brute', resale: 'Resale', autoreg: 'Auto-Reg', phishing: 'Phish', stealer: 'Stealer', dummy: 'Dummy', self_registration: 'Self-Reg' };
  return map[origin] || origin;
}

export function getOriginColor(origin) {
  const map = {
    personal: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    brute: 'bg-red-500/20 text-red-400 border-red-500/30',
    resale: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    autoreg: 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30',
    phishing: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    stealer: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
    dummy: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
  };
  return map[origin] || 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30';
}

// Favorites (localStorage)
const FAVORITES_KEY = 'lzt_vault_favorites';

export function getFavorites() {
  try {
    return JSON.parse(localStorage.getItem(FAVORITES_KEY) || '[]');
  } catch { return []; }
}

export function toggleFavorite(itemId) {
  const favs = getFavorites();
  const idx = favs.indexOf(itemId);
  if (idx >= 0) {
    favs.splice(idx, 1);
  } else {
    favs.push(itemId);
  }
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(favs));
  return favs;
}

export function isFavorite(itemId) {
  return getFavorites().includes(itemId);
}
