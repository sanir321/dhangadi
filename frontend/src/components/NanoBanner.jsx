import React from 'react';
import { Sparkles } from 'lucide-react';
import { useStoreSettings } from '../context/StoreSettingsContext';

const NanoBanner = () => {
  const { announcement } = useStoreSettings();

  if (!announcement?.active || !announcement?.text) return null;

  return (
    <div className="relative z-[60] bg-accent text-white py-2 px-4 shadow-md font-medium">
      <div className="max-w-7xl mx-auto flex items-center justify-center gap-3">
        <Sparkles size={14} className="animate-pulse shrink-0 text-white/80" />
        <p className="text-[11px] md:text-xs font-bold uppercase tracking-wider text-center truncate">
          {announcement.text}
        </p>
        <Sparkles size={14} className="animate-pulse shrink-0 text-white/80" />
      </div>
    </div>
  );
};

export default NanoBanner;
