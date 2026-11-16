import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Link } from 'react-router-dom';
import { Listing } from '../../types';

interface HyperlocalMapProps {
  center: [number, number];
  radiusKm: number;
  listings: Listing[];
  onSelectListing?: (listing: Listing) => void;
}

// Custom DivIcons for crisp SVG rendering without external image dependencies
const createListingIcon = (price: number) => {
  const formattedPrice = `₹${price >= 1000 ? `${(price / 1000).toFixed(price % 1000 === 0 ? 0 : 1)}k` : price}`;
  return L.divIcon({
    className: 'custom-map-pin',
    html: `
      <div style="background-color: #0f2744; color: #ffffff; padding: 4px 8px; border-radius: 9999px; font-weight: 800; font-size: 11px; box-shadow: 0 4px 12px rgba(15, 39, 68, 0.35); border: 2px solid #ffffff; white-space: nowrap; transform: translate(-50%, -100%);">
        ${formattedPrice}
      </div>
    `,
    iconSize: [40, 20],
    iconAnchor: [20, 0],
  });
};

const userCenterIcon = L.divIcon({
  className: 'user-center-pin',
  html: `
    <div style="position: relative; width: 20px; height: 20px; background-color: #0d9488; border-radius: 9999px; border: 3px solid #ffffff; box-shadow: 0 2px 8px rgba(0,0,0,0.3); transform: translate(-50%, -50%);">
      <div style="position: absolute; inset: -6px; border-radius: 9999px; background-color: rgba(13, 148, 136, 0.3); animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
    </div>
  `,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

function MapRecenter({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
}

export const HyperlocalMap: React.FC<HyperlocalMapProps> = ({
  center,
  radiusKm,
  listings,
  onSelectListing,
}) => {
  return (
    <div className="w-full h-full min-h-[450px] rounded-2xl overflow-hidden border border-slate-200 shadow-sm relative z-0">
      <MapContainer
        center={center}
        zoom={12}
        scrollWheelZoom={false}
        className="w-full h-full"
        style={{ minHeight: '450px', zIndex: 1 }}
      >
        <MapRecenter center={center} />

        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* User Search Center Marker */}
        <Marker position={center} icon={userCenterIcon}>
          <Popup>
            <div className="text-xs font-semibold p-1">
              Your Search Center
              <br />
              <span className="text-slate-500 font-normal">Scanning {radiusKm} km radius</span>
            </div>
          </Popup>
        </Marker>

        {/* Radius Circle */}
        <Circle
          center={center}
          radius={radiusKm * 1000}
          pathOptions={{
            color: '#0d9488',
            fillColor: '#0d9488',
            fillOpacity: 0.08,
            weight: 1.5,
            dashArray: '4, 6',
          }}
        />

        {/* Product Listing Markers */}
        {listings.map((listing) => {
          if (!listing.latitude || !listing.longitude) return null;
          const pos: [number, number] = [listing.latitude, listing.longitude];
          const primaryImg =
            listing.images?.find((i) => i.is_primary)?.image_url ||
            listing.images?.[0]?.image_url ||
            'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?auto=format&fit=crop&w=300&q=80';

          return (
            <Marker
              key={listing.id}
              position={pos}
              icon={createListingIcon(listing.price)}
              eventHandlers={{
                click: () => onSelectListing && onSelectListing(listing),
              }}
            >
              <Popup className="listing-popup">
                <div className="w-48 p-1">
                  <img
                    src={primaryImg}
                    alt={listing.title}
                    className="w-full h-24 object-cover rounded-lg mb-2"
                  />
                  <div className="text-sm font-extrabold text-slate-900 mb-0.5">
                    ₹{listing.price.toLocaleString('en-IN')}
                  </div>
                  <h4 className="text-xs font-semibold text-slate-800 line-clamp-1 mb-1">
                    {listing.title}
                  </h4>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 mb-2">
                    <span>{listing.locality}</span>
                    {listing.distance_km !== undefined && (
                      <span className="text-teal-600 font-bold">{listing.distance_km} km away</span>
                    )}
                  </div>
                  <Link
                    to={`/product/${listing.id}`}
                    className="block text-center w-full py-1.5 bg-brand-900 hover:bg-brand-800 text-white rounded-lg text-xs font-bold transition-colors"
                  >
                    View Details
                  </Link>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};

