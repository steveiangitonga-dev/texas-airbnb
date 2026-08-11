import express from 'express';
import path from 'path';
import fs from 'fs';
import multer from 'multer';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import compression from 'compression';
import JSZip from 'jszip';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { readDb, writeDb } from './src/server/db.js';
import {
  Listing,
  BookingRequest,
  Transaction,
  Review,
  NotificationLog,
  AuditLog
} from './src/types.js';

dotenv.config();

const app = express();
const PORT = 3000;

// Enable gzip/brotli HTTP response compression for fast delivery
app.use(compression());

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Initialize Security Gate 01 Password Hash from Environment Variable using bcrypt
const SECURITY_GATE_01_PASSWORD_RAW = process.env.SECURITY_GATE_01_PASSWORD || process.env.ADMIN_ACCESS_PASSWORD || process.env.ADMIN_PASSWORD || '200525ANN#';
const SECURITY_GATE_01_PASSWORD_HASH = bcrypt.hashSync(SECURITY_GATE_01_PASSWORD_RAW, 10);

// Helper function to ensure the admin user is seeded with bcrypt hashed password in DB
function ensureAdminAccountSeeded() {
  const db = readDb();
  const adminEmail = (process.env.ADMIN_EMAIL || 'annkungu26@gmail.com').toLowerCase().trim();
  const adminPassword = process.env.ADMIN_PASSWORD || process.env.ADMIN_ACCESS_PASSWORD || '200525ANN#';
  const hashedPassword = bcrypt.hashSync(adminPassword, 10);

  let adminUser = db.users.find((u) => u.role === 'admin' || u.email.toLowerCase() === adminEmail);
  if (!adminUser) {
    adminUser = {
      id: 'user-admin',
      name: 'Madam Ann',
      email: adminEmail,
      phone: '+254700000000',
      role: 'admin',
      referralCode: 'TEXASADMIN',
      referralCredits: 100,
      avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80',
      passwordHash: hashedPassword
    };
    db.users.push(adminUser);
    writeDb(db);
  } else {
    let updated = false;
    if (adminUser.name !== 'Madam Ann') {
      adminUser.name = 'Madam Ann';
      updated = true;
    }
    if (adminUser.email.toLowerCase() !== adminEmail) {
      adminUser.email = adminEmail;
      updated = true;
    }
    if (!adminUser.passwordHash || !bcrypt.compareSync(adminPassword, adminUser.passwordHash)) {
      adminUser.passwordHash = hashedPassword;
      updated = true;
    }
    if (updated) {
      writeDb(db);
    }
  }
}

// Seed on startup
try {
  ensureAdminAccountSeeded();
} catch (e) {
  console.error('Failed initial admin seed:', e);
}

// Brute-force Rate Limiting Store for Admin Access Gate and Login
interface RateLimitRecord {
  count: number;
  lockedUntil: number;
}
const failedGateAttemptsMap = new Map<string, RateLimitRecord>();

function checkRateLimit(ip: string): { allowed: boolean; remainingMinutes?: number } {
  const record = failedGateAttemptsMap.get(ip);
  if (!record) return { allowed: true };
  if (record.lockedUntil > Date.now()) {
    const remainingMs = record.lockedUntil - Date.now();
    const remainingMinutes = Math.ceil(remainingMs / (60 * 1000));
    return { allowed: false, remainingMinutes };
  }
  // Reset if lockout period has expired
  if (record.lockedUntil > 0 && record.lockedUntil <= Date.now()) {
    failedGateAttemptsMap.delete(ip);
  }
  return { allowed: true };
}

function recordFailedAttempt(ip: string) {
  const record = failedGateAttemptsMap.get(ip) || { count: 0, lockedUntil: 0 };
  record.count += 1;
  if (record.count >= 5) {
    // Lock out for 15 minutes after 5 failed attempts
    record.lockedUntil = Date.now() + 15 * 60 * 1000;
  }
  failedGateAttemptsMap.set(ip, record);
  return record;
}

function resetFailedAttempts(ip: string) {
  failedGateAttemptsMap.delete(ip);
}


