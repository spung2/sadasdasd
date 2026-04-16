import { motion } from 'framer-motion';
import {
  X,
  ExternalLink,
  Shield,
  ShieldCheck,
  ShieldAlert,
  Crosshair,
  Sparkles,
  Star,
  Clock,
  Users,
  TrendingUp,
  Swords,
  Gem,
  Quote,
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { getRankColor, getOriginLabel, getOriginColor } from '@/data/mockData';

const SKIN_TIER_COLORS = {
  Select: 'from-zinc-700 to-zinc-800 border-zinc-600/30',
  Deluxe: 'from-emerald-900 to-emerald-950 border-emerald-600/30',
  Premium: 'from-purple-900 to-purple-950 border-purple-500/30',
  Ultra: 'from-amber-900 to-amber-950 border-amber-500/30',
  Exclusive: 'from-red-900 to-red-950 border-valorant/30',
};

function StatBox({ icon: Icon, label, value, color }) {
  return (
    <div className="flex flex-col items-center justify-center p-4 rounded-xl bg-zinc-900/80 border border-white/5 hover:border-white/10 transition-colors">
      <div
        className="w-10 h-10 rounded-lg flex items-center justify-center mb-2"
        style={{ backgroundColor: `${color}15` }}
      >
        <Icon className="w-5 h-5" style={{ color }} />
      </div>
      <span className="text-lg font-heading font-bold text-white">{value}</span>
      <span className="text-[10px] font-body text-zinc-500 uppercase tracking-wider mt-0.5">
        {label}
      </span>
    </div>
  );
}

function SkinCard({ skin }) {
  const tierColor = SKIN_TIER_COLORS[skin.tier] || SKIN_TIER_COLORS.Select;
  return (
    <div
      data-testid={`skin-card-${skin.weapon}-${skin.skin_name}`}
      className={`break-inside-avoid mb-3 rounded-lg bg-gradient-to-br ${tierColor} border p-3 hover:scale-[1.02] transition-transform`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-xs font-heading font-bold text-white truncate">{skin.skin_name}</p>
          <p className="text-[10px] text-zinc-400 mt-0.5">{skin.weapon}</p>
        </div>
        <span className="shrink-0 text-[9px] font-bold px-1.5 py-0.5 rounded bg-black/30 text-zinc-300 uppercase tracking-wider">
          {skin.tier}
        </span>
      </div>
      {/* Simulated skin preview bar */}
      <div className="mt-2 h-8 rounded bg-black/20 flex items-center justify-center">
        <Swords className="w-4 h-4 text-zinc-600" />
      </div>
    </div>
  );
}

export default function LztPreviewModal({ product, onClose }) {
  const { account_details: details } = product;
  const rankColor = getRankColor(details.rank);
  const daysAgo = Math.floor(
    (Date.now() - new Date(details.last_active).getTime()) / (1000 * 60 * 60 * 24)
  );
  const isRecentlyActive = daysAgo < 7;
  const isSafe = !details.ban_status;

  return (
    <motion.div
      data-testid="preview-modal"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6"
    >
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="relative w-full max-w-5xl max-h-[90vh] overflow-y-auto glass rounded-2xl"
      >
        <div>
          {/* Header area */}
          <div className="relative h-48 sm:h-56 overflow-hidden">
            <div
              className="absolute inset-0 bg-gradient-to-br from-zinc-900 via-zinc-950 to-black"
            />
            {/* Decorative circles */}
            <div className="absolute inset-0 overflow-hidden">
              <div
                className="absolute -top-12 -right-12 w-48 h-48 rounded-full opacity-20 blur-2xl"
                style={{ backgroundColor: rankColor }}
              />
              <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full bg-valorant/10 blur-3xl" />
            </div>

            {/* Close button */}
            <button
              data-testid="close-modal-btn"
              onClick={onClose}
              className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-black/50 backdrop-blur-sm border border-white/10 flex items-center justify-center text-zinc-400 hover:text-white hover:border-white/20 transition-all"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Header content */}
            <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-zinc-900/95 to-transparent">
              <div className="flex items-end justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className={`text-[10px] border ${getOriginColor(product.origin)}`}>
                      {getOriginLabel(product.origin)}
                    </Badge>
                    <Badge className="text-[10px] bg-zinc-800/80 text-zinc-300 border-zinc-700/50">
                      {product.region}
                    </Badge>
                    <Badge className="text-[10px] bg-zinc-800/80 text-zinc-300 border-zinc-700/50">
                      ID: {product.item_id}
                    </Badge>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-heading font-bold text-white truncate">
                    {product.title}
                  </h2>
                  <div className="flex items-center gap-3 mt-1.5 text-xs text-zinc-400 font-body">
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {product.seller.username}
                    </span>
                    <span className="flex items-center gap-1">
                      <Star className="w-3 h-3 text-amber-400" />
                      {product.seller.rating}
                    </span>
                    <span>{product.seller.sales_count} sales</span>
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-3xl sm:text-4xl font-heading font-bold text-white">
                    ${product.price.toFixed(2)}
                  </p>
                  <p className="text-xs text-zinc-500 mt-0.5">{product.currency}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                data-testid="buy-now-btn"
                className="flex-1 py-3.5 bg-valorant text-white font-heading font-bold text-sm uppercase tracking-widest rounded-lg transition-all hover:bg-valorant-hover animate-neon-pulse"
              >
                Buy Now - ${product.price.toFixed(2)}
              </button>
              <button
                data-testid="view-original-btn"
                className="flex items-center justify-center gap-2 px-6 py-3.5 bg-zinc-800/80 border border-white/10 text-zinc-300 font-body text-sm rounded-lg hover:bg-zinc-800 hover:text-white transition-all"
              >
                <ExternalLink className="w-4 h-4" />
                View on LZT
              </button>
            </div>

            {/* Security banner */}
            <div
              data-testid="security-banner"
              className={`flex items-center gap-3 p-4 rounded-xl border-l-4 ${
                isSafe
                  ? 'bg-emerald-500/5 border-emerald-500 text-emerald-400'
                  : 'bg-red-500/5 border-red-500 text-red-400'
              }`}
            >
              {isSafe ? (
                <ShieldCheck className="w-5 h-5 shrink-0" />
              ) : (
                <ShieldAlert className="w-5 h-5 shrink-0" />
              )}
              <div>
                <p className="text-sm font-semibold">
                  {isSafe ? 'Safe to Play' : 'Account Flagged'}
                </p>
                <p className="text-xs opacity-70 mt-0.5">
                  {isSafe
                    ? 'No bans or restrictions detected. Account is clean.'
                    : 'This account has been flagged. Proceed with caution.'}
                  {isRecentlyActive && (
                    <span className="ml-2 text-amber-400">
                      Active {daysAgo === 0 ? 'today' : `${daysAgo}d ago`}
                    </span>
                  )}
                </p>
              </div>
            </div>

            {/* Stat Grid */}
            <div data-testid="stat-grid" className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <StatBox
                icon={Crosshair}
                label="Rank"
                value={details.rank}
                color={rankColor}
              />
              <StatBox
                icon={TrendingUp}
                label="Level"
                value={details.level}
                color="#00e5ff"
              />
              <StatBox
                icon={Gem}
                label="VP"
                value={details.vp_count.toLocaleString()}
                color="#a78bfa"
              />
              <StatBox
                icon={Sparkles}
                label="Radianite"
                value={details.rp_count}
                color="#fbbf24"
              />
            </div>

            {/* Extra stats row */}
            <div className="grid grid-cols-3 gap-3">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-zinc-900/60 border border-white/5">
                <Shield className="w-4 h-4 text-zinc-500" />
                <div>
                  <p className="text-xs text-zinc-500">Agents</p>
                  <p className="text-sm font-semibold text-white">{details.agents_unlocked}/24</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-zinc-900/60 border border-white/5">
                <Swords className="w-4 h-4 text-zinc-500" />
                <div>
                  <p className="text-xs text-zinc-500">Matches</p>
                  <p className="text-sm font-semibold text-white">{details.total_matches.toLocaleString()}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-zinc-900/60 border border-white/5">
                <TrendingUp className="w-4 h-4 text-zinc-500" />
                <div>
                  <p className="text-xs text-zinc-500">Win Rate</p>
                  <p className="text-sm font-semibold text-white">{details.win_rate}%</p>
                </div>
              </div>
            </div>

            <Separator className="bg-white/5" />

            {/* Skin Showcase */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-heading font-bold text-white uppercase tracking-wider">
                  Skin Collection
                </h3>
                <span className="text-xs text-zinc-500">
                  {details.skins.length} items
                </span>
              </div>
              <div
                data-testid="skin-showcase"
                className="columns-2 sm:columns-3 lg:columns-4 gap-3"
              >
                {details.skins.map((skin, i) => (
                  <SkinCard key={`${skin.weapon}-${skin.skin_name}-${i}`} skin={skin} />
                ))}
              </div>
            </div>

            <Separator className="bg-white/5" />

            {/* Seller Notes */}
            <div data-testid="seller-notes">
              <h3 className="text-sm font-heading font-bold text-white uppercase tracking-wider mb-3">
                Seller Notes
              </h3>
              <blockquote className="relative p-4 rounded-xl bg-zinc-900/60 border border-white/5">
                <Quote className="absolute top-3 left-3 w-5 h-5 text-zinc-700" />
                <p className="pl-7 text-sm text-zinc-400 font-body leading-relaxed italic">
                  {product.seller_notes}
                </p>
                <div className="mt-3 pl-7 flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-zinc-800 flex items-center justify-center">
                    <Users className="w-3 h-3 text-zinc-500" />
                  </div>
                  <span className="text-xs text-zinc-500">{product.seller.username}</span>
                </div>
              </blockquote>
            </div>

            {/* Last active info */}
            <div className="flex items-center gap-2 text-xs text-zinc-600">
              <Clock className="w-3 h-3" />
              Last active: {new Date(details.last_active).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
