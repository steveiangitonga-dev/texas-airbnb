import React, { useEffect } from 'react';
import { Listing } from '../types';

interface SEOProps {
  title?: string;
  description?: string;
  canonicalUrl?: string;
  imageUrl?: string;
  type?: 'website' | 'article' | 'accommodation';
  listing?: Listing | null;
  lang?: 'en' | 'sw';
  googleSiteVerification?: string;
}

export const SEO: React.FC<SEOProps> = ({
  title,
  description,
  canonicalUrl,
  imageUrl,
  type = 'website',
  listing,
  lang = 'en',
  googleSiteVerification
}) => {
  useEffect(() => {
    const siteName = "Texas Airbnbs";
    const defaultTitle = "Airbnb in Thika Town, Kenya | Texas Airbnbs";
    const defaultDescription = "Book luxury vacation rentals, tufted master suites, and private garden cottages in Thika town, Kiambu County, Kenya. Enjoy host approval, zero service fees, and instant M-Pesa payments.";
    const defaultImage = "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80";
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://texasairbnbs.com';

    let currentTitle = defaultTitle;
    let currentDescription = defaultDescription;
    let currentImage = imageUrl || defaultImage;
    let currentUrl = canonicalUrl || (typeof window !== 'undefined' ? window.location.href : baseUrl);

    if (listing) {
      currentTitle = `${listing.title} — Thika, Kenya | Texas Airbnbs`;
      currentDescription = `${listing.description.substring(0, 150)}... Book ${listing.title} in ${listing.city}, Thika town, Kenya starting at KSh ${listing.nightlyPrice.toLocaleString()}/night.`;
      if (listing.photos && listing.photos.length > 0) {
        currentImage = listing.photos[0];
      }
      currentUrl = `${baseUrl}/#stay-${listing.id}`;
    } else if (title) {
      currentTitle = title.endsWith(siteName) ? title : `${title} | ${siteName}`;
    }

    if (description) {
      currentDescription = description;
    }

    // Set document title (under 60 chars optimal)
    document.title = currentTitle;

    // Helper to update or create meta tags
    const updateMetaTag = (selector: string, attributeName: string, attributeValue: string, content: string) => {
      let element = document.querySelector(selector) as HTMLMetaElement | null;
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attributeName, attributeValue);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    // Helper to update link tags
    const updateLinkTag = (rel: string, href: string, hreflang?: string) => {
      const selector = hreflang ? `link[rel="${rel}"][hreflang="${hreflang}"]` : `link[rel="${rel}"]`;
      let element = document.querySelector(selector) as HTMLLinkElement | null;
      if (!element) {
        element = document.createElement('link');
        element.setAttribute('rel', rel);
        if (hreflang) element.setAttribute('hreflang', hreflang);
        document.head.appendChild(element);
      }
      element.setAttribute('href', href);
    };

    // Update standard meta tags
    updateMetaTag('meta[name="description"]', 'name', 'description', currentDescription);
    updateMetaTag('meta[name="robots"]', 'name', 'robots', 'index, follow, max-image-preview:large');
    updateMetaTag('meta[name="keywords"]', 'name', 'keywords', 'Airbnb Thika, Thika vacation rentals, luxury stay Thika, Section 9 Thika Airbnb, Kiambu County accommodation, Kenya holiday homes');

    // Update Google Site Verification tag if provided
    if (googleSiteVerification) {
      let clean = googleSiteVerification.trim();
      const metaMatch = clean.match(/content=["']([^"']+)["']/i);
      if (metaMatch && metaMatch[1]) {
        clean = metaMatch[1];
      } else if (clean.startsWith('google-site-verification=')) {
        clean = clean.replace('google-site-verification=', '');
      }
      if (clean) {
        updateMetaTag('meta[name="google-site-verification"]', 'name', 'google-site-verification', clean);
      }
    }

    // Update Open Graph tags
    updateMetaTag('meta[property="og:site_name"]', 'property', 'og:site_name', siteName);
    updateMetaTag('meta[property="og:title"]', 'property', 'og:title', currentTitle);
    updateMetaTag('meta[property="og:description"]', 'property', 'og:description', currentDescription);
    updateMetaTag('meta[property="og:image"]', 'property', 'og:image', currentImage);
    updateMetaTag('meta[property="og:url"]', 'property', 'og:url', currentUrl);
    updateMetaTag('meta[property="og:type"]', 'property', 'og:type', listing ? 'article' : type);
    updateMetaTag('meta[property="og:locale"]', 'property', 'og:locale', lang === 'sw' ? 'sw_KE' : 'en_US');

    // Update Twitter Card tags
    updateMetaTag('meta[name="twitter:card"]', 'name', 'twitter:card', 'summary_large_image');
    updateMetaTag('meta[name="twitter:title"]', 'name', 'twitter:title', currentTitle);
    updateMetaTag('meta[name="twitter:description"]', 'name', 'twitter:description', currentDescription);
    updateMetaTag('meta[name="twitter:image"]', 'name', 'twitter:image', currentImage);

    // Update Canonical and Hreflang
    updateLinkTag('canonical', currentUrl);
    updateLinkTag('alternate', currentUrl, 'en');
    updateLinkTag('alternate', currentUrl, 'sw');

    // Set html lang attribute
    document.documentElement.lang = lang || 'en';

    // JSON-LD Structured Data
    const schemaId = 'seo-json-ld';
    let scriptEl = document.getElementById(schemaId) as HTMLScriptElement | null;
    if (!scriptEl) {
      scriptEl = document.createElement('script');
      scriptEl.id = schemaId;
      scriptEl.type = 'application/ld+json';
      document.head.appendChild(scriptEl);
    }

    const schemaData = listing ? {
      "@context": "https://schema.org",
      "@type": "VacationRental",
      "name": listing.title,
      "description": listing.description,
      "image": listing.photos,
      "url": currentUrl,
      "address": {
        "@type": "PostalAddress",
        "streetAddress": listing.address,
        "addressLocality": listing.city,
        "addressRegion": listing.region || "Kiambu County",
        "addressCountry": "KE"
      },
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": listing.lat || -1.0333,
        "longitude": listing.lng || 37.0693
      },
      "numberOfRooms": listing.bedrooms || 1,
      "occupancy": {
        "@type": "QuantitativeValue",
        "maxValue": listing.maxGuests
      },
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": listing.rating || 5.0,
        "reviewCount": listing.reviewCount || 12
      },
      "offers": {
        "@type": "Offer",
        "priceCurrency": "KES",
        "price": listing.nightlyPrice,
        "availability": listing.isAvailable !== false ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
        "seller": {
          "@type": "Person",
          "name": listing.hostName || "Madam Ann"
        }
      }
    } : {
      "@context": "https://schema.org",
      "@type": "LodgingBusiness",
      "name": "Texas Airbnbs",
      "description": defaultDescription,
      "url": baseUrl,
      "image": defaultImage,
      "telephone": "+254 729 110 857",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": "Thika",
        "addressRegion": "Kiambu County",
        "addressCountry": "KE"
      },
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": -1.0333,
        "longitude": 37.0693
      },
      "priceRange": "$$"
    };

    scriptEl.textContent = JSON.stringify(schemaData);

  }, [title, description, canonicalUrl, imageUrl, type, listing, lang]);

  return null;
};