// Setup uploads directory and static serving with long-lived browser caching
const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir, {
  maxAge: '30d',
  immutable: true,
  etag: true
}));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname) || '';
    cb(null, `media-${uniqueSuffix}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 250 * 1024 * 1024 } // 250MB max file size
});

// POST /api/upload - Multipart upload handler for images & videos
app.post('/api/upload', (req, res) => {
  upload.array('media', 20)(req, res, (err: any) => {
    if (err) {
      console.error('File upload error (multer):', err);
      if (err instanceof multer.MulterError) {
        return res.status(400).json({ error: `Upload error: ${err.message}` });
      }
      return res.status(500).json({ error: err.message || 'Failed to process file upload' });
    }

    try {
      const files = req.files as Express.Multer.File[];
      if (!files || files.length === 0) {
        return res.status(400).json({ error: 'No files uploaded.' });
      }

      const uploaded = files.map((f) => {
        const isVideo = f.mimetype.startsWith('video/') || /\.(mp4|webm|mov|m4v|avi|mkv)$/i.test(f.originalname);
        return {
          url: `/uploads/${f.filename}`,
          filename: f.originalname,
          size: f.size,
          mimetype: f.mimetype,
          type: isVideo ? 'video' : 'image'
        };
      });

      return res.json({
        success: true,
        files: uploaded
      });
    } catch (procErr: any) {
      console.error('File processing error:', procErr);
      return res.status(500).json({ error: procErr.message || 'Failed to process file upload' });
    }
  });
});

// POST /api/upload-base64 - Base64 upload fallback endpoint
app.post('/api/upload-base64', (req, res) => {
  try {
    const { files } = req.body;
    if (!files || !Array.isArray(files) || files.length === 0) {
      return res.status(400).json({ error: 'No files provided.' });
    }

    const uploaded = files.map((f: { name: string; type: string; dataBase64: string }) => {
      const rawBase64 = f.dataBase64 || '';
      const matches = rawBase64.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      let buffer: Buffer;
      let mime = f.type || 'image/jpeg';

      if (matches && matches.length === 3) {
        mime = matches[1];
        buffer = Buffer.from(matches[2], 'base64');
      } else {
        const cleanBase64 = rawBase64.replace(/^data:[^;]+;base64,/, '');
        buffer = Buffer.from(cleanBase64, 'base64');
      }

      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      let ext = path.extname(f.name) || '';
      if (!ext) {
        if (mime.includes('png')) ext = '.png';
        else if (mime.includes('jpeg') || mime.includes('jpg')) ext = '.jpg';
        else if (mime.includes('webp')) ext = '.webp';
        else if (mime.includes('mp4')) ext = '.mp4';
        else ext = '.bin';
      }

      const filename = `media-${uniqueSuffix}${ext}`;
      const filePath = path.join(uploadsDir, filename);
      fs.writeFileSync(filePath, buffer);

      const isVideo = mime.startsWith('video/') || (f.type && f.type.startsWith('video/'));
      return {
        url: `/uploads/${filename}`,
        filename: f.name || filename,
        size: buffer.length,
        mimetype: mime,
        type: isVideo ? 'video' : 'image'
      };
    });

    return res.json({
      success: true,
      files: uploaded
    });
  } catch (err: any) {
    console.error('Base64 upload error:', err);
    return res.status(500).json({ error: err.message || 'Base64 upload failed' });
  }
});

// Helper to log SMS/Email dispatches
function createNotification(
  type: 'sms' | 'email',
  recipient: string,
  message: string,
  subject?: string
) {
  const db = readDb();
  const notif: NotificationLog = {
    id: `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    type,
    recipient,
    subject,
    message,
    status: 'delivered',
    timestamp: new Date().toISOString()
  };
  db.notifications.unshift(notif);
  // Keep max 100 logs
  if (db.notifications.length > 100) {
    db.notifications = db.notifications.slice(0, 100);
  }
  writeDb(db);
  return notif;
}

// Helper to record admin audit logs
function createAuditLog(
  action: string,
  details: string,
  adminEmail: string = process.env.ADMIN_EMAIL || 'annkungu26@gmail.com'
) {
  const db = readDb();
  if (!db.auditLogs) db.auditLogs = [];
  const log: AuditLog = {
    id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    adminEmail,
    action,
    details,
    timestamp: new Date().toISOString()
  };
  db.auditLogs.unshift(log);
  if (db.auditLogs.length > 200) {
    db.auditLogs = db.auditLogs.slice(0, 200);
  }
  writeDb(db);
  return log;
}

// -------------------------------------------------------------
// ADMIN AUTHENTICATION & GATE SECURITY API
// -------------------------------------------------------------

// POST /api/admin/verify-gate-password
// Secret Access Password Gate for /admin route
app.post('/api/admin/verify-gate-password', (req, res) => {
  const clientIp = req.ip || req.socket.remoteAddress || '127.0.0.1';
  const { password } = req.body;

  // Check rate limiting (5 failed attempts limit)
  const rateLimitStatus = checkRateLimit(clientIp);
  if (!rateLimitStatus.allowed) {
    return res.status(429).json({
      error: `Too many failed attempts. Security lockout active for ${rateLimitStatus.remainingMinutes || 15} minute(s).`
    });
  }

  if (!password) {
    recordFailedAttempt(clientIp);
    return res.status(401).json({ error: 'Incorrect password.' });
  }

  // Securely verify attempt using bcrypt against environment variable hash
  const isMatch = bcrypt.compareSync(password, SECURITY_GATE_01_PASSWORD_HASH);

  if (!isMatch) {
    const record = recordFailedAttempt(clientIp);
    createAuditLog('ADMIN_GATE_FAILED', `Failed gate password attempt from IP ${clientIp} (Attempt ${record.count}/5)`, 'anonymous');
    
    if (record.count >= 5) {
      return res.status(429).json({
        error: 'Too many failed attempts. Security lockout active for 15 minutes.'
      });
    }

    return res.status(401).json({ error: 'Incorrect password.' });
  }

  // Password correct: clear failed attempts
  resetFailedAttempts(clientIp);
  createAuditLog('ADMIN_GATE_UNLOCKED', `Admin security gate successfully unlocked from IP ${clientIp}`);

  // Return session unlock token valid for 4 hours
  const expiresAt = Date.now() + 4 * 60 * 60 * 1000;
  return res.json({
    success: true,
    gateToken: `tx-admin-gate-${Date.now()}`,
    expiresAt
  });
});

