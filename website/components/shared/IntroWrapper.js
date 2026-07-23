"use client";
import { useState, useEffect } from "react";
import CinematicIntro from "./CinematicIntro";

export default function IntroWrapper() {
  const [showIntro, setShowIntro] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const hasSeenIntro = sessionStorage.getItem("zyphor_intro_seen");
    if (!hasSeenIntro) {
      setShowIntro(true);
    }
  }, []);

  const handleComplete = () => {
    sessionStorage.setItem("zyphor_intro_seen", "true");
    setShowIntro(false);
  };

  if (!mounted) return null;
  if (!showIntro) return null;

  return <CinematicIntro onComplete={handleComplete} />;
}
