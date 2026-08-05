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
            <meta itemProp="url" content="https://texasairbnbs.com" />
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
                <span itemProp="email">{contactEmail || 'annkungu26@gmail.com'}</span>
              </div>
            </address>
          </div>

          {/* Col 2: Thika Destinations */}
          <div className="space-y-2">
            <h4 className="font-bold text-white uppercase text-[11px] tracking-wider">Top Thika Locations</h4>
            <ul className="space-y-1.5 font-light">
              <li>
                <button onClick={() => onSelectCityFilter('Section 9')} className="hover:text-amber-400 transition-colors cursor-pointer">
                  Section 9 Tufted Master Suites
                </button>
              </li>
              <li>
                <button onClick={() => onSelectCityFilter('Thika Town Centre')} className="hover:text-amber-400 transition-colors cursor-pointer">
                  Thika Town Centre CBD Skyline
                </button>
              </li>
              <li>
                <button onClick={() => onSelectCityFilter('Cravers Area')} className="hover:text-amber-400 transition-colors cursor-pointer">
                  Cravers Area Garden Villas
                </button>
              </li>
              <li>
                <button onClick={() => onSelectCityFilter('Landless')} className="hover:text-amber-400 transition-colors cursor-pointer">
                  Landless Stargazing Eco-Domes
                </button>
              </li>
              <li>
                <button onClick={() => onSelectCityFilter('Chania Falls')} className="hover:text-amber-400 transition-colors cursor-pointer">
                  Chania Falls Riverfront Villas
                </button>
              </li>
              <li>
                <button onClick={() => onSelectCityFilter('Makongeni')} className="hover:text-amber-400 transition-colors cursor-pointer">
                  Makongeni Executive Apartments
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Payment & Safety */}
          <div className="space-y-2">
            <h4 className="font-bold text-white uppercase text-[11px] tracking-wider">Payments & Integrations</h4>
            <ul className="space-y-1.5 font-light text-stone-400">
              <li>M-Pesa Safaricom STK Push (Daraja API)</li>
              <li>East African Banks (Equity, KCB, Stanbic)</li>
              <li>Pesapal & Flutterwave Aggregator Interface</li>
              <li>Dynamic SEO XML Sitemap & Schema.org</li>
            </ul>
          </div>

          {/* Col 4: Localization, Social Media & Links */}
          <div className="space-y-3">
            <h4 className="font-bold text-white uppercase text-[11px] tracking-wider">Language & Currency</h4>
            <div className="flex items-center space-x-2">
              <button
                onClick={onLanguageToggle}
                className="px-3 py-1.5 rounded-xl bg-stone-900 border border-stone-800 text-stone-200 hover:border-amber-500 transition-colors flex items-center space-x-1 cursor-pointer"
              >
                <Globe className="w-3.5 h-3.5" />
                <span className="uppercase font-bold">{lang}</span>
              </button>

              <button
                onClick={onCurrencyToggle}
                className="px-3 py-1.5 rounded-xl bg-stone-900 border border-stone-800 text-stone-200 hover:border-amber-500 transition-colors font-bold cursor-pointer"
              >
                {currency === 'USD' ? '$ USD' : 'KSh KES'}
              </button>
            </div>

            {/* Social Media Links (Footer placement following web design standard) */}
            <div className="pt-2">
              <p className="text-[10px] uppercase font-bold text-stone-400 mb-2 tracking-wider">Follow Texas Airbnbs</p>
              <div className="flex items-center space-x-2">
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noreferrer"
                  className="w-8 h-8 rounded-xl bg-stone-900 hover:bg-stone-800 border border-stone-800 text-stone-300 hover:text-amber-400 flex items-center justify-center transition-all cursor-pointer"
                  title="Instagram"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noreferrer"
                  className="w-8 h-8 rounded-xl bg-stone-900 hover:bg-stone-800 border border-stone-800 text-stone-300 hover:text-amber-400 flex items-center justify-center transition-all cursor-pointer"
                  title="Facebook"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
                <a
                  href="https://twitter.com"
                  target="_blank"
                  rel="noreferrer"
                  className="w-8 h-8 rounded-xl bg-stone-900 hover:bg-stone-800 border border-stone-800 text-stone-300 hover:text-amber-400 flex items-center justify-center transition-all cursor-pointer"
                  title="X (Twitter)"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                </a>
                <a
                  href="https://youtube.com"
                  target="_blank"
                  rel="noreferrer"
                  className="w-8 h-8 rounded-xl bg-stone-900 hover:bg-stone-800 border border-stone-800 text-stone-300 hover:text-amber-400 flex items-center justify-center transition-all cursor-pointer"
                  title="YouTube"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                </a>
              </div>
            </div>

            <div className="pt-2 text-stone-500 space-x-3">
              <a href="/sitemap.xml" target="_blank" className="hover:underline">sitemap.xml</a>
              <a href="/robots.txt" target="_blank" className="hover:underline">robots.txt</a>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-stone-800/80 flex flex-col sm:flex-row items-center justify-between text-stone-500 space-y-2 sm:space-y-0">
          <p>© {new Date().getFullYear()} Texas Airbnbs. {t.footerRights}</p>
          <p className="flex items-center space-x-1">
            <span>Crafted with</span>
            <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500 inline" />
            <span>for Lone Star Travelers</span>
          </p>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
