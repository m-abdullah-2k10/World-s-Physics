
import React from 'react';
import { PlanetData } from './SolarData';

interface InfoPanelProps {
  planet: PlanetData | null;
  onClose: () => void;
}

const InfoPanel: React.FC<InfoPanelProps> = ({ planet, onClose }) => {
  if (!planet) return null;

  return (
    <div className="absolute z-20 md:top-8 md:left-8 bottom-0 left-0 right-0 md:right-auto md:w-96 p-6 md:rounded-2xl rounded-t-2xl glass border-t md:border border-white/10 text-white shadow-2xl animate-slide-in">
      <div className="flex justify-between items-start mb-4">
        <div>
          <span className="text-xs font-bold text-cyan-400 tracking-widest uppercase">Target Lock</span>
          <h2 className="font-orbitron text-3xl font-bold mt-1">{planet.name}</h2>
        </div>
        <button 
          onClick={onClose}
          className="p-2 hover:bg-white/10 rounded-full transition-colors text-slate-400 hover:text-white"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
      </div>

      <p className="text-slate-300 text-sm leading-relaxed mb-6 border-l-2 border-cyan-500 pl-3">
        {planet.description}
      </p>

      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-white/5 p-3 rounded-xl border border-white/5">
          <span className="block text-[10px] text-slate-500 uppercase font-bold mb-1">Mass</span>
          <span className="font-mono text-sm text-cyan-400">{planet.stats.mass}</span>
        </div>
        <div className="bg-white/5 p-3 rounded-xl border border-white/5">
          <span className="block text-[10px] text-slate-500 uppercase font-bold mb-1">Gravity</span>
          <span className="font-mono text-sm text-cyan-400">{planet.stats.gravity}</span>
        </div>
        <div className="bg-white/5 p-3 rounded-xl border border-white/5">
          <span className="block text-[10px] text-slate-500 uppercase font-bold mb-1">Diameter</span>
          <span className="font-mono text-sm text-white">{planet.stats.diameter}</span>
        </div>
        <div className="bg-white/5 p-3 rounded-xl border border-white/5">
          <span className="block text-[10px] text-slate-500 uppercase font-bold mb-1">Known Moons</span>
          <span className="font-mono text-sm text-white">{planet.stats.moons}</span>
        </div>
        
        <div className="bg-white/5 p-3 rounded-xl border border-white/5 col-span-2">
           <div className="flex justify-between items-center border-b border-white/5 pb-2 mb-2">
             <span className="text-[10px] text-slate-500 uppercase font-bold">Surface Temp</span>
             <span className="font-mono text-sm text-yellow-400">{planet.stats.temp}</span>
           </div>
           <div className="flex justify-between items-center border-b border-white/5 pb-2 mb-2">
             <span className="text-[10px] text-slate-500 uppercase font-bold">Day Length</span>
             <span className="font-mono text-sm text-white">{planet.stats.day}</span>
           </div>
           <div className="flex justify-between items-center">
             <span className="text-[10px] text-slate-500 uppercase font-bold">Orbital Period</span>
             <span className="font-mono text-sm text-white">{planet.stats.year}</span>
           </div>
        </div>
      </div>

      <button 
        onClick={onClose}
        className="w-full py-3 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/50 text-cyan-400 font-bold rounded-xl text-xs tracking-wider transition-all uppercase"
      >
        Return to System View
      </button>
    </div>
  );
};

export default InfoPanel;