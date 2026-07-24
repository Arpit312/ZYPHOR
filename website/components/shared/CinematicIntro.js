"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

/* ─────────────────────────────────────────────────────
   CINEMATIC INTRO — ZYPHOR  
   Theme: ink (#0B1220), coral (#FF5A3C), white
   
   Flow:
   0. Ink background (instant)
   1. Background fades in + phone slides onto table (0.5s)
   2. Phone lifts majestically to center (1.8s)
   3. Coral scan line heals the cracks (3.0s)
   4. "Welcome to" + "ZYPHOR" inside screen (4.2s)
   5. Zoom into screen → website (5.2s)
   Done at 5.8s
───────────────────────────────────────────────────── */

// Pre-calculated floating particles
const PARTICLES = Array.from({ length: 18 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: 2 + Math.random() * 3,
  dur: 3 + Math.random() * 4,
  del: Math.random() * 2,
  isCoral: i % 3 === 0,
}));

export default function CinematicIntro({ onComplete }) {
  const [phase, setPhase] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 500);
    const t2 = setTimeout(() => setPhase(2), 1800);
    const t3 = setTimeout(() => setPhase(3), 3000);
    const t4 = setTimeout(() => setPhase(4), 4200);
    const t5 = setTimeout(() => setPhase(5), 5200);
    const t6 = setTimeout(() => setDone(true), 5800);
    return () => [t1, t2, t3, t4, t5, t6].forEach(clearTimeout);
  }, []);

  useEffect(() => {
    if (done) onComplete();
  }, [done, onComplete]);

  return (
    <motion.div
      key="cinematic-root"
      initial={{ opacity: 1 }}
      animate={{ opacity: phase === 5 ? 0 : 1 }}
      transition={{ duration: phase === 5 ? 0.6 : 0.3 }}
      className="fixed inset-0 z-[9999] overflow-hidden"
      style={{ background: "#0B1220" }}
    >

      {/* ═══════════════════════════════════════
          LAYER 1: ANIMATED BACKGROUND
      ═══════════════════════════════════════ */}
      <motion.div
        className="absolute inset-0"
        initial={{ opacity: 0, scale: 1 }}
        animate={{ 
          opacity: phase >= 1 ? 1 : 0,
          scale: phase >= 1 ? 1.06 : 1,
        }}
        transition={{ 
          opacity: { duration: 1, ease: "easeOut" }, 
          scale: { duration: 6, ease: "linear" } 
        }}
      >
        {/* Repair table photo */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: "url('/images/repair_table_bg.png')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            filter: "brightness(0.4) saturate(0.85)",
          }}
        />

        {/* Vignette */}
        <div
          className="absolute inset-0"
          style={{ background: "radial-gradient(ellipse at center, transparent 25%, #0B1220 75%)" }}
        />

        {/* ZYPHOR watermark on table */}
        <div className="absolute inset-0 flex items-center justify-center select-none pointer-events-none">
          <motion.span
            className="font-display font-900 text-white whitespace-nowrap"
            style={{ fontSize: "clamp(6rem, 22vw, 18rem)", letterSpacing: "0.25em" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.04 }}
            transition={{ duration: 2, delay: 1 }}
          />
        </div>

        {/* ── FLOATING PARTICLES ── */}
        {PARTICLES.map((p) => (
          <motion.div
            key={p.id}
            className="absolute rounded-full pointer-events-none"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: p.size,
              height: p.size,
              background: p.isCoral ? "#FF5A3C" : "rgba(255,255,255,0.5)",
            }}
            animate={{ y: [0, -25, 0], opacity: [0, 0.6, 0] }}
            transition={{ duration: p.dur, delay: p.del, repeat: Infinity, ease: "easeInOut" }}
          />
        ))}

        {/* ── AMBIENT LIGHT SWEEP ── */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          animate={{
            background: [
              "linear-gradient(120deg, transparent 0%, rgba(255,90,60,0.04) 40%, transparent 80%)",
              "linear-gradient(120deg, transparent 20%, rgba(255,90,60,0.07) 60%, transparent 100%)",
              "linear-gradient(120deg, transparent 0%, rgba(255,90,60,0.04) 40%, transparent 80%)",
            ],
          }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.div>

      {/* ═══════════════════════════════════════
          LAYER 2: THE SMARTPHONE
      ═══════════════════════════════════════ */}
      <div className="absolute inset-0 flex items-center justify-center" style={{ perspective: "1200px" }}>
        <motion.div
          style={{ transformStyle: "preserve-3d", willChange: "transform, opacity" }}
          initial={{ opacity: 0, y: 200, rotateX: 55, rotateZ: 20, scale: 0.45 }}
          animate={
            phase === 0
              ? { opacity: 0, y: 200, rotateX: 55, rotateZ: 20, scale: 0.45 }
              : phase === 1
              ? { opacity: 1, y: 100, rotateX: 55, rotateZ: 20, scale: 0.45 }
              : phase === 2
              ? { opacity: 1, y: 0, rotateX: 0, rotateZ: 0, scale: 1 }
              : phase <= 4
              ? { opacity: 1, y: 0, rotateX: 0, rotateZ: 0, scale: 1 }
              : { opacity: 0, y: 0, rotateX: 0, rotateZ: 0, scale: 12 }
          }
          transition={
            phase === 1
              ? { duration: 0.8, ease: "easeOut" }
              : phase === 2
              ? { type: "spring", stiffness: 55, damping: 18, mass: 1 }
              : phase === 5
              ? { duration: 0.6, ease: [0.76, 0, 0.24, 1] }
              : { duration: 0.5, ease: "easeOut" }
          }
        >
          {/* Phone body */}
          <div
            className="relative rounded-[42px] overflow-hidden"
            style={{
              width: 270,
              height: 580,
              background: "#0e0e0e",
              boxShadow:
                phase >= 3
                  ? "0 0 60px 8px rgba(255,90,60,0.3), 0 30px 80px rgba(0,0,0,0.8)"
                  : phase >= 2
                  ? "0 30px 80px rgba(0,0,0,0.9), 0 0 40px rgba(255,90,60,0.1)"
                  : "0 40px 60px rgba(0,0,0,0.95)",
              transition: "box-shadow 0.8s ease",
            }}
          >
            {/* Bezel */}
            <div className="absolute inset-0 rounded-[42px] border-[3px] border-[#252525] pointer-events-none z-50" />
            {/* Buttons */}
            <div className="absolute -left-[3px] top-[85px]  w-[3px] h-[20px] bg-[#2a2a2a] rounded-l-sm z-50" />
            <div className="absolute -left-[3px] top-[120px] w-[3px] h-[40px] bg-[#2a2a2a] rounded-l-sm z-50" />
            <div className="absolute -right-[3px] top-[140px] w-[3px] h-[55px] bg-[#2a2a2a] rounded-r-sm z-50" />

            {/* ═══ SCREEN ═══ */}
            <div className="absolute inset-[5px] rounded-[37px] overflow-hidden bg-black relative">

              {/* Camera island */}
              <div className="absolute top-[10px] left-1/2 -translate-x-1/2 w-[50px] h-[18px] bg-[#0a0a0a] rounded-full z-40 flex items-center justify-center gap-2 border border-[#1a1a1a]">
                <div className="w-[6px] h-[6px] rounded-full bg-[#111] border border-[#2a2a2a]" />
                <div className="w-[3px] h-[3px] rounded-full bg-[#111] shadow-[inset_0_0_2px_rgba(255,90,60,0.4)]" />
              </div>

              {/* CRACKED GLASS */}
              <AnimatePresence>
                {phase >= 1 && phase < 4 && (
                  <motion.div
                    className="absolute inset-0 z-30"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: phase >= 3 ? 0.8 : 0.4 }}
                  >
                    <div
                      className="absolute inset-0"
                      style={{
                        backgroundImage: "url('/images/shattered_glass.png')",
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        mixBlendMode: "screen",
                        opacity: 0.8,
                      }}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* BROKEN SCREEN GLITCH */}
              {phase >= 1 && phase < 3 && (
                <motion.div
                  className="absolute inset-0 z-10"
                  animate={{ opacity: [0, 0.2, 0, 0.35, 0, 0.15] }}
                  transition={{ duration: 0.4, repeat: Infinity }}
                  style={{
                    background: "linear-gradient(180deg, transparent 15%, rgba(255,90,60,0.12) 50%, transparent 85%)",
                  }}
                />
              )}

              {/* HEALING SCAN LINE */}
              {phase === 3 && (
                <motion.div
                  className="absolute left-0 right-0 z-40 pointer-events-none"
                  style={{
                    height: 3,
                    background: "#FF5A3C",
                    boxShadow: "0 0 20px 8px rgba(255,90,60,0.6), 0 0 60px 20px rgba(255,90,60,0.25)",
                  }}
                  initial={{ top: "-5%" }}
                  animate={{ top: "105%" }}
                  transition={{ duration: 1.1, ease: "easeInOut" }}
                />
              )}

              {/* CLEAN HEALED SCREEN */}
              {phase >= 4 && (
                <motion.div
                  className="absolute inset-0 bg-black z-20"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.4 }}
                />
              )}

              {/* ZYPHOR LOGO INSIDE SCREEN */}
              {phase === 4 && (
                <motion.div
                  className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.4 }}
                >
                  <div
                    className="absolute inset-0 pointer-events-none"
                    style={{ background: "radial-gradient(ellipse at center, rgba(255,90,60,0.1) 0%, transparent 65%)" }}
                  />
                  <motion.span
                    className="font-mono text-[10px] tracking-[0.35em] text-white/40 uppercase"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1, duration: 0.4 }}
                  >
                    Welcome to
                  </motion.span>
                  <motion.span
                    className="font-display font-900 text-white"
                    style={{
                      fontSize: "2.6rem",
                      letterSpacing: "0.15em",
                      textShadow: "0 0 25px rgba(255,90,60,0.5), 0 0 50px rgba(255,90,60,0.15)",
                    }}
                    initial={{ opacity: 0, scale: 0.85 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2, duration: 0.5, ease: "easeOut" }}
                  >
                    ZYPHOR
                  </motion.span>
                  <motion.span
                    className="font-mono text-[8px] tracking-[0.15em] text-white/25 uppercase"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.45, duration: 0.4 }}
                  >
                    AI-Verified Marketplace
                  </motion.span>
                </motion.div>
              )}

            </div>
          </div>
        </motion.div>
      </div>

      {/* ═══════════════════════════════════════
          LAYER 3: BOTTOM STATUS
      ═══════════════════════════════════════ */}
      <AnimatePresence mode="wait">
        {phase >= 1 && phase <= 3 && (
          <motion.div
            key={phase <= 2 ? "detect" : "repair"}
            className="absolute bottom-8 left-0 right-0 flex justify-center z-20"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.3 }}
          >
            <span className="font-mono text-[10px] tracking-[0.3em] uppercase" style={{ color: "rgba(255,90,60,0.5)" }}>
              {phase <= 2 ? "● Detecting damage..." : "● Repairing device..."}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

    </motion.div>
  );
}
