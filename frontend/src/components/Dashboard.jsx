import { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import Navbar from '@/components/Navbar';
import FilterSidebar from '@/components/FilterSidebar';
import ProductGrid from '@/components/ProductGrid';
import LztPreviewModal from '@/components/LztPreviewModal';
import { fetchLztProducts } from '@/data/mockData';

export default function Dashboard() {
  const allProducts = useMemo(() => fetchLztProducts(), []);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    priceRange: [0, 200],
    minLevel: 0,
    rank: 'all',
    hasSkins: false,
    region: 'all',
    origin: 'all',
    sortBy: 'newest',
  });

  // Simulate loading
  useState(() => {
    const timer = setTimeout(() => setIsLoading(false), 1500);
    return () => clearTimeout(timer);
  });

  const filteredProducts = useMemo(() => {
    let result = allProducts.filter((p) => {
      if (p.price < filters.priceRange[0] || p.price > filters.priceRange[1]) return false;
      if (p.account_details.level < filters.minLevel) return false;
      if (filters.rank !== 'all' && p.account_details.rank !== filters.rank) return false;
      if (filters.hasSkins && p.account_details.skins.length < 5) return false;
      if (filters.region !== 'all' && p.region !== filters.region) return false;
      if (filters.origin !== 'all' && p.origin !== filters.origin) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return (
          p.title.toLowerCase().includes(q) ||
          p.account_details.rank.toLowerCase().includes(q)
        );
      }
      return true;
    });

    switch (filters.sortBy) {
      case 'price-asc':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'level-desc':
        result.sort((a, b) => b.account_details.level - a.account_details.level);
        break;
      case 'newest':
      default:
        result.sort((a, b) => new Date(b.publish_date) - new Date(a.publish_date));
        break;
    }
    return result;
  }, [allProducts, filters, searchQuery]);

  const handleFilterChange = useCallback((key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({
      priceRange: [0, 200],
      minLevel: 0,
      rank: 'all',
      hasSkins: false,
      region: 'all',
      origin: 'all',
      sortBy: 'newest',
    });
    setSearchQuery('');
  }, []);

  return (
    <div className="min-h-screen bg-[#09090b] noise-bg" data-testid="dashboard">
      <Navbar />

      {/* Search bar - mobile + desktop */}
      <div className="sticky top-16 z-30 px-4 md:px-8 py-3 bg-[#09090b]/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-[1600px] mx-auto flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              data-testid="search-input"
              type="text"
              placeholder="Search accounts by rank, title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-zinc-900/60 border border-white/10 rounded-lg text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-valorant/50 focus:border-valorant/50 transition-all"
            />
            {searchQuery && (
              <button
                data-testid="clear-search-btn"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <button
            data-testid="mobile-filter-toggle"
            onClick={() => setMobileFiltersOpen(true)}
            className="lg:hidden flex items-center gap-2 px-4 py-2.5 bg-zinc-900/60 border border-white/10 rounded-lg text-sm text-zinc-400 hover:text-white transition-colors"
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters
          </button>
          <div className="hidden md:flex items-center gap-2 text-xs text-zinc-500">
            <span className="px-2 py-1 bg-zinc-800/50 rounded">{filteredProducts.length}</span>
            <span>results</span>
          </div>
        </div>
      </div>

      {/* Main grid */}
      <div className="max-w-[1600px] mx-auto px-4 md:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
          {/* Desktop sidebar */}
          <div className="hidden lg:block lg:col-span-3">
            <div className="sticky top-36">
              <FilterSidebar
                filters={filters}
                onFilterChange={handleFilterChange}
                onReset={resetFilters}
                resultCount={filteredProducts.length}
              />
            </div>
          </div>

          {/* Product grid */}
          <div className="lg:col-span-9">
            <ProductGrid
              products={filteredProducts}
              isLoading={isLoading}
              onProductClick={setSelectedProduct}
            />
          </div>
        </div>
      </div>

      {/* Mobile filter overlay */}
      <AnimatePresence>
        {mobileFiltersOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 lg:hidden"
          >
            <div
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
              onClick={() => setMobileFiltersOpen(false)}
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="absolute left-0 top-0 bottom-0 w-[85%] max-w-sm bg-[#09090b] border-r border-white/10 overflow-y-auto"
            >
              <div className="flex items-center justify-between p-4 border-b border-white/5">
                <h2 className="text-lg font-heading font-bold text-white">Filters</h2>
                <button
                  data-testid="close-mobile-filters"
                  onClick={() => setMobileFiltersOpen(false)}
                  className="p-1 text-zinc-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-4">
                <FilterSidebar
                  filters={filters}
                  onFilterChange={handleFilterChange}
                  onReset={resetFilters}
                  resultCount={filteredProducts.length}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Product detail modal */}
      <AnimatePresence>
        {selectedProduct && (
          <LztPreviewModal
            product={selectedProduct}
            onClose={() => setSelectedProduct(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
