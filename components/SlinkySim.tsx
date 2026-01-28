
import React, { useRef, useEffect, useState } from 'react';

const SlinkySim: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Physics Parameters
  const [mode, setMode] = useState<'longitudinal' | 'transverse'>('transverse');
  const [tension, setTension] = useState(0.2); // Spring constant k
  const [damping, setDamping] = useState(0.04);
  const [autoOscillate, setAutoOscillate] = useState(false);
  const [frequency, setFrequency] = useState(0.1);
  
  // Simulation State Refs (Mutable for performance loop)
  const numNodes = 60;
  const nodes = useRef(Array.from({ length: numNodes }, (_, i) => ({
    x: i * 12, // Rest spacing
    y: 0,
    z: 0,
    vx: 0,
    vy: 0,
    vz: 0,
    restX: i * 12,
  })));
  
  const mouseState = useRef({ isDragging: false, x: 0, y: 0, startX: 0, startY: 0 });
  const time = useRef(0);
  const animationFrameId = useRef<number>(0);

  // 3D Projection Config
  const perspective = 800;
  const viewOffset = { x: 50, y: 0 };
  const coilRadius = 40;

  // Initialize Physics
  const resetPhysics = () => {
    nodes.current = Array.from({ length: numNodes }, (_, i) => ({
      x: i * 12,
      y: 0,
      z: 0,
      vx: 0,
      vy: 0,
      vz: 0,
      restX: i * 12,
    }));
  };

  const triggerPulse = () => {
    if (mode === 'transverse') {
      nodes.current[0].vy = 25; // Sharp flick up
    } else {
      // Compress the first few nodes significantly
      nodes.current[0].x += 40;
      nodes.current[1].x += 20;
    }
  };

  useEffect(() => {
    // Reset when mode changes
    resetPhysics();
  }, [mode]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const updatePhysics = () => {
      time.current++;
      const nds = nodes.current;
      
      // Auto Oscillator Driver
      if (autoOscillate) {
        if (mode === 'transverse') {
          nds[0].y = Math.sin(time.current * frequency) * 80;
          nds[0].vy = 0; // Driven position, so velocity is implicit
        } else {
          nds[0].x = nds[0].restX + Math.sin(time.current * frequency) * 60;
          nds[0].vx = 0;
        }
      } else if (mouseState.current.isDragging) {
        // Mouse Driver
        // We handle mouse position in the event handlers, here we just respect the forced position
        // Dragging logic is applied directly to nodes[0] in mouse handlers
      } else {
        // Return to rest if not driven
        if (mode === 'transverse') {
          // Spring force towards 0
          const force = -0.1 * nds[0].y - 0.1 * nds[0].vy;
          nds[0].vy += force;
          nds[0].y += nds[0].vy;
        } else {
          const dist = nds[0].x - nds[0].restX;
          const force = -0.1 * dist - 0.1 * nds[0].vx;
          nds[0].vx += force;
          nds[0].x += nds[0].vx;
        }
      }

      // Physics Loop for segments 1 to N-1 (Last node fixed)
      // Node N-1 is the wall
      nds[numNodes - 1].x = nds[numNodes - 1].restX;
      nds[numNodes - 1].y = 0;
      nds[numNodes - 1].vx = 0;
      nds[numNodes - 1].vy = 0;

      for (let i = 1; i < numNodes - 1; i++) {
        const prev = nds[i - 1];
        const curr = nds[i];
        const next = nds[i + 1];

        // 1. Spring Forces from neighbors
        // Longitudinal force (x-axis)
        // Rest distance = 12
        const k = tension; // Spring constant
        
        const distPrev = Math.sqrt((curr.x - prev.x)**2 + (curr.y - prev.y)**2);
        const distNext = Math.sqrt((next.x - curr.x)**2 + (next.y - curr.y)**2);
        
        // Normalize direction vectors
        const dirPrevX = (prev.x - curr.x) / distPrev;
        const dirPrevY = (prev.y - curr.y) / distPrev;
        const dirNextX = (next.x - curr.x) / distNext;
        const dirNextY = (next.y - curr.y) / distNext;

        // Hooke's Law: F = k * (current_dist - rest_dist)
        const stretchPrev = distPrev - 12;
        const stretchNext = distNext - 12;

        let fx = (k * stretchPrev * dirPrevX) + (k * stretchNext * dirNextX);
        let fy = (k * stretchPrev * dirPrevY) + (k * stretchNext * dirNextY);

        // Add extra restoring force for transverse to keep it linear-ish if needed
        // But true string physics is enough. 
        // For longitudinal, we want to prevent nodes passing each other easily
        
        // Damping
        fx -= damping * curr.vx;
        fy -= damping * curr.vy;

        curr.vx += fx;
        curr.vy += fy;
      }

      // Update Positions
      for (let i = 1; i < numNodes - 1; i++) {
        nds[i].x += nds[i].vx;
        nds[i].y += nds[i].vy;
      }
    };

    const draw = () => {
      if (!canvas || !containerRef.current) return;
      // Responsive Canvas
      if (canvas.width !== containerRef.current.clientWidth || canvas.height !== containerRef.current.clientHeight) {
        canvas.width = containerRef.current.clientWidth;
        canvas.height = containerRef.current.clientHeight;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const cx = canvas.width / 2 - (numNodes * 12) / 2 + viewOffset.x; // Center horizontally roughly
      const cy = canvas.height / 2 + viewOffset.y;

      // Draw Wall
      const lastNode = nodes.current[numNodes - 1];
      const wallX = cx + lastNode.x;
      const wallY = cy + lastNode.y;
      
      ctx.beginPath();
      ctx.moveTo(wallX, wallY - 100);
      ctx.lineTo(wallX, wallY + 100);
      ctx.lineWidth = 8;
      ctx.strokeStyle = '#475569'; // Slate 600
      ctx.stroke();

      // Draw Slinky (Spiral)
      // We interpolate between physics nodes to draw smooth coils
      const coilsPerNode = 2; 
      const totalCoils = numNodes * coilsPerNode;
      
      ctx.beginPath();
      let firstPoint = true;

      for (let i = 0; i < totalCoils; i++) {
        // Map visual coil index to physics node index (float)
        const nodeIndex = i / coilsPerNode;
        const idx = Math.floor(nodeIndex);
        const t = nodeIndex - idx; // Fraction between node idx and idx+1

        if (idx >= numNodes - 1) break;

        const n1 = nodes.current[idx];
        const n2 = nodes.current[idx + 1];

        // Linear interpolation of spine position
        const spineX = n1.x + (n2.x - n1.x) * t;
        const spineY = n1.y + (n2.y - n1.y) * t;

        // Spiral offset
        // Angle goes from 0 to 2PI * totalCoils
        const angle = (i / totalCoils) * (numNodes * Math.PI * 2);
        
        // 3D Offset: y = cos, z = sin
        // We project 3D (x, y, z) to 2D screen
        const coilY = Math.cos(angle) * coilRadius;
        const coilZ = Math.sin(angle) * coilRadius;

        // Apply 3D rotation slightly to see volume?
        // Let's just do direct projection assuming camera is at z = -perspective looking at +z
        // Actual world coordinate of point on wire:
        const wx = spineX;
        const wy = spineY + coilY;
        const wz = coilZ;

        // Simple perspective projection
        // Scale factor depends on Z depth
        // We assume camera is at z = -perspective.
        const scale = perspective / (perspective + wz);
        
        const screenX = cx + wx * scale;
        const screenY = cy + wy * scale;

        if (firstPoint) {
          ctx.moveTo(screenX, screenY);
          firstPoint = false;
        } else {
          ctx.lineTo(screenX, screenY);
        }
      }
      
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.lineWidth = 4;
      ctx.strokeStyle = mode === 'longitudinal' ? '#22d3ee' : '#a855f7'; // Cyan or Purple
      ctx.shadowBlur = 15;
      ctx.shadowColor = mode === 'longitudinal' ? 'rgba(34, 211, 238, 0.6)' : 'rgba(168, 85, 247, 0.6)';
      ctx.stroke();
      ctx.shadowBlur = 0;

      // --- Draw Wave Labels (Compressions / Rarefactions) ---
      if (mode === 'longitudinal') {
        const compressions: {x: number, y: number}[] = [];
        const rarefactions: {x: number, y: number}[] = [];
        
        let currentComp = { start: -1, count: 0, sumX: 0 };
        let currentRare = { start: -1, count: 0, sumX: 0 };
        
        const THRESHOLD_C = 10; // Compressed distance threshold (Rest is 12)
        const THRESHOLD_R = 14; // Rarefied distance threshold (Rest is 12)
        
        for (let i = 0; i < numNodes - 1; i++) {
            const n1 = nodes.current[i];
            const n2 = nodes.current[i+1];
            // Distance along spine
            const dist = Math.sqrt((n2.x - n1.x)**2 + (n2.y - n1.y)**2);
            const midX = (n1.x + n2.x) / 2;

            // Detect Compression
            if (dist < THRESHOLD_C) {
                if (currentComp.start === -1) currentComp.start = i;
                currentComp.count++;
                currentComp.sumX += midX;
            } else {
                if (currentComp.start !== -1) {
                    if (currentComp.count >= 2) { // Min width filter
                        compressions.push({ x: currentComp.sumX / currentComp.count, y: 0 });
                    }
                    currentComp.start = -1;
                    currentComp.count = 0;
                    currentComp.sumX = 0;
                }
            }

            // Detect Rarefaction
            if (dist > THRESHOLD_R) {
                if (currentRare.start === -1) currentRare.start = i;
                currentRare.count++;
                currentRare.sumX += midX;
            } else {
                if (currentRare.start !== -1) {
                    if (currentRare.count >= 2) { // Min width filter
                        rarefactions.push({ x: currentRare.sumX / currentRare.count, y: 0 });
                    }
                    currentRare.start = -1;
                    currentRare.count = 0;
                    currentRare.sumX = 0;
                }
            }
        }
        // Flush active groups at end of string
        if (currentComp.start !== -1 && currentComp.count >= 2) {
             compressions.push({ x: currentComp.sumX / currentComp.count, y: 0 });
        }
        if (currentRare.start !== -1 && currentRare.count >= 2) {
             rarefactions.push({ x: currentRare.sumX / currentRare.count, y: 0 });
        }

        ctx.font = 'bold 12px "Orbitron", sans-serif'; // Slightly bigger for single letter
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Helper to project and draw
        const drawLabel = (list: typeof compressions, text: string, color: string, offsetY: number) => {
            list.forEach(pos => {
                const wx = pos.x;
                const wy = pos.y + coilRadius + offsetY;
                const wz = 0;
                const scale = perspective / (perspective + wz);
                const sx = cx + wx * scale;
                const sy = cy + wy * scale;

                // Draw background pill
                const textMetrics = ctx.measureText(text);
                const w = textMetrics.width + 12;
                const h = 20;
                ctx.fillStyle = 'rgba(2, 6, 23, 0.9)'; // Darker background
                ctx.beginPath();
                ctx.roundRect(sx - w/2, sy - h/2, w, h, 6);
                ctx.fill();
                ctx.strokeStyle = color;
                ctx.lineWidth = 1;
                ctx.stroke();

                ctx.fillStyle = color;
                ctx.fillText(text, sx, sy);
            });
        };

        drawLabel(compressions, 'C', '#22d3ee', 30);
        drawLabel(rarefactions, 'R', '#f472b6', 30);
      }

      // Draw Hand / Driver Control Point
      const firstNode = nodes.current[0];
      const hx = cx + firstNode.x;
      const hy = cy + firstNode.y;
      
      // Driver Box
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(hx - 10, hy - 25, 20, 50);
      
      // Visual text
      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 10px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(autoOscillate ? 'AUTO' : 'DRAG', hx, hy);

    };

    const loop = () => {
      updatePhysics();
      updatePhysics(); // Double step for stability
      draw();
      animationFrameId.current = requestAnimationFrame(loop);
    };
    loop();

    return () => cancelAnimationFrame(animationFrameId.current);
  }, [mode, tension, damping, autoOscillate, frequency]);


  // Interaction Handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Check if near first node
    const nds = nodes.current;
    const cx = canvas.width / 2 - (numNodes * 12) / 2 + viewOffset.x;
    const cy = canvas.height / 2 + viewOffset.y;
    const hx = cx + nds[0].x;
    const hy = cy + nds[0].y;
    
    if (Math.abs(x - hx) < 40 && Math.abs(y - hy) < 60) {
      mouseState.current.isDragging = true;
      mouseState.current.startX = x;
      mouseState.current.startY = y;
      setAutoOscillate(false); // Stop auto when interacting
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!mouseState.current.isDragging) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const nds = nodes.current;
    const cx = canvas.width / 2 - (numNodes * 12) / 2 + viewOffset.x;
    const cy = canvas.height / 2 + viewOffset.y;

    if (mode === 'transverse') {
      // Move Y, keep X roughly at rest (or allow slight X movement)
      // For simple transverse demo, lock X
      nds[0].y = (y - cy);
      // Clamp
      if (nds[0].y > 200) nds[0].y = 200;
      if (nds[0].y < -200) nds[0].y = -200;
      nds[0].vy = 0;
    } else {
      // Move X
      nds[0].x = (x - cx);
      // Clamp to prevent breaking physics
      if (nds[0].x < -50) nds[0].x = -50;
      if (nds[0].x > 100) nds[0].x = 100;
      nds[0].vx = 0;
    }
  };

  const handleMouseUp = () => {
    mouseState.current.isDragging = false;
  };


  return (
    <div className="w-full h-full flex flex-col p-4 bg-slate-950 font-sans select-none relative" ref={containerRef}>
      {/* Simulation Layer */}
      <div className="flex-1 relative overflow-hidden glass rounded-2xl border-white/5">
        <canvas
          ref={canvasRef}
          className="w-full h-full cursor-col-resize active:cursor-grabbing"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        />

        {/* Legend Overlay */}
        {mode === 'longitudinal' && (
            <div className="absolute top-4 right-4 flex gap-4 pointer-events-none">
                <div className="px-3 py-1 glass rounded-lg border-cyan-500/30 flex items-center gap-2">
                    <span className="text-[#22d3ee] font-bold text-xs">C</span>
                    <span className="text-slate-400 text-[10px] uppercase font-bold">= Compression</span>
                </div>
                <div className="px-3 py-1 glass rounded-lg border-pink-500/30 flex items-center gap-2">
                    <span className="text-[#f472b6] font-bold text-xs">R</span>
                    <span className="text-slate-400 text-[10px] uppercase font-bold">= Rarefaction</span>
                </div>
            </div>
        )}

        {/* Instructions Overlay */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-center pointer-events-none opacity-50">
           <p className="text-xs text-white uppercase tracking-widest font-bold">
              {autoOscillate ? 'Auto-Driver Active' : mode === 'transverse' ? 'Drag Up/Down to create waves' : 'Drag Left/Right to compress'}
           </p>
        </div>
      </div>

      {/* Control Panel */}
      <div className="absolute top-6 left-6 flex flex-col gap-4 z-20">
         <div className="glass p-5 rounded-2xl border-white/10 w-72 backdrop-blur-xl pointer-events-auto">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] font-bold text-cyan-400 tracking-[0.2em]">WAVE GENERATOR</span>
              <div className={`w-2 h-2 rounded-full ${autoOscillate ? 'bg-green-500 animate-pulse' : 'bg-slate-500'}`}></div>
            </div>

            <div className="space-y-6">
               {/* Mode Switcher */}
               <div className="p-1 bg-black/40 rounded-lg flex">
                  <button 
                    onClick={() => setMode('longitudinal')}
                    className={`flex-1 py-2 rounded-md text-[10px] font-bold transition-all ${mode === 'longitudinal' ? 'bg-cyan-500 text-black shadow-lg' : 'text-slate-400 hover:text-white'}`}
                  >
                    LONGITUDINAL
                  </button>
                  <button 
                    onClick={() => setMode('transverse')}
                    className={`flex-1 py-2 rounded-md text-[10px] font-bold transition-all ${mode === 'transverse' ? 'bg-purple-500 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                  >
                    TRANSVERSE
                  </button>
               </div>

               {/* Quick Actions */}
               <div className="grid grid-cols-2 gap-2">
                  <button 
                    onClick={triggerPulse}
                    className="bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-bold py-2 rounded-lg transition-all active:scale-95"
                  >
                    SINGLE PULSE
                  </button>
                  <button 
                    onClick={() => setAutoOscillate(!autoOscillate)}
                    className={`text-xs font-bold py-2 rounded-lg transition-all border ${autoOscillate ? 'bg-green-500/20 text-green-400 border-green-500/50' : 'bg-white/5 text-slate-400 border-white/10 hover:bg-white/10'}`}
                  >
                    {autoOscillate ? 'STOP AUTO' : 'OSCILLATE'}
                  </button>
               </div>

               {/* Sliders */}
               <div className="space-y-3 pt-2 border-t border-white/10">
                  <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase">
                    <span>Tension</span>
                    <span>{(tension * 100).toFixed(0)}%</span>
                  </div>
                  <input 
                    type="range" min="0.05" max="0.5" step="0.01" 
                    value={tension}
                    onChange={(e) => setTension(parseFloat(e.target.value))}
                    className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                  />
                  
                  <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase">
                    <span>Damping</span>
                    <span>{(damping * 1000).toFixed(0)}</span>
                  </div>
                  <input 
                    type="range" min="0.01" max="0.1" step="0.001" 
                    value={damping}
                    onChange={(e) => setDamping(parseFloat(e.target.value))}
                    className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
                  />

                  {autoOscillate && (
                    <>
                      <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase">
                        <span>Frequency</span>
                        <span>{frequency.toFixed(2)} Hz</span>
                      </div>
                      <input 
                        type="range" min="0.05" max="0.3" step="0.01" 
                        value={frequency}
                        onChange={(e) => setFrequency(parseFloat(e.target.value))}
                        className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-green-500"
                      />
                    </>
                  )}
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};

export default SlinkySim;
