"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function CinematicIntro({ onComplete }) {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    // 5.5s PHOTOREALISTIC CINEMATIC REPAIR SEQUENCE
    const t1 = setTimeout(() => setPhase(1), 500);   // 0.5s: Lift from repair table
    const t2 = setTimeout(() => setPhase(2), 1600);  // 1.6s: AI Energy Beam Heals Cracks
    const t3 = setTimeout(() => setPhase(3), 3200);  // 3.2s: "WELCOME" inside screen
    const t4 = setTimeout(() => setPhase(4), 4000);  // 4.0s: "ZYPHOR" inside screen
    const t5 = setTimeout(() => setPhase(5), 5000);  // 5.0s: Zoom into the screen to reveal site
    const t6 = setTimeout(() => {
      onComplete(); // 5.7s: Complete
    }, 5700);

    return () => [t1, t2, t3, t4, t5, t6].forEach(clearTimeout);
  }, [onComplete]);

  // Phone Animation Variants
  const phoneVariants = {
    table: { 
      y: "30%", 
      rotateX: 55, 
      rotateY: 0,
      rotateZ: 25, 
      scale: 0.6, 
      opacity: 0,
      boxShadow: "0 50px 100px rgba(0,0,0,0.9)"
    },
    lift: { 
      y: "0%", 
      rotateX: 0, 
      rotateZ: 0, 
      scale: 1, 
      opacity: 1,
      boxShadow: "0 30px 100px rgba(14,165,233,0.4)",
      transition: { type: "spring", stiffness: 60, damping: 25, mass: 1, duration: 1.2 } 
    },
    heal: { 
      y: "0%", rotateX: 0, rotateZ: 0, scale: 1, opacity: 1,
      boxShadow: "0 0 150px rgba(14,165,233,0.8)", // massive blue glow when healing
      transition: { duration: 0.8 }
    },
    text: { 
      y: "0%", rotateX: 0, rotateZ: 0, scale: 1, opacity: 1,
      boxShadow: "0 30px 100px rgba(14,165,233,0.2)"
    },
    expand: {
      scale: 50, // Massive Camera Dive INTO the phone screen
      opacity: 0,
      transition: { duration: 0.8, ease: [0.7, 0, 0.3, 1] } 
    }
  };

  return (
    <motion.div 
      key="intro-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.7 } }}
      className="fixed inset-0 z-[9999] bg-[#020202] overflow-hidden flex items-center justify-center perspective-[1500px]"
    >
      {/* ==================================================== */}
      {/* PHOTOREALISTIC REPAIR TABLE BACKGROUND                 */}
      {/* ==================================================== */}
      <motion.div 
        className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none"
        animate={{ 
          opacity: phase >= 5 ? 0 : 1,
          scale: phase >= 1 ? 1.05 : 1 // Slow cinematic zoom in on background
        }}
        transition={{ scale: { duration: 5, ease: "linear" }, opacity: { duration: 0.5 } }}
      >
        <div 
          className="absolute inset-0 bg-[url('/images/repair_table_bg.png')] bg-cover bg-center"
          style={{ filter: "brightness(0.6) contrast(1.2)" }}
        />
        {/* Subtle Dark Overlay to make phone pop */}
        <div className="absolute inset-0 bg-black/40" />
      </motion.div>

      {/* ==================================================== */}
      {/* THE SMARTPHONE CHASSIS                                 */}
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
        {/* Chassis */}
        <div className="absolute inset-0 rounded-[44px] bg-[#0A0A0A] shadow-[inset_0_0_0_2px_#333,0_0_0_1px_#000] overflow-visible">
          
          {/* Hardware Buttons */}
          <div className="absolute -left-[2px] top-[100px] w-[2px] h-[25px] bg-[#444] rounded-l-sm" /> 
          <div className="absolute -left-[2px] top-[140px] w-[2px] h-[50px] bg-[#444] rounded-l-sm" /> 
          <div className="absolute -right-[2px] top-[160px] w-[2px] h-[70px] bg-[#444] rounded-r-sm" /> 

          {/* ==================================================== */}
          {/* THE SCREEN (Where the magic happens)                   */}
          {/* ==================================================== */}
          <div className="absolute inset-[3px] rounded-[41px] bg-[#020202] overflow-hidden shadow-[inset_0_0_30px_rgba(0,0,0,1)] flex flex-col items-center justify-center relative">
            
            {/* Camera Hole */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 w-[14px] h-[14px] bg-black rounded-full z-50 border border-white/10 flex items-center justify-center shadow-[0_2px_10px_rgba(0,0,0,0.5)]">
               <div className="w-1.5 h-1.5 rounded-full bg-blue-900 shadow-[0_0_4px_#0ea5e9]"></div>
            </div>

            {/* Glowing Screen Base (Fades when healed) */}
            <motion.div 
              className="absolute inset-0 z-10 opacity-30"
              animate={{ opacity: phase >= 2 ? 0 : [0.1, 0.4, 0.1, 0.5, 0.2] }}
              transition={{ duration: 0.3, repeat: phase >= 2 ? 0 : Infinity }}
              style={{ background: "radial-gradient(ellipse at center, rgba(14,165,233,0.3) 0%, transparent 80%)" }}
            />

            {/* PHOTOREALISTIC SHATTERED GLASS OVERLAY */}
            <AnimatePresence>
              {phase < 3 && (
                <motion.div 
                  className="absolute inset-0 z-20 pointer-events-none"
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1.0, ease: "easeOut" }}
                >
                  <div 
                    className="w-full h-full bg-[url('/images/shattered_glass.png')] bg-cover bg-center"
                    style={{ 
                      mixBlendMode: "screen", 
                      filter: "contrast(1.5) brightness(1.2)" 
                    }} 
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* THE HEALING ENERGY BEAM */}
            <AnimatePresence>
              {phase === 2 && (
                <motion.div
                  initial={{ top: "-20%", opacity: 0 }}
                  animate={{ top: "120%", opacity: [0, 1, 1, 0] }}
                  transition={{ duration: 1.5, ease: "easeInOut" }}
                  className="absolute left-0 right-0 h-[8px] bg-[#0ea5e9] z-30 pointer-events-none"
                  style={{
                    boxShadow: "0 0 40px 20px rgba(14,165,233,0.8), 0 0 100px 40px rgba(255,255,255,0.4)"
                  }}
                />
              )}
            </AnimatePresence>

            {/* ==================================================== */}
            {/* INSIDE-SCREEN TYPOGRAPHY REVEAL                        */}
            {/* ==================================================== */}
            <AnimatePresence mode="wait">
              {phase === 3 && (
                <motion.div
                  key="welcome-inner"
                  initial={{ opacity: 0, scale: 0.9, filter: "blur(10px)" }}
                  animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                  exit={{ opacity: 0, scale: 1.1, filter: "blur(10px)" }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                  className="absolute z-40 font-mono font-bold tracking-[0.3em] text-white/90 text-sm drop-shadow-[0_0_15px_rgba(255,255,255,0.8)]"
                >
                  WELCOME
                </motion.div>
              )}
              {phase >= 4 && (
                <motion.div
                  key="zyphor-inner"
                  initial={{ opacity: 0, scale: 0.7, filter: "blur(15px)" }}
                  animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="absolute z-40 font-display font-900 text-white w-full text-center"
                  style={{ 
                    fontSize: "3.5rem",
                    letterSpacing: "0.1em",
                    textShadow: "0 0 30px rgba(14,165,233,0.9), 0 0 60px rgba(255,255,255,0.5)",
                    willChange: "transform, opacity" 
                  }}
                >
                  ZYPHOR
                </motion.div>
              )}
            </AnimatePresence>

            {/* Screen Inner Glow during Logo Reveal */}
            <AnimatePresence>
              {phase >= 4 && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(14,165,233,0.3)_0%,transparent_80%)] pointer-events-none z-20"
                />
              )}
            </AnimatePresence>

          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
