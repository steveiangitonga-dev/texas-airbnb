import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { ListingCard } from './components/ListingCard';
import { ListingDetailModal } from './components/ListingDetailModal';
import { BookingPaymentModal } from './components/BookingPaymentModal';
import { AdminDashboard } from './components/AdminDashboard';
import { GuestBookingsModal } from './components/GuestBookingsModal';
import { WishlistDrawer } from './components/WishlistDrawer';
import { SocialShareModal } from './components/SocialShareModal';
import { ReferralModal } from './components/ReferralModal';
import { PropertyMap } from './components/PropertyMap';
import { Footer } from './components/Footer';
import { SEO } from './components/SEO';
import { SearchKeyboardModal } from './components/SearchKeyboardModal';
import { CustomSearchFiltersModal } from './components/CustomSearchFiltersModal';
import { SlidersHorizontal, X, RotateCcw } from 'lucide-react';

import {
  Listing,
  BookingRequest,
  Transaction,
  Review,
  PlatformSettings,
  NotificationLog,
  FilterState,
  BlogArticle,
  UserRole
} from './types';
import { Language } from './i18n/translations';

export default function App() {
  // Theme state (localStorage persistence)
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('tx_dark_mode') === 'true';
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      document.body.classList.add('bg-stone-950', 'text-stone-100');
      document.body.classList.remove('bg-stone-100', 'text-stone-900');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.add('bg-stone-100', 'text-stone-900');
      document.body.classList.remove('bg-stone-950', 'text-stone-100');
    }
    localStorage.setItem('tx_dark_mode', String(darkMode));
  }, [darkMode]);

  // App Configuration & Language State
  const [lang, setLang] = useState<Language>('en');
  const [currency, setCurrency] = useState<'USD' | 'KES'>('KES');
  const [role, setRole] = useState<UserRole>('guest');

  // Backend Data State
  const [listings, setListings] = useState<Listing[]>([]);
  const [bookings, setBookings] = useState<BookingRequest[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [notifications, setNotifications] = useState<NotificationLog[]>([]);
  const [blogs, setBlogs] = useState<BlogArticle[]>([]);
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);
  const [settings, setSettings] = useState<PlatformSettings>({
    cancellation7PlusRefund: 100,
    cancellation3To6Refund: 50,
    cancellationUnder3Refund: 0,
    referralCreditAmount: 2500,
    currencySymbol: 'KSh',
    defaultCurrency: 'KES',
    googleAnalyticsId: 'G-TEXASAIRBNBS',
    googleSearchConsoleVerification: 'google-site-verification=texas'
  });

  // Filter State
  const [filters, setFilters] = useState<FilterState>({
    city: 'all',
    checkIn: '2026-08-10',
    checkOut: '2026-08-13',
    guests: 2,
    minPrice: 0,
    maxPrice: 0,
    bedrooms: 0,
    amenities: [],
    searchQuery: '',
    sortBy: 'recommended',
    propertyType: 'all'
  });
  const [activeQuickTag, setActiveQuickTag] = useState<string>('all');

  // Modals & Drawers State
  const [selectedDetailListing, setSelectedDetailListing] = useState<Listing | null>(null);
  const [selectedShareListing, setSelectedShareListing] = useState<Listing | null>(null);
  const [activePaymentBooking, setActivePaymentBooking] = useState<BookingRequest | null>(null);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [adminListingToEdit, setAdminListingToEdit] = useState<Listing | null>(null);
  const [isMyBookingsOpen, setIsMyBookingsOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isReferralOpen, setIsReferralOpen] = useState(false);
  const [isKeyboardModalOpen, setIsKeyboardModalOpen] = useState(false);
  const [isCustomFiltersModalOpen, setIsCustomFiltersModalOpen] = useState(false);

  // Fetch initial data from backend API
  const fetchListings = async (overrideFilters?: Partial<FilterState>) => {
    try {
      const activeF = overrideFilters ? { ...filters, ...overrideFilters } : filters;
      const params = new URLSearchParams();
      if (activeF.city && activeF.city !== 'all') params.append('city', activeF.city);
      if (activeF.guests && activeF.guests > 1) params.append('guests', String(activeF.guests));
      if (activeF.minPrice && activeF.minPrice > 0) params.append('minPrice', String(activeF.minPrice));
      if (activeF.maxPrice && activeF.maxPrice > 0) params.append('maxPrice', String(activeF.maxPrice));
      if (activeF.bedrooms && activeF.bedrooms > 0) params.append('bedrooms', String(activeF.bedrooms));
      if (activeF.propertyType && activeF.propertyType !== 'all') params.append('propertyType', activeF.propertyType);
      if (activeF.amenities && activeF.amenities.length > 0) params.append('amenities', activeF.amenities.join(','));
      if (activeF.sortBy) params.append('sortBy', activeF.sortBy);
      if (activeF.searchQuery && activeF.searchQuery.trim()) params.append('search', activeF.searchQuery.trim());

      const res = await fetch(`/api/listings?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setListings(data);
      }
    } catch (err) {
      console.error("Error fetching listings:", err);
    }
  };

  const fetchAdminStats = async () => {
    try {
      const res = await fetch('/api/admin/stats');
      if (res.ok) {
        const data = await res.json();
        setTransactions(data.transactions || []);
        if (data.settings) setSettings(data.settings);
      }
    } catch (err) {
      console.error("Error fetching admin stats:", err);
    }
  };

  const fetchBookings = async (phoneSearch?: string) => {
    try {
      const url = phoneSearch ? `/api/bookings?phone=${encodeURIComponent(phoneSearch)}` : '/api/bookings';
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setBookings(data);
      }
    } catch (err) {
      console.error("Error fetching bookings:", err);
    }
  };

  const fetchWishlist = async () => {
    try {
      const res = await fetch('/api/wishlist/user-guest-1');
      if (res.ok) {
        const data = await res.json();
        setWishlistIds(data.listingIds || []);
      }
    } catch (err) {
      console.error("Error fetching wishlist:", err);
    }
  };

  const fetchBlogs = async () => {
    try {
      const res = await fetch('/api/blogs');
      if (res.ok) {
        const data = await res.json();
        setBlogs(data);
      }
    } catch (err) {
      console.error("Error fetching blogs:", err);
    }
  };

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/notifications');
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
      }
    } catch (err) {
      console.error("Error fetching notifications:", err);
    }
  };

  useEffect(() => {
    fetchListings();
    fetchBookings();
    fetchAdminStats();
    fetchWishlist();
    fetchBlogs();
    fetchNotifications();

    // Route check for /admin path
    const checkAdminPath = () => {
      if (window.location.pathname === '/admin' || window.location.hash === '#admin') {
        setIsAdminOpen(true);
      }
    };
    checkAdminPath();
    window.addEventListener('popstate', checkAdminPath);
    return () => window.removeEventListener('popstate', checkAdminPath);
  }, [
    filters.city,
    filters.guests,
    filters.searchQuery,
    filters.minPrice,
    filters.maxPrice,
    filters.bedrooms,
    filters.propertyType,
    filters.sortBy,
    filters.amenities
  ]);

  // Handlers
  const handleFilterChange = (updated: Partial<FilterState>) => {
    setFilters((prev) => ({ ...prev, ...updated }));
  };

  const handleResetFilters = () => {
    const resetState: FilterState = {
      city: 'all',
      checkIn: '2026-08-10',
      checkOut: '2026-08-13',
      guests: 1,
      minPrice: 0,
      maxPrice: 0,
      bedrooms: 0,
      amenities: [],
      searchQuery: '',
      sortBy: 'recommended',
      propertyType: 'all'
    };
    setFilters(resetState);
    setActiveQuickTag('all');
    fetchListings(resetState);
  };

  const handleSearchSubmit = (searchQ?: string) => {
    const queryToUse = searchQ !== undefined ? searchQ : filters.searchQuery;
    fetchListings(searchQ !== undefined ? { searchQuery: searchQ } : undefined);
    setTimeout(() => {
      const element = document.getElementById('listings-section');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  const handleSelectQuickTag = (tag: string) => {
    setActiveQuickTag(tag);
    if (tag === 'all') {
      setFilters((prev) => ({ ...prev, city: 'all', searchQuery: '' }));
    } else if (['Section 9', 'Thika Town Centre', 'Cravers Area', 'Landless', 'Chania Falls', 'Makongeni'].includes(tag)) {
      setFilters((prev) => ({ ...prev, city: tag, searchQuery: '' }));
    } else {
      setFilters((prev) => ({ ...prev, searchQuery: tag }));
    }
    handleSearchSubmit();
  };

  const handleToggleWishlist = async (listingId: string) => {
    try {
      const res = await fetch('/api/wishlist/user-guest-1', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listingId })
      });
      if (res.ok) {
        const data = await res.json();
        setWishlistIds(data.listingIds || []);
      }
    } catch (err) {
      console.error("Wishlist toggle error:", err);
    }
  };

  const handleOpenDetailModal = async (listing: Listing) => {
    try {
      const res = await fetch(`/api/listings/${listing.id}`);
      if (res.ok) {
        const data = await res.json();
        setSelectedDetailListing(data.listing);
        setReviews(data.reviews || []);
      } else {
        setSelectedDetailListing(listing);
      }
    } catch (err) {
      setSelectedDetailListing(listing);
    }
  };

  const handleSubmitBookingRequest = async (bookingData: {
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
  }) => {
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingData)
      });
      if (res.ok) {
        const createdBooking: BookingRequest = await res.json();
        await fetchBookings();
        await fetchNotifications();

        if (bookingData.paymentOption === 'pay_before_arrival') {
          // Immediately proceed to payment checkout!
          setActivePaymentBooking(createdBooking);
        } else {
          // Show My Bookings modal with confirmed reservation
          setIsMyBookingsOpen(true);
        }
      }
    } catch (err) {
      console.error("Booking submission error:", err);
    }
  };

  const handleUpdateBookingStatus = async (bookingId: string, status: 'approved' | 'declined') => {
    try {
      const res = await fetch(`/api/bookings/${bookingId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        await fetchBookings();
        await fetchNotifications();
      }
    } catch (err) {
      console.error("Status update error:", err);
    }
  };

  const handlePayMpesa = async (bookingId: string, phone: string) => {
    const res = await fetch('/api/payments/stk-push', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookingId, phone })
    });
    if (res.ok) {
      await fetchBookings();
      await fetchAdminStats();
      await fetchNotifications();
    }
  };

  const handlePayAggregator = async (
    bookingId: string,
    bankName: string,
    provider: 'pesapal' | 'flutterwave'
  ) => {
    const res = await fetch('/api/payments/aggregator', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookingId, bankName, provider })
    });
    if (res.ok) {
      await fetchBookings();
      await fetchAdminStats();
      await fetchNotifications();
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    const res = await fetch(`/api/bookings/${bookingId}/cancel`, {
      method: 'POST'
    });
    if (res.ok) {
      await fetchBookings();
      await fetchNotifications();
    }
  };

  const handleSaveSettings = async (updatedSettings: Partial<PlatformSettings>) => {
    const res = await fetch('/api/admin/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedSettings)
    });
    if (res.ok) {
      const data = await res.json();
      setSettings(data);
    }
  };

  const handleAddListing = async (listingData: Partial<Listing>) => {
    const res = await fetch('/api/listings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(listingData)
    });
    if (res.ok) {
      await fetchListings();
    } else {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || `Failed to create listing (HTTP ${res.status})`);
    }
  };

  const handleUpdateListing = async (id: string, listingData: Partial<Listing>) => {
    const res = await fetch(`/api/listings/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(listingData)
    });
    if (res.ok) {
      await fetchListings();
      if (selectedDetailListing?.id === id) {
        const updatedRes = await fetch(`/api/listings/${id}`);
        if (updatedRes.ok) {
          const data = await updatedRes.json();
          setSelectedDetailListing(data.listing);
        }
      }
    } else {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || `Failed to update listing (HTTP ${res.status})`);
    }
  };

  const handleDeleteListing = async (id: string) => {
    const res = await fetch(`/api/listings/${id}`, {
      method: 'DELETE'
    });
    if (res.ok) {
      if (selectedDetailListing?.id === id) {
        setSelectedDetailListing(null);
      }
      await fetchListings();
    }
  };

  const handleAddBlog = async (blogData: Partial<BlogArticle>) => {
    const res = await fetch('/api/admin/blogs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(blogData)
    });
    if (res.ok) {
      await fetchBlogs();
    }
  };

  const handleDeleteBlog = async (id: string) => {
    const res = await fetch(`/api/admin/blogs/${id}`, {
      method: 'DELETE'
    });
    if (res.ok) {
      await fetchBlogs();
    }
  };

  const handleSubmitReview = async (reviewData: {
    listingId: string;
    guestName: string;
    rating: number;
    comment: string;
  }) => {
    const res = await fetch('/api/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reviewData)
    });
    if (res.ok) {
      const newRev = await res.json();
      setReviews((prev) => [newRev, ...prev]);
      await fetchListings();
    }
  };

  const pendingRequestsCount = bookings.filter((b) => b.status === 'pending').length;
  const wishlistedListings = listings.filter((l) => wishlistIds.includes(l.id));

  return (
    <div className="relative min-h-screen bg-stone-100 dark:bg-stone-950 text-stone-900 dark:text-stone-100 font-sans selection:bg-amber-500 selection:text-stone-950 transition-colors duration-200">
      {/* Global Fixed Background Image */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden opacity-20 dark:opacity-25 transition-opacity duration-700 ease-in-out">
        <img
          src="/madam_ann_profile.jpg"
          alt="Website Background"
          referrerPolicy="no-referrer"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1920&q=80';
          }}
          className="w-full h-full object-cover object-[center_25%] transition-all duration-700 ease-in-out"
        />
      </div>

      <div className="relative z-10">
        {/* Dynamic SEO Meta Tags, Canonical, OpenGraph, Twitter Cards & JSON-LD */}
        <SEO listing={selectedDetailListing} lang={lang} />

      {/* CMS Announcement Bar */}
      {settings.cmsContent?.announcementActive && settings.cmsContent?.announcementBar && (
        <div className="bg-gradient-to-r from-amber-700 via-amber-800 to-amber-900 text-white text-xs font-semibold py-2 px-4 text-center shadow-inner flex items-center justify-center space-x-2">
          <span>{settings.cmsContent.announcementBar}</span>
        </div>
      )}

      {/* Top Header Navigation */}
      <Header
        lang={lang}
        onLanguageToggle={() => setLang((prev) => (prev === 'en' ? 'sw' : 'en'))}
        currency={currency}
        onCurrencyToggle={() => setCurrency((prev) => (prev === 'USD' ? 'KES' : 'USD'))}
        darkMode={darkMode}
        onDarkModeToggle={() => setDarkMode(!darkMode)}
        role={role}
        onRoleToggle={(newRole) => {
          setRole(newRole);
          if (newRole === 'admin') setIsAdminOpen(true);
        }}
        wishlistCount={wishlistIds.length}
        onOpenWishlist={() => setIsWishlistOpen(true)}
        onOpenMyBookings={() => setIsMyBookingsOpen(true)}
        onOpenAdmin={() => setIsAdminOpen(true)}
        onOpenReferral={() => setIsReferralOpen(true)}
        pendingBookingsCount={pendingRequestsCount}
      />

      {/* Main Hero Section & Quick Filters */}
      <HeroSection
        lang={lang}
        filters={filters}
        onFilterChange={handleFilterChange}
        onSearchSubmit={() => handleSearchSubmit()}
        activeQuickTag={activeQuickTag}
        onSelectQuickTag={handleSelectQuickTag}
        cmsHeadline={settings.cmsContent?.heroHeadline}
        cmsSubheadline={settings.cmsContent?.heroSubheadline}
        onOpenKeyboardModal={() => setIsKeyboardModalOpen(true)}
        onOpenCustomFiltersModal={() => setIsCustomFiltersModalOpen(true)}
      />

      {/* Structured Data Schema.org ItemList JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ItemList",
            "name": "Texas Airbnbs - Luxury Vacation Stays in Thika, Kenya",
            "description": "Premium curated executive apartments, pool villas, and stargazing eco-domes in Thika Town, Kiambu County, Kenya.",
            "itemListElement": listings.map((l, index) => ({
              "@type": "ListItem",
              "position": index + 1,
              "item": {
                "@type": "VacationRental",
                "name": l.title,
                "description": l.description,
                "address": {
                  "@type": "PostalAddress",
                  "addressLocality": l.city,
                  "addressRegion": l.region || "Thika",
                  "addressCountry": "KE"
                },
                "geo": {
                  "@type": "GeoCoordinates",
                  "latitude": l.lat,
                  "longitude": l.lng
                },
                "priceRange": `KSh ${l.nightlyPrice.toLocaleString()} per night`
              }
            }))
          })
        }}
      />

      {/* Listings Grid & Interactive Thika Map */}
      <main id="listings-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
        
        {/* Active Custom Search Chips Bar */}
        {(filters.searchQuery ||
          (filters.city && filters.city !== 'all') ||
          filters.minPrice > 0 ||
          filters.maxPrice > 0 ||
          filters.bedrooms > 0 ||
          (filters.propertyType && filters.propertyType !== 'all') ||
          (filters.amenities && filters.amenities.length > 0)) && (
          <div className="flex flex-wrap items-center gap-2 p-3 rounded-2xl bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/20 text-xs">
            <span className="font-bold text-amber-700 dark:text-amber-400 text-[11px] uppercase tracking-wider">
              Active Filters:
            </span>

            {filters.searchQuery && (
              <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-800 dark:text-amber-200 font-medium">
                <span>"{filters.searchQuery}"</span>
                <button onClick={() => handleFilterChange({ searchQuery: '' })} className="hover:text-amber-950 dark:hover:text-white">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {filters.city && filters.city !== 'all' && (
              <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-800 dark:text-amber-200 font-medium">
                <span>Area: {filters.city}</span>
                <button onClick={() => handleFilterChange({ city: 'all' })} className="hover:text-amber-950 dark:hover:text-white">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {filters.minPrice > 0 && (
              <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-800 dark:text-amber-200 font-medium">
                <span>Min: KSh {filters.minPrice.toLocaleString()}</span>
                <button onClick={() => handleFilterChange({ minPrice: 0 })} className="hover:text-amber-950 dark:hover:text-white">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {filters.maxPrice > 0 && (
              <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-800 dark:text-amber-200 font-medium">
                <span>Max: KSh {filters.maxPrice.toLocaleString()}</span>
                <button onClick={() => handleFilterChange({ maxPrice: 0 })} className="hover:text-amber-950 dark:hover:text-white">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {filters.bedrooms > 0 && (
              <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-800 dark:text-amber-200 font-medium">
                <span>{filters.bedrooms}+ Beds</span>
                <button onClick={() => handleFilterChange({ bedrooms: 0 })} className="hover:text-amber-950 dark:hover:text-white">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {filters.propertyType && filters.propertyType !== 'all' && (
              <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-800 dark:text-amber-200 font-medium">
                <span>Type: {filters.propertyType}</span>
                <button onClick={() => handleFilterChange({ propertyType: 'all' })} className="hover:text-amber-950 dark:hover:text-white">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {filters.amenities && filters.amenities.map((a) => (
              <span key={a} className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-800 dark:text-amber-200 font-medium">
                <span>{a}</span>
                <button
                  onClick={() => handleFilterChange({ amenities: filters.amenities.filter((item) => item !== a) })}
                  className="hover:text-amber-950 dark:hover:text-white"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}

            <button
              onClick={handleResetFilters}
              className="ml-auto px-2.5 py-1 rounded-lg bg-stone-200 dark:bg-stone-800 hover:bg-stone-300 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 font-bold text-[11px] flex items-center space-x-1 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Search</span>
            </button>
          </div>
        )}

        {listings.length === 0 ? (
          <div className="py-16 text-center space-y-3 bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800">
            <p className="font-bold text-base text-stone-700 dark:text-stone-300">
              No stays match your search criteria.
            </p>
            <button
              onClick={() => handleSelectQuickTag('all')}
              className="px-4 py-2 rounded-xl bg-amber-700 text-white font-bold text-xs hover:bg-amber-800 transition-colors cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.map((listing) => (
              <ListingCard
                key={listing.id}
                listing={listing}
                lang={lang}
                currency={currency}
                usdToKesRate={1}
                isWishlisted={wishlistIds.includes(listing.id)}
                onToggleWishlist={handleToggleWishlist}
                onOpenDetail={handleOpenDetailModal}
                onOpenShare={(l) => setSelectedShareListing(l)}
              />
            ))}
          </div>
        )}

        {/* Interactive Google Map of Thika Stays - Displayed after listings */}
        <div className="pt-6">
          <PropertyMap listings={listings} height="380px" onSelectListing={handleOpenDetailModal} />
        </div>
      </main>

      {/* Footer */}
      <Footer
        lang={lang}
        onLanguageToggle={() => setLang((prev) => (prev === 'en' ? 'sw' : 'en'))}
        currency={currency}
        onCurrencyToggle={() => setCurrency((prev) => (prev === 'USD' ? 'KES' : 'USD'))}
        onSelectCityFilter={(city) => {
          setFilters((prev) => ({ ...prev, city }));
          window.scrollTo({ top: 300, behavior: 'smooth' });
        }}
        contactPhone={settings.cmsContent?.footerContactPhone}
        contactEmail={settings.cmsContent?.footerContactEmail}
      />

      {/* MODALS */}

      {/* Listing Detail & Request Booking Modal */}
      {selectedDetailListing && (
        <ListingDetailModal
          listing={selectedDetailListing}
          reviews={reviews}
          lang={lang}
          currency={currency}
          usdToKesRate={1}
          onClose={() => setSelectedDetailListing(null)}
          onSubmitBookingRequest={handleSubmitBookingRequest}
          onSubmitReview={handleSubmitReview}
        />
      )}

      {/* Payment Modal */}
      {activePaymentBooking && (
        <BookingPaymentModal
          booking={activePaymentBooking}
          lang={lang}
          currency={currency}
          usdToKesRate={1}
          onClose={() => setActivePaymentBooking(null)}
          onPayMpesa={handlePayMpesa}
          onPayAggregator={handlePayAggregator}
          onPayUponArrival={async (bookingId) => {
            await fetch(`/api/bookings/${bookingId}/pay-on-arrival`, { method: 'POST' });
            await fetchBookings();
            await fetchNotifications();
          }}
        />
      )}

      {/* Guest My Bookings Modal */}
      {isMyBookingsOpen && (
        <GuestBookingsModal
          bookings={bookings}
          lang={lang}
          currency={currency}
          usdToKesRate={1}
          onClose={() => setIsMyBookingsOpen(false)}
          onPayNow={(booking) => {
            setIsMyBookingsOpen(false);
            setActivePaymentBooking(booking);
          }}
          onCancelBooking={handleCancelBooking}
          onSearchByPhone={(phone) => fetchBookings(phone)}
        />
      )}

      {/* Admin Dashboard Control Panel */}
      {isAdminOpen && (
        <AdminDashboard
          listings={listings}
          bookings={bookings}
          transactions={transactions}
          settings={settings}
          notifications={notifications}
          blogs={blogs}
          initialListingToEdit={adminListingToEdit}
          onClose={() => {
            setIsAdminOpen(false);
            setAdminListingToEdit(null);
          }}
          onAddListing={handleAddListing}
          onUpdateListing={handleUpdateListing}
          onDeleteListing={handleDeleteListing}
          onUpdateBookingStatus={handleUpdateBookingStatus}
          onSaveSettings={handleSaveSettings}
          onAddBlog={handleAddBlog}
          onDeleteBlog={handleDeleteBlog}
        />
      )}


      {/* Social Share Modal */}
      {selectedShareListing && (
        <SocialShareModal
          listing={selectedShareListing}
          onClose={() => setSelectedShareListing(null)}
        />
      )}

      {/* Referral Program Modal */}
      {isReferralOpen && (
        <ReferralModal
          lang={lang}
          referralCode="TEXASGUEST25"
          referralCredits={25}
          onClose={() => setIsReferralOpen(false)}
        />
      )}

      {/* Virtual Search Keyboard Modal */}
      <SearchKeyboardModal
        isOpen={isKeyboardModalOpen}
        onClose={() => setIsKeyboardModalOpen(false)}
        searchQuery={filters.searchQuery || ''}
        onSearchChange={(query) => handleFilterChange({ searchQuery: query })}
        onPerformSearch={(query) => handleSearchSubmit(query)}
        listings={listings}
      />

      {/* Custom Search Filters Modal */}
      <CustomSearchFiltersModal
        isOpen={isCustomFiltersModalOpen}
        onClose={() => setIsCustomFiltersModalOpen(false)}
        filters={filters}
        onFilterChange={handleFilterChange}
        onApply={() => handleSearchSubmit()}
        onReset={handleResetFilters}
        matchingCount={listings.length}
      />

      </div>
    </div>
  );
}
