import { motion } from 'framer-motion';
import { Crosshair, Sparkles, Globe, Heart, Swords, GitCompare, Check, Crown, Trophy } from 'lucide-react';
import { getValorantRankName, getRankColorFromInt, getOriginLabel, getOriginColor, isLocalFavorite, toggleLocalFavorite, addServerFavorite, removeServerFavorite, getCurrencySymbol } from '@/data/api';
import { useState } from 'react';

const CARD_GRADIENTS = ['from-red-950/40 via-zinc-950 to-zinc-950','from-blue-950/40 via-zinc-950 to-zinc-950','from-purple-950/40 via-zinc-950 to-zinc-950','from-cyan-950/40 via-zinc-950 to-zinc-950','from-emerald-950/40 via-zinc-950 to-zinc-950','from-amber-950/40 via-zinc-950 to-zinc-950'];
const LOL_RANK_COLORS = { IRON: '#8c8c8c', BRONZE: '#b87333', SILVER: '#c0c0c0', GOLD: '#ffd700', PLATINUM: '#00bcd4', EMERALD: '#00e676', DIAMOND: '#b388ff', MASTER: '#9d4dbb', GRANDMASTER: '#ff4655', CHALLENGER: '#ffe57f' };

function getLolRankColor(rank) {
  if (!rank) return '#a1a1aa';
  const tier = rank.split(' ')[0].toUpperCase();
  return LOL_RANK_COLORS[tier] || '#a1a1aa';
}

