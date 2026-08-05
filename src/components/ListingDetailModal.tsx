import React, { useState } from 'react';
import {
  X,
  Star,
  MapPin,
  Users,
  Bed,
  Bath,
  CheckCircle2,
  Calendar,
  MessageSquare,
  Phone,
  Send,
  Sparkles,
  Info,
  ShieldCheck,
  Video,
  ExternalLink,
  ChevronRight,
  ChevronLeft,
  CreditCard,
  Building2
} from 'lucide-react';
import { PropertyMap } from './PropertyMap';
import { Listing, Review } from '../types';
import { translations, Language } from '../i18n/translations';

interface ListingDetailModalProps {
  listing: Listing;
  reviews: Review[];
  lang: Language;
  currency: 'USD' | 'KES';
  usdToKesRate: number;
  onClose: () => void;
  onEditListing?: (listing: Listing) => void;
  onSubmitBookingRequest: (bookingData: {
    listingId: string;
    guestName: string;
    guestEmail: string;
    guestPhone: string;
    checkIn: string;
    checkOut: string;
    guests: number;
    notes: string;
    referralCode: string;
    paymentOption: 'pay_before_arrival' | 'pay_upon_arrival';
  }) => void;
  onSubmitReview: (reviewData: {
    listingId: string;
    guestName: string;
    rating: number;
    comment: string;
  }) => void;
}

