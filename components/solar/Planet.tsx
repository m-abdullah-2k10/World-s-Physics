import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { PlanetData } from './SolarData';
import * as THREE from 'three';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      group: any;
      mesh: any;
      ringGeometry: any;
      meshBasicMaterial: any;
      sphereGeometry: any;
      meshStandardMaterial: any;
    }
  }
}

interface PlanetProps {
  data: PlanetData;
  isSelected: boolean;
  onSelect: (planet: PlanetData) => void;
}

const Planet: React.FC<PlanetProps> = ({ data, isSelected, onSelect }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const orbitGroupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);

  // Random starting angle for variety
  const startAngle = useRef(Math.random() * Math.PI * 2);

  useFrame(({ clock }) => {
    if (orbitGroupRef.current && meshRef.current) {
      // Orbit Logic
      const t = clock.getElapsedTime() * (data.speed * 0.1) + startAngle.current;
      const x = Math.cos(t) * data.distance;
      const z = Math.sin(t) * data.distance;
      
      meshRef.current.position.set(x, 0, z);
      
      // Self Rotation
      meshRef.current.rotation.y += 0.01 / data.speed;
    }
  });

  return (
    <group ref={orbitGroupRef}>
      {/* Orbit Path (Visual Ring) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        {/* Increased segment count (128) for smoothness, inner/outer radius for thickness */}
        <ringGeometry args={[data.distance - 0.15, data.distance + 0.15, 128]} />
        {/* Increased opacity to 0.25 and brightened color for visibility */}
        <meshBasicMaterial color="#ffffff" opacity={0.25} transparent side={THREE.DoubleSide} />
      </mesh>

      {/* The Planet Mesh */}
      <mesh
        ref={meshRef}
        onClick={(e) => {
          e.stopPropagation();
          onSelect(data);
        }}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <sphereGeometry args={[data.size, 64, 64]} />
        <meshStandardMaterial 
          color={data.color} 
          roughness={0.7}
          metalness={0.2}
          emissive={hovered || isSelected ? data.color : '#000000'}
          emissiveIntensity={hovered || isSelected ? 0.4 : 0}
        />
        
        {/* Saturn's Rings specific check */}
        {data.id === 'saturn' && (
           <mesh rotation={[-Math.PI / 3, 0, 0]}>
             <ringGeometry args={[data.size * 1.4, data.size * 2.2, 64]} />
             <meshStandardMaterial color="#c2b280" opacity={0.7} transparent side={THREE.DoubleSide} />
           </mesh>
        )}
      </mesh>
    </group>
  );
};

export default Planet;