import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  X, ExternalLink, ShieldCheck, ShieldAlert, Crosshair, Sparkles,
  Star, Clock, Users, TrendingUp, Swords, Gem, Eye, Heart,
  Gamepad2, Globe, Tag,
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
  getValorantRankName, getRankColorFromInt, getOriginLabel, getOriginColor,
  isFavorite, toggleFavorite, fetchMarketItem,
} from '@/data/api';

function StatBox({ icon: Icon, label, value, color }) {
  return (
    <div className="flex flex-col items-center justify-center p-4 rounded-xl bg-zinc-900/80 border border-white/5 hover:border-white/10 transition-colors">
      <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-2" style={{ backgroundColor: `${color}15` }}>
        <Icon className="w-5 h-5" style={{ color }} />
      </div>
      <span className="text-lg font-heading font-bold text-white">{value}</span>
      <span className="text-[10px] font-body text-zinc-500 uppercase tracking-wider mt-0.5">{label}</span>
    </div>
  );
}

function getCurrencySymbol(currency) {
  const map = { usd: '$', eur: '\u20AC', rub: '\u20BD', gbp: '\u00A3', cny: '\u00A5' };
  return map[currency] || '$';
}

export default function LztPreviewModal({ product, category, onClose }) {
  const [fav, setFav] = useState(isFavorite(product.item_id));
  const [detailedItem, setDetailedItem] = useState(null);

  // Optionally fetch full item details
  useEffect(() => {
    fetchMarketItem(product.item_id).then(data => {
      if (data?.item) setDetailedItem(data.item);
    }).catch(() => {});
  }, [product.item_id]);

  const item = detailedItem || product;
  const isRiot = category === 'riot' || item.category?.category_name === 'riot';
  const rankInt = item.riot_valorant_rank || 0;
  const rankName = item.valorantRankTitle || getValorantRankName(rankInt);
  const rankColor = getRankColorFromInt(rankInt);
  const region = item.riot_valorant_region || item.valorantRegionPhrase || '';
  const origin = item.item_origin || '';
  const skinCount = item.riot_valorant_skin_count || 0;
  const level = item.riot_valorant_level || item.steam_level || 0;
  const vp = item.riot_valorant_wallet_vp || 0;
  const rp = item.riot_valorant_wallet_rp || 0;
  const agentCount = item.riot_valorant_agent_count || 0;
  const knifeCount = item.riot_valorant_knife_count || 0;
  const currencySymbol = getCurrencySymbol(item.price_currency);
  const publishedDate = item.published_date ? new Date(item.published_date * 1000) : null;
  const lastActivity = item.riot_last_activity ? new Date(item.riot_last_activity * 1000) : null;
  const daysAgo = lastActivity ? Math.floor((Date.now() - lastActivity.getTime()) / (1000 * 60 * 60 * 24)) : null;
  const isRecentlyActive = daysAgo !== null && daysAgo < 7;

  const feedbackData = item.feedback_data ? (typeof item.feedback_data === 'string' ? JSON.parse(item.feedback_data) : item.feedback_data) : {};
  const catFeedback = feedbackData[String(item.category_id)] || feedbackData['13'] || {};
  const positiveRating = catFeedback.positive || 0;
  const negativeRating = catFeedback.negative || 0;

  const handleFav = () => {
    toggleFavorite(product.item_id);
    setFav(!fav);
  };

  const lztUrl = `https://lzt.market/${product.item_id}/`;

  return (
    <motion.div
      data-testid="preview-modal"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6"
    >
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

      <motion.div
        initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="relative w-full max-w-5xl max-h-[90vh] overflow-y-auto glass rounded-2xl"
      >
        <div>
          {/* Header */}
          <div className="relative h-44 sm:h-52 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 via-zinc-950 to-black" />
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full opacity-20 blur-2xl" style={{ backgroundColor: rankColor }} />
              <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full bg-valorant/10 blur-3xl" />
            </div>

            <button data-testid="close-modal-btn" onClick={onClose} className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-black/50 backdrop-blur-sm border border-white/10 flex items-center justify-center text-zinc-400 hover:text-white hover:border-white/20 transition-all">
              <X className="w-4 h-4" />
            </button>

            <button data-testid="modal-fav-btn" onClick={handleFav} className="absolute top-4 right-16 z-10 w-9 h-9 rounded-full bg-black/50 backdrop-blur-sm border border-white/10 flex items-center justify-center transition-all hover:border-white/20">
              <Heart className={`w-4 h-4 ${fav ? 'fill-valorant text-valorant' : 'text-zinc-400'}`} />
            </button>

            <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-zinc-900/95 to-transparent">
              <div className="flex items-end justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    {origin && <Badge className={`text-[10px] border ${getOriginColor(origin)}`}>{getOriginLabel(origin)}</Badge>}
                    {region && <Badge className="text-[10px] bg-zinc-800/80 text-zinc-300 border-zinc-700/50">{region}</Badge>}
                    <Badge className="text-[10px] bg-zinc-800/80 text-zinc-300 border-zinc-700/50">ID: {product.item_id}</Badge>
                    {item.nsb === 1 && <Badge className="text-[10px] bg-electric/10 text-electric border-electric/30">NSB</Badge>}
                  </div>
                  <h2 className="text-xl sm:text-2xl font-heading font-bold text-white truncate">{item.title || `Account #${product.item_id}`}</h2>
                  <div className="flex items-center gap-3 mt-1.5 text-xs text-zinc-400 font-body">
                    <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{item.view_count || 0} views</span>
                    <span className="flex items-center gap-1"><Star className="w-3 h-3 text-emerald-400" />+{positiveRating}</span>
                    {negativeRating > 0 && <span className="flex items-center gap-1 text-red-400">-{negativeRating}</span>}
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-3xl sm:text-4xl font-heading font-bold text-white">{currencySymbol}{item.price?.toFixed?.(2) || item.price}</p>
                  <p className="text-xs text-zinc-500 mt-0.5">{(item.price_currency || 'usd').toUpperCase()}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <a
                data-testid="buy-now-btn"
                href={lztUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-3.5 bg-valorant text-white font-heading font-bold text-sm uppercase tracking-widest rounded-lg transition-all hover:bg-valorant-hover animate-neon-pulse text-center"
              >
                Buy Now - {currencySymbol}{item.price?.toFixed?.(2) || item.price}
              </a>
              <a
                data-testid="view-original-btn"
                href={lztUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 px-6 py-3.5 bg-zinc-800/80 border border-white/10 text-zinc-300 font-body text-sm rounded-lg hover:bg-zinc-800 hover:text-white transition-all"
              >
                <ExternalLink className="w-4 h-4" /> View on LZT Market
              </a>
            </div>

            {/* Security banner */}
            {isRiot && (
              <div
                data-testid="security-banner"
                className={`flex items-center gap-3 p-4 rounded-xl border-l-4 ${
                  item.riot_account_verified || !isRecentlyActive
                    ? 'bg-emerald-500/5 border-emerald-500 text-emerald-400'
                    : 'bg-amber-500/5 border-amber-500 text-amber-400'
                }`}
              >
                {isRecentlyActive ? (
                  <ShieldAlert className="w-5 h-5 shrink-0" />
                ) : (
                  <ShieldCheck className="w-5 h-5 shrink-0" />
                )}
                <div>
                  <p className="text-sm font-semibold">
                    {isRecentlyActive ? 'Recently Active' : 'Account Safe'}
                  </p>
                  <p className="text-xs opacity-70 mt-0.5">
                    {isRecentlyActive
                      ? `Last active ${daysAgo === 0 ? 'today' : `${daysAgo} day${daysAgo !== 1 ? 's' : ''} ago`}. Recent activity detected.`
                      : daysAgo !== null ? `Inactive for ${daysAgo} days. No recent activity.` : 'Account status nominal.'}
                  </p>
                </div>
              </div>
            )}

            {/* Stat Grid */}
            {isRiot && (
              <div data-testid="stat-grid" className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <StatBox icon={Crosshair} label="Rank" value={rankName} color={rankColor} />
                <StatBox icon={TrendingUp} label="Level" value={level} color="#00e5ff" />
                <StatBox icon={Gem} label="VP" value={vp.toLocaleString()} color="#a78bfa" />
                <StatBox icon={Sparkles} label="Radianite" value={rp} color="#fbbf24" />
              </div>
            )}

            {/* Extra stats */}
            {isRiot && (
              <div className="grid grid-cols-3 gap-3">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-zinc-900/60 border border-white/5">
                  <Gamepad2 className="w-4 h-4 text-zinc-500" />
                  <div>
                    <p className="text-xs text-zinc-500">Agents</p>
                    <p className="text-sm font-semibold text-white">{agentCount}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-zinc-900/60 border border-white/5">
                  <Swords className="w-4 h-4 text-zinc-500" />
                  <div>
                    <p className="text-xs text-zinc-500">Knives</p>
                    <p className="text-sm font-semibold text-white">{knifeCount}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-zinc-900/60 border border-white/5">
                  <Sparkles className="w-4 h-4 text-zinc-500" />
                  <div>
                    <p className="text-xs text-zinc-500">Skins</p>
                    <p className="text-sm font-semibold text-white">{skinCount}</p>
                  </div>
                </div>
              </div>
            )}

            <Separator className="bg-white/5" />

            {/* Description / Notes */}
            {item.description && (
              <div data-testid="seller-notes">
                <h3 className="text-sm font-heading font-bold text-white uppercase tracking-wider mb-3">Description</h3>
                <blockquote className="relative p-4 rounded-xl bg-zinc-900/60 border border-white/5">
                  <Tag className="absolute top-3 left-3 w-5 h-5 text-zinc-700" />
                  <p className="pl-7 text-sm text-zinc-400 font-body leading-relaxed">{item.description}</p>
                </blockquote>
              </div>
            )}

            {/* Account info */}
            <div className="grid grid-cols-2 gap-3 text-xs text-zinc-500">
              {publishedDate && (
                <div className="flex items-center gap-2">
                  <Clock className="w-3 h-3" />
                  Published: {publishedDate.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                </div>
              )}
              {lastActivity && (
                <div className="flex items-center gap-2">
                  <Clock className="w-3 h-3" />
                  Last active: {lastActivity.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                </div>
              )}
              {item.email_type && (
                <div className="flex items-center gap-2">
                  <Globe className="w-3 h-3" />
                  Email: {item.email_type}
                </div>
              )}
              {item.riot_username && (
                <div className="flex items-center gap-2">
                  <Users className="w-3 h-3" />
                  Riot ID: {item.riot_username}
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
