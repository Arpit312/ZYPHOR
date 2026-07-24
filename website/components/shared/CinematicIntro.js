"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ScanLine } from "lucide-react";

export default function CinematicIntro({ onComplete }) {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    // 4.5s FAST, CINEMATIC, 144Hz OPTIMIZED HUD PACING
    const t1 = setTimeout(() => setPhase(1), 200);   // 0.2s: Analyzing appears
    const t2 = setTimeout(() => setPhase(2), 1600);  // 1.6s: Verified snap
    const t3 = setTimeout(() => setPhase(3), 2800);  // 2.8s: ZYPHOR Logo reveal
    const t4 = setTimeout(() => setPhase(4), 3800);  // 3.8s: Cinematic Fade Out
    const t5 = setTimeout(() => {
      onComplete(); // 4.5s: Complete & unmount (plays EVERY TIME on reload)
    }, 4500); 

    return () => [t1, t2, t3, t4, t5].forEach(clearTimeout);
  }, [onComplete]);

  return (
    <motion.div 
      key="intro-container"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.5 } }}
      animate={{ opacity: phase === 4 ? 0 : 1 }}
      transition={{ duration: 0.7, ease: "easeInOut" }}
      className="fixed inset-0 z-[9999] bg-[#020202] overflow-hidden flex flex-col items-center justify-center"
    >
      {/* Ambient Deep Glow */}
      <motion.div 
        className="absolute inset-0 pointer-events-none"
        animate={{
          background: phase === 2 
            ? "radial-gradient(circle at center, rgba(0,255,102,0.15) 0%, transparent 70%)" 
            : phase === 3
            ? "radial-gradient(circle at center, rgba(255,255,255,0.08) 0%, transparent 70%)"
            : "radial-gradient(circle at center, rgba(0,255,102,0.03) 0%, transparent 70%)"
        }}
        transition={{ duration: 0.8 }}
      />

      <div className="relative z-10 flex flex-col items-center justify-center w-full px-4">
        <AnimatePresence mode="wait">
          
          {/* PHASE 1 & 2: THE SCANNER HUD */}
          {phase >= 1 && phase < 3 && (
            <motion.div
              key="hud"
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1, filter: "blur(10px)" }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="flex flex-col items-center gap-6"
            >
              {/* Animated Icon */}
              <motion.div
                animate={
                  phase === 1 
                  ? { scale: [1, 1.1, 1], opacity: [0.5, 1, 0.5] } 
                  : { scale: 1.2, opacity: 1, rotate: [0, 360] }
                }
                transition={
                  phase === 1 
                  ? { duration: 1, repeat: Infinity }
                  : { duration: 0.6, ease: "easeOut" }
                }
                className={`p-4 rounded-full border ${phase === 2 ? 'border-signal-green bg-signal-green/10 shadow-[0_0_40px_rgba(0,255,102,0.4)]' : 'border-white/10 bg-white/5'}`}
              >
                <ScanLine className={`w-8 h-8 ${phase === 2 ? 'text-signal-green' : 'text-white/60'}`} />
              </motion.div>

              {/* Monospace Text */}
              <div className="h-8 flex items-center justify-center">
                {phase === 1 ? (
                  <motion.p 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="font-mono text-xs sm:text-sm tracking-[0.3em] text-white/60 uppercase text-center"
                  >
                    [ ANALYZING DEVICE INTEGRITY... ]
                  </motion.p>
                ) : (
                  <motion.p 
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="font-mono text-sm sm:text-base tracking-[0.4em] font-bold text-signal-green uppercase text-center drop-shadow-[0_0_10px_rgba(0,255,102,0.8)]"
                  >
                    [ AI VERIFIED ]
                  </motion.p>
                )}
              </div>
            </motion.div>
          )}

          {/* PHASE 3: BRAND REVEAL */}
          {phase >= 3 && (
            <motion.div
              key="brand"
              initial={{ opacity: 0, scale: 0.8, filter: "blur(20px)" }}
              animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="absolute inset-0 flex items-center justify-center w-full px-4"
            >
              {/* Responsive Text ensuring it NEVER breaks mobile screen bounds */}
              <h1 
                className="font-display font-900 text-white tracking-tighter text-center"
                style={{ 
                  fontSize: "clamp(3rem, 15vw, 10rem)", // Scales perfectly from small mobile to huge desktop
                  lineHeight: 1,
                  textShadow: "0 0 60px rgba(255,255,255,0.4)"
                }}
              >
                ZYPHOR
              </h1>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* Sweeping Light Effect during Verification */}
      <AnimatePresence>
        {phase === 2 && (
          <motion.div
            initial={{ top: "-20%", opacity: 0 }}
            animate={{ top: "120%", opacity: [0, 1, 1, 0] }}
            transition={{ duration: 1.0, ease: "linear" }}
            className="absolute left-0 right-0 h-[2px] bg-signal-green shadow-[0_0_50px_20px_rgba(0,255,102,0.4)] pointer-events-none"
          />
        )}
      </AnimatePresence>

    </motion.div>
  );
}
