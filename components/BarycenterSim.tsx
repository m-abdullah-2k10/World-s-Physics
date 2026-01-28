
import React, { useState, useRef, useMemo, Suspense } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { OrbitControls, Stars, Line, Sphere, Html, Loader } from '@react-three/drei';
import * as THREE from 'three';

// Constants for simulation
const REAL_EARTH_MASS_RATIO = 81.3;
const MOON_MASS_RATIO = 1;

interface SimulationSceneProps {
    speed: number;
}

const SimulationScene: React.FC<SimulationSceneProps> = ({ speed }) => {
    const groupRef = useRef<THREE.Group>(null);
    const earthRef = useRef<THREE.Mesh>(null);
    const moonRef = useRef<THREE.Mesh>(null);

    // Load Textures
    const [earthMap, moonMap] = useLoader(THREE.TextureLoader, [
        'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_atmos_2048.jpg',
        'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/moon_1024.jpg'
    ]);
    
    // Config - Realistic Settings Only
    const config = useMemo(() => {
        return {
            earthSize: 1.5,
            moonSize: 0.4, 
            distance: 30, // Reduced radius as requested (was 50)
            orbitSpeed: 0.5,
            trailOpacity: 0.2,
            effectiveMassRatio: REAL_EARTH_MASS_RATIO
        };
    }, []);

    // Barycenter Calculations
    // rEarth = Distance from Pivot(0,0,0) to Earth Center
    const rEarth = config.distance * (MOON_MASS_RATIO / (config.effectiveMassRatio + MOON_MASS_RATIO));
    // rMoon = Distance from Pivot(0,0,0) to Moon Center
    const rMoon = config.distance * (config.effectiveMassRatio / (config.effectiveMassRatio + MOON_MASS_RATIO));

    // Animation Loop
    useFrame((state, delta) => {
        if (groupRef.current) {
            // Rotate the whole system around the Barycenter (0,0,0)
            groupRef.current.rotation.y += delta * config.orbitSpeed * speed;
        }
        if (earthRef.current) {
            // Earth Day Rotation 
            earthRef.current.rotation.y += delta * 0.5 * speed;
        }
        if (moonRef.current) {
             // Moon tidally locked
             moonRef.current.rotation.y += delta * 0.05 * speed;
        }
    });

    // Orbital Path Geometries (Traces the center of the bodies)
    const earthOrbitPoints = useMemo(() => {
        const points = [];
        for (let i = 0; i <= 64; i++) {
            const angle = (i / 64) * Math.PI * 2;
            points.push(new THREE.Vector3(Math.cos(angle) * rEarth, 0, Math.sin(angle) * rEarth));
        }
        return points;
    }, [rEarth]);

    const moonOrbitPoints = useMemo(() => {
        const points = [];
        for (let i = 0; i <= 128; i++) {
            const angle = (i / 128) * Math.PI * 2;
            points.push(new THREE.Vector3(Math.cos(angle) * rMoon, 0, Math.sin(angle) * rMoon));
        }
        return points;
    }, [rMoon]);

    const axisPoints = useMemo(() => [new THREE.Vector3(0, -100, 0), new THREE.Vector3(0, 100, 0)], []);
    const leverPoints = useMemo(() => [new THREE.Vector3(-rEarth, 0, 0), new THREE.Vector3(rMoon, 0, 0)], [rEarth, rMoon]);

    return (
        <group>
            {/* Barycenter Axis Line - Visualizing the axis of rotation */}
            <Line points={axisPoints} color="#ef4444" lineWidth={1} dashed dashSize={2} gapSize={2} opacity={0.6} transparent />

            {/* Barycenter Marker (The Pivot) */}
            <mesh position={[0, 0, 0]}>
                <sphereGeometry args={[0.1, 16, 16]} />
                <meshBasicMaterial color="#ef4444" toneMapped={false} />
                <pointLight color="#ef4444" intensity={2} distance={5} />
                <Html position={[0.5, 2, 0]} center>
                    <div className="flex flex-col items-center pointer-events-none select-none">
                         <div className="text-red-500 font-bold text-[10px] whitespace-nowrap bg-black/80 px-2 py-1 rounded border border-red-500/50">Barycenter</div>
                         <div className="w-px h-4 bg-red-500/50"></div>
                    </div>
                </Html>
            </mesh>
            
            {/* Horizontal Grid Plane for reference */}
            <gridHelper args={[100, 20, 0x333333, 0x111111]} position={[0, -5, 0]} />

            {/* Static Orbital Paths (Visual Reference) */}
            <Line points={earthOrbitPoints} color="#3b82f6" opacity={config.trailOpacity} transparent lineWidth={1} />
            <Line points={moonOrbitPoints} color="#94a3b8" opacity={config.trailOpacity} transparent lineWidth={1} />

            {/* Rotating System Group */}
            <group ref={groupRef}>
                
                {/* Visual Lever Arm connecting centers */}
                <Line 
                    points={leverPoints} 
                    color="#ffffff" 
                    opacity={0.1} 
                    transparent 
                    lineWidth={1} 
                />

                {/* EARTH */}
                <group position={[-rEarth, 0, 0]}>
                    <Sphere ref={earthRef} args={[config.earthSize, 64, 64]}>
                        <meshStandardMaterial 
                            map={earthMap}
                            color="#ffffff" 
                            roughness={0.5}
                            metalness={0.1}
                        />
                    </Sphere>
                    {/* Atmosphere Glow Mesh */}
                    <Sphere args={[config.earthSize * 1.03, 64, 64]}>
                         <meshStandardMaterial 
                            color="#60a5fa" 
                            transparent 
                            opacity={0.15} 
                            side={THREE.BackSide} 
                            blending={THREE.AdditiveBlending} 
                        />
                    </Sphere>
                    
                    <Html distanceFactor={20} position={[0, config.earthSize + 2, 0]}>
                         <div className="text-cyan-400 text-[10px] font-bold tracking-widest bg-black/60 px-2 py-1 rounded backdrop-blur-sm border border-cyan-500/30">EARTH</div>
                    </Html>
                </group>

                {/* MOON */}
                <group position={[rMoon, 0, 0]}>
                    <Sphere ref={moonRef} args={[config.moonSize, 32, 32]}>
                        <meshStandardMaterial 
                            map={moonMap}
                            color="#cccccc"
                            roughness={0.9} 
                        />
                    </Sphere>
                    <Html distanceFactor={20} position={[0, config.moonSize + 1.5, 0]}>
                         <div className="text-slate-300 text-[10px] font-bold tracking-widest bg-black/60 px-2 py-1 rounded backdrop-blur-sm border border-white/20">MOON</div>
                    </Html>
                </group>
            </group>
        </group>
    );
};

