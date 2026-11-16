import { create } from 'zustand';
import api from '../services/api';
import { LocationState } from '../types';

interface LocationStore {
  location: LocationState;
  isLoading: boolean;
  error: string | null;
  setLocation: (loc: Partial<LocationState>) => void;
  setRadius: (km: number) => void;
  detectGPS: () => Promise<boolean>;
  lookupPincode: (pincode: string) => Promise<boolean>;
  selectPresetHub: (hub: any) => void;
}

const DEFAULT_LOCATION: LocationState = {
  locality: 'Indiranagar',
  city: 'Bengaluru',
  state: 'Karnataka',
  pincode: '560038',
  latitude: 12.9719,
  longitude: 77.6412,
  isCustom: false,
  radiusKm: 15,
};

const savedLoc = localStorage.getItem('localloop_location');
const initialLoc: LocationState = savedLoc ? JSON.parse(savedLoc) : DEFAULT_LOCATION;

export const useLocationStore = create<LocationStore>((set, get) => ({
  location: initialLoc,
  isLoading: false,
  error: null,

  setLocation: (loc) => {
    const next = { ...get().location, ...loc, isCustom: true };
    localStorage.setItem('localloop_location', JSON.stringify(next));
    set({ location: next, error: null });
  },

  setRadius: (km) => {
    const next = { ...get().location, radiusKm: km };
    localStorage.setItem('localloop_location', JSON.stringify(next));
    set({ location: next });
  },

  detectGPS: async () => {
    if (!navigator.geolocation) {
      set({ error: 'Geolocation is not supported by your browser' });
      return false;
    }

    set({ isLoading: true, error: null });

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            const res = await api.get(`/locations/reverse?lat=${latitude}&lon=${longitude}`);
            const data = res.data.data;

            const nextLocation: LocationState = {
              locality: data.locality || 'Nearby Locality',
              city: data.city || 'Your City',
              state: data.state || 'India',
              pincode: data.pincode,
              latitude,
              longitude,
              isCustom: true,
              radiusKm: get().location.radiusKm || 10,
            };

            localStorage.setItem('localloop_location', JSON.stringify(nextLocation));
            set({ location: nextLocation, isLoading: false });
            resolve(true);
          } catch {
            const fallback: LocationState = {
              ...get().location,
              latitude,
              longitude,
              locality: 'GPS Location',
              isCustom: true,
            };
            localStorage.setItem('localloop_location', JSON.stringify(fallback));
            set({ location: fallback, isLoading: false });
            resolve(true);
          }
        },
        (geoError) => {
          let msg = 'Location permission denied. Please select your location manually or enter a pincode.';
          if (geoError.code === geoError.POSITION_UNAVAILABLE) {
            msg = 'Location information is currently unavailable.';
          } else if (geoError.code === geoError.TIMEOUT) {
            msg = 'Location request timed out.';
          }
          set({ isLoading: false, error: msg });
          resolve(false);
        },
        { timeout: 10000, enableHighAccuracy: true }
      );
    });
  },

  lookupPincode: async (pincode: string) => {
    const clean = pincode.trim();
    if (!/^\d{6}$/.test(clean)) {
      set({ error: 'Please enter a valid 6-digit Indian pincode' });
      return false;
    }

    set({ isLoading: true, error: null });
    try {
      const res = await api.get(`/locations/pincode/${clean}`);
      const data = res.data.data;

      const nextLocation: LocationState = {
        locality: data.locality,
        city: data.city,
        state: data.state,
        pincode: clean,
        latitude: data.latitude,
        longitude: data.longitude,
        isCustom: true,
        radiusKm: get().location.radiusKm || 10,
      };

      localStorage.setItem('localloop_location', JSON.stringify(nextLocation));
      set({ location: nextLocation, isLoading: false, error: null });
      return true;
    } catch {
      set({ isLoading: false, error: `Could not locate pincode ${clean}. Please select another locality or tech hub.` });
      return false;
    }
  },

  selectPresetHub: (hub) => {
    const nextLocation: LocationState = {
      locality: hub.locality,
      city: hub.city,
      state: hub.state,
      pincode: hub.pincode,
      latitude: hub.latitude,
      longitude: hub.longitude,
      isCustom: true,
      radiusKm: get().location.radiusKm || 10,
    };
    localStorage.setItem('localloop_location', JSON.stringify(nextLocation));
    set({ location: nextLocation, error: null });
  },
}));

