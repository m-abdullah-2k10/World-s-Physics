
import React, { useState, useRef, useMemo, Suspense, useEffect } from 'react';
import { Canvas, useFrame, useLoader, useThree } from '@react-three/fiber';
import { OrbitControls, Stars, Line, Sphere, Html, Loader, Text } from '@react-three/drei';
import * as THREE from 'three';

// --- Types & Interfaces ---
interface SimConfig {
    moonMassMultiplier: number;
    showLever: boolean;
    showOrbitTrails: boolean;
    referenceFrame: 'barycentric' | 'geocentric';
    speed: number;
}

// --- Physics Constants ---
const BASE_EARTH_MASS = 81.3;
const BASE_MOON_MASS = 1;
const ORBIT_DISTANCE = 20; // Scaled down unit for visualization
const EARTH_RADIUS = 2;
const MOON_RADIUS = 0.6;

// --- Components ---

const SimulationScene: React.FC<SimConfig> = ({ 
    moonMassMultiplier, 
    showLever, 
    showOrbitTrails, 
    referenceFrame, 
    speed 
}) => {
    // Refs
    const groupRef = useRef<THREE.Group>(null);
    const earthRef = useRef<THREE.Mesh>(null);
    const moonRef = useRef<THREE.Mesh>(null);

    // Textures
    const [earthMap, moonMap] = useLoader(THREE.TextureLoader, [
        'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_atmos_2048.jpg',
        'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/moon_1024.jpg'
    ]);

    // Calculations
    const currentMoonMass = BASE_MOON_MASS * moonMassMultiplier;
    const totalMass = BASE_EARTH_MASS + currentMoonMass;
    
    // Distance from Barycenter (0,0,0)
    // r1 = a * m2 / (m1 + m2)
    const rEarth = ORBIT_DISTANCE * (currentMoonMass / totalMass);
    const rMoon = ORBIT_DISTANCE * (BASE_EARTH_MASS / totalMass);

    // Animation State
    const angleRef = useRef(0);
    const earthPos = useRef(new THREE.Vector3());
    const moonPos = useRef(new THREE.Vector3());

    useFrame((state, delta) => {
        angleRef.current += delta * 0.5 * speed;
        
        // Calculate Positions in Barycentric Frame (Center of Mass at 0,0,0)
        const xE = -Math.cos(angleRef.current) * rEarth;
        const zE = -Math.sin(angleRef.current) * rEarth;
        
        const xM = Math.cos(angleRef.current) * rMoon;
        const zM = Math.sin(angleRef.current) * rMoon;

        earthPos.current.set(xE, 0, zE);
        moonPos.current.set(xM, 0, zM);

        if (groupRef.current) {
            // If Geocentric, we shift the entire world so Earth is at (0,0,0)
            if (referenceFrame === 'geocentric') {
                groupRef.current.position.x = -xE;
                groupRef.current.position.z = -zE;
            } else {
                groupRef.current.position.lerp(new THREE.Vector3(0, 0, 0), 0.1);
            }
        }

        // Apply to meshes
        if (earthRef.current) {
            earthRef.current.position.copy(earthPos.current);
            earthRef.current.rotation.y += delta * 0.5;
        }
        if (moonRef.current) {
            moonRef.current.position.copy(moonPos.current);
            moonRef.current.rotation.y += delta * 0.1;
            // Moon roughly faces earth (tidal lock simulation)
            moonRef.current.rotation.y = angleRef.current + Math.PI; 
        }
    });

    return (
        <group ref={groupRef}>
            {/* --- BARYCENTER MARKER (The Pivot) --- */}
            <mesh position={[0, 0, 0]}>
                <sphereGeometry args={[0.3, 16, 16]} />
                <meshBasicMaterial color="#ef4444" toneMapped={false} />
                <Html position={[0, 0.5, 0]} center zIndexRange={[100, 0]}>
                    <div className="flex flex-col items-center">
                        <div className="text-red-500 font-bold text-[10px] bg-black/80 px-2 py-0.5 rounded border border-red-500/50 whitespace-nowrap">
                            BARYCENTER (Center of Mass)
                        </div>
                        <div className="w-0.5 h-4 bg-red-500/50"></div>
                    </div>
                </Html>
            </mesh>

            {/* --- THE LEVER (Visual Balance Beam) --- */}
            {showLever && (
                <Line
                    points={[earthPos.current, moonPos.current]}
                    color="white"
                    opacity={0.2}
                    transparent
                    lineWidth={1}
                />
            )}
            
            {/* --- ORBIT TRAILS --- */}
            {showOrbitTrails && (
                <group rotation={[Math.PI / 2, 0, 0]}>
                    {/* Earth Trail */}
                    <mesh rotation={[0, 0, 0]}>
                        <ringGeometry args={[rEarth - 0.05, rEarth + 0.05, 64]} />
                        <meshBasicMaterial color="#22d3ee" opacity={0.3} transparent side={THREE.DoubleSide} />
                    </mesh>
                    {/* Moon Trail */}
                    <mesh rotation={[0, 0, 0]}>
                         <ringGeometry args={[rMoon - 0.05, rMoon + 0.05, 128]} />
                         <meshBasicMaterial color="#94a3b8" opacity={0.15} transparent side={THREE.DoubleSide} />
                    </mesh>
                </group>
            )}

            {/* --- EARTH --- */}
            <mesh ref={earthRef}>
                <sphereGeometry args={[EARTH_RADIUS, 32, 32]} />
                <meshStandardMaterial map={earthMap} roughness={0.5} />
                <Html position={[0, EARTH_RADIUS + 0.5, 0]} center>
                    <div className="text-cyan-400 font-bold text-[10px] bg-black/60 px-2 rounded border border-cyan-500/30">
                        Earth
                    </div>
                </Html>
            </mesh>

            {/* --- MOON --- */}
            <mesh ref={moonRef}>
                <sphereGeometry args={[MOON_RADIUS * (1 + (moonMassMultiplier-1)*0.1), 32, 32]} />
                <meshStandardMaterial map={moonMap} roughness={0.8} color="#cccccc" />
                <Html position={[0, MOON_RADIUS + 0.5, 0]} center>
                    <div className="text-slate-300 font-bold text-[10px] bg-black/60 px-2 rounded border border-white/20">
                        Moon
                    </div>
                </Html>
            </mesh>
        </group>
    );
};

