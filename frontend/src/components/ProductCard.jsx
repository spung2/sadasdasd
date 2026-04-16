import { motion } from 'framer-motion';
import { Crosshair, Sparkles, Globe, Heart, Gamepad2, ShoppingBag } from 'lucide-react';
import { getValorantRankName, getRankColorFromInt, getOriginLabel, getOriginColor, isFavorite, toggleFavorite } from '@/data/api';
import { useState } from 'react';

const CARD_GRADIENTS = [
  'from-red-950/40 via-zinc-950 to-zinc-950',
  'from-blue-950/40 via-zinc-950 to-zinc-950',
  'from-purple-950/40 via-zinc-950 to-zinc-950',
  'from-cyan-950/40 via-zinc-950 to-zinc-950',
  'from-emerald-950/40 via-zinc-950 to-zinc-950',
  'from-amber-950/40 via-zinc-950 to-zinc-950',
];

function getCurrencySymbol(currency) {
  const map = { usd: '$', eur: '\u20AC', rub: '\u20BD', gbp: '\u00A3', cny: '\u00A5' };
  return map[currency] || '$';
}

export default function ProductCard({ product, onClick, index, category }) {
  const [fav, setFav] = useState(isFavorite(product.item_id));
  const gradient = CARD_GRADIENTS[index % CARD_GRADIENTS.length];
  const isRiot = category === 'riot';
  const rankInt = product.riot_valorant_rank || 0;
  const rankName = product.valorantRankTitle || getValorantRankName(rankInt);
  const rankColor = getRankColorFromInt(rankInt);
  const region = product.riot_valorant_region || product.valorantRegionPhrase || '';
  const skinCount = product.riot_valorant_skin_count || 0;
  const level = product.riot_valorant_level || product.steam_level || 0;
  const vp = product.riot_valorant_wallet_vp || 0;
  const origin = product.item_origin || '';
  const currencySymbol = getCurrencySymbol(product.price_currency);
  const categoryName = product.category?.category_name || category;

  const handleFav = (e) => {
    e.stopPropagation();
    toggleFavorite(product.item_id);
    setFav(!fav);
  };

  return (
    <motion.div
      data-testid={`product-card-${product.item_id}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: Math.min(index * 0.03, 0.5) }}
      whileHover={{ y: -4 }}
      onClick={() => onClick(product)}
      className="group cursor-pointer bg-zinc-900 border border-white/5 rounded-xl overflow-hidden relative transition-all duration-300 hover:border-valorant/40 hover:shadow-[0_8px_30px_rgba(255,70,85,0.12)]"
    >
      {/* Card header */}
      <div className={`h-28 relative overflow-hidden bg-gradient-to-br ${gradient}`}>
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-4 right-4 w-20 h-20 border border-white/10 rounded-full" />
          <div className="absolute bottom-2 left-4 w-16 h-[1px] bg-gradient-to-r from-white/20 to-transparent" />
        </div>

        {/* Rank/Game indicator */}
        <div className="absolute bottom-3 left-4 flex items-center gap-2">
          {isRiot ? (
            <>
              <div className="w-7 h-7 rounded-lg flex items-center justify-center border" style={{ backgroundColor: `${rankColor}15`, borderColor: `${rankColor}40` }}>
                <Crosshair className="w-3.5 h-3.5" style={{ color: rankColor }} />
              </div>
              <div>
                <p className="text-xs font-bold text-white font-heading leading-none">{rankName}</p>
                <p className="text-[10px] text-zinc-400 mt-0.5">Valorant</p>
              </div>
            </>
          ) : (
            <>
              <div className="w-7 h-7 rounded-lg flex items-center justify-center border border-white/10 bg-white/5">
                <Gamepad2 className="w-3.5 h-3.5 text-zinc-400" />
              </div>
              <div>
                <p className="text-xs font-bold text-white font-heading leading-none capitalize">{categoryName}</p>
                <p className="text-[10px] text-zinc-400 mt-0.5">Account</p>
              </div>
            </>
          )}
        </div>

        <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-zinc-900 to-transparent" />

        {/* Badges */}
        <div className="absolute top-3 right-3 flex gap-1.5">
          {region && (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-zinc-800/80 backdrop-blur-sm border border-white/10 text-zinc-300">
              <Globe className="w-3 h-3" />{region}
            </span>
          )}
          {origin && (
            <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${getOriginColor(origin)}`}>
              {getOriginLabel(origin)}
            </span>
          )}
        </div>

        {/* Favorite button */}
        <button
          data-testid={`fav-btn-${product.item_id}`}
          onClick={handleFav}
          className="absolute top-3 left-3 z-10 w-7 h-7 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center transition-colors hover:bg-black/60"
        >
          <Heart className={`w-3.5 h-3.5 ${fav ? 'fill-valorant text-valorant' : 'text-zinc-400'}`} />
        </button>
      </div>

      {/* Card body */}
      <div className="p-4 relative card-pattern">
        <h3 className="text-sm font-heading font-semibold text-white truncate group-hover:text-valorant transition-colors">
          {product.title || `Account #${product.item_id}`}
        </h3>

        <div className="flex items-baseline gap-1.5 mt-2">
          <span className="text-xl font-heading font-bold text-white">
            {currencySymbol}{product.price?.toFixed?.(2) || product.price}
          </span>
        </div>

        {/* Stats row */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5">
          {isRiot ? (
            <>
              <div className="flex items-center gap-1.5 text-zinc-400">
                <span className="w-5 h-5 rounded bg-zinc-800 flex items-center justify-center text-[10px] font-bold text-electric">LV</span>
                <span className="text-xs">{level}</span>
              </div>
              <div className="flex items-center gap-1.5 text-zinc-400">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-xs">{skinCount} skins</span>
              </div>
              <div className="flex items-center gap-1.5 text-zinc-400">
                <span className="text-xs">{vp} VP</span>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center gap-1.5 text-zinc-400">
                <ShoppingBag className="w-3.5 h-3.5" />
                <span className="text-xs">#{product.item_id}</span>
              </div>
              <div className="flex items-center gap-1.5 text-zinc-400">
                <span className="text-xs">{product.view_count || 0} views</span>
              </div>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
}
