import React, { useState, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDependencies } from '../DependencyContext';
import { useQuery } from '@tanstack/react-query';
import { generateProductSchema } from '../lib/seo';
import Navbar from '../components/Navbar';
import { useStoreSettings } from '../context/StoreSettingsContext';
import { ChevronLeft, ShieldCheck, Zap, Sparkles, MessageCircle, ArrowRight, Search, Check } from 'lucide-react';

const GamePage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { getGames } = useDependencies();
    const { contactDetails } = useStoreSettings();
    const [quantity, setQuantity] = useState(1);
    const [packageSearch, setPackageSearch] = useState('');

    const { data: game, isLoading } = useQuery({
        queryKey: ['game', id],
        queryFn: () => getGames.getById(id),
    });

    const filteredPackages = useMemo(() => {
        if (!game?.packages) return [];
        if (!packageSearch.trim()) return game.packages;
        const q = packageSearch.toLowerCase().trim();
        return game.packages.filter(p => 
            p.label?.toLowerCase().includes(q) || 
            String(p.price).includes(q)
        );
    }, [game, packageSearch]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center text-slate-400 font-bold">
                Loading game top-up details...
            </div>
        );
    }
    
    if (!game) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center text-slate-700 font-bold">
                Game not found
            </div>
        );
    }

    const schema = generateProductSchema(game);

    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col">
            <script type="application/ld+json">
                {JSON.stringify(schema)}
            </script>
            <Navbar />
            
            <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 pt-36 pb-20">
                <Link to="/" className="flex items-center gap-2 text-slate-500 hover:text-accent transition-colors mb-8 group w-fit font-bold uppercase tracking-widest text-xs">
                    <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                    Back to games catalog
                </Link>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
                    {/* Game Info - Left Sidebar */}
                    <div className="lg:col-span-4 lg:sticky lg:top-32 h-fit order-2 lg:order-1 space-y-6">
                        <div className="bg-white border border-slate-200 p-6 sm:p-8 rounded-[2rem] shadow-sm relative overflow-hidden">
                            <div className="relative mb-6 aspect-square rounded-3xl overflow-hidden border border-slate-100 bg-slate-50 shadow-inner">
                                <img 
                                    src={game.icon} 
                                    alt={game.name} 
                                    className="w-full h-full object-cover" 
                                />
                                {game.currencyIcon && (
                                    <div className="absolute top-4 right-4 w-14 h-14 bg-white/90 backdrop-blur-md rounded-2xl p-2.5 border border-slate-200 shadow-md">
                                        <img src={game.currencyIcon} alt={game.currency} className="w-full h-full object-contain" />
                                    </div>
                                )}
                            </div>

                            <h1 className="text-2xl sm:text-3xl font-black tracking-tight mb-2 text-slate-900 uppercase">{game.name}</h1>
                            <p className="text-slate-500 mb-8 font-medium text-sm leading-relaxed">{game.description}</p>
                            
                            <div className="space-y-4 pt-6 border-t border-slate-100">
                                <div className="flex items-center gap-3.5">
                                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-accent flex items-center justify-center border border-blue-100 shrink-0">
                                        <ShieldCheck size={20} />
                                    </div>
                                    <div>
                                        <span className="font-bold text-xs text-slate-900 block">100% Guaranteed Delivery</span>
                                        <span className="text-[11px] text-slate-400 font-medium">Safe Player ID transfer</span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3.5">
                                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 shrink-0">
                                        <Zap size={20} />
                                    </div>
                                    <div>
                                        <span className="font-bold text-xs text-slate-900 block">Lightning 5-15 Min</span>
                                        <span className="text-[11px] text-slate-400 font-medium">Rapid queue processing</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Packages Grid - Right Content */}
                    <div className="lg:col-span-8 space-y-6 order-1 lg:order-2">
                        
                        {/* Header & Filter Search */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
                            <div>
                                <span className="text-[10px] text-accent uppercase tracking-widest font-black block mb-1">Step 1: Choose Denomination</span>
                                <h2 className="text-2xl sm:text-3xl font-black tracking-tight uppercase text-slate-900">
                                    Select <span className="text-accent">{game.currency} Package</span>
                                </h2>
                            </div>

                            {!game.supportsQuantity && game.packages?.length > 6 && (
                                <div className="relative w-full sm:w-56">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                                    <input
                                        type="text"
                                        value={packageSearch}
                                        onChange={(e) => setPackageSearch(e.target.value)}
                                        placeholder="Filter packages..."
                                        className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs font-bold text-slate-800 placeholder:text-slate-400 outline-none focus:border-accent shadow-sm"
                                    />
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                        {game.supportsQuantity ? (
                            <div className="sm:col-span-2 bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-8 shadow-sm">
                                <div className="text-center md:text-left w-full">
                                    <h3 className="text-2xl font-black uppercase text-slate-900 mb-1">Select Quantity</h3>
                                    <p className="text-slate-500 font-medium text-xs">Tiered bulk pricing applies automatically</p>
                                    <div className="mt-4 flex flex-col gap-1 text-xs font-bold text-slate-600">
                                        <p>1 - 4 Units: <span className="text-slate-900 font-black">NPR {game.pricing?.basePrice || 2190}</span> each</p>
                                        <p>5+ Units: <span className="text-accent font-black">NPR {game.pricing?.tieredPrice || 2140}</span> each</p>
                                    </div>
                                </div>

                                <div className="flex flex-col items-center gap-5 w-full md:w-auto">
                                    <div className="flex items-center gap-4 bg-slate-100 p-2 rounded-2xl border border-slate-200">
                                        <button 
                                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                            className="w-12 h-12 rounded-xl bg-white border border-slate-200 text-slate-800 flex items-center justify-center hover:bg-accent hover:text-white transition-all text-xl font-black shadow-sm"
                                        >
                                            -
                                        </button>
                                        <span className="text-2xl font-black w-10 text-center text-slate-900">{quantity}</span>
                                        <button 
                                            onClick={() => setQuantity(quantity + 1)}
                                            className="w-12 h-12 rounded-xl bg-white border border-slate-200 text-slate-800 flex items-center justify-center hover:bg-accent hover:text-white transition-all text-xl font-black shadow-sm"
                                        >
                                            +
                                        </button>
                                    </div>

                                    <button
                                        onClick={() => navigate(`/checkout/${game.id}/${game.packages[0].id}?q=${quantity}`)}
                                        className="w-full md:w-auto bg-accent hover:bg-accent-hover text-white font-black py-4 px-8 rounded-2xl hover:scale-105 active:scale-95 transition-all text-sm uppercase tracking-wider shadow-lg shadow-accent/20"
                                    >
                                        Continue - NPR {quantity >= (game.pricing?.tierThreshold || 5) ? (game.pricing?.tieredPrice * quantity) : ((game.pricing?.basePrice || game.packages[0]?.price) * quantity)}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <>
                                {filteredPackages.map((pkg) => (
                                    <button
                                        key={pkg.id}
                                        onClick={() => navigate(`/checkout/${game.id}/${pkg.id}`)}
                                        className="bg-white border border-slate-200 p-6 rounded-3xl flex flex-col gap-4 group hover:border-accent hover:shadow-xl hover:shadow-accent/10 active:scale-[0.98] transition-all duration-300 text-left shadow-sm relative overflow-hidden"
                                    >
                                        <div className="flex items-start justify-between w-full">
                                            <div>
                                                <p className="font-black text-lg sm:text-xl text-slate-900 group-hover:text-accent transition-colors">
                                                    {pkg.label}
                                                </p>
                                                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                                                    {game.currency} Direct Top-up
                                                </span>
                                            </div>
                                            {game.currencyIcon && (
                                                <div className="w-10 h-10 bg-slate-50 border border-slate-100 rounded-xl p-1.5 group-hover:scale-110 transition-transform">
                                                    <img src={game.currencyIcon} alt={game.currency} className="w-full h-full object-contain" />
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex items-end justify-between mt-auto pt-3 border-t border-slate-100 w-full">
                                            <div>
                                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Price</span>
                                                <p className="text-accent font-black text-2xl tracking-tight">NPR {pkg.price}</p>
                                            </div>
                                            <div className="w-9 h-9 rounded-xl bg-blue-50 text-accent flex items-center justify-center group-hover:bg-accent group-hover:text-white transition-all shadow-sm">
                                                <Zap size={16} />
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </>
                        )}
                        </div>

                        {filteredPackages.length === 0 && (
                            <div className="py-12 text-center text-slate-400 font-medium italic bg-white rounded-3xl border border-slate-200">
                                No packages found matching "{packageSearch}".
                            </div>
                        )}
                        
                        {/* Custom Large Order CTA */}
                        <div className="bg-blue-50/70 border border-blue-200 p-8 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm mt-8">
                            <div className="text-center md:text-left">
                                <h3 className="text-xl font-black uppercase text-slate-900 mb-2">Need a custom diamond amount or bulk order?</h3>
                                <p className="text-slate-600 text-sm font-medium max-w-lg leading-relaxed">
                                    We offer custom tournament top-ups and bulk rate discounts. Connect directly with our WhatsApp agent for instant assistance.
                                </p>
                            </div>
                            <a 
                                href={contactDetails?.whatsappLink} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="w-full md:w-auto bg-accent hover:bg-accent-hover text-white font-black py-4 px-8 rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-lg shadow-accent/25 text-sm uppercase tracking-wider whitespace-nowrap flex items-center justify-center gap-2"
                            >
                                <MessageCircle size={18} /> Chat on WhatsApp
                            </a>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default GamePage;