export default function ProductCard({ product, onClick, index, category, compareItems, onToggleCompare, user }) {
  const [fav, setFav] = useState(isLocalFavorite(product.item_id));
  const gradient = CARD_GRADIENTS[index % CARD_GRADIENTS.length];
  const isVal = category === 'valorant';
  const isLol = category === 'lol';
  const origin = product.item_origin || '';
  const cs = getCurrencySymbol(product.price_currency);
  const isComparing = compareItems?.some(p => p.item_id === product.item_id);

  // Valorant fields
  const valRankInt = product.riot_valorant_rank || 0;
  const valRankName = product.valorantRankTitle || getValorantRankName(valRankInt);
  const valRankColor = getRankColorFromInt(valRankInt);
  const valRegion = product.riot_valorant_region || '';
  const valSkinCount = product.riot_valorant_skin_count || 0;
  const valLevel = product.riot_valorant_level || 0;
  const valKnifeCount = product.riot_valorant_knife_count || 0;

  // LoL fields
  const lolRegion = product.riot_lol_region || product.lolRegionPhrase || '';
  const lolSkinCount = product.riot_lol_skin_count || 0;
  const lolChampCount = product.riot_lol_champion_count || 0;
  const lolLevel = product.riot_lol_level || 0;
  const lolRank = product.riot_lol_rank || '';
  const lolRankColor = getLolRankColor(lolRank);

  // Dynamic title
  const dynamicTitle = isVal
    ? `${valRegion || '??'} | ${valRankName} | ${valSkinCount} Skins`
    : isLol
    ? `${lolRegion || '??'} | ${lolRank || 'Unranked'} | ${lolSkinCount} Skins`
    : product.title || `Account #${product.item_id}`;

  // Which stats to display
  const rankName = isVal ? valRankName : lolRank || 'Unranked';
  const rankColor = isVal ? valRankColor : lolRankColor;
  const region = isVal ? valRegion : lolRegion;
  const level = isVal ? valLevel : lolLevel;
  const skinCount = isVal ? valSkinCount : lolSkinCount;

  const handleFav = (e) => {
    e.stopPropagation();
    const newFavs = toggleLocalFavorite(product.item_id);
    const nowFav = newFavs.includes(product.item_id);
    setFav(nowFav);
    if (user) { nowFav ? addServerFavorite(product.item_id) : removeServerFavorite(product.item_id); }
  };

  const handleCompare = (e) => { e.stopPropagation(); onToggleCompare?.(product); };

  return (
    <motion.div data-testid={`product-card-${product.item_id}`}
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: Math.min(index * 0.03, 0.4) }}
      whileHover={{ y: -4 }}
      onClick={() => onClick(product)}
      className={`group cursor-pointer bg-zinc-900 border rounded-xl overflow-hidden relative transition-all duration-300 hover:shadow-[0_8px_30px_rgba(255,70,85,0.12)] ${isComparing ? 'border-electric/50 shadow-[0_0_20px_rgba(0,229,255,0.15)]' : 'border-white/5 hover:border-valorant/40'}`}>

      <div className={`h-28 relative overflow-hidden bg-gradient-to-br ${gradient}`}>
        <div className="absolute inset-0 opacity-20"><div className="absolute top-4 right-4 w-20 h-20 border border-white/10 rounded-full" /></div>
        <div className="absolute bottom-3 left-4 flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center border" style={{ backgroundColor: `${rankColor}15`, borderColor: `${rankColor}40` }}>
            {isLol ? <Crown className="w-3.5 h-3.5" style={{ color: rankColor }} /> : <Crosshair className="w-3.5 h-3.5" style={{ color: rankColor }} />}
          </div>
          <div>
            <p className="text-xs font-bold text-white font-heading leading-none">{rankName}</p>
            <p className="text-[10px] text-zinc-400 mt-0.5">{isLol ? 'League of Legends' : 'Valorant'}</p>
          </div>
        </div>
        <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-zinc-900 to-transparent" />
        <div className="absolute top-3 right-3 flex gap-1.5">
          {region && <span className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-zinc-800/80 backdrop-blur-sm border border-white/10 text-zinc-300"><Globe className="w-3 h-3" />{region}</span>}
          {origin && <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${getOriginColor(origin)}`}>{getOriginLabel(origin)}</span>}
        </div>
        <div className="absolute top-3 left-3 z-10 flex gap-1.5">
          <button data-testid={`fav-btn-${product.item_id}`} onClick={handleFav} className="w-7 h-7 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center hover:bg-black/60">
            <Heart className={`w-3.5 h-3.5 ${fav ? 'fill-valorant text-valorant' : 'text-zinc-400'}`} />
          </button>
          <button data-testid={`compare-btn-${product.item_id}`} onClick={handleCompare} className={`w-7 h-7 rounded-full backdrop-blur-sm flex items-center justify-center hover:bg-black/60 ${isComparing ? 'bg-electric/20' : 'bg-black/40'}`}>
            {isComparing ? <Check className="w-3.5 h-3.5 text-electric" /> : <GitCompare className="w-3.5 h-3.5 text-zinc-400" />}
          </button>
        </div>
      </div>

      <div className="p-4 card-pattern">
        <h3 className="text-sm font-heading font-semibold text-white truncate group-hover:text-valorant transition-colors">{dynamicTitle}</h3>
        {product.title && <p className="text-[10px] text-zinc-500 truncate mt-0.5">{product.title}</p>}
        <div className="flex items-baseline gap-2 mt-2">
          <span className="text-xl font-heading font-bold text-white">{cs}{product.price?.toFixed?.(2) || product.price}</span>
          {product.original_price && product.original_price !== product.price && <span className="text-xs text-zinc-500 line-through">{cs}{product.original_price?.toFixed?.(2)}</span>}
        </div>
        <div className="flex flex-wrap items-center gap-1.5 mt-3 pt-3 border-t border-white/5">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-zinc-800/80 text-[10px] font-semibold text-electric">LV {level}</span>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-zinc-800/80 text-[10px] font-semibold text-amber-400"><Sparkles className="w-3 h-3" />{skinCount}</span>
          {isVal && valKnifeCount > 0 && <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-valorant/10 text-[10px] font-semibold text-valorant"><Swords className="w-3 h-3" />{valKnifeCount}</span>}
          {isLol && lolChampCount > 0 && <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-purple-500/10 text-[10px] font-semibold text-purple-400"><Trophy className="w-3 h-3" />{lolChampCount} champs</span>}
        </div>
      </div>
    </motion.div>
  );
}
