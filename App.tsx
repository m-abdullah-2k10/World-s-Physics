
import React, { useState } from 'react';
import Starfield from './components/Starfield';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import ModelCard from './components/ModelCard';
import ModelViewer from './components/ModelViewer';
import { MODELS } from './constants';
import { ModelData } from './types';

const App: React.FC = () => {
  const [activeModelId, setActiveModelId] = useState<string | null>(null);

  const activeModel = MODELS.find(m => m.id === activeModelId);

  const handleLaunchModel = (id: string) => {
    setActiveModelId(id);
    // When a model launches, we can assume the rest of the site logic halts or sleeps
    // to preserve resources, handled here by rendering the ModelViewer in its own overlay.
  };

  const handleCloseModel = () => {
    setActiveModelId(null);
  };

  return (
    <div className="min-h-screen">
      <Starfield />
      
      {/* Hide primary UI when a model is active for "single project at a time" performance focus */}
      <div className={activeModelId ? 'hidden' : 'block'}>
        <Navbar onLogoClick={handleCloseModel} />
        
        <main className="container mx-auto px-6 pb-24">
          <Hero />
          
          <section id="catalog" className="scroll-mt-32">
            <div className="flex items-center justify-between mb-12">
              <div>
                <h2 className="font-orbitron text-2xl md:text-3xl font-bold text-white mb-2">Simulation Catalog</h2>
                <div className="h-1 w-20 bg-cyan-500 rounded-full"></div>
              </div>
              <div className="flex gap-2">
                <button className="px-4 py-2 glass rounded-lg text-xs font-bold border-cyan-500/50 text-cyan-400">ALL</button>
                <button className="px-4 py-2 glass rounded-lg text-xs font-bold border-white/10 hover:border-white/30 text-slate-400">ASTRO</button>
                <button className="px-4 py-2 glass rounded-lg text-xs font-bold border-white/10 hover:border-white/30 text-slate-400">QUANTUM</button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {MODELS.map((model) => (
                <ModelCard 
                  key={model.id} 
                  model={model} 
                  onLaunch={handleLaunchModel} 
                />
              ))}
            </div>
          </section>
          
          <footer className="mt-32 border-t border-white/5 pt-12 flex flex-col md:flex-row items-center justify-between text-slate-500 text-sm font-light">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
               <span className="font-orbitron font-bold text-xs tracking-wider">ASTROPHYS V3.1</span>
               <span className="mx-2 opacity-30">|</span>
               <span>&copy; 2024 Advanced Scientific Visuals</span>
            </div>
            <div className="flex gap-8">
              <a href="#" className="hover:text-cyan-400 transition-colors">Privacy</a>
              <a href="#" className="hover:text-cyan-400 transition-colors">Terms</a>
              <a href="#" className="hover:text-cyan-400 transition-colors">API Keys</a>
              <a href="#" className="hover:text-cyan-400 transition-colors">Contact</a>
            </div>
          </footer>
        </main>
      </div>

      {/* When activeModel is set, show the Viewer component which dominates the screen and resource context */}
      {activeModel && (
        <ModelViewer 
          model={activeModel} 
          onClose={handleCloseModel} 
        />
      )}
    </div>
  );
};

export default App;
