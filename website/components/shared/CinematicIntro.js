"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function CinematicIntro({ onComplete }) {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    // Phase 0: Ground (Initial)
    // Phase 1: Levitation starts at 1s
    const t1 = setTimeout(() => setPhase(1), 1000);
    
    // Phase 2: Healing/Sparks starts at 2.5s
    const t2 = setTimeout(() => setPhase(2), 2500);
    
    // Phase 3: Screen turns on, logo appears at 4s
    const t3 = setTimeout(() => setPhase(3), 4000);
    
    // Phase 4: Zoom into screen at 5.5s
    const t4 = setTimeout(() => setPhase(4), 5500);

    // Phase 5: Complete at 7s
    const t5 = setTimeout(() => {
      onComplete();
    }, 7000);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(t5);
    };
  }, [onComplete]);

  // Phone animations based on phase
  const phoneVariants = {
    initial: { 
      y: "150%", 
      rotateX: 60, 
      rotateZ: -15, 
      scale: 0.5,
      opacity: 0
    },
    levitate: { 
      y: "0%", 
      rotateX: 15, 
      rotateZ: 0, 
      scale: 1,
      opacity: 1,
      transition: { duration: 1.5, ease: [0.22, 1, 0.36, 1] } 
    },
    heal: {
      y: "0%", 
      rotateX: 0, 
      rotateZ: 0, 
      scale: 1,
      opacity: 1,
      x: [0, -4, 4, -4, 4, 0], // Vibration
      transition: { 
        x: { duration: 0.4, repeat: 3 },
        rotateX: { duration: 1, ease: "easeInOut" }
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
      scale: 30, // Scale massively to cover screen
      y: "0%",
      opacity: 1,
      transition: { duration: 1.2, ease: [0.7, 0, 0.3, 1] } // Fast exponential zoom
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-[#020202] overflow-hidden flex items-center justify-center perspective-[1000px]">
      
      {/* Cinematic Ambient Light */}
      <motion.div 
        className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.05)_0%,transparent_60%)]"
        animate={{ opacity: phase >= 3 ? 0 : 1 }}
        transition={{ duration: 1 }}
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
        className="relative w-[280px] h-[580px] rounded-[45px] border-[6px] border-[#333] bg-[#050505] shadow-[0_20px_50px_rgba(0,0,0,0.8),inset_0_0_10px_rgba(255,255,255,0.1)] flex items-center justify-center overflow-hidden preserve-3d"
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* Phone Bezels & Screen */}
        <div className="absolute inset-0 rounded-[38px] overflow-hidden bg-black flex flex-col items-center justify-center relative">
          
          {/* Dynamic Island / Notch Mock */}
          <div className="absolute top-2.5 w-[90px] h-[25px] bg-[#111] rounded-full z-20 flex items-center justify-end px-2 shadow-inner">
             <div className="w-2.5 h-2.5 rounded-full bg-blue-900/40 border border-blue-500/20 shadow-[0_0_5px_rgba(59,130,246,0.5)]"></div>
          </div>

          {/* Cracked Glass Overlay */}
          <AnimatePresence>
            {phase < 3 && (
              <motion.div
                initial={{ opacity: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="absolute inset-0 z-10 pointer-events-none mix-blend-screen opacity-60"
              >
                {/* Procedural-looking CSS/SVG crack */}
                <svg width="100%" height="100%" viewBox="0 0 280 580" className="stroke-white/40 fill-none" style={{ filter: "drop-shadow(0 0 1px rgba(255,255,255,0.8))" }}>
                  <path d="M140 290 L200 150 M140 290 L80 180 M140 290 L250 350 M140 290 L50 400 M140 290 L160 500 M200 150 L260 50 M80 180 L20 100 M250 350 L280 320" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M140 290 L120 250 L180 200 M140 290 L160 320 L100 380" strokeWidth="0.8" strokeLinecap="round" strokeLinejoin="round" className="opacity-70" />
                  {/* Central impact shatter */}
                  <circle cx="140" cy="290" r="15" fill="rgba(255,255,255,0.1)" stroke="rgba(255,255,255,0.4)" strokeWidth="1" />
                  <circle cx="140" cy="290" r="5" fill="rgba(255,255,255,0.3)" />
                </svg>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Sparks Effect during Phase 2 (Heal) */}
          <AnimatePresence>
            {phase === 2 && (
              <motion.div className="absolute inset-0 z-15 pointer-events-none">
                {[...Array(12)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-1 h-1 bg-yellow-400 rounded-full"
                    style={{ left: "50%", top: "50%" }}
                    initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                    animate={{ 
                      x: (Math.random() - 0.5) * 300, 
                      y: (Math.random() - 0.5) * 400, 
                      opacity: 0, 
                      scale: 0 
                    }}
                    transition={{ 
                      duration: 0.8 + Math.random() * 0.5, 
                      ease: "easeOut",
                      repeat: 2
                    }}
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Screen Content (Awake) */}
          <motion.div 
            className="absolute inset-0 flex flex-col items-center justify-center bg-black"
            initial={{ opacity: 0 }}
            animate={{ opacity: phase >= 3 ? 1 : 0 }}
            transition={{ duration: 0.8 }}
          >
            {/* Minimalist Premium Logo */}
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, filter: "blur(10px)" }}
              animate={phase >= 3 ? { scale: 1, opacity: 1, filter: "blur(0px)" } : {}}
              transition={{ delay: 0.3, duration: 1.5, ease: "easeOut" }}
              className="flex items-center gap-2"
            >
               <span className="font-display font-800 text-3xl tracking-widest text-white">ZYPHOR</span>
            </motion.div>
          </motion.div>

        </div>
      </motion.div>

    </div>
  );
}
