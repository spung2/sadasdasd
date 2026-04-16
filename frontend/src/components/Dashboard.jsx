import { useState, useEffect, useMemo, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, SlidersHorizontal, X, ChevronLeft, ChevronRight } from 'lucide-react';
import Navbar from '@/components/Navbar';
import FilterSidebar from '@/components/FilterSidebar';
import ProductGrid from '@/components/ProductGrid';
import LztPreviewModal from '@/components/LztPreviewModal';
import { fetchMarketSearch, fetchMe } from '@/data/api';

const CATEGORIES = [
  { id: 'riot', name: 'Valorant / LoL' },
  { id: 'steam', name: 'Steam' },
  { id: 'fortnite', name: 'Fortnite' },
  { id: 'mihoyo', name: 'Genshin / HSR' },
  { id: 'all', name: 'All' },
];

export default function Dashboard() {
  const location = useLocation();
  const [user, setUser] = useState(location.state?.user || null);
  const [products, setProducts] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [category, setCategory] = useState('riot');
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    pmin: 0,
    pmax: 500,
    order_by: 'pdate_to_down',
    currency: 'usd',
  });

  // Check auth on mount
  useEffect(() => {
    if (window.location.hash?.includes('session_id=')) return;
    if (user) return;
    fetchMe().then(setUser).catch(() => {});
  }, [user]);

  // Fetch products
  const loadProducts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = { ...filters, page };
      if (searchQuery.trim()) params.title = searchQuery.trim();

      const data = await fetchMarketSearch(category, params);
      setProducts(data.items || []);
      setTotalItems(data.totalItems || 0);
    } catch (err) {
      setError(err.message);
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  }, [category, filters, page, searchQuery]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const handleFilterChange = useCallback((key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(1);
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({ pmin: 0, pmax: 500, order_by: 'pdate_to_down', currency: 'usd' });
    setSearchQuery('');
    setPage(1);
  }, []);

  const handleSearch = useCallback((e) => {
    e.preventDefault();
    setPage(1);
    loadProducts();
  }, [loadProducts]);

  const totalPages = Math.ceil(totalItems / 40);

  return (
    <div className="min-h-screen bg-[#09090b] noise-bg" data-testid="dashboard">
      <Navbar user={user} setUser={setUser} />

      {/* Category tabs + Search */}
      <div className="sticky top-16 z-30 bg-[#09090b]/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-[1600px] mx-auto px-4 md:px-8">
          {/* Category tabs */}
          <div className="flex items-center gap-1 pt-3 pb-2 overflow-x-auto scrollbar-hide">
            {CATEGORIES.map(cat => (
              <button
                key={cat.id}
                data-testid={`category-tab-${cat.id}`}
                onClick={() => { setCategory(cat.id); setPage(1); }}
                className={`whitespace-nowrap px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  category === cat.id
                    ? 'bg-valorant/10 text-valorant border border-valorant/30'
                    : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.03]'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Search bar */}
          <form onSubmit={handleSearch} className="flex items-center gap-3 pb-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                data-testid="search-input"
                type="text"
                placeholder="Search accounts by title..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-zinc-900/60 border border-white/10 rounded-lg text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-valorant/50 focus:border-valorant/50 transition-all"
              />
              {searchQuery && (
                <button type="button" data-testid="clear-search-btn" onClick={() => { setSearchQuery(''); setPage(1); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <button
              data-testid="mobile-filter-toggle"
              type="button"
              onClick={() => setMobileFiltersOpen(true)}
              className="lg:hidden flex items-center gap-2 px-4 py-2.5 bg-zinc-900/60 border border-white/10 rounded-lg text-sm text-zinc-400 hover:text-white transition-colors"
            >
              <SlidersHorizontal className="w-4 h-4" />
            </button>
            <div className="hidden md:flex items-center gap-2 text-xs text-zinc-500">
              <span className="px-2 py-1 bg-zinc-800/50 rounded">{totalItems.toLocaleString()}</span>
              <span>results</span>
            </div>
          </form>
        </div>
      </div>

      {/* Main grid */}
      <div className="max-w-[1600px] mx-auto px-4 md:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
          <div className="hidden lg:block lg:col-span-3">
            <div className="sticky top-44">
              <FilterSidebar
                filters={filters}
                onFilterChange={handleFilterChange}
                onReset={resetFilters}
                resultCount={totalItems}
                category={category}
              />
            </div>
          </div>

          <div className="lg:col-span-9">
            {error && (
              <div data-testid="error-banner" className="mb-4 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                {error}
                <button onClick={loadProducts} className="ml-3 underline hover:text-red-300">Retry</button>
              </div>
            )}

            <ProductGrid
              products={products}
              isLoading={isLoading}
              onProductClick={setSelectedProduct}
              category={category}
            />

            {/* Pagination */}
            {totalPages > 1 && !isLoading && (
              <div data-testid="pagination" className="flex items-center justify-center gap-3 mt-8">
                <button
                  data-testid="prev-page-btn"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="flex items-center gap-1 px-4 py-2 bg-zinc-900 border border-white/10 rounded-lg text-sm text-zinc-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronLeft className="w-4 h-4" /> Prev
                </button>
                <span className="text-sm text-zinc-500">
                  Page <span className="text-white font-semibold">{page}</span> of {totalPages.toLocaleString()}
                </span>
                <button
                  data-testid="next-page-btn"
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="flex items-center gap-1 px-4 py-2 bg-zinc-900 border border-white/10 rounded-lg text-sm text-zinc-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  Next <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile filter overlay */}
      <AnimatePresence>
        {mobileFiltersOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 lg:hidden">
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setMobileFiltersOpen(false)} />
            <motion.div initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }} className="absolute left-0 top-0 bottom-0 w-[85%] max-w-sm bg-[#09090b] border-r border-white/10 overflow-y-auto">
              <div className="flex items-center justify-between p-4 border-b border-white/5">
                <h2 className="text-lg font-heading font-bold text-white">Filters</h2>
                <button data-testid="close-mobile-filters" onClick={() => setMobileFiltersOpen(false)} className="p-1 text-zinc-400 hover:text-white"><X className="w-5 h-5" /></button>
              </div>
              <div className="p-4">
                <FilterSidebar filters={filters} onFilterChange={handleFilterChange} onReset={resetFilters} resultCount={totalItems} category={category} />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Product detail modal */}
      <AnimatePresence>
        {selectedProduct && (
          <LztPreviewModal product={selectedProduct} category={category} onClose={() => setSelectedProduct(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}
