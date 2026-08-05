import fs from 'fs';
import path from 'path';
import {
  Listing,
  BookingRequest,
  Transaction,
  Review,
  PlatformSettings,
  User,
  NotificationLog,
  BlogArticle,
  AuditLog
} from '../types.js';

interface DatabaseSchema {
  listings: Listing[];
  bookings: BookingRequest[];
  transactions: Transaction[];
  reviews: Review[];
  users: User[];
  wishlists: Record<string, string[]>; // userId -> listingIds
  settings: PlatformSettings;
  notifications: NotificationLog[];
  blogs: BlogArticle[];
  auditLogs: AuditLog[];
}

const DB_FILE_PATH = path.join(process.cwd(), 'data', 'db.json');

// Ensure directory exists
function ensureDbFile(): DatabaseSchema {
  const dirPath = path.dirname(DB_FILE_PATH);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }

  if (fs.existsSync(DB_FILE_PATH)) {
    try {
      const raw = fs.readFileSync(DB_FILE_PATH, 'utf-8');
      return JSON.parse(raw) as DatabaseSchema;
    } catch (err) {
      console.error("Error reading db.json, re-initializing:", err);
    }
  }

  const initialDb: DatabaseSchema = getInitialSeedData();
  fs.writeFileSync(DB_FILE_PATH, JSON.stringify(initialDb, null, 2), 'utf-8');
  return initialDb;
}

export function readDb(): DatabaseSchema {
  return ensureDbFile();
}

export function writeDb(data: DatabaseSchema): void {
  const dirPath = path.dirname(DB_FILE_PATH);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
  fs.writeFileSync(DB_FILE_PATH, JSON.stringify(data, null, 2), 'utf-8');
}

