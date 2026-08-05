import React, { useState, useEffect } from 'react';
import { X, Globe, Check, ShieldCheck, Copy, ExternalLink, Sparkles } from 'lucide-react';

interface GoogleVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentVerification: string;
  onSaveVerification: (code: string) => void;
}

export const GoogleVerificationModal: React.FC<GoogleVerificationModalProps> = ({
  isOpen,
  onClose,
  currentVerification,
  onSaveVerification
}) => {
  const [inputValue, setInputValue] = useState('');
  const [isSaved, setIsSaved] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setInputValue(currentVerification || '');
      setIsSaved(false);
    }
  }, [isOpen, currentVerification]);

  if (!isOpen) return null;

  // Helper to extract clean verification token
  const extractToken = (val: string): string => {
    if (!val) return '';
    let clean = val.trim();
    // If full HTML tag pasted: <meta name="google-site-verification" content="XYZ" />
    const metaMatch = clean.match(/content=["']([^"']+)["']/i);
    if (metaMatch && metaMatch[1]) {
      clean = metaMatch[1];
    } else if (clean.startsWith('google-site-verification=')) {
      clean = clean.replace('google-site-verification=', '');
    }
    return clean;
  };

  const cleanToken = extractToken(inputValue);
  const fullMetaTag = cleanToken
    ? `<meta name="google-site-verification" content="${cleanToken}" />`
    : '<meta name="google-site-verification" content="your-verification-code-here" />';

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveVerification(cleanToken);
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 1500);
  };

  const handleCopyMetaTag = () => {
    navigator.clipboard.writeText(fullMetaTag);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="w-full max-w-lg bg-stone-900 border border-stone-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col text-stone-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-stone-800 flex items-center justify-between bg-stone-950/60">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-lg text-white flex items-center space-x-2">
                <span>Google Site Verification</span>
                <Sparkles className="w-4 h-4 text-amber-400" />
              </h3>
              <p className="text-xs text-stone-400">
                Verify website ownership in Google Search Console
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

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-5 sm:p-6 space-y-5 text-xs sm:text-sm">
          <div className="space-y-2">
            <label className="block font-bold text-stone-200 text-xs">
              Paste Google Site Verification Code or HTML Meta Tag:
            </label>
            <textarea
              rows={3}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder='Paste e.g. <meta name="google-site-verification" content="AbC_123..." /> OR just your verification token AbC_123...'
              className="w-full p-3.5 rounded-2xl bg-stone-950 border border-stone-700/80 focus:border-amber-500 focus:outline-none text-stone-100 font-mono text-xs placeholder-stone-500"
            />
            <p className="text-[11px] text-stone-400 leading-relaxed">
              You can paste the entire HTML tag from Google Search Console, or just your verification string. We will clean it automatically and inject it into your website&apos;s &lt;head&gt;.
            </p>
          </div>

          {/* Live Preview Box */}
          <div className="p-3.5 rounded-2xl bg-stone-950 border border-stone-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">
                Active Header &lt;meta&gt; Preview
              </span>
              <button
                type="button"
                onClick={handleCopyMetaTag}
                className="text-[11px] text-stone-400 hover:text-white flex items-center space-x-1 cursor-pointer"
              >
                <Copy className="w-3 h-3" />
                <span>{copied ? 'Copied!' : 'Copy Tag'}</span>
              </button>
            </div>
            <div className="font-mono text-xs text-emerald-400 bg-stone-900/90 p-2.5 rounded-xl break-all">
              {fullMetaTag}
            </div>
          </div>

          {/* Step-by-Step Instructions */}
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-2">
            <h4 className="font-bold text-xs text-amber-300">How to verify:</h4>
            <ol className="list-decimal list-inside space-y-1 text-stone-300 text-xs">
              <li>Open Google Search Console and add property <strong className="text-white">https://texasairbnbs.com</strong></li>
              <li>Select <strong>HTML tag</strong> verification method</li>
              <li>Copy and paste your tag or code in the field above</li>
              <li>Click <strong>Save &amp; Verify Site</strong> below, then click <strong>Verify</strong> in Google Search Console</li>
            </ol>
          </div>

          {/* Footer Buttons */}
          <div className="flex items-center justify-between pt-2">
            <a
              href="https://search.google.com/search-console"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-1.5 text-xs text-amber-400 hover:text-amber-300 font-semibold"
            >
              <span>Open Search Console</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 font-bold text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-extrabold text-xs flex items-center space-x-1.5 shadow-lg shadow-amber-500/20 cursor-pointer"
              >
                <Check className="w-4 h-4 stroke-[2.5]" />
                <span>{isSaved ? 'Saved to <head>!' : 'Save & Verify Site'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GoogleVerificationModal;

