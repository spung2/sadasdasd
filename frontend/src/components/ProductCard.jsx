import { motion } from 'framer-motion';
import { Shield, Crosshair, Sparkles, Globe } from 'lucide-react';
import { getRankColor, getOriginLabel, getOriginColor } from '@/data/mockData';

const CARD_GRADIENTS = [
  'from-red-950/40 via-zinc-950 to-zinc-950',
  'from-blue-950/40 via-zinc-950 to-zinc-950',
  'from-purple-950/40 via-zinc-950 to-zinc-950',
  'from-cyan-950/40 via-zinc-950 to-zinc-950',
  'from-emerald-950/40 via-zinc-950 to-zinc-950',
  'from-amber-950/40 via-zinc-950 to-zinc-950',
];

export default function ProductCard({ product, onClick, index }) {
  const rankColor = getRankColor(product.account_details.rank);
  const gradient = CARD_GRADIENTS[index % CARD_GRADIENTS.length];
  const skinCount = product.account_details.skins.length;

  return (
    <motion.div
      data-testid={`product-card-${product.item_id}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      whileHover={{ y: -4 }}
      onClick={() => onClick(product)}
      className="group cursor-pointer bg-zinc-900 border border-white/5 rounded-xl overflow-hidden relative transition-all duration-300 hover:border-valorant/40 hover:shadow-[0_8px_30px_rgba(255,70,85,0.12)]"
    >
      {/* Card header - gradient background */}
      <div className={`h-32 relative overflow-hidden bg-gradient-to-br ${gradient}`}>
        {/* Decorative pattern */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-4 right-4 w-20 h-20 border border-white/10 rounded-full" />
          <div className="absolute top-8 right-8 w-12 h-12 border border-white/5 rounded-full" />
          <div className="absolute bottom-2 left-4 w-16 h-[1px] bg-gradient-to-r from-white/20 to-transparent" />
        </div>

        {/* Rank indicator */}
        <div className="absolute bottom-3 left-4 flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center border"
            style={{
              backgroundColor: `${rankColor}15`,
              borderColor: `${rankColor}40`,
            }}
          >
            <Crosshair className="w-4 h-4" style={{ color: rankColor }} />
          </div>
          <div>
            <p className="text-xs font-bold text-white font-heading leading-none">
              {product.account_details.rank}
            </p>
            <p className="text-[10px] text-zinc-400 mt-0.5">Competitive</p>
          </div>
        </div>

        {/* Gradient overlay at bottom */}
        <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-zinc-900 to-transparent" />

        {/* Badges */}
        <div className="absolute top-3 right-3 flex gap-1.5">
          <span className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-zinc-800/80 backdrop-blur-sm border border-white/10 text-zinc-300">
            <Globe className="w-3 h-3" />
            {product.region}
          </span>
          <span
            className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${getOriginColor(
              product.origin
            )}`}
          >
            {getOriginLabel(product.origin)}
          </span>
        </div>

        {/* Ban status */}
        {product.account_details.ban_status && (
          <div className="absolute top-3 left-3">
            <span className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-red-500/20 text-red-400 border border-red-500/30">
              <Shield className="w-3 h-3" />
              Flagged
            </span>
          </div>
        )}
      </div>

      {/* Card body */}
      <div className="p-4 relative card-pattern">
        {/* Title */}
        <h3 className="text-sm font-heading font-semibold text-white truncate group-hover:text-valorant transition-colors">
          {product.title}
        </h3>

        {/* Price */}
        <div className="flex items-baseline gap-1.5 mt-2">
          <span className="text-2xl font-heading font-bold text-white">
            ${product.price.toFixed(2)}
          </span>
          <span className="text-xs text-zinc-500">{product.currency}</span>
        </div>

        {/* Stats row */}
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/5">
          <div className="flex items-center gap-1.5 text-zinc-400">
            <div className="w-5 h-5 rounded bg-zinc-800 flex items-center justify-center">
              <span className="text-[10px] font-bold text-electric">LV</span>
            </div>
            <span className="text-xs">{product.account_details.level}</span>
          </div>
          <div className="flex items-center gap-1.5 text-zinc-400">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-xs">{skinCount} skins</span>
          </div>
          <div className="flex items-center gap-1.5 text-zinc-400">
            <span className="text-xs">{product.account_details.vp_count} VP</span>
          </div>
        </div>
      </div>

      {/* Hover border glow */}
      <div className="absolute inset-0 rounded-xl pointer-events-none border border-transparent group-hover:border-valorant/20 transition-all duration-300" />
    </motion.div>
  );
}
