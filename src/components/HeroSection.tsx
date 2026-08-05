import React from 'react';
import { Search, MapPin, Calendar, Users, SlidersHorizontal, Sparkles, Keyboard, X } from 'lucide-react';
import { translations, Language } from '../i18n/translations';
import { FilterState } from '../types';

interface HeroSectionProps {
  lang: Language;
  filters: FilterState;
  onFilterChange: (updated: Partial<FilterState>) => void;
  onSearchSubmit: () => void;
  activeQuickTag: string;
  onSelectQuickTag: (tag: string) => void;
  cmsHeadline?: string;
  cmsSubheadline?: string;
  onOpenKeyboardModal?: () => void;
  onOpenCustomFiltersModal?: () => void;
}

const TEXAS_CITIES = [
  { id: 'all', name: 'All Thika Stays' },
  { id: 'Section 9', name: 'Section 9 (Tufted Master Suites)' },
  { id: 'Thika Town Centre', name: 'Thika Town Centre (CBD Skyline)' },
  { id: 'Cravers Area', name: 'Cravers Area (Garden Villas)' },
  { id: 'Landless', name: 'Landless Estate (Stargazing Eco-Domes)' },
  { id: 'Chania Falls', name: 'Chania Falls (Riverfront Sunset Villas)' },
  { id: 'Makongeni', name: 'Makongeni (Executive Apartments)' }
];

const QUICK_TAGS = [
  { id: 'all', label: 'All Stays' },
  { id: 'Section 9', label: '👑 Section 9 Executive' },
  { id: 'Thika Town Centre', label: '🏙️ Thika CBD Skyline' },
  { id: 'Landless', label: '✨ Eco Stargazing Domes' },
  { id: 'Chania Falls', label: '🌊 Chania River Villas' },
  { id: 'Private Plunge Pool', label: '🏊 Private Pools' },
  { id: 'Smart Flat-screen TV', label: '📺 Smart TV & Wifi' }
];

