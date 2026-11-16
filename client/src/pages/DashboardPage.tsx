import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  User as UserIcon,
  PackageCheck,
  Heart,
  ShoppingBag,
  Tag,
  Settings,
  ShieldCheck,
  CheckCircle,
  XCircle,
  Clock,
  MapPin,
  ChevronRight,
  Trash2,
  Edit3,
} from 'lucide-react';
import api from '../services/api';
import { useAuthStore } from '../stores/authStore';
import { Listing, Offer, Order } from '../types';
import { ProductCard } from '../components/product/ProductCard';

export const DashboardPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, updateUser } = useAuthStore();

  const activeTab = searchParams.get('tab') || 'profile';

  // Sub-tab data
  const [myListings, setMyListings] = useState<Listing[]>([]);
  const [wishlist, setWishlist] = useState<Listing[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [sales, setSales] = useState<Order[]>([]);
  const [offersSent, setOffersSent] = useState<Offer[]>([]);
  const [offersReceived, setOffersReceived] = useState<Offer[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Profile Form state
  const [profileName, setProfileName] = useState(user?.name || '');
  const [profilePhone, setProfilePhone] = useState(user?.phone || '');
  const [profileBio, setProfileBio] = useState(user?.bio || '');
  const [profileSaved, setProfileSaved] = useState(false);

  // Review modal state
  const [reviewOrderId, setReviewOrderId] = useState<string | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState(false);

  useEffect(() => {
    const loadTabData = async () => {
      setIsLoading(true);
      try {
        if (activeTab === 'listings') {
          const res = await api.get('/listings/my');
          setMyListings(res.data.data);
        } else if (activeTab === 'wishlist') {
          const res = await api.get('/wishlist');
          setWishlist(res.data.data);
        } else if (activeTab === 'orders') {
          const res = await api.get('/orders?role=BUYER');
          setOrders(res.data.data);
        } else if (activeTab === 'sales') {
          const res = await api.get('/orders?role=SELLER');
          setSales(res.data.data);
        } else if (activeTab === 'offers') {
          const sentRes = await api.get('/offers?role=BUYER');
          const recvRes = await api.get('/offers?role=SELLER');
          setOffersSent(sentRes.data.data);
          setOffersReceived(recvRes.data.data);
        }
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadTabData();
  }, [activeTab]);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.patch('/auth/profile', {
        name: profileName,
        phone: profilePhone,
        bio: profileBio,
      });
      updateUser(res.data.data);
      setProfileSaved(true);
      setTimeout(() => setProfileSaved(false), 2000);
    } catch (err) {
      alert('Failed to update profile');
    }
  };

  const handleConfirmMeetup = async (orderId: string) => {
    try {
      const res = await api.post(`/orders/${orderId}/confirm-meetup`);
      alert(res.data.message);
      // Reload orders
      const ordersRes = await api.get('/orders?role=BUYER');
      setOrders(ordersRes.data.data);
      const salesRes = await api.get('/orders?role=SELLER');
      setSales(salesRes.data.data);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error confirming meetup');
    }
  };

  const handleOfferAction = async (offerId: string, action: 'accept' | 'reject') => {
    try {
      await api.patch(`/offers/${offerId}/${action}`);
      const recvRes = await api.get('/offers?role=SELLER');
      setOffersReceived(recvRes.data.data);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error updating offer');
    }
  };

  const handleMarkSold = async (listingId: string) => {
    try {
      await api.patch(`/listings/${listingId}/status`, { status: 'SOLD' });
      const res = await api.get('/listings/my');
      setMyListings(res.data.data);
    } catch {
      alert('Could not update listing');
    }
  };

  const handleDeleteListing = async (listingId: string) => {
    if (!confirm('Are you sure you want to remove this listing?')) return;
    try {
      await api.delete(`/listings/${listingId}`);
      setMyListings((prev) => prev.filter((l) => l.id !== listingId));
    } catch {
      alert('Could not delete listing');
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewOrderId) return;
    try {
      await api.post('/reviews', {
        orderId: reviewOrderId,
        rating: reviewRating,
        comment: reviewComment,
      });
      setReviewSuccess(true);
      setTimeout(() => {
        setReviewOrderId(null);
        setReviewSuccess(false);
        setReviewComment('');
      }, 1200);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to submit review');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* User Header Profile Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4 text-center sm:text-left flex-col sm:flex-row">
          {user?.avatar_url ? (
            <img src={user.avatar_url} alt={user.name} className="w-16 h-16 rounded-2xl object-cover shadow-sm" />
          ) : (
            <div className="w-16 h-16 rounded-2xl bg-brand-900 text-white font-black text-2xl flex items-center justify-center shadow-md">
              {user?.name.charAt(0) || 'U'}
            </div>
          )}
          <div>
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <h2 className="text-xl font-black text-slate-900">{user?.name}</h2>
              {user?.is_verified && (
                <span title="Verified Member"><ShieldCheck size={18} className="text-teal-600" /></span>
              )}
            </div>
            <p className="text-xs text-slate-500">{user?.email}</p>
            <p className="text-xs text-slate-600 mt-1 max-w-md">{user?.bio || 'Active LocalLoop Marketplace Member'}</p>
          </div>
        </div>

        <div className="flex gap-4">
          <div className="text-center px-4 py-2 rounded-2xl bg-slate-50 border border-slate-100">
            <span className="block text-lg font-black text-slate-900">{user?.rating_avg || '5.0'}★</span>
            <span className="text-[10px] uppercase font-bold text-slate-400">Rating</span>
          </div>
          <div className="text-center px-4 py-2 rounded-2xl bg-slate-50 border border-slate-100">
            <span className="block text-lg font-black text-slate-900">{user?.role}</span>
            <span className="text-[10px] uppercase font-bold text-slate-400">Account</span>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex gap-2 overflow-x-auto pb-2 border-b border-slate-200">
        {[
          { key: 'profile', label: 'My Profile', icon: UserIcon },
          { key: 'listings', label: 'My Listings', icon: PackageCheck },
          { key: 'wishlist', label: 'Saved Items', icon: Heart },
          { key: 'orders', label: 'My Purchases', icon: ShoppingBag },
          { key: 'sales', label: 'Completed Sales', icon: ShoppingBag },
          { key: 'offers', label: 'Price Offers', icon: Tag },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setSearchParams({ tab: tab.key })}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                isActive
                  ? 'bg-brand-900 text-white shadow-sm'
                  : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Icon size={16} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      <div>
        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <form onSubmit={handleProfileSubmit} className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 max-w-2xl space-y-6">
            <h3 className="text-base font-bold text-slate-900">Personal Details</h3>

            {profileSaved && (
              <div className="p-3 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-xs flex items-center gap-2">
                <CheckCircle size={16} /> Profile changes saved successfully!
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  className="w-full p-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  value={user?.email}
                  disabled
                  className="w-full p-2.5 text-sm bg-slate-100 border border-slate-200 rounded-xl text-slate-500 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number</label>
                <input
                  type="tel"
                  placeholder="+91 9876543210"
                  value={profilePhone}
                  onChange={(e) => setProfilePhone(e.target.value)}
                  className="w-full p-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Bio / About Me</label>
                <textarea
                  rows={3}
                  value={profileBio}
                  onChange={(e) => setProfileBio(e.target.value)}
                  className="w-full p-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl resize-none"
                  placeholder="Tell neighbours a little bit about yourself..."
                />
              </div>
            </div>

            <button
              type="submit"
              className="px-6 py-2.5 bg-brand-900 hover:bg-brand-800 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
            >
              Save Profile Changes
            </button>
          </form>
        )}

        {/* Listings Tab */}
        {activeTab === 'listings' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-base font-bold text-slate-900">Your Product Listings ({myListings.length})</h3>
              <Link to="/sell" className="px-4 py-2 bg-accent-600 text-white rounded-xl text-xs font-bold shadow-sm">
                + Create New Listing
              </Link>
            </div>

            {myListings.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {myListings.map((item) => (
                  <div key={item.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden flex flex-col justify-between">
                    <ProductCard listing={item} />
                    <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs">
                      <span className={`px-2 py-0.5 rounded font-bold uppercase text-[10px] ${
                        item.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'
                      }`}>
                        {item.status}
                      </span>
                      <div className="flex items-center gap-2">
                        {item.status === 'ACTIVE' && (
                          <button
                            onClick={() => handleMarkSold(item.id)}
                            className="text-xs font-bold text-teal-700 hover:underline"
                          >
                            Mark Sold
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteListing(item.id)}
                          className="text-slate-400 hover:text-rose-600 p-1"
                          title="Remove Listing"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 space-y-3">
                <PackageCheck size={36} className="text-slate-300 mx-auto" />
                <p className="text-sm font-semibold text-slate-700">You haven't listed any items for sale yet.</p>
                <Link to="/sell" className="inline-block px-4 py-2 bg-brand-900 text-white rounded-xl text-xs font-bold">
                  Post Your First Listing
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Wishlist Tab */}
        {activeTab === 'wishlist' && (
          <div className="space-y-6">
            <h3 className="text-base font-bold text-slate-900">Saved Items ({wishlist.length})</h3>
            {wishlist.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                {wishlist.map((item) => (
                  <ProductCard key={item.id} listing={item} />
                ))}
              </div>
            ) : (
              <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 space-y-3">
                <Heart size={36} className="text-slate-300 mx-auto" />
                <p className="text-sm font-semibold text-slate-700">Your wishlist is currently empty.</p>
                <Link to="/discover" className="inline-block px-4 py-2 bg-brand-900 text-white rounded-xl text-xs font-bold">
                  Explore Nearby Deals
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            <h3 className="text-base font-bold text-slate-900">Your Purchase Orders ({orders.length})</h3>
            {orders.map((o) => (
              <div key={o.id} className="bg-white rounded-2xl border border-slate-200 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  {o.listing_image && (
                    <img src={o.listing_image} alt="" className="w-16 h-16 rounded-xl object-cover" />
                  )}
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{o.listing_title}</h4>
                    <p className="text-xs text-slate-500">Seller: {o.seller_name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm font-extrabold text-slate-900">₹{o.amount.toLocaleString('en-IN')}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-slate-100 text-slate-700">
                        {o.transaction_type}
                      </span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                        o.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {o.status}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                  {o.transaction_type === 'OFFLINE' && !o.buyer_confirmed && o.status !== 'COMPLETED' && (
                    <button
                      onClick={() => handleConfirmMeetup(o.id)}
                      className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold"
                    >
                      Confirm Meetup Handshake
                    </button>
                  )}
                  {o.status === 'COMPLETED' && (
                    <button
                      onClick={() => setReviewOrderId(o.id)}
                      className="px-3.5 py-2 bg-brand-900 hover:bg-brand-800 text-white rounded-xl text-xs font-bold"
                    >
                      Rate & Review Seller
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Completed Sales Tab */}
        {activeTab === 'sales' && (
          <div className="space-y-4">
            <h3 className="text-base font-bold text-slate-900">Items Sold ({sales.length})</h3>
            {sales.map((s) => (
              <div key={s.id} className="bg-white rounded-2xl border border-slate-200 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  {s.listing_image && (
                    <img src={s.listing_image} alt="" className="w-16 h-16 rounded-xl object-cover" />
                  )}
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{s.listing_title}</h4>
                    <p className="text-xs text-slate-500">Buyer: {s.buyer_name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm font-extrabold text-slate-900">₹{s.amount.toLocaleString('en-IN')}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-slate-100 text-slate-700">
                        {s.transaction_type}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-100 text-emerald-800">
                        {s.status}
                      </span>
                    </div>
                  </div>
                </div>

                {s.transaction_type === 'OFFLINE' && !s.seller_confirmed && s.status !== 'COMPLETED' && (
                  <button
                    onClick={() => handleConfirmMeetup(s.id)}
                    className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold"
                  >
                    Confirm Handover
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Offers Tab */}
        {activeTab === 'offers' && (
          <div className="space-y-8">
            {/* Offers Received (Seller) */}
            <div className="space-y-3">
              <h3 className="text-base font-bold text-slate-900">Offers Received on Your Items</h3>
              {offersReceived.map((off) => (
                <div key={off.id} className="bg-white rounded-2xl border border-slate-200 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{off.listing_title}</h4>
                    <p className="text-xs text-slate-500">From {off.buyer_name}: {off.message || 'No note'}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm font-extrabold text-teal-700">Offered: ₹{off.amount.toLocaleString('en-IN')}</span>
                      <span className="text-xs text-slate-400 line-through">₹{off.listing_price?.toLocaleString('en-IN')}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-100 rounded text-slate-700">{off.status}</span>
                    </div>
                  </div>

                  {off.status === 'PENDING' && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleOfferAction(off.id, 'accept')}
                        className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-bold"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => handleOfferAction(off.id, 'reject')}
                        className="px-3 py-1.5 bg-slate-200 text-slate-700 rounded-lg text-xs font-bold"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Offers Sent (Buyer) */}
            <div className="space-y-3">
              <h3 className="text-base font-bold text-slate-900">Offers Sent to Sellers</h3>
              {offersSent.map((off) => (
                <div key={off.id} className="bg-white rounded-2xl border border-slate-200 p-4 flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{off.listing_title}</h4>
                    <div className="flex items-center gap-2 text-xs text-slate-600 mt-1">
                      <span>Offered ₹{off.amount.toLocaleString('en-IN')}</span>
                      <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                        off.status === 'ACCEPTED' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100'
                      }`}>
                        {off.status}
                      </span>
                    </div>
                  </div>
                  {off.status === 'ACCEPTED' && (
                    <Link
                      to={`/checkout/${off.listing_id}?offerId=${off.id}`}
                      className="px-3 py-1.5 bg-brand-900 text-white rounded-lg text-xs font-bold"
                    >
                      Checkout with Accepted Price
                    </Link>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Review Modal */}
      {reviewOrderId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full space-y-4">
            <h3 className="text-base font-bold text-slate-900">Leave Seller Review</h3>
            {reviewSuccess && (
              <p className="text-xs text-emerald-600 font-bold">Review submitted successfully!</p>
            )}
            <form onSubmit={handleReviewSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Rating (1 to 5 Stars)</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setReviewRating(star)}
                      className={`text-2xl ${star <= reviewRating ? 'text-amber-400' : 'text-slate-300'}`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Written Feedback</label>
                <textarea
                  rows={3}
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="How was the exchange and condition of the item?"
                  className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setReviewOrderId(null)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-brand-900 text-white rounded-xl text-xs font-bold"
                >
                  Submit Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
