import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  MapPin,
  Search,
  PlusCircle,
  MessageSquare,
  Heart,
  User as UserIcon,
  LogOut,
  ShieldAlert,
  ChevronDown,
  Menu,
  X,
  PackageCheck,
  ShoppingBag,
} from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { useLocationStore } from '../../stores/locationStore';
import { useChatStore } from '../../stores/chatStore';
import { LocationModal } from './LocationModal';

export const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuthStore();
  const { location } = useLocationStore();
  const { unreadCount } = useChatStore();

  const [isLocationOpen, setIsLocationOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/discover?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/discover');
    }
  };

  const handleLogout = async () => {
    await logout();
    setIsUserMenuOpen(false);
    navigate('/');
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-3 sm:gap-6">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
              <div className="w-10 h-10 rounded-xl bg-brand-900 flex items-center justify-center text-white shadow-md shadow-brand-900/20 group-hover:bg-brand-800 transition-colors">
                <span className="font-extrabold text-lg tracking-tighter text-teal-400">LL</span>
              </div>
              <div className="hidden sm:block">
                <span className="text-xl font-extrabold tracking-tight text-brand-900">
                  Local<span className="text-accent-600">Loop</span>
                </span>
                <span className="block text-[10px] uppercase font-bold tracking-wider text-slate-400 -mt-1">
                  Hyperlocal Market
                </span>
              </div>
            </Link>

            {/* Hyperlocal Location Pill */}
            <button
              onClick={() => setIsLocationOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100/80 hover:bg-slate-200/70 border border-slate-200 transition-all shrink-0 max-w-[190px] sm:max-w-xs truncate"
              title="Change your hyperlocal area"
            >
              <MapPin size={15} className="text-accent-600 shrink-0" />
              <span className="truncate">
                {location.locality}, {location.city}
              </span>
              <span className="hidden md:inline text-slate-400 font-normal">
                ({location.radiusKm}km)
              </span>
              <ChevronDown size={14} className="text-slate-400 shrink-0" />
            </button>

            {/* Search Bar */}
            <form onSubmit={handleSearchSubmit} className="hidden md:flex flex-1 max-w-lg">
              <div className="relative w-full">
                <Search size={18} className="absolute left-3.5 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search laptops, phones, furniture nearby..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition-all"
                />
              </div>
            </form>

            {/* Right Action Icons & Auth */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Explore Link */}
              <Link
                to="/discover"
                className="hidden lg:inline-flex items-center px-3 py-2 text-sm font-semibold text-slate-700 hover:text-brand-900 transition-colors"
              >
                Browse All
              </Link>

              {isAuthenticated ? (
                <>
                  {/* Chat Icon */}
                  <Link
                    to="/chat"
                    className="relative p-2.5 rounded-xl text-slate-600 hover:text-brand-900 hover:bg-slate-100 transition-colors"
                    title="Conversations"
                  >
                    <MessageSquare size={20} />
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-bounce">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </Link>

                  {/* Wishlist */}
                  <Link
                    to="/dashboard?tab=wishlist"
                    className="p-2.5 rounded-xl text-slate-600 hover:text-brand-900 hover:bg-slate-100 transition-colors"
                    title="My Wishlist"
                  >
                    <Heart size={20} />
                  </Link>

                  {/* Sell Button */}
                  <Link
                    to="/sell"
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-bold text-white bg-accent-600 hover:bg-accent-700 shadow-sm shadow-accent-600/20 transition-all active:scale-95"
                  >
                    <PlusCircle size={18} />
                    <span className="hidden sm:inline">Sell Item</span>
                  </Link>

                  {/* User Dropdown */}
                  <div className="relative">
                    <button
                      onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                      className="flex items-center gap-2 p-1.5 rounded-xl border border-slate-200 hover:border-slate-300 transition-colors"
                    >
                      {user?.avatar_url ? (
                        <img
                          src={user.avatar_url}
                          alt={user.name}
                          className="w-7 h-7 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="w-7 h-7 rounded-lg bg-brand-900 text-white flex items-center justify-center font-bold text-xs">
                          {user?.name?.charAt(0) || 'U'}
                        </div>
                      )}
                      <ChevronDown size={14} className="text-slate-500 hidden sm:block" />
                    </button>

                    {isUserMenuOpen && (
                      <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-fade-in">
                        <div className="px-4 py-2 border-b border-slate-100">
                          <p className="text-xs font-semibold text-slate-400">Signed in as</p>
                          <p className="text-sm font-bold text-slate-900 truncate">{user?.name}</p>
                          <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                        </div>

                        <Link
                          to="/dashboard?tab=profile"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                        >
                          <UserIcon size={16} /> My Profile
                        </Link>
                        <Link
                          to="/dashboard?tab=listings"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                        >
                          <PackageCheck size={16} /> My Listings
                        </Link>
                        <Link
                          to="/dashboard?tab=orders"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                        >
                          <ShoppingBag size={16} /> My Orders & Sales
                        </Link>

                        {user?.role === 'ADMIN' && (
                          <Link
                            to="/admin"
                            onClick={() => setIsUserMenuOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2 text-xs font-bold text-indigo-600 hover:bg-indigo-50"
                          >
                            <ShieldAlert size={16} /> Admin Portal
                          </Link>
                        )}

                        <div className="border-t border-slate-100 mt-1 pt-1">
                          <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 text-left"
                          >
                            <LogOut size={16} /> Sign Out
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    to="/login"
                    className="px-3 py-2 text-sm font-semibold text-slate-700 hover:text-brand-900 transition-colors"
                  >
                    Log In
                  </Link>
                  <Link
                    to="/signup"
                    className="px-3.5 py-2 text-sm font-bold text-white bg-brand-900 hover:bg-brand-800 rounded-xl shadow-sm transition-all"
                  >
                    Sign Up
                  </Link>
                </div>
              )}

              {/* Mobile menu toggle */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100"
              >
                {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu expanded */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 px-4 py-3 bg-white space-y-3">
            <form onSubmit={handleSearchSubmit}>
              <div className="relative w-full">
                <Search size={16} className="absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search nearby items..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl font-medium"
                />
              </div>
            </form>
            <div className="flex flex-col gap-1">
              <Link
                to="/discover"
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Browse All Products
              </Link>
              <Link
                to="/sell"
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg text-sm font-semibold text-accent-700 hover:bg-accent-50"
              >
                + List an Item for Sale
              </Link>
              {isAuthenticated && (
                <>
                  <Link
                    to="/dashboard"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="px-3 py-2 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    User Dashboard
                  </Link>
                  <Link
                    to="/chat"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="px-3 py-2 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Messages
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Location Modal */}
      <LocationModal isOpen={isLocationOpen} onClose={() => setIsLocationOpen(false)} />
    </>
  );
};