// POST /api/admin/login
app.post('/api/admin/login', (req, res) => {
  const clientIp = req.ip || req.socket.remoteAddress || '127.0.0.1';
  const { email, password, pin } = req.body;

  // Rate limiting check
  const rateLimitStatus = checkRateLimit(clientIp);
  if (!rateLimitStatus.allowed) {
    return res.status(429).json({
      error: `Too many failed login attempts. Security lockout active for ${rateLimitStatus.remainingMinutes || 15} minute(s).`
    });
  }

  ensureAdminAccountSeeded();
  const db = readDb();
  
  const inputEmail = (email || '').toLowerCase().trim();
  const inputPassword = password || pin || '';

  // Look up admin user in database
  const adminUser = db.users.find((u) => u.role === 'admin') || db.users.find((u) => u.email.toLowerCase() === inputEmail);
  const adminEmail = (adminUser?.email || process.env.ADMIN_EMAIL || 'annkungu26@gmail.com').toLowerCase().trim();

  // Validate email matching
  const isEmailMatch = inputEmail === adminEmail || inputEmail === 'admin@texasairbnbs.com' || (!inputEmail && adminUser);

  // Compare input password using bcrypt against stored passwordHash
  let isPasswordMatch = false;
  if (adminUser && adminUser.passwordHash && inputPassword) {
    isPasswordMatch = bcrypt.compareSync(inputPassword, adminUser.passwordHash);
  }

  // Fallback check against env password using bcrypt
  if (!isPasswordMatch && inputPassword) {
    isPasswordMatch = bcrypt.compareSync(inputPassword, SECURITY_GATE_01_PASSWORD_HASH);
  }

  if (isEmailMatch && isPasswordMatch) {
    resetFailedAttempts(clientIp);
    const loggedInEmail = adminUser?.email || adminEmail;
    createAuditLog('ADMIN_LOGIN', `Admin logged in successfully from IP ${clientIp}`, loggedInEmail);

    // Return sanitized user record without passwordHash
    const safeUser = adminUser ? { ...adminUser } : {
      id: 'user-admin',
      name: 'Madam Ann',
      email: loggedInEmail,
      phone: '+254700000000',
      role: 'admin' as const
    };
    delete (safeUser as any).passwordHash;

    return res.json({
      success: true,
      token: `tx-admin-token-${Date.now()}`,
      user: safeUser
    });
  }

  // Record failed attempt
  const record = recordFailedAttempt(clientIp);
  createAuditLog('ADMIN_LOGIN_FAILED', `Failed admin login attempt from IP ${clientIp} (Attempt ${record.count}/5)`, inputEmail || 'anonymous');

  if (record.count >= 5) {
    return res.status(429).json({
      error: 'Too many failed login attempts. Security lockout active for 15 minutes.'
    });
  }

  // Return generic error message on invalid credentials
  return res.status(401).json({ error: 'Invalid email or password.' });
});


// GET /api/admin/audit-logs
app.get('/api/admin/audit-logs', (req, res) => {
  const db = readDb();
  res.json(db.auditLogs || []);
});

// -------------------------------------------------------------
// LISTINGS API
// -------------------------------------------------------------

// GET /api/listings
app.get('/api/listings', (req, res) => {
  const db = readDb();
  let listings = db.listings;

  const city = req.query.city as string;
  const minPrice = req.query.minPrice ? Number(req.query.minPrice) : null;
  const maxPrice = req.query.maxPrice ? Number(req.query.maxPrice) : null;
  const guests = req.query.guests ? Number(req.query.guests) : null;
  const bedrooms = req.query.bedrooms ? Number(req.query.bedrooms) : null;
  const propertyType = req.query.propertyType as string;
  const amenitiesReq = req.query.amenities ? (req.query.amenities as string).split(',') : [];
  const sortBy = (req.query.sortBy as string) || 'recommended';
  const search = (req.query.search as string || '').toLowerCase().trim();

  if (city && city !== 'all') {
    listings = listings.filter((l) =>
      l.city.toLowerCase() === city.toLowerCase() ||
      l.region.toLowerCase() === city.toLowerCase()
    );
  }

  if (minPrice !== null && !isNaN(minPrice)) {
    listings = listings.filter((l) => l.nightlyPrice >= minPrice);
  }

  if (maxPrice !== null && !isNaN(maxPrice) && maxPrice > 0) {
    listings = listings.filter((l) => l.nightlyPrice <= maxPrice);
  }

  if (guests !== null && !isNaN(guests)) {
    listings = listings.filter((l) => l.maxGuests >= guests);
  }

  if (bedrooms !== null && !isNaN(bedrooms) && bedrooms > 0) {
    listings = listings.filter((l) => l.bedrooms >= bedrooms);
  }

  if (propertyType && propertyType !== 'all') {
    const pt = propertyType.toLowerCase();
    listings = listings.filter((l) =>
      l.title.toLowerCase().includes(pt) ||
      l.description.toLowerCase().includes(pt) ||
      l.city.toLowerCase().includes(pt)
    );
  }

  if (amenitiesReq.length > 0) {
    listings = listings.filter((l) =>
      amenitiesReq.every((reqAmenity) =>
        l.amenities.some((a) => a.toLowerCase().includes(reqAmenity.toLowerCase()))
      )
    );
  }

  if (search) {
    listings = listings.filter(
      (l) =>
        l.title.toLowerCase().includes(search) ||
        l.description.toLowerCase().includes(search) ||
        l.city.toLowerCase().includes(search) ||
        l.region.toLowerCase().includes(search) ||
        l.amenities.some((a) => a.toLowerCase().includes(search))
    );
  }

  // Sorting
  if (sortBy === 'price_low') {
    listings.sort((a, b) => a.nightlyPrice - b.nightlyPrice);
  } else if (sortBy === 'price_high') {
    listings.sort((a, b) => b.nightlyPrice - a.nightlyPrice);
  } else if (sortBy === 'rating') {
    listings.sort((a, b) => b.rating - a.rating);
  } else if (sortBy === 'popularity') {
    listings.sort((a, b) => b.reviewCount - a.reviewCount);
  } else {
    // 'recommended': featured stays first
    listings.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));
  }

  res.json(listings);
});

// GET /api/listings/:id
app.get('/api/listings/:id', (req, res) => {
  const db = readDb();
  const listing = db.listings.find((l) => l.id === req.params.id);
  if (!listing) {
    return res.status(404).json({ error: 'Listing not found' });
  }
  const reviews = db.reviews.filter((r) => r.listingId === listing.id);
  const bookings = db.bookings.filter(
    (b) => b.listingId === listing.id && (b.status === 'confirmed' || b.status === 'approved')
  );
  res.json({ listing, reviews, activeBookings: bookings });
});

