import React from 'react';
import { Link } from 'react-router-dom';
import { Compass } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-16 text-center">
      <div className="max-w-md space-y-4">
        <Compass size={64} className="text-slate-300 mx-auto animate-pulse" />
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Page Not Found</h1>
        <p className="text-xs text-slate-500">
          The page or neighbourhood listing you are looking for doesn't exist or has moved.
        </p>
        <Link
          to="/"
          className="inline-block px-5 py-2.5 bg-brand-900 text-white rounded-xl text-xs font-bold shadow-sm"
        >
          Return to Marketplace Home
        </Link>
      </div>
    </div>
  );
};

