"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Generate a optimized procedural spiderweb shatter for 144hz mobile
const generateCracks = () => {
  const cx = 170, cy = 360;
  const paths = [];
  
  // Radial cracks (Reduced for performance)
  for (let a = 0; a < 360; a += 30) { 
    let rad = (a * Math.PI) / 180;
    let r1 = 10 + Math.random() * 20;
    let r2 = 100 + Math.random() * 80;
    let r3 = 500 + Math.random() * 200;
    
    let x1 = cx + Math.cos(rad) * r1;
    let y1 = cy + Math.sin(rad) * r1;
    
    let angleOffset = (Math.random() * 0.1 - 0.05);
    let x2 = cx + Math.cos(rad + angleOffset) * r2;
    let y2 = cy + Math.sin(rad + angleOffset) * r2;
    
    angleOffset = (Math.random() * 0.1 - 0.05);
    let x3 = cx + Math.cos(rad + angleOffset) * r3;
    let y3 = cy + Math.sin(rad + angleOffset) * r3;
    
    paths.push(`M ${cx} ${cy} L ${x1.toFixed(1)} ${y1.toFixed(1)} L ${x2.toFixed(1)} ${y2.toFixed(1)} L ${x3.toFixed(1)} ${y3.toFixed(1)}`);
  }
  
  // Concentric web cracks (Reduced for performance)
  const rings = [40, 100, 200];
  for (let r of rings) {
    for (let a = 0; a < 360; a += 45) {
      if (Math.random() > 0.6) continue; 
      
      let rad1 = (a * Math.PI) / 180;
      let rad2 = ((a + 45) * Math.PI) / 180;
      
      let r_jitter1 = r + (Math.random() * 10 - 5);
      let r_jitter2 = r + (Math.random() * 10 - 5);
      
      let x1 = cx + Math.cos(rad1) * r_jitter1;
      let y1 = cy + Math.sin(rad1) * r_jitter1;
      
      let x2 = cx + Math.cos(rad2) * r_jitter2;
      let y2 = cy + Math.sin(rad2) * r_jitter2;
      
      paths.push(`M ${x1.toFixed(1)} ${y1.toFixed(1)} L ${x2.toFixed(1)} ${y2.toFixed(1)}`);
    }
  }
  
  return paths;
};

const CRACK_PATHS = generateCracks();

