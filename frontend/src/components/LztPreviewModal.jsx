import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, ExternalLink, ShieldCheck, ShieldAlert, Crosshair, Sparkles, Star, Clock, TrendingUp, Swords, Gem, Eye, Heart, Gamepad2, Globe, Users, Tag, Loader2 } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { getValorantRankName, getRankColorFromInt, getOriginLabel, getOriginColor, isLocalFavorite, toggleLocalFavorite, fetchMarketItem, fetchValorantSkins, getCurrencySymbol, addServerFavorite, removeServerFavorite } from '@/data/api';

const TIER_COLORS = { Deluxe:'from-emerald-800 to-emerald-950 border-emerald-500/30', Premium:'from-purple-800 to-purple-950 border-purple-500/30', Select:'from-zinc-700 to-zinc-800 border-zinc-500/30', Ultra:'from-amber-800 to-amber-950 border-amber-500/30', Exclusive:'from-red-800 to-red-950 border-valorant/30', Standard:'from-zinc-800 to-zinc-900 border-zinc-600/30' };

function StatBox({ icon: Icon, label, value, color }) {
  return (
    <div className="flex flex-col items-center justify-center p-4 rounded-xl bg-zinc-900/80 border border-white/5">
      <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-2" style={{ backgroundColor: `${color}15` }}><Icon className="w-5 h-5" style={{ color }} /></div>
      <span className="text-lg font-heading font-bold text-white">{value}</span>
      <span className="text-[10px] font-body text-zinc-500 uppercase tracking-wider mt-0.5">{label}</span>
    </div>
  );
}

function SkinGalleryCard({ skin }) {
  const tc = TIER_COLORS[skin.tier] || TIER_COLORS.Standard;
  return (
    <div className={`break-inside-avoid mb-3 rounded-lg bg-gradient-to-br ${tc} border overflow-hidden hover:scale-[1.02] transition-transform`}>
      {skin.displayIcon && <img src={skin.displayIcon} alt={skin.displayName} className="w-full h-20 object-contain p-2 bg-black/20" loading="lazy" />}
      <div className="p-2.5">
        <p className="text-xs font-heading font-bold text-white truncate">{skin.displayName}</p>
        <div className="flex items-center justify-between mt-1">
          <span className="text-[9px] text-zinc-400">{skin.weapon || ''}</span>
          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-black/30 text-zinc-300 uppercase">{skin.tier}</span>
        </div>
      </div>
    </div>
  );
}