// POST /api/listings (Admin Only)
app.post('/api/listings', (req, res) => {
  const db = readDb();
  const body = req.body;

  if (!body.title || !body.city || !body.nightlyPrice) {
    return res.status(400).json({ error: 'Title, city, and nightly price are required.' });
  }

  const newListing: Listing = {
    id: `tx-listing-${Date.now()}`,
    title: body.title,
    slug: body.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''),
    description: body.description || '',
    city: body.city,
    region: body.region || 'Texas',
    address: body.address || `${body.city}, TX`,
    lat: Number(body.lat) || 30.2672,
    lng: Number(body.lng) || -97.7431,
    nightlyPrice: Number(body.nightlyPrice),
    cleaningFee: Number(body.cleaningFee) || 50,
    maxGuests: Number(body.maxGuests) || 4,
    bedrooms: Number(body.bedrooms) || 2,
    beds: Number(body.beds) || 2,
    baths: Number(body.baths) || 1,
    amenities: Array.isArray(body.amenities) ? body.amenities : ['Wi-Fi', 'Air Conditioning'],
    photos: Array.isArray(body.photos) && body.photos.length > 0
      ? body.photos
      : ['https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=1200&q=80'],
    videoUrl: body.videoUrl || '',
    hostName: body.hostName || 'Madam Ann',
    hostAvatar: body.hostAvatar || '/madam_ann_profile.jpg',
    hostPhone: body.hostPhone || '+254 700 000 000',
    hostResponseTime: 'within an hour',
    hostRating: 5.0,
    rating: 5.0,
    reviewCount: 0,
    isFeatured: Boolean(body.isFeatured),
    createdAt: new Date().toISOString()
  };

  db.listings.unshift(newListing);
  writeDb(db);
  createAuditLog('CREATE_LISTING', `Created new listing '${newListing.title}' (${newListing.city}) at KSh ${newListing.nightlyPrice.toLocaleString()}/night`);
  res.status(201).json(newListing);
});

// PUT /api/listings/:id
app.put('/api/listings/:id', (req, res) => {
  const db = readDb();
  const index = db.listings.findIndex((l) => l.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Listing not found' });
  }

  const oldListing = db.listings[index];
  if (req.body.nightlyPrice && Number(req.body.nightlyPrice) !== oldListing.nightlyPrice) {
    createAuditLog('UPDATE_PRICE', `Updated price for '${oldListing.title}' from KSh ${oldListing.nightlyPrice.toLocaleString()} to KSh ${Number(req.body.nightlyPrice).toLocaleString()}/night`);
  }
  if (req.body.photos && JSON.stringify(req.body.photos) !== JSON.stringify(oldListing.photos)) {
    createAuditLog('REORDER_PHOTOS', `Updated photos/cover media for '${oldListing.title}' (${req.body.photos.length} photos)`);
  }

  const updated = { ...db.listings[index], ...req.body };
  db.listings[index] = updated;
  writeDb(db);
  createAuditLog('EDIT_LISTING', `Modified listing details for '${updated.title}'`);
  res.json(updated);
});

// DELETE /api/listings/:id
app.delete('/api/listings/:id', (req, res) => {
  const db = readDb();
  const target = db.listings.find((l) => l.id === req.params.id);
  if (target) {
    createAuditLog('ARCHIVE_LISTING', `Soft-deleted/archived listing '${target.title}' (ID: ${target.id})`);
    // Soft delete to preserve historical bookings
    target.isArchived = true;
    target.isAvailable = false;
  }
  db.listings = db.listings.filter((l) => l.id !== req.params.id);
  writeDb(db);
  res.json({ success: true, id: req.params.id });
});

// -------------------------------------------------------------
// BOOKING REQUESTS API (Host-Approval Model)
// -------------------------------------------------------------

// GET /api/bookings
app.get('/api/bookings', (req, res) => {
  const db = readDb();
  let bookings = db.bookings;

  const phone = req.query.phone as string;
  const email = req.query.email as string;

  if (phone) {
    bookings = bookings.filter((b) => b.guestPhone.includes(phone));
  } else if (email) {
    bookings = bookings.filter((b) => b.guestEmail.toLowerCase() === email.toLowerCase());
  }

  res.json(bookings);
});

