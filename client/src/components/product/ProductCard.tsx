import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, MapPin, ShieldCheck, Zap } from 'lucide-react';
import { Listing } from '../../types';
import api from '../../services/api';
import { useAuthStore } from '../../stores/authStore';

interface ProductCardProps {
  listing: Listing;
  onWishlistChange?: (listingId: string, isSaved: boolean) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ listing, onWishlistChange }) => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const [isSaved, setIsSaved] = useState(listing.is_wishlisted || false);
  const [isToggling, setIsToggling] = useState(false);

  const primaryImage =
    listing.images?.find((img) => img.is_primary)?.image_url ||
    listing.images?.[0]?.image_url ||
    'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?auto=format&fit=crop&w=400&q=80';

  const discountPercent =
    listing.original_price && listing.original_price > listing.price
      ? Math.round(((listing.original_price - listing.price) / listing.original_price) * 100)
      : null;

  const handleWishlistToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    setIsToggling(true);
    try {
      const res = await api.post(`/wishlist/${listing.id}/toggle`);
      const newStatus = res.data.data.wishlisted;
      setIsSaved(newStatus);
      if (onWishlistChange) {
        onWishlistChange(listing.id, newStatus);
      }
    } catch {
      // Ignore
    } finally {
      setIsToggling(false);
    }
  };

  return (
    <Link
      to={`/product/${listing.id}`}
      className="group block bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-xl hover:border-brand-200 transition-all duration-300 overflow-hidden flex flex-col h-full"
    >
      {/* Image Container */}
      <div className="relative aspect-4/3 w-full bg-slate-100 overflow-hidden">
        <img
          src={primaryImage}
          alt={listing.title}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Condition Tag */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 items-start">
          <span className="px-2 py-0.5 rounded-md text-[11px] font-bold tracking-wide uppercase bg-slate-900/80 text-white backdrop-blur-md">
            {listing.condition.replace('_', ' ')}
          </span>
          {discountPercent && discountPercent >= 10 && (
            <span className="px-1.5 py-0.5 rounded-md text-[10px] font-extrabold bg-rose-500 text-white">
              {discountPercent}% OFF
            </span>
          )}
        </div>

        {/* Wishlist Heart */}
        <button
          onClick={handleWishlistToggle}
          disabled={isToggling}
          className="absolute top-2.5 right-2.5 p-2 rounded-xl bg-white/90 hover:bg-white text-slate-700 shadow-md backdrop-blur-sm transition-transform active:scale-90"
          title={isSaved ? 'Remove from wishlist' : 'Save to wishlist'}
        >
          <Heart
            size={16}
            className={`transition-colors ${
              isSaved ? 'fill-rose-500 text-rose-500' : 'text-slate-600 hover:text-rose-500'
            }`}
          />
        </button>

        {/* Distance Badge */}
        {listing.distance_km !== undefined && (
          <div className="absolute bottom-2.5 left-2.5 flex items-center gap-1 px-2.5 py-1 rounded-lg bg-brand-900/90 text-teal-300 text-[11px] font-bold backdrop-blur-md shadow-sm">
            <Zap size={12} className="text-teal-400 shrink-0" />
            <span>{listing.distance_km} km away</span>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="p-4 flex flex-col flex-1 justify-between">
        <div>
          {/* Price Header */}
          <div className="flex items-baseline gap-2 mb-1.5">
            <span className="text-lg font-extrabold text-slate-900 tracking-tight">
              ₹{listing.price.toLocaleString('en-IN')}
            </span>
            {listing.original_price && listing.original_price > listing.price && (
              <span className="text-xs text-slate-400 line-through">
                ₹{listing.original_price.toLocaleString('en-IN')}
              </span>
            )}
          </div>

          {/* Product Title */}
          <h3 className="text-sm font-semibold text-slate-800 line-clamp-2 leading-snug group-hover:text-brand-900 transition-colors">
            {listing.title}
          </h3>
        </div>

        {/* Footer Meta */}
        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1 truncate max-w-[150px]">
            <MapPin size={13} className="text-slate-400 shrink-0" />
            <span className="truncate">{listing.locality}</span>
          </div>

          {listing.seller_name && (
            <div className="flex items-center gap-1.5 shrink-0 text-slate-600">
              {listing.seller_avatar ? (
                <img
                  src={listing.seller_avatar}
                  alt={listing.seller_name}
                  className="w-4 h-4 rounded-full object-cover"
                />
              ) : (
                <span className="w-4 h-4 rounded-full bg-slate-200 text-[9px] font-bold flex items-center justify-center">
                  {listing.seller_name.charAt(0)}
                </span>
              )}
              <span className="truncate max-w-[80px] font-medium">{listing.seller_name}</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
};