export default function LztPreviewModal({ product, category, onClose }) {
  const [fav, setFav] = useState(isLocalFavorite(product.item_id));
  const [detailedItem, setDetailedItem] = useState(null);
  const [matchedSkins, setMatchedSkins] = useState([]);
  const [skinsLoading, setSkinsLoading] = useState(true);

  useEffect(() => {
    fetchMarketItem(product.item_id).then(d => { if (d?.item) setDetailedItem(d.item); }).catch(() => {});
  }, [product.item_id]);

  // Fetch valorant skins and match with item title
  useEffect(() => {
    if (category !== 'valorant') { setSkinsLoading(false); return; }
    (async () => {
      try {
        const { skins } = await fetchValorantSkins();
        const item = detailedItem || product;
        const title = (item.title || '').toLowerCase();
        // Try to match skin names from the title
        const matched = skins.filter(s => {
          const name = s.displayName.toLowerCase();
          // Check if any part of the skin name appears in the title
          const parts = name.split(' ');
          return parts.length > 1 && parts.some(p => p.length > 3 && title.includes(p));
        }).slice(0, 20);
        // If no matches from title, show random premium skins proportional to skin count
        if (matched.length === 0) {
          const skinCount = item.riot_valorant_skin_count || 0;
          const showCount = Math.min(skinCount, 16);
          const premium = skins.filter(s => s.tier !== 'Standard' && s.tier !== 'Select');
          const shuffled = [...premium].sort(() => Math.random() - 0.5);
          setMatchedSkins(shuffled.slice(0, showCount));
        } else {
          setMatchedSkins(matched);
        }
      } catch { }
      finally { setSkinsLoading(false); }
    })();
  }, [product, detailedItem, category]);

  const item = detailedItem || product;
  const isVal = category === 'valorant';
  const rankInt = item.riot_valorant_rank || 0;
  const rankName = item.valorantRankTitle || getValorantRankName(rankInt);
  const rankColor = getRankColorFromInt(rankInt);
  const region = item.riot_valorant_region || '';
  const origin = item.item_origin || '';
  const skinCount = item.riot_valorant_skin_count || 0;
  const level = item.riot_valorant_level || 0;
  const vp = item.riot_valorant_wallet_vp || 0;
  const rp = item.riot_valorant_wallet_rp || 0;
  const agentCount = item.riot_valorant_agent_count || 0;
  const knifeCount = item.riot_valorant_knife_count || 0;
  const cs = getCurrencySymbol(item.price_currency);
  const publishedDate = item.published_date ? new Date(item.published_date * 1000) : null;
  const lastActivity = item.riot_last_activity ? new Date(item.riot_last_activity * 1000) : null;
  const daysAgo = lastActivity ? Math.floor((Date.now() - lastActivity.getTime()) / (1000*60*60*24)) : null;
  const isRecentlyActive = daysAgo !== null && daysAgo < 7;
  const feedbackData = typeof item.feedback_data === 'string' ? JSON.parse(item.feedback_data||'{}') : (item.feedback_data||{});
  const catFb = feedbackData[String(item.category_id)] || feedbackData['13'] || {};
  const lztUrl = `https://lzt.market/${product.item_id}/`;

  const handleFav = () => {
    const newFavs = toggleLocalFavorite(product.item_id);
    const nowFav = newFavs.includes(product.item_id);
    setFav(nowFav);
    nowFav ? addServerFavorite(product.item_id) : removeServerFavorite(product.item_id);
  };

  return (
    <motion.div data-testid="preview-modal" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6">
      <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <motion.div initial={{scale:0.95,opacity:0}} animate={{scale:1,opacity:1}} exit={{scale:0.95,opacity:0}} transition={{type:'spring',damping:25,stiffness:300}}
        className="relative w-full max-w-5xl max-h-[90vh] overflow-y-auto glass rounded-2xl">
        <div>
          {/* Header */}
          <div className="relative h-44 sm:h-52 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 via-zinc-950 to-black" />
            <div className="absolute inset-0 overflow-hidden"><div className="absolute -top-12 -right-12 w-48 h-48 rounded-full opacity-20 blur-2xl" style={{backgroundColor:rankColor}} /></div>
            <button data-testid="close-modal-btn" onClick={onClose} className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-black/50 border border-white/10 flex items-center justify-center text-zinc-400 hover:text-white"><X className="w-4 h-4" /></button>
            <button data-testid="modal-fav-btn" onClick={handleFav} className="absolute top-4 right-16 z-10 w-9 h-9 rounded-full bg-black/50 border border-white/10 flex items-center justify-center hover:border-white/20"><Heart className={`w-4 h-4 ${fav?'fill-valorant text-valorant':'text-zinc-400'}`} /></button>
            <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-zinc-900/95 to-transparent">
              <div className="flex items-end justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    {origin && <Badge className={`text-[10px] border ${getOriginColor(origin)}`}>{getOriginLabel(origin)}</Badge>}
                    {region && <Badge className="text-[10px] bg-zinc-800/80 text-zinc-300 border-zinc-700/50">{region}</Badge>}
                    <Badge className="text-[10px] bg-zinc-800/80 text-zinc-300 border-zinc-700/50">ID: {product.item_id}</Badge>
                    {item.nsb===1 && <Badge className="text-[10px] bg-electric/10 text-electric border-electric/30">NSB</Badge>}
                  </div>
                  <h2 className="text-xl sm:text-2xl font-heading font-bold text-white truncate">{region} | {rankName} | {skinCount} Skins</h2>
                  <p className="text-xs text-zinc-500 mt-0.5 truncate">{item.title}</p>
                  <div className="flex items-center gap-3 mt-1.5 text-xs text-zinc-400">
                    <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{item.view_count||0}</span>
                    <span className="flex items-center gap-1"><Star className="w-3 h-3 text-emerald-400" />+{catFb.positive||0}</span>
                    {(catFb.negative||0) > 0 && <span className="text-red-400">-{catFb.negative}</span>}
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-3xl sm:text-4xl font-heading font-bold text-white">{cs}{item.price?.toFixed?.(2)}</p>
                  {item.original_price && item.original_price !== item.price && <p className="text-xs text-zinc-500 line-through">{cs}{item.original_price?.toFixed?.(2)}</p>}
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <a data-testid="buy-now-btn" href={lztUrl} target="_blank" rel="noopener noreferrer" className="flex-1 py-3.5 bg-valorant text-white font-heading font-bold text-sm uppercase tracking-widest rounded-lg text-center hover:bg-valorant-hover animate-neon-pulse transition-all">Buy Now - {cs}{item.price?.toFixed?.(2)}</a>
              <a data-testid="view-original-btn" href={lztUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 px-6 py-3.5 bg-zinc-800/80 border border-white/10 text-zinc-300 text-sm rounded-lg hover:bg-zinc-800 hover:text-white transition-all"><ExternalLink className="w-4 h-4" />View on LZT</a>
            </div>

            {/* Security */}
            {isVal && (
              <div data-testid="security-banner" className={`flex items-center gap-3 p-4 rounded-xl border-l-4 ${isRecentlyActive ? 'bg-amber-500/5 border-amber-500 text-amber-400' : 'bg-emerald-500/5 border-emerald-500 text-emerald-400'}`}>
                {isRecentlyActive ? <ShieldAlert className="w-5 h-5 shrink-0" /> : <ShieldCheck className="w-5 h-5 shrink-0" />}
                <div><p className="text-sm font-semibold">{isRecentlyActive ? 'Recently Active' : 'Account Safe'}</p><p className="text-xs opacity-70 mt-0.5">{isRecentlyActive ? `Active ${daysAgo===0?'today':`${daysAgo}d ago`}` : daysAgo!==null ? `Inactive ${daysAgo}d` : 'Status nominal'}</p></div>
              </div>
            )}

            {/* Stats */}
            {isVal && (
              <>
                <div data-testid="stat-grid" className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <StatBox icon={Crosshair} label="Rank" value={rankName} color={rankColor} />
                  <StatBox icon={TrendingUp} label="Level" value={level} color="#00e5ff" />
                  <StatBox icon={Gem} label="VP" value={vp.toLocaleString()} color="#a78bfa" />
                  <StatBox icon={Sparkles} label="Radianite" value={rp} color="#fbbf24" />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-zinc-900/60 border border-white/5"><Gamepad2 className="w-4 h-4 text-zinc-500" /><div><p className="text-xs text-zinc-500">Agents</p><p className="text-sm font-semibold text-white">{agentCount}</p></div></div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-zinc-900/60 border border-white/5"><Swords className="w-4 h-4 text-zinc-500" /><div><p className="text-xs text-zinc-500">Knives</p><p className="text-sm font-semibold text-white">{knifeCount}</p></div></div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-zinc-900/60 border border-white/5"><Sparkles className="w-4 h-4 text-zinc-500" /><div><p className="text-xs text-zinc-500">Skins</p><p className="text-sm font-semibold text-white">{skinCount}</p></div></div>
                </div>
              </>
            )}

            <Separator className="bg-white/5" />

            {/* Skin Gallery */}
            {isVal && skinCount > 0 && (
              <div data-testid="skin-gallery">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-heading font-bold text-white uppercase tracking-wider">Skin Gallery</h3>
                  <span className="text-xs text-zinc-500">{matchedSkins.length} previewed / {skinCount} total</span>
                </div>
                {skinsLoading ? (
                  <div className="flex items-center justify-center py-8"><Loader2 className="w-6 h-6 text-zinc-500 animate-spin" /></div>
                ) : matchedSkins.length > 0 ? (
                  <div className="columns-2 sm:columns-3 lg:columns-4 gap-3">
                    {matchedSkins.map((s, i) => <SkinGalleryCard key={`${s.uuid}-${i}`} skin={s} />)}
                  </div>
                ) : (
                  <p className="text-xs text-zinc-600 text-center py-4">No skin previews available for this account.</p>
                )}
              </div>
            )}

            {item.description && (
              <div data-testid="seller-notes">
                <h3 className="text-sm font-heading font-bold text-white uppercase tracking-wider mb-3">Description</h3>
                <blockquote className="relative p-4 rounded-xl bg-zinc-900/60 border border-white/5">
                  <Tag className="absolute top-3 left-3 w-5 h-5 text-zinc-700" />
                  <p className="pl-7 text-sm text-zinc-400 leading-relaxed">{item.description}</p>
                </blockquote>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 text-xs text-zinc-500">
              {publishedDate && <div className="flex items-center gap-2"><Clock className="w-3 h-3" />Published: {publishedDate.toLocaleDateString('en-US',{year:'numeric',month:'short',day:'numeric'})}</div>}
              {lastActivity && <div className="flex items-center gap-2"><Clock className="w-3 h-3" />Last active: {lastActivity.toLocaleDateString('en-US',{year:'numeric',month:'short',day:'numeric'})}</div>}
              {item.riot_username && <div className="flex items-center gap-2"><Users className="w-3 h-3" />Riot ID: {item.riot_username}</div>}
              {item.email_type && <div className="flex items-center gap-2"><Globe className="w-3 h-3" />Email: {item.email_type}</div>}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
