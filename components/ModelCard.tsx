
import React from 'react';
import { ModelData } from '../types';
import { ICONS } from '../constants';

interface ModelCardProps {
  model: ModelData;
  onLaunch: (id: string) => void;
}

const ModelCard: React.FC<ModelCardProps> = ({ model, onLaunch }) => {
  return (
    <div className="group relative glass rounded-2xl overflow-hidden border border-white/10 hover:border-cyan-500/50 transition-all duration-500 flex flex-col">
      <div className="relative h-48 overflow-hidden">
        <img 
          src={model.thumbnail} 
          alt={model.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 to-transparent opacity-60"></div>
        <div className="absolute top-4 left-4">
          <span className="px-3 py-1 rounded-full glass border border-white/20 text-[10px] font-bold tracking-widest uppercase">
            {model.category}
          </span>
        </div>
        <div className="absolute bottom-4 left-4 flex gap-2">
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                model.complexity === 'Complex' ? 'text-red-400 border-red-400/30' : 
                model.complexity === 'Medium' ? 'text-yellow-400 border-yellow-400/30' : 
                'text-green-400 border-green-400/30'
            }`}>
                {model.complexity}
            </span>
        </div>
      </div>
      
      <div className="p-6 flex-1 flex flex-col">
        <h3 className="font-orbitron text-xl font-bold text-white mb-2 group-hover:text-cyan-400 transition-colors">
          {model.title}
        </h3>
        <p className="text-slate-400 text-sm mb-6 flex-1 line-clamp-3 font-light">
          {model.description}
        </p>
        
        <button 
          onClick={() => onLaunch(model.id)}
          className="w-full bg-white/5 hover:bg-cyan-500 hover:text-slate-950 border border-white/10 hover:border-cyan-400 py-3 rounded-xl transition-all flex items-center justify-center gap-2 group/btn"
        >
          <ICONS.Play />
          <span className="font-bold text-sm tracking-wider">LAUNCH MODEL</span>
        </button>
      </div>
    </div>
  );
};

export default ModelCard;
