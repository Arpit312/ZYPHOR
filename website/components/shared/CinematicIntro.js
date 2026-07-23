"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Beautiful procedural crack paths (more realistic jagged lines)
const CRACK_PATHS = [
  "M 30 0 L 60 80 L 40 120 L 120 200 L 90 280 L 150 400 L 120 550 L 170 720",
  "M 340 120 L 220 190 L 240 260 L 150 400",
  "M 0 300 L 70 320 L 90 280 L 50 180",
  "M 340 450 L 280 430 L 250 490 L 150 400",
  "M 120 200 L 180 140 L 260 50",
  "M 90 280 L 160 300 L 240 260",
];

export default function CinematicIntro({ onComplete }) {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    // 5 SECONDS TOTAL TIMING for better readability
    const t1 = setTimeout(() => setPhase(1), 800);  // 0.8s: Rise to center
    const t2 = setTimeout(() => setPhase(2), 2000); // 2.0s: Sparks & Healing (Vibration)
    const t3 = setTimeout(() => setPhase(3), 3500); // 3.5s: Screen cleans up, ZYPHOR Appears
    const t4 = setTimeout(() => setPhase(4), 4500); // 4.5s: Cinematic zoom in
    const t5 = setTimeout(() => onComplete(), 5200); // 5.2s: Complete

    return () => [t1, t2, t3, t4, t5].forEach(clearTimeout);
  }, [onComplete]);

  // Cinematic Phone Container Animation
  const phoneVariants = {
    initial: { 
      y: "100%", 
      rotateX: 70, 
      rotateY: 10,
      rotateZ: -10, 
      scale: 0.4, 
      opacity: 1
    },
    levitate: { 
      y: "0%", 
      rotateX: 0, 
      rotateY: 0,
      rotateZ: 0, 
      scale: 1,
      opacity: 1,
      transition: { duration: 1.0, ease: [0.16, 1, 0.3, 1] }
    },
    heal: {
      y: "0%", 
      rotateX: 0, 
      rotateY: 0,
      rotateZ: 0, 
      scale: 1,
      opacity: 1,
      x: [0, -4, 4, -3, 3, -2, 2, -1, 1, 0], // Aggressive vibration
      transition: { 
        x: { duration: 1.5, ease: "linear" }
      }
    },
    awake: {
      y: "0%",
      x: 0,
      rotateX: 0,
      rotateY: 0,
      rotateZ: 0,
      scale: 1,
      opacity: 1,
      transition: { duration: 0.5, ease: "easeOut" }
    },
    expand: {
      scale: 30, // massive zoom into the screen
      y: "0%",
      opacity: 1,
      transition: { duration: 0.7, ease: [0.8, 0, 0.2, 1] }
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-[#020202] overflow-hidden flex items-center justify-center perspective-[1500px]">
      
      {/* Cinematic ambient background glow from the phone screen */}
      <motion.div 
        className="absolute inset-0 pointer-events-none"
        animate={{
          background: phase === 0 
            ? "radial-gradient(circle at center, rgba(100,100,150,0.15) 0%, transparent 50%)" 
            : phase === 2
            ? "radial-gradient(circle at center, rgba(56,189,248,0.2) 0%, transparent 60%)" 
            : "radial-gradient(circle at center, rgba(255,255,255,0.05) 0%, transparent 60%)"
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
        className="relative w-[340px] h-[720px] transform scale-[0.85] min-[380px]:scale-[0.9] sm:scale-100 origin-center"
      >
        {/* ==================================================== */}
        /*  HIGH-VISIBILITY PHONE CHASSIS                        */
        {/* ==================================================== */}
        
        {/* Outer Frame - Strong metallic rim so it's visible on black bg */}
        <div className="absolute inset-0 rounded-[48px] bg-black shadow-[inset_0_0_0_4px_#333,0_40px_100px_rgba(0,0,0,1)] overflow-visible">
          
          {/* Hardware Buttons - clearly visible metallic */}
          <div className="absolute -left-[3px] top-[120px] w-[3px] h-[30px] bg-[#555] rounded-l-sm" /> 
          <div className="absolute -left-[3px] top-[170px] w-[3px] h-[60px] bg-[#555] rounded-l-sm" /> 
          <div className="absolute -left-[3px] top-[240px] w-[3px] h-[60px] bg-[#555] rounded-l-sm" /> 
          <div className="absolute -right-[3px] top-[190px] w-[3px] h-[90px] bg-[#555] rounded-r-sm" /> 

          {/* INNER SCREEN */}
          <div className="absolute inset-[4px] rounded-[44px] bg-[#050505] overflow-hidden relative shadow-[inset_0_0_20px_rgba(0,0,0,1)]">
            
            {/* Minimalist Camera Hole */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 w-[16px] h-[16px] bg-black rounded-full z-50 shadow-[0_0_2px_rgba(255,255,255,0.4)] flex items-center justify-center">
               <div className="w-1.5 h-1.5 rounded-full bg-blue-900/60 shadow-[0_0_4px_rgba(59,130,246,0.8)]"></div>
            </div>

            {/* ==================================================== */}
            /*  THE GLITCHING BROKEN SCREEN (Phases 0-1)             */
            {/* ==================================================== */}
            {/* The screen is ON but broken, emitting a flickering grey/blue light. This makes the phone instantly readable! */}
            <AnimatePresence>
              {phase < 3 && (
                <motion.div 
                  className="absolute inset-0 bg-slate-800 flex flex-col z-10"
                  animate={{
                    opacity: [0.6, 0.9, 0.4, 1, 0.7, 0.9], // BLINK KARTA HAI
                    filter: ["brightness(1) hue-rotate(0deg)", "brightness(1.5) hue-rotate(90deg)", "brightness(0.8) hue-rotate(0deg)"]
                  }}
                  transition={{ 
                    duration: 0.5, 
                    repeat: Infinity,
                    repeatType: "reverse"
                  }}
                  exit={{ opacity: 0, transition: { duration: 0.5 } }} // Fades out to pure black when healed
                >
                  {/* Fake broken UI lines */}
                  <div className="w-full h-1/3 bg-white/10 mt-10" />
                  <div className="w-full h-px bg-white/40 my-2" />
                  <div className="w-full h-1/4 bg-blue-500/10" />
                  <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* AI Generated Realistic Cracked Glass Overlay */}
            <AnimatePresence>
              {phase < 3 && (
                <motion.div
                  initial={{ opacity: 1 }}
                  exit={{ opacity: 0, filter: "brightness(2)" }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  className="absolute inset-0 z-20 pointer-events-none mix-blend-multiply"
                  style={{
                    backgroundImage: "url('/cracked-glass.png')", // Uses the generated photoreal texture
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    opacity: phase === 2 ? 0 : 0.8,
                    transition: "opacity 1.5s" // Fades out during healing
                  }}
                />
              )}
            </AnimatePresence>

            {/* ==================================================== */}
            /*  THE CRACKS & HEALING SPARKS (SVG)                    */
            {/* ==================================================== */}
            {/* These SVG cracks are DARK to contrast against the bright glitching screen */}
            <svg className="absolute inset-0 w-full h-full z-40 pointer-events-none">
              <defs>
                <filter id="glow">
                  <feGaussianBlur stdDeviation="5" result="coloredBlur"/>
                  <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              </defs>

              {CRACK_PATHS.map((path, i) => (
                <g key={i}>
                  {/* The Physical Crack (Dark and deep) */}
                  <motion.path
                    d={path}
                    fill="none"
                    stroke="rgba(0,0,0,0.8)"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{ filter: "drop-shadow(1px 1px 0px rgba(255,255,255,0.3))" }}
                    initial={{ opacity: 1 }}
                    animate={{ opacity: phase >= 2 ? 0 : 1 }}
                    transition={{ duration: 0.4, delay: i * 0.15 }} // Fast fade out
                  />
                  
                  {/* The Healing Spark traveling along the crack! */}
                  {phase === 2 && (
                    <motion.path
                      d={path}
                      fill="none"
                      stroke="#0ea5e9" // Intense neon blue cinematic spark
                      strokeWidth="6"
                      strokeLinecap="round"
                      filter="url(#glow)"
                      initial={{ pathLength: 0, pathOffset: 1, opacity: 1 }}
                      animate={{ pathLength: 0.4, pathOffset: 0, opacity: 0 }}
                      transition={{ 
                        duration: 1.2, 
                        ease: "easeOut",
                        delay: i * 0.15 
                      }}
                    />
                  )}
                  {phase === 2 && (
                    <motion.path
                      d={path}
                      fill="none"
                      stroke="#fff" // Bright core of the spark
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      filter="url(#glow)"
                      initial={{ pathLength: 0, pathOffset: 1, opacity: 1 }}
                      animate={{ pathLength: 0.1, pathOffset: 0, opacity: 0 }}
                      transition={{ 
                        duration: 1.2, 
                        ease: "easeOut",
                        delay: i * 0.15 
                      }}
                    />
                  )}
                </g>
              ))}
            </svg>

            {/* ==================================================== */}
            /*  THE HEALED STATE (Phase 3+)                          */
            {/* ==================================================== */}
            {/* Glowing Screen Effect (Awake) */}
            <motion.div 
              className="absolute inset-0 flex flex-col items-center justify-center bg-[#030303]"
              initial={{ opacity: 0 }}
              animate={{ opacity: phase >= 3 ? 1 : 0 }}
              transition={{ duration: 0.5 }}
            >
              {/* Screen backlight ambient glow */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.08)_0%,transparent_60%)] pointer-events-none" />

              {/* ZYPHOR Logo */}
              <motion.div 
                initial={{ scale: 0.7, opacity: 0, filter: "blur(20px)" }}
                animate={phase >= 3 ? { scale: 1, opacity: 1, filter: "blur(0px)" } : {}}
                transition={{ delay: 0.2, duration: 0.8, ease: "easeOut" }}
                className="flex items-center justify-center w-full h-full relative z-10"
              >
                 {/* Logo text hidden during Phase 4 (Zoom out) to reveal the real website underneath */}
                 <motion.span 
                   animate={{ opacity: phase === 4 ? 0 : 1 }}
                   transition={{ duration: 0.2 }}
                   className="font-display font-800 text-5xl tracking-[0.25em] text-white"
                   style={{ textShadow: "0 0 40px rgba(255,255,255,0.6), 0 0 100px rgba(255,255,255,0.3)" }}
                 >
                   ZYPHOR
                 </motion.span>
              </motion.div>
            </motion.div>

          </div>
        </div>
      </motion.div>
    </div>
  );
}