export const ListingDetailModal: React.FC<ListingDetailModalProps> = ({
  listing,
  reviews,
  lang,
  currency,
  usdToKesRate,
  onClose,
  onEditListing,
  onSubmitBookingRequest,
  onSubmitReview
}) => {
  const t = translations[lang];

  // Gallery state
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);
  const [selectedRoomFilter, setSelectedRoomFilter] = useState<string>('All');
  const [activeVideoShotIndex, setActiveVideoShotIndex] = useState(0);

  // Booking Form State
  const [checkIn, setCheckIn] = useState('2026-08-10');
  const [checkOut, setCheckOut] = useState('2026-08-13');
  const [guests, setGuests] = useState(2);
  const [guestName, setGuestName] = useState('Wanjiku Kimani');
  const [guestEmail, setGuestEmail] = useState('wanjiku.kimani@example.com');
  const [guestPhone, setGuestPhone] = useState('+254712345678');
  const [notes, setNotes] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [paymentOption, setPaymentOption] = useState<'pay_before_arrival' | 'pay_upon_arrival'>('pay_before_arrival');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedMessage, setSubmittedMessage] = useState<string | null>(null);

  // Review Form state
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [reviewerName, setReviewerName] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);

  // Calculate nights
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const nights = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;

  const subtotal = listing.nightlyPrice * nights;
  const cleaningFee = listing.cleaningFee;
  const serviceFee = 0;
  const discount = referralCode.trim() !== '' ? 2500 : 0;
  const totalKES = Math.max(0, subtotal + cleaningFee + serviceFee - discount);

  const displayTotal = `KSh ${totalKES.toLocaleString()}`;

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    onSubmitBookingRequest({
      listingId: listing.id,
      guestName,
      guestEmail,
      guestPhone,
      checkIn,
      checkOut,
      guests,
      notes,
      referralCode,
      paymentOption
    });

    setIsSubmitting(false);
    if (paymentOption === 'pay_upon_arrival') {
      setSubmittedMessage(
        `Booking confirmed! You selected Pay Upon Arrival at ${listing.title}. Please prepare KSh ${totalKES.toLocaleString()} in Cash or M-Pesa at check-in.`
      );
    } else {
      setSubmittedMessage(
        `Booking created! Proceeding to M-Pesa / Card payment checkout for KSh ${totalKES.toLocaleString()}.`
      );
    }
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setReviewSubmitting(true);

    onSubmitReview({
      listingId: listing.id,
      guestName: reviewerName || 'Guest Traveler',
      rating: newRating,
      comment: newComment
    });

    setReviewSubmitting(false);
    setNewComment('');
    setReviewerName('');
  };

  // WhatsApp Host Direct Message Link
  let cleanHostNumber = (listing.hostPhone || '0729110857').replace(/[^0-9]/g, '');
  if (cleanHostNumber.startsWith('0')) {
    cleanHostNumber = '254' + cleanHostNumber.slice(1);
  }
  const whatsappMessage = encodeURIComponent(
    `Hello ${listing.hostName}, I am inquiring about staying at '${listing.title}' in ${listing.city}, Thika, Kenya.`
  );
  const whatsappUrl = `https://wa.me/${cleanHostNumber}?text=${whatsappMessage}`;

  // Structured Data Schema.org
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "VacationRental",
    "name": listing.title,
    "description": listing.description,
    "image": listing.photos,
    "address": {
      "@type": "PostalAddress",
      "streetAddress": listing.address,
      "addressLocality": listing.city,
      "addressRegion": listing.region || "Thika",
      "addressCountry": "KE"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": listing.lat,
      "longitude": listing.lng
    },
    "starRating": {
      "@type": "Rating",
      "ratingValue": listing.rating,
      "bestRating": "5"
    },
    "priceRange": `KSh ${listing.nightlyPrice.toLocaleString()} per night`,
    "numberOfBedrooms": listing.bedrooms,
    "numberOfBathroomsTotal": listing.baths,
    "occupancy": {
      "@type": "QuantitativeValue",
      "value": listing.maxGuests
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/80 backdrop-blur-md flex justify-center p-2 sm:p-4 lg:p-6 animate-fade-in">
      
      {/* Inject Schema.org JSON-LD */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="relative bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 rounded-3xl max-w-5xl w-full my-auto shadow-2xl overflow-hidden border border-stone-200 dark:border-stone-800">
        
        {/* Sticky Modal Top Bar */}
        <div className="sticky top-0 z-20 bg-white/90 dark:bg-stone-900/90 backdrop-blur-md px-6 py-4 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-2 text-xs font-semibold text-amber-700 dark:text-amber-400">
              <MapPin className="w-3.5 h-3.5" />
              <span>{listing.city}, {listing.region}</span>
            </div>
            <h2 className="font-serif font-bold text-lg sm:text-xl line-clamp-1">{listing.title}</h2>
          </div>

          <div className="flex items-center space-x-2">
            {onEditListing && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onEditListing(listing);
                }}
                className="px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-extrabold text-xs flex items-center space-x-1.5 shadow-xl transition-all border border-amber-300 ring-2 ring-amber-500/40 cursor-pointer"
              >
                <span>Edit Listing</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-500 hover:text-stone-900 dark:hover:text-stone-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-8 max-h-[82vh] overflow-y-auto">
          
          {/* Main Photo Gallery & Room Pictures */}
          <div className="space-y-4">
            <div className="relative aspect-[16/9] rounded-2xl overflow-hidden bg-stone-100 dark:bg-stone-800 shadow-md group">
              <img
                src={listing.photos[selectedPhotoIndex] || listing.photos[0]}
                alt={listing.title}
                decoding="async"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80';
                }}
                className="w-full h-full object-cover transition-all duration-300"
              />

              {/* Room photo caption overlay if present */}
              {listing.roomPhotos && listing.roomPhotos[selectedPhotoIndex] && (
                <div className="absolute bottom-3 left-3 bg-stone-950/85 text-white px-3 py-1.5 rounded-xl text-xs backdrop-blur-md border border-stone-800 flex items-center space-x-2">
                  <span className="font-bold text-amber-400 uppercase tracking-wider text-[10px]">
                    {listing.roomPhotos[selectedPhotoIndex].roomType}
                  </span>
                  <span>•</span>
                  <span>{listing.roomPhotos[selectedPhotoIndex].caption}</span>
                </div>
              )}

              {listing.photos.length > 1 && (
                <>
                  <button
                    onClick={() =>
                      setSelectedPhotoIndex((prev) =>
                        prev === 0 ? listing.photos.length - 1 : prev - 1
                      )
                    }
                    className="absolute left-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-stone-900/70 hover:bg-stone-900 text-white backdrop-blur-md transition-all shadow"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() =>
                      setSelectedPhotoIndex((prev) =>
                        prev === listing.photos.length - 1 ? 0 : prev + 1
                      )
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-stone-900/70 hover:bg-stone-900 text-white backdrop-blur-md transition-all shadow"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>

            {/* Room Type Filters & Photo Thumbnails */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2 overflow-x-auto no-scrollbar pb-1 text-xs">
                {['All', 'Bedroom', 'Living Room', 'Outdoor', 'Pool', 'Kitchen', 'Bathroom'].map((roomType) => (
                  <button
                    key={roomType}
                    onClick={() => {
                      setSelectedRoomFilter(roomType);
                      if (listing.roomPhotos && roomType !== 'All') {
                        const matchIdx = listing.roomPhotos.findIndex((p) => p.roomType === roomType);
                        if (matchIdx !== -1) setSelectedPhotoIndex(matchIdx);
                      }
                    }}
                    className={`px-3 py-1 rounded-xl font-bold transition-all border whitespace-nowrap cursor-pointer ${
                      selectedRoomFilter === roomType
                        ? 'bg-amber-700 text-white border-amber-600 shadow'
                        : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 border-stone-200 dark:border-stone-700'
                    }`}
                  >
                    {roomType === 'All' ? '📷 All Photos' : `${roomType} Shots`}
                  </button>
                ))}
              </div>

              {/* Thumbnail Row */}
              {listing.photos.length > 1 && (
                <div className="flex items-center space-x-3 overflow-x-auto pb-2 no-scrollbar">
                  {listing.photos.map((photo, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedPhotoIndex(idx)}
                      className={`relative w-24 h-16 rounded-xl overflow-hidden flex-shrink-0 border-2 transition-all ${
                        selectedPhotoIndex === idx
                          ? 'border-amber-600 scale-105 shadow-md'
                          : 'border-transparent opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img
                        src={photo.includes('images.unsplash.com') ? `${photo}&auto=format&fit=crop&w=300&q=75` : photo}
                        alt=""
                        loading="lazy"
                        decoding="async"
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                      {listing.roomPhotos && listing.roomPhotos[idx] && (
                        <span className="absolute bottom-0 inset-x-0 bg-stone-950/80 text-amber-300 text-[8px] font-bold text-center py-0.5 truncate">
                          {listing.roomPhotos[idx].roomType}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Video Tour & Best Picture Angle Shots Section */}
            {listing.videoShots && listing.videoShots.length > 0 && (
              <div className="p-4 rounded-2xl bg-stone-900 text-white border border-stone-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Video className="w-5 h-5 text-amber-400" />
                    <h4 className="font-serif font-bold text-sm text-amber-300">
                      Video Shots & Best Picture Angles
                    </h4>
                  </div>
                  <span className="text-[10px] text-stone-400 uppercase font-bold tracking-wider">
                    {listing.videoShots.length} Video Clips Available
                  </span>
                </div>

                {/* Video Shot Player */}
                <div className="relative aspect-video rounded-xl overflow-hidden bg-stone-950 border border-stone-800">
                  <video
                    key={listing.videoShots[activeVideoShotIndex]?.videoUrl}
                    controls
                    autoPlay={false}
                    className="w-full h-full object-cover"
                    src={listing.videoShots[activeVideoShotIndex]?.videoUrl}
                  />
                  <div className="absolute top-2 left-2 bg-amber-500 text-stone-950 font-extrabold text-[10px] px-2.5 py-1 rounded-full shadow uppercase tracking-wider">
                    {listing.videoShots[activeVideoShotIndex]?.angleTag || 'Featured Angle'}
                  </div>
                </div>

                {/* Video Shot Angle Selector Buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                  {listing.videoShots.map((shot, sIdx) => (
                    <button
                      key={shot.id}
                      onClick={() => setActiveVideoShotIndex(sIdx)}
                      className={`p-2.5 rounded-xl text-left border text-xs transition-all flex flex-col justify-between ${
                        activeVideoShotIndex === sIdx
                          ? 'bg-amber-600/30 border-amber-500 text-amber-200'
                          : 'bg-stone-800/60 border-stone-700 hover:bg-stone-800 text-stone-300'
                      }`}
                    >
                      <span className="font-bold text-xs line-clamp-1">{shot.title}</span>
                      <span className="text-[10px] text-amber-400 font-mono mt-1">
                        🎬 {shot.angleTag} ({shot.duration || '0:20'})
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Grid Layout: Left Details, Right Booking Calculator */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Column - Details */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Hosted By Card with WhatsApp Button */}
              <div className="p-4 rounded-2xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/50 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <img
                    src={listing.hostAvatar || '/madam_ann_profile.jpg'}
                    alt={listing.hostName}
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/madam_ann_profile.jpg';
                    }}
                    className="w-12 h-12 rounded-full object-cover border-2 border-amber-500"
                  />
                  <div>
                    <h4 className="font-bold text-sm text-stone-900 dark:text-stone-100">
                      {t.hostInfo} {listing.hostName}
                    </h4>
                    <p className="text-xs text-amber-700 dark:text-amber-400 font-bold flex items-center space-x-1 mt-0.5">
                      <Phone className="w-3 h-3" />
                      <span>{listing.hostPhone || '0729110857'}</span>
                    </p>
                    <p className="text-xs text-stone-500 dark:text-stone-400">
                      {t.responseTime}: {listing.hostResponseTime} • Rating: {listing.hostRating} ★
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <a
                    href={`tel:${(listing.hostPhone || '0729110857').replace(/[^0-9+]/g, '')}`}
                    className="px-3 py-2 rounded-xl bg-amber-700 hover:bg-amber-800 text-white font-bold text-xs flex items-center space-x-1.5 shadow-sm transition-all"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Call Host</span>
                  </a>

                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center space-x-1.5 shadow-sm transition-all"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">WhatsApp</span>
                  </a>
                </div>
              </div>

              {/* Overview Specs */}
              <div className="grid grid-cols-3 gap-4 p-4 rounded-2xl bg-stone-100 dark:bg-stone-800 text-center">
                <div>
                  <Users className="w-5 h-5 mx-auto text-amber-600 dark:text-amber-400 mb-1" />
                  <span className="text-xs font-bold block">{listing.maxGuests} {listing.maxGuests === 1 ? 'Guest' : 'Guests'}</span>
                </div>
                <div>
                  <Bed className="w-5 h-5 mx-auto text-amber-600 dark:text-amber-400 mb-1" />
                  <span className="text-xs font-bold block">
                    {listing.bedrooms} {listing.bedrooms === 1 ? 'Bedroom' : 'Bedrooms'}
                    {listing.beds ? ` (${listing.beds} ${listing.beds === 1 ? 'Bed' : 'Beds'})` : ''}
                  </span>
                </div>
                <div>
                  <Bath className="w-5 h-5 mx-auto text-amber-600 dark:text-amber-400 mb-1" />
                  <span className="text-xs font-bold block">{listing.baths} {listing.baths === 1 ? 'Bathroom' : 'Bathrooms'}</span>
                </div>
              </div>

              {/* Video Tour Banner if present */}
              {listing.videoUrl && (
                <div className="p-4 rounded-2xl bg-stone-900 text-white flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Video className="w-6 h-6 text-amber-400" />
                    <div>
                      <h5 className="font-bold text-sm">Virtual Video Tour Available</h5>
                      <p className="text-xs text-stone-300">Watch full walkthrough of this Texas property.</p>
                    </div>
                  </div>
                  <a
                    href={listing.videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 bg-amber-500 text-stone-950 font-bold text-xs rounded-xl flex items-center space-x-1 hover:bg-amber-400 transition-colors"
                  >
                    <span>Watch Video</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}

              {/* Description */}
              <div className="space-y-2">
                <h3 className="font-serif font-bold text-lg">About this Thika Stay</h3>
                <p className="text-sm text-stone-600 dark:text-stone-300 leading-relaxed font-light">
                  {listing.description}
                </p>
              </div>

              {/* Property Map Location Component */}
              <PropertyMap singleListing={listing} height="320px" />

              {/* Amenities Grid */}
              <div className="space-y-3">
                <h3 className="font-serif font-bold text-lg">{t.amenities}</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {listing.amenities.map((amenity, idx) => (
                    <div
                      key={idx}
                      className="flex items-center space-x-2 text-xs font-medium p-2.5 rounded-xl bg-stone-50 dark:bg-stone-800/70 border border-stone-200/60 dark:border-stone-800"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                      <span>{amenity}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Platform Cancellation Policy Note */}
              <div className="p-4 rounded-2xl bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 space-y-1.5">
                <div className="flex items-center space-x-2 font-bold text-xs text-amber-800 dark:text-amber-400">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Platform-Wide Cancellation Policy</span>
                </div>
                <p className="text-xs text-stone-600 dark:text-stone-300">
                  {t.cancellationRule}
                </p>
              </div>

            </div>

            {/* Right Column - Booking Request Calculator */}
            <div className="lg:col-span-1">
              <div className="sticky top-20 bg-stone-50 dark:bg-stone-800/90 border border-stone-200 dark:border-stone-700 rounded-3xl p-5 shadow-xl space-y-4">
                
                {/* Price Header */}
                <div className="flex items-baseline justify-between border-b border-stone-200 dark:border-stone-700 pb-3">
                  <div>
                    <span className="text-2xl font-bold font-serif">{displayTotal}</span>
                    <span className="text-xs text-stone-500 dark:text-stone-400 block font-normal">
                      for {nights} {nights === 1 ? 'night' : 'nights'}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-amber-700 dark:text-amber-400 block">Host Approval</span>
                    <span className="text-[10px] text-stone-400">No charge until approved</span>
                  </div>
                </div>

                {submittedMessage ? (
                  <div className="p-4 rounded-2xl bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-300 text-emerald-900 dark:text-emerald-200 text-xs space-y-2">
                    <div className="font-bold flex items-center space-x-1">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Request Submitted</span>
                    </div>
                    <p>{submittedMessage}</p>
                    <button
                      onClick={() => setSubmittedMessage(null)}
                      className="mt-2 text-xs text-emerald-800 dark:text-emerald-300 font-bold underline"
                    >
                      Submit another request
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleBookingSubmit} className="space-y-3">
                    
                    {/* Dates */}
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <label className="block text-[10px] font-bold uppercase text-stone-500 mb-1">{t.checkIn}</label>
                        <input
                          type="date"
                          value={checkIn}
                          onChange={(e) => setCheckIn(e.target.value)}
                          className="w-full p-2 rounded-xl bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 text-xs"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase text-stone-500 mb-1">{t.checkOut}</label>
                        <input
                          type="date"
                          value={checkOut}
                          onChange={(e) => setCheckOut(e.target.value)}
                          className="w-full p-2 rounded-xl bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 text-xs"
                          required
                        />
                      </div>
                    </div>

                    {/* Guests */}
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-stone-500 mb-1">{t.guests}</label>
                      <select
                        value={guests}
                        onChange={(e) => setGuests(Number(e.target.value))}
                        className="w-full p-2 rounded-xl bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 text-xs font-medium"
                      >
                        {Array.from({ length: listing.maxGuests }, (_, i) => i + 1).map((n) => (
                          <option key={n} value={n}>{n} {n === 1 ? 'Guest' : 'Guests'}</option>
                        ))}
                      </select>
                    </div>

                    {/* Guest Contact details */}
                    <div className="space-y-2 pt-2 border-t border-stone-200 dark:border-stone-700">
                      <div>
                        <label className="block text-[10px] font-bold uppercase text-stone-500 mb-1">Guest Full Name</label>
                        <input
                          type="text"
                          value={guestName}
                          onChange={(e) => setGuestName(e.target.value)}
                          className="w-full p-2 rounded-xl bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 text-xs"
                          required
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[10px] font-bold uppercase text-stone-500 mb-1">Email</label>
                          <input
                            type="email"
                            value={guestEmail}
                            onChange={(e) => setGuestEmail(e.target.value)}
                            className="w-full p-2 rounded-xl bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 text-xs"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold uppercase text-stone-500 mb-1">Phone (SMS OTP)</label>
                          <input
                            type="tel"
                            value={guestPhone}
                            onChange={(e) => setGuestPhone(e.target.value)}
                            className="w-full p-2 rounded-xl bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 text-xs font-mono"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold uppercase text-stone-500 mb-1">Referral Promo Code</label>
                        <input
                          type="text"
                          placeholder="e.g. WANJIKU25"
                          value={referralCode}
                          onChange={(e) => setReferralCode(e.target.value)}
                          className="w-full p-2 rounded-xl bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 text-xs font-mono uppercase"
                        />
                      </div>

                      {/* Payment Option Selection */}
                      <div className="pt-2">
                        <label className="block text-[10px] font-bold uppercase text-stone-500 mb-1.5">
                          Payment Option
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => setPaymentOption('pay_before_arrival')}
                            className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                              paymentOption === 'pay_before_arrival'
                                ? 'border-amber-600 bg-amber-50 dark:bg-amber-950/60 ring-2 ring-amber-500/30'
                                : 'border-stone-200 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-800'
                            }`}
                          >
                            <div className="flex items-center space-x-1.5 text-xs font-bold text-amber-900 dark:text-amber-200">
                              <CreditCard className="w-3.5 h-3.5 text-amber-600" />
                              <span>Pay Before Arrival</span>
                            </div>
                            <p className="text-[10px] text-stone-500 dark:text-stone-400 mt-0.5">
                              M-Pesa / Bank / Card
                            </p>
                          </button>

                          <button
                            type="button"
                            onClick={() => setPaymentOption('pay_upon_arrival')}
                            className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                              paymentOption === 'pay_upon_arrival'
                                ? 'border-amber-600 bg-amber-50 dark:bg-amber-950/60 ring-2 ring-amber-500/30'
                                : 'border-stone-200 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-800'
                            }`}
                          >
                            <div className="flex items-center space-x-1.5 text-xs font-bold text-amber-900 dark:text-amber-200">
                              <Building2 className="w-3.5 h-3.5 text-amber-600" />
                              <span>Pay Upon Arrival</span>
                            </div>
                            <p className="text-[10px] text-stone-500 dark:text-stone-400 mt-0.5">
                              Pay at check-in (Cash/M-Pesa)
                            </p>
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Cost Breakdown */}
                    <div className="space-y-1.5 text-xs text-stone-600 dark:text-stone-400 pt-2 border-t border-stone-200 dark:border-stone-700">
                      <div className="flex justify-between">
                        <span>KSh {listing.nightlyPrice.toLocaleString()} x {nights} nights</span>
                        <span>KSh {subtotal.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Cleaning fee</span>
                        <span>KSh {cleaningFee.toLocaleString()}</span>
                      </div>
                      {discount > 0 && (
                        <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-bold">
                          <span>Referral Credit</span>
                          <span>-KSh {discount.toLocaleString()}</span>
                        </div>
                      )}
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-3.5 rounded-2xl bg-amber-700 hover:bg-amber-800 dark:bg-amber-600 dark:hover:bg-amber-500 text-white font-bold text-sm shadow-lg transition-all cursor-pointer flex items-center justify-center space-x-2"
                    >
                      {isSubmitting ? (
                        <span>Processing...</span>
                      ) : paymentOption === 'pay_before_arrival' ? (
                        <>
                          <CreditCard className="w-4 h-4" />
                          <span>Proceed to Payment ({displayTotal})</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Book & Pay Upon Arrival ({displayTotal})</span>
                        </>
                      )}
                    </button>

                    <p className="text-[11px] text-center text-stone-500 dark:text-stone-400">
                      {t.instantApprovalHelp}
                    </p>

                  </form>
                )}

              </div>
            </div>

          </div>

          {/* Reviews Section */}
          <div className="pt-8 border-t border-stone-200 dark:border-stone-800 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="font-serif font-bold text-xl flex items-center space-x-2">
                <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                <span>{typeof listing.rating === 'number' ? listing.rating.toFixed(2) : '5.00'} • {reviews.length} Guest Reviews</span>
              </h3>
            </div>

            {/* Existing Reviews List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {reviews.map((rev) => (
                <div
                  key={rev.id}
                  className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/50 border border-stone-200/60 dark:border-stone-800 space-y-2"
                >
                  <div className="flex items-center space-x-3">
                    <img
                      src={rev.guestAvatar}
                      alt={rev.guestName}
                      referrerPolicy="no-referrer"
                      className="w-9 h-9 rounded-full object-cover"
                    />
                    <div>
                      <h5 className="font-bold text-xs">{rev.guestName}</h5>
                      <span className="text-[10px] text-stone-400">{rev.date}</span>
                    </div>
                  </div>
                  <p className="text-xs text-stone-600 dark:text-stone-300 italic">
                    "{rev.comment}"
                  </p>
                </div>
              ))}
            </div>

            {/* Leave a Review Form */}
            <form onSubmit={handleReviewSubmit} className="p-5 rounded-2xl bg-stone-100 dark:bg-stone-800/80 space-y-3">
              <h4 className="font-bold text-sm">Have you stayed here? Leave a Review</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Your Name"
                  value={reviewerName}
                  onChange={(e) => setReviewerName(e.target.value)}
                  className="p-2.5 rounded-xl bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 text-xs"
                  required
                />
                <select
                  value={newRating}
                  onChange={(e) => setNewRating(Number(e.target.value))}
                  className="p-2.5 rounded-xl bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 text-xs font-bold"
                >
                  <option value={5}>★★★★★ (5 Stars - Exceptional)</option>
                  <option value={4}>★★★★☆ (4 Stars - Very Good)</option>
                  <option value={3}>★★★☆☆ (3 Stars - Average)</option>
                </select>
              </div>

              <textarea
                placeholder="Share your stay experience..."
                rows={2}
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 text-xs"
                required
              />

              <button
                type="submit"
                disabled={reviewSubmitting}
                className="px-5 py-2 rounded-xl bg-stone-900 dark:bg-stone-100 text-stone-100 dark:text-stone-900 text-xs font-bold hover:opacity-90 transition-opacity"
              >
                Post Review
              </button>
            </form>

          </div>

        </div>

      </div>
    </div>
  );
};

export default ListingDetailModal;

