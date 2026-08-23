import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ChevronDown, Sparkles } from 'lucide-react';
import { useDependencies } from '../DependencyContext';
import { useQuery } from '@tanstack/react-query';
import logo from '../assets/favcoin.png';
import NanoBanner from './NanoBanner';

const Navbar = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isGamesOpen, setIsGamesOpen] = useState(false);
    const location = useLocation();
    const { getGames } = useDependencies();

    const { data: games = [] } = useQuery({
        queryKey: ['games'],
        queryFn: () => getGames.execute(),
    });

    const isActive = (path) => location.pathname === path 
        ? 'text-accent font-black' 
        : 'text-slate-600 hover:text-accent transition-colors font-bold';

    return (
        <nav className="fixed top-0 left-0 right-0 z-50">
            <NanoBanner />
            <div className="bg-white/90 backdrop-blur-xl border-b border-slate-200/80 shadow-sm px-4 sm:px-8">
                <div className="max-w-7xl mx-auto flex items-center justify-between h-20">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-3 group">
                        <div className="w-11 h-11 bg-accent/10 rounded-2xl flex items-center justify-center border border-accent/20 group-hover:bg-accent/20 transition-all shadow-sm">
                            <img src={logo} alt="DN Official" className="h-7 w-7 object-contain" />
                        </div>
                        <div>
                            <span className="text-lg sm:text-xl font-black tracking-tight uppercase block text-slate-900 leading-none">
                                Dhangadi <span className="text-accent">Store</span>
                            </span>
                            <span className="text-[9px] uppercase font-black tracking-widest text-slate-400">Official Top-up</span>
                        </div>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-8">
                        <Link to="/" className={`text-sm uppercase tracking-wider ${isActive('/')}`}>
                            Home
                        </Link>

                        {/* Games Dropdown */}
                        <div
                            className="relative h-20 flex items-center"
                            onMouseEnter={() => setIsGamesOpen(true)}
                            onMouseLeave={() => setIsGamesOpen(false)}
                        >
                            <button className={`text-sm uppercase tracking-wider flex items-center gap-1.5 transition-colors ${isGamesOpen || location.pathname.startsWith('/game') ? 'text-accent font-black' : 'text-slate-600 font-bold hover:text-accent'}`}>
                                Games <ChevronDown size={14} className={`transition-transform duration-300 ${isGamesOpen ? 'rotate-180 text-accent' : ''}`} />
                            </button>

                            {isGamesOpen && (
                                <div className="absolute top-[75px] left-0 w-72 bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                                    <div className="p-2.5 max-h-[380px] overflow-y-auto space-y-1">
                                        {games.map(game => (
                                            <Link
                                                key={game.id}
                                                to={`/game/${game.id}`}
                                                className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 transition-all group"
                                                onClick={() => setIsGamesOpen(false)}
                                            >
                                                <img src={game.icon} alt={game.name} className="w-9 h-9 rounded-xl object-contain bg-slate-100 p-0.5 shrink-0" />
                                                <div className="truncate">
                                                    <p className="text-sm font-bold text-slate-800 group-hover:text-accent transition-colors truncate">{game.name}</p>
                                                    <p className="text-[10px] text-slate-400 uppercase tracking-widest">{game.currency}</p>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <Link to="/track" className={`text-sm uppercase tracking-wider ${isActive('/track')}`}>
                            Track Order
                        </Link>
                        <Link to="/faq" className={`text-sm uppercase tracking-wider ${isActive('/faq')}`}>
                            FAQ & Support
                        </Link>
                    </div>

                    {/* Right CTA */}
                    <div className="hidden md:flex items-center gap-3">
                        <Link 
                            to="/track" 
                            className="px-5 py-2.5 rounded-xl bg-accent/10 hover:bg-accent text-accent hover:text-white font-bold text-xs uppercase tracking-wider transition-all"
                        >
                            Track Status
                        </Link>
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="flex items-center gap-2 md:hidden">
                        <button
                            className="p-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 transition-all"
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                        >
                            {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu Dropdown */}
                {isMenuOpen && (
                    <div className="md:hidden border-t border-slate-200 py-6 animate-in slide-in-from-top-4 duration-300">
                        <div className="space-y-2">
                            <Link
                                to="/"
                                className={`block px-4 py-3 rounded-2xl font-bold uppercase tracking-wider ${isActive('/')}`}
                                onClick={() => setIsMenuOpen(false)}
                            >
                                Home
                            </Link>

                            <div className="px-4 py-4 bg-slate-50 rounded-2xl my-2">
                                <span className="text-[10px] text-accent uppercase tracking-[0.2em] font-black mb-3 block">
                                    Quick Top-Up Games
                                </span>
                                <div className="grid grid-cols-2 gap-2.5">
                                    {games.map(game => (
                                        <Link
                                            key={game.id}
                                            to={`/game/${game.id}`}
                                            className="flex items-center gap-2.5 p-2 rounded-xl bg-white border border-slate-200 shadow-sm hover:border-accent transition-all"
                                            onClick={() => setIsMenuOpen(false)}
                                        >
                                            <img src={game.icon} alt={game.name} className="w-6 h-6 rounded object-contain shrink-0" />
                                            <span className="text-xs font-bold text-slate-800 truncate">{game.name}</span>
                                        </Link>
                                    ))}
                                </div>
                            </div>

                            <Link
                                to="/track"
                                className={`block px-4 py-3 rounded-2xl font-bold uppercase tracking-wider ${isActive('/track')}`}
                                onClick={() => setIsMenuOpen(false)}
                            >
                                Track Order
                            </Link>
                            <Link
                                to="/faq"
                                className={`block px-4 py-3 rounded-2xl font-bold uppercase tracking-wider ${isActive('/faq')}`}
                                onClick={() => setIsMenuOpen(false)}
                            >
                                FAQ & Help
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
