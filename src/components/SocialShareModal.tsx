import React, { useState } from 'react';
import { X, Share2, Copy, Check, MessageSquare } from 'lucide-react';
import { Listing } from '../types';

interface SocialShareModalProps {
  listing: Listing;
  onClose: () => void;
}

export const SocialShareModal: React.FC<SocialShareModalProps> = ({ listing, onClose }) => {
  const [copied, setCopied] = useState(false);

  const shareUrl = `${window.location.origin}/stay/${listing.id}`;
  const shareText = `Check out '${listing.title}' in ${listing.city}, Texas! $${listing.nightlyPrice}/night on Texas Airbnbs:`;

  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`${shareText} ${shareUrl}`)}`;
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/80 backdrop-blur-md flex justify-center p-4 animate-fade-in">
      <div className="relative bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 rounded-3xl max-w-md w-full my-auto shadow-2xl p-6 space-y-5 border border-stone-200 dark:border-stone-800">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-stone-200 dark:border-stone-800">
          <div className="flex items-center space-x-2 font-serif font-bold text-lg">
            <Share2 className="w-5 h-5 text-amber-700 dark:text-amber-400" />
            <h3>Share this Texas Stay</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* OpenGraph Rich Card Preview */}
        <div className="p-3 rounded-2xl bg-stone-50 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700 flex items-center space-x-3">
          <img
            src={listing.photos[0]}
            alt={listing.title}
            referrerPolicy="no-referrer"
            className="w-20 h-20 rounded-xl object-cover flex-shrink-0"
          />
          <div>
            <h4 className="font-bold text-xs line-clamp-1">{listing.title}</h4>
            <p className="text-[11px] text-stone-500">{listing.city}, Texas • ${listing.nightlyPrice}/night</p>
            <span className="text-[10px] text-amber-700 dark:text-amber-400 font-bold block mt-1">
              texasairbnbs.com
            </span>
          </div>
        </div>

        {/* Share Channels */}
        <div className="grid grid-cols-3 gap-3 pt-2">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex flex-col items-center justify-center space-y-1 shadow transition-all"
          >
            <MessageSquare className="w-5 h-5" />
            <span>WhatsApp</span>
          </a>

          <a
            href={twitterUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-3 rounded-2xl bg-stone-900 dark:bg-stone-100 text-stone-100 dark:text-stone-900 font-bold text-xs flex flex-col items-center justify-center space-y-1 shadow transition-all"
          >
            <span className="font-extrabold text-base">X</span>
            <span>Twitter / X</span>
          </a>

          <a
            href={facebookUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex flex-col items-center justify-center space-y-1 shadow transition-all"
          >
            <span className="font-extrabold text-base">f</span>
            <span>Facebook</span>
          </a>
        </div>

        {/* Copy Direct Link */}
        <div className="flex items-center space-x-2 pt-2">
          <input
            type="text"
            readOnly
            value={`${shareText} ${shareUrl}`}
            className="flex-1 p-2.5 rounded-xl bg-stone-100 dark:bg-stone-800 text-xs font-mono text-stone-600 dark:text-stone-300 truncate"
          />
          <button
            onClick={handleCopy}
            className="px-4 py-2.5 rounded-xl bg-amber-700 hover:bg-amber-800 text-white font-bold text-xs flex items-center space-x-1 cursor-pointer"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>

      </div>
    </div>
  );
};

export default SocialShareModal;