const BarycenterSim: React.FC = () => {
    const [speed, setSpeed] = useState(1);

    return (
        <div className="w-full h-full relative bg-slate-950">
            <Canvas camera={{ position: [0, 50, 50], fov: 45 }} shadows>
                {/* Sun Light Source */}
                <directionalLight position={[100, 20, 50]} intensity={2.5} color="#ffffff" castShadow />
                <ambientLight intensity={0.15} /> 
                
                <Stars radius={200} depth={50} count={3000} factor={4} fade />
                
                <Suspense fallback={null}>
                    <SimulationScene speed={speed} />
                </Suspense>
                
                <OrbitControls 
                    enablePan={true}
                    enableZoom={true}
                    minDistance={5}
                    maxDistance={200}
                />
            </Canvas>
            <Loader />

            {/* UI Overlay */}
            <div className="absolute top-6 left-6 flex flex-col gap-4 z-20 pointer-events-none">
                <div className="glass p-5 rounded-2xl border-white/10 w-80 backdrop-blur-xl pointer-events-auto max-h-[90vh] overflow-y-auto">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.5)]"></div>
                        <span className="text-[10px] font-bold text-red-400 tracking-[0.2em] uppercase">BARYCENTER DYNAMICS</span>
                    </div>

                    <div className="mb-6 space-y-3">
                        <p className="text-xs text-slate-300 leading-relaxed border-l-2 border-cyan-500 pl-3">
                            The <b>Barycenter</b> is the common center of mass around which the Earth and Moon orbit.
                        </p>
                        <p className="text-xs text-slate-400 leading-relaxed">
                            Because Earth is much more massive (~81x), the barycenter is located <b>inside the Earth</b>, roughly 1,700km beneath the surface. This causes the Earth to "wobble" slightly rather than orbit in a wide circle.
                        </p>
                    </div>

                    <div className="space-y-4 mb-6">
                        <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                            <span className="block text-[10px] text-slate-500 font-bold uppercase mb-2">System Stats</span>
                            <div className="grid grid-cols-2 gap-y-3 gap-x-2">
                                <div>
                                    <span className="block text-[9px] text-slate-400 uppercase">Mass Ratio</span>
                                    <span className="font-mono text-xs text-cyan-400">81.3 : 1</span>
                                </div>
                                <div>
                                    <span className="block text-[9px] text-slate-400 uppercase">Time Scale</span>
                                    <span className="font-mono text-xs text-white">{speed.toFixed(1)}x</span>
                                </div>
                                <div className="col-span-2 pt-2 mt-2 border-t border-white/5">
                                    <span className="block text-[9px] text-slate-400 uppercase">Status</span>
                                    <span className="text-[10px] text-green-400 flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                                        Realistic Physics Enabled
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6 pt-4 border-t border-white/10">
                        {/* Speed Slider */}
                        <div className="space-y-2">
                            <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase">
                                <span>Orbit Speed</span>
                                <span className="text-cyan-400">{speed.toFixed(1)}x</span>
                            </div>
                            <input
                                type="range"
                                min="0"
                                max="3"
                                step="0.1"
                                value={speed}
                                onChange={(e) => setSpeed(parseFloat(e.target.value))}
                                className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                            />
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Instruction Footer */}
             <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-center pointer-events-none opacity-50">
                <p className="text-xs text-white uppercase tracking-widest font-bold">
                    Drag to Rotate • Scroll to Zoom
                </p>
            </div>
        </div>
    );
};

export default BarycenterSim;
