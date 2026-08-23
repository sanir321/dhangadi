import React from 'react';

const Marquee = ({ images }) => {
  // Duplicate images once for a seamless loop
  const duplicatedImages = [...images, ...images];

  return (
    <div className="w-full py-8 overflow-hidden bg-background relative">
      <div className="absolute inset-y-0 left-0 w-24 sm:w-40 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
      <div className="absolute inset-y-0 right-0 w-24 sm:w-40 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />
      
      <div className="flex w-max animate-marquee space-x-6 sm:space-x-8">
        {duplicatedImages.map((img, i) => (
          <div 
            key={i} 
            className="flex-shrink-0 w-[240px] sm:w-[360px] aspect-[16/9] overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-md group relative"
          >
            <img
              src={img}
              className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-105"
              alt={`Featured Game ${i + 1}`}
              onError={(e) => {
                e.target.parentElement.style.display = 'none';
              }}
            />
            {/* Subtle Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-white">Verified Official Delivery</span>
                </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Marquee;
