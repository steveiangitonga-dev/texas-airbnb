/**
 * Texas Airbnbs - Core Data Models & Types
 */

export type UserRole = 'guest' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  referralCode: string;
  referralCredits: number;
  avatarUrl?: string;
  passwordHash?: string;
}

export interface RoomPhoto {
  id: string;
  url: string;
  caption: string;
  roomType: 'Bedroom' | 'Living Room' | 'Bathroom' | 'Kitchen' | 'Outdoor' | 'Pool' | 'Dining' | 'Balcony';
}

export interface VideoShot {
  id: string;
  title: string;
  videoUrl: string;
  angleTag: string; // e.g. "Best Picture Angle - Living Room", "Aerial Drone View", "Sunset Deck Panorama", "Master Bedroom Tour"
  duration?: string;
  thumbnail?: string;
}

export interface Listing {
  id: string;
  title: string;
  slug: string;
  description: string;
  city: string; // e.g., "Austin", "Fredericksburg", "Marfa", "Galveston", "San Antonio", "Fort Worth"
  region: string; // e.g., "Hill Country", "Central Texas", "West Texas", "Gulf Coast"
  address: string;
  lat: number;
  lng: number;
  nightlyPrice: number; // in USD or KES
  cleaningFee: number;
  maxGuests: number;
  bedrooms: number;
  beds: number;
  baths: number;
  amenities: string[];
  photos: string[];
  roomPhotos?: RoomPhoto[];
  videoUrl?: string;
  videoShots?: VideoShot[];
  hostName: string;
  hostAvatar: string;
  hostPhone: string;
  hostResponseTime: string; // e.g. "within an hour"
  hostRating: number;
  rating: number;
  reviewCount: number;
  isFeatured?: boolean;
  isAvailable?: boolean;
  isArchived?: boolean;
  createdAt: string;
}

export type BookingStatus = 'pending' | 'approved' | 'declined' | 'confirmed' | 'cancelled' | 'expired';
export type PaymentStatus = 'unpaid' | 'paid' | 'refunded' | 'pay_on_arrival';
export type PaymentMethod = 'mpesa' | 'bank_pesapal' | 'bank_flutterwave' | 'card' | 'pay_on_arrival';

export interface BookingRequest {
  id: string; // e.g., "BK-88492"
  listingId: string;
  listingTitle: string;
  listingCity: string;
  listingPhoto: string;
  guestId: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  checkIn: string; // YYYY-MM-DD
  checkOut: string; // YYYY-MM-DD
  nights: number;
  guests: number;
  nightlyPrice: number;
  cleaningFee: number;
  serviceFee: number;
  discountAmount: number;
  totalAmount: number;
  commissionAmount: number; // platform commission cut
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  paymentOption?: 'pay_before_arrival' | 'pay_upon_arrival';
  paymentMethod?: PaymentMethod;
  transactionId?: string;
  approvedAt?: string;
  approvalExpiresAt?: string; // 24h after approval
  notes?: string;
  createdAt: string;
}

export interface Transaction {
  id: string; // e.g., "TX-99312"
  bookingId: string;
  listingTitle: string;
  guestName: string;
  guestPhone: string;
  amount: number;
  commissionAmount: number;
  commissionRate: number; // e.g. 0.12 (12%)
  method: PaymentMethod;
  bankName?: string; // e.g., "Equity Bank", "KCB Bank", "Stanbic Bank"
  providerReference: string;
  status: 'completed' | 'pending' | 'failed' | 'refunded';
  timestamp: string;
}

export interface Review {
  id: string;
  listingId: string;
  guestName: string;
  guestAvatar: string;
  rating: number;
  date: string;
  comment: string;
  categories: {
    cleanliness: number;
    accuracy: number;
    communication: number;
    location: number;
    value: number;
  };
}

export interface SiteCmsContent {
  siteTitle?: string;
  heroHeadline?: string;
  heroSubheadline?: string;
  announcementBar?: string;
  announcementActive?: boolean;
  featuredBannerImage?: string;
  footerContactPhone?: string;
  footerContactEmail?: string;
}

export interface PlatformSettings {
  commissionPercentage?: number;
  cancellation7PlusRefund: number; // default 100%
  cancellation3To6Refund: number; // default 50%
  cancellationUnder3Refund: number; // default 0%
  referralCreditAmount: number; // default 2500
  currencySymbol: string; // 'KSh'
  defaultCurrency: 'KES' | 'USD';
  usdToKesRate?: number;
  googleAnalyticsId: string;
  googleSearchConsoleVerification: string;
  cmsContent?: SiteCmsContent;
}

export interface NotificationLog {
  id: string;
  type: 'sms' | 'email';
  recipient: string;
  subject?: string;
  message: string;
  status: 'sent' | 'delivered' | 'failed';
  timestamp: string;
}

export interface FilterState {
  city: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  minPrice: number;
  maxPrice: number;
  bedrooms: number;
  amenities: string[];
  searchQuery: string;
  sortBy: 'recommended' | 'price_low' | 'price_high' | 'rating' | 'popularity';
  propertyType: string;
}

export interface BlogArticle {
  id: string;
  slug: string;
  title: string;
  summary: string;
  author: string;
  date: string;
  readTime: string;
  imageUrl: string;
  category: string;
  content: string[];
}

export interface AuditLog {
  id: string;
  adminEmail: string;
  action: string;
  details: string;
  timestamp: string;
}

