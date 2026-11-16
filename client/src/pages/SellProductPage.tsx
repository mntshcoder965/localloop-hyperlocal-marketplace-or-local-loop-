import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Upload,
  X,
  MapPin,
  Navigation,
  CheckCircle,
  AlertCircle,
  Sparkles,
  Image as ImageIcon,
} from 'lucide-react';
import api from '../services/api';
import { Category, ProductCondition } from '../types';
import { useLocationStore } from '../stores/locationStore';

export const SellProductPage: React.FC = () => {
  const navigate = useNavigate();
  const { location, detectGPS, lookupPincode } = useLocationStore();

  const [categories, setCategories] = useState<Category[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [price, setPrice] = useState('');
  const [originalPrice, setOriginalPrice] = useState('');
  const [condition, setCondition] = useState<ProductCondition>('LIKE_NEW');

  // Location fields
  const [locality, setLocality] = useState(location.locality || 'Indiranagar');
  const [city, setCity] = useState(location.city || 'Bengaluru');
  const [state, setState] = useState(location.state || 'Karnataka');
  const [pincode, setPincode] = useState(location.pincode || '560038');
  const [latitude, setLatitude] = useState(location.latitude || 12.9719);
  const [longitude, setLongitude] = useState(location.longitude || 77.6412);

  // Uploaded images state
  const [images, setImages] = useState<Array<{ url: string; is_primary: boolean }>>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.get('/categories').then((res) => {
      setCategories(res.data.data);
      if (res.data.data.length > 0) {
        setCategoryId(res.data.data[0].id);
      }
    });
  }, []);

  const handlePincodeResolve = async (val: string) => {
    setPincode(val);
    if (/^\d{6}$/.test(val)) {
      try {
        const res = await api.get(`/locations/pincode/${val}`);
        const d = res.data.data;
        setLocality(d.locality);
        setCity(d.city);
        setState(d.state);
        setLatitude(d.latitude);
        setLongitude(d.longitude);
      } catch {
        // Fallback
      }
    }
  };

  const handleGPSDetect = async () => {
    const ok = await detectGPS();
    if (ok) {
      const loc = useLocationStore.getState().location;
      setLocality(loc.locality);
      setCity(loc.city);
      setState(loc.state);
      if (loc.pincode) setPincode(loc.pincode);
      setLatitude(loc.latitude);
      setLongitude(loc.longitude);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (images.length + files.length > 6) {
      setError('You can upload a maximum of 6 images.');
      return;
    }

    setIsUploading(true);
    setError(null);

    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append('images', files[i]);
    }

    try {
      const res = await api.post('/listings/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      // const uploaded = res.data.data.map((item: any, idx: number) => ({
      //   url: item.url,
      //   is_primary: images.length === 0 && idx === 0,
      // }));
      // const uploaded = res.data.data.map((item: any, idx: number) => ({
      //   url: item.url.startsWith('http')
      //     ? item.url
      //     : new URL(item.url, api.defaults.baseURL).toString(),
      //   is_primary: images.length === 0 && idx === 0,
      // }));
      const uploaded = res.data.data.map((item: any, idx: number) => ({
        url: item.url.startsWith('http')
          ? item.url
          : `http://localhost:5000${item.url}`,
        is_primary: images.length === 0 && idx === 0,
      }));

      setImages((prev) => [...prev, ...uploaded]);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to upload images');
    } finally {
      setIsUploading(false);
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => {
      const updated = prev.filter((_, i) => i !== index);
      if (updated.length > 0 && !updated.some((img) => img.is_primary)) {
        updated[0].is_primary = true;
      }
      return updated;
    });
  };

  const setPrimary = (index: number) => {
    setImages((prev) =>
      prev.map((img, i) => ({
        ...img,
        is_primary: i === index,
      }))
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (images.length === 0) {
      setError('Please upload at least 1 photo of your item.');
      return;
    }

    if (!price || parseFloat(price) <= 0) {
      setError('Please specify a valid selling price.');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        title: title.trim(),
        description: description.trim(),
        category_id: categoryId,
        price: parseFloat(price),
        original_price: originalPrice ? parseFloat(originalPrice) : undefined,
        condition,
        locality,
        city,
        state,
        pincode,
        latitude,
        longitude,
        images,
        status: 'ACTIVE',
      };

      const res = await api.post('/listings', payload);
      const created = res.data.data;
      navigate(`/product/${created.id}`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to publish listing');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-10 space-y-8">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent-50 text-accent-700 text-xs font-bold border border-accent-100">
          <Sparkles size={14} /> Sell Locally in Your Area
        </div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">
          List Your Item for Sale
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Reach buyers living 1 km – 20 km from your doorstep. Zero listing fees.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 sm:p-10 space-y-8">
        {error && (
          <div className="p-4 bg-red-50 text-red-700 border border-red-200 rounded-2xl text-xs flex items-center gap-2.5">
            <AlertCircle size={18} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* 1. Photos Section */}
        <div className="space-y-3">
          <label className="block text-sm font-bold text-slate-900">
            Upload Product Photos <span className="text-red-500">*</span>
            <span className="text-xs font-normal text-slate-500 ml-2">(Up to 6 images)</span>
          </label>

          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
            {images.map((img, idx) => (
              <div key={idx} className="relative aspect-square rounded-2xl overflow-hidden border-2 border-slate-200 group">
                <img src={img.url} alt="" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeImage(idx)}
                  className="absolute top-1 right-1 p-1 bg-slate-900/80 text-white rounded-full opacity-90 hover:opacity-100"
                >
                  <X size={12} />
                </button>
                {img.is_primary ? (
                  <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded text-[9px] font-black bg-brand-900 text-white">
                    Cover
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => setPrimary(idx)}
                    className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-white/90 text-slate-700 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    Set Cover
                  </button>
                )}
              </div>
            ))}

            {images.length < 6 && (
              <label className="aspect-square rounded-2xl border-2 border-dashed border-slate-300 hover:border-brand-500 bg-slate-50 hover:bg-brand-50/30 flex flex-col items-center justify-center cursor-pointer transition-colors p-2 text-center">
                <Upload size={20} className={isUploading ? 'animate-bounce text-brand-600' : 'text-slate-400'} />
                <span className="text-[11px] font-semibold text-slate-600 mt-1">
                  {isUploading ? 'Uploading...' : '+ Add Photo'}
                </span>
                <input
                  type="file"
                  multiple
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleFileChange}
                  disabled={isUploading}
                  className="hidden"
                />
              </label>
            )}
          </div>
        </div>

        {/* 2. Basic Info */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Listing Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. MacBook Pro M2 14-inch (16GB RAM / 512GB SSD) Space Grey"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={200}
              required
              className="w-full p-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                required
                className="w-full p-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium text-slate-800"
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Condition <span className="text-red-500">*</span>
              </label>
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value as ProductCondition)}
                className="w-full p-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium text-slate-800"
              >
                <option value="LIKE_NEW">Like New (Flawless, barely used)</option>
                <option value="GOOD">Good (Minor normal signs of use)</option>
                <option value="FAIR">Fair (Visible wear, fully functional)</option>
                <option value="NEEDS_REPAIR">Needs Repair (Requires service)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Selling Price (₹) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-3 text-slate-500 font-bold">₹</span>
                <input
                  type="number"
                  placeholder="e.g. 14500"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  min="1"
                  required
                  className="w-full pl-8 pr-3 py-3 text-sm font-bold bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Original Retail Price (₹) <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-3 text-slate-500 font-bold">₹</span>
                <input
                  type="number"
                  placeholder="e.g. 24990"
                  value={originalPrice}
                  onChange={(e) => setOriginalPrice(e.target.value)}
                  min="1"
                  className="w-full pl-8 pr-3 py-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Detailed Description <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={4}
              placeholder="State what's included (box, charger, bill), battery health, any cosmetic wear, and convenient pickup spots nearby..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              className="w-full p-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 font-normal resize-none"
            />
          </div>
        </div>

        {/* 3. Hyperlocal Location Selection */}
        <div className="pt-4 border-t border-slate-100 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Pickup Location</h3>
              <p className="text-xs text-slate-500">
                Helps nearby neighbours discover your listing. Exact street is kept private.
              </p>
            </div>
            <button
              type="button"
              onClick={handleGPSDetect}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-50 hover:bg-brand-100 text-brand-900 rounded-xl text-xs font-bold transition-colors"
            >
              <Navigation size={14} /> Detect GPS
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Indian Pincode</label>
              <input
                type="text"
                maxLength={6}
                value={pincode}
                onChange={(e) => handlePincodeResolve(e.target.value.replace(/\D/g, ''))}
                className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Locality / Area</label>
              <input
                type="text"
                value={locality}
                onChange={(e) => setLocality(e.target.value)}
                required
                className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">City</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                required
                className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium"
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isSubmitting || isUploading}
          className="w-full py-4 bg-brand-900 hover:bg-brand-800 text-white rounded-2xl text-sm font-extrabold shadow-xl shadow-brand-900/15 transition-all active:scale-98 disabled:opacity-50"
        >
          {isSubmitting ? 'Publishing Your Listing...' : 'Publish Listing to LocalLoop'}
        </button>
      </form>
    </div>
  );
};

