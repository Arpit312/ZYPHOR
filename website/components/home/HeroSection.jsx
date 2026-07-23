"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Zap } from "lucide-react";
import { motion } from "framer-motion";
import Container from "@/components/shared/Container";

// Animated counter component for the metrics
const AnimatedCounter = ({ from, to, duration = 2 }) => {
  const [count, setCount] = useState(from);

  useEffect(() => {
    let startTime;
    let animationFrame;

    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = timestamp - startTime;
      const progressPercentage = Math.min(progress / (duration * 1000), 1);
      
      // ease-out cubic
      const easeOut = 1 - Math.pow(1 - progressPercentage, 3);
      const currentVal = from + (to - from) * easeOut;
      
      setCount(currentVal);

      if (progressPercentage < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [from, to, duration]);

  // Handle special formatting if needed
  if (to > 1000) return Math.floor(count).toLocaleString();
  return Math.floor(count);
};

export default function HeroSection() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
    },
  };

  return (
    <section className="bg-[#030303] text-white overflow-hidden relative min-h-[90vh] flex flex-col justify-center">
      {/* ─── CINEMATIC BACKGROUND ─── */}
      <div
        className="absolute inset-0 opacity-[0.05] z-10 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(to right,rgba(255,255,255,1) 1px,transparent 1px),linear-gradient(to bottom,rgba(255,255,255,1) 1px,transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />
      
      {/* Animated glowing orbs (Ambient) */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.2, 0.4, 0.2],
          x: [0, 50, 0],
          y: [0, -50, 0],
        }}
        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-coral/20 rounded-full blur-[120px] pointer-events-none z-0"
      />
      
      <motion.div
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.15, 0.3, 0.15],
          x: [0, -40, 0],
          y: [0, 40, 0],
        }}
        transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
        className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-signal-green/15 rounded-full blur-[100px] pointer-events-none z-0"
      />

      <Container className="py-20 md:py-32 relative z-20">
        <motion.div 
          className="max-w-4xl"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Eyebrow */}
          <motion.p 
            variants={itemVariants}
            className="font-mono text-[10px] xs:text-xs sm:text-sm tracking-[0.2em] sm:tracking-[0.25em] text-signal-green mb-6 uppercase flex items-center gap-2"
          >
            <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-signal-green animate-pulse shrink-0" />
            AI-VERIFIED · IMEI-SCREENED · TRUST-SCORED
          </motion.p>
          
          {/* Main Headline */}
          <motion.h1 
            variants={itemVariants}
            className="font-display font-800 text-[2.5rem] leading-[1.05] xs:text-[2.75rem] sm:text-5xl md:text-6xl lg:text-7xl tracking-tight"
          >
            Buy &amp; sell phones
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-coral to-amber-500 pb-2">
              you can actually trust.
            </span>
          </motion.h1>
          
          {/* Subtitle */}
          <motion.p 
            variants={itemVariants}
            className="mt-6 sm:mt-8 text-white/70 text-[0.95rem] xs:text-base sm:text-lg lg:text-xl max-w-2xl leading-relaxed font-light"
          >
            Every listing on ZYPHOR is checked by AI — condition graded, IMEI verified against
            India&apos;s theft blacklist, and scored before you ever see it. No more buying surprises.
          </motion.p>
          
          {/* CTA Buttons */}
          <motion.div 
            variants={itemVariants}
            className="mt-10 sm:mt-12 flex flex-col xs:flex-row gap-4"
          >
            <Link
              href="/store"
              className="relative group flex items-center justify-center gap-2 bg-coral text-white font-display font-600 px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl text-[0.95rem] sm:text-base focus-ring overflow-hidden transition-all hover:scale-[1.02] active:scale-[0.98] w-full xs:w-auto shadow-[0_0_20px_rgba(255,90,60,0.3)] hover:shadow-[0_0_30px_rgba(255,90,60,0.5)]"
            >
              <div className="absolute inset-0 bg-white/20 translate-y-[100%] group-hover:translate-y-0 transition-transform duration-300 ease-out" />
              <span className="relative z-10 flex items-center gap-2">
                Browse store <span aria-hidden>→</span>
              </span>
            </Link>
            <Link
              href="/ai-advisor"
              className="group flex items-center justify-center gap-2 bg-white/5 border border-white/15 hover:bg-white/10 hover:border-white/30 text-white transition-all font-display font-600 px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl text-[0.95rem] sm:text-base focus-ring backdrop-blur-sm hover:scale-[1.02] active:scale-[0.98] w-full xs:w-auto"
            >
              <Zap className="h-4 w-4 sm:h-5 sm:w-5 text-signal-green group-hover:animate-pulse" />
              Ask AI Advisor
            </Link>
          </motion.div>
        </motion.div>

        {/* Cinematic Trust metrics strip */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.8, ease: "easeOut" }}
          className="mt-16 md:mt-28 grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-6 bg-white/[0.03] border border-white/10 rounded-2xl p-6 sm:p-8 backdrop-blur-md relative overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.3)]"
        >
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          
          {[
            { n: 6000, suffix: "+", label: "Verified listings", isPercentage: false },
            { n: 91, suffix: "%", label: "Avg. AI trust score", isPercentage: true },
            { n: 0, prefix: "₹", suffix: "", label: "IMEI check cost", isPercentage: false },
            { n: 48, suffix: "h", label: "Avg. verification time", isPercentage: false }
          ].map(({ n, suffix, prefix, label }) => (
            <div key={label} className="flex flex-col">
              <p className="font-display font-700 text-3xl sm:text-4xl text-white flex items-baseline">
                {prefix && <span>{prefix}</span>}
                {isMounted ? <AnimatedCounter from={0} to={n} /> : n}
                {suffix && <span className="text-white/80 text-2xl sm:text-3xl ml-0.5">{suffix}</span>}
              </p>
              <p className="text-white/50 text-[10px] sm:text-xs mt-1 sm:mt-2 font-mono uppercase tracking-wider">{label}</p>
            </div>
          ))}
        </motion.div>
      </Container>
    </section>
  );
}
