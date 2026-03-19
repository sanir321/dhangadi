import React from 'react';
import { Link } from 'react-router-dom';
import { useDependencies } from '../DependencyContext';
import { useQuery } from '@tanstack/react-query';
import Navbar from '../components/Navbar';
import Marquee from '../components/Marquee';
import GameCard from '../components/GameCard';
import NanoBanner from '../components/NanoBanner';
import { marqueeImages, contactDetails } from '../data/games';
import logo from '../assets/favcoin.png';
import { Facebook } from 'lucide-react';

import t1 from '../assets/testimonials/t1.png';
import t2 from '../assets/testimonials/t2.png';
import t3 from '../assets/testimonials/t3.png';
import t4 from '../assets/testimonials/t4.png';
import t5 from '../assets/testimonials/t5.png';

const Home = () => {
  const { getGames } = useDependencies();
  
  const { data: gamesList = [] } = useQuery({
    queryKey: ['games'],
    queryFn: () => getGames.execute(),
  });

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col overflow-x-hidden">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="pt-32 sm:pt-40 pb-16 px-6 text-center max-w-5xl mx-auto relative overflow-hidden">
          {/* Background Blobs */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent/5 rounded-full blur-[120px] -z-10 animate-pulse-soft" />
          
          <h1 className="text-5xl sm:text-7xl md:text-8xl font-black tracking-tighter mb-8 leading-[0.9]">
            DHANGADI <br /> <span className="text-white/20">TOP UP</span> <span className="text-accent underline decoration-white/10">STORE</span>
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-white/40 mb-12 max-w-xl mx-auto font-medium leading-relaxed">
            The most trusted marketplace for gamers in Nepal. Serving <span className="text-white font-bold">50K+ verified users</span> with instant delivery.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a href="#games" className="w-full sm:w-auto bg-accent text-black font-black py-5 px-10 rounded-3xl hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-accent/20 text-lg uppercase tracking-wider">
                Browse Games
            </a>
            <Link to="/track" className="w-full sm:w-auto glass-morphism py-5 px-10 font-black hover:bg-white/5 transition-all text-lg uppercase tracking-wider">
                Track Order
            </Link>
          </div>
        </section>

        {/* Moving Marquee */}
        <div className="mb-20 overflow-hidden relative">
            <Marquee images={marqueeImages} />
        </div>

        {/* Games Grid */}
        <section id="games" className="py-12 sm:py-20 px-4 sm:px-8 max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 sm:mb-16 gap-4">
            <div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tighter mb-4 uppercase">Popular <span className="text-accent">Games</span></h2>
              <p className="text-white/30 text-base sm:text-lg font-medium">Select your favorite title to start top-up</p>
            </div>
            <div className="h-[2px] flex-1 max-w-md bg-gradient-to-r from-accent/40 to-transparent hidden md:block" />
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-10">
            {gamesList.map(game => (
              <GameCard key={game.id} game={game} />
            ))}
          </div>
        </section>

        {/* Testimonials Section */}
        <section id="testimonials" className="py-20 px-4 sm:px-8 max-w-7xl mx-auto overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-4">
            <div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tighter mb-4 uppercase">Customer <span className="text-accent">Feedback</span></h2>
              <p className="text-white/30 text-base sm:text-lg font-medium">100% Trusted by thousands of gamers in Nepal</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
             {[t1, t2, t3, t4, t5].map((img, i) => (
               <div key={i} className="glass-morphism p-3 hover:scale-[1.02] transition-all cursor-pointer group bg-white/[0.02]">
                 <div className="relative overflow-hidden rounded-xl aspect-[16/10] bg-black/20 border border-white/5">
                    <img 
                        src={img} 
                        alt={`Testimonial ${i+1}`} 
                        className="w-full h-full object-contain object-center transition-transform duration-700 group-hover:scale-110" 
                    />
                    <div className="absolute top-3 left-3 flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                        <span className="text-[10px] font-black text-accent uppercase tracking-[0.2em] drop-shadow-lg">Verified Order</span>
                    </div>
                 </div>
               </div>
             ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-20 px-6 border-t border-white/5 bg-black/40 backdrop-blur-3xl mt-20">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-16">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-3 mb-8 group cursor-pointer">
              <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center border border-white/5 group-hover:bg-accent/10 transition-all">
                <img src={logo} alt="DN Official" className="h-8 w-8 object-contain" />
              </div>
              <h3 className="text-3xl font-black tracking-tighter uppercase italic">Dhangadi Top Up Store</h3>
            </div>
            <p className="text-white/30 max-w-xs mb-10 font-medium leading-relaxed">
              Premium gaming solutions for the Nepalese market. Fast, secure, and reliable since 2021.
            </p>
            <div className="flex gap-4">
              <a href={contactDetails.facebookLink} target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center hover:bg-accent hover:text-black transition-all">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="w-12 h-12 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center hover:bg-accent hover:text-black transition-all">IG</a>
              <a href={contactDetails.whatsappLink} target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center hover:bg-accent hover:text-black transition-all">WA</a>
            </div>
          </div>
          <div>
            <h4 className="font-black text-xs uppercase tracking-[0.3em] text-white/20 mb-8">Information</h4>
            <ul className="space-y-4 text-white/50 text-sm font-bold tracking-tight">
              <li><Link to="/faq" className="hover:text-accent transition-colors underline decoration-white/5 underline-offset-4">Privacy Policy</Link></li>
              <li><Link to="/faq" className="hover:text-accent transition-colors underline decoration-white/5 underline-offset-4">Terms of Service</Link></li>
              <li><Link to="/faq" className="hover:text-accent transition-colors underline decoration-white/5 underline-offset-4">Delivery Policy</Link></li>
              <li><Link to="/faq" className="hover:text-accent transition-colors underline decoration-white/5 underline-offset-4">Success Stories</Link></li>
            </ul>
          </div>
          <div className="glass-morphism p-8 bg-accent/[0.02]">
            <h4 className="font-black text-xs uppercase tracking-[0.3em] text-white/20 mb-8">24/7 Support</h4>
            <ul className="space-y-6 text-white/50 text-sm font-bold">
              <li className="flex flex-col gap-1">
                <span className="text-[10px] uppercase text-accent tracking-widest">WhatsApp</span>
                <span className="text-lg">{contactDetails.whatsapp}</span>
              </li>
              <li className="flex flex-col gap-1">
                <span className="text-[10px] uppercase text-accent tracking-widest">Email Address</span>
                <span className="text-lg">{contactDetails.email}</span>
              </li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto pt-16 mt-16 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/10">© 2026 DHANGADI TOP UP STORE. ALL RIGHTS RESERVED.</p>
            <div className="flex gap-6 opacity-20">
                <div className="h-4 w-12 bg-white rounded flex-shrink-0" />
                <div className="h-4 w-12 bg-white rounded flex-shrink-0" />
                <div className="h-4 w-12 bg-white rounded flex-shrink-0" />
            </div>
        </div>
      </footer>

    </div>
  );
};

export default Home;
