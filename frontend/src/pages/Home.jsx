import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useDependencies } from '../DependencyContext';
import { useQuery } from '@tanstack/react-query';
import Navbar from '../components/Navbar';
import Marquee from '../components/Marquee';
import GameCard from '../components/GameCard';
import { marqueeImages } from '../data/games';
import { useStoreSettings } from '../context/StoreSettingsContext';
import logo from '../assets/favcoin.png';
import { Facebook, ShieldCheck, Zap, Award, ArrowRight, MessageCircle, Search, Sparkles } from 'lucide-react';

import t1 from '../assets/testimonials/t1.png';
import t2 from '../assets/testimonials/t2.png';
import t3 from '../assets/testimonials/t3.png';
import t4 from '../assets/testimonials/t4.png';
import t5 from '../assets/testimonials/t5.png';

const Home = () => {
  const { getGames } = useDependencies();
  const { contactDetails } = useStoreSettings();
  const [searchQuery, setSearchQuery] = useState('');
  
  const { data: gamesList = [] } = useQuery({
    queryKey: ['games'],
    queryFn: () => getGames.execute(),
  });

  const filteredGames = useMemo(() => {
    if (!searchQuery.trim()) return gamesList;
    const q = searchQuery.toLowerCase().trim();
    return gamesList.filter(g => 
      g.name.toLowerCase().includes(q) || 
      g.currency.toLowerCase().includes(q)
    );
  }, [gamesList, searchQuery]);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col overflow-x-hidden">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="pt-32 sm:pt-40 pb-14 px-6 text-center max-w-5xl mx-auto relative overflow-hidden">
          {/* Ambient Radial Blobs */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-blue-100/60 rounded-full blur-[100px] -z-10 animate-pulse-soft pointer-events-none" />
          
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-accent font-extrabold text-xs uppercase tracking-widest mb-6 shadow-sm">
            <Zap size={14} className="fill-accent text-accent" />
            Instant In-Game Currency Delivery
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight mb-6 leading-[1.05] text-slate-900 uppercase">
            DHANGADI <span className="text-accent">TOP UP</span> STORE
          </h1>

          <p className="text-base sm:text-lg md:text-xl text-slate-600 mb-10 max-w-2xl mx-auto font-medium leading-relaxed">
            The most trusted digital gaming store in Nepal. Instant Free Fire Diamonds, PUBG UC, Mobile Legends & UniPin with verified safe delivery.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a 
              href="#games" 
              className="w-full sm:w-auto bg-accent hover:bg-accent-hover text-white font-black py-4 px-9 rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-xl shadow-accent/25 text-base uppercase tracking-wider flex items-center justify-center gap-2"
            >
              Browse Games <ArrowRight size={18} />
            </a>
            <Link 
              to="/track" 
              className="w-full sm:w-auto bg-white border border-slate-200 hover:border-accent text-slate-800 font-bold py-4 px-9 rounded-2xl hover:bg-slate-50 transition-all text-base uppercase tracking-wider shadow-sm"
            >
              Track My Order
            </Link>
          </div>

          {/* Value Badges */}
          <div className="grid grid-cols-3 gap-4 max-w-xl mx-auto mt-12 pt-8 border-t border-slate-200/80">
            <div className="flex flex-col items-center">
              <span className="text-xl sm:text-2xl font-black text-slate-900">5-15 Min</span>
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-400">Avg Delivery</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-xl sm:text-2xl font-black text-accent">50K+</span>
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-400">Happy Gamers</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-xl sm:text-2xl font-black text-emerald-600">100%</span>
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-400">Safe & Secure</span>
            </div>
          </div>
        </section>

        {/* Moving Marquee Showcase */}
        <div className="mb-14 overflow-hidden relative">
          <Marquee images={marqueeImages} />
        </div>

        {/* Games Grid Section with Live Search */}
        <section id="games" className="py-12 sm:py-16 px-4 sm:px-8 max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 sm:mb-10 gap-6">
            <div>
              <span className="text-xs uppercase font-black tracking-widest text-accent mb-2 block">Direct Player ID Top-Up</span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight uppercase text-slate-900">
                Popular <span className="text-accent">Games</span>
              </h2>
              <p className="text-slate-500 text-sm sm:text-base font-medium mt-1">Select a game below to choose your diamonds or currency denomination</p>
            </div>

            {/* Quick Game Search Input */}
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search games (e.g. Free Fire, PUBG)..."
                className="w-full bg-white border border-slate-200 rounded-2xl pl-10 pr-4 py-3 text-xs sm:text-sm font-bold text-slate-900 placeholder:text-slate-400 outline-none focus:border-accent shadow-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {filteredGames.map(game => (
              <GameCard key={game.id} game={game} />
            ))}
          </div>

          {filteredGames.length === 0 && (
            <div className="py-16 text-center text-slate-400 font-medium italic">
              No games found matching "{searchQuery}".
            </div>
          )}
        </section>

        {/* Testimonials / Customer Proof Section */}
        <section id="testimonials" className="py-16 px-4 sm:px-8 max-w-7xl mx-auto overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <span className="text-xs uppercase font-black tracking-widest text-emerald-600 mb-2 block">Proof of Service</span>
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight uppercase text-slate-900">
                Customer <span className="text-accent">Payment Proofs</span>
              </h2>
              <p className="text-slate-500 text-sm sm:text-base font-medium mt-1">Real delivery screenshots verified across thousands of orders</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
             {[t1, t2, t3, t4, t5].map((img, i) => (
               <div key={i} className="bg-white border border-slate-200 rounded-3xl p-3 shadow-sm hover:shadow-xl hover:border-accent transition-all duration-300 group">
                 <div className="relative overflow-hidden rounded-2xl aspect-[16/10] bg-slate-50 border border-slate-100">
                    <img 
                      src={img} 
                      alt={`Testimonial ${i+1}`} 
                      className="w-full h-full object-contain object-center transition-transform duration-700 group-hover:scale-105" 
                    />
                    <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-full border border-slate-200 shadow-sm">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-[10px] font-black text-emerald-700 uppercase tracking-wider">Verified Delivery</span>
                    </div>
                 </div>
               </div>
             ))}
          </div>
        </section>
      </main>

      {/* Light Theme Footer */}
      <footer className="py-16 px-6 border-t border-slate-200 bg-slate-100 mt-20">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 sm:gap-16">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center border border-slate-200 shadow-sm">
                <img src={logo} alt="DN Official" className="h-8 w-8 object-contain" />
              </div>
              <div>
                <h3 className="text-2xl font-black tracking-tight uppercase text-slate-900">Dhangadi Top Up Store</h3>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Official Gaming Partner</p>
              </div>
            </div>
            <p className="text-slate-600 max-w-sm mb-8 font-medium text-sm leading-relaxed">
              Premium gaming currency & voucher solutions for gamers in Nepal. Fast, automated, and secure direct-to-ID delivery.
            </p>
            <div className="flex gap-3">
              <a 
                href={contactDetails.facebookLink} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="w-11 h-11 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-accent hover:text-white hover:border-accent transition-all shadow-sm"
              >
                <Facebook size={18} />
              </a>
              <a 
                href={contactDetails.whatsappLink} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="w-11 h-11 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-emerald-600 hover:text-white hover:border-emerald-600 transition-all shadow-sm"
              >
                <MessageCircle size={18} />
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-black text-xs uppercase tracking-[0.2em] text-slate-400 mb-6">Quick Links</h4>
            <ul className="space-y-3.5 text-slate-600 text-sm font-bold">
              <li><Link to="/track" className="hover:text-accent transition-colors">Track Order Status</Link></li>
              <li><Link to="/faq" className="hover:text-accent transition-colors">Frequently Asked Questions</Link></li>
              <li><Link to="/faq" className="hover:text-accent transition-colors">Delivery & Refund Policy</Link></li>
              <li><Link to="/faq" className="hover:text-accent transition-colors">Payment Guidelines</Link></li>
            </ul>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <h4 className="font-black text-xs uppercase tracking-[0.2em] text-slate-400 mb-4">24/7 Support</h4>
            <div className="space-y-4 text-slate-700 text-sm">
              <div>
                <span className="text-[10px] uppercase text-accent font-black tracking-wider block">WhatsApp Support</span>
                <span className="text-base font-bold text-slate-900">{contactDetails.whatsapp}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase text-accent font-black tracking-wider block">Email Inquiries</span>
                <span className="text-sm font-bold text-slate-900">{contactDetails.email}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto pt-12 mt-12 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-500 font-bold">
            <p>© 2026 DHANGADI TOP UP STORE. ALL RIGHTS RESERVED.</p>
            <p>Designed for fast & secure gaming top-ups</p>
        </div>
      </footer>

    </div>
  );
};

export default Home;
