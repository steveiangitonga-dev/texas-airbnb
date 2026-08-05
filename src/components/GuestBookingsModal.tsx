import React, { useState } from 'react';
import {
  X,
  CalendarCheck,
  CreditCard,
  Clock,
  CheckCircle2,
  AlertTriangle,
  MapPin,
  Search,
  ChevronRight
} from 'lucide-react';
import { BookingRequest } from '../types';
import { translations, Language } from '../i18n/translations';

interface GuestBookingsModalProps {
  bookings: BookingRequest[];
  lang: Language;
  currency: 'USD' | 'KES';
  usdToKesRate: number;
  onClose: () => void;
  onPayNow: (booking: BookingRequest) => void;
  onCancelBooking: (bookingId: string) => void;
  onSearchByPhone: (phone: string) => void;
}

export const GuestBookingsModal: React.FC<GuestBookingsModalProps> = ({
  bookings,
  lang,
  currency,
  usdToKesRate,
  onClose,
  onPayNow,
  onCancelBooking,
  onSearchByPhone
}) => {
  const t = translations[lang];
  const [searchPhone, setSearchPhone] = useState('');

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/80 backdrop-blur-md flex justify-center p-3 sm:p-6 animate-fade-in">
      <div className="relative bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 rounded-3xl max-w-3xl w-full my-auto shadow-2xl overflow-hidden border border-stone-200 dark:border-stone-800">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between bg-stone-50 dark:bg-stone-800/50">
          <div className="flex items-center space-x-2">
            <CalendarCheck className="w-5 h-5 text-amber-700 dark:text-amber-400" />
            <h3 className="font-serif font-bold text-lg">{t.myBookings}</h3>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-500 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          
          {/* Quick Lookup Bar */}
          <div className="flex items-center space-x-2 p-2 rounded-2xl bg-stone-100 dark:bg-stone-800">
            <Search className="w-4 h-4 text-stone-400 ml-2" />
            <input
              type="text"
              placeholder="Lookup by Guest Phone Number"
              value={searchPhone}
              onChange={(e) => setSearchPhone(e.target.value)}
              className="w-full bg-transparent text-xs font-mono text-stone-900 dark:text-stone-100 focus:outline-none"
            />
            <button
              onClick={() => onSearchByPhone(searchPhone)}
              className="px-4 py-2 rounded-xl bg-amber-700 text-white font-bold text-xs hover:bg-amber-800 transition-colors cursor-pointer"
            >
              Lookup
            </button>
          </div>

          {bookings.length === 0 ? (
            <div className="py-12 text-center space-y-2">
              <CalendarCheck className="w-10 h-10 text-stone-400 mx-auto" />
              <p className="text-sm font-bold text-stone-600 dark:text-stone-300">No bookings found for this search.</p>
              <p className="text-xs text-stone-400">Book an Airbnb stay above to see your itinerary and payment status here.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {bookings.map((b) => (
                <div
                  key={b.id}
                  className="p-5 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-800 space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-200 dark:border-stone-700 pb-3">
                    <div>
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="font-bold text-sm text-stone-900 dark:text-stone-100">{b.listingTitle}</span>
                        
                        <span className={`px-2.5 py-0.5 text-[10px] font-extrabold uppercase rounded-full ${
                          b.status === 'confirmed'
                            ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                            : b.status === 'approved'
                            ? 'bg-blue-100 text-blue-900 border border-blue-300'
                            : b.status === 'pending'
                            ? 'bg-amber-100 text-amber-900 border border-amber-300'
                            : 'bg-rose-100 text-rose-900'
                        }`}>
                          {b.status}
                        </span>

                        {/* Payment Status Badge */}
                        <span className={`px-2.5 py-0.5 text-[10px] font-extrabold uppercase rounded-full ${
                          b.paymentStatus === 'paid'
                            ? 'bg-emerald-600 text-white'
                            : b.paymentStatus === 'pay_on_arrival'
                            ? 'bg-purple-700 text-white'
                            : 'bg-amber-600 text-white'
                        }`}>
                          {b.paymentStatus === 'paid' && 'Paid Online'}
                          {b.paymentStatus === 'pay_on_arrival' && 'Pay Upon Arrival'}
                          {b.paymentStatus === 'unpaid' && 'Payment Pending'}
                        </span>
                      </div>

                      <p className="text-xs text-stone-500 mt-1">
                        Booking ID: <strong className="font-mono">{b.id}</strong> • Guest: {b.guestName} ({b.guestPhone})
                        <br />
                        {b.nights} nights ({b.checkIn} to {b.checkOut})
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="font-bold text-lg block text-amber-900 dark:text-amber-200">
                        KSh {b.totalAmount.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Payment Actions */}
                  {b.paymentStatus !== 'paid' && (
                    <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 flex flex-col sm:flex-row items-center justify-between gap-2">
                      <div className="text-xs text-amber-900 dark:text-amber-200 font-medium">
                        {b.paymentStatus === 'pay_on_arrival'
                          ? 'Selected: Pay Upon Arrival at Check-in. You can also pay online now if preferred.'
                          : 'Choose payment method for this stay:'}
                      </div>

                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => onPayNow(b)}
                          className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center space-x-1 shadow-md cursor-pointer whitespace-nowrap"
                        >
                          <CreditCard className="w-3.5 h-3.5" />
                          <span>Pay Online Now</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Confirmed / Paid Status Bar */}
                  {b.paymentStatus === 'paid' && (
                    <div className="flex items-center justify-between pt-1">
                      <div className="text-xs text-emerald-700 dark:text-emerald-400 font-bold flex items-center space-x-1">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Payment Completed ({b.paymentMethod?.toUpperCase() || 'ONLINE'})</span>
                      </div>

                      <button
                        onClick={() => onCancelBooking(b.id)}
                        className="text-xs text-rose-600 dark:text-rose-400 font-bold underline hover:opacity-80 cursor-pointer"
                      >
                        Cancel Booking
                      </button>
                    </div>
                  )}

                </div>
              ))}
            </div>
          )}

        </div>

      </div>
    </div>
  );
};

export default GuestBookingsModal;

