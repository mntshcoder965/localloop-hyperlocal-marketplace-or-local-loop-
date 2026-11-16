import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Filter,
  Grid,
  Map as MapIcon,
  Search,
  SlidersHorizontal,
  X,
  RotateCcw,
  MapPin,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import api from '../services/api';
import { Listing, Category } from '../types';
import { ProductCard } from '../components/product/ProductCard';
import { HyperlocalMap } from '../components/map/HyperlocalMap';
import { useLocationStore } from '../stores/locationStore';

export const DiscoveryPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { location } = useLocationStore();

  const [listings, setListings] = useState<Listing[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  // View Mode: 'grid' or 'map'
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Filters State synced from URL params
  const qParam = searchParams.get('q') || '';
  const categoryParam = searchParams.get('category') || '';
  const conditionParam = searchParams.get('condition') || '';
  const minPriceParam = searchParams.get('minPrice') || '';
  const maxPriceParam = searchParams.get('maxPrice') || '';
  const radiusParam = searchParams.get('radiusKm') || location.radiusKm.toString();
  const sortParam = searchParams.get('sort') || 'newest';
  const pageParam = parseInt(searchParams.get('page') || '1', 10);

  const [searchInput, setSearchInput] = useState(qParam);

  useEffect(() => {
    // Fetch categories once
    api.get('/categories').then((res) => setCategories(res.data.data)).catch(() => {});
  }, []);

  useEffect(() => {
    const fetchListings = async () => {
      setIsLoading(true);
      try {
        const params: any = {
          page: pageParam,
          limit: 12,
          sort: sortParam,
          lat: location.latitude,
          lon: location.longitude,
        };

        if (qParam) params.q = qParam;
        if (categoryParam) params.category = categoryParam;
        if (conditionParam) params.condition = conditionParam;
        if (minPriceParam) params.minPrice = minPriceParam;
        if (maxPriceParam) params.maxPrice = maxPriceParam;
        if (radiusParam) params.radiusKm = radiusParam;

        const res = await api.get('/listings', { params });
        setListings(res.data.data);
        setTotal(res.data.meta.total);
        setTotalPages(res.data.meta.totalPages || 1);
      } catch (err) {
        console.error('Failed to search listings:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchListings();
  }, [
    qParam,
    categoryParam,
    conditionParam,
    minPriceParam,
    maxPriceParam,
    radiusParam,
    sortParam,
    pageParam,
    location.latitude,
    location.longitude,
  ]);

  const updateParam = (key: string, value: string | null) => {
    const newParams = new URLSearchParams(searchParams);
    if (value === null || value === '') {
      newParams.delete(key);
    } else {
      newParams.set(key, value);
    }
    newParams.set('page', '1'); // reset to page 1 on filter change
    setSearchParams(newParams);
  };

  const handleConditionToggle = (cond: string) => {
    const current = conditionParam ? conditionParam.split(',') : [];
    const next = current.includes(cond) ? current.filter((c) => c !== cond) : [...current, cond];
    updateParam('condition', next.length > 0 ? next.join(',') : null);
  };

  const clearAllFilters = () => {
    setSearchParams({});
    setSearchInput('');
  };

  const activeConditions = conditionParam ? conditionParam.split(',') : [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span>Discover Products</span>
            {location.locality && (
              <span className="text-sm font-semibold text-slate-500 font-normal">
                near {location.locality}
              </span>
            )}
          </h1>
          <p className="text-xs text-slate-500">
            {total} items found within {radiusParam} km radius
          </p>
        </div>

        {/* View Switcher & Sort */}
        <div className="flex items-center gap-3 self-end sm:self-auto">
          {/* Mobile Filter Trigger */}
          <button
            onClick={() => setIsMobileFilterOpen(true)}
            className="md:hidden flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 shadow-xs"
          >
            <SlidersHorizontal size={14} />
            <span>Filters</span>
          </button>

          {/* Sort Selector */}
          <select
            value={sortParam}
            onChange={(e) => updateParam('sort', e.target.value)}
            className="px-3 py-2 text-xs font-semibold bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 shadow-xs text-slate-800"
          >
            <option value="newest">Sort: Newly Listed</option>
            <option value="nearest">Sort: Nearest to Me</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
          </select>

          {/* Grid vs Map Toggle */}
          <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                viewMode === 'grid'
                  ? 'bg-white text-brand-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Grid View"
            >
              <Grid size={16} />
              <span className="hidden sm:inline">Grid</span>
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                viewMode === 'map'
                  ? 'bg-white text-brand-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Hyperlocal Map View"
            >
              <MapIcon size={16} />
              <span className="hidden sm:inline">Map</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Sidebar Filters + Products */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Desktop Filter Sidebar */}
        <aside className="hidden md:block space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <SlidersHorizontal size={16} className="text-brand-900" />
              <span>Filters</span>
            </h3>
            <button
              onClick={clearAllFilters}
              className="text-xs text-slate-400 hover:text-rose-600 flex items-center gap-1 transition-colors"
            >
              <RotateCcw size={12} /> Reset
            </button>
          </div>

          {/* Search Query */}
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1.5">Keywords</label>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                updateParam('q', searchInput);
              }}
              className="relative"
            >
              <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Title or keywords..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full pl-8 pr-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium"
              />
            </form>
          </div>

          {/* Categories Filter */}
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1.5">Category</label>
            <select
              value={categoryParam}
              onChange={(e) => updateParam('category', e.target.value || null)}
              className="w-full p-2.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium text-slate-800"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.slug}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Distance Radius */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-semibold text-slate-700">Distance Radius</label>
              <span className="text-xs font-bold text-teal-700">{radiusParam} km</span>
            </div>
            <div className="grid grid-cols-4 gap-1">
              {['5', '10', '20', '50'].map((km) => (
                <button
                  key={km}
                  onClick={() => updateParam('radiusKm', km)}
                  className={`py-1.5 text-xs font-bold rounded-lg border transition-all ${
                    radiusParam === km
                      ? 'bg-brand-900 text-white border-brand-900'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {km}km
                </button>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1.5">Price Range (₹)</label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                placeholder="Min"
                value={minPriceParam}
                onChange={(e) => updateParam('minPrice', e.target.value || null)}
                className="w-full p-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
              <input
                type="number"
                placeholder="Max"
                value={maxPriceParam}
                onChange={(e) => updateParam('maxPrice', e.target.value || null)}
                className="w-full p-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          {/* Condition Checkboxes */}
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-2">Item Condition</label>
            <div className="space-y-2">
              {[
                { label: 'Like New', val: 'LIKE_NEW' },
                { label: 'Good', val: 'GOOD' },
                { label: 'Fair', val: 'FAIR' },
                { label: 'Needs Repair', val: 'NEEDS_REPAIR' },
              ].map((c) => (
                <label key={c.val} className="flex items-center gap-2 cursor-pointer text-xs text-slate-700">
                  <input
                    type="checkbox"
                    checked={activeConditions.includes(c.val)}
                    onChange={() => handleConditionToggle(c.val)}
                    className="w-4 h-4 rounded text-brand-900 focus:ring-brand-500 border-slate-300"
                  />
                  <span>{c.label}</span>
                </label>
              ))}
            </div>
          </div>
        </aside>

        {/* Content Area */}
        <div className="md:col-span-3 space-y-6">
          {viewMode === 'map' ? (
            /* Interactive Hyperlocal Leaflet Map */
            <div className="h-[600px] w-full">
              <HyperlocalMap
                center={[location.latitude, location.longitude]}
                radiusKm={parseInt(radiusParam, 10) || 15}
                listings={listings}
              />
            </div>
          ) : isLoading ? (
            /* Loading skeletons */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-white rounded-2xl border border-slate-200 p-4 h-72 animate-pulse space-y-3">
                  <div className="h-40 bg-slate-100 rounded-xl" />
                  <div className="h-4 bg-slate-100 rounded w-1/2" />
                  <div className="h-3 bg-slate-100 rounded w-3/4" />
                </div>
              ))}
            </div>
          ) : listings.length > 0 ? (
            /* Product Cards Grid */
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {listings.map((item) => (
                  <ProductCard key={item.id} listing={item} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 pt-6 border-t border-slate-200">
                  <button
                    disabled={pageParam <= 1}
                    onClick={() => updateParam('page', (pageParam - 1).toString())}
                    className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <span className="text-xs font-semibold text-slate-700 px-3">
                    Page {pageParam} of {totalPages}
                  </span>
                  <button
                    disabled={pageParam >= totalPages}
                    onClick={() => updateParam('page', (pageParam + 1).toString())}
                    className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              )}
            </>
          ) : (
            /* Empty State */
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-4">
              <Search size={40} className="text-slate-300 mx-auto" />
              <h3 className="text-base font-bold text-slate-800">No matching products found</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                No items match your active search filters within {radiusParam} km. Try broadening your distance radius or clearing category filters.
              </p>
              <button
                onClick={clearAllFilters}
                className="px-4 py-2 bg-brand-900 text-white rounded-xl text-xs font-bold shadow-sm"
              >
                Reset All Filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

