
import React, { useState, useRef, useMemo, Suspense, useEffect } from 'react';
import { Canvas, useFrame, useLoader, useThree } from '@react-three/fiber';
import { OrbitControls, Stars, Line, Sphere, Html, Loader } from '@react-three/drei';
import * as THREE from 'three';

// Constants
const AXIAL_TILT = 23.5 * (Math.PI / 180); // 23.5 degrees in radians
const EARTH_RADIUS = 7; // Increased size (was 5)
const ORBIT_RADIUS = 40; // Reduced size (was 60)
const DAYS_IN_YEAR = 365;

interface EarthProps {
  dayOfYear: number;
  showRays: boolean;
  showLabels: boolean;
  isPlaying: boolean;
  speed: number;
}

const Earth: React.FC<EarthProps> = ({ dayOfYear, showRays, showLabels, isPlaying, speed }) => {
  const earthRef = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.Mesh>(null);
  
  // Textures
  const [colorMap, specularMap] = useLoader(THREE.TextureLoader, [
    'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_atmos_2048.jpg',
    'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_specular_2048.jpg',
  ]);

  // Calculate Orbit Position
  const angleOffset = 10 * (2 * Math.PI / DAYS_IN_YEAR);
  const orbitAngle = ((dayOfYear / DAYS_IN_YEAR) * 2 * Math.PI) + angleOffset; 

  const x = Math.cos(orbitAngle) * ORBIT_RADIUS;
  const z = Math.sin(orbitAngle) * ORBIT_RADIUS;

  useFrame((state, delta) => {
    if (meshRef.current && isPlaying) {
        // Daily rotation (spin) - only when playing
        // visual spin speed scaled by simulation speed for consistency
        meshRef.current.rotation.y += delta * 0.5 * (speed > 0.5 ? speed : 0.5); 
    }
  });
  
  return (
    <group position={[x, 0, z]}>
      {/* Visual Ray from Sun to Earth Center */}
      {showRays && (
          <Line 
            points={[new THREE.Vector3(-x, 0, -z), new THREE.Vector3(0, 0, 0)]} 
            color="#fbbf24"
            lineWidth={2}
            dashed
            dashSize={2}
            gapSize={2}
            opacity={0.5}
            transparent
          />
      )}

      {/* Tilted Container - This has the FIXED axial tilt */}
      <group rotation={[0, 0, AXIAL_TILT]}>
        
        {/* Axis Line */}
        <Line 
            points={[new THREE.Vector3(0, -EARTH_RADIUS * 1.5, 0), new THREE.Vector3(0, EARTH_RADIUS * 1.5, 0)]}
            color="#94a3b8"
            opacity={0.5}
            transparent
            lineWidth={1}
        />

        {/* The Earth Mesh - Spins inside the tilted group */}
        <mesh ref={meshRef}>
            <sphereGeometry args={[EARTH_RADIUS, 64, 64]} />
            <meshStandardMaterial 
                map={colorMap}
                roughnessMap={specularMap}
                roughness={0.5}
                metalness={0.1}
            />

            {/* Atmosphere Glow */}
            <mesh scale={[1.02, 1.02, 1.02]}>
                <sphereGeometry args={[EARTH_RADIUS, 64, 64]} />
                <meshStandardMaterial 
                    color="#60a5fa"
                    transparent
                    opacity={0.15}
                    side={THREE.BackSide}
                    blending={THREE.AdditiveBlending}
                />
            </mesh>

            {/* Latitude Labels / Rings */}
            {showLabels && (
                <>
                    {/* Equator */}
                    <mesh rotation={[Math.PI / 2, 0, 0]}>
                        <ringGeometry args={[EARTH_RADIUS + 0.1, EARTH_RADIUS + 0.2, 64]} />
                        <meshBasicMaterial color="#ef4444" opacity={0.5} transparent side={THREE.DoubleSide} />
                    </mesh>
                    {/* Cancer (+23.5) */}
                    <mesh position={[0, Math.sin(AXIAL_TILT) * EARTH_RADIUS, 0]} rotation={[Math.PI / 2, 0, 0]}>
                         <ringGeometry args={[EARTH_RADIUS * Math.cos(AXIAL_TILT) + 0.1, EARTH_RADIUS * Math.cos(AXIAL_TILT) + 0.2, 64]} />
                         <meshBasicMaterial color="#fbbf24" opacity={0.5} transparent side={THREE.DoubleSide} />
                    </mesh>
                     {/* Capricorn (-23.5) */}
                     <mesh position={[0, -Math.sin(AXIAL_TILT) * EARTH_RADIUS, 0]} rotation={[Math.PI / 2, 0, 0]}>
                         <ringGeometry args={[EARTH_RADIUS * Math.cos(AXIAL_TILT) + 0.1, EARTH_RADIUS * Math.cos(AXIAL_TILT) + 0.2, 64]} />
                         <meshBasicMaterial color="#fbbf24" opacity={0.5} transparent side={THREE.DoubleSide} />
                    </mesh>
                </>
            )}
        </mesh>
      </group>
      
      {/* Label Floating above Earth */}
      {showLabels && (
        <Html position={[0, EARTH_RADIUS + 3, 0]} center>
            <div className="bg-black/70 backdrop-blur text-white text-[10px] px-2 py-1 rounded border border-white/20 whitespace-nowrap">
                EARTH
            </div>
        </Html>
      )}
    </group>
  );
};

