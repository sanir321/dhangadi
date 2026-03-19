import React from 'react';
import { Sparkles, X } from 'lucide-react';
import { announcement } from '../data/games';

const NanoBanner = () => {
    if (!announcement?.active) return null;

    return (
        <div className="relative z-[60] bg-accent text-black py-2 px-4 shadow-xl">
            <div className="max-w-7xl mx-auto flex items-center justify-center gap-3">
                <Sparkles size={14} className="animate-pulse" />
                <p className="text-[11px] md:text-sm font-black uppercase tracking-widest text-center truncate">
                    {announcement.text}
                </p>
                <Sparkles size={14} className="animate-pulse" />
            </div>
        </div>
    );
};

export default NanoBanner;
