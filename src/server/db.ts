export {};

// ... (top of file unchanged)

  const users: User[] = [
    {
      id: "user-admin",
      name: "Madam Ann (Host)",
      email: process.env.ADMIN_EMAIL || "admin@thikabnbs.com",
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
    googleSearchConsoleVerification: "google-site-verification=thikabnbs-token",
    cmsContent: {
      siteTitle: "Texas Airbnbs",
      heroHeadline: "Find Your Perfect Thika Getaway",
      heroSubheadline: "Handpicked executive suites, tufted master residences, rooftop penthouses & riverside villas in Thika Town, Kenya.",
      announcementBar: "🔥 Special Offer: Book 3+ nights in Thika Town and get 10% off! Direct Safaricom M-Pesa & Bank Payment enabled.",
      announcementActive: true,
      footerContactPhone: "+254 729 110 857",
      footerContactEmail: "info@thikabnbs.com"
    }
  };

// ... (rest of file unchanged)