// Camera Controller
const CameraController: React.FC<{ mode: 'orbital' | 'earth', dayOfYear: number }> = ({ mode, dayOfYear }) => {
    const { camera, controls } = useThree();
    
    useFrame(() => {
        const angleOffset = 10 * (2 * Math.PI / DAYS_IN_YEAR);
        const orbitAngle = ((dayOfYear / DAYS_IN_YEAR) * 2 * Math.PI) + angleOffset; 
        const x = Math.cos(orbitAngle) * ORBIT_RADIUS;
        const z = Math.sin(orbitAngle) * ORBIT_RADIUS;
        
        const targetPos = mode === 'earth' 
            ? new THREE.Vector3(x, 0, z) 
            : new THREE.Vector3(0, 0, 0);
        
        // Use controls target for smooth panning
        // @ts-ignore
        if (controls) {
            // @ts-ignore
            controls.target.lerp(targetPos, 0.05);
            // @ts-ignore
            controls.update();
        }
    });
    return null;
}

const EarthSeasonsSim: React.FC = () => {
  const [dayOfYear, setDayOfYear] = useState(172); // Start near June Solstice
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(0.2); // Reduced initial speed
  const [cameraMode, setCameraMode] = useState<'orbital' | 'earth'>('orbital');
  const [showRays, setShowRays] = useState(true);
  const [showLabels, setShowLabels] = useState(true);

  // Animation Loop for Date
  useEffect(() => {
    if (!isPlaying) return;

    let lastTime = performance.now();
    let frameId: number;

    const tick = (now: number) => {
      const delta = (now - lastTime) / 1000;
      lastTime = now;
      
      setDayOfYear(prev => {
        const next = prev + delta * 20 * speed; // Modified by speed multiplier
        return next > 365 ? next - 365 : next;
      });
      
      frameId = requestAnimationFrame(tick);
    };

    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [isPlaying, speed]);

  // Date Formatter
  const getDateString = (day: number) => {
      const date = new Date(2023, 0); // Start Jan 1
      date.setDate(Math.floor(day) + 1);
      return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
  };

  const getSeason = (day: number) => {
      // Northern Hemisphere Seasons (approx)
      if (day >= 80 && day < 172) return 'Spring';
      if (day >= 172 && day < 264) return 'Summer';
      if (day >= 264 && day < 355) return 'Autumn';
      return 'Winter';
  };

  // Solar Declination Calculation (Approximate)
  const getSolarDeclination = (day: number) => {
      return -23.44 * Math.cos( (2 * Math.PI / 365) * (day + 10) );
  };

  const solarDec = getSolarDeclination(dayOfYear);

  return (
    <div className="w-full h-full relative bg-black">
      <Canvas shadows camera={{ position: [0, 60, 100], fov: 40 }}>
         <color attach="background" args={['#020617']} />
         <Stars radius={300} depth={50} count={5000} factor={4} saturation={0} fade />
         <ambientLight intensity={0.1} />
         
         {/* Sun - The Light Source - Reduced Size */}
         <pointLight position={[0, 0, 0]} intensity={2.5} distance={500} decay={0} color="#fff7ed" />
         <mesh position={[0,0,0]}>
             <sphereGeometry args={[4, 32, 32]} />
             <meshBasicMaterial color="#fbbf24" toneMapped={false} />
             <mesh scale={[1.2, 1.2, 1.2]}>
                 <sphereGeometry args={[4, 32, 32]} />
                 <meshBasicMaterial color="#fbbf24" transparent opacity={0.3} toneMapped={false} />
             </mesh>
         </mesh>

         {/* Orbit Path Visual */}
         <mesh rotation={[Math.PI/2, 0, 0]}>
             <ringGeometry args={[ORBIT_RADIUS - 0.2, ORBIT_RADIUS + 0.2, 128]} />
             <meshBasicMaterial color="#ffffff" opacity={0.1} transparent side={THREE.DoubleSide} />
         </mesh>

         <Suspense fallback={null}>
             <Earth 
               dayOfYear={dayOfYear} 
               showRays={showRays} 
               showLabels={showLabels} 
               isPlaying={isPlaying}
               speed={speed}
             />
         </Suspense>

         <OrbitControls minDistance={20} maxDistance={400} />
         <CameraController mode={cameraMode} dayOfYear={dayOfYear} />
      </Canvas>
      <Loader />

      {/* --- HUD OVERLAYS --- */}
      
      {/* Top Center: Date & Season */}
      <div className="absolute top-4 md:top-8 left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-none w-full px-4">
          <div className="glass px-6 py-3 rounded-2xl border border-white/10 backdrop-blur-xl flex flex-col items-center gap-1 shadow-2xl">
              <span className="text-cyan-400 text-[10px] font-bold tracking-[0.2em] uppercase">{getSeason(dayOfYear)}</span>
              <span className="text-white font-orbitron text-xl md:text-2xl font-bold">{getDateString(dayOfYear)}</span>
              <div className="w-32 h-1 bg-white/10 rounded-full mt-2 overflow-hidden">
                  <div className="h-full bg-cyan-500 transition-all duration-75" style={{ width: `${(dayOfYear/365)*100}%` }}></div>
              </div>
          </div>
      </div>

      {/* Left: Northern Stats - Compact */}
      <div className="absolute top-20 md:top-1/2 left-4 md:left-6 md:-translate-y-1/2 pointer-events-none hidden md:block">
          <div className="glass p-3 rounded-xl border-l-2 border-l-blue-500 border-y border-r border-white/10 w-40 backdrop-blur-xl">
               <h3 className="text-blue-400 font-bold text-[10px] tracking-widest uppercase mb-2">North (45°N)</h3>
               <div className="space-y-2">
                   <div>
                       <span className="block text-[9px] text-slate-500 uppercase font-bold">Day Length</span>
                       <span className="text-white font-mono text-sm">
                           {(12 + (solarDec/23.5) * 2.5).toFixed(1)}h
                       </span>
                   </div>
                   <div>
                       <span className="block text-[9px] text-slate-500 uppercase font-bold">Sun Angle</span>
                       <span className="text-white font-mono text-sm">
                           {(90 - 45 + solarDec).toFixed(1)}°
                       </span>
                   </div>
               </div>
          </div>
      </div>

      {/* Right: Southern Stats - Compact */}
      <div className="absolute top-20 md:top-1/2 right-4 md:right-6 md:-translate-y-1/2 pointer-events-none hidden md:block">
          <div className="glass p-3 rounded-xl border-r-2 border-r-orange-500 border-y border-l border-white/10 w-40 backdrop-blur-xl text-right">
               <h3 className="text-orange-400 font-bold text-[10px] tracking-widest uppercase mb-2">South (45°S)</h3>
               <div className="space-y-2">
                   <div>
                       <span className="block text-[9px] text-slate-500 uppercase font-bold">Day Length</span>
                       <span className="text-white font-mono text-sm">
                           {(12 - (solarDec/23.5) * 2.5).toFixed(1)}h
                       </span>
                   </div>
                   <div>
                       <span className="block text-[9px] text-slate-500 uppercase font-bold">Sun Angle</span>
                       <span className="text-white font-mono text-sm">
                           {(90 - 45 - solarDec).toFixed(1)}°
                       </span>
                   </div>
               </div>
          </div>
      </div>

      {/* Bottom Controls - Responsive */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[95%] md:w-[500px] glass p-3 md:p-4 rounded-2xl border border-white/10 backdrop-blur-xl flex flex-col gap-3">
           {/* Play & Speed & Scrubber */}
           <div className="flex flex-col md:flex-row items-center gap-3">
               <div className="flex items-center gap-2 w-full md:w-auto">
                    <button 
                        onClick={() => setIsPlaying(!isPlaying)}
                        className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center border transition-all shrink-0 ${isPlaying ? 'bg-cyan-500 text-black border-cyan-400' : 'bg-white/5 text-white border-white/20 hover:bg-white/10'}`}
                    >
                        {isPlaying ? (
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
                        ) : (
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M5 3l14 9-14 9V3z"/></svg>
                        )}
                    </button>
                    
                    {/* Speed Control */}
                    <div className="flex flex-col w-20 px-2 bg-white/5 rounded-lg py-1 border border-white/5">
                        <span className="text-[8px] text-slate-500 font-bold uppercase">Speed: {speed.toFixed(1)}x</span>
                        <input 
                            type="range" 
                            min="0.1" 
                            max="2.0" 
                            step="0.1" 
                            value={speed} 
                            onChange={(e) => setSpeed(parseFloat(e.target.value))}
                            className="w-full h-1 bg-slate-700 rounded appearance-none cursor-pointer accent-cyan-500"
                        />
                    </div>
               </div>

               <input 
                  type="range" 
                  min="0" 
                  max="365" 
                  value={dayOfYear} 
                  onChange={(e) => {
                      setDayOfYear(parseFloat(e.target.value));
                      setIsPlaying(false);
                  }}
                  className="flex-1 h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500 w-full"
               />
           </div>

           {/* Toggles */}
           <div className="flex justify-between items-center border-t border-white/5 pt-2 text-[9px] md:text-[10px]">
               <div className="flex gap-2">
                   <button 
                      onClick={() => setCameraMode(cameraMode === 'orbital' ? 'earth' : 'orbital')}
                      className={`px-2 py-1 md:px-3 md:py-1.5 rounded-lg font-bold uppercase border transition-all ${cameraMode === 'earth' ? 'bg-purple-500/20 text-purple-300 border-purple-500/50' : 'bg-white/5 text-slate-400 border-white/10'}`}
                   >
                       {cameraMode === 'orbital' ? 'View: World' : 'View: Earth'}
                   </button>
               </div>
               <div className="flex gap-2">
                   <button 
                      onClick={() => setShowRays(!showRays)}
                      className={`px-2 py-1 md:px-3 md:py-1.5 rounded-lg font-bold uppercase border transition-all ${showRays ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50' : 'bg-white/5 text-slate-400 border-white/10'}`}
                   >
                       Rays
                   </button>
                   <button 
                      onClick={() => setShowLabels(!showLabels)}
                      className={`px-2 py-1 md:px-3 md:py-1.5 rounded-lg font-bold uppercase border transition-all ${showLabels ? 'bg-red-500/20 text-red-300 border-red-500/50' : 'bg-white/5 text-slate-400 border-white/10'}`}
                   >
                       Labels
                   </button>
               </div>
           </div>
      </div>
    </div>
  );
};

export default EarthSeasonsSim;