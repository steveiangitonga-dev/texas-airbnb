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
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://thikabnbs.com';

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
