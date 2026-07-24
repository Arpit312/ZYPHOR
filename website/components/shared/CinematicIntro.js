"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Wrench, Settings, Microscope, PenTool } from "lucide-react";

// Procedural spiderweb shatter (Optimized for 144Hz)
const generateCracks = () => {
  const cx = 170, cy = 360;
  const paths = [];
  
  // Radial cracks
  for (let a = 0; a < 360; a += 24) { 
    let rad = (a * Math.PI) / 180;
    let r1 = 10 + Math.random() * 20;
    let r2 = 100 + Math.random() * 80;
    let r3 = 500 + Math.random() * 200;
    
    let x1 = cx + Math.cos(rad) * r1;
    let y1 = cy + Math.sin(rad) * r1;
    
    let x2 = cx + Math.cos(rad) * r2;
    let y2 = cy + Math.sin(rad) * r2;
    
    let x3 = cx + Math.cos(rad) * r3;
    let y3 = cy + Math.sin(rad) * r3;
    
    paths.push(`M ${cx} ${cy} L ${x1.toFixed(1)} ${y1.toFixed(1)} L ${x2.toFixed(1)} ${y2.toFixed(1)} L ${x3.toFixed(1)} ${y3.toFixed(1)}`);
  }
  
  // Concentric web cracks
  const rings = [40, 100, 180];
  for (let r of rings) {
    for (let a = 0; a < 360; a += 36) {
      if (Math.random() > 0.6) continue; 
      
      let rad1 = (a * Math.PI) / 180;
      let rad2 = ((a + 36) * Math.PI) / 180;
      
      let x1 = cx + Math.cos(rad1) * r;
      let y1 = cy + Math.sin(rad1) * r;
      
      let x2 = cx + Math.cos(rad2) * r;
      let y2 = cy + Math.sin(rad2) * r;
      
      paths.push(`M ${x1.toFixed(1)} ${y1.toFixed(1)} L ${x2.toFixed(1)} ${y2.toFixed(1)}`);
    }
  }
  
  return paths;
};

const CRACK_PATHS = generateCracks();

