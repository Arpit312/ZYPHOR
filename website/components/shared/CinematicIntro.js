"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

/* ─────────────────────────────────────────────────────
   CINEMATIC INTRO — ZYPHOR (Pitch Black Premium Edition)
   Background: Pure Pitch Black (#000000)
   Flow: 
   0. Pitch Black Void
   1. Broken phone enters in 3D perspective
   2. Phone aligns to center
   3. Neon Laser Scan heals shattered screen
   4. High-contrast ZYPHOR logo illuminates INSIDE screen
   5. Smooth camera dive into screen -> Reveals Homepage
───────────────────────────────────────────────────── */

const SPARKS = Array.from({ length: 24 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: 1.5 + Math.random() * 2.5,
  dur: 2 + Math.random() * 3,
  del: Math.random() * 2,
}));

export default function CinematicIntro({ onComplete }) {
  const [phase, setPhase] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 300);   // Phone enters
    const t2 = setTimeout(() => setPhase(2), 1500);  // Align to center
    const t3 = setTimeout(() => setPhase(3), 2700);  // Laser scan & heal
    const t4 = setTimeout(() => setPhase(4), 3900);  // ZYPHOR inside screen
    const t5 = setTimeout(() => setPhase(5), 4900);  // Zoom into screen
    const t6 = setTimeout(() => setDone(true), 5500); // Complete
    return () => [t1, t2, t3, t4, t5, t6].forEach(clearTimeout);
  }, []);

  useEffect(() => {
    if (done) onComplete();
  }, [done, onComplete]);

  return (
    <motion.div
      key="cinematic-root-black"
      initial={{ opacity: 1 }}
      animate={{ opacity: phase === 5 ? 0 : 1 }}
      transition={{ duration: phase === 5 ? 0.6 : 0.3 }}
      className="fixed inset-0 z-[9999] overflow-hidden bg-black flex items-center justify-center"
      style={{ background: "#000000" }}
    >
      {/* ═══════════════════════════════════════
          BACKGROUND: PITCH BLACK WITH AMBIENT PARTICLES
      ═══════════════════════════════════════ */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Subtle grid background pattern */}
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: "linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)",
            backgroundSize: "40px 40px"
          }}
        />

        {/* Ambient Dark Radial Glow */}
        <motion.div 
          className="absolute inset-0"
          animate={{
            background: phase >= 3
              ? "radial-gradient(circle at center, rgba(255,90,60,0.12) 0%, transparent 70%)"
              : "radial-gradient(circle at center, rgba(255,255,255,0.03) 0%, transparent 70%)"
          }}
          transition={{ duration: 1 }}
        />

        {/* Floating Sparks */}
        {SPARKS.map((s) => (
          <motion.div
            key={s.id}
            className="absolute rounded-full"
            style={{
              left: `${s.x}%`,
              top: `${s.y}%`,
              width: s.size,
              height: s.size,
              background: s.id % 2 === 0 ? "#FF5A3C" : "#ffffff",
              boxShadow: s.id % 2 === 0 ? "0 0 6px #FF5A3C" : "0 0 4px #ffffff",
            }}
            animate={{ y: [0, -30, 0], opacity: [0, 0.8, 0] }}
            transition={{ duration: s.dur, delay: s.del, repeat: Infinity, ease: "easeInOut" }}
          />
        ))}
      </div>

      {/* ═══════════════════════════════════════
          SMARTPHONE IN 3D SPACE
      ═══════════════════════════════════════ */}
      <div className="relative z-10 flex items-center justify-center" style={{ perspective: "1400px" }}>
        <motion.div
          style={{ transformStyle: "preserve-3d", willChange: "transform, opacity" }}
          initial={{ opacity: 0, y: 150, rotateX: 45, rotateZ: -15, scale: 0.5 }}
          animate={
            phase === 0
              ? { opacity: 0, y: 150, rotateX: 45, rotateZ: -15, scale: 0.5 }
              : phase === 1
              ? { opacity: 1, y: 60, rotateX: 30, rotateZ: -8, scale: 0.75 }
              : phase === 2
              ? { opacity: 1, y: 0, rotateX: 0, rotateZ: 0, scale: 1 }
              : phase <= 4
              ? { opacity: 1, y: 0, rotateX: 0, rotateZ: 0, scale: 1 }
              : { opacity: 0, y: 0, rotateX: 0, rotateZ: 0, scale: 15 }
          }
          transition={
            phase === 1
              ? { duration: 0.8, ease: "easeOut" }
              : phase === 2
              ? { type: "spring", stiffness: 60, damping: 20, mass: 1 }
              : phase === 5
              ? { duration: 0.6, ease: [0.7, 0, 0.3, 1] }
              : { duration: 0.5, ease: "easeOut" }
          }
        >
          {/* Phone Outer Frame */}
          <div
            className="relative rounded-[44px] p-[3px] bg-gradient-to-b from-white/20 via-white/5 to-white/10"
            style={{
              width: 280,
              height: 590,
              boxShadow: phase >= 3
                ? "0 0 50px 10px rgba(255,90,60,0.35), 0 20px 60px rgba(0,0,0,0.9)"
                : "0 20px 50px rgba(0,0,0,0.95)",
              transition: "box-shadow 0.8s ease"
            }}
          >
            {/* Phone Buttons */}
            <div className="absolute -left-[3px] top-[90px] w-[3px] h-[22px] bg-white/20 rounded-l-sm z-50" />
            <div className="absolute -left-[3px] top-[125px] w-[3px] h-[45px] bg-white/20 rounded-l-sm z-50" />
            <div className="absolute -right-[3px] top-[145px] w-[3px] h-[60px] bg-white/20 rounded-r-sm z-50" />

            {/* Inner Phone Screen Container */}
            <div className="w-full h-full rounded-[41px] bg-black overflow-hidden relative flex flex-col items-center justify-center border border-white/10">
              
              {/* Camera Notch / Dynamic Island */}
              <div className="absolute top-[12px] left-1/2 -translate-x-1/2 w-[60px] h-[18px] bg-black rounded-full z-50 border border-white/10 flex items-center justify-center gap-2 shadow-inner">
                <div className="w-[6px] h-[6px] rounded-full bg-slate-900 border border-white/20" />
                <div className="w-[3px] h-[3px] rounded-full bg-coral/80" />
              </div>

              {/* BROKEN SHATTERED GLASS LAYER */}
              <AnimatePresence>
                {phase >= 1 && phase < 4 && (
                  <motion.div
                    className="absolute inset-0 z-30 pointer-events-none"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: phase >= 3 ? 0.7 : 0.3 }}
                  >
                    <div
                      className="w-full h-full bg-[url('/images/shattered_glass.png')] bg-cover bg-center"
                      style={{
                        mixBlendMode: "screen",
                        filter: "contrast(1.4) brightness(1.1)",
                        opacity: 0.85
                      }}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* SCREEN DAMAGE WARNING PULSE (Glitch Effect) */}
              {phase >= 1 && phase < 3 && (
                <motion.div
                  className="absolute inset-0 z-10 pointer-events-none"
                  animate={{ opacity: [0.05, 0.25, 0.05, 0.3, 0.1] }}
                  transition={{ duration: 0.35, repeat: Infinity }}
                  style={{
                    background: "radial-gradient(circle at center, rgba(255,90,60,0.2) 0%, transparent 70%)"
                  }}
                />
              )}

              {/* LASER SCAN REPAIR BEAM */}
              {phase === 3 && (
                <motion.div
                  className="absolute left-0 right-0 z-40 pointer-events-none"
                  style={{
                    height: 4,
                    background: "#FF5A3C",
                    boxShadow: "0 0 25px 10px #FF5A3C, 0 0 60px 20px rgba(255,90,60,0.5)"
                  }}
                  initial={{ top: "-5%" }}
                  animate={{ top: "105%" }}
                  transition={{ duration: 1.1, ease: "easeInOut" }}
                />
              )}

              {/* HEALED CLEAN SCREEN STATE */}
              {phase >= 4 && (
                <motion.div
                  className="absolute inset-0 bg-black z-20"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.4 }}
                />
              )}

              {/* ZYPHOR LOGO ILLUMINATING INSIDE SCREEN */}
              {phase === 4 && (
                <motion.div
                  className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-2 text-center px-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.4 }}
                >
                  <div
                    className="absolute inset-0 pointer-events-none"
                    style={{ background: "radial-gradient(ellipse at center, rgba(255,90,60,0.15) 0%, transparent 70%)" }}
                  />

                  {/* Subtitle */}
                  <motion.span
                    className="font-mono text-[10px] tracking-[0.3em] text-white/50 uppercase"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1, duration: 0.4 }}
                  >
                    Welcome to
                  </motion.span>

                  {/* Main Logo */}
                  <motion.h1
                    className="font-display font-900 text-white tracking-[0.1em]"
                    style={{
                      fontSize: "2.5rem",
                      textShadow: "0 0 30px rgba(255,90,60,0.7), 0 0 60px rgba(255,90,60,0.3)"
                    }}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2, duration: 0.5, ease: "easeOut" }}
                  >
                    ZYPHOR
                  </motion.h1>

                  {/* Badge */}
                  <motion.div
                    className="mt-1 px-3 py-1 rounded-full border border-coral/30 bg-coral/10 text-coral font-mono text-[9px] tracking-widest uppercase"
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.4 }}
                  >
                    AI-VERIFIED MARKETPLACE
                  </motion.div>
                </motion.div>
              )}

            </div>
          </div>
        </motion.div>
      </div>

      {/* ═══════════════════════════════════════
          HUD STATUS INDICATOR AT BOTTOM
      ═══════════════════════════════════════ */}
      <AnimatePresence mode="wait">
        {phase >= 1 && phase <= 3 && (
          <motion.div
            key={phase <= 2 ? "status-broken" : "status-fixing"}
            className="absolute bottom-10 left-0 right-0 flex justify-center z-20 pointer-events-none"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.3 }}
          >
            <div className="px-4 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${phase <= 2 ? 'bg-red-500 animate-ping' : 'bg-coral animate-pulse'}`} />
              <span className="font-mono text-[10px] tracking-[0.25em] text-white/70 uppercase">
                {phase <= 2 ? "SYSTEM SCAN: SCREEN DAMAGE DETECTED" : "AI REPAIR IN PROGRESS..."}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
