import React from 'react';

const Marquee = ({ images }) => {
  // Duplicate images once for a seamless loop
  const duplicatedImages = [...images, ...images];

  return (
    <div className="w-full py-12 overflow-hidden bg-background relative">
      <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-background to-transparent z-10" />
      <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-background to-transparent z-10" />
      
      <div className="flex w-max animate-marquee space-x-10">
        {duplicatedImages.map((img, i) => (
          <div 
            key={i} 
            className="flex-shrink-0 w-[300px] md:w-[450px] aspect-[16/9] overflow-hidden rounded-[2rem] border border-white/5 bg-white/5 group relative"
          >
            <img
              src={img}
              className="object-cover w-full h-full transition-transform duration-[3s] group-hover:scale-110 opacity-80 sm:opacity-60 group-hover:opacity-100 transition-opacity"
              alt={`Game Impression ${i + 1}`}
              onError={(e) => {
                e.target.parentElement.style.display = 'none';
              }}
            />
            {/* Glass Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-8">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white">Live Topup Available</span>
                </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Marquee;
