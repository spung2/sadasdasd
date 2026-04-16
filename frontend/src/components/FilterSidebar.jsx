import { RotateCcw } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RANKS, REGIONS } from '@/data/mockData';
import { Separator } from '@/components/ui/separator';

export default function FilterSidebar({ filters, onFilterChange, onReset, resultCount }) {
  return (
    <div
      data-testid="filter-sidebar"
      className="glass rounded-xl p-6 space-y-7"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-heading font-bold text-white uppercase tracking-wider">
            Filters
          </h3>
          <p className="text-xs text-zinc-500 mt-0.5">{resultCount} accounts found</p>
        </div>
        <button
          data-testid="reset-filters-btn"
          onClick={onReset}
          className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-valorant transition-colors"
        >
          <RotateCcw className="w-3 h-3" />
          Reset
        </button>
      </div>

      <Separator className="bg-white/5" />

      {/* Price Range */}
      <div className="space-y-3">
        <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
          Price Range
        </label>
        <Slider
          data-testid="price-range-slider"
          value={filters.priceRange}
          onValueChange={(val) => onFilterChange('priceRange', val)}
          min={0}
          max={200}
          step={5}
          className="[&_[role=slider]]:bg-valorant [&_[role=slider]]:border-valorant/50 [&_[role=slider]]:shadow-[0_0_8px_rgba(255,70,85,0.4)] [&_.relative_.absolute]:bg-valorant"
        />
        <div className="flex justify-between text-xs text-zinc-500">
          <span>${filters.priceRange[0]}</span>
          <span>${filters.priceRange[1]}</span>
        </div>
      </div>

      {/* Minimum Level */}
      <div className="space-y-3">
        <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
          Minimum Level
        </label>
        <Slider
          data-testid="min-level-slider"
          value={[filters.minLevel]}
          onValueChange={(val) => onFilterChange('minLevel', val[0])}
          min={0}
          max={500}
          step={10}
          className="[&_[role=slider]]:bg-electric [&_[role=slider]]:border-electric/50 [&_[role=slider]]:shadow-[0_0_8px_rgba(0,229,255,0.4)] [&_.relative_.absolute]:bg-electric"
        />
        <div className="flex justify-between text-xs text-zinc-500">
          <span>Level {filters.minLevel}</span>
          <span>500</span>
        </div>
      </div>

      <Separator className="bg-white/5" />

      {/* Rank Filter */}
      <div className="space-y-3">
        <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
          Rank
        </label>
        <Select
          value={filters.rank}
          onValueChange={(val) => onFilterChange('rank', val)}
        >
          <SelectTrigger
            data-testid="rank-select"
            className="bg-zinc-900/80 border-white/10 text-white text-sm hover:border-white/20 transition-colors"
          >
            <SelectValue placeholder="All Ranks" />
          </SelectTrigger>
          <SelectContent className="bg-zinc-900 border-white/10 text-white">
            <SelectItem value="all">All Ranks</SelectItem>
            {RANKS.map((rank) => (
              <SelectItem key={rank} value={rank}>
                {rank}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Region Filter */}
      <div className="space-y-3">
        <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
          Region
        </label>
        <Select
          value={filters.region}
          onValueChange={(val) => onFilterChange('region', val)}
        >
          <SelectTrigger
            data-testid="region-select"
            className="bg-zinc-900/80 border-white/10 text-white text-sm hover:border-white/20 transition-colors"
          >
            <SelectValue placeholder="All Regions" />
          </SelectTrigger>
          <SelectContent className="bg-zinc-900 border-white/10 text-white">
            <SelectItem value="all">All Regions</SelectItem>
            {REGIONS.map((region) => (
              <SelectItem key={region} value={region}>
                {region}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Origin Filter */}
      <div className="space-y-3">
        <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
          Origin
        </label>
        <Select
          value={filters.origin}
          onValueChange={(val) => onFilterChange('origin', val)}
        >
          <SelectTrigger
            data-testid="origin-select"
            className="bg-zinc-900/80 border-white/10 text-white text-sm hover:border-white/20 transition-colors"
          >
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

      <Separator className="bg-white/5" />

      {/* Sort By */}
      <div className="space-y-3">
        <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
          Sort By
        </label>
        <Select
          value={filters.sortBy}
          onValueChange={(val) => onFilterChange('sortBy', val)}
        >
          <SelectTrigger
            data-testid="sort-select"
            className="bg-zinc-900/80 border-white/10 text-white text-sm hover:border-white/20 transition-colors"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-zinc-900 border-white/10 text-white">
            <SelectItem value="newest">Newest First</SelectItem>
            <SelectItem value="price-asc">Price: Low to High</SelectItem>
            <SelectItem value="price-desc">Price: High to Low</SelectItem>
            <SelectItem value="level-desc">Highest Level</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Has Skins Toggle */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-white font-medium">Premium Skins</p>
          <p className="text-xs text-zinc-500 mt-0.5">5+ skins only</p>
        </div>
        <Switch
          data-testid="has-skins-toggle"
          checked={filters.hasSkins}
          onCheckedChange={(val) => onFilterChange('hasSkins', val)}
          className="data-[state=checked]:bg-valorant"
        />
      </div>
    </div>
  );
}
