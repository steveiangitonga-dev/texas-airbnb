import React, { useState } from 'react';
import { APIProvider, Map, AdvancedMarker, Pin, InfoWindow } from '@vis.gl/react-google-maps';
import { MapPin, Navigation, ExternalLink, Key, Compass } from 'lucide-react';
import { Listing } from '../types';

const API_KEY =
  process.env.GOOGLE_MAPS_PLATFORM_KEY ||
  (import.meta as any).env?.VITE_GOOGLE_MAPS_PLATFORM_KEY ||
  (globalThis as any).GOOGLE_MAPS_PLATFORM_KEY ||
  '';

const hasValidKey = Boolean(API_KEY) && API_KEY !== 'YOUR_API_KEY';

interface PropertyMapProps {
  listings?: Listing[];
  singleListing?: Listing;
  height?: string;
  onSelectListing?: (listing: Listing) => void;
}

export const PropertyMap: React.FC<PropertyMapProps> = ({
  listings = [],
  singleListing,
  height = '360px',
  onSelectListing
}) => {
  const [selectedListing, setSelectedListing] = useState<Listing | null>(singleListing || null);

  // Default center: Thika Town Centre, Kenya (-1.0333, 37.0693)
  const defaultCenter = singleListing
    ? { lat: singleListing.lat, lng: singleListing.lng }
    : listings.length > 0
    ? { lat: listings[0].lat, lng: listings[0].lng }
    : { lat: -1.0333, lng: 37.0693 };

  const mapListings = singleListing ? [singleListing] : listings;

  return (
    <div className="space-y-3">
      {/* Location Header Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <MapPin className="w-5 h-5 text-amber-500" />
          <h3 className="font-serif font-bold text-lg text-stone-900 dark:text-stone-100">
            {singleListing ? `Location & Map: ${singleListing.city}, Thika Town` : 'Interactive Thika Stays Map'}
          </h3>
        </div>
        
        {singleListing && (
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${singleListing.lat},${singleListing.lng}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-bold text-amber-700 dark:text-amber-400 hover:underline flex items-center space-x-1"
          >
            <span>Open in Google Maps</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        )}
      </div>

      {/* Map Container */}
      <div
        style={{ height }}
        className="relative w-full rounded-2xl overflow-hidden border border-stone-200 dark:border-stone-800 shadow-lg bg-stone-100 dark:bg-stone-900"
      >
        {hasValidKey ? (
          <APIProvider apiKey={API_KEY} version="weekly">
            <Map
              defaultCenter={defaultCenter}
              defaultZoom={singleListing ? 14 : 12}
              mapId="DEMO_MAP_ID"
              internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
              style={{ width: '100%', height: '100%' }}
            >
              {mapListings.map((l) => (
                <AdvancedMarker
                  key={l.id}
                  position={{ lat: l.lat, lng: l.lng }}
                  title={l.title}
                  onClick={() => {
                    setSelectedListing(l);
                    if (onSelectListing) onSelectListing(l);
                  }}
                >
                  <Pin background="#f59e0b" glyphColor="#0c0a09" borderColor="#78350f" />
                </AdvancedMarker>
              ))}

              {selectedListing && (
                <InfoWindow
                  position={{ lat: selectedListing.lat, lng: selectedListing.lng }}
                  onCloseClick={() => setSelectedListing(null)}
                >
                  <div className="p-2 max-w-xs space-y-1 text-stone-900">
                    <img
                      src={selectedListing.photos[0] ? (selectedListing.photos[0].includes('images.unsplash.com') ? `${selectedListing.photos[0]}&auto=format&fit=crop&w=300&q=75` : selectedListing.photos[0]) : ''}
                      alt={selectedListing.title}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-20 object-cover rounded-lg"
                    />
                    <h4 className="font-serif font-bold text-xs">{selectedListing.title}</h4>
                    <p className="text-[11px] text-stone-600">{selectedListing.address}</p>
                    <p className="font-extrabold text-amber-700 text-xs">
                      KSh {selectedListing.nightlyPrice.toLocaleString()} / night
                    </p>
                  </div>
                </InfoWindow>
              )}
            </Map>
          </APIProvider>
        ) : (
          /* Fallback Map Embed / Interactive Location Representation when GOOGLE_MAPS_PLATFORM_KEY is pending */
          <div className="relative w-full h-full flex flex-col items-center justify-center p-6 text-center space-y-4 bg-stone-900 text-stone-100 overflow-hidden">
            {/* Embedded OpenStreetMap / Google Map iframe fallback */}
            <iframe
              title="Thika Kenya Map View"
              width="100%"
              height="100%"
              style={{ border: 0, position: 'absolute', inset: 0, opacity: 0.7 }}
              loading="lazy"
              allowFullScreen
              src={`https://maps.google.com/maps?q=${singleListing ? `${singleListing.lat},${singleListing.lng}` : '-1.0333,37.0693'}&z=${singleListing ? 15 : 13}&output=embed`}
            />

            {/* Glassmorphism Info Overlay */}
            <div className="relative z-10 max-w-md bg-stone-950/85 backdrop-blur-md p-4 rounded-2xl border border-stone-800 shadow-2xl space-y-2">
              <div className="inline-flex items-center space-x-1.5 text-amber-400 text-xs font-bold uppercase tracking-wider">
                <Compass className="w-4 h-4 text-amber-400" />
                <span>Thika Town, Kiambu County, Kenya</span>
              </div>
              <h4 className="font-serif font-bold text-sm text-stone-100">
                {singleListing ? singleListing.address : 'Texas Luxury Airbnbs • Thika Locations'}
              </h4>
              <p className="text-[11px] text-stone-300 font-light">
                {singleListing
                  ? `Located at coordinates ${singleListing.lat}, ${singleListing.lng} in ${singleListing.city}, Thika.`
                  : `Explore our properties situated in Section 9, Thika Town Centre, Cravers Area, Landless & Chania Falls, Kenya.`}
              </p>

              <div className="pt-2 border-t border-stone-800 flex items-center justify-between text-[11px]">
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${singleListing ? `${singleListing.lat},${singleListing.lng}` : '-1.0333,37.0693'}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold flex items-center space-x-1 transition-colors"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>Get Directions</span>
                </a>

                <span className="text-[10px] text-stone-400 font-mono flex items-center space-x-1">
                  <Key className="w-3 h-3 text-stone-400" />
                  <span>Google Maps SDK Ready</span>
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