function getInitialSeedData(): DatabaseSchema {
  const listings: Listing[] = [
    {
      id: "tx-listing-custom-1",
      title: "Texas Grand Executive Tufted Suite & Living Residence",
      slug: "grand-executive-tufted-suite",
      description: "Texas Airbnbs signature luxury stay located in Section 9, Thika Town, Kenya. Featuring a plush tufted headboard master suite, grey velvet tufted sofas with geometric yellow accent pillows, a full executive kitchen with gas stove & microwave, smart TV lounge, water dispenser, and a private balcony with lush green artificial turf. Fully equipped for short and long-term stays with Safaricom M-Pesa & Bank transfers supported.",
      city: "Section 9",
      region: "Thika, Kenya",
      address: "104 Executive Park, Section 9, Thika Town, Kenya",
      lat: -1.0385,
      lng: 37.0750,
      nightlyPrice: 4500,
      cleaningFee: 500,
      maxGuests: 4,
      bedrooms: 2,
      beds: 2,
      baths: 1,
      amenities: [
        "Plush Tufted Master Bed",
        "Smart Flat-screen TV",
        "Grey Velvet Lounge Sofas",
        "Full Kitchen & Gas Stove",
        "Microwave & Electric Kettle",
        "Water Dispenser",
        "Private Turf Balcony",
        "High-Speed Wi-Fi",
        "Dining Table & Chairs",
        "Tiled En-suite Bathroom"
      ],
      photos: [
        "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1200&q=80"
      ],
      roomPhotos: [
        {
          id: "rp-host-1",
          url: "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=1200&q=80",
          caption: "Master King Suite with Tufted Headboard & White Linens",
          roomType: "Bedroom"
        },
        {
          "id": "rp-host-2",
          url: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1200&q=80",
          caption: "Living Room Lounge with Tufted Sofas & Yellow Pillows",
          roomType: "Living Room"
        },
        {
          "id": "rp-host-3",
          url: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=1200&q=80",
          caption: "Modern Kitchen with Gas Cooktop, Microwave & Kettle",
          roomType: "Kitchen"
        },
        {
          "id": "rp-host-4",
          url: "https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&w=1200&q=80",
          caption: "Private Outdoor Balcony with Lush Green Turf Flooring",
          roomType: "Outdoor"
        },
        {
          "id": "rp-host-5",
          url: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1200&q=80",
          caption: "En-Suite Tiled Bathroom & Water Heater Shower",
          roomType: "Bathroom"
        }
      ],
      videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
      videoShots: [
        {
          id: "vs-host-1",
          title: "Full Apartment Walkthrough Tour",
          videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
          angleTag: "360° Walkthrough Video",
          duration: "0:51"
        },
        {
          id: "vs-host-2",
          title: "Living Lounge & Dining Nook Angle",
          videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
          angleTag: "Best Living Room Angle",
          duration: "0:45"
        },
        {
          id: "vs-host-3",
          title: "Tufted Bedroom Suite Close-up",
          videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
          angleTag: "Master Bedroom View",
          duration: "0:30"
        }
      ],
      hostName: "Madam Ann (Host)",
      hostAvatar: "/madam_ann_profile.jpg",
      hostPhone: "+254 729 110 857",
      hostResponseTime: "within a few minutes",
      hostRating: 5.0,
      rating: 4.99,
      reviewCount: 32,
      isFeatured: true,
      createdAt: "2026-07-24T00:00:00Z"
    },
    {
      id: "tx-listing-1",
      title: "Texas Hillside Sanctuary & Luxury Garden Villa",
      slug: "texas-hillside-sanctuary-thika",
      description: "Perched high on a scenic ridge near Cravers Area in Thika, Kenya, this luxury garden villa features sweeping views of pineapple plantations, a private outdoor plunge pool, cedar sauna, stone fireplace, and a private stargazing deck. Minutes from Cravers Express, Blue Posts, and Chania Falls.",
      city: "Cravers Area",
      region: "Thika, Kenya",
      address: "Cravers Ridge Road, Off Garissa Highway, Thika, Kenya",
      lat: -1.0250,
      lng: 37.0620,
      nightlyPrice: 6500,
      cleaningFee: 800,
      maxGuests: 6,
      bedrooms: 3,
      beds: 4,
      baths: 2.5,
      amenities: [
        "Private Plunge Pool",
        "Outdoor Fireplace",
        "Cedar Sauna",
        "Secure Parking",
        "High-Speed Wi-Fi",
        "Wine Bar",
        "BBQ Pit",
        "Pet Friendly",
        "Air Conditioning"
      ],
      photos: [
        "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80"
      ],
      roomPhotos: [
        { id: 'rp-1-1', url: 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=1200&q=80', caption: 'Garden Villa Exterior & Thika Ridge View', roomType: 'Outdoor' },
        { id: 'rp-1-2', url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80', caption: 'Master King Bedroom Suite with Garden Angle', roomType: 'Bedroom' },
        { id: 'rp-1-3', url: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80', caption: 'Living Room Hearth & Reclaimed Cedar Beams', roomType: 'Living Room' },
        { id: 'rp-1-4', url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80', caption: 'Heated Plunge Pool & Stargazing Deck Angle', roomType: 'Pool' },
        { id: 'rp-1-5', url: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1200&q=80', caption: 'En-Suite Spa Bathroom with Rainfall Shower', roomType: 'Bathroom' }
      ],
      videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
      videoShots: [
        { id: 'vs-1-1', title: 'Thika Cravers Ridge Aerial Tour', videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4', angleTag: 'Aerial Drone View', duration: '0:22' },
        { id: 'vs-1-2', title: 'Living Room & Stone Hearth Shot', videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4', angleTag: 'Best Living Room Angle', duration: '0:18' },
        { id: 'vs-1-3', title: 'Sunset Plunge Pool & Outdoor Fireplace', videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4', angleTag: 'Poolside Sunset Angle', duration: '0:25' }
      ],
      hostName: "Madam Ann",
      hostAvatar: "/madam_ann_profile.jpg",
      hostPhone: "+254 729 110 857",
      hostResponseTime: "within an hour",
      hostRating: 4.98,
      rating: 4.96,
      reviewCount: 48,
      isFeatured: true,
      createdAt: "2026-01-15T10:00:00Z"
    },
    {
      id: "tx-listing-2",
      title: "Texas Urban Skyline Penthouse & Private Lounge",
      slug: "texas-skyline-penthouse-thika",
      description: "Modern architectural gem in Thika Town Centre, Kenya. Features floor-to-ceiling glass walls, a designer chef's kitchen, private rooftop lounge overlooking Thika town skyline, motorized blackout shades, audio system, and direct access to Thika CBD dining & shopping.",
      city: "Thika Town Centre",
      region: "Thika, Kenya",
      address: "Commercial Street Penthouse 32, Thika Town, Kenya",
      lat: -1.0333,
      lng: 37.0693,
      nightlyPrice: 5500,
      cleaningFee: 600,
      maxGuests: 4,
      bedrooms: 2,
      beds: 2,
      baths: 2,
      amenities: [
        "Rooftop Terrace",
        "Thika Town Skyline View",
        "Infinity Pool Access",
        "Gym & Spa",
        "Sound System",
        "Fast Wi-Fi (500 Mbps)",
        "Secure Underground Parking",
        "Backup Generator"
      ],
      photos: [
        "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80"
      ],
      hostName: "Madam Ann",
      hostAvatar: "/madam_ann_profile.jpg",
      hostPhone: "+254 729 110 857",
      hostResponseTime: "within a few hours",
      hostRating: 4.92,
      rating: 4.91,
      reviewCount: 36,
      isFeatured: true,
      createdAt: "2026-02-01T12:00:00Z"
    },
    {
      id: "tx-listing-3",
      title: "Texas Stargazing Eco-Dome & Private Spa Bath",
      slug: "texas-stargazing-eco-dome-landless",
      description: "An extraordinary eco-luxury geodesic dome situated in the tranquil Landless Estate near Thika East, Kenya. Floor-to-ceiling sky dome window for viewing night sky constellations, private outdoor hot tub, fire ring, air conditioning, and artisanal lounge setup.",
      city: "Landless",
      region: "Thika, Kenya",
      address: "Landless Ridge Estate, Thika East, Kenya",
      lat: -1.0510,
      lng: 37.1120,
      nightlyPrice: 4000,
      cleaningFee: 500,
      maxGuests: 2,
      bedrooms: 1,
      beds: 1,
      baths: 1,
      amenities: [
        "Stargazing Sky Dome",
        "Hot Tub",
        "Fire Ring",
        "Air Conditioning",
        "Record Player & Vinyls",
        "Espresso Bar",
        "Solar Power Backup"
      ],
      photos: [
        "https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1506974210756-8e1b8985d348?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1499696010180-025ef6e1a8f9?auto=format&fit=crop&w=1200&q=80"
      ],
      hostName: "Madam Ann",
      hostAvatar: "/madam_ann_profile.jpg",
      hostPhone: "+254 729 110 857",
      hostResponseTime: "within an hour",
      hostRating: 5.0,
      rating: 4.97,
      reviewCount: 62,
      isFeatured: true,
      createdAt: "2026-02-10T08:00:00Z"
    },
    {
      id: "tx-listing-4",
      title: "Texas Chania Falls Riverside Sunset Villa",
      slug: "texas-chania-falls-riverside-villa",
      description: "Step straight onto your expansive wooden deck overlooking Chania River & Fourteen Falls view near Blue Posts, Thika. Features wraparound riverfront porch, outdoor shower, hammock lounge, and panoramic natural waterfall sunset views.",
      city: "Chania Falls",
      region: "Thika, Kenya",
      address: "Chania River Drive, Blue Posts Area, Thika, Kenya",
      lat: -1.0180,
      lng: 37.0680,
      nightlyPrice: 5000,
      cleaningFee: 600,
      maxGuests: 8,
      bedrooms: 4,
      beds: 5,
      baths: 3,
      amenities: [
        "Chania River View",
        "Wraparound Porch",
        "Outdoor Shower",
        "BBQ Grill",
        "High-Speed Wi-Fi",
        "Gourmet Kitchen",
        "Pet Friendly"
      ],
      photos: [
        "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80"
      ],
      hostName: "Madam Ann",
      hostAvatar: "/madam_ann_profile.jpg",
      hostPhone: "+254 729 110 857",
      hostResponseTime: "within a few hours",
      hostRating: 4.88,
      rating: 4.89,
      reviewCount: 29,
      isFeatured: false,
      createdAt: "2026-03-01T09:00:00Z"
    },
    {
      id: "tx-listing-5",
      title: "Texas Makongeni Executive Furnished Studio",
      slug: "texas-makongeni-furnished-studio",
      description: "Charming executive apartment in Makongeni Phase 4, Thika Town. Features modern interior design, high-speed Wi-Fi, fully fitted kitchenette, balcony, smart TV, and 24/7 security with CCTV & borehole water supply.",
      city: "Makongeni",
      region: "Thika, Kenya",
      address: "Phase 4 Boulevard, Makongeni, Thika, Kenya",
      lat: -1.0420,
      lng: 37.0950,
      nightlyPrice: 3500,
      cleaningFee: 400,
      maxGuests: 4,
      bedrooms: 2,
      beds: 2,
      baths: 1.5,
      amenities: [
        "Smart TV",
        "Free Coffee Bar",
        "Full Kitchen",
        "Air Conditioning / Fan",
        "Fast Wi-Fi",
        "24/7 Security Guard"
      ],
      photos: [
        "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80"
      ],
      hostName: "Madam Ann",
      hostAvatar: "/madam_ann_profile.jpg",
      hostPhone: "+254 729 110 857",
      hostResponseTime: "within an hour",
      hostRating: 4.95,
      rating: 4.93,
      reviewCount: 51,
      isFeatured: false,
      createdAt: "2026-03-15T11:00:00Z"
    },
    {
      id: "tx-listing-6",
      title: "Fort Worth Stockyards Luxury Timber Lodge",
      slug: "fort-worth-stockyards-timber-lodge",
      description: "Rustic luxury meets Western heritage. Built with reclaimed Texas cedar timber and Texas granite, featuring a stone hearth, custom leather couches, game room with billiards, wet bar, and outdoor porch overlooking Trinity River trails.",
      city: "Fort Worth",
      region: "North Texas",
      address: "2401 N Main St, Fort Worth, TX 76164",
      lat: 32.7881,
      lng: -97.3486,
      nightlyPrice: 3800,
      cleaningFee: 400,
      maxGuests: 8,
      bedrooms: 4,
      beds: 6,
      baths: 3,
      amenities: [
        "Billiards Game Room",
        "Stone Hearth Fireplace",
        "Wet Bar",
        "BBQ Smoker",
        "Spacious Lawn",
        "Smart TVs",
        "Garage Parking"
      ],
      photos: [
        "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&w=1200&q=80"
      ],
      hostName: "Madam Ann",
      hostAvatar: "/madam_ann_profile.jpg",
      hostPhone: "+254 729 110 857",
      hostResponseTime: "within an hour",
      hostRating: 4.96,
      rating: 4.94,
      reviewCount: 41,
      isFeatured: false,
      createdAt: "2026-04-01T14:00:00Z"
    }
  ];

  const bookings: BookingRequest[] = [
    {
      id: "BK-88492",
      listingId: "tx-listing-1",
      listingTitle: "The Lone Star Sanctuary & Hill Country Ranch",
      listingCity: "Fredericksburg",
      listingPhoto: "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=1200&q=80",
      guestId: "user-guest-1",
      guestName: "Wanjiku Kimani",
      guestEmail: "wanjiku.kimani@example.com",
      guestPhone: "+254712345678",
      checkIn: "2026-08-10",
      checkOut: "2026-08-13",
      nights: 3,
      guests: 2,
      nightlyPrice: 285,
      cleaningFee: 85,
      serviceFee: 102,
      discountAmount: 0,
      totalAmount: 1042,
      commissionAmount: 125,
      status: "pending",
      paymentStatus: "unpaid",
      createdAt: "2026-07-20T14:30:00Z",
      notes: "Celebrating our wedding anniversary in Texas!"
    },
    {
      id: "BK-88493",
      listingId: "tx-listing-2",
      listingTitle: "Austin Urban Skyline Penthouse & Private Lounge",
      listingCity: "Austin",
      listingPhoto: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80",
      guestId: "user-guest-2",
      guestName: "Dennis Ochieng",
      guestEmail: "dennis.o@example.com",
      guestPhone: "+254722998877",
      checkIn: "2026-08-15",
      checkOut: "2026-08-18",
      nights: 3,
      guests: 4,
      nightlyPrice: 350,
      cleaningFee: 95,
      serviceFee: 126,
      discountAmount: 25,
      totalAmount: 1246,
      commissionAmount: 149,
      status: "approved",
      paymentStatus: "unpaid",
      approvedAt: "2026-07-23T10:15:00Z",
      approvalExpiresAt: "2026-07-24T10:15:00Z",
      createdAt: "2026-07-22T09:00:00Z"
    },
    {
      id: "BK-88490",
      listingId: "tx-listing-3",
      listingTitle: "Marfa Desert Stargazing Dome & Cedar Hot Tub",
      listingCity: "Marfa",
      listingPhoto: "https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&w=1200&q=80",
      guestId: "user-guest-3",
      guestName: "Amina Hassan",
      guestEmail: "amina.hassan@example.com",
      guestPhone: "+254733112233",
      checkIn: "2026-07-01",
      checkOut: "2026-07-04",
      nights: 3,
      guests: 2,
      nightlyPrice: 220,
      cleaningFee: 60,
      serviceFee: 79,
      discountAmount: 0,
      totalAmount: 799,
      commissionAmount: 95,
      status: "confirmed",
      paymentStatus: "paid",
      paymentMethod: "mpesa",
      transactionId: "TX-77319",
      approvedAt: "2026-06-25T11:00:00Z",
      createdAt: "2026-06-24T16:00:00Z"
    }
  ];

  const transactions: Transaction[] = [
    {
      id: "TX-77319",
      bookingId: "BK-88490",
      listingTitle: "Marfa Desert Stargazing Dome & Cedar Hot Tub",
      guestName: "Amina Hassan",
      guestPhone: "+254733112233",
      amount: 799,
      commissionAmount: 95.88,
      commissionRate: 0.12,
      method: "mpesa",
      providerReference: "MPESA-QFH9218A",
      status: "completed",
      timestamp: "2026-06-25T11:30:00Z"
    }
  ];

  const reviews: Review[] = [
    {
      id: "rev-1",
      listingId: "tx-listing-1",
      guestName: "David M.",
      guestAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80",
      rating: 5,
      date: "June 2026",
      comment: "Unbelievable experience! Watching the Texas sunset over Fredericksburg from the plunge pool was breathtaking. The hosts left a lovely basket of local Hill Country wines.",
      categories: { cleanliness: 5, accuracy: 5, communication: 5, location: 5, value: 5 }
    },
    {
      id: "rev-2",
      listingId: "tx-listing-1",
      guestName: "Faith N.",
      guestAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80",
      rating: 5,
      date: "May 2026",
      comment: "Super quiet and peaceful. The cedar sauna was fantastic after hiking near Enchanted Rock. Highly recommended!",
      categories: { cleanliness: 5, accuracy: 5, communication: 5, location: 5, value: 4.8 }
    },
    {
      id: "rev-3",
      listingId: "tx-listing-2",
      guestName: "Kevin O.",
      guestAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&q=80",
      rating: 5,
      date: "July 2026",
      comment: "Best penthouse in Austin! Rainey street is literally 3 minutes away, and the lake views are incredible.",
      categories: { cleanliness: 5, accuracy: 5, communication: 5, location: 5, value: 4.9 }
    }
  ];

  const users: User[] = [
    {
      id: "user-admin",
      name: "Madam Ann (Host)",
      email: process.env.ADMIN_EMAIL || "admin@texasairbnbs.com",
      phone: "+254729110857",
      role: "admin",
      referralCode: "TEXASADMIN",
      referralCredits: 100,
      avatarUrl: "/madam_ann_profile.jpg"
    },
    {
      id: "user-guest-1",
      name: "Wanjiku Kimani",
      email: "wanjiku.kimani@example.com",
      phone: "+254712345678",
      role: "guest",
      referralCode: "WANJIKU25",
      referralCredits: 25,
      avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80"
    }
  ];

  const wishlists: Record<string, string[]> = {
    "user-guest-1": ["tx-listing-1", "tx-listing-3"]
  };

  const settings: PlatformSettings = {
    commissionPercentage: 12,
    cancellation7PlusRefund: 100,
    cancellation3To6Refund: 50,
    cancellationUnder3Refund: 0,
    referralCreditAmount: 2500,
    currencySymbol: "KSh",
    defaultCurrency: "KES",
    usdToKesRate: 1,
    googleAnalyticsId: "G-TEXASAIRBNBS",
    googleSearchConsoleVerification: "google-site-verification=texas-airbnbs-token",
    cmsContent: {
      siteTitle: "Texas Airbnbs",
      heroHeadline: "Find Your Perfect Thika Getaway",
      heroSubheadline: "Handpicked executive suites, tufted master residences, rooftop penthouses & riverside villas in Thika Town, Kenya.",
      announcementBar: "🔥 Special Offer: Book 3+ nights in Thika Town and get 10% off! Direct Safaricom M-Pesa & Bank Payment enabled.",
      announcementActive: true,
      footerContactPhone: "+254 729 110 857",
      footerContactEmail: "info@texasairbnbs.com"
    }
  };

  const notifications: NotificationLog[] = [
    {
      id: "notif-1",
      type: "sms",
      recipient: "+254712345678",
      message: "Texas Airbnbs: Your booking request BK-88492 for 'The Lone Star Sanctuary' has been submitted! Waiting for host approval.",
      status: "delivered",
      timestamp: "2026-07-20T14:31:00Z"
    },
    {
      id: "notif-2",
      type: "sms",
      recipient: "+254722998877",
      message: "Texas Airbnbs: Good news! Your booking BK-88493 has been APPROVED by the host. Please complete payment within 24 hours to secure your dates.",
      status: "delivered",
      timestamp: "2026-07-23T10:16:00Z"
    }
  ];

  const blogs: BlogArticle[] = [
    {
      id: "blog-1",
      slug: "ultimate-texas-hill-country-wine-trail-guide",
      title: "The Ultimate Guide to Fredericksburg & Texas Hill Country Wine Trails",
      summary: "Explore over 50 boutique wineries, limestone cabins, and historic German bakeries in Texas's premier wine country.",
      author: "Sarah Miller (Hill Country Host)",
      date: "July 12, 2026",
      readTime: "5 min read",
      imageUrl: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=1200&q=80",
      category: "Wine & Dining",
      content: [
        "Texas Hill Country is now the second most visited wine region in the United States, offering world-class Tannat, Viognier, and Tempranillo vintages.",
        "When planning your stay near Fredericksburg, book a private ranch cabin along Ranch Road 1631 for uninterrupted starlight and peaceful oak groves.",
        "Don't miss a stop at Otto's German Bistro for authentic schnitzel paired with local Texas Hill Country Syrah!"
      ]
    },
    {
      id: "blog-2",
      slug: "marfa-dark-sky-stargazing-and-desert-art",
      title: "Stargazing in Marfa: Dark Skies, Desert Dome Stays, and Outdoor Art",
      summary: "Why West Texas is famous for the Marfa Lights, Donald Judd minimalist installations, and eco-dome retreats.",
      author: "Elena Rostova",
      date: "June 28, 2026",
      readTime: "4 min read",
      imageUrl: "https://images.unsplash.com/photo-1506974210756-8e1b8985d348?auto=format&fit=crop&w=1200&q=80",
      category: "Adventure",
      content: [
        "Marfa is situated in one of North America's lowest light pollution zones, making it an internationally recognized Dark Sky sanctuary.",
        "Staying in a stargazing dome allows you to lie back in bed and gaze up at the Milky Way stretching across the night sky."
      ]
    },
    {
      id: "blog-3",
      slug: "austin-weekend-getaway-music-lakes-and-bbq",
      title: "48 Hours in Austin: Live Music, Lady Bird Lake & Legendary BBQ",
      summary: "How to spend an unforgettable weekend in the Live Music Capital of the World.",
      author: "Beau Montgomery",
      date: "July 02, 2026",
      readTime: "6 min read",
      imageUrl: "https://images.unsplash.com/photo-1531219432768-9f540ce91ef3?auto=format&fit=crop&w=1200&q=80",
      category: "City Guide",
      content: [
        "Start your morning with a paddleboard session on Lady Bird Lake, followed by brisket at Franklin Barbecue or Terry Black's.",
        "Catch live blues at Antone's or stay in a luxury Congress Avenue penthouse overlooking Rainey Street."
      ]
    }
  ];

  const auditLogs: AuditLog[] = [
    {
      id: "log-1",
      adminEmail: process.env.ADMIN_EMAIL || "admin@texasairbnbs.com",
      action: "UPDATED_PRICING",
      details: "Updated nightly price for 'Executive Master Suite in Thika Greens' to KSh 3,800/night",
      timestamp: "2026-07-24T10:15:00Z"
    },
    {
      id: "log-2",
      adminEmail: process.env.ADMIN_EMAIL || "admin@texasairbnbs.com",
      action: "APPROVED_BOOKING",
      details: "Approved booking request BK-88493 for guest Wanjiku Kimani",
      timestamp: "2026-07-25T08:30:00Z"
    }
  ];

  return {
    listings,
    bookings,
    transactions,
    reviews,
    users,
    wishlists,
    settings,
    notifications,
    blogs,
    auditLogs
  };
}
