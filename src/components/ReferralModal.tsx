import React, { useState } from 'react';
import { X, Gift, Copy, Check, Sparkles, Users } from 'lucide-react';
import { translations, Language } from '../i18n/translations';

interface ReferralModalProps {
  lang: Language;
  referralCode: string;
  referralCredits: number;
  onClose: () => void;
}

export const ReferralModal: React.FC<ReferralModalProps> = ({
  lang,
  referralCode,
  referralCredits,
  onClose
}) => {
  const t = translations[lang];
  const [copied, setCopied] = useState(false);

  const referralUrl = `${window.location.origin}/?ref=${referralCode}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(referralUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/80 backdrop-blur-md flex justify-center p-4 animate-fade-in">
      <div className="relative bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 rounded-3xl max-w-md w-full my-auto shadow-2xl p-6 space-y-6 border border-amber-300 dark:border-amber-800">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-stone-200 dark:border-stone-800">
          <div className="flex items-center space-x-2">
            <Gift className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            <h3 className="font-serif font-bold text-lg">{t.referralTitle}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Promo Hero Box */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 text-white text-center space-y-2 shadow-lg">
          <Sparkles className="w-8 h-8 mx-auto text-amber-200 animate-pulse" />
          <h4 className="font-serif font-bold text-2xl">Give KSh 2,500, Get KSh 2,500</h4>
          <p className="text-xs text-amber-100 font-light max-w-xs mx-auto">
            {t.referralDesc}
          </p>
        </div>

        {/* Credit Balance */}
        <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 flex items-center justify-between">
          <span className="text-xs font-bold text-stone-600 dark:text-stone-300">Your Earned Credits</span>
          <span className="font-bold text-xl text-amber-700 dark:text-amber-400 font-serif">KSh {referralCredits.toLocaleString()}</span>
        </div>

        {/* Code & Link Box */}
        <div className="space-y-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-stone-500">Your Referral Code</label>
          <div className="flex items-center space-x-2">
            <span className="flex-1 p-3 rounded-xl bg-stone-100 dark:bg-stone-800 font-mono font-bold text-center text-sm text-amber-800 dark:text-amber-400 uppercase tracking-widest border border-stone-300 dark:border-stone-700">
              {referralCode}
            </span>
            <button
              onClick={handleCopy}
              className="px-4 py-3 rounded-xl bg-amber-700 hover:bg-amber-800 text-white font-bold text-xs flex items-center space-x-1 cursor-pointer"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied' : t.copyLink}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
