import React, { useState, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import * as THREE from 'three';
import { PLANETS_DATA, PlanetData } from './solar/SolarData';
import Planet from './solar/Planet';
import InfoPanel from './solar/InfoPanel';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      ambientLight: any;
      pointLight: any;
      mesh: any;
      sphereGeometry: any;
      meshBasicMaterial: any;
    }
  }
}

// Camera Controller Component
// Handles smooth camera transitions between global view and planet focus
const CameraController: React.FC<{ selectedPlanet: PlanetData | null }> = ({ selectedPlanet }) => {
  const { camera, controls } = useThree();
  const vec = new THREE.Vector3();

  useFrame((state, delta) => {
    if (selectedPlanet) {
      // Logic handled via controls or user interaction, we leave basic lerping disabled 
      // here to allow user to pan around freely once zoomed in, or reset if deselected.
    } else {
        // Reset View
        const defaultPos = new THREE.Vector3(0, 60, 90);
        state.camera.position.lerp(defaultPos, 0.05);
        // @ts-ignore
        if(controls) controls.target.lerp(new THREE.Vector3(0, 0, 0), 0.1);
    }
  });

  return null;
};

const SceneContent: React.FC<{ 
    selectedPlanet: PlanetData | null, 
    onSelect: (p: PlanetData) => void 
}> = ({ selectedPlanet, onSelect }) => {
    
    return (
        <>
            <ambientLight intensity={0.1} />
            <pointLight position={[0, 0, 0]} intensity={2} color="#ffaa00" decay={0} distance={1000} />
            
            <Stars radius={300} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />

            {/* The Sun */}
            <mesh onClick={() => onSelect(null as any)}>
                <sphereGeometry args={[4, 32, 32]} />
                <meshBasicMaterial color="#fbbf24" />
                <pointLight intensity={1.5} distance={100} color="#ffaa00" />
            </mesh>
            {/* Sun Glow */}
            <mesh>
                <sphereGeometry args={[4.2, 32, 32]} />
                <meshBasicMaterial color="#fbbf24" transparent opacity={0.2} />
            </mesh>

            {PLANETS_DATA.map((planet) => (
                <Planet 
                    key={planet.id} 
                    data={planet} 
                    isSelected={selectedPlanet?.id === planet.id}
                    onSelect={onSelect}
                />
            ))}
            
            <CameraController selectedPlanet={selectedPlanet} />
        </>
    );
};


const SolarSystemSim: React.FC = () => {
  const [selectedPlanet, setSelectedPlanet] = useState<PlanetData | null>(null);

  const handlePlanetSelect = (planet: PlanetData) => {
    if (planet === selectedPlanet) return;
    setSelectedPlanet(planet);
  };

  const handleCloseInfo = () => {
    setSelectedPlanet(null);
  };

  return (
    <div className="w-full h-full relative bg-black">
        <Canvas camera={{ position: [0, 60, 90], fov: 45 }}>
            <SceneContent selectedPlanet={selectedPlanet} onSelect={handlePlanetSelect} />
            <OrbitControls 
                makeDefault
                enablePan={true} 
                enableZoom={true} 
                enableRotate={true}
                autoRotate={!selectedPlanet}
                autoRotateSpeed={0.5}
                minDistance={5}
                maxDistance={500}
            />
        </Canvas>

        {/* UI Overlay */}
        <div className="absolute top-6 left-1/2 -translate-x-1/2 pointer-events-none">
            {!selectedPlanet && (
                 <div className="glass px-6 py-2 rounded-full border border-white/10 animate-pulse">
                    <span className="text-xs font-bold text-cyan-400 tracking-[0.2em]">TAP PLANETS TO EXPLORE</span>
                 </div>
            )}
        </div>

        <InfoPanel planet={selectedPlanet} onClose={handleCloseInfo} />
    </div>
  );
};

export default SolarSystemSim;