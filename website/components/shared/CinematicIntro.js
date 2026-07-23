"use client";
import { useState, useEffect, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Float, Html, ContactShadows, Sparkles } from "@react-three/drei";
import * as THREE from "three";

function PhoneModel({ phase }) {
  const group = useRef();
  const screenRef = useRef();
  
  useFrame((state, delta) => {
    if (!group.current) return;

    // Levitate to center
    if (phase === 1 || phase === 2) {
      group.current.position.y = THREE.MathUtils.lerp(group.current.position.y, 0, delta * 3);
      group.current.position.z = THREE.MathUtils.lerp(group.current.position.z, 0, delta * 3);
      group.current.rotation.x = THREE.MathUtils.lerp(group.current.rotation.x, 0, delta * 3);
      group.current.rotation.z = THREE.MathUtils.lerp(group.current.rotation.z, 0, delta * 3);
    }
    
    // Vibration during heal
    if (phase === 2) {
      group.current.position.x = (Math.random() - 0.5) * 0.1;
    } else {
      group.current.position.x = THREE.MathUtils.lerp(group.current.position.x, 0, delta * 5);
    }

    // Awake / Idle
    if (phase === 3) {
      group.current.rotation.y = THREE.MathUtils.lerp(group.current.rotation.y, Math.sin(state.clock.elapsedTime) * 0.1, delta);
    }

    // Expand (Camera zoom in)
    if (phase >= 4) {
      state.camera.position.z = THREE.MathUtils.lerp(state.camera.position.z, 0.5, delta * 4);
      group.current.rotation.y = THREE.MathUtils.lerp(group.current.rotation.y, 0, delta * 5);
      group.current.rotation.x = THREE.MathUtils.lerp(group.current.rotation.x, 0, delta * 5);
    }
  });

  return (
    <group 
      ref={group} 
      position={[0, -5, -5]} 
      rotation={[Math.PI / 3, 0, Math.PI / 12]}
    >
      <Float speed={phase < 4 ? 2 : 0} rotationIntensity={phase < 4 ? 0.5 : 0} floatIntensity={phase < 4 ? 0.5 : 0}>
        {/* Phone Body */}
        <mesh castShadow receiveShadow>
          <boxGeometry args={[2.8, 5.8, 0.3]} />
          <meshStandardMaterial color="#111" metalness={0.9} roughness={0.1} />
        </mesh>
        
        {/* Screen */}
        <mesh position={[0, 0, 0.16]} ref={screenRef}>
          <planeGeometry args={[2.7, 5.7]} />
          <meshBasicMaterial color="#000" />
        </mesh>

        {/* Dynamic Island */}
        <mesh position={[0, 2.6, 0.17]}>
          <boxGeometry args={[0.9, 0.25, 0.01]} />
          <meshBasicMaterial color="#0a0a0a" />
        </mesh>

        {/* HTML UI on Screen */}
        <Html 
          transform 
          position={[0, 0, 0.17]} 
          zIndexRange={[100, 0]}
          style={{ opacity: phase >= 3 ? 1 : 0, transition: 'opacity 1s ease-in-out', pointerEvents: 'none' }}
        >
          <div className="w-[270px] h-[570px] flex items-center justify-center bg-black/0">
             <span className="font-display font-800 text-3xl tracking-widest text-white shadow-xl" style={{ filter: phase >= 4 ? 'blur(10px)' : 'none', opacity: phase >= 4 ? 0 : 1, transition: 'all 0.5s' }}>
                ZYPHOR
             </span>
          </div>
        </Html>

        {/* Sparks during heal */}
        {phase === 2 && (
          <Sparkles count={50} scale={5} size={6} speed={2} opacity={1} color="#ffcc00" position={[0,0,0.5]} />
        )}
      </Float>
    </group>
  );
}

export default function CinematicIntro({ onComplete }) {
  const [phase, setPhase] = useState(0);
  const [fade, setFade] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 1000); // Levitate
    const t2 = setTimeout(() => setPhase(2), 2500); // Heal/Vibrate
    const t3 = setTimeout(() => setPhase(3), 4000); // Awake
    const t4 = setTimeout(() => setPhase(4), 5500); // Expand
    const t5 = setTimeout(() => setFade(true), 6500); // Fade out to clear
    const t6 = setTimeout(() => onComplete(), 7000); // Unmount

    return () => [t1, t2, t3, t4, t5, t6].forEach(clearTimeout);
  }, [onComplete]);

  return (
    <div 
      className="fixed inset-0 z-[9999] bg-[#020202] flex items-center justify-center transition-opacity duration-500"
      style={{ opacity: fade ? 0 : 1 }}
    >
      {/* 2D Overlay for Cracks */}
      {phase < 3 && (
        <div className="absolute inset-0 z-50 pointer-events-none flex items-center justify-center" style={{ opacity: phase === 2 ? 0 : 1, transition: 'opacity 1s ease-in-out' }}>
           <svg width="280" height="580" viewBox="0 0 280 580" className="stroke-white/30 fill-none" style={{ filter: "drop-shadow(0 0 1px rgba(255,255,255,0.8))", transform: 'translateY(150px) rotateX(60deg) scale(0.5)', opacity: phase === 0 ? 1 : 0, transition: 'all 1.5s ease-in-out' }}>
             <path d="M140 290 L200 150 M140 290 L80 180 M140 290 L250 350 M140 290 L50 400 M140 290 L160 500" strokeWidth="1.5" strokeLinecap="round" />
             <circle cx="140" cy="290" r="15" fill="rgba(255,255,255,0.1)" stroke="rgba(255,255,255,0.4)" strokeWidth="1" />
           </svg>
        </div>
      )}

      <Canvas camera={{ position: [0, 0, 8], fov: 45 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1.5} color="#ffffff" />
        <directionalLight position={[-10, -10, -5]} intensity={0.5} color="#ff6f61" />
        <Environment preset="city" />
        <PhoneModel phase={phase} />
        <ContactShadows position={[0, -4.5, 0]} opacity={0.4} scale={20} blur={2} far={4.5} />
      </Canvas>
    </div>
  );
}
