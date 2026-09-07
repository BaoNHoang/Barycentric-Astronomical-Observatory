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
    const sync = (event: Event) =>
      setMoving((event as CustomEvent<boolean>).detail);
    window.addEventListener("bao-motion-change", sync);
    window.addEventListener("storage", restore);
    reduced.addEventListener("change", restore);
    return () => {
      reduced.removeEventListener("change", restore);
      window.removeEventListener("bao-motion-change", sync);
      window.removeEventListener("storage", restore);
    };
  }, []);

  function toggleMotion() {
    const next = !moving;
    setMoving(next);
    window.dispatchEvent(
      new CustomEvent("bao-motion-change", { detail: next }),
    );
    try {
      localStorage.setItem(preferenceKey, next ? "on" : "off");
    } catch {
      /* The control still works without storage. */
    }
  }

  return { moving, toggleMotion };
}