// Camera Controller to smooth transitions between frames
const CameraRig: React.FC<{ frame: 'barycentric' | 'geocentric' }> = ({ frame }) => {
    const { camera, controls } = useThree();
    const vec = new THREE.Vector3();

    useFrame(() => {
        // When in geocentric mode, we zoom in slightly closer to emphasize the earth being "still" visually (relative to camera)
        // In Barycentric, we pull back to see the wobble
        const targetPos = frame === 'barycentric' 
            ? vec.set(0, 30, 0) 
            : vec.set(0, 30, 0); // We actually move the scene, not the camera, so camera stays mostly put but controls target changes
        
        // @ts-ignore
        if (controls) {
             // @ts-ignore
             controls.target.lerp(new THREE.Vector3(0,0,0), 0.1);
        }
    });
    return null;
};

const BarycenterSim: React.FC = () => {
    // UI State
    const [moonMassMultiplier, setMoonMassMultiplier] = useState(1);
    const [referenceFrame, setReferenceFrame] = useState<'barycentric' | 'geocentric'>('barycentric');
    const [showLever, setShowLever] = useState(true);
    const [speed, setSpeed] = useState(1);

    return (
        <div className="w-full h-full relative bg-slate-950 font-sans">
            <Canvas shadows camera={{ position: [0, 40, 40], fov: 35 }}>
                <color attach="background" args={['#020617']} />
                <Stars radius={200} depth={50} count={5000} factor={4} fade />
                
                <ambientLight intensity={0.2} />
                <pointLight position={[50, 20, 50]} intensity={2} color="#fff7ed" />
                <hemisphereLight intensity={0.2} color="#ffffff" groundColor="#000000" />

                <Suspense fallback={null}>
                    <SimulationScene 
                        moonMassMultiplier={moonMassMultiplier}
                        showLever={showLever}
                        showOrbitTrails={true}
                        referenceFrame={referenceFrame}
                        speed={speed}
                    />
                </Suspense>
                
                <CameraRig frame={referenceFrame} />
                <OrbitControls minDistance={10} maxDistance={100} />
            </Canvas>
            <Loader />

            {/* --- EDUCATIONAL OVERLAY --- */}
            <div className="absolute top-0 left-0 p-6 w-full max-w-sm pointer-events-none">
                <div className="glass p-5 rounded-2xl border-white/10 pointer-events-auto shadow-2xl animate-slide-in">
                    <div className="flex items-center gap-3 mb-4 border-b border-white/10 pb-4">
                        <div className="w-10 h-10 rounded-lg bg-red-500/20 border border-red-500/50 flex items-center justify-center text-red-400">
                           <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M3 12h3"/><path d="M18 12h3"/><path d="M12 3v3"/><path d="M12 18v3"/></svg>
                        </div>
                        <div>
                            <h2 className="font-orbitron text-lg font-bold text-white">Center of Mass</h2>
                            <p className="text-[10px] text-slate-400 font-bold tracking-widest uppercase">The "Wobble" Effect</p>
                        </div>
                    </div>

                    <div className="space-y-4 text-sm text-slate-300 font-light leading-relaxed">
                        <p>
                            Planets don't just orbit stars, and moons don't just orbit planets. They both orbit their common center of mass, called the <span className="text-red-400 font-bold">Barycenter</span>.
                        </p>
                        
                        <div className="bg-white/5 p-3 rounded-xl border-l-2 border-cyan-500">
                             <h4 className="text-[10px] font-bold text-cyan-400 uppercase mb-1">Observation</h4>
                             <p className="text-xs">
                                {referenceFrame === 'barycentric' 
                                 ? "In this view, the Barycenter is fixed. Notice how the Earth 'wobbles' around the red dot?"
                                 : "In this view, we follow the Earth. It looks like the Barycenter is moving, but physically, Earth is the one wiggling!"}
                             </p>
                        </div>
                    </div>

                    {/* Controls */}
                    <div className="mt-6 space-y-5">
                        {/* Reference Frame Toggle */}
                        <div className="space-y-2">
                             <label className="text-[10px] font-bold text-slate-500 uppercase">Reference Frame</label>
                             <div className="flex bg-black/40 p-1 rounded-lg">
                                 <button 
                                    onClick={() => setReferenceFrame('barycentric')}
                                    className={`flex-1 py-2 text-[10px] font-bold uppercase rounded-md transition-all ${referenceFrame === 'barycentric' ? 'bg-red-500 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                                 >
                                    Barycentric (Fixed)
                                 </button>
                                 <button 
                                    onClick={() => setReferenceFrame('geocentric')}
                                    className={`flex-1 py-2 text-[10px] font-bold uppercase rounded-md transition-all ${referenceFrame === 'geocentric' ? 'bg-cyan-500 text-black shadow-lg' : 'text-slate-400 hover:text-white'}`}
                                 >
                                    Geocentric (Follow)
                                 </button>
                             </div>
                        </div>

                         {/* Mass Slider */}
                        <div className="space-y-2">
                            <div className="flex justify-between text-[10px] font-bold uppercase">
                                <span className="text-slate-500">Moon Mass</span>
                                <span className="text-white">{moonMassMultiplier}x</span>
                            </div>
                            <input 
                                type="range" min="1" max="20" step="1"
                                value={moonMassMultiplier}
                                onChange={(e) => setMoonMassMultiplier(parseFloat(e.target.value))}
                                className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
                            />
                            <p className="text-[9px] text-slate-500 italic">
                                Increase mass to pull the Barycenter outside of Earth.
                            </p>
                        </div>
                        
                        {/* Toggles */}
                        <div className="flex justify-between items-center pt-2 border-t border-white/10">
                            <label className="flex items-center gap-2 cursor-pointer group">
                                <div className={`w-8 h-4 rounded-full p-0.5 transition-colors ${showLever ? 'bg-green-500' : 'bg-slate-700'}`}>
                                    <div className={`w-3 h-3 bg-white rounded-full shadow-sm transition-transform ${showLever ? 'translate-x-4' : 'translate-x-0'}`}></div>
                                </div>
                                <span className="text-[10px] font-bold text-slate-400 group-hover:text-white transition-colors">Show Lever</span>
                                <input type="checkbox" checked={showLever} onChange={() => setShowLever(!showLever)} className="hidden" />
                            </label>

                            <button onClick={() => setSpeed(speed === 0 ? 1 : 0)} className="text-[10px] font-bold text-slate-400 hover:text-white uppercase bg-white/5 px-3 py-1 rounded hover:bg-white/10 border border-white/5">
                                {speed === 0 ? 'PLAY' : 'PAUSE'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Legend */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-6 pointer-events-none opacity-60">
                <div className="flex items-center gap-2">
                     <div className="w-3 h-3 rounded-full bg-cyan-400"></div>
                     <span className="text-[10px] font-bold text-white uppercase tracking-widest">Earth Orbit</span>
                </div>
                <div className="flex items-center gap-2">
                     <div className="w-3 h-3 rounded-full bg-slate-400"></div>
                     <span className="text-[10px] font-bold text-white uppercase tracking-widest">Moon Orbit</span>
                </div>
            </div>

        </div>
    );
};

export default BarycenterSim;
