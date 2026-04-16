import { RotateCcw } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';

export default function FilterSidebar({ filters, onFilterChange, onReset, resultCount, category }) {
  return (
    <div data-testid="filter-sidebar" className="glass rounded-xl p-6 space-y-7">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-heading font-bold text-white uppercase tracking-wider">Filters</h3>
          <p className="text-xs text-zinc-500 mt-0.5">{resultCount.toLocaleString()} accounts</p>
        </div>
        <button data-testid="reset-filters-btn" onClick={onReset} className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-valorant transition-colors">
          <RotateCcw className="w-3 h-3" /> Reset
        </button>
      </div>

      <Separator className="bg-white/5" />

      {/* Price Range */}
      <div className="space-y-3">
        <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Price Range (USD)</label>
        <Slider
          data-testid="price-range-slider"
          value={[filters.pmin || 0, filters.pmax || 500]}
          onValueChange={([min, max]) => { onFilterChange('pmin', min); onFilterChange('pmax', max); }}
          min={0} max={2000} step={10}
          className="[&_[role=slider]]:bg-valorant [&_[role=slider]]:border-valorant/50 [&_[role=slider]]:shadow-[0_0_8px_rgba(255,70,85,0.4)] [&_.relative_.absolute]:bg-valorant"
        />
        <div className="flex justify-between text-xs text-zinc-500">
          <span>${filters.pmin || 0}</span>
          <span>${filters.pmax || 500}</span>
        </div>
      </div>

      <Separator className="bg-white/5" />

      {/* Sort By */}
      <div className="space-y-3">
        <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Sort By</label>
        <Select value={filters.order_by || 'pdate_to_down'} onValueChange={(val) => onFilterChange('order_by', val)}>
          <SelectTrigger data-testid="sort-select" className="bg-zinc-900/80 border-white/10 text-white text-sm hover:border-white/20 transition-colors">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-zinc-900 border-white/10 text-white">
            <SelectItem value="pdate_to_down">Newest First</SelectItem>
            <SelectItem value="pdate_to_up">Oldest First</SelectItem>
            <SelectItem value="price_to_up">Price: Low to High</SelectItem>
            <SelectItem value="price_to_down">Price: High to Low</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Origin filter */}
      <div className="space-y-3">
        <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Origin</label>
        <Select value={filters.origin || 'all'} onValueChange={(val) => onFilterChange('origin', val === 'all' ? undefined : val)}>
          <SelectTrigger data-testid="origin-select" className="bg-zinc-900/80 border-white/10 text-white text-sm hover:border-white/20 transition-colors">
            <SelectValue placeholder="All Origins" />
          </SelectTrigger>
          <SelectContent className="bg-zinc-900 border-white/10 text-white">
            <SelectItem value="all">All Origins</SelectItem>
            <SelectItem value="personal">Personal</SelectItem>
            <SelectItem value="brute">Brute</SelectItem>
            <SelectItem value="resale">Resale</SelectItem>
            <SelectItem value="autoreg">Auto-Reg</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Category-specific filters */}
      {category === 'riot' && (
        <>
          <Separator className="bg-white/5" />
          <div className="space-y-3">
            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Region (Valorant)</label>
            <Select value={filters.valorant_region || 'all'} onValueChange={(val) => onFilterChange('valorant_region', val === 'all' ? undefined : val)}>
              <SelectTrigger data-testid="region-select" className="bg-zinc-900/80 border-white/10 text-white text-sm hover:border-white/20 transition-colors">
                <SelectValue placeholder="All Regions" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-white/10 text-white">
                <SelectItem value="all">All Regions</SelectItem>
                <SelectItem value="eu">Europe</SelectItem>
                <SelectItem value="na">North America</SelectItem>
                <SelectItem value="ap">Asia Pacific</SelectItem>
                <SelectItem value="kr">Korea</SelectItem>
                <SelectItem value="br">Brazil</SelectItem>
                <SelectItem value="latam">LATAM</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </>
      )}

      {/* Currency */}
      <Separator className="bg-white/5" />
      <div className="space-y-3">
        <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Currency</label>
        <Select value={filters.currency || 'usd'} onValueChange={(val) => onFilterChange('currency', val)}>
          <SelectTrigger data-testid="currency-select" className="bg-zinc-900/80 border-white/10 text-white text-sm hover:border-white/20 transition-colors">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-zinc-900 border-white/10 text-white">
            <SelectItem value="usd">USD ($)</SelectItem>
            <SelectItem value="eur">EUR</SelectItem>
            <SelectItem value="rub">RUB</SelectItem>
            <SelectItem value="gbp">GBP</SelectItem>
            <SelectItem value="cny">CNY</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
