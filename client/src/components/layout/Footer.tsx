import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, MapPin, RefreshCw, Zap, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Value Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pb-12 border-b border-slate-800 text-slate-300">
          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-brand-800/80 text-teal-400 rounded-xl shrink-0">
              <MapPin size={22} />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">Hyperlocal Radius</h4>
              <p className="text-xs text-slate-400 mt-1">Discover verified products within 1 to 20 km of your neighbourhood.</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-brand-800/80 text-teal-400 rounded-xl shrink-0">
              <ShieldCheck size={22} />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">Dual-Confirmation Meetup</h4>
              <p className="text-xs text-slate-400 mt-1">Both buyer and seller confirm physical exchanges for complete peace of mind.</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-brand-800/80 text-teal-400 rounded-xl shrink-0">
              <RefreshCw size={22} />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">Real-Time Negotiation</h4>
              <p className="text-xs text-slate-400 mt-1">Submit offers, send instant counteroffers, and lock prices securely.</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-brand-800/80 text-teal-400 rounded-xl shrink-0">
              <Zap size={22} />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">Razorpay Protection</h4>
              <p className="text-xs text-slate-400 mt-1">Direct online escrow checkout with cryptographic signature verification.</p>
            </div>
          </div>
        </div>

        {/* Links Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-12">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-teal-500 text-brand-950 font-black flex items-center justify-center text-sm">
                LL
              </div>
              <span className="font-extrabold text-white text-lg tracking-tight">LocalLoop</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              India's premier hyperlocal second-hand marketplace connecting trusted neighbours, students, and professionals for sustainable buying and selling.
            </p>
          </div>

          <div>
            <h5 className="font-bold text-white text-xs uppercase tracking-wider mb-4">Categories</h5>
            <ul className="space-y-2 text-xs">
              <li><Link to="/discover?category=laptops" className="hover:text-white transition-colors">Laptops & PC Parts</Link></li>
              <li><Link to="/discover?category=mobiles" className="hover:text-white transition-colors">Mobiles & Tablets</Link></li>
              <li><Link to="/discover?category=electronics" className="hover:text-white transition-colors">Audio & Electronics</Link></li>
              <li><Link to="/discover?category=furniture" className="hover:text-white transition-colors">Ergonomic Furniture</Link></li>
              <li><Link to="/discover?category=sports-equipment" className="hover:text-white transition-colors">Bicycles & Sports</Link></li>
            </ul>
          </div>

          <div>
            <h5 className="font-bold text-white text-xs uppercase tracking-wider mb-4">Discover Tech Hubs</h5>
            <ul className="space-y-2 text-xs">
              <li><span className="hover:text-white cursor-pointer">Bengaluru (Indiranagar, Koramangala)</span></li>
              <li><span className="hover:text-white cursor-pointer">Mumbai (Bandra West, Powai)</span></li>
              <li><span className="hover:text-white cursor-pointer">Delhi NCR (Connaught Place, DLF)</span></li>
              <li><span className="hover:text-white cursor-pointer">Hyderabad (HITEC City, Gachibowli)</span></li>
              <li><span className="hover:text-white cursor-pointer">Pune (Hinjawadi, Viman Nagar)</span></li>
            </ul>
          </div>

          <div>
            <h5 className="font-bold text-white text-xs uppercase tracking-wider mb-4">Platform & Trust</h5>
            <ul className="space-y-2 text-xs">
              <li><Link to="/sell" className="hover:text-white transition-colors">List Your Second-Hand Item</Link></li>
              <li><Link to="/dashboard" className="hover:text-white transition-colors">Buyer & Seller Protection</Link></li>
              <li><span className="hover:text-white cursor-pointer">Privacy & Residential Masking</span></li>
              <li><span className="hover:text-white cursor-pointer">Community Guidelines</span></li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} LocalLoop Marketplace Inc. Built with PostGIS, React, & Node.js.</p>
          <p className="flex items-center gap-1">
            Made for sustainable hyperlocal commerce <Heart size={14} className="text-red-500 fill-red-500" />
          </p>
        </div>
      </div>
    </footer>
  );
};

