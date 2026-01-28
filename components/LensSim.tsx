import React, { useState, useRef, useEffect } from 'react';

const LensSim: React.FC = () => {
  const [lensType, setLensType] = useState<'convex' | 'concave'>('convex');
  const [p, setP] = useState(200); // Object distance
  const [fMag, setFMag] = useState(150); // Focal length magnitude
  const [isDragging, setIsDragging] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);

  // Numerical Mode State
  const [isNumerical, setIsNumerical] = useState(false);
  const [solveTarget, setSolveTarget] = useState<'f' | 'p' | 'q'>('q');
  const [numValues, setNumValues] = useState({ p: '', q: '', f: '' });

  const ho = 60; // Object height
  const lensX = 500; // Optical center X
  const axisY = 300; // Optical axis Y
  
  // Physics Calculations
  let f: number;
  let q: number;
  let M: number;

  if (isNumerical) {
      const valP = parseFloat(numValues.p) || 0;
      const valQ = parseFloat(numValues.q) || 0;
      const valF = parseFloat(numValues.f) || 0;

      f = valF;
      q = valQ;
      // p is strictly input
      
      M = (valP !== 0) ? -valQ / valP : 0;
  } else {
      f = lensType === 'convex' ? fMag : -fMag;
      q = (p * f) / (p - f);
      M = -q / p;
  }
  
  const hi = M * ho; // Image height
  const objectX = lensX - (isNumerical ? (parseFloat(numValues.p) || 0) : p);
  const imageX = lensX + q; 

  // Visual Helpers
  const effectiveLensType = isNumerical 
    ? (parseFloat(numValues.f) < 0 ? 'concave' : 'convex')
    : lensType;

  // --- Handlers ---

  const toggleNumericalMode = () => {
      const newMode = !isNumerical;
      setIsNumerical(newMode);
      if (newMode) {
          setNumValues({ p: '', q: '', f: '' });
      } else {
          setP(200);
          setFMag(150);
          setLensType('convex');
      }
  };

  const handleNumericalCalc = (target: 'f' | 'p' | 'q', currentVals: {p: string, q: string, f: string}) => {
      const vP = parseFloat(currentVals.p);
      const vQ = parseFloat(currentVals.q);
      const vF = parseFloat(currentVals.f);
      let result = NaN;

      // 1/f = 1/p + 1/q
      if (target === 'q' && !isNaN(vP) && !isNaN(vF)) {
          // q = (p*f)/(p-f)
          if (vP - vF !== 0) result = (vP * vF) / (vP - vF);
      } else if (target === 'p' && !isNaN(vQ) && !isNaN(vF)) {
          // p = (q*f)/(q-f)
          if (vQ - vF !== 0) result = (vQ * vF) / (vQ - vF);
      } else if (target === 'f' && !isNaN(vP) && !isNaN(vQ)) {
          // f = (p*q)/(p+q)
          if (vP + vQ !== 0) result = (vP * vQ) / (vP + vQ);
      }

      if (!isNaN(result)) {
           const cleanRes = Math.round(result * 100) / 100;
           setNumValues(prev => ({ ...prev, [target]: cleanRes.toString() }));
      }
  };

  const onNumInputChange = (field: 'f' | 'p' | 'q', val: string) => {
      const nextVals = { ...numValues, [field]: val };
      setNumValues(nextVals);

      if (field !== solveTarget) {
          const otherField = ['f', 'p', 'q'].find(k => k !== solveTarget && k !== field) as 'f'|'p'|'q';
          if (nextVals[otherField] !== '' && nextVals[field] !== '') {
               handleNumericalCalc(solveTarget, nextVals);
          }
      }
  };

  const handlePChange = (val: number) => {
    const clamped = Math.max(0.1, Math.min(lensX - 10, val));
    setP(clamped);
  };

  const handleFChange = (val: number) => {
    const clamped = Math.max(0.1, Math.min(500, val));
    setFMag(clamped);
  };

  const handleMouseMove = (e: React.MouseEvent | MouseEvent) => {
    if (!isDragging || !svgRef.current || isNumerical) return;
    const CTM = svgRef.current.getScreenCTM();
    if (!CTM) return;
    
    // Convert clientX to SVG coordinates using the CTM
    // formula: (screenX - translateX) / scaleX
    const clientX = e.clientX;
    const x = (clientX - CTM.e) / CTM.a;

    let newP = lensX - x;
    newP = Math.max(0.1, Math.min(lensX - 20, newP));
    setP(Math.round(newP * 10) / 10);
  };

  const handleMouseUp = () => setIsDragging(false);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    } else {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  const getNature = () => {
    if (isNumerical && (parseFloat(numValues.p) === 0 || parseFloat(numValues.f) === 0)) return "Enter Parameters";
    
    let nature = [];
    if (q > 0) nature.push('Real');
    else nature.push('Virtual');

    if (hi < 0) nature.push('Inverted');
    else nature.push('Upright');

    const absM = Math.abs(M);
    if (Math.abs(absM - 1) < 0.05) nature.push('Same Size');
    else if (absM > 1.0) nature.push('Magnified');
    else nature.push('Diminished');

    if (effectiveLensType === 'convex' && Math.abs((isNumerical ? (parseFloat(numValues.p)||0) : p) - Math.abs(f)) < 0.5) return "No Image (At Infinity)";

    return nature.join(', ');
  };

  const inputClass = "w-20 bg-white/5 border-b border-white/20 text-right font-mono text-xs focus:outline-none focus:border-cyan-400 focus:bg-white/10 px-1 py-0.5 rounded-t text-white";
  const numInputClass = "w-full bg-slate-900 border border-white/20 text-right font-mono text-sm focus:outline-none focus:border-cyan-400 focus:shadow-[0_0_10px_rgba(34,211,238,0.2)] px-3 py-2 rounded text-cyan-400";
  const numLabelClass = "text-slate-400 text-xs font-bold uppercase tracking-wider mb-1 block";

  const renderRays = isNumerical 
    ? (parseFloat(numValues.p) > 0 && Math.abs(parseFloat(numValues.f)) > 0)
    : true;

  // For rendering, use absolute f value since visuals often need radius
  const visualFMag = Math.abs(f);

  return (
    <div className="w-full h-full flex flex-col p-4 bg-slate-950 font-sans select-none">
      <div className="flex-1 relative overflow-hidden glass rounded-2xl border-white/5">
        <svg
          ref={svgRef}
          viewBox="0 0 1000 600"
          className={`w-full h-full ${!isNumerical ? 'cursor-crosshair' : ''}`}
          onMouseDown={() => !isNumerical && setIsDragging(true)}
        >
          {/* Grids and Axes */}
          <line x1="0" y1={axisY} x2="1000" y2={axisY} stroke="rgba(255,255,255,0.1)" strokeDasharray="5,5" strokeWidth="1" />
          <line x1={lensX} y1="0" x2={lensX} y2="600" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />

          {/* Focal Points - Display logic */}
          {renderRays && (
            <g>
                <circle cx={lensX - visualFMag} cy={axisY} r="3" fill="#a5f3fc" opacity="0.6" />
                <text x={lensX - visualFMag} y={axisY + 20} fill="#a5f3fc" opacity="0.6" fontSize="10" textAnchor="middle">F1</text>
                
                <circle cx={lensX + visualFMag} cy={axisY} r="3" fill="#a5f3fc" opacity="0.6" />
                <text x={lensX + visualFMag} y={axisY + 20} fill="#a5f3fc" opacity="0.6" fontSize="10" textAnchor="middle">F2</text>
            </g>
          )}

          {/* LENS DRAWING */}
          <g filter="drop-shadow(0 0 10px rgba(165, 243, 252, 0.3))">
             {effectiveLensType === 'convex' ? (
                 <path 
                    d={`M ${lensX} 50 Q ${lensX + 30} 300 ${lensX} 550 Q ${lensX - 30} 300 ${lensX} 50`}
                    fill="rgba(165, 243, 252, 0.1)"
                    stroke="rgba(165, 243, 252, 0.6)"
                    strokeWidth="2"
                 />
             ) : (
                 <path 
                    d={`M ${lensX - 15} 50 Q ${lensX + 5} 300 ${lensX - 15} 550 L ${lensX + 15} 550 Q ${lensX - 5} 300 ${lensX + 15} 50 Z`}
                    fill="rgba(165, 243, 252, 0.1)"
                    stroke="rgba(165, 243, 252, 0.6)"
                    strokeWidth="2"
                 />
             )}
          </g>

          {/* RAY TRACING */}
          {renderRays && Math.abs((isNumerical ? parseFloat(numValues.p) : p) - visualFMag) > 0.5 && (
              <>
                {/* Ray 1: Parallel to Axis -> Refracts through Focus */}
                <line x1={objectX} y1={axisY - ho} x2={lensX} y2={axisY - ho} stroke="rgba(234, 179, 8, 0.6)" strokeWidth="2" />
                
                {effectiveLensType === 'convex' ? (
                   // Convex: Passes through F2 (right side)
                   <>
                     <line x1={lensX} y1={axisY - ho} x2={lensX + 600} y2={axisY - ho + (600 * (ho/visualFMag))} stroke="rgba(34, 211, 238, 0.6)" strokeWidth="2" />
                     {q < 0 && (
                        <line x1={lensX} y1={axisY - ho} x2={imageX} y2={axisY - hi} stroke="rgba(34, 211, 238, 0.3)" strokeWidth="1" strokeDasharray="4,4" />
                     )}
                   </>
                ) : (
                   // Concave: Diverges from F1 (left side)
                   <>
                     <line x1={lensX} y1={axisY - ho} x2={lensX + 600} y2={axisY - ho - (600 * (ho/visualFMag))} stroke="rgba(34, 211, 238, 0.6)" strokeWidth="2" />
                     <line x1={lensX} y1={axisY - ho} x2={lensX - visualFMag} y2={axisY} stroke="rgba(34, 211, 238, 0.3)" strokeWidth="1" strokeDasharray="4,4" />
                   </>
                )}

                {/* Ray 2: Through Optical Center (Undeviated) */}
                <line x1={objectX} y1={axisY - ho} x2={lensX + (lensX - objectX) * 2} y2={axisY + ho * 2} stroke="rgba(59, 130, 246, 0.6)" strokeWidth="2" />
                
                {(q < 0) && (
                   <line x1={objectX} y1={axisY - ho} x2={imageX} y2={axisY - hi} stroke="rgba(59, 130, 246, 0.3)" strokeWidth="1" strokeDasharray="4,4" />
                )}
              </>
          )}

          {/* OBJECT */}
          {renderRays && (
            <g className={!isNumerical ? "cursor-ew-resize" : ''}>
                <line x1={objectX} y1={axisY} x2={objectX} y2={axisY - ho} stroke="#a855f7" strokeWidth="6" strokeLinecap="round" />
                <path d={`M ${objectX - 10} ${axisY - ho + 15} L ${objectX} ${axisY - ho} L ${objectX + 10} ${axisY - ho + 15}`} fill="none" stroke="#a855f7" strokeWidth="4" strokeLinejoin="round" />
                <text x={objectX} y={axisY - ho - 15} fill="#a855f7" fontSize="14" fontWeight="bold" textAnchor="middle" className="font-orbitron">OBJECT</text>
                <rect x={objectX - 30} y={axisY + 15} width="60" height="20" rx="4" fill="rgba(168, 85, 247, 0.2)" stroke="rgba(168, 85, 247, 0.5)" />
                <text x={objectX} y={axisY + 30} fill="white" fontSize="12" fontWeight="bold" textAnchor="middle" className="font-mono">p:{(isNumerical ? parseFloat(numValues.p)||0 : p).toFixed(1)}</text>
            </g>
          )}

          {/* IMAGE */}
          {renderRays && Math.abs(q) < 5000 && Math.abs((isNumerical ? parseFloat(numValues.p)||0 : p) - visualFMag) > 0.5 && (
              <g opacity={q < 0 ? 0.6 : 1}>
                <line x1={imageX} y1={axisY} x2={imageX} y2={axisY - hi} stroke="#2dd4bf" strokeWidth="6" strokeLinecap="round" />
                <path 
                    d={`M ${imageX - 10} ${axisY - hi + (hi > 0 ? -15 : 15)} L ${imageX} ${axisY - hi} L ${imageX + 10} ${axisY - hi + (hi > 0 ? -15 : 15)}`} 
                    fill="none" 
                    stroke="#2dd4bf" 
                    strokeWidth="4" 
                    strokeLinejoin="round" 
                />
                <text x={imageX} y={axisY - hi + (hi > 0 ? 30 : -20)} fill="#2dd4bf" fontSize="14" fontWeight="bold" textAnchor="middle" className="font-orbitron">IMAGE</text>
                
                <rect x={imageX - 30} y={axisY + (hi > 0 ? -45 : 15)} width="60" height="20" rx="4" fill="rgba(45, 212, 191, 0.2)" stroke="rgba(45, 212, 191, 0.5)" />
                <text x={imageX} y={axisY + (hi > 0 ? -30 : 30)} fill="white" fontSize="12" fontWeight="bold" textAnchor="middle" className="font-mono">q:{q.toFixed(1)}</text>
              </g>
          )}

        </svg>

        {/* UI CONTROLS */}
        <div className="absolute top-6 right-6 flex flex-col gap-2 items-end z-20">
            <button
                onClick={toggleNumericalMode}
                className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border ${
                    isNumerical 
                    ? 'bg-purple-600 text-white border-purple-400 shadow-[0_0_20px_rgba(168,85,247,0.4)]' 
                    : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                }`}
            >
                {isNumerical ? 'Numerical Mode Active' : 'Switch to Numerical Mode'}
            </button>
            
            {!isNumerical && (
                <div className="glass p-1 rounded-xl flex gap-1">
                    <button
                        onClick={() => {
                            setLensType('convex');
                            setP(200);
                        }}
                        className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                            lensType === 'convex' 
                            ? 'bg-cyan-500 text-slate-900 shadow-[0_0_15px_rgba(34,211,238,0.5)]' 
                            : 'text-slate-400 hover:text-white hover:bg-white/10'
                        }`}
                    >
                        Convex
                    </button>
                    <button
                        onClick={() => {
                            setLensType('concave');
                            setP(200);
                        }}
                        className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                            lensType === 'concave' 
                            ? 'bg-cyan-500 text-slate-900 shadow-[0_0_15px_rgba(34,211,238,0.5)]' 
                            : 'text-slate-400 hover:text-white hover:bg-white/10'
                        }`}
                    >
                        Concave
                    </button>
                </div>
            )}
        </div>

        {/* Dynamic Labels / Numerical Inputs Overlay */}
        <div className="absolute top-6 left-6 flex flex-col gap-4 z-20 pointer-events-none">
          <div className="glass p-5 rounded-2xl border-white/10 w-72 backdrop-blur-xl pointer-events-auto">
            <span className="text-[10px] font-bold text-cyan-400 tracking-[0.2em] block mb-4 flex items-center justify-between">
                <span>{isNumerical ? 'NUMERICAL SOLVER' : 'LENS PARAMETERS'}</span>
                {isNumerical && <span className="text-[9px] text-purple-400">1/f = 1/p + 1/q</span>}
            </span>

             {isNumerical ? (
                // NUMERICAL MODE UI
                <div className="space-y-4">
                     <div className="flex gap-2 p-1 bg-black/40 rounded-lg mb-2">
                        {(['f', 'p', 'q'] as const).map((t) => (
                            <button
                                key={t}
                                onClick={() => setSolveTarget(t)}
                                className={`flex-1 py-1 rounded text-[10px] font-bold uppercase ${
                                    solveTarget === t 
                                    ? 'bg-purple-500 text-white shadow-lg' 
                                    : 'text-slate-500 hover:text-slate-300'
                                }`}
                            >
                                Solve {t}
                            </button>
                        ))}
                     </div>

                     <div>
                        <label className={numLabelClass}>Focal Length (f)</label>
                        <input
                            type="number"
                            value={numValues.f}
                            onChange={(e) => onNumInputChange('f', e.target.value)}
                            disabled={solveTarget === 'f'}
                            placeholder="0"
                            className={`${numInputClass} ${solveTarget === 'f' ? 'opacity-50 cursor-not-allowed border-purple-500/50 bg-purple-500/10 text-purple-200' : ''}`}
                        />
                     </div>
                     <div>
                        <label className={numLabelClass}>Object Distance (p)</label>
                         <input
                            type="number"
                            value={numValues.p}
                            onChange={(e) => onNumInputChange('p', e.target.value)}
                            disabled={solveTarget === 'p'}
                            placeholder="0"
                            className={`${numInputClass} ${solveTarget === 'p' ? 'opacity-50 cursor-not-allowed border-purple-500/50 bg-purple-500/10 text-purple-200' : ''}`}
                        />
                     </div>
                     <div>
                        <label className={numLabelClass}>Image Distance (q)</label>
                         <input
                            type="number"
                            value={numValues.q}
                            onChange={(e) => onNumInputChange('q', e.target.value)}
                            disabled={solveTarget === 'q'}
                            placeholder="0"
                            className={`${numInputClass} ${solveTarget === 'q' ? 'opacity-50 cursor-not-allowed border-purple-500/50 bg-purple-500/10 text-purple-200' : ''}`}
                        />
                     </div>
                </div>
            ) : (
                // INTERACTIVE MODE UI
                <div className="space-y-3">
                <div className="flex justify-between items-center">
                    <span className="text-slate-400 text-xs font-medium">Focal Length (f)</span>
                    <input 
                    type="number" 
                    step="0.1"
                    value={fMag} 
                    onChange={(e) => handleFChange(parseFloat(e.target.value))}
                    className={inputClass}
                    />
                </div>
                
                <div className="flex justify-between items-center">
                    <span className="text-slate-400 text-xs font-medium">Object Distance (p)</span>
                    <input 
                        type="number" 
                        step="0.1"
                        value={p} 
                        onChange={(e) => handlePChange(parseFloat(e.target.value))}
                        className={inputClass}
                    />
                </div>
                
                <div className="flex justify-between items-center">
                    <span className="text-slate-400 text-xs font-medium">Image Distance (q)</span>
                    <span className={`text-xs font-mono font-bold ${q < 0 ? 'text-orange-400' : 'text-emerald-400'}`}>
                        {Math.abs(q) > 5000 ? '∞' : q.toFixed(1)}
                    </span>
                </div>
                
                <div className="pt-2 border-t border-white/5 flex justify-between items-center">
                    <span className="text-slate-400 text-xs font-medium">Magnification</span>
                    <span className="text-cyan-400 text-sm font-bold font-mono">{Math.abs(q) > 5000 ? '∞' : M.toFixed(2)}x</span>
                </div>
                </div>
            )}
          </div>

          <div className="glass p-5 rounded-2xl border-white/10 w-72 backdrop-blur-xl border-l-4 border-l-cyan-500 pointer-events-auto">
            <span className="text-[10px] font-bold text-cyan-400 tracking-[0.2em] block mb-1">IMAGE NATURE</span>
            <span className="text-white font-orbitron text-sm font-bold uppercase tracking-tight leading-relaxed">{getNature()}</span>
          </div>
        </div>

      </div>
    </div>
  );
};

export default LensSim;