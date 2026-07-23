"use client";
import { useState, useEffect } from "react";
import CinematicIntro from "./CinematicIntro";

export default function IntroWrapper() {
  const [showIntro, setShowIntro] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // For testing and review, the intro will always play on refresh.
    // In production, we can re-enable sessionStorage.
  }, []);

  const handleComplete = () => {
    setShowIntro(false);
  };

  if (!mounted) return null;
  if (!showIntro) return null;

  return <CinematicIntro onComplete={handleComplete} />;
}
