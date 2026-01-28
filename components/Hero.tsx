
import React from 'react';

const Hero: React.FC = () => {
  return (
    <section className="pt-32 pb-20 px-6 text-center max-w-5xl mx-auto">
      <div className="inline-block px-4 py-1.5 rounded-full glass border border-cyan-500/30 text-cyan-400 text-xs font-bold tracking-[0.2em] mb-8 animate-pulse">
        SCIENCE VISUALIZATION ENGINE V3.1
      </div>
      <h1 className="font-orbitron text-5xl md:text-7xl font-bold mb-6 leading-tight bg-gradient-to-r from-white via-cyan-200 to-blue-500 bg-clip-text text-transparent">
        Interactive Universe <br /> Models
      </h1>
      <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed font-light">
        Explore complex physical phenomena through high-fidelity interactive simulations. 
        Designed for researchers, educators, and curious minds.
      </p>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <button className="w-full sm:w-auto px-8 py-4 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl transition-all neon-glow flex items-center justify-center gap-2">
          EXPLORE CATALOG
        </button>
        <button className="w-full sm:w-auto px-8 py-4 glass border border-white/20 hover:bg-white/10 text-white font-bold rounded-xl transition-all">
          VIEW DOCUMENTATION
        </button>
      </div>
    </section>
  );
};

export default Hero;