export const HeroSection: React.FC<HeroSectionProps> = ({
  lang,
  filters,
  onFilterChange,
  onSearchSubmit,
  activeQuickTag,
  onSelectQuickTag,
  cmsHeadline,
  cmsSubheadline,
  onOpenKeyboardModal,
  onOpenCustomFiltersModal
}) => {
  const t = translations[lang];

  const activeCustomFiltersCount =
    (filters.minPrice > 0 ? 1 : 0) +
    (filters.maxPrice > 0 ? 1 : 0) +
    (filters.bedrooms > 0 ? 1 : 0) +
    (filters.propertyType && filters.propertyType !== 'all' ? 1 : 0) +
    (filters.amenities ? filters.amenities.length : 0);

  return (
    <section className="relative overflow-hidden bg-stone-900 text-stone-100 py-16 px-4 sm:px-6 lg:px-8 border-b border-stone-800">
      {/* Background Image with High Priority Loading */}
      <div className="absolute inset-0 z-0 opacity-100 overflow-hidden transition-opacity duration-700 ease-in-out">
        <img
          src="/madam_ann_profile.jpg"
          alt="Texas Airbnbs Hero Background"
          fetchPriority="high"
          decoding="async"
          referrerPolicy="no-referrer"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1920&q=80';
          }}
          className="w-full h-full object-cover object-[center_25%] transition-all duration-700 ease-in-out scale-100"
        />
      </div>
      {/* Light subtle gradient overlay to keep text clear without obscuring the portrait image */}
      <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-stone-950/25 to-stone-950/50 z-0 pointer-events-none"></div>

      <div className="relative z-10 max-w-5xl mx-auto text-center space-y-6">
        
        {/* Badge */}
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold tracking-wide uppercase">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Texas Airbnbs • Luxury Stays in Thika Town, Kenya</span>
        </div>

        {/* Hero Title */}
        <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white max-w-4xl mx-auto leading-tight drop-shadow-md">
          {cmsHeadline || t.heroTitle}
        </h1>
        <p className="text-stone-200 text-sm sm:text-base max-w-2xl mx-auto font-medium leading-relaxed drop-shadow-sm">
          {cmsSubheadline || t.heroSubtitle}
        </p>

        {/* Floating Search Bar */}
        <div className="my-6 sm:my-8 bg-stone-900/85 dark:bg-stone-900/90 border border-amber-500/30 dark:border-amber-500/30 rounded-2xl p-3.5 sm:p-4 shadow-2xl shadow-black/50 text-stone-100 max-w-3xl mx-auto text-left backdrop-blur-xl space-y-2.5 sm:space-y-3 ring-1 ring-amber-400/20">
          
          {/* Top Bar: Direct Search Keyword & Virtual Keyboard Launcher */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 bg-stone-800/70 dark:bg-stone-900/80 p-2 sm:p-2.5 rounded-xl border border-stone-700/60 dark:border-stone-800 shadow-inner">
            <div className="flex-1 flex items-center space-x-2 px-2">
              <Search className="w-4 h-4 text-amber-400 shrink-0" />
              <input
                type="text"
                value={filters.searchQuery || ''}
                onChange={(e) => onFilterChange({ searchQuery: e.target.value })}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') onSearchSubmit();
                }}
                placeholder="Search stay name or features (e.g. Section 9, Cottage, Pool, Suite)..."
                className="w-full bg-transparent text-xs sm:text-sm font-light text-stone-100 placeholder-stone-400 focus:outline-none tracking-wide"
              />
              {filters.searchQuery && (
                <button
                  type="button"
                  onClick={() => onFilterChange({ searchQuery: '' })}
                  className="p-1 rounded-full text-stone-400 hover:text-stone-200"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              {/* Custom Search Filters Button */}
              {onOpenCustomFiltersModal && (
                <button
                  type="button"
                  onClick={onOpenCustomFiltersModal}
                  className="relative px-2.5 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 text-[11px] font-semibold flex items-center space-x-1.5 transition-all cursor-pointer whitespace-nowrap"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5 text-amber-400" />
                  <span>Custom Filters</span>
                  {activeCustomFiltersCount > 0 && (
                    <span className="w-4 h-4 rounded-full bg-amber-500 text-stone-950 font-extrabold text-[10px] flex items-center justify-center">
                      {activeCustomFiltersCount}
                    </span>
                  )}
                </button>
              )}

              {/* Virtual Keyboard Trigger Button */}
              {onOpenKeyboardModal && (
                <button
                  type="button"
                  onClick={onOpenKeyboardModal}
                  className="px-2.5 py-1.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 text-[11px] font-semibold flex items-center justify-center space-x-1.5 transition-all cursor-pointer whitespace-nowrap"
                >
                  <Keyboard className="w-4 h-4" />
                  <span className="hidden sm:inline">On-Screen Keyboard</span>
                  <span className="sm:hidden">Keyboard</span>
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3 items-center">
            
            {/* Location dropdown */}
            <div className="flex flex-col space-y-1 p-2.5 rounded-xl bg-stone-800/50 dark:bg-stone-900/60 border border-stone-700/60 dark:border-stone-800 hover:border-amber-500/40 transition-all">
              <label className="text-[10px] font-bold uppercase tracking-widest text-amber-400 flex items-center space-x-1.5">
                <MapPin className="w-3.5 h-3.5 shrink-0" />
                <span>{t.searchLocation}</span>
              </label>
              <select
                value={filters.city}
                onChange={(e) => onFilterChange({ city: e.target.value })}
                className="bg-transparent font-medium text-xs text-stone-100 focus:outline-none cursor-pointer w-full truncate"
              >
                {TEXAS_CITIES.map((c) => (
                  <option key={c.id} value={c.id} className="bg-stone-900 text-stone-100">
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Dates */}
            <div className="flex flex-col space-y-1 p-2.5 rounded-xl bg-stone-800/50 dark:bg-stone-900/60 border border-stone-700/60 dark:border-stone-800 hover:border-amber-500/40 transition-all">
              <label className="text-[10px] font-bold uppercase tracking-widest text-amber-400 flex items-center space-x-1.5">
                <Calendar className="w-3.5 h-3.5 shrink-0" />
                <span>Dates</span>
              </label>
              <div className="flex items-center space-x-1.5 text-xs font-medium overflow-x-auto no-scrollbar">
                <input
                  type="date"
                  value={filters.checkIn}
                  onChange={(e) => onFilterChange({ checkIn: e.target.value })}
                  className="bg-transparent text-stone-200 focus:outline-none text-xs min-w-[100px]"
                />
                <span className="text-stone-400 shrink-0">-</span>
                <input
                  type="date"
                  value={filters.checkOut}
                  onChange={(e) => onFilterChange({ checkOut: e.target.value })}
                  className="bg-transparent text-stone-200 focus:outline-none text-xs min-w-[100px]"
                />
              </div>
            </div>

            {/* Guests */}
            <div className="flex flex-col space-y-1 p-2.5 rounded-xl bg-stone-800/50 dark:bg-stone-900/60 border border-stone-700/60 dark:border-stone-800 hover:border-amber-500/40 transition-all">
              <label className="text-[10px] font-bold uppercase tracking-widest text-amber-400 flex items-center space-x-1.5">
                <Users className="w-3.5 h-3.5 shrink-0" />
                <span>{t.guests}</span>
              </label>
              <select
                value={filters.guests}
                onChange={(e) => onFilterChange({ guests: Number(e.target.value) })}
                className="bg-transparent font-medium text-xs text-stone-100 focus:outline-none cursor-pointer w-full"
              >
                {[1, 2, 3, 4, 5, 6, 8, 10].map((num) => (
                  <option key={num} value={num} className="bg-stone-900 text-stone-100">
                    {num} {num === 1 ? 'Guest' : 'Guests'}
                  </option>
                ))}
              </select>
            </div>

            {/* Submit Search Button */}
            <button
              onClick={onSearchSubmit}
              className="w-full py-2.5 px-5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-bold text-xs sm:text-sm tracking-wide uppercase flex items-center justify-center space-x-2 shadow-lg shadow-amber-500/20 transition-all cursor-pointer h-full min-h-[44px]"
            >
              <Search className="w-4 h-4 stroke-[2.5] shrink-0" />
              <span>Search Stays</span>
            </button>

          </div>
        </div>

        {/* Quick Filter Pill Categories */}
        <div className="flex items-center justify-center space-x-2 pt-2 overflow-x-auto no-scrollbar pb-2">
          {QUICK_TAGS.map((tag) => {
            const isActive = activeQuickTag === tag.id;
            return (
              <button
                key={tag.id}
                onClick={() => onSelectQuickTag(tag.id)}
                className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all border ${
                  isActive
                    ? 'bg-amber-500 text-stone-950 border-amber-400 shadow-md scale-105'
                    : 'bg-stone-800/80 hover:bg-stone-700 text-stone-300 border-stone-700'
                }`}
              >
                {tag.label}
              </button>
            );
          })}
        </div>

      </div>
    </section>
  );
};

export default HeroSection;