export default function CinematicIntro({ onComplete }) {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    // 4.5s FAST, CINEMATIC, 144Hz OPTIMIZED PACING
    const t1 = setTimeout(() => setPhase(1), 100);   // 0.1s: Phone falls in
    const t2 = setTimeout(() => setPhase(2), 1200);  // 1.2s: Cracks start healing (Blue/White)
    const t3 = setTimeout(() => setPhase(3), 2500);  // 2.5s: WELCOME text
    const t4 = setTimeout(() => setPhase(4), 3100);  // 3.1s: ZYPHOR Logo
    const t5 = setTimeout(() => setPhase(5), 3800);  // 3.8s: Cinematic Zoom Into Screen
    const t6 = setTimeout(() => {
      onComplete(); // 4.5s: Complete & unmount
    }, 4500);

    return () => [t1, t2, t3, t4, t5, t6].forEach(clearTimeout);
  }, [onComplete]);

  // Hardware Accelerated Variants
  const phoneVariants = {
    initial: { y: "-100%", rotateX: -30, rotateZ: 10, scale: 0.6, opacity: 0 },
    fall: { 
      y: "0%", rotateX: 0, rotateZ: 0, scale: 1, opacity: 1,
      transition: { type: "spring", stiffness: 120, damping: 20, mass: 1 } // Smooth fall
    },
    heal: { 
      y: "0%", rotateX: 0, rotateZ: 0, scale: 1, opacity: 1,
      x: [0, -2, 2, -1, 1, 0], // Subtle vibration while healing
      transition: { x: { duration: 0.5 } }
    },
    text1: { y: "0%", rotateX: 0, scale: 1, opacity: 1 },
    text2: { y: "0%", rotateX: 0, scale: 1, opacity: 1 },
    expand: {
      scale: 30, // Massive zoom
      opacity: 0,
      transition: { duration: 0.7, ease: [0.7, 0, 0.3, 1] } 
    }
  };

  return (
    <motion.div 
      key="intro-container"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.5 } }}
      className="fixed inset-0 z-[9999] bg-[#020202] overflow-hidden flex items-center justify-center perspective-[1500px]"
    >
      {/* Background ambient glow (Blueish white for the theme) */}
      <motion.div 
        className="absolute inset-0 pointer-events-none"
        animate={{
          background: phase >= 2 
            ? "radial-gradient(circle at center, rgba(14,165,233,0.15) 0%, transparent 60%)" 
            : "radial-gradient(circle at center, rgba(255,255,255,0.03) 0%, transparent 60%)"
        }}
        transition={{ duration: 0.8 }}
      />

      {/* Sparks shooting out from the sides during Heal */}
      <AnimatePresence>
        {phase === 2 && (
          <motion.div className="absolute inset-0 z-10 pointer-events-none flex items-center justify-center">
            {[...Array(12)].map((_, i) => {
              const isLeft = i % 2 === 0;
              const angle = isLeft ? Math.PI + (Math.random() - 0.5) * 1.5 : (Math.random() - 0.5) * 1.5;
              const distance = 150 + Math.random() * 200;
              return (
                <motion.div
                  key={i}
                  className="absolute w-2 h-1 rounded-full bg-white shadow-[0_0_8px_2px_rgba(14,165,233,0.8)]"
                  style={{
                    left: "50%", 
                    top: "50%",
                    transformOrigin: "center"
                  }}
                  initial={{ x: isLeft ? -80 : 80, y: (Math.random() - 0.5) * 200, opacity: 1, scale: 1, rotate: angle * (180 / Math.PI) }}
                  animate={{ 
                    x: Math.cos(angle) * distance,
                    y: Math.sin(angle) * distance,
                    opacity: 0, 
                    scale: 0 
                  }}
                  transition={{ 
                    duration: 0.6 + Math.random() * 0.4, 
                    ease: "easeOut",
                  }}
                />
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        variants={phoneVariants}
        initial="initial"
        animate={
          phase === 0 ? "initial" : 
          phase === 1 ? "fall" : 
          phase === 2 ? "heal" : 
          phase === 3 ? "text1" : 
          phase === 4 ? "text2" : 
          "expand"
        }
        style={{ transformStyle: "preserve-3d", willChange: "transform, opacity" }}
        className="relative w-[320px] h-[680px] transform scale-[0.8] min-[380px]:scale-[0.9] sm:scale-100 origin-center"
      >
        {/* Outer Frame */}
        <div className="absolute inset-0 rounded-[48px] bg-black shadow-[inset_0_0_0_4px_#3a3a3a,0_40px_100px_rgba(0,0,0,1)] overflow-visible">
          
          {/* Hardware Buttons */}
          <div className="absolute -left-[3px] top-[120px] w-[3px] h-[30px] bg-[#666] rounded-l-sm" /> 
          <div className="absolute -left-[3px] top-[170px] w-[3px] h-[60px] bg-[#666] rounded-l-sm" /> 
          <div className="absolute -right-[3px] top-[190px] w-[3px] h-[90px] bg-[#666] rounded-r-sm" /> 

          {/* INNER SCREEN */}
          <div className="absolute inset-[4px] rounded-[44px] bg-[#050505] overflow-hidden shadow-[inset_0_0_20px_rgba(0,0,0,1)]">
            
            {/* Minimalist Camera Hole */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 w-[16px] h-[16px] bg-black rounded-full z-50 flex items-center justify-center border border-white/5">
               <div className="w-1.5 h-1.5 rounded-full bg-blue-900/60 shadow-[0_0_4px_rgba(59,130,246,0.8)]"></div>
            </div>

            {/* Glowing Screen Background effect (Glitchy when broken) */}
            <AnimatePresence>
              {phase < 2 && (
                <motion.div 
                  className="absolute inset-0 z-10 opacity-20"
                  animate={{ opacity: [0.1, 0.4, 0.1, 0.6, 0.05, 0.3] }}
                  transition={{ duration: 0.4, repeat: Infinity, repeatType: "reverse" }}
                  exit={{ opacity: 0, transition: { duration: 0.5 } }}
                  style={{ background: "linear-gradient(to bottom, transparent, rgba(255,255,255,0.2) 50%, transparent)" }}
                />
              )}
            </AnimatePresence>

            {/* THE CRACKS (SVG) - Optimized without SVG Blur */}
            <svg className="absolute inset-0 w-full h-full z-30 pointer-events-none" style={{ willChange: "opacity, transform" }}>
              {CRACK_PATHS.map((path, i) => (
                <g key={i}>
                  {/* Base Crack (White/Silver) */}
                  <motion.path
                    d={path}
                    fill="none"
                    stroke="rgba(255,255,255,0.8)"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    initial={{ pathLength: 1, pathOffset: 0, opacity: 0 }}
                    animate={
                      phase === 0 ? { opacity: 0 } :
                      phase >= 2 
                        ? { pathLength: 0, pathOffset: 1, opacity: 0 } 
                        : { pathLength: 1, pathOffset: 0, opacity: 1 }
                    }
                    transition={
                      phase === 1 ? { duration: 0.3 } :
                      { 
                      pathLength: { duration: 1.0, ease: "easeOut", delay: i * 0.02 },
                      pathOffset: { duration: 1.0, ease: "easeOut", delay: i * 0.02 },
                      opacity: { duration: 0.2, delay: 0.9 + i * 0.02 }
                    }}
                  />
                  
                  {/* Healing Spark (Blue) */}
                  {phase === 2 && (
                    <motion.path
                      d={path}
                      fill="none"
                      stroke="#0ea5e9" 
                      strokeWidth="4"
                      strokeLinecap="round"
                      initial={{ pathLength: 0, pathOffset: 0, opacity: 1 }}
                      animate={{ pathLength: [0, 0.4, 0], pathOffset: [0, 0.6, 1], opacity: [1, 1, 0] }}
                      transition={{ 
                        duration: 1.0, 
                        ease: "easeOut",
                        delay: i * 0.02 
                      }}
                    />
                  )}
                  {/* Healing Spark Core (White) */}
                  {phase === 2 && (
                    <motion.path
                      d={path}
                      fill="none"
                      stroke="#ffffff" 
                      strokeWidth="2"
                      strokeLinecap="round"
                      initial={{ pathLength: 0, pathOffset: 0, opacity: 1 }}
                      animate={{ pathLength: [0, 0.2, 0], pathOffset: [0, 0.8, 1], opacity: [1, 1, 0] }}
                      transition={{ 
                        duration: 1.0, 
                        ease: "easeOut",
                        delay: i * 0.02 
                      }}
                    />
                  )}
                </g>
              ))}
            </svg>

            {/* THE HEALED STATE: BLACK SCREEN / PREP FOR TEXT */}
            <motion.div 
              className="absolute inset-0 flex flex-col items-center justify-center bg-[#030303] z-20"
              initial={{ opacity: 0 }}
              animate={{ opacity: phase >= 3 ? 1 : 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.08)_0%,transparent_60%)] pointer-events-none" />
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* ==================================================== */}
      {/* 3D FLASH TYPOGRAPHY OVERLAYS - FIXED FOR MOBILE      */}
      {/* ==================================================== */}
      <div className="absolute inset-0 flex flex-col items-center justify-center z-[100] pointer-events-none px-4">
        <AnimatePresence mode="wait">
          {phase === 3 && (
            <motion.div
              key="welcome"
              initial={{ opacity: 0, scale: 0.8, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 1.1 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="absolute font-mono font-bold tracking-[0.3em] text-white/90 text-center"
              style={{ fontSize: "clamp(1.5rem, 5vw, 3rem)" }} // Responsive scale
            >
              WELCOME
            </motion.div>
          )}
          {phase >= 4 && (
            <motion.div
              key="zyphor"
              initial={{ opacity: 0, scale: 0.8, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 1.2 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="absolute font-display font-900 tracking-[0.1em] text-white text-center"
              style={{ 
                fontSize: "clamp(2.5rem, 12vw, 8rem)", // Prevents mobile overflow
                textShadow: "0 0 40px rgba(255,255,255,0.6)",
                willChange: "transform, opacity" 
              }}
            >
              ZYPHOR
            </motion.div>
          )}
        </AnimatePresence>
      </div>

    </motion.div>
  );
}
