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
    // Phase 0: Lying down, small, screen cracked.
    const t1 = setTimeout(() => setPhase(1), 1000); // Rises to center
    const t2 = setTimeout(() => setPhase(2), 2500); // Sparks travel along cracks & heal
    const t3 = setTimeout(() => setPhase(3), 5000); // Screen wakes up, ZYPHOR appears
    const t4 = setTimeout(() => setPhase(4), 6500); // Zoom into screen
    const t5 = setTimeout(() => onComplete(), 7800); // Finish

    return () => [t1, t2, t3, t4, t5].forEach(clearTimeout);
  }, [onComplete]);

  // Cinematic Phone Container Animation
  const phoneVariants = {
    initial: { 
      y: "150%", 
      rotateX: 65, 
      rotateZ: -15, 
      scale: 0.35, 
      opacity: 0,
      filter: "brightness(0.3)" 
    },
    levitate: { 
      y: "0%", 
      rotateX: 0, 
      rotateZ: 0, 
      scale: 1,
      opacity: 1,
      filter: "brightness(1)",
      transition: { duration: 1.5, ease: [0.16, 1, 0.3, 1] }
    },
    heal: {
      y: "0%", 
      rotateX: 0, 
      rotateZ: 0, 
      scale: 1,
      opacity: 1,
      x: [0, -3, 3, -2, 2, -1, 1, 0], // Subtle vibration while healing
      transition: { 
        x: { duration: 2.5, ease: "linear" },
      }
    },
    awake: {
      y: "0%",
      rotateX: 0,
      scale: 1,
      opacity: 1,
      x: 0,
      transition: { duration: 0.5 }
    },
    expand: {
      scale: 35, 
      y: "0%",
      opacity: 1,
      transition: { duration: 1.3, ease: [0.7, 0, 0.2, 1] }
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-[#000] overflow-hidden flex items-center justify-center perspective-[1200px]">
      
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
        className="relative w-[320px] h-[660px]"
      >
        {/* ==================================================== */}
        /*  PHOTOREALISTIC CSS PHONE FRAME                       */
        {/* ==================================================== */}
        
        {/* Outer Metallic Bezel */}
        <div className="absolute inset-0 rounded-[55px] border-[14px] border-[#2a2a2a] bg-black shadow-[inset_0_0_0_1px_#555,inset_0_0_5px_rgba(255,255,255,0.2),0_30px_60px_rgba(0,0,0,0.9)] overflow-visible">
          
          {/* Hardware Buttons (makes it undeniably a phone) */}
          <div className="absolute -left-[17px] top-[110px] w-[3px] h-[25px] bg-[#2a2a2a] rounded-l-sm border-y border-l border-[#444]" /> {/* Mute */}
          <div className="absolute -left-[17px] top-[160px] w-[3px] h-[55px] bg-[#2a2a2a] rounded-l-sm border-y border-l border-[#444]" /> {/* Vol Up */}
          <div className="absolute -left-[17px] top-[230px] w-[3px] h-[55px] bg-[#2a2a2a] rounded-l-sm border-y border-l border-[#444]" /> {/* Vol Down */}
          <div className="absolute -right-[17px] top-[180px] w-[3px] h-[85px] bg-[#2a2a2a] rounded-r-sm border-y border-r border-[#444]" /> {/* Power */}
          
          {/* Antenna Bands */}
          <div className="absolute -left-[14px] top-[80px] w-[14px] h-[4px] bg-[#1a1a1a]" />
          <div className="absolute -left-[14px] bottom-[80px] w-[14px] h-[4px] bg-[#1a1a1a]" />
          <div className="absolute -right-[14px] top-[80px] w-[14px] h-[4px] bg-[#1a1a1a]" />
          <div className="absolute -right-[14px] bottom-[80px] w-[14px] h-[4px] bg-[#1a1a1a]" />

          {/* INNER SCREEN */}
          <div className="absolute inset-0 rounded-[40px] bg-[#020202] overflow-hidden relative shadow-[inset_0_0_20px_rgba(0,0,0,1)]">
            
            {/* Dynamic Island / Notch */}
            <div className="absolute top-3 left-1/2 -translate-x-1/2 w-[100px] h-[30px] bg-black rounded-full z-50 flex items-center justify-end px-3 shadow-[0_0_1px_rgba(255,255,255,0.2)]">
               <div className="w-3 h-3 rounded-full bg-[#111] border border-[#222]"></div>
               <div className="w-2.5 h-2.5 rounded-full bg-blue-900/40 ml-2 shadow-[0_0_4px_rgba(59,130,246,0.5)]"></div>
            </div>

            {/* ==================================================== */}
            /*  THE CRACKS & HEALING SPARKS                          */
            {/* ==================================================== */}
            <svg className="absolute inset-0 w-full h-full z-40 pointer-events-none">
              <defs>
                <filter id="glow">
                  <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
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
                    stroke="rgba(255,255,255,0.4)"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{ filter: "drop-shadow(0px 0px 1px rgba(255,255,255,0.8))" }}
                    initial={{ opacity: 1 }}
                    animate={{ opacity: phase >= 2 ? 0 : 1 }}
                    transition={{ duration: 0.5, delay: 0.5 + i * 0.2 }} // Fades out AS the spark passes
                  />
                  
                  {/* Secondary shatter details around crack */}
                  <motion.path
                    d={path}
                    fill="none"
                    stroke="rgba(255,255,255,0.2)"
                    strokeWidth="4"
                    style={{ filter: "blur(1px)" }}
                    initial={{ opacity: 1 }}
                    animate={{ opacity: phase >= 2 ? 0 : 1 }}
                    transition={{ duration: 0.5, delay: 0.5 + i * 0.2 }}
                  />

                  {/* The Healing Spark traveling along the crack! */}
                  {phase >= 2 && (
                    <motion.path
                      d={path}
                      fill="none"
                      stroke="#4ade80" // Brilliant green/blue healing energy spark
                      strokeWidth="3"
                      strokeLinecap="round"
                      filter="url(#glow)"
                      initial={{ pathLength: 0, pathOffset: 1, opacity: 1 }}
                      animate={{ pathLength: 0.15, pathOffset: 0, opacity: 0 }}
                      transition={{ 
                        duration: 1.5, 
                        ease: "easeInOut",
                        delay: i * 0.2 
                      }}
                    />
                  )}
                  {phase >= 2 && (
                    <motion.path
                      d={path}
                      fill="none"
                      stroke="#fff" // Bright core of the spark
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      filter="url(#glow)"
                      initial={{ pathLength: 0, pathOffset: 1, opacity: 1 }}
                      animate={{ pathLength: 0.05, pathOffset: 0, opacity: 0 }}
                      transition={{ 
                        duration: 1.5, 
                        ease: "easeInOut",
                        delay: i * 0.2 
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
              transition={{ duration: 0.8 }}
            >
              {/* Screen backlight ambient glow */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.08)_0%,transparent_70%)] pointer-events-none" />

              {/* ZYPHOR Logo */}
              <motion.div 
                initial={{ scale: 0.9, opacity: 0, filter: "blur(15px)" }}
                animate={phase >= 3 ? { scale: 1, opacity: 1, filter: "blur(0px)" } : {}}
                transition={{ delay: 0.2, duration: 1.5, ease: "easeOut" }}
                className="flex items-center justify-center w-full h-full relative z-10"
              >
                 <span 
                   className="font-display font-800 text-4xl tracking-widest text-white"
                   style={{ textShadow: "0 0 30px rgba(255,255,255,0.4)" }}
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
