import React from 'react';
import { X, SlidersHorizontal, DollarSign, Bed, Home, Wifi, Sparkles, ArrowUpDown, Check, RotateCcw } from 'lucide-react';
import { FilterState } from '../types';

interface CustomSearchFiltersModalProps {
  isOpen: boolean;
  onClose: () => void;
  filters: FilterState;
  onFilterChange: (updated: Partial<FilterState>) => void;
  onApply: () => void;
  onReset: () => void;
  matchingCount: number;
}

const PROPERTY_TYPES = [
  { id: 'all', label: 'All Types' },
  { id: 'suite', label: '👑 Tufted Master Suite' },
  { id: 'apartment', label: '🏙️ Executive Apartment' },
  { id: 'villa', label: '🏡 Garden Villa' },
  { id: 'eco', label: '✨ Stargazing Eco-Dome' },
  { id: 'cottage', label: '🌊 Riverfront Cottage' }
];

const AMENITIES_LIST = [
  'Fast Wi-Fi (50Mbps+)',
  'Private Plunge Pool',
  'Backup Power Inverter',
  'Hot Shower',
  'Smart Flat-screen TV',
  'Balcony Skyline Views',
  'Fully Equipped Kitchen',
  'Secure Gated Parking',
  'Workstation Desk'
];

