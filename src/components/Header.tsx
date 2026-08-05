import React from 'react';
import {
  Sun,
  Moon,
  Globe,
  Gift,
  Shield
} from 'lucide-react';
import { translations, Language } from '../i18n/translations';
import { UserRole } from '../types';

interface HeaderProps {
  lang: Language;
  onLanguageToggle: () => void;
  currency: 'USD' | 'KES';
  onCurrencyToggle: () => void;
  darkMode: boolean;
  onDarkModeToggle: () => void;
  role: UserRole;
  onRoleToggle: (newRole: UserRole) => void;
  wishlistCount: number;
  onOpenWishlist: () => void;
  onOpenMyBookings: () => void;
  onOpenAdmin: () => void;
  onOpenReferral: () => void;
  pendingBookingsCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  lang,
  onLanguageToggle,
  currency,
  onCurrencyToggle,
  darkMode,
  onDarkModeToggle,
  role,
  onRoleToggle,
  wishlistCount,
  onOpenWishlist,
  onOpenMyBookings,
  onOpenAdmin,
  onOpenReferral,
  pendingBookingsCount
}) => {
  const t = translations[lang];

  return (
    <header className="sticky top-0 z-40 backdrop-blur-md bg-stone-50/90 dark:bg-stone-900/90 border-b border-stone-200 dark:border-stone-800 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        
        {/* Brand Logo & Tagline */}
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <div className="w-11 h-11 rounded-2xl bg-stone-900 overflow-hidden p-1 shadow-md shadow-amber-900/10 border border-amber-600/30 flex items-center justify-center">
            <img src="/favicon.svg" alt="Texas Airbnbs Icon" className="w-full h-full object-contain" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-serif font-bold text-xl tracking-tight text-stone-900 dark:text-stone-100">
                Texas <span className="text-amber-700 dark:text-amber-500">Airbnbs</span>
              </span>
              <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-300/50 dark:border-amber-700/50">
                Lone Star Stays
              </span>
            </div>
            <p className="text-xs text-stone-500 dark:text-stone-400 hidden md:block">
              {t.tagline}
            </p>
          </div>
        </div>

        {/* Right Navigation & Controls */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          
          {/* Referral Button */}
          <button
            onClick={onOpenReferral}
            className="hidden lg:flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium rounded-xl text-amber-900 dark:text-amber-200 bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800/80 hover:bg-amber-100 transition-colors"
            title="Earn KSh 2,500 credit"
          >
            <Gift className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span>Earn KSh 2,500</span>
          </button>

          {/* Currency Indicator */}
          <div
            className="px-2.5 py-1.5 text-xs font-bold rounded-xl text-stone-700 dark:text-stone-300 bg-stone-100 dark:bg-stone-800"
            title="Currency: Kenyan Shillings (KSh)"
          >
            KSh KES
          </div>

          {/* Language Selector */}
          <button
            onClick={onLanguageToggle}
            className="flex items-center space-x-1.5 px-2.5 py-1.5 text-xs font-medium rounded-xl text-stone-700 dark:text-stone-300 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors"
            title="Switch Language"
          >
            <Globe className="w-3.5 h-3.5" />
            <span className="uppercase">{lang}</span>
          </button>

          {/* Dark/Light Mode */}
          <button
            onClick={onDarkModeToggle}
            className="flex items-center space-x-1.5 px-2.5 py-1.5 text-xs font-medium rounded-xl text-stone-700 dark:text-stone-200 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 transition-all border border-stone-200 dark:border-stone-700 shadow-sm"
            title={darkMode ? "Moon (Dark Mode active) - Click to switch to Sun (Bright Mode)" : "Sun (Bright Mode active) - Click to switch to Moon (Dark Mode)"}
            aria-label={darkMode ? "Dark Mode active" : "Bright Mode active"}
          >
            {darkMode ? (
              <>
                <Moon className="w-4 h-4 text-amber-400 fill-amber-400/20 animate-pulse" />
                <span className="text-xs font-bold text-amber-400">Moon</span>
              </>
            ) : (
              <>
                <Sun className="w-4 h-4 text-amber-600 fill-amber-500/20 animate-pulse" />
                <span className="text-xs font-bold text-amber-700">Sun</span>
              </>
            )}
          </button>

          {/* Admin Switcher / Dashboard Trigger */}
          {role === 'admin' ? (
            <button
              onClick={onOpenAdmin}
              className="relative flex items-center space-x-1.5 px-3.5 py-2 text-xs font-bold rounded-xl text-white bg-gradient-to-r from-stone-900 to-amber-900 dark:from-stone-800 dark:to-amber-800 hover:opacity-95 shadow-sm transition-all cursor-pointer"
            >
              <Shield className="w-4 h-4 text-amber-400" />
              <span>Admin Panel</span>
              {pendingBookingsCount > 0 && (
                <span className="w-5 h-5 bg-amber-500 text-stone-950 font-extrabold text-[10px] rounded-full flex items-center justify-center animate-bounce">
                  {pendingBookingsCount}
                </span>
              )}
            </button>
          ) : (
            <button
              onClick={() => onRoleToggle('admin')}
              className="px-3 py-2 text-xs font-medium rounded-xl text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700 hover:bg-amber-50 dark:hover:bg-amber-950/50 transition-colors cursor-pointer"
              title="Switch to Admin Mode"
            >
              Admin Mode
            </button>
          )}

        </div>
      </div>
    </header>
  );
};