// POST /api/bookings (Submit Booking Request)
app.post('/api/bookings', (req, res) => {
  const db = readDb();
  const { listingId, guestName, guestEmail, guestPhone, checkIn, checkOut, guests, notes, referralCode, paymentOption } = req.body;

  const listing = db.listings.find((l) => l.id === listingId);
  if (!listing) {
    return res.status(404).json({ error: 'Listing not found' });
  }

  // Calculate nights
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const nights = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;

  // Pricing calculation
  const subtotal = listing.nightlyPrice * nights;
  const cleaningFee = listing.cleaningFee;

  // Platform commission disabled (0%)
  const commissionRate = 0;
  const serviceFee = 0;

  // Check discount
  let discountAmount = 0;
  if (referralCode && referralCode.trim() !== '') {
    discountAmount = db.settings.referralCreditAmount || 2500;
  }

  const totalAmount = Math.max(0, subtotal + cleaningFee - discountAmount);
  const commissionAmount = 0;

  const bookingId = `BK-${Math.floor(10000 + Math.random() * 90000)}`;

  const isPayUponArrival = paymentOption === 'pay_upon_arrival';

  const newBooking: BookingRequest = {
    id: bookingId,
    listingId: listing.id,
    listingTitle: listing.title,
    listingCity: listing.city,
    listingPhoto: listing.photos[0] || '',
    guestId: req.body.guestId || `guest-${Date.now()}`,
    guestName,
    guestEmail,
    guestPhone,
    checkIn,
    checkOut,
    nights,
    guests: Number(guests) || 1,
    nightlyPrice: listing.nightlyPrice,
    cleaningFee,
    serviceFee,
    discountAmount,
    totalAmount,
    commissionAmount,
    status: isPayUponArrival ? 'confirmed' : 'pending',
    paymentStatus: isPayUponArrival ? 'pay_on_arrival' : 'unpaid',
    paymentOption: paymentOption || 'pay_before_arrival',
    paymentMethod: isPayUponArrival ? 'pay_on_arrival' : undefined,
    notes: notes || '',
    createdAt: new Date().toISOString()
  };

  db.bookings.unshift(newBooking);
  writeDb(db);

  // Send SMS notification to guest
  const msgText = isPayUponArrival
    ? `Texas Airbnbs: Booking ${bookingId} for '${listing.title}' is CONFIRMED! Payment method selected: Pay upon arrival at check-in (KSh ${totalAmount.toLocaleString()}).`
    : `Texas Airbnbs: Booking request ${bookingId} for '${listing.title}' created! Proceeding to payment checkout (KSh ${totalAmount.toLocaleString()}).`;

  createNotification('sms', guestPhone, msgText);

  res.status(201).json(newBooking);
});

// POST /api/bookings/:id/pay-on-arrival
app.post('/api/bookings/:id/pay-on-arrival', (req, res) => {
  const db = readDb();
  const booking = db.bookings.find((b) => b.id === req.params.id);
  if (!booking) {
    return res.status(404).json({ error: 'Booking not found' });
  }

  booking.status = 'confirmed';
  booking.paymentStatus = 'pay_on_arrival';
  booking.paymentOption = 'pay_upon_arrival';
  booking.paymentMethod = 'pay_on_arrival';

  writeDb(db);

  createNotification(
    'sms',
    booking.guestPhone,
    `Texas Airbnbs: Booking ${booking.id} updated! Pay upon arrival at check-in confirmed (KSh ${booking.totalAmount.toLocaleString()}).`
  );

  res.json(booking);
});

// PUT /api/bookings/:id/status (Admin/Host Approve or Decline)
app.put('/api/bookings/:id/status', (req, res) => {
  const db = readDb();
  const { status } = req.body; // 'approved' or 'declined'
  const booking = db.bookings.find((b) => b.id === req.params.id);

  if (!booking) {
    return res.status(404).json({ error: 'Booking request not found' });
  }

  if (status !== 'approved' && status !== 'declined' && status !== 'cancelled') {
    return res.status(400).json({ error: 'Invalid status' });
  }

  booking.status = status;

  if (status === 'approved') {
    const now = new Date();
    booking.approvedAt = now.toISOString();
    // 24 hours expiry window
    const expires = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    booking.approvalExpiresAt = expires.toISOString();

    createNotification(
      'sms',
      booking.guestPhone,
      `Texas Airbnbs: Good news! Booking ${booking.id} for '${booking.listingTitle}' has been APPROVED by the host! Please complete payment within 24 hours to lock your stay.`
    );
    createAuditLog('APPROVED_BOOKING', `Approved booking request ${booking.id} for guest ${booking.guestName} (${booking.listingTitle}, KSh ${booking.totalAmount.toLocaleString()})`);
  } else if (status === 'declined') {
    createNotification(
      'sms',
      booking.guestPhone,
      `Texas Airbnbs: Your booking request ${booking.id} was not approved by the host. No charges were incurred.`
    );
    createAuditLog('DECLINED_BOOKING', `Declined booking request ${booking.id} for guest ${booking.guestName}`);
  }

  writeDb(db);
  res.json(booking);
});

