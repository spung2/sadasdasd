import { RotateCcw } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';

export default function FilterSidebar({ filters, onFilterChange, onReset, resultCount, category }) {
  const isVal = category === 'valorant';
  return (
    <div data-testid="filter-sidebar" className="glass rounded-xl p-6 space-y-7">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-heading font-bold text-white uppercase tracking-wider">Filters</h3>
          <p className="text-xs text-zinc-500 mt-0.5">{resultCount.toLocaleString()} accounts</p>
        </div>
        <button data-testid="reset-filters-btn" onClick={onReset} className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-valorant transition-colors"><RotateCcw className="w-3 h-3" />Reset</button>
      </div>
      <Separator className="bg-white/5" />

      {/* Price */}
      <div className="space-y-3">
        <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Price Range (USD)</label>
        <Slider data-testid="price-range-slider" value={[filters.pmin||0, filters.pmax||500]} onValueChange={([min,max]) => { onFilterChange('pmin',min); onFilterChange('pmax',max); }} min={0} max={2000} step={10}
          className="[&_[role=slider]]:bg-valorant [&_[role=slider]]:border-valorant/50 [&_[role=slider]]:shadow-[0_0_8px_rgba(255,70,85,0.4)] [&_.relative_.absolute]:bg-valorant" />
        <div className="flex justify-between text-xs text-zinc-500"><span>${filters.pmin||0}</span><span>${filters.pmax||500}</span></div>
      </div>

      <Separator className="bg-white/5" />

      {/* Sort */}
      <div className="space-y-3">
        <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Sort By</label>
        <Select value={filters.order_by||'pdate_to_down'} onValueChange={v => onFilterChange('order_by',v)}>
          <SelectTrigger data-testid="sort-select" className="bg-zinc-900/80 border-white/10 text-white text-sm"><SelectValue /></SelectTrigger>
          <SelectContent className="bg-zinc-900 border-white/10 text-white">
            <SelectItem value="pdate_to_down">Newest</SelectItem>
            <SelectItem value="pdate_to_up">Oldest</SelectItem>
            <SelectItem value="price_to_up">Price: Low to High</SelectItem>
            <SelectItem value="price_to_down">Price: High to Low</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Origin */}
      <div className="space-y-3">
        <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Origin</label>
        <Select value={filters.origin||'all'} onValueChange={v => onFilterChange('origin', v==='all'?undefined:v)}>
          <SelectTrigger data-testid="origin-select" className="bg-zinc-900/80 border-white/10 text-white text-sm"><SelectValue placeholder="All Origins" /></SelectTrigger>
          <SelectContent className="bg-zinc-900 border-white/10 text-white">
            <SelectItem value="all">All Origins</SelectItem>
            <SelectItem value="personal">Personal</SelectItem>
            <SelectItem value="brute">Brute</SelectItem>
            <SelectItem value="resale">Resale</SelectItem>
            <SelectItem value="autoreg">Auto-Reg</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Valorant-specific filters */}
      {isVal && (
        <>
          <Separator className="bg-white/5" />
          {/* Region */}
          <div className="space-y-3">
            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Region</label>
            <Select value={filters['valorant_region']||'default'} onValueChange={v => onFilterChange('valorant_region', v==='default'?undefined:v)}>
              <SelectTrigger data-testid="region-select" className="bg-zinc-900/80 border-white/10 text-white text-sm"><SelectValue placeholder="Default (Admin)" /></SelectTrigger>
              <SelectContent className="bg-zinc-900 border-white/10 text-white">
                <SelectItem value="default">Default (Admin Setting)</SelectItem>
                <SelectItem value="eu">Europe</SelectItem>
                <SelectItem value="na">North America</SelectItem>
                <SelectItem value="ap">Asia Pacific</SelectItem>
                <SelectItem value="kr">Korea</SelectItem>
                <SelectItem value="br">Brazil</SelectItem>
                <SelectItem value="latam">LATAM</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Rank range */}
          <div className="space-y-3">
            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Rank Range</label>
            <Slider data-testid="rank-range-slider" value={[filters.rmin||0, filters.rmax||27]} onValueChange={([min,max]) => { onFilterChange('rmin',min||undefined); onFilterChange('rmax',max>=27?undefined:max); }} min={0} max={27} step={1}
              className="[&_[role=slider]]:bg-electric [&_[role=slider]]:border-electric/50 [&_[role=slider]]:shadow-[0_0_8px_rgba(0,229,255,0.4)] [&_.relative_.absolute]:bg-electric" />
            <div className="flex justify-between text-xs text-zinc-500">
              <span>{['Unranked','','','Iron 1','Iron 2','Iron 3','Bronze 1','Bronze 2','Bronze 3','Silver 1','Silver 2','Silver 3','Gold 1','Gold 2','Gold 3','Plat 1','Plat 2','Plat 3','Diamond 1','Diamond 2','Diamond 3','Asc 1','Asc 2','Asc 3','Imm 1','Imm 2','Imm 3','Radiant'][filters.rmin||0]}</span>
              <span>{['Unranked','','','Iron 1','Iron 2','Iron 3','Bronze 1','Bronze 2','Bronze 3','Silver 1','Silver 2','Silver 3','Gold 1','Gold 2','Gold 3','Plat 1','Plat 2','Plat 3','Diamond 1','Diamond 2','Diamond 3','Asc 1','Asc 2','Asc 3','Imm 1','Imm 2','Imm 3','Radiant'][filters.rmax||27]}</span>
            </div>
          </div>

          {/* Min skins */}
          <div className="space-y-3">
            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Min Skins</label>
            <Slider data-testid="min-skins-slider" value={[filters.valorant_smin||0]} onValueChange={([v]) => onFilterChange('valorant_smin', v||undefined)} min={0} max={200} step={5}
              className="[&_[role=slider]]:bg-amber-400 [&_[role=slider]]:border-amber-400/50 [&_.relative_.absolute]:bg-amber-400" />
            <div className="flex justify-between text-xs text-zinc-500"><span>{filters.valorant_smin||0} skins</span><span>200</span></div>
          </div>

          {/* Knife toggle */}
          <div className="flex items-center justify-between">
            <div><p className="text-sm text-white font-medium">Has Knife</p><p className="text-xs text-zinc-500 mt-0.5">Only accounts with knives</p></div>
            <Switch data-testid="knife-toggle" checked={!!filters.knife} onCheckedChange={v => onFilterChange('knife', v||undefined)} className="data-[state=checked]:bg-valorant" />
          </div>
        </>
      )}

      <Separator className="bg-white/5" />
      <div className="space-y-3">
        <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Currency</label>
        <Select value={filters.currency||'usd'} onValueChange={v => onFilterChange('currency',v)}>
          <SelectTrigger data-testid="currency-select" className="bg-zinc-900/80 border-white/10 text-white text-sm"><SelectValue /></SelectTrigger>
          <SelectContent className="bg-zinc-900 border-white/10 text-white">
            <SelectItem value="usd">USD ($)</SelectItem>
            <SelectItem value="eur">EUR</SelectItem>
            <SelectItem value="rub">RUB</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
