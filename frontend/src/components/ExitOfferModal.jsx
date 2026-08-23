import React, { useState, useEffect } from 'react';
import { X, Flame, Gift, MessageCircle, Sparkles, ArrowRight, ShieldCheck, Zap } from 'lucide-react';
import { useStoreSettings } from '../context/StoreSettingsContext';

const STORAGE_KEY = 'dhangadi_offer_dismissed_at';
const COOLDOWN_HOURS = 2; // Show again after 2 hours or on fresh session if not dismissed

const ExitOfferModal = ({ forceOpen = false, onCloseForce }) => {
  const { exitOffer, contactDetails } = useStoreSettings();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (forceOpen) {
      setIsOpen(true);
      return;
    }

    if (!exitOffer || exitOffer.active === false) return;

    // Check last dismissed timestamp
    const lastDismissed = localStorage.getItem(STORAGE_KEY);
    if (lastDismissed) {
      const hoursSince = (Date.now() - parseInt(lastDismissed, 10)) / (1000 * 60 * 60);
      if (hoursSince < COOLDOWN_HOURS) {
        return;
      }
    }

    let hasTriggered = false;

    // 1. Trigger automatically on Site Entry (after 1.2s smooth page load)
    const triggerMode = exitOffer.triggerMode || 'both'; // 'both', 'entry', 'exit'
    
    let entryTimer = null;
    if (triggerMode === 'both' || triggerMode === 'entry') {
      entryTimer = setTimeout(() => {
        if (!hasTriggered) {
          hasTriggered = true;
          setIsOpen(true);
        }
      }, 1200);
    }

    // 2. Trigger on Exit Intent (mouse moving out towards top of browser)
    const handleMouseLeave = (e) => {
      if ((triggerMode === 'both' || triggerMode === 'exit') && e.clientY <= 10 && !hasTriggered) {
        hasTriggered = true;
        setIsOpen(true);
      }
    };

    document.documentElement.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      if (entryTimer) clearTimeout(entryTimer);
      document.documentElement.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [exitOffer, forceOpen]);

  const handleClose = () => {
    setIsOpen(false);
    if (onCloseForce) onCloseForce();
    localStorage.setItem(STORAGE_KEY, Date.now().toString());
  };

  const getWhatsAppOfferUrl = () => {
    const rawNumber = (contactDetails?.whatsapp || '+919315696727').replace(/[^0-9]/g, '');
    const defaultMsg = `Hi! I want to order over NPR ${exitOffer?.minSpend || '2000'} and claim ${exitOffer?.reward || '1 Free Weekly Pass'}!`;
    const msg = encodeURIComponent(exitOffer?.whatsappMessage || defaultMsg);
    return `https://wa.me/${rawNumber}?text=${msg}`;
  };

  if (!isOpen || (!exitOffer?.active && !forceOpen)) return null;

  const minSpend = exitOffer?.minSpend || '2000';
  const reward = exitOffer?.reward || '1 Free Weekly Pass';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Dark Blur Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-950/65 backdrop-blur-md transition-opacity duration-300 animate-in fade-in"
        onClick={handleClose}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-md bg-white border border-slate-200 rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 fade-in duration-300">
        
        {/* Top vibrant gradient accent bar */}
        <div className="h-2.5 w-full bg-gradient-to-r from-emerald-500 via-blue-600 to-indigo-600" />

        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-5 right-5 z-20 w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 flex items-center justify-center transition-colors shadow-sm"
          aria-label="Close"
        >
          <X size={18} />
        </button>

        {/* Header Content */}
        <div className="pt-8 pb-2 px-6 sm:px-8 text-center">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 font-black text-[11px] uppercase tracking-wider mb-3 shadow-sm">
            <Gift size={14} className="text-emerald-600" />
            {exitOffer?.badge || '🎁 SPECIAL MEGA BONUS'}
          </div>

          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 uppercase leading-tight mb-2">
            {exitOffer?.title || 'Buy Over NPR 2,000 = Get 1 FREE Weekly!'}
          </h2>

          <p className="text-slate-600 text-xs sm:text-sm max-w-sm mx-auto leading-relaxed font-medium">
            {exitOffer?.description || `Top up for NPR ${minSpend} or more on any game today and receive a ${reward} completely free!`}
          </p>
        </div>

        {/* Highlight Reward Card Box */}
        <div className="px-6 sm:px-8 py-3">
          <div className="p-5 rounded-3xl bg-gradient-to-br from-blue-50 via-slate-50 to-emerald-50 border border-blue-200/80 shadow-inner flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white border border-blue-200 shadow-md flex items-center justify-center text-accent shrink-0">
              <Gift size={28} className="text-emerald-600 animate-bounce-slow" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="px-2 py-0.5 rounded-md bg-emerald-600 text-white text-[9px] font-black uppercase tracking-wider">
                  FREE REWARD
                </span>
                <span className="text-[10px] font-bold text-slate-400">Order &gt; NPR {minSpend}</span>
              </div>
              <h4 className="text-base sm:text-lg font-black text-slate-900 leading-snug truncate">
                {reward}
              </h4>
              <p className="text-[11px] text-slate-500 font-medium mt-0.5 flex items-center gap-1">
                <Zap size={11} className="text-amber-500 fill-amber-500 shrink-0" />
                <span>Automatically added to your delivery</span>
              </p>
            </div>
          </div>

          {/* Value Perks */}
          <div className="grid grid-cols-2 gap-2 mt-3 text-center">
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/70">
              <span className="text-[10px] text-slate-400 uppercase font-black tracking-wider block">Min Order</span>
              <span className="text-xs font-black text-slate-900">NPR {minSpend}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-200/70">
              <span className="text-[10px] text-emerald-600 uppercase font-black tracking-wider block">Bonus Value</span>
              <span className="text-xs font-black text-emerald-700">100% FREE</span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 sm:p-8 pt-3 space-y-2.5">
          <a
            href={getWhatsAppOfferUrl()}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleClose}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 px-6 rounded-2xl hover:scale-[1.01] active:scale-95 transition-all shadow-lg shadow-emerald-600/25 text-sm uppercase tracking-wider flex items-center justify-center gap-2 text-center"
          >
            <MessageCircle size={20} />
            <span>{exitOffer?.buttonText || 'Claim Free Weekly on WhatsApp'}</span>
            <ArrowRight size={16} />
          </a>

          <button
            onClick={handleClose}
            className="w-full py-2 text-xs font-bold text-slate-400 hover:text-slate-700 transition-colors uppercase tracking-widest"
          >
            No thanks, continue browsing
          </button>
        </div>

      </div>
    </div>
  );
};

export default ExitOfferModal;
