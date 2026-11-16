import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  MapPin,
  Heart,
  MessageSquare,
  Tag,
  ShieldCheck,
  ShieldAlert,
  Zap,
  ShoppingBag,
  Eye,
  Calendar,
  Share2,
  ChevronLeft,
  ArrowRight,
} from 'lucide-react';
import api from '../services/api';
import { Listing } from '../types';
import { RatingStars } from '../components/common/RatingStars';
import { MakeOfferModal } from '../components/product/MakeOfferModal';
import { ReportModal } from '../components/product/ReportModal';
import { useAuthStore } from '../stores/authStore';
import { useLocationStore } from '../stores/locationStore';
import { useChatStore } from '../stores/chatStore';

export const ProductDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const { location } = useLocationStore();
  const { startOrGetConversation } = useChatStore();

  const [listing, setListing] = useState<Listing | null>(null);
  const [selectedImageIdx, setSelectedImageIdx] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);

  useEffect(() => {
    const fetchListing = async () => {
      setIsLoading(true);
      try {
        const res = await api.get(`/listings/${id}?lat=${location.latitude}&lon=${location.longitude}`);
        setListing(res.data.data);
        setIsWishlisted(res.data.data.is_wishlisted || false);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Listing not found');
      } finally {
        setIsLoading(false);
      }
    };

    if (id) fetchListing();
  }, [id, location.latitude, location.longitude]);

  const handleWishlistToggle = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    try {
      const res = await api.post(`/wishlist/${id}/toggle`);
      setIsWishlisted(res.data.data.wishlisted);
    } catch {
      // Ignore
    }
  };

  const handleContactSeller = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (listing?.seller_id === user?.id) {
      alert('You are the seller of this listing!');
      return;
    }

    try {
      const convoId = await startOrGetConversation(listing!.id);
      navigate(`/chat?convo=${convoId}`);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Could not initiate chat');
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-brand-900 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-white rounded-2xl border border-slate-200 text-center space-y-4">
        <ShieldAlert size={40} className="text-rose-500 mx-auto" />
        <h2 className="text-lg font-bold text-slate-800">Listing Unavailable</h2>
        <p className="text-xs text-slate-500">{error || 'This item could not be found or has been removed.'}</p>
        <Link to="/discover" className="inline-block px-4 py-2 bg-brand-900 text-white rounded-xl text-xs font-bold">
          Back to Marketplace
        </Link>
      </div>
    );
  }

  const images = listing.images && listing.images.length > 0 ? listing.images : [{ id: '1', image_url: 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?auto=format&fit=crop&w=800&q=80', is_primary: true, display_order: 0 }];
  const currentImage = images[selectedImageIdx]?.image_url || images[0].image_url;

  const isOwner = user?.id === listing.seller_id;
  const isAvailable = listing.status === 'ACTIVE';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
      >
        <ChevronLeft size={16} /> Back to Search Results
      </button>

      {/* Main Grid: Left Gallery + Right Details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Images Gallery (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="relative aspect-4/3 w-full bg-slate-100 rounded-2xl overflow-hidden border border-slate-200/80 shadow-xs">
            <img
              src={currentImage}
              alt={listing.title}
              className="w-full h-full object-cover object-center"
            />

            {/* Condition tag */}
            <div className="absolute top-4 left-4 flex gap-2">
              <span className="px-3 py-1 rounded-lg text-xs font-bold tracking-wide uppercase bg-slate-900/80 text-white backdrop-blur-md">
                {listing.condition.replace('_', ' ')}
              </span>
              {listing.status !== 'ACTIVE' && (
                <span className="px-3 py-1 rounded-lg text-xs font-bold tracking-wide uppercase bg-amber-500 text-white shadow-md">
                  {listing.status}
                </span>
              )}
            </div>

            {/* Wishlist toggle */}
            <button
              onClick={handleWishlistToggle}
              className="absolute top-4 right-4 p-2.5 rounded-xl bg-white/90 hover:bg-white text-slate-700 shadow-md backdrop-blur-sm transition-transform active:scale-90"
              title="Save to Wishlist"
            >
              <Heart
                size={20}
                className={isWishlisted ? 'fill-rose-500 text-rose-500' : 'text-slate-700'}
              />
            </button>
          </div>

          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {images.map((img, idx) => (
                <button
                  key={img.id}
                  onClick={() => setSelectedImageIdx(idx)}
                  className={`relative w-20 h-20 rounded-xl overflow-hidden border-2 shrink-0 transition-all ${
                    selectedImageIdx === idx ? 'border-brand-900 shadow-sm' : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img.image_url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* Description Section */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 space-y-3 shadow-xs">
            <h3 className="font-bold text-slate-900 text-base">Product Description</h3>
            <p className="text-sm text-slate-700 whitespace-pre-line leading-relaxed">
              {listing.description}
            </p>
          </div>
        </div>

        {/* Right: Price & Buying Actions (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Main Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-6">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                <span>{listing.category_name}</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Eye size={13} /> {listing.views_count} views
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-snug">
                {listing.title}
              </h1>
            </div>

            {/* Price Box */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-baseline justify-between">
              <div>
                <span className="text-xs text-slate-500 block font-medium">Selling Price</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-slate-900 tracking-tight">
                    ₹{listing.price.toLocaleString('en-IN')}
                  </span>
                  {listing.original_price && listing.original_price > listing.price && (
                    <span className="text-sm text-slate-400 line-through">
                      ₹{listing.original_price.toLocaleString('en-IN')}
                    </span>
                  )}
                </div>
              </div>

              {listing.original_price && listing.original_price > listing.price && (
                <span className="px-2.5 py-1 rounded-lg text-xs font-extrabold bg-emerald-100 text-emerald-800">
                  {Math.round(((listing.original_price - listing.price) / listing.original_price) * 100)}% SAVINGS
                </span>
              )}
            </div>

            {/* Hyperlocal Proximity Box */}
            <div className="p-4 rounded-2xl bg-teal-50/70 border border-teal-100 space-y-2">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-teal-100 text-teal-800 rounded-xl">
                    <MapPin size={18} />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">
                      {listing.locality}, {listing.city}
                    </h4>
                    <span className="text-xs text-slate-500 font-mono">Pincode: {listing.pincode}</span>
                  </div>
                </div>

                {listing.distance_km !== undefined && (
                  <span className="px-2.5 py-1 bg-teal-600 text-white rounded-lg text-xs font-bold shadow-sm">
                    {listing.distance_km} km away
                  </span>
                )}
              </div>
              <p className="text-[11px] text-teal-900 leading-tight">
                🔒 Precise residential coordinates are masked for seller privacy. You can arrange a safe meetup spot once connected.
              </p>
            </div>

            {/* Action Buttons */}
            {!isOwner && isAvailable && (
              <div className="space-y-3 pt-2">
                <Link
                  to={`/checkout/${listing.id}`}
                  className="w-full py-3.5 bg-brand-900 hover:bg-brand-800 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-brand-900/15 transition-all active:scale-98"
                >
                  <ShoppingBag size={18} />
                  <span>Buy Now (Online / Meetup)</span>
                </Link>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setIsOfferModalOpen(true)}
                    className="py-3 px-4 bg-accent-600 hover:bg-accent-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                  >
                    <Tag size={16} />
                    <span>Make an Offer</span>
                  </button>

                  <button
                    onClick={handleContactSeller}
                    className="py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <MessageSquare size={16} />
                    <span>Chat with Seller</span>
                  </button>
                </div>
              </div>
            )}

            {isOwner && (
              <div className="p-4 bg-brand-50 rounded-2xl border border-brand-100 text-center space-y-2">
                <p className="text-xs font-bold text-brand-900">You are the seller of this listing.</p>
                <Link
                  to="/dashboard?tab=listings"
                  className="inline-block px-4 py-2 bg-brand-900 text-white rounded-xl text-xs font-semibold"
                >
                  Manage Your Listings in Dashboard
                </Link>
              </div>
            )}

            {!isAvailable && !isOwner && (
              <div className="p-4 bg-slate-100 rounded-2xl text-center text-xs font-bold text-slate-600">
                This item is currently {listing.status} and cannot be purchased.
              </div>
            )}
          </div>

          {/* Seller Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Seller Information</h4>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {listing.seller_avatar ? (
                  <img
                    src={listing.seller_avatar}
                    alt={listing.seller_name}
                    className="w-12 h-12 rounded-xl object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-brand-900 text-white font-bold flex items-center justify-center">
                    {listing.seller_name?.charAt(0) || 'S'}
                  </div>
                )}
                <div>
                  <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                    {listing.seller_name}
                    <span title="Verified Seller"><ShieldCheck size={16} className="text-teal-600" /></span>
                  </h4>
                  <RatingStars
                    rating={listing.seller_rating_avg || 0}
                    count={listing.seller_rating_count || 0}
                  />
                </div>
              </div>

              <Link
                to={`/seller/${listing.seller_id}`}
                className="text-xs font-bold text-teal-700 hover:text-teal-800 flex items-center gap-1"
              >
                Profile <ArrowRight size={14} />
              </Link>
            </div>
          </div>

          {/* Safety & Report Card */}
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-200/60 text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <ShieldCheck size={16} className="text-teal-600" />
              <span>Meet in a public place. Test device before exchanging.</span>
            </div>
            <button
              onClick={() => setIsReportModalOpen(true)}
              className="text-slate-400 hover:text-rose-600 font-semibold flex items-center gap-1 transition-colors"
            >
              <ShieldAlert size={14} /> Report
            </button>
          </div>
        </div>
      </div>

      {/* Make Offer Modal */}
      <MakeOfferModal
        isOpen={isOfferModalOpen}
        onClose={() => setIsOfferModalOpen(false)}
        listingId={listing.id}
        listingTitle={listing.title}
        listingPrice={listing.price}
        onOfferSuccess={() => {
          alert('Offer submitted successfully! You can track it in your Dashboard or Chat.');
        }}
      />

      {/* Report Modal */}
      <ReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        targetType="LISTING"
        targetId={listing.id}
        targetTitle={listing.title}
      />
    </div>
  );
};
