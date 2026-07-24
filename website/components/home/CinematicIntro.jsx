"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function CinematicIntro({ onComplete }) {
  const [show, setShow] = useState(true);

  useEffect(() => {
    // Check if we've already played the intro this session
    const hasPlayed = sessionStorage.getItem("zyphorIntroPlayed");
    if (hasPlayed) {
      setShow(false);
      onComplete?.();
      return;
    }

    // Play intro for 4.5 seconds, then unmount and notify parent
    const timer = setTimeout(() => {
      setShow(false);
      sessionStorage.setItem("zyphorIntroPlayed", "true");
      onComplete?.();
    }, 4500);

    return () => clearTimeout(timer);
  }, [onComplete]);

  if (!show) return null;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="intro-overlay"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.8, ease: "easeInOut" } }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#030303] overflow-hidden"
          style={{ perspective: "1000px" }}
        >
          {/* Ambient Background Glow */}
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: [0, 0.15, 0.3, 0], scale: [0.5, 1, 1.5, 2] }}
            transition={{ duration: 4.5, ease: "easeOut" }}
            className="absolute inset-0 pointer-events-none"
            style={{ background: "radial-gradient(circle, rgba(0,255,102,0.15) 0%, transparent 70%)" }}
          />

          {/* Cinematic Container scaling up at the end */}
          <motion.div
            initial={{ scale: 1, z: 0 }}
            animate={{ scale: [1, 1, 1, 40], opacity: [1, 1, 1, 0] }}
            transition={{ duration: 4.5, times: [0, 0.7, 0.85, 1], ease: [0.7, 0, 0.3, 1] }}
            className="relative flex items-center justify-center w-full h-full"
            style={{ transformStyle: "preserve-3d" }}
          >
            {/* The Smartphone Mockup */}
            <motion.div
              initial={{ opacity: 0, y: 50, rotateX: 20 }}
              animate={{ opacity: 1, y: 0, rotateX: 0 }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="relative w-[280px] h-[580px] rounded-[40px] border-[6px] border-[#1a1a1a] bg-black shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden"
            >
              {/* Inner bezel */}
              <div className="absolute inset-0 rounded-[34px] border border-white/5 pointer-events-none z-10" />

              {/* Dynamic Cracks SVG */}
              <svg
                className="absolute inset-0 w-full h-full z-0 opacity-80"
                viewBox="0 0 280 580"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Crack Path */}
                <motion.path
                  d="M 50 100 L 120 180 L 90 250 L 200 350 L 150 480 M 120 180 L 250 150 M 90 250 L 20 300"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  initial={{ pathLength: 0, stroke: "#ff4444" }}
                  animate={{
                    pathLength: [0, 1, 1, 0],
                    stroke: ["#ff4444", "#ff4444", "#00FF66", "#00FF66"],
                    filter: ["drop-shadow(0 0 2px #ff4444)", "drop-shadow(0 0 8px #ff4444)", "drop-shadow(0 0 15px #00FF66)", "drop-shadow(0 0 0px #00FF66)"],
                    opacity: [1, 1, 1, 0]
                  }}
                  transition={{ duration: 3, times: [0, 0.3, 0.6, 1], ease: "easeInOut" }}
                />
              </svg>

              {/* AI Scanner Line */}
              <motion.div
                initial={{ top: "-10%" }}
                animate={{ top: "110%" }}
                transition={{ duration: 1.5, delay: 1.2, ease: "linear" }}
                className="absolute left-0 right-0 h-[3px] bg-signal-green shadow-[0_0_25px_6px_rgba(0,255,102,0.9)] z-20"
              />

              {/* Phone Screen AI UI Reveal */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 2 }}
                className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-[#030303] to-[#0a1510] z-10"
              >
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 2.2, type: "spring" }}
                  className="w-16 h-16 rounded-full border-2 border-signal-green flex items-center justify-center mb-4 bg-signal-green/10 shadow-[0_0_40px_rgba(0,255,102,0.5)]"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#00FF66" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                </motion.div>
                <div className="font-mono text-signal-green text-xs tracking-widest font-bold drop-shadow-[0_0_10px_rgba(0,255,102,0.8)]">VERIFIED</div>
              </motion.div>
            </motion.div>
          </motion.div>

          {/* Flash Typography Overlays */}
          <div className="absolute inset-0 flex items-center justify-center z-50 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: [0, 1, 1, 0], scale: [0.8, 1, 1.05, 1.2] }}
              transition={{ duration: 1, delay: 2.5, times: [0, 0.2, 0.8, 1] }}
              className="absolute font-display font-900 text-4xl sm:text-6xl md:text-8xl text-white tracking-tighter"
            >
              AI SCANNED.
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: [0, 1, 1, 0], scale: [0.8, 1, 1.05, 1.2] }}
              transition={{ duration: 0.8, delay: 3.3, times: [0, 0.2, 0.8, 1] }}
              className="absolute font-display font-900 text-5xl sm:text-7xl md:text-9xl text-signal-green tracking-tighter drop-shadow-[0_0_40px_rgba(0,255,102,0.6)]"
            >
              ZYPHOR
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
