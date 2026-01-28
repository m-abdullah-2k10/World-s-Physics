import React, { useState, useRef, useEffect } from 'react';

const MirrorSim: React.FC = () => {
  const [mirrorType, setMirrorType] = useState<'concave' | 'convex' | 'plane'>('concave');
  const [p, setP] = useState(60); // Object distance
  const [fMag, setFMag] = useState(50); // Physical Focal length magnitude (stateful now)
  const [isDragging, setIsDragging] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);

  // Numerical Mode State
  const [isNumerical, setIsNumerical] = useState(false);
  const [solveTarget, setSolveTarget] = useState<'f' | 'p' | 'q'>('q');
  const [numValues, setNumValues] = useState({ p: '', q: '', f: '' });

  const ho = 60; // Object height
  const mirrorX = 700; // X position of the mirror vertex
  const axisY = 300; // Y position of the optical axis
  
  // Visual radius for the mirror curvature
  const visualR = 800; 

  // --- Physics Calculations (Interactive Mode) ---
  let f: number;
  let q: number;
  let M: number;

  // Determine current physics values based on mode
  if (isNumerical) {
      // In numerical mode, we trust the inputs but need to drive the visual 
      // simulation for 'f' and 'p' if they are valid numbers.
      const valP = parseFloat(numValues.p) || 0;
      const valQ = parseFloat(numValues.q) || 0;
      const valF = parseFloat(numValues.f) || 0;
      
      // Drive visuals with these values
      // Note: In numerical mode, we support f being negative (convex) directly
      f = valF;
      q = valQ;
      // p is usually positive for real objects in this sim
      
      // Calculate M for numerical mode
      // M = -q/p
      M = (valP !== 0) ? -valQ / valP : 0;

  } else {
      // Interactive Mode Logic
      if (mirrorType === 'plane') {
        f = Infinity;
        q = -p;
        M = 1; 
      } else {
        f = mirrorType === 'concave' ? fMag : -fMag;
        q = (p * f) / (p - f);
        M = -q / p;
      }
  }

  const hi = M * ho; // Image height
  const objectX = mirrorX - (isNumerical ? (parseFloat(numValues.p) || 0) : p);
  const imageX = mirrorX - q;

  // --- Visual Helper Variables ---
  // If in numerical mode, determine mirror type from sign of f
  const effectiveMirrorType = isNumerical 
    ? (parseFloat(numValues.f) < 0 ? 'convex' : 'concave') 
    : mirrorType;
    
  // If numerical, visual F mag is absolute value of input F
  const visualFMag = isNumerical ? Math.abs(parseFloat(numValues.f) || 50) : fMag;


  // --- Numerical Mode Handlers ---
  const toggleNumericalMode = () => {
      const newMode = !isNumerical;
      setIsNumerical(newMode);
      if (newMode) {
          // Reset all to zero/empty string on activation
          setNumValues({ p: '', q: '', f: '' });
      } else {
          // Restore defaults when leaving
          setP(60);
          setFMag(50);
          setMirrorType('concave');
      }
  };

  const handleNumericalCalc = (target: 'f' | 'p' | 'q', currentVals: {p: string, q: string, f: string}) => {
      const vP = parseFloat(currentVals.p);
      const vQ = parseFloat(currentVals.q);
      const vF = parseFloat(currentVals.f);

      let result = NaN;

      if (target === 'q' && !isNaN(vP) && !isNaN(vF)) {
          // 1/q = 1/f - 1/p  => q = (p*f)/(p-f)
          if (vP - vF !== 0) result = (vP * vF) / (vP - vF);
      } else if (target === 'p' && !isNaN(vQ) && !isNaN(vF)) {
          // 1/p = 1/f - 1/q => p = (q*f)/(q-f)
          if (vQ - vF !== 0) result = (vQ * vF) / (vQ - vF);
      } else if (target === 'f' && !isNaN(vP) && !isNaN(vQ)) {
          // 1/f = 1/p + 1/q => f = (p*q)/(p+q)
          if (vP + vQ !== 0) result = (vP * vQ) / (vP + vQ);
      }

      if (!isNaN(result)) {
           // Round for display cleanliness
           const cleanRes = Math.round(result * 100) / 100;
           setNumValues(prev => ({ ...prev, [target]: cleanRes.toString() }));
      }
  };

  const onNumInputChange = (field: 'f' | 'p' | 'q', val: string) => {
      const nextVals = { ...numValues, [field]: val };
      setNumValues(nextVals);

      // Attempt to solve for the target if the other two fields have valid numbers
      // We check if the changed field is NOT the target (it shouldn't be anyway)
      if (field !== solveTarget) {
          // We need the *other* non-target field to be present
          const otherField = ['f', 'p', 'q'].find(k => k !== solveTarget && k !== field) as 'f'|'p'|'q';
          if (nextVals[otherField] !== '' && nextVals[field] !== '') {
               handleNumericalCalc(solveTarget, nextVals);
          }
      }
  };


  // --- Interactive Handlers ---

  const handlePChange = (val: number) => {
    const clamped = Math.max(0.1, Math.min(650, val));
    setP(clamped);
  };

  const handleFChange = (val: number) => {
    const clamped = Math.max(0.1, Math.min(400, val));
    setFMag(clamped);
  };

  const handleQChange = (val: number) => {
    if (mirrorType === 'plane') {
      handlePChange(-val);
      return;
    }
    if (Math.abs(val - f) < 0.1) return;
    const newP = (val * f) / (val - f);
    if (newP > 0 && isFinite(newP)) {
      handlePChange(newP);
    }
  };

  // --- Mouse Dragging Logic (Interactive Only) ---

  const handleMouseMove = (e: React.MouseEvent | MouseEvent) => {
    if (!isDragging || !svgRef.current || isNumerical) return; // Disable drag in numerical mode
    const CTM = svgRef.current.getScreenCTM();
    if (!CTM) return;
    
    // Convert clientX to SVG coordinates using the CTM
    // formula: (screenX - translateX) / scaleX
    const clientX = e.clientX;
    const x = (clientX - CTM.e) / CTM.a;

    let newP = Math.max(0.1, Math.min(650, mirrorX - x));
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
    if (!isNumerical && mirrorType === 'plane') return "Virtual, Upright, Same Size";
    
    // Check for zeros/invalid
    if (isNumerical && (parseFloat(numValues.p) === 0 || parseFloat(numValues.f) === 0)) return "Enter Parameters";

    if (Math.abs(p - Math.abs(f)) < 0.5 && !isNumerical && mirrorType === 'concave') return "Image at Infinity";
    if (isNumerical && Math.abs(q) > 5000) return "Image at Infinity";

    let nature = [];
    if (q > 0) nature.push('Real');
    else nature.push('Virtual');

    if (hi < 0) nature.push('Inverted');
    else nature.push('Upright');

    const absM = Math.abs(M);
    if (Math.abs(absM - 1) < 0.05) nature.push('Same Size');
    else if (absM > 1.0) nature.push('Magnified');
    else nature.push('Diminished');

    return nature.join(', ');
  };


  const inputClass = "w-20 bg-white/5 border-b border-white/20 text-right font-mono text-xs focus:outline-none focus:border-cyan-400 focus:bg-white/10 px-1 py-0.5 rounded-t text-white";
  const numInputClass = "w-full bg-slate-900 border border-white/20 text-right font-mono text-sm focus:outline-none focus:border-cyan-400 focus:shadow-[0_0_10px_rgba(34,211,238,0.2)] px-3 py-2 rounded text-cyan-400";
  const numLabelClass = "text-slate-400 text-xs font-bold uppercase tracking-wider mb-1 block";

  // Check if we should render rays (must have valid non-zero physics)
  const renderRays = isNumerical 
    ? (parseFloat(numValues.p) > 0 && Math.abs(parseFloat(numValues.f)) > 0)
    : true;

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
          
          {/* Focal Points & Center of Curvature */}
          {effectiveMirrorType !== 'plane' && renderRays && (
            <g>
              {/* Focus - For numerical, f can be negative (convex) or positive (concave) */}
              {/* If f is positive (concave), focus is at mirrorX - f. If f is negative (convex), focus is at mirrorX + abs(f) (virtual) */}
              <circle cx={mirrorX - f} cy={axisY} r="4" fill="#22d3ee" className="neon-glow" />
              <text x={mirrorX - f} y={axisY + 25} fill="#22d3ee" fontSize="12" textAnchor="middle" className="font-bold">F</text>
              
              {/* Center of Curvature (2f) */}
              <circle cx={mirrorX - 2 * f} cy={axisY} r="4" fill="#22d3ee" className="neon-glow" />
              <text x={mirrorX - 2 * f} y={axisY + 25} fill="#22d3ee" fontSize="12" textAnchor="middle" className="font-bold">C</text>
            </g>
          )}

          {/* Mirror Rendering */}
          {effectiveMirrorType === 'concave' && (
             <path
              d={`M ${mirrorX} 100 A ${visualR} ${visualR} 0 0 1 ${mirrorX} 500`}
              fill="none"
              stroke="#94a3b8"
              strokeWidth="6"
              strokeLinecap="round"
            />
          )}
          {effectiveMirrorType === 'convex' && (
             <path
              d={`M ${mirrorX} 100 A ${visualR} ${visualR} 0 0 0 ${mirrorX} 500`}
              fill="none"
              stroke="#94a3b8"
              strokeWidth="6"
              strokeLinecap="round"
            />
          )}
          {effectiveMirrorType === 'plane' && (
             <line x1={mirrorX} y1={100} x2={mirrorX} y2={500} stroke="#94a3b8" strokeWidth="6" strokeLinecap="round" />
          )}
          
          {/* Mirror Backside Hatching */}
           <path
              d={`M ${mirrorX + 5} 100 ${effectiveMirrorType === 'concave' ? `A ${visualR} ${visualR} 0 0 1` : effectiveMirrorType === 'convex' ? `A ${visualR} ${visualR} 0 0 0` : 'L'} ${mirrorX + 5} 500`}
              fill="none"
              stroke="rgba(34, 211, 238, 0.4)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeDasharray="4,4"
            />

          {/* --- Ray Tracing Logic --- */}
          {renderRays && (
            <>
            {/* PLANE MIRROR RAYS */}
            {effectiveMirrorType === 'plane' && (
                <>
                <line x1={objectX} y1={axisY - ho} x2={mirrorX} y2={axisY - ho} stroke="rgba(234, 179, 8, 0.5)" strokeWidth="2" />
                <line x1={mirrorX} y1={axisY - ho} x2={objectX} y2={axisY - ho} stroke="rgba(234, 179, 8, 0.5)" strokeWidth="2" /> 
                <line x1={mirrorX} y1={axisY - ho} x2={imageX} y2={axisY - ho} stroke="rgba(234, 179, 8, 0.3)" strokeWidth="1" strokeDasharray="5,5" />

                <line x1={objectX} y1={axisY - ho} x2={mirrorX} y2={axisY} stroke="rgba(59, 130, 246, 0.5)" strokeWidth="2" />
                <line x1={mirrorX} y1={axisY} x2={objectX} y2={axisY + ho} stroke="rgba(59, 130, 246, 0.5)" strokeWidth="2" />
                <line x1={mirrorX} y1={axisY} x2={imageX} y2={axisY - ho} stroke="rgba(59, 130, 246, 0.3)" strokeWidth="1" strokeDasharray="5,5" />
                </>
            )}

            {/* SPHERICAL MIRROR RAYS */}
            {effectiveMirrorType !== 'plane' && (
                <>
                {/* Ray 1: Parallel to Axis */}
                <line x1={objectX} y1={axisY - ho} x2={mirrorX} y2={axisY - ho} stroke="rgba(234, 179, 8, 0.5)" strokeWidth="2" />
                
                {effectiveMirrorType === 'concave' ? (
                    <>
                        {/* Passes through F */}
                        {/* Slope from (mirrorX, axisY-ho) to (mirrorX-f, axisY) */}
                        {/* y - y1 = m(x - x1). m = ho/f */}
                        {/* We draw a long line */}
                        <line x1={mirrorX} y1={axisY - ho} x2={mirrorX - 1000} y2={axisY - ho + (1000 * (ho/f))} stroke="rgba(234, 179, 8, 0.5)" strokeWidth="2" />
                        {q < 0 && <line x1={mirrorX} y1={axisY - ho} x2={imageX} y2={axisY - hi} stroke="rgba(234, 179, 8, 0.3)" strokeWidth="1" strokeDasharray="5,5" />}
                    </>
                ) : (
                    // Convex
                    <>
                        <line x1={mirrorX} y1={axisY - ho} x2={mirrorX - 300} y2={axisY - ho - (300 * (ho/Math.abs(f)))} stroke="rgba(234, 179, 8, 0.5)" strokeWidth="2" />
                        <line x1={mirrorX} y1={axisY - ho} x2={mirrorX + Math.abs(f)} y2={axisY} stroke="rgba(234, 179, 8, 0.3)" strokeWidth="1" strokeDasharray="5,5" />
                    </>
                )}

                {/* Ray 2: Through Vertex */}
                <line x1={objectX} y1={axisY - ho} x2={mirrorX} y2={axisY} stroke="rgba(59, 130, 246, 0.5)" strokeWidth="2" />
                <line x1={mirrorX} y1={axisY} x2={mirrorX - 300} y2={axisY + (300 * (ho/(isNumerical ? (parseFloat(numValues.p)||1) : p)))} stroke="rgba(59, 130, 246, 0.5)" strokeWidth="2" />
                <line x1={mirrorX} y1={axisY} x2={imageX} y2={axisY - hi} stroke="rgba(59, 130, 246, 0.3)" strokeWidth="1" strokeDasharray="5,5" />
                </>
            )}
            </>
          )}

          {/* Object Arrow */}
          {renderRays && (
            <g className={!isNumerical ? "cursor-ew-resize" : ''}>
                <line x1={objectX} y1={axisY} x2={objectX} y2={axisY - ho} stroke="#a855f7" strokeWidth="8" strokeLinecap="round" />
                <path d={`M ${objectX - 12} ${axisY - ho + 18} L ${objectX} ${axisY - ho} L ${objectX + 12} ${axisY - ho + 18}`} fill="none" stroke="#a855f7" strokeWidth="5" strokeLinejoin="round" />
                <text x={objectX} y={axisY - ho - 25} fill="#a855f7" fontSize="16" fontWeight="bold" textAnchor="middle" className="font-orbitron">OBJECT</text>
                <rect x={objectX - 35} y={axisY + 35} width="70" height="20" rx="4" fill="rgba(168, 85, 247, 0.2)" stroke="rgba(168, 85, 247, 0.5)" />
                <text x={objectX} y={axisY + 50} fill="white" fontSize="12" fontWeight="bold" textAnchor="middle" className="font-mono">p: {(isNumerical ? parseFloat(numValues.p) || 0 : p).toFixed(1)}</text>
            </g>
          )}

          {/* Image Arrow */}
          {renderRays && Math.abs(q) < 4000 && (
            <g opacity={q < 0 || effectiveMirrorType === 'convex' || effectiveMirrorType === 'plane' ? 0.6 : 1}>
              <line x1={imageX} y1={axisY} x2={imageX} y2={axisY - hi} stroke="#2dd4bf" strokeWidth="8" strokeLinecap="round" />
              <path 
                d={`M ${imageX - 12} ${axisY - hi + (hi > 0 ? -18 : 18)} L ${imageX} ${axisY - hi} L ${imageX + 12} ${axisY - hi + (hi > 0 ? -18 : 18)}`} 
                fill="none" 
                stroke="#2dd4bf" 
                strokeWidth="5" 
                strokeLinejoin="round" 
              />
              <text x={imageX} y={axisY - hi + (hi > 0 ? 40 : -30)} fill="#2dd4bf" fontSize="16" fontWeight="bold" textAnchor="middle" className="font-orbitron">IMAGE</text>
              <rect x={imageX - 35} y={axisY + (hi > 0 ? -60 : 35)} width="70" height="20" rx="4" fill="rgba(45, 212, 191, 0.2)" stroke="rgba(45, 212, 191, 0.5)" />
              <text x={imageX} y={axisY + (hi > 0 ? -45 : 50)} fill="white" fontSize="12" fontWeight="bold" textAnchor="middle" className="font-mono">q: {q.toFixed(1)}</text>
            </g>
          )}
        </svg>

        {/* --- UI OVERLAYS --- */}
        
        {/* Toggle Mode Button */}
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
                    {(['concave', 'plane', 'convex'] as const).map(type => (
                        <button
                            key={type}
                            onClick={() => {
                                setMirrorType(type);
                                setP(60);
                            }}
                            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${
                                mirrorType === type 
                                ? 'bg-cyan-500 text-slate-900 shadow-[0_0_15px_rgba(34,211,238,0.5)]' 
                                : 'text-slate-400 hover:text-white hover:bg-white/10'
                            }`}
                        >
                            {type}
                        </button>
                    ))}
                </div>
            )}
        </div>

        {/* Dynamic Labels / Numerical Inputs Overlay */}
        <div className="absolute top-6 left-6 flex flex-col gap-4 z-20 pointer-events-none">
          <div className="glass p-5 rounded-2xl border-white/10 w-72 backdrop-blur-xl pointer-events-auto">
            <span className="text-[10px] font-bold text-cyan-400 tracking-[0.2em] block mb-4 flex items-center justify-between">
                <span>{isNumerical ? 'NUMERICAL SOLVER' : 'ENGINE PARAMETERS'}</span>
                {isNumerical && <span className="text-[9px] text-purple-400">1/f = 1/p + 1/q</span>}
            </span>

            {isNumerical ? (
                // NUMERICAL MODE UI
                <div className="space-y-4">
                     {/* Solve Target Selector */}
                     <div className="flex gap-2 p-1 bg-black/40 rounded-lg mb-2">
                        {(['f', 'p', 'q'] as const).map((t) => (
                            <button
                                key={t}
                                onClick={() => {
                                    setSolveTarget(t);
                                    // When switching target, keep values but maybe highlight the new target
                                    // We don't clear values here to allow user to pivot
                                }}
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

                     {/* Inputs */}
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
                        <span className="text-slate-400 text-xs font-medium">Mirror Type</span>
                        <span className="text-white text-xs font-bold uppercase">{mirrorType}</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                        <span className="text-slate-400 text-xs font-medium">Focal Length (f)</span>
                        {mirrorType === 'plane' ? (
                        <span className="text-white text-xs font-mono px-1">∞</span>
                        ) : (
                        <input 
                            type="number"
                            step="0.1"
                            value={fMag} 
                            onChange={(e) => handleFChange(parseFloat(e.target.value))}
                            className={inputClass}
                        />
                        )}
                    </div>
                    
                    <div className="flex justify-between items-center">
                        <span className="text-slate-400 text-xs font-medium">Object distance (p)</span>
                        <input 
                            type="number"
                            step="0.1"
                            value={p} 
                            onChange={(e) => handlePChange(parseFloat(e.target.value))}
                            className={inputClass}
                        />
                    </div>
                    
                    <div className="flex justify-between items-center">
                        <span className="text-slate-400 text-xs font-medium">Image distance (q)</span>
                        <input 
                            type="number" 
                            step="0.1"
                            value={isFinite(q) ? q : ''} 
                            placeholder="∞"
                            onChange={(e) => handleQChange(parseFloat(e.target.value))}
                            className={`${inputClass} ${q < 0 ? 'text-orange-400' : 'text-emerald-400'}`}
                        />
                    </div>
                    
                    <div className="pt-2 border-t border-white/5 flex justify-between items-center">
                        <span className="text-slate-400 text-xs font-medium">Magnification (M)</span>
                        <span className="text-cyan-400 text-sm font-bold font-mono">{isFinite(M) ? M.toFixed(2) : '∞'}x</span>
                    </div>
                </div>
            )}
          </div>

          <div className="glass p-5 rounded-2xl border-white/10 w-72 backdrop-blur-xl border-l-4 border-l-cyan-500 pointer-events-auto">
            <span className="text-[10px] font-bold text-cyan-400 tracking-[0.2em] block mb-1">OPTICAL NATURE</span>
            <span className="text-white font-orbitron text-sm font-bold uppercase tracking-tight leading-relaxed">{getNature()}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MirrorSim;