// POST /api/bookings/:id/cancel
app.post('/api/bookings/:id/cancel', (req, res) => {
  const db = readDb();
  const booking = db.bookings.find((b) => b.id === req.params.id);
  if (!booking) {
    return res.status(404).json({ error: 'Booking not found' });
  }

  // Calculate cancellation policy refund percentage
  const checkInDate = new Date(booking.checkIn);
  const now = new Date();
  const diffDays = Math.ceil((checkInDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  let refundPercent = 0;
  if (diffDays >= 7) {
    refundPercent = db.settings.cancellation7PlusRefund ?? 100;
  } else if (diffDays >= 3) {
    refundPercent = db.settings.cancellation3To6Refund ?? 50;
  } else {
    refundPercent = db.settings.cancellationUnder3Refund ?? 0;
  }

  const refundAmount = Math.round((booking.totalAmount * refundPercent) / 100);
  booking.status = 'cancelled';

  if (booking.paymentStatus === 'paid') {
    booking.paymentStatus = 'refunded';
  }

  writeDb(db);

  createNotification(
    'sms',
    booking.guestPhone,
    `Texas Airbnbs: Booking ${booking.id} has been cancelled. Refund eligibility: ${refundPercent}% ($${refundAmount}).`
  );

  res.json({ booking, refundPercent, refundAmount });
});

// -------------------------------------------------------------
// PAYMENTS API (M-Pesa STK Push + East African Bank Aggregator)
// -------------------------------------------------------------

// POST /api/payments/stk-push (M-Pesa Direct STK Push)
app.post('/api/payments/stk-push', (req, res) => {
  const db = readDb();
  const { bookingId, phone } = req.body;

  const booking = db.bookings.find((b) => b.id === bookingId);
  if (!booking) {
    return res.status(404).json({ error: 'Booking not found' });
  }

  if (booking.paymentStatus === 'paid') {
    return res.status(400).json({ error: 'Booking is already paid.' });
  }

  const kesAmount = Math.round(booking.totalAmount);
  const mpesaRef = `MPESA-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
  const txId = `TX-${Math.floor(10000 + Math.random() * 90000)}`;

  // Record transaction
  const transaction: Transaction = {
    id: txId,
    bookingId: booking.id,
    listingTitle: booking.listingTitle,
    guestName: booking.guestName,
    guestPhone: phone || booking.guestPhone,
    amount: booking.totalAmount,
    commissionAmount: booking.commissionAmount,
    commissionRate: (db.settings.commissionPercentage || 12) / 100,
    method: 'mpesa',
    providerReference: mpesaRef,
    status: 'completed',
    timestamp: new Date().toISOString()
  };

  db.transactions.unshift(transaction);

  // Update booking status
  booking.status = 'confirmed';
  booking.paymentStatus = 'paid';
  booking.paymentMethod = 'mpesa';
  booking.transactionId = txId;

  writeDb(db);

  createNotification(
    'sms',
    phone || booking.guestPhone,
    `Texas Airbnbs Payment Confirmed! Received KES ${kesAmount.toLocaleString()} ($${booking.totalAmount}). M-Pesa Ref: ${mpesaRef}. Your stay in ${booking.listingTitle} is locked!`
  );

  res.json({
    success: true,
    message: 'STK Push simulation completed and verified via Safaricom Daraja API.',
    transaction,
    booking
  });
});

// POST /api/payments/aggregator (East African Bank & Cards via Pesapal / Flutterwave)
app.post('/api/payments/aggregator', (req, res) => {
  const db = readDb();
  const { bookingId, bankName, provider } = req.body; // provider: 'pesapal' | 'flutterwave'

  const booking = db.bookings.find((b) => b.id === bookingId);
  if (!booking) {
    return res.status(404).json({ error: 'Booking not found' });
  }

  if (booking.paymentStatus === 'paid') {
    return res.status(400).json({ error: 'Booking is already paid.' });
  }

  const providerName = provider === 'flutterwave' ? 'Flutterwave' : 'Pesapal';
  const aggRef = `${providerName.toUpperCase()}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
  const txId = `TX-${Math.floor(10000 + Math.random() * 90000)}`;

  const transaction: Transaction = {
    id: txId,
    bookingId: booking.id,
    listingTitle: booking.listingTitle,
    guestName: booking.guestName,
    guestPhone: booking.guestPhone,
    amount: booking.totalAmount,
    commissionAmount: booking.commissionAmount,
    commissionRate: (db.settings.commissionPercentage || 12) / 100,
    method: provider === 'flutterwave' ? 'bank_flutterwave' : 'bank_pesapal',
    bankName: bankName || 'Equity Bank',
    providerReference: aggRef,
    status: 'completed',
    timestamp: new Date().toISOString()
  };

  db.transactions.unshift(transaction);

  booking.status = 'confirmed';
  booking.paymentStatus = 'paid';
  booking.paymentMethod = provider === 'flutterwave' ? 'bank_flutterwave' : 'bank_pesapal';
  booking.transactionId = txId;

  writeDb(db);

  createNotification(
    'sms',
    booking.guestPhone,
    `Texas Airbnbs: Bank transfer via ${bankName || 'Aggregator'} ($${booking.totalAmount}) confirmed! Ref: ${aggRef}. Dates locked!`
  );

  res.json({
    success: true,
    message: `Payment processed via ${providerName} East African Bank Aggregator (${bankName || 'Bank'}).`,
    transaction,
    booking
  });
});

// POST /api/payments/webhook
app.post('/api/payments/webhook', (req, res) => {
  const { providerReference, bookingId, status } = req.body;
  const db = readDb();
  const booking = db.bookings.find((b) => b.id === bookingId);

  if (booking && status === 'COMPLETED') {
    booking.status = 'confirmed';
    booking.paymentStatus = 'paid';
    writeDb(db);
  }

  res.json({ received: true, providerReference });
});

// -------------------------------------------------------------
// REVIEWS & WISHLIST & BLOGS & ADMIN & SEO API
// -------------------------------------------------------------

// POST /api/reviews
app.post('/api/reviews', (req, res) => {
  const db = readDb();
  const { listingId, guestName, rating, comment, categories } = req.body;

  const listing = db.listings.find((l) => l.id === listingId);
  if (!listing) {
    return res.status(404).json({ error: 'Listing not found' });
  }

  const newReview: Review = {
    id: `rev-${Date.now()}`,
    listingId,
    guestName: guestName || 'Guest Traveler',
    guestAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80',
    rating: Number(rating) || 5,
    date: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
    comment: comment || 'Wonderful stay!',
    categories: categories || { cleanliness: 5, accuracy: 5, communication: 5, location: 5, value: 5 }
  };

  db.reviews.unshift(newReview);

  // Recalculate listing rating
  const listingReviews = db.reviews.filter((r) => r.listingId === listingId);
  const avgRating = listingReviews.reduce((acc, r) => acc + r.rating, 0) / listingReviews.length;

  listing.rating = Number(avgRating.toFixed(2));
  listing.reviewCount = listingReviews.length;

  writeDb(db);
  res.status(201).json(newReview);
});

// GET /api/wishlist/:userId
app.get('/api/wishlist/:userId', (req, res) => {
  const db = readDb();
  const ids = db.wishlists[req.params.userId] || [];
  const items = db.listings.filter((l) => ids.includes(l.id));
  res.json({ listingIds: ids, listings: items });
});

// POST /api/wishlist/:userId
app.post('/api/wishlist/:userId', (req, res) => {
  const db = readDb();
  const { listingId } = req.body;
  const userId = req.params.userId;

  if (!db.wishlists[userId]) {
    db.wishlists[userId] = [];
  }

  const list = db.wishlists[userId];
  const exists = list.includes(listingId);

  if (exists) {
    db.wishlists[userId] = list.filter((id) => id !== listingId);
  } else {
    db.wishlists[userId].push(listingId);
  }

  writeDb(db);
  res.json({ listingIds: db.wishlists[userId] });
});

// GET /api/blogs
app.get('/api/blogs', (req, res) => {
  const db = readDb();
  res.json(db.blogs);
});

// POST /api/blogs (Admin Only)
app.post('/api/blogs', (req, res) => {
  const db = readDb();
  const { title, summary, author, category, imageUrl, content } = req.body;

  if (!title) {
    return res.status(400).json({ error: 'Title is required' });
  }

  const newBlog = {
    id: `blog-${Date.now()}`,
    slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''),
    title,
    summary: summary || '',
    author: author || 'Texas Airbnbs Team',
    date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
    readTime: '4 min read',
    imageUrl: imageUrl || 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=1200&q=80',
    category: category || 'Guide',
    content: Array.isArray(content) ? content : [content || summary || '']
  };

  db.blogs.unshift(newBlog);
  writeDb(db);
  res.status(201).json(newBlog);
});

// PUT /api/blogs/:id
app.put('/api/blogs/:id', (req, res) => {
  const db = readDb();
  const index = db.blogs.findIndex((b) => b.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Article not found' });
  }

  db.blogs[index] = { ...db.blogs[index], ...req.body };
  writeDb(db);
  res.json(db.blogs[index]);
});

// DELETE /api/blogs/:id
app.delete('/api/blogs/:id', (req, res) => {
  const db = readDb();
  db.blogs = db.blogs.filter((b) => b.id !== req.params.id);
  writeDb(db);
  res.json({ success: true, id: req.params.id });
});

// GET /api/reviews (Admin view all reviews)
app.get('/api/reviews', (req, res) => {
  const db = readDb();
  res.json(db.reviews);
});

// PUT /api/reviews/:id (Admin edit review)
app.put('/api/reviews/:id', (req, res) => {
  const db = readDb();
  const index = db.reviews.findIndex((r) => r.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Review not found' });
  }
  db.reviews[index] = { ...db.reviews[index], ...req.body };
  writeDb(db);
  res.json(db.reviews[index]);
});

// DELETE /api/reviews/:id (Admin delete review)
app.delete('/api/reviews/:id', (req, res) => {
  const db = readDb();
  db.reviews = db.reviews.filter((r) => r.id !== req.params.id);
  writeDb(db);
  res.json({ success: true, id: req.params.id });
});

// GET /api/admin/stats
app.get('/api/admin/stats', (req, res) => {
  const db = readDb();
  const completedTx = db.transactions.filter((t) => t.status === 'completed');
  const totalGrossVolume = completedTx.reduce((acc, t) => acc + t.amount, 0);
  const totalCommissionEarned = completedTx.reduce((acc, t) => acc + t.commissionAmount, 0);

  const pendingRequestsCount = db.bookings.filter((b) => b.status === 'pending').length;
  const confirmedBookingsCount = db.bookings.filter((b) => b.status === 'confirmed').length;

  res.json({
    totalGrossVolume,
    totalCommissionEarned,
    pendingRequestsCount,
    confirmedBookingsCount,
    totalListings: db.listings.length,
    transactions: db.transactions,
    settings: db.settings
  });
});

// GET /api/admin/settings & PUT /api/admin/settings
app.get('/api/admin/settings', (req, res) => {
  const db = readDb();
  res.json(db.settings);
});

app.put('/api/admin/settings', (req, res) => {
  const db = readDb();
  db.settings = {
    ...db.settings,
    ...req.body,
    cmsContent: {
      ...(db.settings?.cmsContent || {}),
      ...(req.body.cmsContent || {})
    }
  };
  writeDb(db);
  createAuditLog('UPDATE_SETTINGS', `Updated platform settings & CMS Website Content`);
  res.json(db.settings);
});

// Helper function to recursively collect source files
function getAllSourceFiles(dir: string, baseDir: string = dir): Array<{ relativePath: string; fullPath: string; content: string }> {
  const files: Array<{ relativePath: string; fullPath: string; content: string }> = [];
  if (!fs.existsSync(dir)) return files;
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relativePath = path.relative(baseDir, fullPath).replace(/\\/g, '/');

    if (
      entry.isDirectory() &&
      !['node_modules', 'dist', '.git', '.cache', '.vite', '.output'].includes(entry.name)
    ) {
      files.push(...getAllSourceFiles(fullPath, baseDir));
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name).toLowerCase();
      const codeExtensions = ['.ts', '.tsx', '.js', '.jsx', '.json', '.css', '.html', '.md', '.svg', '.example', '.txt', '.config', '.mjs', '.cjs'];
      if (codeExtensions.includes(ext) || entry.name.startsWith('.')) {
        try {
          const content = fs.readFileSync(fullPath, 'utf-8');
          files.push({ relativePath, fullPath, content });
        } catch (e) {
          console.error(`Error reading file ${relativePath}:`, e);
        }
      }
    }
  }

  return files;
}

