import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDependencies } from '../DependencyContext';
import { useQuery } from '@tanstack/react-query';
import { generateProductSchema } from '../lib/seo';
import Navbar from '../components/Navbar';
import NanoBanner from '../components/NanoBanner';
import { contactDetails } from '../data/games';
import { ChevronLeft, ShieldCheck, Zap, Sparkles } from 'lucide-react';

const GamePage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { getGames } = useDependencies();
    const [quantity, setQuantity] = useState(1);

    const { data: game, isLoading } = useQuery({
        queryKey: ['game', id],
        queryFn: () => getGames.getById(id),
    });

    if (isLoading) return <div className="min-h-screen bg-background flex items-center justify-center text-white/50 animate-pulse">Loading...</div>;
    if (!game) return <div className="min-h-screen bg-background flex items-center justify-center text-white">Game not found</div>;

    const schema = generateProductSchema(game);

    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col">
            <script type="application/ld+json">
                {JSON.stringify(schema)}
            </script>
            <Navbar />
            
            <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 pt-36 pb-20">
                <Link to="/" className="flex items-center gap-2 text-white/40 hover:text-white transition-colors mb-12 group w-fit font-bold uppercase tracking-widest text-xs">
                    <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                    Back to games
                </Link>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    {/* Game Info - Left Sidebar */}
                    <div className="lg:col-span-4 lg:sticky lg:top-32 h-fit order-2 lg:order-1">
                        <div className="glass-card relative overflow-hidden group">
                            <div 
                                className="absolute inset-0 opacity-10 blur-3xl -z-10 group-hover:opacity-20 transition-opacity" 
                                style={{ backgroundColor: game.themeColor || '#9aff00' }}
                            />
                            
                            <div className="relative mb-8 aspect-square rounded-[2.5rem] overflow-hidden border border-white/5 shadow-2xl">
                                <img src={game.icon} alt={game.name} className="w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-110" />
                                {game.currencyIcon && (
                                    <div className="absolute top-4 right-4 w-16 h-16 bg-black/60 backdrop-blur-xl rounded-2xl p-3 border border-white/10 shadow-2xl animate-bounce-slow">
                                        <img src={game.currencyIcon} alt={game.currency} className="w-full h-full object-contain" />
                                    </div>
                                )}
                            </div>

                            <h1 className="text-3xl sm:text-4xl font-black tracking-tighter mb-4 uppercase">{game.name}</h1>
                            <p className="text-white/40 mb-10 font-medium leading-relaxed italic text-sm sm:base italic">"{game.description}"</p>
                            
                            <div className="space-y-6 pt-10 border-t border-white/5">
                                <div className="flex items-center gap-4 group/item">
                                    <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center border border-accent/20 group-hover/item:bg-accent group-hover/item:text-black transition-all">
                                        <ShieldCheck size={20} />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="font-black text-xs uppercase tracking-widest text-accent">Secured</span>
                                        <span className="text-sm font-bold opacity-60">Verified Payment System</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 group/item">
                                    <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center border border-accent/20 group-hover/item:bg-accent group-hover/item:text-black transition-all">
                                        <Zap size={20} />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="font-black text-xs uppercase tracking-widest text-accent">Lightning</span>
                                        <span className="text-sm font-bold opacity-60">5-15 Minutes Delivery</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Packages Grid - Right Content */}
                    <div className="lg:col-span-8 space-y-10 order-1 lg:order-2">
                        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                            <div>
                                <h2 className="text-2xl sm:text-3xl font-black tracking-tighter uppercase mb-2">Select <span className="text-accent">Package</span></h2>
                                <p className="text-white/20 font-bold uppercase tracking-[0.2em] text-xs">Choose the best value for your account</p>
                            </div>
                            <div className="px-4 py-2 rounded-xl bg-white/5 border border-white/5 flex items-center gap-2">
                                <Sparkles size={14} className="text-accent" />
                                <span className="text-[10px] font-black uppercase tracking-widest">{game.packages.length} Packages Available</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {game.supportsQuantity ? (
                            <div className="glass-card p-6 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-8 border border-accent/20 bg-accent/5">
                                <div className="text-center md:text-left w-full">
                                    <h3 className="text-2xl sm:text-3xl font-black tracking-tighter uppercase mb-2">Select <span className="text-accent">Quantity</span></h3>
                                    <p className="text-white/40 font-bold uppercase tracking-widest text-[10px] sm:text-xs">Tiered pricing applied automatically</p>
                                    <div className="mt-4 flex flex-col gap-1 text-[10px] sm:text-[11px] font-bold uppercase tracking-widest text-white/30 items-center md:items-start">
                                        <p>1 - 4 Units: <span className="text-white">NPR {game.pricing.basePrice}</span> each</p>
                                        <p>5+ Units: <span className="text-accent">NPR {game.pricing.tieredPrice}</span> each</p>
                                    </div>
                                </div>
                                <div className="flex flex-col items-center gap-6 w-full md:w-auto">
                                    <div className="flex items-center gap-4 sm:gap-6 bg-black/40 p-2 rounded-[2rem] border border-white/5 shadow-2xl">
                                        <button 
                                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                            className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-white/5 flex items-center justify-center hover:bg-accent hover:text-black transition-all text-xl sm:text-2xl font-black"
                                        >
                                            -
                                        </button>
                                        <span className="text-2xl sm:text-4xl font-black w-8 sm:w-12 text-center">{quantity}</span>
                                        <button 
                                            onClick={() => setQuantity(quantity + 1)}
                                            className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-white/5 flex items-center justify-center hover:bg-accent hover:text-black transition-all text-xl sm:text-2xl font-black"
                                        >
                                            +
                                        </button>
                                    </div>
                                    <button
                                        onClick={() => navigate(`/checkout/${game.id}/${game.packages[0].id}?q=${quantity}`)}
                                        className="w-full md:w-auto bg-accent text-black font-black py-4 sm:py-5 px-8 sm:px-10 rounded-2xl hover:scale-105 active:scale-95 transition-all text-base sm:text-lg uppercase tracking-widest"
                                    >
                                        Buy Now - NPR {quantity >= (game.pricing?.tierThreshold || 5) ? (game.pricing.tieredPrice * quantity) : (game.pricing.basePrice * quantity)}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <>
                                {game.packages.map((pkg) => (
                                    <button
                                        key={pkg.id}
                                        onClick={() => navigate(`/checkout/${game.id}/${pkg.id}`)}
                                        className="glass-morphism p-8 flex flex-col gap-6 group hover:border-accent/60 hover:bg-accent/[0.02] active:scale-[0.98] transition-all duration-500 relative overflow-hidden"
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="text-left">
                                                <p className="font-black text-xl sm:text-2xl tracking-tight mb-1 group-hover:text-accent transition-colors">{pkg.label}</p>
                                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">{game.currency}</span>
                                            </div>
                                            {game.currencyIcon && (
                                                <div className="w-12 h-12 bg-white/5 rounded-2xl p-2 group-hover:scale-110 transition-transform duration-500">
                                                    <img src={game.currencyIcon} alt={game.currency} className="w-full h-full object-contain" />
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex items-end justify-between mt-auto">
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-black uppercase tracking-widest text-white/20 mb-1">Our Price</span>
                                                <p className="text-accent font-black text-2xl sm:text-3xl tracking-tight">NPR {pkg.price}</p>
                                            </div>
                                            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-accent group-hover:text-black transition-all">
                                                <Zap size={18} />
                                            </div>
                                        </div>

                                        {/* Hover Shine Effect */}
                                        <div className="absolute top-0 -left-full w-full h-full bg-gradient-to-r from-transparent via-white/[0.03] to-transparent -skew-x-12 group-hover:left-full transition-all duration-1000" />
                                    </button>
                                ))}
                            </>
                        )}
                        </div>
                        
                        {/* Custom Order CTA */}
                        <div className="glass-card !bg-accent/5 border border-accent/20 p-10 mt-16 group cursor-pointer relative overflow-hidden">
                            <div className="absolute -right-20 -top-20 w-64 h-64 bg-accent/10 blur-[100px] rounded-full group-hover:scale-150 transition-transform duration-[2s]" />
                            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
                                <div className="text-center md:text-left">
                                    <h3 className="text-2xl sm:text-3xl font-black tracking-tighter uppercase mb-4">Don't see your desired amount?</h3>
                                    <p className="text-white/50 text-base sm:text-lg font-medium max-w-lg leading-relaxed">
                                        We provide custom top-ups and large scale transfers. Contact our dedicated support team on WhatsApp for exclusive rates and bulk discounts.
                                    </p>
                                </div>
                                <a 
                                    href={contactDetails.whatsappLink} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="w-full md:w-auto bg-accent text-black font-black py-5 sm:py-6 px-10 sm:px-12 rounded-[2rem] hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-accent/20 text-base sm:text-lg uppercase tracking-widest whitespace-nowrap"
                                >
                                    Chat on WhatsApp
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default GamePage;
