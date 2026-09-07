"use client";
import { useEffect, useState } from "react";

const preferenceKey = "bao.background-motion";

// The same preference follows you from the homepage into the observatory.
export function useBackgroundMotion() {
  const [moving, setMoving] = useState(false);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    function restore() {
      let saved: string | null = null;
      try {
        saved = localStorage.getItem(preferenceKey);
      } catch {
        /* Storage is optional. */
      }
      setMoving(saved === "on" || (saved !== "off" && !reduced.matches));
    }
    restore();
    reduced.addEventListener("change", restore);
    return () => reduced.removeEventListener("change", restore);
  }, []);

  function toggleMotion() {
    const next = !moving;
    setMoving(next);
    try {
      localStorage.setItem(preferenceKey, next ? "on" : "off");
    } catch {
      /* The control still works without storage. */
    }
  }

  return { moving, toggleMotion };
}
