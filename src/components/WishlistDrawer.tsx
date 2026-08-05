import React from 'react';
import { X, Heart, MapPin, Trash2 } from 'lucide-react';
import { Listing } from '../types';
import { translations, Language } from '../i18n/translations';

interface WishlistDrawerProps {
  listings: Listing[];
  lang: Language;
  currency: 'USD' | 'KES';
  usdToKesRate: number;
  onClose: () => void;
  onSelectListing: (listing: Listing) => void;
  onRemoveFromWishlist: (listingId: string) => void;
}

export const WishlistDrawer: React.FC<WishlistDrawerProps> = ({
  listings,
  lang,
  currency,
  usdToKesRate,
  onClose,
  onSelectListing,
  onRemoveFromWishlist
}) => {
  const t = translations[lang];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-stone-950/80 backdrop-blur-md flex justify-end animate-fade-in">
      <div className="bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 w-full max-w-md h-full flex flex-col justify-between shadow-2xl border-l border-stone-200 dark:border-stone-800">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Heart className="w-5 h-5 fill-rose-500 text-rose-500" />
            <h3 className="font-serif font-bold text-lg">{t.wishlist} ({listings.length})</h3>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-500 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 flex-1 overflow-y-auto space-y-4">
          {listings.length === 0 ? (
            <div className="py-16 text-center space-y-2">
              <Heart className="w-12 h-12 text-stone-300 dark:text-stone-700 mx-auto stroke-1" />
              <p className="text-sm font-bold text-stone-600 dark:text-stone-400">No saved Texas stays yet.</p>
              <p className="text-xs text-stone-400">Click the heart icon on any stay to save it for later.</p>
            </div>
          ) : (
            listings.map((l) => (
              <div
                key={l.id}
                className="p-3 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-800 flex items-center justify-between group hover:shadow-md transition-all"
              >
                <div
                  onClick={() => onSelectListing(l)}
                  className="flex items-center space-x-3 cursor-pointer flex-1"
                >
                  <img
                    src={l.photos[0] ? (l.photos[0].includes('images.unsplash.com') ? `${l.photos[0]}&auto=format&fit=crop&w=200&q=75` : l.photos[0]) : ''}
                    alt={l.title}
                    loading="lazy"
                    decoding="async"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=200&q=75';
                    }}
                    className="w-16 h-16 rounded-xl object-cover flex-shrink-0"
                  />
                  <div>
                    <h4 className="font-bold text-xs line-clamp-1 group-hover:text-amber-700 dark:group-hover:text-amber-400 transition-colors">
                      {l.title}
                    </h4>
                    <p className="text-[11px] text-stone-500 flex items-center space-x-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-amber-500" />
                      <span>{l.city}, Kenya</span>
                    </p>
                    <span className="font-bold text-xs text-stone-900 dark:text-stone-100 block mt-1">
                      KSh {l.nightlyPrice.toLocaleString()}/night
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => onRemoveFromWishlist(l.id)}
                  className="p-2 rounded-xl text-stone-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                  title="Remove"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
};

export default WishlistDrawer;

