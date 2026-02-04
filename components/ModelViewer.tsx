
import React, { useEffect, useState } from 'react';
import { ModelData } from '../types';
import { ICONS } from '../constants';
import MirrorSim from './MirrorSim';
import LensSim from './LensSim';
import SlinkySim from './SlinkySim';
import SolarSystemSim from './SolarSystemSim';
import BarycenterSim from './BarycenterSim';
import EarthSeasonsSim from './EarthSeasonsSim';

interface ModelViewerProps {
  model: ModelData;
  onClose: () => void;
}

const ModelViewer: React.FC<ModelViewerProps> = ({ model, onClose }) => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate engine bootup
    const timer = setTimeout(() => setIsLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  const renderSimulation = () => {
    if (model.id === 'concave-mirror') {
      return <MirrorSim />;
    }
    if (model.id === 'thin-lens-lab') {
      return <LensSim />;
    }
    if (model.id === 'slinky-lab') {
      return <SlinkySim />;
    }
    if (model.id === 'solar-system') {
      return <SolarSystemSim />;
    }
    if (model.id === 'barycenter-lab') {
      return <BarycenterSim />;
    }
    if (model.id === 'earth-seasons') {
      return <EarthSeasonsSim />;
    }
    

    return (
      <div className="flex flex-col items-center justify-center h-full space-y-4">
          <div className="p-12 glass border-cyan-500/20 rounded-3xl text-center max-w-lg mx-auto">
              <div className="w-16 h-16 mx-auto mb-6 bg-cyan-500/20 rounded-2xl flex items-center justify-center text-cyan-400 border border-cyan-500/30">
                  <ICONS.Activity />
              </div>
              <h3 className="font-orbitron text-2xl font-bold mb-4 text-white">SIMULATION READY</h3>
              <p className="text-slate-400 mb-8 font-light">
                  The {model.title} environment has been successfully instantiated. All physics engines are nominal. 
                  GPU Acceleration is active.
              </p>
              <div className="grid grid-cols-2 gap-4 text-left">
                  <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                      <span className="block text-[10px] text-slate-500 font-bold mb-1">FPS</span>
                      <span className="font-mono text-cyan-400">120.0</span>
                  </div>
                  <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                      <span className="block text-[10px] text-slate-500 font-bold mb-1">LATENCY</span>
                      <span className="font-mono text-cyan-400">2.4ms</span>
                  </div>
              </div>
          </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-[60] bg-slate-950 flex flex-col">
      {/* Viewer Header */}
      <div className="h-16 glass border-b border-white/10 px-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full transition-colors text-slate-400 hover:text-white"
          >
            <ICONS.Back />
          </button>
          <div className="h-4 w-[1px] bg-white/10"></div>
          <div>
            <span className="text-xs font-bold text-cyan-400 tracking-widest block leading-none mb-1">RUNNING: {model.category}</span>
            <h2 className="font-orbitron text-sm font-bold text-white leading-none">{model.title}</h2>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
           <div className="flex items-center gap-2 px-3 py-1 bg-green-500/10 border border-green-500/30 rounded-full">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-[10px] font-bold text-green-400">ENGINE: ACTIVE</span>
           </div>
           <button className="text-xs font-bold bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-2 rounded-lg transition-all">
             EXPORT DATA
           </button>
        </div>
      </div>

      {/* Main Simulation Area */}
      <div className="flex-1 relative bg-black overflow-hidden flex items-center justify-center">
        {isLoading ? (
          <div className="flex flex-col items-center gap-6">
            <div className="relative w-24 h-24">
              <div className="absolute inset-0 border-4 border-cyan-500/20 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-t-cyan-500 rounded-full animate-spin"></div>
            </div>
            <div className="text-center">
              <p className="font-orbitron text-xl font-bold text-white mb-2">INITIALIZING KERNEL</p>
              <p className="text-slate-500 text-sm font-light animate-pulse">Allocating VRAM and Spacetime Buffers...</p>
            </div>
          </div>
        ) : (
          <div className="w-full h-full relative group">
            {/* Visual Grid Layer */}
            <div className="absolute inset-0 opacity-20 pointer-events-none">
              <div className="w-full h-full" style={{ 
                backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.05) 1px, transparent 0)',
                backgroundSize: '40px 40px'
              }}></div>
            </div>
            
            {renderSimulation()}

            {/* General Overlay Controls (Only show for generic simulators) */}
            {model.id !== 'concave-mirror' && model.id !== 'thin-lens-lab' && model.id !== 'slinky-lab' && model.id !== 'solar-system' && model.id !== 'barycenter-lab' && model.id !== 'earth-seasons' && model.id !== 'dc-motor-lab' && (
              <div className="absolute bottom-8 left-8 flex flex-col gap-4">
                  <div className="glass p-4 rounded-2xl border-white/10 w-64">
                      <span className="text-[10px] font-bold text-slate-500 tracking-widest block mb-4">PARAMETER CONFIGURATION</span>
                      <div className="space-y-4">
                          <div className="space-y-2">
                              <div className="flex justify-between text-[10px] font-bold">
                                  <span>MAGNITUDE</span>
                                  <span className="text-cyan-400">0.85x</span>
                              </div>
                              <div className="h-1 bg-white/10 rounded-full">
                                  <div className="h-full w-[85%] bg-cyan-500 rounded-full"></div>
                              </div>
                          </div>
                          <div className="space-y-2">
                              <div className="flex justify-between text-[10px] font-bold">
                                  <span>STOCHASTICITY</span>
                                  <span className="text-cyan-400">0.12%</span>
                              </div>
                              <div className="h-1 bg-white/10 rounded-full">
                                  <div className="h-full w-[12%] bg-cyan-500 rounded-full"></div>
                              </div>
                          </div>
                      </div>
                  </div>
              </div>
            )}
            
            <div className="absolute top-8 right-8 flex flex-col gap-2">
               <button className="w-12 h-12 glass hover:bg-white/10 rounded-xl flex items-center justify-center border border-white/10 text-white transition-all">
                    <ICONS.Info />
               </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ModelViewer;
