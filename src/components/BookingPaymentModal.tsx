import React, { useState } from 'react';
import {
  X,
  CreditCard,
  Smartphone,
  Building2,
  CheckCircle2,
  Lock,
  ArrowRight,
  ShieldAlert,
  Loader2,
  Check
} from 'lucide-react';
import { BookingRequest } from '../types';
import { translations, Language } from '../i18n/translations';

interface BookingPaymentModalProps {
  booking: BookingRequest;
  lang: Language;
  currency: 'USD' | 'KES';
  usdToKesRate: number;
  onClose: () => void;
  onPayMpesa: (bookingId: string, phone: string) => Promise<void>;
  onPayAggregator: (
    bookingId: string,
    bankName: string,
    provider: 'pesapal' | 'flutterwave'
  ) => Promise<void>;
  onPayUponArrival?: (bookingId: string) => Promise<void>;
}

const EAST_AFRICAN_BANKS = [
  'Equity Bank',
  'KCB Bank',
  'Stanbic Bank',
  'NCBA Bank',
  'Absa Bank Kenya',
  'Co-operative Bank',
  'DTB (Diamond Trust Bank)'
];

export const BookingPaymentModal: React.FC<BookingPaymentModalProps> = ({
  booking,
  lang,
  currency,
  usdToKesRate,
  onClose,
  onPayMpesa,
  onPayAggregator,
  onPayUponArrival
}) => {
  const t = translations[lang];

  const [paymentTab, setPaymentTab] = useState<'mpesa' | 'bank' | 'arrival'>('mpesa');
  const [mpesaPhone, setMpesaPhone] = useState(booking.guestPhone || '');
  const [selectedBank, setSelectedBank] = useState(EAST_AFRICAN_BANKS[0]);
  const [aggregatorProvider, setAggregatorProvider] = useState<'pesapal' | 'flutterwave'>('pesapal');

  const [isProcessing, setIsProcessing] = useState(false);
  const [stkPushStep, setStkPushStep] = useState<'idle' | 'prompted' | 'success'>('idle');
  const [countdown, setCountdown] = useState(15);

  const amountKes = Math.round(booking.totalAmount);

  const handleMpesaPay = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setStkPushStep('prompted');

    let timer = 3;
    const interval = setInterval(() => {
      timer -= 1;
      setCountdown(timer);
      if (timer <= 0) {
        clearInterval(interval);
        onPayMpesa(booking.id, mpesaPhone)
          .then(() => {
            setStkPushStep('success');
            setIsProcessing(false);
          })
          .catch(() => {
            setIsProcessing(false);
            setStkPushStep('idle');
          });
      }
    }, 1000);
  };

  const handleBankPay = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    await onPayAggregator(booking.id, selectedBank, aggregatorProvider);
    setStkPushStep('success');
    setIsProcessing(false);
  };

  const handleArrivalPay = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    if (onPayUponArrival) {
      await onPayUponArrival(booking.id);
    } else {
      await fetch(`/api/bookings/${booking.id}/pay-on-arrival`, { method: 'POST' });
    }
    setStkPushStep('success');
    setIsProcessing(false);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/80 backdrop-blur-md flex justify-center p-3 sm:p-6 animate-fade-in">
      <div className="relative bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 rounded-3xl max-w-lg w-full my-auto shadow-2xl overflow-hidden border border-stone-200 dark:border-stone-800">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between bg-stone-50 dark:bg-stone-800/50">
          <div>
            <div className="flex items-center space-x-1.5 text-xs font-bold text-amber-700 dark:text-amber-400">
              <Lock className="w-3.5 h-3.5" />
              <span>Secure Payment Checkout</span>
            </div>
            <h3 className="font-serif font-bold text-lg">Booking {booking.id}</h3>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-500 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          
          {/* Summary Box */}
          <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 flex items-center justify-between">
            <div>
              <h4 className="font-bold text-sm text-stone-900 dark:text-stone-100">{booking.listingTitle}</h4>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                {booking.nights} nights • {booking.checkIn} to {booking.checkOut}
              </p>
            </div>
            <div className="text-right">
              <span className="font-bold text-xl block">KSh {booking.totalAmount.toLocaleString()}</span>
            </div>
          </div>

          {stkPushStep === 'success' ? (
            <div className="py-8 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
                <Check className="w-8 h-8 stroke-[3]" />
              </div>
              <h4 className="font-serif font-bold text-2xl text-emerald-800 dark:text-emerald-400">
                {t.paymentSuccess}
              </h4>
              <p className="text-xs text-stone-600 dark:text-stone-300 max-w-xs mx-auto">
                Your dates are locked on the calendar. An SMS confirmation was sent to {booking.guestPhone}.
              </p>
              <button
                onClick={onClose}
                className="w-full py-3 rounded-xl bg-stone-900 dark:bg-stone-100 text-stone-100 dark:text-stone-900 font-bold text-xs"
              >
                Close Checkout
              </button>
            </div>
          ) : (
            <>
              {/* Payment Method Tabs */}
              <div className="grid grid-cols-3 gap-1.5 p-1 bg-stone-100 dark:bg-stone-800 rounded-2xl text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setPaymentTab('mpesa')}
                  className={`py-2.5 px-1 rounded-xl flex flex-col sm:flex-row items-center justify-center space-x-1 transition-all cursor-pointer ${
                    paymentTab === 'mpesa'
                      ? 'bg-emerald-600 text-white shadow-md'
                      : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
                  }`}
                >
                  <Smartphone className="w-4 h-4" />
                  <span className="text-[11px]">M-Pesa STK</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentTab('bank')}
                  className={`py-2.5 px-1 rounded-xl flex flex-col sm:flex-row items-center justify-center space-x-1 transition-all cursor-pointer ${
                    paymentTab === 'bank'
                      ? 'bg-amber-700 text-white shadow-md'
                      : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
                  }`}
                >
                  <Building2 className="w-4 h-4" />
                  <span className="text-[11px]">Bank / Card</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentTab('arrival')}
                  className={`py-2.5 px-1 rounded-xl flex flex-col sm:flex-row items-center justify-center space-x-1 transition-all cursor-pointer ${
                    paymentTab === 'arrival'
                      ? 'bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 shadow-md'
                      : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span className="text-[11px]">Pay Upon Arrival</span>
                </button>
              </div>

              {/* Tab 1: M-Pesa STK Push */}
              {paymentTab === 'mpesa' && (
                <form onSubmit={handleMpesaPay} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                      {t.enterPhoneForMpesa}
                    </label>
                    <input
                      type="tel"
                      value={mpesaPhone}
                      onChange={(e) => setMpesaPhone(e.target.value)}
                      className="w-full p-3 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 text-sm font-mono font-bold tracking-wide"
                      required
                    />
                    <p className="text-[11px] text-stone-500 mt-1">{t.phoneNumberHelp}</p>
                  </div>

                  {/* Direct Host M-Pesa Contact Details */}
                  <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-xs flex items-center justify-between">
                    <div>
                      <span className="font-bold text-emerald-900 dark:text-emerald-200 block">Host Direct M-Pesa / Call</span>
                      <span className="text-emerald-700 dark:text-emerald-400 font-mono font-bold">Madam Ann: 0729110857 (+254 729 110 857)</span>
                    </div>
                    <a
                      href="https://wa.me/254729110857?text=Hello%20Madam%20Ann,%20I%20am%20making%20a%20booking%20payment"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] flex items-center space-x-1"
                    >
                      <span>WhatsApp</span>
                    </a>
                  </div>

                  {stkPushStep === 'prompted' ? (
                    <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/60 border border-amber-300 text-center space-y-2">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto text-amber-600" />
                      <p className="font-bold text-xs text-amber-900 dark:text-amber-200">
                        {t.processingPayment}
                      </p>
                      <p className="text-[11px] text-stone-600 dark:text-stone-300">
                        Check handset for Safaricom PIN prompt (KSh {amountKes.toLocaleString()}).
                      </p>
                    </div>
                  ) : (
                    <button
                      type="submit"
                      disabled={isProcessing}
                      className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-lg shadow-emerald-900/20 transition-all flex items-center justify-center space-x-2 cursor-pointer"
                    >
                      <Smartphone className="w-4 h-4" />
                      <span>Send M-Pesa STK Push (KSh {amountKes.toLocaleString()})</span>
                    </button>
                  )}
                </form>
              )}

              {/* Tab 2: East African Banks (Pesapal / Flutterwave) */}
              {paymentTab === 'bank' && (
                <form onSubmit={handleBankPay} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                      Select Your Bank
                    </label>
                    <select
                      value={selectedBank}
                      onChange={(e) => setSelectedBank(e.target.value)}
                      className="w-full p-3 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 text-xs font-bold"
                    >
                      {EAST_AFRICAN_BANKS.map((b) => (
                        <option key={b} value={b}>{b}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                      Aggregator Gateway Adapter
                    </label>
                    <div className="grid grid-cols-2 gap-2 text-xs font-medium">
                      <button
                        type="button"
                        onClick={() => setAggregatorProvider('pesapal')}
                        className={`p-2.5 rounded-xl border text-center transition-all ${
                          aggregatorProvider === 'pesapal'
                            ? 'border-amber-600 bg-amber-50 dark:bg-amber-950/60 font-bold'
                            : 'border-stone-300 dark:border-stone-700 opacity-60'
                        }`}
                      >
                        Pesapal
                      </button>
                      <button
                        type="button"
                        onClick={() => setAggregatorProvider('flutterwave')}
                        className={`p-2.5 rounded-xl border text-center transition-all ${
                          aggregatorProvider === 'flutterwave'
                            ? 'border-amber-600 bg-amber-50 dark:bg-amber-950/60 font-bold'
                            : 'border-stone-300 dark:border-stone-700 opacity-60'
                        }`}
                      >
                        Flutterwave
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isProcessing}
                    className="w-full py-3.5 rounded-2xl bg-amber-700 hover:bg-amber-800 text-white font-bold text-sm shadow-lg transition-all flex items-center justify-center space-x-2 cursor-pointer"
                  >
                    {isProcessing ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Building2 className="w-4 h-4" />
                    )}
                    <span>Authorize KSh {booking.totalAmount.toLocaleString()} Bank Payment</span>
                  </button>
                </form>
              )}

              {/* Tab 3: Pay Upon Arrival */}
              {paymentTab === 'arrival' && (
                <form onSubmit={handleArrivalPay} className="space-y-4">
                  <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800/80 space-y-2">
                    <div className="flex items-center space-x-2 text-xs font-bold text-amber-900 dark:text-amber-200">
                      <CheckCircle2 className="w-4 h-4 text-amber-600" />
                      <span>Pay Upon Check-In at Airbnb</span>
                    </div>
                    <p className="text-xs text-stone-600 dark:text-stone-300">
                      Confirm your reservation now without paying online. Total stay amount (<strong>KSh {amountKes.toLocaleString()}</strong>) will be collected upon arrival at check-in via Cash or M-Pesa.
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={isProcessing}
                    className="w-full py-3.5 rounded-2xl bg-stone-900 dark:bg-stone-100 hover:bg-stone-800 text-stone-100 dark:text-stone-900 font-bold text-sm shadow-lg transition-all flex items-center justify-center space-x-2 cursor-pointer"
                  >
                    {isProcessing ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    )}
                    <span>Confirm Pay Upon Arrival (KSh {amountKes.toLocaleString()})</span>
                  </button>
                </form>
              )}

              {/* Audit Security Note */}
              <div className="flex items-center space-x-2 text-[11px] text-stone-500 pt-2 border-t border-stone-200 dark:border-stone-800">
                <ShieldAlert className="w-4 h-4 text-stone-400 flex-shrink-0" />
                <span>Encrypted PCI-DSS checkout. No PINs or raw credentials are stored.</span>
              </div>
            </>
          )}

        </div>

      </div>
    </div>
  );
};