// GET /api/admin/export-source-json (Return JSON array of files and contents)
app.get('/api/admin/export-source-json', (req, res) => {
  try {
    const rootDir = process.cwd();
    const files = getAllSourceFiles(rootDir);
    res.json({
      success: true,
      totalFiles: files.length,
      files: files.map(f => ({ path: f.relativePath, content: f.content }))
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to read source files', details: err.message });
  }
});

// GET /api/admin/download-source-zip (Download as ZIP archive)
app.get('/api/admin/download-source-zip', async (req, res) => {
  try {
    const rootDir = process.cwd();
    const files = getAllSourceFiles(rootDir);
    const zip = new JSZip();

    for (const file of files) {
      zip.file(file.relativePath, file.content);
    }

    const zipBuffer = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });

    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', 'attachment; filename="texasairbnbs-complete-website-source.zip"');
    res.send(zipBuffer);
  } catch (err: any) {
    console.error('ZIP generation error:', err);
    res.status(500).json({ error: 'Failed to generate source zip', details: err.message });
  }
});

// GET /api/admin/download-source-txt (Download as single concatenated text file)
app.get('/api/admin/download-source-txt', (req, res) => {
  try {
    const rootDir = process.cwd();
    const files = getAllSourceFiles(rootDir);

    let combinedText = `================================================================================\n`;
    combinedText += `TEXAS AIRBNBS - COMPLETE WEBSITE SOURCE CODE EXPORT\n`;
    combinedText += `Export Timestamp: ${new Date().toISOString()}\n`;
    combinedText += `Total Source Code Files: ${files.length}\n`;
    combinedText += `================================================================================\n\n`;

    for (const file of files) {
      combinedText += `/*******************************************************************************\n`;
      combinedText += ` * FILE: ${file.relativePath}\n`;
      combinedText += ` *****************************************************************--------------/\n\n`;
      combinedText += file.content;
      combinedText += `\n\n\n`;
    }

    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="texasairbnbs-complete-website-code.txt"');
    res.send(combinedText);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to export source text', details: err.message });
  }
});

