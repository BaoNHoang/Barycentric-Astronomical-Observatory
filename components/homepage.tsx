"use client";

import { useEffect } from "react";
import { ArrowRight } from "@/components/icons";
import SpaceBackground, { MotionControl } from "@/components/space-background";
import SiteFooter from "@/components/site-footer";
import { useBackgroundMotion } from "@/hooks/use-background-motion";
import "@/app/home.css";

export default function Homepage() {
  const { moving, toggleMotion } = useBackgroundMotion();

  useEffect(() => {
    // Keep links saved from the original app working after adding a homepage.
    const views = [
      "solar-system",
      "sky-explorer",
      "exoplanets",
      "asteroids",
      "spacecraft",
      "gallery",
      "api",
      "guide",
    ];
    if (views.includes(window.location.hash.slice(1))) {
      window.location.replace(`/explore${window.location.hash}`);
    }
  }, []);

  return (
    <div className="home">
      <a className="skip-link" href="#home-title">
        Skip to content
      </a>
      <SpaceBackground moving={moving} />
      <header className="home-header">
        <a href="/" className="home-wordmark" aria-label="BAO home">
          BAO
        </a>
        <nav aria-label="Website navigation">
          <a href="/explore#gallery">Images</a>
          <a href="/explore#api">For developers</a>
        </nav>
      </header>
      <main className="home-intro" aria-labelledby="home-title">
        <h1 id="home-title">
          Barycentric
          <br />
          Astronomical
          <br />
          Observatory
        </h1>
        <a className="home-enter" href="/explore">
          Open observatory <ArrowRight size={24} />
        </a>
      </main>
      <SiteFooter>
        <MotionControl moving={moving} onToggle={toggleMotion} />
      </SiteFooter>
    </div>
  );
}
