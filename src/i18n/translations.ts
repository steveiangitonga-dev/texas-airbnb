/**
 * Texas Airbnbs - Internationalization (English & Swahili)
 */

export type Language = 'en' | 'sw';

export const translations = {
  en: {
    appName: "Texas Airbnbs",
    tagline: "Unforgettable Stays & Luxury Cabins in Lone Star Country",
    heroTitle: "Find Your Perfect Texas Escape",
    heroSubtitle: "Handpicked ranch cabins, Austin lofts, wine country cottages & beachfront villas.",
    searchLocation: "Where in Texas?",
    allCities: "All Cities & Regions",
    checkIn: "Check-in",
    checkOut: "Check-out",
    guests: "Guests",
    search: "Search Stays",
    filterTitle: "Filter Texas Stays",
    nightlyPrice: "night",
    totalBeforeTaxes: "total before taxes",
    requestBooking: "Request Booking",
    instantApprovalHelp: "Host approval required within 24 hours. No charge until approved.",
    amenities: "Amenities & Features",
    hostInfo: "Hosted by",
    messageHostWhatsapp: "Message Host on WhatsApp",
    responseTime: "Response time",
    reviews: "Reviews",
    leaveReview: "Leave a Review",
    wishlist: "Wishlist",
    addToWishlist: "Save to Favorites",
    removeFromWishlist: "Remove from Favorites",
    myBookings: "My Bookings",
    adminDashboard: "Admin Control Panel",
    login: "Log In",
    logout: "Log Out",
    guestRole: "Guest Account",
    adminRole: "Admin / Host Manager",
    
    // Booking statuses
    statusPending: "Pending Approval",
    statusApproved: "Approved - Pay Now",
    statusDeclined: "Declined",
    statusConfirmed: "Confirmed & Locked",
    statusCancelled: "Cancelled",
    statusExpired: "Auto-Expired",

    // Payment
    payNow: "Pay Now to Confirm",
    selectPaymentMethod: "Choose Payment Method",
    mpesaPush: "M-Pesa STK Push",
    bankAggregator: "East African Bank Transfer & Cards",
    enterPhoneForMpesa: "Enter Safaricom M-Pesa Phone Number",
    phoneNumberHelp: "You will receive a prompt on your phone to complete payment.",
    payWithBank: "Pay via Bank (Equity, KCB, Stanbic, NCBA, Absa)",
    completePayment: "Complete Secure Payment",
    processingPayment: "Processing STK Push...",
    paymentSuccess: "Payment Confirmed! Your stay is locked in.",
    
    // Policy
    cancellationPolicy: "Cancellation Policy",
    cancellationRule: "Full refund 7+ days before check-in. 50% refund 3–6 days prior. No refund inside 3 days.",

    // Referral
    referralTitle: "Invite Friends, Earn $25 Credit",
    referralDesc: "Share your referral link with fellow travelers. Both get $25 off their next booking!",
    copyLink: "Copy Referral Link",
    
    // Social Proof
    urgencyText: "people viewing this stay right now",
    bookedTimes: "booked times this month",

    // Footer
    footerRights: "All rights reserved. Texas Airbnbs Platform.",
    travelGuides: "Texas Travel Guides & Inspiration"
  },
  sw: {
    appName: "Texas Airbnbs",
    tagline: "Makazi ya Kifahari na Nyumba za Likizo Nchini Texas",
    heroTitle: "Tafuta Nyumba Yako ya Likizo Texas",
    heroSubtitle: "Nyumba za mashambani, ghorofa za Austin, nyumba za mizabibu na ufuo wa bahari.",
    searchLocation: "Sehemu gani Texas?",
    allCities: "Miji na Maeneo Yote",
    checkIn: "Kuingia",
    checkOut: "Kutoka",
    guests: "Wageni",
    search: "Tafuta Makazi",
    filterTitle: "Chuja Nyumba za Texas",
    nightlyPrice: "kwa usiku",
    totalBeforeTaxes: "jumla kabla ya kodi",
    requestBooking: "Omba Hifadhi (Booking)",
    instantApprovalHelp: "Imeidhinishwa na Mwenyeji ndani ya masaa 24. Hakuna malipo mpaka uidhinishwe.",
    amenities: "Vifaa na Huduma",
    hostInfo: "Inasimamiwa na",
    messageHostWhatsapp: "Tuma Ujumbe WhatsApp kwa Mwenyeji",
    responseTime: "Muda wa kujibu",
    reviews: "Tathmini na Maoni",
    leaveReview: "Acha Maoni",
    wishlist: "Vitu Nilivyovipenda",
    addToWishlist: "Hifadhi kwenye Vipendwa",
    removeFromWishlist: "Ondoa kwenye Vipendwa",
    myBookings: "Hifadhi Zangu",
    adminDashboard: "Jopo la Usimamizi (Admin)",
    login: "Ingia",
    logout: "Ondoka",
    guestRole: "Akaunti ya Mgeni",
    adminRole: "Msimamizi / Admin",
    
    // Booking statuses
    statusPending: "Inasubiri Idhini",
    statusApproved: "Imeidhinishwa - Lipa Sasa",
    statusDeclined: "Imekataliwa",
    statusConfirmed: "Imethibitishwa na Imefungwa",
    statusCancelled: "Imeghatishwa",
    statusExpired: "Imeisha Muda Auto",

    // Payment
    payNow: "Lipa Sasa Kuthibitisha",
    selectPaymentMethod: "Chagua Njia ya Malipo",
    mpesaPush: "M-Pesa STK Push",
    bankAggregator: "Benki za Afrika Mashariki na Kadi",
    enterPhoneForMpesa: "Weka Namba ya Safaricom M-Pesa",
    phoneNumberHelp: "Utapokea ujumbe kwenye simu yako ili kukamilisha malipo.",
    payWithBank: "Lipa kwa Benki (Equity, KCB, Stanbic, NCBA, Absa)",
    completePayment: "Kamilisha Malipo Salama",
    processingPayment: "Inashughulikia STK Push...",
    paymentSuccess: "Malipo Yamethibitishwa! Hifadhi yako imekamilika.",
    
    // Policy
    cancellationPolicy: "Sera ya Ughatisho",
    cancellationRule: "Rudishiwa 100% ukighatisha siku 7+ kabla. Rudishiwa 50% siku 3–6 kabla. Hakuna kurudishiwa ndani ya siku 3.",

    // Referral
    referralTitle: "Mwalike Rafiki, Pata Punguzo la $25",
    referralDesc: "Sambaza kiungo chako kwa wasafiri wengine. Wote mnapata punguzo la $25 kwa hifadhi ijayo!",
    copyLink: "Nakili Kiungo",
    
    // Social Proof
    urgencyText: "watu wanaangalia nyumba hii sasa hivi",
    bookedTimes: "mara zilizohifadhiwa mwezi huu",

    // Footer
    footerRights: "Haki zote zimehifadhiwa. Jukwaa la Texas Airbnbs.",
    travelGuides: "Mwongozo wa Usafiri na Vivutio vya Texas"
  }
};
