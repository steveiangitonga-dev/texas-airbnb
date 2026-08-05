import React, { useState, useEffect } from 'react';
import { Search, Keyboard, X, Delete, Sparkles, MapPin, RotateCcw, Check } from 'lucide-react';
import { Listing } from '../types';

interface SearchKeyboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onPerformSearch: (query: string) => void;
  listings: Listing[];
}

const POPULAR_THIKA_TAGS = [
  'Section 9',
  'Town Centre',
  'Cottage',
  'Executive',
  'Villa',
  'Pool',
  'Riverfront',
  'Eco Dome',
  'Chania',
  'Landless',
  'Penthouse',
  'Garden'
];

export const SearchKeyboardModal: React.FC<SearchKeyboardModalProps> = ({
  isOpen,
  onClose,
  searchQuery,
  onSearchChange,
  onPerformSearch,
  listings
}) => {
  const [localQuery, setLocalQuery] = useState(searchQuery);
  const [isShiftActive, setIsShiftActive] = useState(false);
  const [showNumbers, setShowNumbers] = useState(false);

  useEffect(() => {
    setLocalQuery(searchQuery);
  }, [searchQuery, isOpen]);

  if (!isOpen) return null;

  const handleKeyPress = (char: string) => {
    const nextChar = isShiftActive ? char.toUpperCase() : char.toLowerCase();
    const updated = localQuery + nextChar;
    setLocalQuery(updated);
    onSearchChange(updated);
    if (isShiftActive) setIsShiftActive(false);
  };

  const handleBackspace = () => {
    const updated = localQuery.slice(0, -1);
    setLocalQuery(updated);
    onSearchChange(updated);
  };

  const handleClear = () => {
    setLocalQuery('');
    onSearchChange('');
  };

  const handleSpace = () => {
    const updated = localQuery + ' ';
    setLocalQuery(updated);
    onSearchChange(updated);
  };

  const handleSelectPreset = (tag: string) => {
    setLocalQuery(tag);
    onSearchChange(tag);
  };

  const handleSearchSubmit = () => {
    onPerformSearch(localQuery);
    onClose();
    // Smooth scroll to listings grid
    setTimeout(() => {
      const element = document.getElementById('listings-section');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  // Calculate live matching count
  const matchingCount = listings.filter((l) => {
    if (!localQuery.trim()) return true;
    const q = localQuery.toLowerCase().trim();
    return (
      l.title.toLowerCase().includes(q) ||
      l.description.toLowerCase().includes(q) ||
      l.city.toLowerCase().includes(q) ||
      l.region.toLowerCase().includes(q) ||
      l.amenities.some((a) => a.toLowerCase().includes(q))
    );
  }).length;

  const keyboardRowsLetters = [
    ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
    ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
    ['z', 'x', 'c', 'v', 'b', 'n', 'm']
  ];

  const keyboardRowsNumbers = [
    ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
    ['-', '/', ':', ';', '(', ')', '$', '&', '@', '"'],
    ['.', ',', '?', '!', "'", '#', '%', '*']
  ];

  const activeRows = showNumbers ? keyboardRowsNumbers : keyboardRowsLetters;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-stone-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="w-full max-w-2xl bg-stone-900 border border-stone-800 rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] sm:max-h-[85vh] transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-stone-800 flex items-center justify-between bg-stone-950/50">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Keyboard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-base sm:text-lg text-white flex items-center space-x-2">
                <span>Search Thika Stays</span>
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              </h3>
              <p className="text-xs text-stone-400 font-light">
                Type stay name, location or features using on-screen keyboard
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-stone-800 text-stone-300 hover:text-white hover:bg-stone-700 transition-colors cursor-pointer"
            aria-label="Close search keyboard"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Input & Search Controls Bar */}
        <div className="p-4 bg-stone-900 space-y-3">
          <div className="relative flex items-center">
            <Search className="absolute left-3.5 w-5 h-5 text-amber-400 pointer-events-none" />
            <input
              type="text"
              value={localQuery}
              onChange={(e) => {
                setLocalQuery(e.target.value);
                onSearchChange(e.target.value);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSearchSubmit();
                }
              }}
              placeholder="e.g. Section 9, Cottage, Pool, Executive..."
              className="w-full pl-11 pr-24 py-3 rounded-2xl bg-stone-950 border-2 border-amber-500/50 focus:border-amber-400 text-white placeholder-stone-500 font-medium text-sm sm:text-base focus:outline-none shadow-inner"
              autoFocus
            />
            
            <div className="absolute right-2 flex items-center space-x-1">
              {localQuery && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="p-1.5 rounded-xl text-stone-400 hover:text-stone-200 hover:bg-stone-800 transition-colors"
                  title="Clear input"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              )}
              <button
                type="button"
                onClick={handleSearchSubmit}
                className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs flex items-center space-x-1 shadow-md transition-all cursor-pointer"
              >
                <span>Search</span>
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              </button>
            </div>
          </div>

          {/* Live Search Status Match Badge */}
          <div className="flex items-center justify-between text-xs px-1">
            <span className="text-stone-400 flex items-center space-x-1">
              <MapPin className="w-3.5 h-3.5 text-amber-500" />
              <span>Matching Thika Stays:</span>
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 font-semibold text-xs">
              {matchingCount} {matchingCount === 1 ? 'stay found' : 'stays found'}
            </span>
          </div>

          {/* Quick Thika Search Presets */}
          <div className="pt-1">
            <p className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider mb-1.5">Quick Thika Keywords:</p>
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
              {POPULAR_THIKA_TAGS.map((tag) => {
                const isActive = localQuery.toLowerCase() === tag.toLowerCase();
                return (
                  <button
                    key={tag}
                    onClick={() => handleSelectPreset(tag)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all border ${
                      isActive
                        ? 'bg-amber-500 text-stone-950 border-amber-400 font-bold shadow-md'
                        : 'bg-stone-950/80 hover:bg-stone-800 text-stone-300 border-stone-800 hover:border-stone-700'
                    }`}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* On-Screen Virtual Keyboard Keys */}
        <div className="p-3 sm:p-5 bg-stone-950 border-t border-stone-800/80 space-y-2 select-none">
          
          {/* Row 1 */}
          <div className="flex justify-center gap-1 sm:gap-1.5">
            {activeRows[0].map((key) => {
              const displayKey = isShiftActive && !showNumbers ? key.toUpperCase() : key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => handleKeyPress(key)}
                  className="flex-1 max-w-[48px] h-11 sm:h-12 rounded-xl bg-stone-800 hover:bg-stone-700 active:bg-amber-500 active:text-stone-950 text-stone-100 font-semibold text-sm sm:text-base border border-stone-700/60 shadow-md transition-all flex items-center justify-center cursor-pointer"
                >
                  {displayKey}
                </button>
              );
            })}
          </div>

          {/* Row 2 */}
          <div className="flex justify-center gap-1 sm:gap-1.5 px-2">
            {activeRows[1].map((key) => {
              const displayKey = isShiftActive && !showNumbers ? key.toUpperCase() : key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => handleKeyPress(key)}
                  className="flex-1 max-w-[48px] h-11 sm:h-12 rounded-xl bg-stone-800 hover:bg-stone-700 active:bg-amber-500 active:text-stone-950 text-stone-100 font-semibold text-sm sm:text-base border border-stone-700/60 shadow-md transition-all flex items-center justify-center cursor-pointer"
                >
                  {displayKey}
                </button>
              );
            })}
          </div>

          {/* Row 3 (with Shift & Backspace) */}
          <div className="flex justify-center gap-1 sm:gap-1.5">
            {!showNumbers && (
              <button
                type="button"
                onClick={() => setIsShiftActive(!isShiftActive)}
                className={`w-12 sm:w-16 h-11 sm:h-12 rounded-xl font-bold text-xs uppercase tracking-wider border shadow-md transition-all flex items-center justify-center cursor-pointer ${
                  isShiftActive
                    ? 'bg-amber-500 text-stone-950 border-amber-400'
                    : 'bg-stone-800 hover:bg-stone-700 text-stone-300 border-stone-700/60'
                }`}
              >
                ⇧ Shift
              </button>
            )}

            {activeRows[2].map((key) => {
              const displayKey = isShiftActive && !showNumbers ? key.toUpperCase() : key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => handleKeyPress(key)}
                  className="flex-1 max-w-[48px] h-11 sm:h-12 rounded-xl bg-stone-800 hover:bg-stone-700 active:bg-amber-500 active:text-stone-950 text-stone-100 font-semibold text-sm sm:text-base border border-stone-700/60 shadow-md transition-all flex items-center justify-center cursor-pointer"
                >
                  {displayKey}
                </button>
              );
            })}

            <button
              type="button"
              onClick={handleBackspace}
              className="w-12 sm:w-16 h-11 sm:h-12 rounded-xl bg-stone-800 hover:bg-stone-700 active:bg-rose-500 text-rose-300 font-bold border border-stone-700/60 shadow-md transition-all flex items-center justify-center cursor-pointer"
              title="Backspace"
            >
              <Delete className="w-5 h-5" />
            </button>
          </div>

          {/* Row 4 (Bottom Bar: 123/ABC, Space, Clear, Perform Search) */}
          <div className="flex justify-center gap-1.5 pt-1">
            <button
              type="button"
              onClick={() => setShowNumbers(!showNumbers)}
              className="w-14 sm:w-16 h-11 sm:h-12 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 font-bold text-xs border border-stone-700/60 shadow-md transition-all flex items-center justify-center cursor-pointer"
            >
              {showNumbers ? 'ABC' : '123'}
            </button>

            <button
              type="button"
              onClick={handleSpace}
              className="flex-1 h-11 sm:h-12 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 font-bold text-xs uppercase border border-stone-700/60 shadow-md transition-all flex items-center justify-center cursor-pointer tracking-widest"
            >
              Space
            </button>

            <button
              type="button"
              onClick={handleClear}
              className="px-3 h-11 sm:h-12 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-white font-semibold text-xs border border-stone-700/60 shadow-md transition-all flex items-center justify-center cursor-pointer"
            >
              Clear
            </button>

            <button
              type="button"
              onClick={handleSearchSubmit}
              className="px-5 h-11 sm:h-12 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-extrabold text-xs sm:text-sm border border-amber-400 shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
            >
              <Search className="w-4 h-4 stroke-[2.5]" />
              <span>Search Stays</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
