"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Procedural crack paths radiating directly from the exact center (170, 360)
const CRACK_PATHS = [
  "M 170 360 L 60 120 L 0 50",       // Top left
  "M 170 360 L 280 150 L 340 80",    // Top right
  "M 170 360 L 40 400 L 0 500",      // Bottom left
  "M 170 360 L 300 480 L 340 580",   // Bottom right
  "M 170 360 L 140 720",             // Bottom straight
  "M 170 360 L 230 720",             // Bottom slight right
  "M 170 360 L 0 250",               // Mid left
  "M 170 360 L 340 280",             // Mid right
];

export default function CinematicIntro({ onComplete }) {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    // THODA AARAM SE (Smooth, relaxed, grand pacing - ~8.5s total)
    const t1 = setTimeout(() => setPhase(1), 1000);  // 1.0s: Rise to center
    const t2 = setTimeout(() => setPhase(2), 3000);  // 3.0s: Side sparks & Healing begins
    const t3 = setTimeout(() => setPhase(3), 5000);  // 5.0s: Healed. "WELCOME" appears
    const t4 = setTimeout(() => setPhase(4), 6500);  // 6.5s: "ZYPHOR" appears
    const t5 = setTimeout(() => setPhase(5), 8000);  // 8.0s: Cinematic zoom in
    const t6 = setTimeout(() => onComplete(), 9000); // 9.0s: Complete

    return () => [t1, t2, t3, t4, t5, t6].forEach(clearTimeout);
  }, [onComplete]);

  // Cinematic Phone Container Animation
  const phoneVariants = {
    initial: { 
      y: "80%", 
      rotateX: 70, 
      rotateY: 5,
      rotateZ: -5, 
      scale: 0.45, 
      opacity: 1
    },
    levitate: { 
      y: "0%", 
      rotateX: 0, 
      rotateY: 0,
      rotateZ: 0, 
      scale: 1,
      opacity: 1,
      transition: { duration: 1.5, ease: [0.16, 1, 0.3, 1] } // Super smooth rise
    },
    heal: {
      y: "0%", 
      rotateX: 0, 
      rotateY: 0,
      rotateZ: 0, 
      scale: 1,
      opacity: 1,
      x: [0, -3, 3, -2, 2, -1, 1, 0], // Subtle vibration
      transition: { 
        x: { duration: 2.0, ease: "easeInOut" }
      }
    },
    welcome: {
      y: "0%", x: 0, rotateX: 0, rotateY: 0, rotateZ: 0, scale: 1, opacity: 1,
      transition: { duration: 0.5, ease: "easeOut" }
    },
    zyphor: {
      y: "0%", x: 0, rotateX: 0, rotateY: 0, rotateZ: 0, scale: 1, opacity: 1,
      transition: { duration: 0.5, ease: "easeOut" }
    },
    expand: {
      scale: 30, // massive zoom into the screen
      y: "0%",
      opacity: 1,
      transition: { duration: 0.8, ease: [0.8, 0, 0.2, 1] }
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-[#020202] overflow-hidden flex items-center justify-center perspective-[1500px]">
      
      {/* Background ambient glow */}
      <motion.div 
        className="absolute inset-0 pointer-events-none"
        animate={{
          background: phase === 0 
            ? "radial-gradient(circle at center, rgba(100,100,150,0.1) 0%, transparent 50%)" 
            : phase === 2
            ? "radial-gradient(circle at center, rgba(56,189,248,0.2) 0%, transparent 60%)" 
            : "radial-gradient(circle at center, rgba(255,255,255,0.05) 0%, transparent 60%)"
        }}
        transition={{ duration: 1 }}
      />

      {/* Sparks shooting out from the sides during Rise and Heal */}
      <AnimatePresence>
        {(phase === 1 || phase === 2) && (
          <motion.div className="absolute inset-0 z-10 pointer-events-none flex items-center justify-center">
            {[...Array(30)].map((_, i) => {
              const isLeft = i % 2 === 0;
              const angle = isLeft ? Math.PI + (Math.random() - 0.5) * 1.5 : (Math.random() - 0.5) * 1.5;
              const distance = 200 + Math.random() * 300;
              return (
                <motion.div
                  key={i}
                  className="absolute w-2 h-1 rounded-full"
                  style={{
                    background: "#0ea5e9",
                    boxShadow: "0 0 10px 2px rgba(14,165,233,0.8)",
                    left: "50%", 
                    top: "50%",
                    transformOrigin: "center"
                  }}
                  initial={{ x: isLeft ? -100 : 100, y: (Math.random() - 0.5) * 300, opacity: 1, scale: 1, rotate: angle * (180 / Math.PI) }}
                  animate={{ 
                    x: Math.cos(angle) * distance,
                    y: Math.sin(angle) * distance,
                    opacity: 0, 
                    scale: 0 
                  }}
                  transition={{ 
                    duration: 0.8 + Math.random() * 1.0, 
                    ease: "easeOut",
                    delay: Math.random() * (phase === 1 ? 1.0 : 1.5)
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
          phase === 1 ? "levitate" : 
          phase === 2 ? "heal" : 
          phase === 3 ? "welcome" : 
          phase === 4 ? "zyphor" : 
          "expand"
        }
        style={{ transformStyle: "preserve-3d" }}
        className="relative w-[340px] h-[720px] transform scale-[0.85] min-[380px]:scale-[0.9] sm:scale-100 md:scale-105 origin-center"
      >
        {/* ==================================================== */}
        /*  HIGH-VISIBILITY PHONE CHASSIS                        */
        {/* ==================================================== */}
        
        {/* Outer Frame - Strong metallic rim */}
        <div className="absolute inset-0 rounded-[48px] bg-black shadow-[inset_0_0_0_4px_#3a3a3a,0_40px_100px_rgba(0,0,0,1)] overflow-visible">
          
          {/* Hardware Buttons */}
          <div className="absolute -left-[3px] top-[120px] w-[3px] h-[30px] bg-[#666] rounded-l-sm" /> 
          <div className="absolute -left-[3px] top-[170px] w-[3px] h-[60px] bg-[#666] rounded-l-sm" /> 
          <div className="absolute -left-[3px] top-[240px] w-[3px] h-[60px] bg-[#666] rounded-l-sm" /> 
          <div className="absolute -right-[3px] top-[190px] w-[3px] h-[90px] bg-[#666] rounded-r-sm" /> 

          {/* INNER SCREEN */}
          <div className="absolute inset-[4px] rounded-[44px] bg-[#050505] overflow-hidden relative shadow-[inset_0_0_20px_rgba(0,0,0,1)]">
            
            {/* Minimalist Camera Hole */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 w-[16px] h-[16px] bg-black rounded-full z-50 shadow-[0_0_2px_rgba(255,255,255,0.4)] flex items-center justify-center">
               <div className="w-1.5 h-1.5 rounded-full bg-blue-900/60 shadow-[0_0_4px_rgba(59,130,246,0.8)]"></div>
            </div>

            {/* ==================================================== */}
            /*  THE CRACKED SCREEN (PURE BLACK)                      */
            {/* ==================================================== */}
            {/* The user explicitly requested a PURE BLACK screen from the start. */}
            
            {/* AI Generated Realistic Cracked Glass Overlay */}
            <AnimatePresence>
              {phase < 3 && (
                <motion.div
                  initial={{ opacity: 1 }}
                  exit={{ opacity: 0, filter: "blur(5px)" }}
                  transition={{ duration: 1.0, ease: "easeOut" }}
                  className="absolute inset-0 z-20 pointer-events-none mix-blend-screen"
                  style={{
                    backgroundImage: "url('/cracked-glass.png')",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    opacity: phase === 2 ? 0 : 0.6,
                    transition: "opacity 2.0s" // Smoothly fades out during long heal
                  }}
                />
              )}
            </AnimatePresence>

            {/* ==================================================== */}
            /*  THE CRACKS & HEALING SPARKS (SVG)                    */
            {/* ==================================================== */}
            <svg className="absolute inset-0 w-full h-full z-40 pointer-events-none">
              <defs>
                <filter id="glow">
                  <feGaussianBlur stdDeviation="6" result="coloredBlur"/>
                  <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              </defs>

              {CRACK_PATHS.map((path, i) => (
                <g key={i}>
                  {/* The Physical Crack */}
                  <motion.path
                    d={path}
                    fill="none"
                    stroke="rgba(255,255,255,0.7)"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{ filter: "drop-shadow(0px 0px 3px rgba(255,255,255,0.8))" }}
                    initial={{ opacity: 1 }}
                    animate={{ opacity: phase >= 2 ? 0 : 1 }}
                    transition={{ duration: 0.8, delay: i * 0.2 }}
                  />
                  
                  {/* The Healing Spark traveling along the crack outward from center! */}
                  {phase === 2 && (
                    <motion.path
                      d={path}
                      fill="none"
                      stroke="#0ea5e9" // Intense neon blue
                      strokeWidth="7"
                      strokeLinecap="round"
                      filter="url(#glow)"
                      initial={{ pathLength: 0, pathOffset: 1, opacity: 1 }}
                      animate={{ pathLength: 0.4, pathOffset: 0, opacity: 0 }}
                      transition={{ 
                        duration: 1.8, 
                        ease: "easeOut",
                        delay: i * 0.2 
                      }}
                    />
                  )}
                  {phase === 2 && (
                    <motion.path
                      d={path}
                      fill="none"
                      stroke="#fff" // Bright core
                      strokeWidth="3"
                      strokeLinecap="round"
                      filter="url(#glow)"
                      initial={{ pathLength: 0, pathOffset: 1, opacity: 1 }}
                      animate={{ pathLength: 0.1, pathOffset: 0, opacity: 0 }}
                      transition={{ 
                        duration: 1.8, 
                        ease: "easeOut",
                        delay: i * 0.2 
                      }}
                    />
                  )}
                </g>
              ))}
            </svg>

            {/* ==================================================== */}
            /*  THE HEALED STATE: TEXT SEQUENCE                      */
            {/* ==================================================== */}
            <motion.div 
              className="absolute inset-0 flex flex-col items-center justify-center bg-[#030303]"
              initial={{ opacity: 0 }}
              animate={{ opacity: phase >= 3 ? 1 : 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.08)_0%,transparent_60%)] pointer-events-none" />

              <div className="flex items-center justify-center w-full h-full relative z-10 text-center">
                 {/* WELCOME TEXT (Phase 3) */}
                 <AnimatePresence>
                   {phase === 3 && (
                     <motion.span 
                       initial={{ scale: 0.8, opacity: 0, filter: "blur(10px)" }}
                       animate={{ scale: 1, opacity: 1, filter: "blur(0px)" }}
                       exit={{ scale: 1.1, opacity: 0, filter: "blur(10px)" }}
                       transition={{ duration: 0.8, ease: "easeInOut" }}
                       className="absolute font-mono font-bold text-2xl tracking-[0.3em] text-white/80"
                     >
                       WELCOME
                     </motion.span>
                   )}
                 </AnimatePresence>

                 {/* ZYPHOR LOGO (Phase 4) */}
                 <AnimatePresence>
                   {phase === 4 && (
                     <motion.span 
                       initial={{ scale: 0.8, opacity: 0, filter: "blur(10px)" }}
                       animate={{ scale: 1, opacity: 1, filter: "blur(0px)" }}
                       exit={{ opacity: 0 }}
                       transition={{ duration: 1.0, ease: "easeOut" }}
                       className="absolute font-display font-800 text-5xl tracking-[0.25em] text-white"
                       style={{ textShadow: "0 0 40px rgba(255,255,255,0.6), 0 0 100px rgba(255,255,255,0.3)" }}
                     >
                       ZYPHOR
                     </motion.span>
                   )}
                 </AnimatePresence>
              </div>
            </motion.div>

          </div>
        </div>
      </motion.div>
    </div>
  );
}
