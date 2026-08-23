import React from 'react';
import { Link } from 'react-router-dom';
import { Zap } from 'lucide-react';

const GameCard = ({ game }) => {
  return (
    <Link 
      to={`/game/${game.id}`} 
      className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 flex flex-col items-center text-center relative overflow-hidden group hover:border-accent hover:shadow-xl hover:shadow-accent/10 transition-all duration-300 shadow-sm"
    >
      {/* Brand accent bar on top */}
      <div 
        className="absolute inset-x-0 top-0 h-1 opacity-40 group-hover:opacity-100 transition-opacity"
        style={{ backgroundColor: game.themeColor || '#2563EB' }}
      />
      
      <div className="relative mb-5 mt-2">
        <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden border border-slate-100 bg-slate-50 p-1 shadow-inner transition-transform duration-500 group-hover:scale-105">
          <img 
            src={game.icon} 
            alt={game.name} 
            className="w-full h-full object-cover rounded-xl"
          />
        </div>
        
        {/* Floating Currency Icon */}
        {game.currencyIcon && (
          <div className="absolute -bottom-2 -right-2 w-9 h-9 bg-white rounded-xl p-1.5 border border-slate-200 shadow-md group-hover:scale-110 transition-transform duration-300">
            <img src={game.currencyIcon} alt={game.currency} className="w-full h-full object-contain" />
          </div>
        )}
      </div>

      <h3 className="font-black text-base sm:text-lg mb-1 tracking-tight text-slate-900 group-hover:text-accent transition-colors">
        {game.name}
      </h3>
      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-3">
        {game.currency}
      </p>

      {/* Mini CTA badge */}
      <div className="mt-auto w-full pt-2 border-t border-slate-100 flex items-center justify-center gap-1 text-[11px] font-bold text-accent group-hover:text-accent-hover transition-colors">
        <Zap size={13} className="fill-accent group-hover:fill-accent-hover" />
        <span>Instant Top-Up</span>
      </div>
    </Link>
  );
};

export default GameCard;
