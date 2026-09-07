"use client";
import { useCallback, useEffect, useRef, useState } from "react";

// Native fullscreen where supported; an accessible viewport view on mobile.
export function useFullscreen() {
  const ref = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLElement | null>(null);
  const [native, setNative] = useState(false);
  const [expanded, setExpanded] = useState(false);
  useEffect(() => {
    const sync = () => setNative(document.fullscreenElement === ref.current);
    document.addEventListener("fullscreenchange", sync);
    return () => document.removeEventListener("fullscreenchange", sync);
  }, []);
  useEffect(() => {
    if (!expanded) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const root = ref.current;
    root?.focus();
    const keydown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setExpanded(false);
      }
      if (event.key !== "Tab" || !root) return;
      const nodes = Array.from(
        root.querySelectorAll<HTMLElement>(
          'button:not(:disabled), a[href], input, select, summary, [tabindex="0"]',
        ),
      ).filter((node) => node.getClientRects().length > 0);
      const first = nodes[0],
        last = nodes[nodes.length - 1];
      if (!first) {
        event.preventDefault();
        return;
      }
      if (
        event.shiftKey &&
        (document.activeElement === first || document.activeElement === root)
      ) {
        event.preventDefault();
        last.focus();
      } else if (
        !event.shiftKey &&
        (document.activeElement === last || document.activeElement === root)
      ) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", keydown);
    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener("keydown", keydown);
      trigger.current?.focus();
    };
  }, [expanded]);
  const toggle = useCallback(async () => {
    if (document.fullscreenElement === ref.current) {
      await document.exitFullscreen().catch(() => {});
      return;
    }
    if (expanded) {
      setExpanded(false);
      return;
    }
    trigger.current = document.activeElement as HTMLElement;
    if (ref.current?.requestFullscreen && document.fullscreenEnabled) {
      try {
        await ref.current.requestFullscreen();
        return;
      } catch {
        /* Mobile fallback. */
      }
    }
    setExpanded(true);
  }, [expanded]);
  return { ref, fullscreen: native || expanded, expanded, toggle };
}
