"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export default function TopProgressBar() {
  const pathname = usePathname();
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);

  // Complete progress on pathname change
  useEffect(() => {
    if (visible) {
      setProgress(100);
      const timer = setTimeout(() => {
        setVisible(false);
        setProgress(0);
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [pathname]);

  // Intercept internal link clicks for instant visual feedback
  useEffect(() => {
    const handleAnchorClick = (e) => {
      const anchor = e.target.closest("a");
      if (!anchor) return;
      const href = anchor.getAttribute("href");
      if (
        href &&
        href.startsWith("/") &&
        !href.startsWith("#") &&
        !anchor.getAttribute("target") &&
        !e.ctrlKey &&
        !e.metaKey &&
        !e.shiftKey &&
        !e.altKey
      ) {
        if (href !== window.location.pathname) {
          setVisible(true);
          setProgress(25);
          setTimeout(() => setProgress(65), 60);
          setTimeout(() => setProgress(85), 200);
        }
      }
    };

    document.addEventListener("click", handleAnchorClick, { capture: true });
    return () => {
      document.removeEventListener("click", handleAnchorClick, { capture: true });
    };
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed top-0 left-0 right-0 h-[2.5px] z-[9999] pointer-events-none">
      <div
        className="h-full bg-gradient-to-r from-coral via-amber-400 to-coral shadow-[0_0_8px_rgba(255,90,60,0.6)] transition-all ease-out duration-150"
        style={{
          width: `${progress}%`,
          opacity: visible ? 1 : 0,
        }}
      />
    </div>
  );
}
