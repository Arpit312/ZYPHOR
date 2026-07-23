"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Beautiful procedural crack paths
const CRACK_PATHS = [
  "M 50 0 L 80 120 L 120 180 L 100 300 L 160 450 L 150 660",
  "M 320 100 L 250 160 L 260 280 L 160 450",
  "M 0 250 L 90 290 L 100 300 L 30 400",
  "M 320 500 L 220 480 L 160 450",
  "M 120 180 L 160 150 L 220 50",
  "M 100 300 L 180 320 L 260 280",
];

export default function CinematicIntro({ onComplete }) {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    // 3-5 SECONDS TOTAL TIMING (Fast, Punchy, Cinematic)
    const t1 = setTimeout(() => setPhase(1), 400);  // 0.4s: Rise to center
    const t2 = setTimeout(() => setPhase(2), 1200); // 1.2s: Sparks & Healing
    const t3 = setTimeout(() => setPhase(3), 2600); // 2.6s: Logo Appears
    const t4 = setTimeout(() => setPhase(4), 3400); // 3.4s: Cinematic zoom out
    const t5 = setTimeout(() => onComplete(), 4200); // 4.2s: Complete

    return () => [t1, t2, t3, t4, t5].forEach(clearTimeout);
  }, [onComplete]);

  // Cinematic Phone Container Animation
  const phoneVariants = {
    initial: { 
      y: "80%", 
      rotateX: 65, 
      rotateY: 10,
      rotateZ: -10, 
      scale: 0.45, 
      opacity: 0,
      filter: "brightness(0.2) contrast(1.5)" 
    },
    levitate: { 
      y: "0%", 
      rotateX: 5, 
      rotateY: 0,
      rotateZ: 0, 
      scale: 1,
      opacity: 1,
      filter: "brightness(1) contrast(1)",
      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
    },
    heal: {
      y: ["0%", "-2%", "1%", "0%"], 
      rotateX: [5, 2, 7, 5], 
      rotateY: [0, -2, 2, 0],
      rotateZ: [0, 1, -1, 0], 
      scale: 1,
      opacity: 1,
      transition: { 
        duration: 1.4, 
        ease: "easeInOut",
        repeat: Infinity
      }
    },
    awake: {
      y: "0%",
      rotateX: 0,
      rotateY: 0,
      rotateZ: 0,
      scale: 1,
      opacity: 1,
      transition: { duration: 0.5, ease: "easeOut" }
    },
    expand: {
      scale: 20, 
      y: "0%",
      opacity: 1,
      transition: { duration: 0.8, ease: [0.7, 0, 0.2, 1] }
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-[#000] overflow-hidden flex items-center justify-center perspective-[1500px]">
      
      {/* Cinematic ambient background light that flashes during heal */}
      <motion.div 
        className="absolute inset-0 pointer-events-none"
        animate={{
          background: phase === 2 
            ? "radial-gradient(circle at center, rgba(56,189,248,0.1) 0%, transparent 50%)" 
            : phase >= 3 
            ? "radial-gradient(circle at center, rgba(255,255,255,0.08) 0%, transparent 60%)"
            : "radial-gradient(circle at center, rgba(255,255,255,0) 0%, transparent 60%)"
        }}
        transition={{ duration: 0.5 }}
      />

      <motion.div
        variants={phoneVariants}
        initial="initial"
        animate={
          phase === 0 ? "initial" : 
          phase === 1 ? "levitate" : 
          phase === 2 ? "heal" : 
          phase === 3 ? "awake" : 
          "expand"
        }
        style={{ transformStyle: "preserve-3d" }}
        className="relative w-[340px] h-[720px]"
      >
        {/* ==================================================== */}
        /*  BEZEL-LESS CURVED GLASS PHONE                       */
        {/* ==================================================== */}
        
        {/* Outer Frame (Bezel-less Look) */}
        <div className="absolute inset-0 rounded-[48px] bg-black shadow-[inset_0_0_0_2px_rgba(255,255,255,0.15),0_40px_100px_rgba(0,0,0,1)] overflow-visible">
          
          {/* Hardware Buttons - ultra sleek */}
          <div className="absolute -left-[2px] top-[120px] w-[2px] h-[30px] bg-[#333] shadow-[0_0_2px_rgba(255,255,255,0.3)] rounded-l-sm" /> 
          <div className="absolute -left-[2px] top-[170px] w-[2px] h-[60px] bg-[#333] shadow-[0_0_2px_rgba(255,255,255,0.3)] rounded-l-sm" /> 
          <div className="absolute -left-[2px] top-[240px] w-[2px] h-[60px] bg-[#333] shadow-[0_0_2px_rgba(255,255,255,0.3)] rounded-l-sm" /> 
          <div className="absolute -right-[2px] top-[190px] w-[2px] h-[90px] bg-[#333] shadow-[0_0_2px_rgba(255,255,255,0.3)] rounded-r-sm" /> 

          {/* INNER SCREEN - Edge to Edge */}
          <div className="absolute inset-[2px] rounded-[46px] bg-[#020202] overflow-hidden relative">
            
            {/* 3D Glass Edge Reflection Overlay */}
            <div className="absolute inset-0 rounded-[46px] shadow-[inset_0_0_30px_rgba(255,255,255,0.12)] pointer-events-none z-50"></div>
            
            {/* Minimalist Camera Hole (Punch hole) instead of big notch */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 w-[18px] h-[18px] bg-black rounded-full z-50 shadow-[0_0_1px_rgba(255,255,255,0.3)] flex items-center justify-center">
               <div className="w-2 h-2 rounded-full bg-blue-900/50 shadow-[0_0_5px_rgba(59,130,246,0.6)]"></div>
            </div>

            {/* AI Generated Realistic Cracked Glass Overlay */}
            <AnimatePresence>
              {phase < 3 && (
                <motion.div
                  initial={{ opacity: 1 }}
                  exit={{ opacity: 0, filter: "brightness(2)" }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="absolute inset-0 z-20 pointer-events-none mix-blend-screen"
                  style={{
                    backgroundImage: "url('/cracked-glass.png')",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    opacity: phase === 2 ? 0 : 0.85,
                    transition: "opacity 1.4s"
                  }}
                />
              )}
            </AnimatePresence>

            {/* ==================================================== */}
            /*  THE CRACKS & HEALING SPARKS                          */
            {/* ==================================================== */}
            <svg className="absolute inset-0 w-full h-full z-40 pointer-events-none">
              <defs>
                <filter id="glow">
                  <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
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
                    stroke="rgba(255,255,255,0.6)"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{ filter: "drop-shadow(0px 0px 2px rgba(255,255,255,0.5))" }}
                    initial={{ opacity: 1 }}
                    animate={{ opacity: phase >= 2 ? 0 : 1 }}
                    transition={{ duration: 0.4, delay: i * 0.1 }} // Fast fade out
                  />
                  
                  {/* Secondary shatter details around crack */}
                  <motion.path
                    d={path}
                    fill="none"
                    stroke="rgba(255,255,255,0.15)"
                    strokeWidth="5"
                    style={{ filter: "blur(2px)" }}
                    initial={{ opacity: 1 }}
                    animate={{ opacity: phase >= 2 ? 0 : 1 }}
                    transition={{ duration: 0.4, delay: i * 0.1 }}
                  />

                  {/* The Healing Spark traveling along the crack! */}
                  {phase >= 2 && (
                    <motion.path
                      d={path}
                      fill="none"
                      stroke="#38bdf8" // Neon blue cinematic spark
                      strokeWidth="5"
                      strokeLinecap="round"
                      filter="url(#glow)"
                      initial={{ pathLength: 0, pathOffset: 1, opacity: 1 }}
                      animate={{ pathLength: 0.3, pathOffset: 0, opacity: 0 }}
                      transition={{ 
                        duration: 1.0, 
                        ease: "easeOut",
                        delay: i * 0.1 
                      }}
                    />
                  )}
                  {phase >= 2 && (
                    <motion.path
                      d={path}
                      fill="none"
                      stroke="#fff" // Bright core of the spark
                      strokeWidth="2"
                      strokeLinecap="round"
                      filter="url(#glow)"
                      initial={{ pathLength: 0, pathOffset: 1, opacity: 1 }}
                      animate={{ pathLength: 0.1, pathOffset: 0, opacity: 0 }}
                      transition={{ 
                        duration: 1.0, 
                        ease: "easeOut",
                        delay: i * 0.1 
                      }}
                    />
                  )}
                </g>
              ))}
            </svg>

            {/* Glowing Screen Effect (Awake) */}
            <motion.div 
              className="absolute inset-0 flex flex-col items-center justify-center bg-black"
              initial={{ opacity: 0 }}
              animate={{ opacity: phase >= 3 ? 1 : 0 }}
              transition={{ duration: 0.6 }}
            >
              {/* Screen backlight ambient glow */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.15)_0%,transparent_60%)] pointer-events-none" />

              {/* ZYPHOR Logo */}
              <motion.div 
                initial={{ scale: 0.8, opacity: 0, filter: "blur(20px)" }}
                animate={phase >= 3 ? { scale: 1, opacity: 1, filter: "blur(0px)" } : {}}
                transition={{ delay: 0.1, duration: 0.8, ease: "easeOut" }}
                className="flex items-center justify-center w-full h-full relative z-10"
              >
                 <span 
                   className="font-display font-800 text-5xl tracking-[0.25em] text-white"
                   style={{ textShadow: "0 0 40px rgba(255,255,255,0.6), 0 0 100px rgba(255,255,255,0.3)" }}
                 >
                   ZYPHOR
                 </span>
              </motion.div>
            </motion.div>

          </div>
        </div>
      </motion.div>
    </div>
  );
}