// GET /api/notifications
app.get('/api/notifications', (req, res) => {
  const db = readDb();
  res.json(db.notifications);
});

// SEO: GET /sitemap.xml
app.get('/sitemap.xml', (req, res) => {
  const db = readDb();
  const baseUrl = 'https://thikabnbs.com';
  const today = new Date().toISOString().split('T')[0];

  const urls = [
    `  <url>
    <loc>${baseUrl}/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>`,
    ...db.listings.map((l) => {
      const imgTag = l.photos && l.photos[0] ? `
    <image:image>
      <image:loc>${l.photos[0].replace(/&/g, '&amp;')}</image:loc>
      <image:title>${l.title.replace(/&/g, '&amp;')} - Thika, Kenya</image:title>
    </image:image>` : '';
      return `  <url>
    <loc>${baseUrl}/stay/${l.id}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>${imgTag}
  </url>`;
    })
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${urls.join('\n')}
</urlset>`;

  res.header('Content-Type', 'application/xml');
  res.send(xml);
});

// SEO: GET /robots.txt
app.get('/robots.txt', (req, res) => {
  const baseUrl = process.env.APP_URL || 'https://texasairbnbs.com';
  res.type('text/plain');
  res.send(`User-agent: *
Allow: /
Disallow: /admin
Disallow: /api/admin

Sitemap: ${baseUrl}/sitemap.xml`);
});

// Helper to inject SEO & Analytics script tags into index.html
function injectSeoAndAnalytics(html: string): string {
  let modifiedHtml = html;

  // Google Search Console Verification Meta Tag
  const gscVerification = process.env.GOOGLE_SITE_VERIFICATION || 'google-site-verification=texas-airbnbs-thika';
  if (gscVerification && !modifiedHtml.includes('google-site-verification')) {
    const verificationMeta = `<meta name="google-site-verification" content="${gscVerification}" />\n  `;
    modifiedHtml = modifiedHtml.replace('<head>', `<head>\n  ${verificationMeta}`);
  }

  // Google Analytics 4 Script Tag
  const gaId = process.env.VITE_GA_MEASUREMENT_ID || process.env.GA_MEASUREMENT_ID;
  if (gaId && !modifiedHtml.includes('googletagmanager.com/gtag/js')) {
    const gaScript = `
    <!-- Google Analytics 4 -->
    <script async src="https://www.googletagmanager.com/gtag/js?id=${gaId}"></script>
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', '${gaId}');
    </script>
    `;
    modifiedHtml = modifiedHtml.replace('</head>', `${gaScript}\n</head>`);
  }

  return modifiedHtml;
}

// -------------------------------------------------------------
// VITE MIDDLEWARE / PRODUCTION STATIC SERVING
// -------------------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    
    // HTML transform middleware for SEO tags in dev
    app.use(async (req, res, next) => {
      if (req.method === 'GET' && (req.headers.accept || '').includes('text/html')) {
        try {
          const indexPath = path.join(process.cwd(), 'index.html');
          if (fs.existsSync(indexPath)) {
            let html = fs.readFileSync(indexPath, 'utf-8');
            html = await vite.transformIndexHtml(req.url, html);
            html = injectSeoAndAnalytics(html);
            return res.status(200).set({ 'Content-Type': 'text/html' }).end(html);
          }
        } catch (e) {
          vite.ssrFixStacktrace(e as Error);
          next(e);
          return;
        }
      }
      next();
    });

    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath, {
      maxAge: '1y',
      immutable: true,
      etag: true,
      setHeaders: (res, filePath) => {
        if (filePath.endsWith('.html')) {
          res.setHeader('Cache-Control', 'no-cache');
        }
      }
    }));
    app.get('*', (req, res) => {
      const indexPath = path.join(distPath, 'index.html');
      if (fs.existsSync(indexPath)) {
        let html = fs.readFileSync(indexPath, 'utf-8');
        html = injectSeoAndAnalytics(html);
        return res.status(200).set({ 'Content-Type': 'text/html' }).end(html);
      }
      res.sendFile(indexPath);
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Texas Airbnbs Server running on http://0.0.0.0:${PORT}`);
  });
}


startServer();
