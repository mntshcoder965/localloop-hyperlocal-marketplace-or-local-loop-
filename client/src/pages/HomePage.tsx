import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  MapPin,
  Search,
  ArrowRight,
  ShieldCheck,
  Zap,
  RefreshCw,
  SlidersHorizontal,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import api from '../services/api';
import { Listing, Category } from '../types';
import { ProductCard } from '../components/product/ProductCard';
import { useLocationStore } from '../stores/locationStore';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { location } = useLocationStore();

  const [categories, setCategories] = useState<Category[]>([]);
  const [nearbyListings, setNearbyListings] = useState<Listing[]>([]);
  const [recentListings, setRecentListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [heroSearch, setHeroSearch] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // 1. Categories
        const catRes = await api.get('/categories');
        setCategories(catRes.data.data);

        // 2. Nearby Listings (geocoded)
        const nearbyRes = await api.get(
          `/listings?lat=${location.latitude}&lon=${location.longitude}&radiusKm=${location.radiusKm}&sort=nearest&limit=8`
        );
        setNearbyListings(nearbyRes.data.data);

        // 3. Recent Listings
        const recentRes = await api.get('/listings?sort=newest&limit=8');
        setRecentListings(recentRes.data.data);
      } catch (err) {
        console.error('Failed to load homepage data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [location.latitude, location.longitude, location.radiusKm]);

  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (heroSearch.trim()) {
      navigate(`/discover?q=${encodeURIComponent(heroSearch.trim())}`);
    } else {
      navigate('/discover');
    }
  };

  return (
    <div className="space-y-16 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-brand-950 via-brand-900 to-slate-900 text-white pt-16 pb-24 px-4 sm:px-6 lg:px-8">
        {/* Subtle grid background */}
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(#5eead4 1px, transparent 1px)`,
            backgroundSize: '24px 24px',
          }}
        />

        <div className="max-w-5xl mx-auto text-center relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-300 text-xs font-semibold backdrop-blur-md">
            <Sparkles size={14} className="text-teal-400" />
            <span>Hyperlocal Second-Hand Marketplace for India</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight">
            Buy and sell nearby.{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-300 via-teal-400 to-emerald-400">
              No shipping, just meet.
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-sm sm:text-base text-slate-300 leading-relaxed font-normal">
            Discover pre-owned gadgets, electronics, textbooks, and furniture right in{' '}
            <span className="text-white font-bold underline decoration-teal-400 decoration-2">
              {location.locality}, {location.city}
            </span>
            . Negotiate directly, test in-person, and exchange with verified neighbours.
          </p>

          {/* Search Bar in Hero */}
          <form
            onSubmit={handleHeroSearch}
            className="max-w-2xl mx-auto bg-white rounded-2xl p-2 shadow-2xl flex flex-col sm:flex-row gap-2 border border-white/20"
          >
            <div className="flex items-center flex-1 px-3">
              <Search size={20} className="text-slate-400 shrink-0 mr-2.5" />
              <input
                type="text"
                placeholder="What are you looking for today? (e.g. MacBook, Bicycle, Chair)..."
                value={heroSearch}
                onChange={(e) => setHeroSearch(e.target.value)}
                className="w-full py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none font-medium"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-3 bg-brand-900 hover:bg-brand-800 text-white rounded-xl text-sm font-bold shadow-md transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <span>Search Near Me</span>
              <ArrowRight size={16} />
            </button>
          </form>

          {/* Quick Stats Pills */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-3 text-xs text-slate-300">
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/5 border border-white/10">
              <MapPin size={13} className="text-teal-400" /> Within {location.radiusKm} km radius
            </span>
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/5 border border-white/10">
              <ShieldCheck size={13} className="text-teal-400" /> Dual-confirmation meetup
            </span>
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/5 border border-white/10">
              <Zap size={13} className="text-teal-400" /> Instant price negotiation
            </span>
          </div>
        </div>
      </section>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Categories Section */}
        <section className="space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Explore by Category
              </h2>
              <p className="text-xs sm:text-sm text-slate-500">
                Browse verified second-hand items across top classifications
              </p>
            </div>
            <Link
              to="/discover"
              className="text-xs sm:text-sm font-bold text-teal-700 hover:text-teal-800 flex items-center gap-1"
            >
              All Categories <ChevronRight size={16} />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                to={`/discover?category=${cat.slug}`}
                className="group p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md hover:border-brand-300 transition-all text-center flex flex-col items-center gap-2"
              >
                <div className="w-12 h-12 rounded-xl bg-slate-50 group-hover:bg-brand-50 text-brand-900 group-hover:text-accent-600 transition-colors flex items-center justify-center font-bold text-lg">
                  {cat.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-xs sm:text-sm group-hover:text-brand-900">
                    {cat.name}
                  </h4>
                  <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">{cat.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Nearby Items Grid */}
        <section className="space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-teal-500 animate-pulse"></span>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  Near {location.locality}
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-slate-500">
                Sorted by physical proximity within {location.radiusKm} km of your area
              </p>
            </div>
            <Link
              to={`/discover?lat=${location.latitude}&lon=${location.longitude}&radiusKm=${location.radiusKm}&sort=nearest`}
              className="text-xs sm:text-sm font-bold text-brand-900 hover:underline flex items-center gap-1"
            >
              View on Hyperlocal Map <ChevronRight size={16} />
            </Link>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {[1, 2, 3, 4].map((n) => (
                <div
                  key={n}
                  className="bg-white rounded-2xl border border-slate-200 h-72 animate-pulse p-4 space-y-3"
                >
                  <div className="h-40 bg-slate-100 rounded-xl" />
                  <div className="h-4 bg-slate-100 rounded w-1/2" />
                  <div className="h-3 bg-slate-100 rounded w-3/4" />
                </div>
              ))}
            </div>
          ) : nearbyListings.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {nearbyListings.map((listing) => (
                <ProductCard key={listing.id} listing={listing} />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-10 text-center space-y-3">
              <MapPin size={36} className="text-slate-300 mx-auto" />
              <h4 className="font-bold text-slate-800 text-sm">No listings found in this immediate radius</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Try expanding your search radius to 20 km or 50 km, or be the first neighbour to list an item!
              </p>
              <Link
                to="/sell"
                className="inline-flex px-4 py-2 bg-brand-900 text-white rounded-xl text-xs font-bold shadow-sm"
              >
                + List First Item in {location.locality}
              </Link>
            </div>
          )}
        </section>

        {/* Value Proposition Callout Banner */}
        <section className="bg-gradient-to-r from-brand-900 to-brand-800 rounded-3xl p-8 sm:p-12 text-white shadow-xl relative overflow-hidden">
          <div className="relative z-10 max-w-2xl space-y-4">
            <span className="px-3 py-1 rounded-md bg-teal-500/20 text-teal-300 text-xs font-bold tracking-wide uppercase">
              Zero Shipping • Zero Wastage
            </span>
            <h3 className="text-2xl sm:text-3xl font-black tracking-tight">
              Turn unused belongings into instant cash within your neighbourhood.
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              List laptops, mobiles, furniture, or books in under 2 minutes. Receive verified price offers from buyers living 5 km away. Meet safely at a local coffee shop or doorstep.
            </p>
            <div className="pt-2 flex flex-wrap gap-3">
              <Link
                to="/sell"
                className="px-6 py-3 bg-teal-500 hover:bg-teal-400 text-brand-950 rounded-xl text-sm font-extrabold shadow-lg transition-transform active:scale-95"
              >
                Post a Free Listing Now
              </Link>
              <Link
                to="/discover"
                className="px-5 py-3 bg-white/10 hover:bg-white/15 text-white rounded-xl text-sm font-semibold transition-colors"
              >
                Explore More Deals
              </Link>
            </div>
          </div>
        </section>

        {/* Recently Added Section */}
        <section className="space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Recently Added to LocalLoop
              </h2>
              <p className="text-xs sm:text-sm text-slate-500">Fresh listings added across all nearby regions</p>
            </div>
            <Link to="/discover?sort=newest" className="text-xs sm:text-sm font-bold text-teal-700 flex items-center gap-1">
              Browse Latest <ChevronRight size={16} />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {recentListings.map((listing) => (
              <ProductCard key={listing.id} listing={listing} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

