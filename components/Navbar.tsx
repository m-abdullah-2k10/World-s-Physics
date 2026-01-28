
import React from 'react';
import { ICONS } from '../constants';

const Navbar: React.FC<{ onLogoClick: () => void }> = ({ onLogoClick }) => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/10 px-6 py-4 flex items-center justify-between">
      <div 
        className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
        onClick={onLogoClick}
      >
        <div className="w-10 h-10 bg-cyan-500 rounded-lg flex items-center justify-center neon-glow">
          <ICONS.Activity />
        </div>
        <span className="font-orbitron font-bold text-xl tracking-wider text-cyan-400">ASTRO<span className="text-white">PHYS</span></span>
      </div>
      
      <div className="hidden md:flex items-center gap-8 text-sm font-medium tracking-wide">
        <a href="#" className="hover:text-cyan-400 transition-colors">DASHBOARD</a>
        <a href="#" className="hover:text-cyan-400 transition-colors">RESEARCH</a>
        <a href="#" className="hover:text-cyan-400 transition-colors">DOCUMENTATION</a>
        <button className="bg-white/10 hover:bg-white/20 text-white px-5 py-2 rounded-full border border-white/20 transition-all">
          SIGN IN
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
