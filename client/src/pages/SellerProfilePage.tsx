import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ShieldCheck, MapPin, Calendar, Package, CheckCircle2 } from 'lucide-react';
import api from '../services/api';
import { RatingStars } from '../components/common/RatingStars';
import { ProductCard } from '../components/product/ProductCard';
import { Listing } from '../types';

export const SellerProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const [seller, setSeller] = useState<any>(null);
  const [activeListings, setActiveListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSeller = async () => {
      setIsLoading(true);
      try {
        const res = await api.get(`/users/sellers/${id}`);
        setSeller(res.data.data);

        // Fetch their active listings
        const listRes = await api.get(`/listings?limit=20`);
        const userItems = listRes.data.data.filter((l: Listing) => l.seller_id === id);
        setActiveListings(userItems);
      } catch (err) {
        console.error('Failed to load seller profile:', err);
      } finally {
        setIsLoading(false);
      }
    };

    if (id) fetchSeller();
  }, [id]);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto py-20 flex justify-center">
        <div className="w-8 h-8 border-4 border-brand-900 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!seller) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 text-center bg-white rounded-2xl border border-slate-200">
        <h3 className="text-base font-bold text-slate-800">Seller Not Found</h3>
        <Link to="/discover" className="mt-4 inline-block px-4 py-2 bg-brand-900 text-white rounded-xl text-xs font-bold">
          Explore Marketplace
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Seller Header */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4 flex-col sm:flex-row text-center sm:text-left">
          {seller.avatar_url ? (
            <img src={seller.avatar_url} alt="" className="w-20 h-20 rounded-2xl object-cover shadow-sm" />
          ) : (
            <div className="w-20 h-20 rounded-2xl bg-brand-900 text-white font-black text-2xl flex items-center justify-center">
              {seller.name.charAt(0)}
            </div>
          )}
          <div className="space-y-1">
            <h1 className="text-2xl font-black text-slate-900 flex items-center justify-center sm:justify-start gap-2">
              {seller.name}
              {seller.is_verified && <span title="Verified Seller"><ShieldCheck size={20} className="text-teal-600" /></span>}
            </h1>
            <RatingStars rating={parseFloat(seller.rating_avg) || 0} count={seller.rating_count || 0} size="md" />
            <p className="text-xs text-slate-600 max-w-lg mt-2 leading-relaxed">
              {seller.bio || 'LocalLoop Verified Seller'}
            </p>
          </div>
        </div>

        <div className="flex gap-4">
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-center min-w-[90px]">
            <span className="block text-xl font-black text-slate-900">{seller.stats?.activeListings || 0}</span>
            <span className="text-[10px] uppercase font-bold text-slate-400">Active Items</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-center min-w-[90px]">
            <span className="block text-xl font-black text-slate-900">{seller.stats?.soldListings || 0}</span>
            <span className="text-[10px] uppercase font-bold text-slate-400">Sold Items</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Active Listings + Reviews */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Active Listings (2 Cols) */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-base font-bold text-slate-900">
            Active Listings from this Seller ({activeListings.length})
          </h3>
          {activeListings.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {activeListings.map((item) => (
                <ProductCard key={item.id} listing={item} />
              ))}
            </div>
          ) : (
            <div className="p-8 bg-white rounded-2xl border border-slate-200 text-center text-xs text-slate-400">
              No active listings available right now.
            </div>
          )}
        </div>

        {/* Reviews (1 Col) */}
        <div className="space-y-4">
          <h3 className="text-base font-bold text-slate-900">Recent Buyer Reviews</h3>
          <div className="space-y-3">
            {seller.recentReviews && seller.recentReviews.length > 0 ? (
              seller.recentReviews.map((r: any) => (
                <div key={r.id} className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">{r.reviewer_name}</span>
                    <RatingStars rating={r.rating} showCount={false} />
                  </div>
                  {r.comment && <p className="text-xs text-slate-600 leading-relaxed">"{r.comment}"</p>}
                  <span className="text-[10px] text-slate-400 block">
                    {new Date(r.created_at).toLocaleDateString()}
                  </span>
                </div>
              ))
            ) : (
              <div className="p-6 bg-white rounded-2xl border border-slate-200 text-center text-xs text-slate-400">
                No reviews yet. Be the first to buy and review!
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
