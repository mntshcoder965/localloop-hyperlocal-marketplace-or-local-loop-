import React, { useState } from 'react';
import { MapPin, Navigation, Search, Check, AlertCircle, X } from 'lucide-react';
import { useLocationStore } from '../../stores/locationStore';

interface LocationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PRESET_HUBS = [
  { locality: 'Indiranagar', city: 'Bengaluru', state: 'Karnataka', pincode: '560038', latitude: 12.9719, longitude: 77.6412 },
  { locality: 'Koramangala', city: 'Bengaluru', state: 'Karnataka', pincode: '560034', latitude: 12.9352, longitude: 77.6245 },
  { locality: 'HSR Layout', city: 'Bengaluru', state: 'Karnataka', pincode: '560102', latitude: 12.9121, longitude: 77.6446 },
  { locality: 'Whitefield', city: 'Bengaluru', state: 'Karnataka', pincode: '560066', latitude: 12.9698, longitude: 77.7499 },
  { locality: 'Bandra West', city: 'Mumbai', state: 'Maharashtra', pincode: '400050', latitude: 19.0596, longitude: 72.8295 },
  { locality: 'Powai', city: 'Mumbai', state: 'Maharashtra', pincode: '400076', latitude: 19.1176, longitude: 72.9060 },
  { locality: 'Connaught Place', city: 'New Delhi', state: 'Delhi', pincode: '110001', latitude: 28.6304, longitude: 77.2177 },
  { locality: 'Cyber City', city: 'Gurugram', state: 'Haryana', pincode: '122001', latitude: 28.4871, longitude: 77.0898 },
  { locality: 'HITEC City', city: 'Hyderabad', state: 'Telangana', pincode: '500081', latitude: 17.4474, longitude: 78.3762 },
  { locality: 'Hinjawadi', city: 'Pune', state: 'Maharashtra', pincode: '411057', latitude: 18.5913, longitude: 73.7389 },
];

export const LocationModal: React.FC<LocationModalProps> = ({ isOpen, onClose }) => {
  const { location, setRadius, detectGPS, lookupPincode, selectPresetHub, isLoading, error } =
    useLocationStore();
  const [pincodeInput, setPincodeInput] = useState('');
  const [pincodeStatus, setPincodeStatus] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGPSDetect = async () => {
    const success = await detectGPS();
    if (success) {
      onClose();
    }
  };

  const handlePincodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pincodeInput) return;
    const ok = await lookupPincode(pincodeInput);
    if (ok) {
      setPincodeStatus('Location resolved!');
      setTimeout(() => {
        onClose();
        setPincodeStatus(null);
        setPincodeInput('');
      }, 500);
    }
  };

  const handleSelectHub = (hub: (typeof PRESET_HUBS)[0]) => {
    selectPresetHub(hub);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-brand-100 text-brand-900 rounded-xl">
              <MapPin size={20} className="text-brand-900" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-lg">Select Your Location</h3>
              <p className="text-xs text-slate-500">Discover items listed right in your neighbourhood</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-5 space-y-5 max-h-[80vh] overflow-y-auto">
          {error && (
            <div className="flex items-start gap-2.5 p-3.5 bg-red-50 text-red-700 border border-red-200/60 rounded-xl text-xs">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Current Selection */}
          <div className="p-3.5 rounded-xl bg-teal-50/60 border border-teal-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-teal-500 animate-pulse"></span>
              <div>
                <span className="text-xs font-medium text-teal-800">Current Area: </span>
                <span className="text-sm font-bold text-teal-950">
                  {location.locality}, {location.city}
                </span>
                {location.pincode && (
                  <span className="text-xs text-teal-700 font-mono ml-1.5">({location.pincode})</span>
                )}
              </div>
            </div>
            <span className="text-xs bg-teal-100 text-teal-800 font-semibold px-2 py-0.5 rounded-md">
              Within {location.radiusKm} km
            </span>
          </div>

          {/* GPS Auto-Detect Button */}
          <button
            onClick={handleGPSDetect}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl font-semibold text-sm text-white bg-brand-900 hover:bg-brand-800 transition-all shadow-md shadow-brand-900/10 active:scale-[0.99] disabled:opacity-60"
          >
            <Navigation size={18} className={isLoading ? 'animate-spin' : ''} />
            {isLoading ? 'Detecting your coordinates...' : 'Auto-Detect Current GPS Location'}
          </button>

          {/* Indian Pincode Resolver Form */}
          <form onSubmit={handlePincodeSubmit} className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">Find by Indian Pincode</label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search size={16} className="absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  maxLength={6}
                  placeholder="e.g. 560038, 400050, 110001"
                  value={pincodeInput}
                  onChange={(e) => setPincodeInput(e.target.value.replace(/\D/g, ''))}
                  className="w-full pl-9 pr-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white font-mono"
                />
              </div>
              <button
                type="submit"
                disabled={isLoading || pincodeInput.length !== 6}
                className="px-4 py-2.5 bg-accent-600 hover:bg-accent-700 text-white rounded-xl text-sm font-semibold transition-colors disabled:opacity-50"
              >
                Apply
              </button>
            </div>
            {pincodeStatus && (
              <p className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                <Check size={14} /> {pincodeStatus}
              </p>
            )}
          </form>

          {/* Radius Selector */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-semibold text-slate-700">Search Radius Distance</label>
              <span className="text-xs font-bold text-brand-900">{location.radiusKm} km</span>
            </div>
            <div className="grid grid-cols-5 gap-1.5">
              {[1, 5, 10, 20, 50].map((km) => (
                <button
                  key={km}
                  type="button"
                  onClick={() => setRadius(km)}
                  className={`py-2 text-xs font-bold rounded-lg border transition-all ${
                    location.radiusKm === km
                      ? 'bg-brand-900 text-white border-brand-900 shadow-sm'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {km} km
                </button>
              ))}
            </div>
          </div>

          {/* Preset Tech Hubs */}
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-2">
              Popular Neighbourhoods & Tech Hubs
            </label>
            <div className="grid grid-cols-2 gap-2">
              {PRESET_HUBS.map((hub) => {
                const isSelected =
                  location.locality === hub.locality && location.city === hub.city;
                return (
                  <button
                    key={`${hub.city}-${hub.locality}`}
                    type="button"
                    onClick={() => handleSelectHub(hub)}
                    className={`p-2.5 text-left rounded-xl border text-xs transition-all flex items-start gap-2 ${
                      isSelected
                        ? 'border-brand-900 bg-brand-50/50 font-semibold text-brand-900'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <MapPin
                      size={14}
                      className={isSelected ? 'text-brand-900 shrink-0 mt-0.5' : 'text-slate-400 shrink-0 mt-0.5'}
                    />
                    <div className="truncate">
                      <div className="truncate font-medium">{hub.locality}</div>
                      <div className="text-[10px] text-slate-400">{hub.city}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

