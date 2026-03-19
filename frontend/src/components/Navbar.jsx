import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ChevronDown } from 'lucide-react';
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
        queryFn: getGames.execute,
    });

    const isActive = (path) => location.pathname === path ? 'text-accent' : 'text-white/60 hover:text-accent transition-colors';

    return (
        <nav className="fixed top-0 left-0 right-0 z-50">
            <NanoBanner />
            <div className="glass-morphism !rounded-none border-b border-white/5 backdrop-blur-2xl px-4 sm:px-6">
                <div className="flex items-center justify-between h-20">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-3 group">
                        <div className="w-10 h-10 bg-accent/10 rounded-xl flex items-center justify-center border border-accent/20 group-hover:bg-accent/20 transition-all">
                            <img src={logo} alt="DN Official" className="h-7 w-7 object-contain" />
                        </div>
                        <span className="text-xl font-black tracking-tighter uppercase hidden sm:block">Dhangadi Top Up Store</span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-8">
                        <Link to="/" className={`text-sm font-bold uppercase tracking-wider ${isActive('/')}`}>
                            Home
                        </Link>

                        {/* Games Dropdown */}
                        <div
                            className="relative h-20 flex items-center"
                            onMouseEnter={() => setIsGamesOpen(true)}
                            onMouseLeave={() => setIsGamesOpen(false)}
                        >
                            <button className={`text-sm font-bold uppercase tracking-wider flex items-center gap-1 transition-colors ${isGamesOpen || location.pathname.startsWith('/game') ? 'text-accent' : 'text-white/60'}`}>
                                Games <ChevronDown size={14} className={`transition-transform duration-300 ${isGamesOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {isGamesOpen && (
                                <div className="absolute top-full left-0 w-64 glass-morphism border border-white/10 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300">
                                    <div className="p-2">
                                        {games.map(game => (
                                            <Link
                                                key={game.id}
                                                to={`/game/${game.id}`}
                                                className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-white/5 transition-all group"
                                                onClick={() => setIsGamesOpen(false)}
                                            >
                                                <img src={game.icon} alt={game.name} className="w-8 h-8 object-contain" />
                                                <div>
                                                    <p className="text-sm font-bold group-hover:text-accent transition-colors">{game.name}</p>
                                                    <p className="text-[10px] text-white/30 uppercase tracking-widest">{game.currency}</p>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <Link to="/track" className={`text-sm font-bold uppercase tracking-wider ${isActive('/track')}`}>
                            Track
                        </Link>
                        <Link to="/faq" className={`text-sm font-bold uppercase tracking-wider ${isActive('/faq')}`}>
                            FAQ
                        </Link>
                    </div>

                    {/* Right Actions */}
                    <div className="flex items-center gap-4">

                        {/* Mobile Menu Button */}
                        <button
                            className="md:hidden p-2.5 rounded-2xl bg-white/5 hover:bg-white/10 transition-all"
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                        >
                            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {isMenuOpen && (
                    <div className="md:hidden border-t border-white/5 py-6 animate-in slide-in-from-top-4 duration-300">
                        <div className="space-y-2">
                            <Link
                                to="/"
                                className={`block px-4 py-3 rounded-2xl font-bold uppercase tracking-wider ${isActive('/')}`}
                                onClick={() => setIsMenuOpen(false)}
                            >
                                Home
                            </Link>

                            <div className="px-4 py-4">
                                <p className="text-[10px] text-white/20 uppercase tracking-[0.2em] font-black mb-4">Popular Games</p>
                                <div className="grid grid-cols-2 gap-3">
                                    {games.map(game => (
                                        <Link
                                            key={game.id}
                                            to={`/game/${game.id}`}
                                            className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 hover:bg-white/10 transition-all"
                                            onClick={() => setIsMenuOpen(false)}
                                        >
                                            <img src={game.icon} alt={game.name} className="w-6 h-6 object-contain" />
                                            <span className="text-xs font-bold">{game.name}</span>
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
                                FAQ
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
