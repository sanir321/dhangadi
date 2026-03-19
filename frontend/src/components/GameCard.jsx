import React from 'react';
import { Link } from 'react-router-dom';

const GameCard = ({ game }) => {
  return (
    <Link 
      to={`/game/${game.id}`} 
      className="glass-card group flex flex-col items-center text-center !p-4 sm:!p-6 relative overflow-hidden"
      style={{ '--accent-glow': game.themeColor || '#9aff00' }}
    >
      {/* Brand Glow */}
      <div 
        className="absolute inset-x-0 bottom-0 h-1 opacity-20 group-hover:opacity-100 transition-opacity"
        style={{ backgroundColor: game.themeColor || '#9aff00' }}
      />
      
      <div className="relative mb-6">
        <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-3xl overflow-hidden border border-white/5 bg-white/5 transition-transform duration-700 group-hover:scale-105">
            <img 
            src={game.icon} 
            alt={game.name} 
            className="w-full h-full object-cover"
            />
        </div>
        
        {/* Floating Currency Icon */}
        {game.currencyIcon && (
            <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-black/40 backdrop-blur-md rounded-xl p-1.5 border border-white/10 shadow-2xl group-hover:scale-110 transition-transform duration-500">
                <img src={game.currencyIcon} alt={game.currency} className="w-full h-full object-contain" />
            </div>
        )}

        <div 
            className="absolute inset-0 blur-3xl opacity-0 group-hover:opacity-20 transition-opacity duration-700 pointer-events-none"
            style={{ backgroundColor: game.themeColor || '#9aff00' }}
        />
      </div>

      <h3 className="font-black text-lg mb-1 tracking-tight group-hover:text-accent transition-colors">{game.name}</h3>
      <p className="text-[10px] text-white/30 font-black uppercase tracking-[0.2em]">{game.currency}</p>
    </Link>
  );
};

export default GameCard;
