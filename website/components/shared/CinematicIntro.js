"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Generate a hyper-realistic, ultra-dense procedural spiderweb shatter
const generateCracks = () => {
  const cx = 170, cy = 360;
  const paths = [];
  
  // Radial cracks - Reduced density for mobile 144Hz performance
  for (let a = 0; a < 360; a += 18) { 
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
  
  // Concentric web cracks - Reduced density
  const rings = [40, 90, 160, 260];
  for (let r of rings) {
    for (let a = 0; a < 360; a += 24) {
      if (Math.random() > 0.7) continue; 
      
      let rad1 = (a * Math.PI) / 180;
      let rad2 = ((a + 15) * Math.PI) / 180;
      
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
    const t1 = setTimeout(() => setPhase(1), 400);   // 0.4s: Phone Levitate & Cracks show
    const t2 = setTimeout(() => setPhase(2), 1200);  // 1.2s: AI Scanner Healing begins
    const t3 = setTimeout(() => setPhase(3), 2500);  // 2.5s: "AI VERIFIED" text flash
    const t4 = setTimeout(() => setPhase(4), 3100);  // 3.1s: "ZYPHOR" Logo flash
    const t5 = setTimeout(() => setPhase(5), 3800);  // 3.8s: Cinematic Zoom Into Screen
    const t6 = setTimeout(() => {
      sessionStorage.setItem("zyphorIntroPlayed", "true");
      onComplete();
    }, 4500); // 4.5s: Complete & unmount

    return () => [t1, t2, t3, t4, t5, t6].forEach(clearTimeout);
  }, [onComplete]);

  // Check session storage immediately to avoid flash if already played
  useEffect(() => {
    if (sessionStorage.getItem("zyphorIntroPlayed")) {
      onComplete();
    }
  }, [onComplete]);

  // Hardware Accelerated Variants
  const phoneVariants = {
    initial: { y: "60%", rotateX: 45, scale: 0.6, opacity: 0 },
    levitate: { 
      y: "0%", rotateX: 0, scale: 1, opacity: 1,
      transition: { type: "spring", stiffness: 100, damping: 20, mass: 1 } // Super smooth 144hz spring
    },
    heal: { y: "0%", rotateX: 0, scale: 1, opacity: 1 },
    text1: { y: "0%", rotateX: 0, scale: 1, opacity: 1 },
    text2: { y: "0%", rotateX: 0, scale: 1, opacity: 1 },
    expand: {
      scale: 1.5,
      opacity: 0,
      y: "-10%",
      transition: { duration: 0.6, ease: "easeInOut" }
    }
  };

  return (
    <motion.div 
      key="intro-container"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.5 } }}
      className="fixed inset-0 z-[9999] bg-[#030303] overflow-hidden flex items-center justify-center perspective-[1500px]"
    >
      {/* Background ambient glow */}
      <motion.div 
        className="absolute inset-0 pointer-events-none"
        animate={{
          background: phase >= 2 
            ? "radial-gradient(circle at center, rgba(0,255,102,0.15) 0%, transparent 60%)" 
            : "radial-gradient(circle at center, rgba(255,255,255,0.03) 0%, transparent 60%)"
        }}
        transition={{ duration: 0.8 }}
      />

      <motion.div
        variants={phoneVariants}
        initial="initial"
        animate={
          phase === 0 ? "initial" : 
          phase === 1 ? "levitate" : 
          phase === 2 ? "heal" : 
          phase === 3 ? "text1" : 
          phase === 4 ? "text2" : 
          "expand"
        }
        style={{ transformStyle: "preserve-3d", willChange: "transform, opacity" }}
        className="relative w-[320px] h-[680px] origin-center"
      >
        {/* Outer Frame */}
        <div className="absolute inset-0 rounded-[48px] bg-black shadow-[0_0_0_4px_#222,0_30px_80px_rgba(0,0,0,1)] overflow-visible">
          
          {/* Hardware Buttons */}
          <div className="absolute -left-[3px] top-[120px] w-[3px] h-[30px] bg-[#444] rounded-l-sm" /> 
          <div className="absolute -left-[3px] top-[170px] w-[3px] h-[60px] bg-[#444] rounded-l-sm" /> 
          <div className="absolute -right-[3px] top-[190px] w-[3px] h-[90px] bg-[#444] rounded-r-sm" /> 

          {/* INNER SCREEN */}
          <div className="absolute inset-[4px] rounded-[44px] bg-[#050505] overflow-hidden shadow-[inset_0_0_20px_rgba(0,0,0,1)]">
            
            {/* Minimalist Camera Hole */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 w-[16px] h-[16px] bg-black rounded-full z-50 flex items-center justify-center border border-white/10">
               <div className="w-1.5 h-1.5 rounded-full bg-blue-900/60 shadow-[0_0_4px_rgba(59,130,246,0.8)]"></div>
            </div>

            {/* Glowing Screen Background effect */}
            <AnimatePresence>
              {phase < 2 && (
                <motion.div 
                  className="absolute inset-0 z-10 opacity-30"
                  animate={{ opacity: [0.1, 0.4, 0.1] }}
                  transition={{ duration: 0.3, repeat: Infinity }}
                  exit={{ opacity: 0 }}
                  style={{ background: "linear-gradient(to bottom, transparent, rgba(255,255,255,0.1) 50%, transparent)" }}
                />
              )}
            </AnimatePresence>

            {/* THE CRACKS (SVG) */}
            <svg className="absolute inset-0 w-full h-full z-30 pointer-events-none" style={{ willChange: "opacity" }}>
              {CRACK_PATHS.map((path, i) => (
                <motion.path
                  key={i}
                  d={path}
                  fill="none"
                  strokeLinecap="round"
                  initial={{ stroke: "rgba(255,255,255,0.7)", strokeWidth: 1, opacity: 0 }}
                  animate={
                    phase === 0 ? { opacity: 0 } :
                    phase === 1 ? { opacity: 1, stroke: "rgba(255,255,255,0.8)" } :
                    { 
                      opacity: 0, 
                      stroke: "#00FF66", 
                      strokeWidth: 2
                    }
                  }
                  transition={
                    phase === 2 
                    ? { duration: 0.8, ease: "easeOut", delay: (i % 15) * 0.02 } 
                    : { duration: 0.1 }
                  }
                />
              ))}
            </svg>

            {/* THE AI SCANNER (HEALING LASER) */}
            <AnimatePresence>
              {phase === 2 && (
                <motion.div
                  initial={{ top: "-10%", opacity: 0 }}
                  animate={{ top: "110%", opacity: [0, 1, 1, 0] }}
                  exit={{ opacity: 0 }}
                  transition={{ top: { duration: 1.2, ease: "linear" }, opacity: { duration: 1.2 } }}
                  className="absolute left-0 right-0 h-[4px] bg-signal-green shadow-[0_0_30px_10px_rgba(0,255,102,0.8)] z-40"
                  style={{ willChange: "top" }}
                />
              )}
            </AnimatePresence>

            {/* THE HEALED STATE: VERIFIED UI */}
            <motion.div 
              className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-[#020503] to-[#041008] z-20"
              initial={{ opacity: 0 }}
              animate={{ opacity: phase >= 2 ? 1 : 0 }}
              transition={{ duration: 0.5, delay: 0.4 }} // Fade in slightly after scanner starts
            >
               <motion.div
                 initial={{ scale: 0.5, opacity: 0 }}
                 animate={{ scale: phase >= 2 ? 1 : 0.5, opacity: phase >= 2 ? 1 : 0 }}
                 transition={{ type: "spring", stiffness: 200, delay: 0.6 }}
                 className="w-20 h-20 rounded-full border-2 border-signal-green flex items-center justify-center mb-4 bg-signal-green/10 shadow-[0_0_50px_rgba(0,255,102,0.4)]"
               >
                 <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#00FF66" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                   <path d="M20 6L9 17l-5-5" />
                 </svg>
               </motion.div>
               <motion.div 
                 initial={{ y: 10, opacity: 0 }}
                 animate={{ y: phase >= 2 ? 0 : 10, opacity: phase >= 2 ? 1 : 0 }}
                 transition={{ duration: 0.4, delay: 0.8 }}
                 className="font-mono text-signal-green text-sm tracking-[0.2em] font-bold drop-shadow-[0_0_10px_rgba(0,255,102,0.8)]"
               >
                 AI VERIFIED
               </motion.div>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* ==================================================== */}
      {/* 3D FLASH TYPOGRAPHY OVERLAYS                         */}
      {/* ==================================================== */}
      <div className="absolute inset-0 flex items-center justify-center z-[100] pointer-events-none">
        <AnimatePresence mode="wait">
          {phase === 3 && (
            <motion.div
              key="text1"
              initial={{ opacity: 0, scale: 0.9, y: 20, rotateX: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0, rotateX: 0 }}
              exit={{ opacity: 0, scale: 1.1 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="absolute font-display font-900 text-5xl sm:text-7xl md:text-8xl text-white tracking-tighter"
              style={{ transformStyle: "preserve-3d", willChange: "transform, opacity" }}
            >
              AI SCANNED.
            </motion.div>
          )}
          {phase >= 4 && (
            <motion.div
              key="text2"
              initial={{ opacity: 0, scale: 0.9, y: 20, rotateX: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0, rotateX: 0 }}
              exit={{ opacity: 0, scale: 1.5 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="absolute font-display font-900 text-6xl sm:text-8xl md:text-9xl text-signal-green tracking-tighter drop-shadow-[0_0_20px_rgba(0,255,102,0.5)]"
              style={{ transformStyle: "preserve-3d", willChange: "transform, opacity" }}
            >
              ZYPHOR
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ==================================================== */}
      {/* THE GRAND FINALE: CINEMATIC LIGHT SHOCKWAVE          */}
      {/* ==================================================== */}
      <AnimatePresence>
        {phase >= 5 && (
          <motion.div
            key="shockwave"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ 
              opacity: [1, 1, 0], 
              scale: [1, 50, 150] 
            }}
            transition={{ 
              duration: 1.0, 
              ease: [0.25, 1, 0.5, 1], // explosive ease out
              times: [0, 0.4, 1]
            }}
            className="absolute inset-0 z-[200] flex items-center justify-center pointer-events-none"
          >
            <div className="w-[100px] h-[100px] rounded-full bg-white shadow-[0_0_100px_50px_#00FF66]" />
          </motion.div>
        )}
      </AnimatePresence>

    </motion.div>
  );
}
