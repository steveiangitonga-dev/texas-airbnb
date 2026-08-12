import React from 'react';
import { Compass, Globe, Shield, Heart, Phone, Mail } from 'lucide-react';
import { translations, Language } from '../i18n/translations';

interface FooterProps {
  lang: Language;
  onLanguageToggle: () => void;
  currency: 'USD' | 'KES';
  onCurrencyToggle: () => void;
  onSelectCityFilter: (city: string) => void;
  contactPhone?: string;
  contactEmail?: string;
}

export const Footer: React.FC<FooterProps> = ({
  lang,
  onLanguageToggle,
  currency,
  onCurrencyToggle,
  onSelectCityFilter,
  contactPhone,
  contactEmail
}) => {
  const t = translations[lang];

  return (
    <footer className="bg-stone-950 text-stone-300 py-12 px-4 sm:px-6 lg:px-8 border-t border-stone-800 text-xs">
      <div className="max-w-7xl mx-auto space-y-8">
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Col 1: Brand & Local SEO NAP (Name, Address, Phone) */}
          <div className="space-y-3" itemScope itemType="https://schema.org/LodgingBusiness">
            <meta itemProp="name" content="Texas Airbnbs" />
            <meta itemProp="url" content="https://thikabnbs.com" />
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-xl bg-amber-600 flex items-center justify-center text-white">
                <Compass className="w-5 h-5" />
              </div>
              <span className="font-serif font-bold text-lg text-white">Texas Airbnbs</span>
            </div>
            <p className="text-stone-400 font-light leading-relaxed" itemProp="description">
              Texas Airbnbs is a signature hospitality brand offering luxury vacation stays, tufted executive suites, and garden villas across Thika Town, Kiambu County, Kenya (near Nairobi).
            </p>
            <address className="not-italic pt-1 space-y-1.5 text-stone-300 text-xs font-medium" itemProp="address" itemScope itemType="https://schema.org/PostalAddress">
              <div className="flex items-start space-x-2">
                <Shield className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                <span>
                  <strong className="text-white block font-semibold" itemProp="streetAddress">Section 9 & Thika Town Centre</strong>
                  <span itemProp="addressLocality">Thika Town</span>, <span itemProp="addressRegion">Kiambu County</span>, <span itemProp="addressCountry">Kenya</span>
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span itemProp="telephone">{contactPhone || '+254 729 110 857 (0729110857)'}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span>{contactEmail || 'info@thikabnbs.com'}</span>
              </div>
            </address>
          </div>

          {/* other columns unchanged */}
        </div>
      </div>
    </footer>
  );
};