export default function CinematicIntro({ onComplete }) {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    // 5.0s ADVANCED CINEMATIC REPAIR TABLE SEQUENCE
    const t1 = setTimeout(() => setPhase(1), 500);   // 0.5s: Lift from repair table
    const t2 = setTimeout(() => setPhase(2), 1600);  // 1.6s: Cracks heal (Blue sparks)
    const t3 = setTimeout(() => setPhase(3), 3000);  // 3.0s: "WELCOME" inside screen
    const t4 = setTimeout(() => setPhase(4), 3700);  // 3.7s: "ZYPHOR" inside screen
    const t5 = setTimeout(() => setPhase(5), 4500);  // 4.5s: Zoom into the screen to reveal site
    const t6 = setTimeout(() => {
      onComplete(); // 5.2s: Complete
    }, 5200);

    return () => [t1, t2, t3, t4, t5, t6].forEach(clearTimeout);
  }, [onComplete]);

  // Phone Animation Variants
  const phoneVariants = {
    table: { 
      y: "40%", 
      rotateX: 65, 
      rotateY: 0,
      rotateZ: 40, 
      scale: 0.35, 
      opacity: 1,
      boxShadow: "0 50px 100px rgba(0,0,0,0.9)"
    },
    lift: { 
      y: "0%", 
      rotateX: 0, 
      rotateZ: 0, 
      scale: 1, 
      opacity: 1,
      boxShadow: "0 20px 80px rgba(14,165,233,0.3)",
      transition: { type: "spring", stiffness: 70, damping: 20, mass: 1, duration: 1.1 } // Majestic rise
    },
    heal: { 
      y: "0%", rotateX: 0, rotateZ: 0, scale: 1, opacity: 1,
      x: [0, -2, 2, -1, 1, 0], // Subtle vibration while fixing
      transition: { x: { duration: 0.6 } }
    },
    text: { y: "0%", rotateX: 0, rotateZ: 0, scale: 1, opacity: 1 },
    expand: {
      scale: 40, // Camera dives INTO the phone screen
      opacity: 0,
      transition: { duration: 0.7, ease: [0.7, 0, 0.3, 1] } 
    }
  };

  return (
    <motion.div 
      key="intro-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.5 } }}
      className="fixed inset-0 z-[9999] bg-[#020202] overflow-hidden flex items-center justify-center perspective-[1500px]"
    >
      {/* ==================================================== */}
      {/* 3D REPAIR TABLE ENVIRONMENT                            */}
      {/* ==================================================== */}
      <motion.div 
        className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none"
        animate={{ opacity: phase >= 5 ? 0 : 1 }}
        transition={{ duration: 0.5 }}
      >
        <div 
          className="w-[200vw] h-[200vh] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
          style={{ 
            transform: "perspective(1000px) rotateX(65deg) translateZ(-200px)",
            transformStyle: "preserve-3d"
          }}
        >
          {/* Glowing Grid Mat */}
          <div 
            className="absolute inset-0 opacity-[0.15]"
            style={{
              backgroundImage: "linear-gradient(to right, #0ea5e9 1px, transparent 1px), linear-gradient(to bottom, #0ea5e9 1px, transparent 1px)",
              backgroundSize: "60px 60px"
            }}
          />
          
          {/* Huge Table Watermark */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-display font-900 text-[20rem] text-[#0ea5e9] opacity-[0.03] tracking-[0.2em] pointer-events-none">
            ZYPHOR
          </div>

          {/* Abstract Tool Icons Scattered on the table */}
          <div className="absolute top-[40%] left-[30%] opacity-20 text-[#0ea5e9] rotate-45 drop-shadow-[0_0_10px_#0ea5e9]"><Wrench size={100} strokeWidth={1} /></div>
          <div className="absolute top-[60%] right-[30%] opacity-20 text-[#0ea5e9] -rotate-12 drop-shadow-[0_0_10px_#0ea5e9]"><Microscope size={120} strokeWidth={1} /></div>
          <div className="absolute top-[30%] right-[40%] opacity-10 text-[#0ea5e9] rotate-90 drop-shadow-[0_0_10px_#0ea5e9]"><Settings size={80} strokeWidth={1} /></div>
          <div className="absolute top-[65%] left-[40%] opacity-15 text-[#0ea5e9] -rotate-45 drop-shadow-[0_0_10px_#0ea5e9]"><PenTool size={90} strokeWidth={1} /></div>
          
          {/* Table Ambient Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[radial-gradient(circle_at_center,rgba(14,165,233,0.1)_0%,transparent_70%)]" />
        </div>
      </motion.div>

      {/* ==================================================== */}
      {/* THE SMARTPHONE DEVICE                                  */}
      {/* ==================================================== */}
      <motion.div
        variants={phoneVariants}
        initial="table"
        animate={
          phase === 0 ? "table" : 
          phase === 1 ? "lift" : 
          phase === 2 ? "heal" : 
          phase === 3 ? "text" : 
          phase === 4 ? "text" : 
          "expand"
        }
        style={{ transformStyle: "preserve-3d", willChange: "transform, opacity" }}
        className="relative z-10 w-[300px] h-[640px] transform origin-center"
      >
        {/* Outer Chassis */}
        <div className="absolute inset-0 rounded-[44px] bg-[#111] shadow-[inset_0_0_0_2px_#333] overflow-visible">
          
          {/* Hardware Buttons */}
          <div className="absolute -left-[2px] top-[100px] w-[2px] h-[25px] bg-[#444] rounded-l-sm" /> 
          <div className="absolute -left-[2px] top-[140px] w-[2px] h-[50px] bg-[#444] rounded-l-sm" /> 
          <div className="absolute -right-[2px] top-[160px] w-[2px] h-[70px] bg-[#444] rounded-r-sm" /> 

          {/* ==================================================== */}
          {/* THE SCREEN (Where the magic happens)                   */}
          {/* ==================================================== */}
          <div className="absolute inset-[3px] rounded-[41px] bg-[#050505] overflow-hidden shadow-[inset_0_0_20px_rgba(0,0,0,1)] flex flex-col items-center justify-center relative">
            
            {/* Camera Hole */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 w-[14px] h-[14px] bg-black rounded-full z-50 border border-white/5 flex items-center justify-center">
               <div className="w-1 h-1 rounded-full bg-blue-900 shadow-[0_0_3px_#0ea5e9]"></div>
            </div>

            {/* Glowing Broken Screen Background (Disappears when healed) */}
            <AnimatePresence>
              {phase < 2 && (
                <motion.div 
                  className="absolute inset-0 z-10 opacity-20"
                  animate={{ opacity: [0.1, 0.3, 0.1, 0.5, 0.05, 0.2] }}
                  transition={{ duration: 0.3, repeat: Infinity, repeatType: "reverse" }}
                  exit={{ opacity: 0, transition: { duration: 0.5 } }}
                  style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 40%, rgba(14,165,233,0.1) 100%)" }}
                />
              )}
            </AnimatePresence>

            {/* THE CRACKS (SVG) */}
            <svg className="absolute inset-0 w-full h-full z-30 pointer-events-none" style={{ willChange: "opacity" }}>
              {CRACK_PATHS.map((path, i) => (
                <g key={i}>
                  {/* Physical Crack Line */}
                  <motion.path
                    d={path}
                    fill="none"
                    stroke="rgba(255,255,255,0.6)"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    initial={{ pathLength: 1, pathOffset: 0, opacity: 0 }}
                    animate={
                      phase === 0 ? { opacity: 1 } :
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
                  
                  {/* Healing Spark (Blue Core) - Optimized for 144Hz */}
                  {phase === 2 && (
                    <motion.path
                      d={path}
                      fill="none"
                      stroke="#0ea5e9" 
                      strokeWidth="3"
                      strokeLinecap="round"
                      initial={{ pathLength: 0, pathOffset: 0, opacity: 1 }}
                      animate={{ pathLength: [0, 0.3, 0], pathOffset: [0, 0.7, 1], opacity: [1, 1, 0] }}
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

            {/* ==================================================== */}
            {/* INSIDE-SCREEN TYPOGRAPHY REVEAL                        */}
            {/* ==================================================== */}
            <AnimatePresence mode="wait">
              {phase === 3 && (
                <motion.div
                  key="welcome-inner"
                  initial={{ opacity: 0, scale: 0.8, filter: "blur(5px)" }}
                  animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                  exit={{ opacity: 0, scale: 1.1, filter: "blur(5px)" }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  className="absolute z-40 font-mono font-bold tracking-[0.2em] text-white/90 text-sm drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]"
                >
                  WELCOME
                </motion.div>
              )}
              {phase >= 4 && (
                <motion.div
                  key="zyphor-inner"
                  initial={{ opacity: 0, scale: 0.8, filter: "blur(10px)" }}
                  animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                  exit={{ opacity: 0, scale: 1.2 }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                  className="absolute z-40 font-display font-900 tracking-[0.1em] text-white text-3xl sm:text-4xl"
                  style={{ textShadow: "0 0 20px rgba(14,165,233,0.8)" }}
                >
                  ZYPHOR
                </motion.div>
              )}
            </AnimatePresence>

            {/* Screen Inner Glow during Logo Reveal */}
            <AnimatePresence>
              {phase >= 3 && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(14,165,233,0.2)_0%,transparent_70%)] pointer-events-none z-20"
                />
              )}
            </AnimatePresence>

          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