export const CustomSearchFiltersModal: React.FC<CustomSearchFiltersModalProps> = ({
  isOpen,
  onClose,
  filters,
  onFilterChange,
  onApply,
  onReset,
  matchingCount
}) => {
  if (!isOpen) return null;

  const toggleAmenity = (amenity: string) => {
    const current = filters.amenities || [];
    if (current.includes(amenity)) {
      onFilterChange({ amenities: current.filter((a) => a !== amenity) });
    } else {
      onFilterChange({ amenities: [...current, amenity] });
    }
  };

  const activeFiltersCount =
    (filters.city && filters.city !== 'all' ? 1 : 0) +
    (filters.minPrice > 0 ? 1 : 0) +
    (filters.maxPrice > 0 ? 1 : 0) +
    (filters.bedrooms > 0 ? 1 : 0) +
    (filters.propertyType && filters.propertyType !== 'all' ? 1 : 0) +
    (filters.amenities ? filters.amenities.length : 0) +
    (filters.searchQuery ? 1 : 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="w-full max-w-xl bg-stone-900 border border-stone-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-stone-800 flex items-center justify-between bg-stone-950/60">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <SlidersHorizontal className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-base sm:text-lg text-white flex items-center space-x-2">
                <span>Customize Search Filters</span>
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              </h3>
              <p className="text-xs text-stone-400 font-light">
                Tailor stay preferences for Thika Town, Kenya
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-stone-800 text-stone-300 hover:text-white hover:bg-stone-700 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Filters Body */}
        <div className="p-5 overflow-y-auto space-y-6 text-stone-200 text-xs sm:text-sm">
          
          {/* Sort By Selector */}
          <div className="space-y-2">
            <label className="font-bold text-amber-400 uppercase tracking-wider text-[11px] flex items-center space-x-1.5">
              <ArrowUpDown className="w-3.5 h-3.5" />
              <span>Sort Stays By</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {[
                { id: 'recommended', label: '⭐ Recommended' },
                { id: 'price_low', label: '💰 Price: Low to High' },
                { id: 'price_high', label: '💎 Price: High to Low' },
                { id: 'rating', label: '🌟 Highest Rating' },
                { id: 'popularity', label: '🔥 Most Popular' }
              ].map((sortItem) => {
                const isSelected = (filters.sortBy || 'recommended') === sortItem.id;
                return (
                  <button
                    key={sortItem.id}
                    type="button"
                    onClick={() => onFilterChange({ sortBy: sortItem.id as any })}
                    className={`p-2.5 rounded-xl text-xs font-semibold text-left transition-all border ${
                      isSelected
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500 font-bold'
                        : 'bg-stone-950/70 border-stone-800 hover:border-stone-700 text-stone-300'
                    }`}
                  >
                    {sortItem.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Nightly Price Filter */}
          <div className="space-y-2">
            <label className="font-bold text-amber-400 uppercase tracking-wider text-[11px] flex items-center space-x-1.5">
              <DollarSign className="w-3.5 h-3.5" />
              <span>Nightly Price Range (KSh)</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-[11px] text-stone-400">Min Price (KSh)</span>
                <input
                  type="number"
                  value={filters.minPrice || ''}
                  onChange={(e) => onFilterChange({ minPrice: Number(e.target.value) })}
                  placeholder="e.g. 2000"
                  className="w-full mt-1 p-2.5 rounded-xl bg-stone-950 border border-stone-800 text-white font-medium focus:border-amber-500 focus:outline-none"
                />
              </div>
              <div>
                <span className="text-[11px] text-stone-400">Max Price (KSh)</span>
                <input
                  type="number"
                  value={filters.maxPrice || ''}
                  onChange={(e) => onFilterChange({ maxPrice: Number(e.target.value) })}
                  placeholder="e.g. 10000"
                  className="w-full mt-1 p-2.5 rounded-xl bg-stone-950 border border-stone-800 text-white font-medium focus:border-amber-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Quick Price Presets */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1">
              {[
                { label: 'All Prices', min: 0, max: 0 },
                { label: 'Under KSh 3,500', min: 0, max: 3500 },
                { label: 'KSh 3,500 - 7,000', min: 3500, max: 7000 },
                { label: 'Over KSh 7,000', min: 7000, max: 0 }
              ].map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => onFilterChange({ minPrice: p.min, maxPrice: p.max })}
                  className="px-2.5 py-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 text-[11px] font-medium whitespace-nowrap border border-stone-700/50"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Bedrooms & Capacity */}
          <div className="space-y-2">
            <label className="font-bold text-amber-400 uppercase tracking-wider text-[11px] flex items-center space-x-1.5">
              <Bed className="w-3.5 h-3.5" />
              <span>Minimum Bedrooms</span>
            </label>
            <div className="flex items-center gap-2">
              {[0, 1, 2, 3, 4].map((num) => {
                const isSelected = (filters.bedrooms || 0) === num;
                return (
                  <button
                    key={num}
                    type="button"
                    onClick={() => onFilterChange({ bedrooms: num })}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${
                      isSelected
                        ? 'bg-amber-500 text-stone-950 border-amber-400'
                        : 'bg-stone-950/70 border-stone-800 hover:border-stone-700 text-stone-300'
                    }`}
                  >
                    {num === 0 ? 'Any' : `${num}+ Bed`}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Property Types */}
          <div className="space-y-2">
            <label className="font-bold text-amber-400 uppercase tracking-wider text-[11px] flex items-center space-x-1.5">
              <Home className="w-3.5 h-3.5" />
              <span>Property Type</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {PROPERTY_TYPES.map((pt) => {
                const isSelected = (filters.propertyType || 'all') === pt.id;
                return (
                  <button
                    key={pt.id}
                    type="button"
                    onClick={() => onFilterChange({ propertyType: pt.id })}
                    className={`p-2.5 rounded-xl text-xs font-semibold text-left border transition-all ${
                      isSelected
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500 font-bold'
                        : 'bg-stone-950/70 border-stone-800 hover:border-stone-700 text-stone-300'
                    }`}
                  >
                    {pt.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Amenities Checklist */}
          <div className="space-y-2">
            <label className="font-bold text-amber-400 uppercase tracking-wider text-[11px] flex items-center space-x-1.5">
              <Wifi className="w-3.5 h-3.5" />
              <span>Desired Amenities</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {AMENITIES_LIST.map((amenity) => {
                const isChecked = (filters.amenities || []).includes(amenity);
                return (
                  <label
                    key={amenity}
                    onClick={() => toggleAmenity(amenity)}
                    className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                      isChecked
                        ? 'bg-amber-500/15 border-amber-500/60 text-amber-200'
                        : 'bg-stone-950/50 border-stone-800 text-stone-300 hover:bg-stone-800/50'
                    }`}
                  >
                    <span className="text-xs font-medium">{amenity}</span>
                    <div className={`w-4 h-4 rounded-md border flex items-center justify-center ${
                      isChecked ? 'bg-amber-500 border-amber-400 text-stone-950' : 'border-stone-700'
                    }`}>
                      {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-stone-950 border-t border-stone-800 flex items-center justify-between">
          <button
            type="button"
            onClick={onReset}
            className="px-4 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 font-bold text-xs flex items-center space-x-1.5 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset All ({activeFiltersCount})</span>
          </button>

          <button
            type="button"
            onClick={() => {
              onApply();
              onClose();
            }}
            className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-extrabold text-xs sm:text-sm flex items-center space-x-2 shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
          >
            <Check className="w-4 h-4 stroke-[2.5]" />
            <span>Show {matchingCount} Stays</span>
          </button>
        </div>

      </div>
    </div>
  );
};
