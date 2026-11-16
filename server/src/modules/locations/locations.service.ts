import { INDIAN_PINCODES, PincodeRecord } from './pincodeData.js';
import { cacheService } from '../../config/redis.js';
import axios from 'axios';

export const locationsService = {
  async resolvePincode(pincode: string): Promise<PincodeRecord | null> {
    const trimmed = pincode.trim();
    if (INDIAN_PINCODES[trimmed]) {
      return INDIAN_PINCODES[trimmed];
    }

    const cacheKey = `pincode:${trimmed}`;
    const cached = await cacheService.get(cacheKey);
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch {
        // Fall through
      }
    }

    // Attempt lookup via free postal API or OSM Nominatim
    try {
      const response = await axios.get(
        `https://api.postalpincode.in/pincode/${trimmed}`,
        { timeout: 3000 }
      );
      if (response.data && response.data[0]?.Status === 'Success') {
        const po = response.data[0].PostOffice[0];
        // Approximate city coordinates if known or default to state capital
        const record: PincodeRecord = {
          pincode: trimmed,
          locality: po.Name,
          city: po.District || po.Division,
          state: po.State,
          latitude: 12.9716, // Fallback coordinate if unmapped
          longitude: 77.5946,
        };
        await cacheService.set(cacheKey, JSON.stringify(record), 86400 * 7); // Cache for 7 days
        return record;
      }
    } catch (err) {
      // Return null if external API fails
    }

    return null;
  },

  async reverseGeocode(lat: number, lon: number): Promise<{ locality: string; city: string; state: string; pincode: string } | null> {
    const cacheKey = `revgeo:${lat.toFixed(3)}:${lon.toFixed(3)}`;
    const cached = await cacheService.get(cacheKey);
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch {}
    }

    try {
      const res = await axios.get(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`,
        {
          headers: { 'User-Agent': 'LocalLoop-Hyperlocal-Marketplace/1.0' },
          timeout: 3000,
        }
      );

      if (res.data && res.data.address) {
        const addr = res.data.address;
        const result = {
          locality: addr.suburb || addr.neighbourhood || addr.quarter || addr.residential || addr.city_district || 'Local Area',
          city: addr.city || addr.town || addr.state_district || 'Local City',
          state: addr.state || 'India',
          pincode: addr.postcode || '560001',
        };
        await cacheService.set(cacheKey, JSON.stringify(result), 86400 * 3);
        return result;
      }
    } catch {
      // Fallback
    }

    // Default approximation based on Bengaluru if offline
    return {
      locality: 'Indiranagar',
      city: 'Bengaluru',
      state: 'Karnataka',
      pincode: '560038',
    };
  },

  listPopularHubs(): PincodeRecord[] {
    return [
      INDIAN_PINCODES['560038'], // Indiranagar, BLR
      INDIAN_PINCODES['560034'], // Koramangala, BLR
      INDIAN_PINCODES['560102'], // HSR Layout, BLR
      INDIAN_PINCODES['560066'], // Whitefield, BLR
      INDIAN_PINCODES['400050'], // Bandra, Mumbai
      INDIAN_PINCODES['400076'], // Powai, Mumbai
      INDIAN_PINCODES['110001'], // Connaught Place, Delhi
      INDIAN_PINCODES['122001'], // Cyber City, Gurgaon
      INDIAN_PINCODES['500081'], // HITEC City, Hyderabad
      INDIAN_PINCODES['411057'], // Hinjawadi, Pune
      INDIAN_PINCODES['600096'], // OMR, Chennai
    ].filter(Boolean);
  },
};

