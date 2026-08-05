import React from 'react';
import { Star, MapPin, Users, Heart, Share2, Sparkles, Flame, Bed, Bath, Edit2 } from 'lucide-react';
import { Listing } from '../types';
import { translations, Language } from '../i18n/translations';

interface ListingCardProps {
  listing: Listing;
  lang: Language;
  currency: 'USD' | 'KES';
  usdToKesRate: number;
  isWishlisted: boolean;
  onToggleWishlist: (listingId: string) => void;
  onOpenDetail: (listing: Listing) => void;
  onOpenShare: (listing: Listing) => void;
  onEditListing?: (listing: Listing) => void;
}

export const ListingCard: React.FC<ListingCardProps> = ({
  listing,
  lang,
  currency,
  usdToKesRate,
  isWishlisted,
  onToggleWishlist,
  onOpenDetail,
  onOpenShare,
  onEditListing
}) => {
  const t = translations[lang];

  // Display price directly in Kenyan Shillings
  const priceDisplay = `KSh ${listing.nightlyPrice.toLocaleString()}`;

  // Deterministic urgency social proof
  const viewingCount = (listing.title.length % 4) + 2; // e.g. 2 to 5 viewers
  const bookedCount = (listing.title.length % 5) + 3; // e.g. 3 to 7 bookings

  return (
    <article
      itemScope
      itemType="https://schema.org/VacationRental"
      className="group bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl overflow-hidden hover:shadow-2xl transition-all duration-300 flex flex-col justify-between"
    >
      {/* Hidden Structured Data for Search Engine Crawlers */}
      <meta itemProp="name" content={listing.title} />
      <meta itemProp="description" content={listing.description} />
      <meta itemProp="image" content={listing.photos[0]} />
      <div itemProp="address" itemScope itemType="https://schema.org/PostalAddress" className="hidden">
        <span itemProp="streetAddress">{listing.address}</span>
        <span itemProp="addressLocality">{listing.city}</span>
        <span itemProp="addressRegion">{listing.region || 'Thika'}</span>
        <span itemProp="addressCountry">KE</span>
      </div>

      {/* Top Image Container with Accessible HTML Text Overlays */}
      <div className="relative aspect-[4/3] overflow-hidden bg-stone-100 dark:bg-stone-800">
        <img
          src={listing.photos[0] ? (listing.photos[0].includes('images.unsplash.com') ? `${listing.photos[0]}&auto=format&fit=crop&w=600&q=80` : listing.photos[0]) : ''}
          alt={listing.title}
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=600&q=80';
          }}
        />

        {/* Featured Tag or Unavailable Tag */}
        {listing.isAvailable === false ? (
          <span className="absolute top-3 left-3 bg-stone-900/90 text-rose-300 text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full shadow-md backdrop-blur-md border border-rose-500/40">
            Unavailable
          </span>
        ) : listing.isFeatured ? (
          <span className="absolute top-3 left-3 bg-amber-600/95 text-white text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full shadow-md backdrop-blur-md flex items-center space-x-1">
            <Sparkles className="w-3 h-3 text-amber-200" />
            <span>Featured Thika Stay</span>
          </span>
        ) : null}

        {/* Wishlist, Share & Admin Edit Action Buttons */}
        <div className="absolute top-3 right-3 flex items-center space-x-1.5">
          {onEditListing && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEditListing(listing);
              }}
              className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white font-extrabold text-xs rounded-full backdrop-blur-md transition-all shadow-xl cursor-pointer flex items-center space-x-1.5 border border-amber-300 ring-2 ring-amber-500/50"
              title="Full Edit Form (Admin)"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>Edit Listing</span>
            </button>
          )}

          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpenShare(listing);
            }}
            className="p-2 bg-stone-900/60 hover:bg-stone-900/90 text-white rounded-full backdrop-blur-md transition-all shadow cursor-pointer"
            title="Share listing"
          >
            <Share2 className="w-4 h-4" />
          </button>
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleWishlist(listing.id);
            }}
            className={`p-2 rounded-full backdrop-blur-md transition-all shadow cursor-pointer ${
              isWishlisted
                ? 'bg-rose-600 text-white scale-110'
                : 'bg-stone-900/60 hover:bg-stone-900/90 text-white'
            }`}
            title={isWishlisted ? t.removeFromWishlist : t.addToWishlist}
          >
            <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* Accessible Location Badge (Actual HTML Text Element) */}
        <address className="not-italic absolute bottom-3 left-3 bg-stone-950/85 text-stone-100 text-xs font-semibold px-3 py-1 rounded-full backdrop-blur-md flex items-center space-x-1 border border-stone-800">
          <MapPin className="w-3.5 h-3.5 text-amber-400" />
          <span>{listing.city}, Thika Kenya</span>
        </address>

        {/* Host Avatar Badge on Card Image */}
        <div className="absolute bottom-3 right-3 flex items-center space-x-1.5 bg-stone-950/90 text-stone-100 px-2.5 py-1 rounded-full backdrop-blur-md border border-amber-500/50 shadow-lg">
          <img
            src={listing.hostAvatar || '/madam_ann_profile.jpg'}
            alt={listing.hostName}
            referrerPolicy="no-referrer"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/madam_ann_profile.jpg';
            }}
            className="w-5 h-5 rounded-full object-cover ring-1 ring-amber-400"
          />
          <span className="text-[11px] font-bold text-amber-300">{listing.hostName}</span>
        </div>
      </div>

      {/* Content Details */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-2">
          
          {/* Rating, Review Count & Host Avatar */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <img
                src={listing.hostAvatar || '/madam_ann_profile.jpg'}
                alt={listing.hostName}
                referrerPolicy="no-referrer"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/madam_ann_profile.jpg';
                }}
                className="w-6 h-6 rounded-full object-cover border border-amber-500 shadow-sm"
                title={`Hosted by ${listing.hostName}`}
              />
              <div
                itemProp="aggregateRating"
                itemScope
                itemType="https://schema.org/AggregateRating"
                className="flex items-center space-x-1 text-xs font-bold text-stone-900 dark:text-stone-100"
              >
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span itemProp="ratingValue">{typeof listing.rating === 'number' ? listing.rating.toFixed(2) : '5.00'}</span>
                <span className="text-stone-400 font-normal">(<span itemProp="reviewCount">{listing.reviewCount ?? 0}</span> reviews)</span>
              </div>
            </div>
            
            <div className="text-xs text-stone-500 dark:text-stone-400 font-medium">
              {listing.region}
            </div>
          </div>

          {/* Title */}
          <h3
            onClick={() => onOpenDetail(listing)}
            className="font-serif font-bold text-lg text-stone-900 dark:text-stone-100 group-hover:text-amber-700 dark:group-hover:text-amber-400 transition-colors cursor-pointer line-clamp-1"
          >
            {listing.title}
          </h3>

          {/* Specs */}
          <div className="flex items-center space-x-3 text-xs text-stone-600 dark:text-stone-400 pt-1">
            <div className="flex items-center space-x-1">
              <Users className="w-3.5 h-3.5 text-stone-400" />
              <span>{listing.maxGuests} {listing.maxGuests === 1 ? 'guest' : 'guests'}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Bed className="w-3.5 h-3.5 text-stone-400" />
              <span>{listing.beds ?? listing.bedrooms} {(listing.beds ?? listing.bedrooms) === 1 ? 'bed' : 'beds'}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Bath className="w-3.5 h-3.5 text-stone-400" />
              <span>{listing.baths} {(listing.baths === 1) ? 'bath' : 'baths'}</span>
            </div>
          </div>

          {/* Amenities Pills Preview */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            {listing.amenities.slice(0, 3).map((amenity, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300"
              >
                {amenity}
              </span>
            ))}
            {listing.amenities.length > 3 && (
              <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-stone-100 dark:bg-stone-800 text-stone-500">
                +{listing.amenities.length - 3} more
              </span>
            )}
          </div>
        </div>

        {/* Social Proof Urgency Signal */}
        <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/60 dark:border-amber-800/60 text-[11px] font-medium text-amber-900 dark:text-amber-200">
          <Flame className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 animate-bounce" />
          <span>
            <strong className="font-bold">{viewingCount} guests</strong> viewing this stay in Thika right now
          </span>
        </div>

        {/* Price & Action */}
        <div className="pt-3 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between">
          <div itemProp="offers" itemScope itemType="https://schema.org/Offer">
            <meta itemProp="priceCurrency" content="KES" />
            <meta itemProp="price" content={String(listing.nightlyPrice)} />
            <div className="flex items-baseline space-x-1">
              <span className="font-bold text-xl text-stone-900 dark:text-stone-100">{priceDisplay}</span>
              <span className="text-xs text-stone-500 dark:text-stone-400">/{t.nightlyPrice}</span>
            </div>
          </div>

          <button
            onClick={() => onOpenDetail(listing)}
            className="px-4 py-2.5 rounded-xl bg-amber-700 hover:bg-amber-800 dark:bg-amber-600 dark:hover:bg-amber-500 text-white text-xs font-bold shadow-md hover:shadow-lg transition-all cursor-pointer"
          >
            {t.requestBooking}
          </button>
        </div>

      </div>

    </article>
  );
};

export default ListingCard;

