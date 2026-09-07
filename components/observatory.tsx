"use client";
import { lazy, Suspense, useEffect, useState } from "react";
import { Loading } from "@/components/shared";
import { SidebarProvider } from "@/components/ui/sidebar";
import ObservatoryNavigation, {
  navigation,
  NavigationToggle,
} from "@/components/observatory-navigation";
import SpaceBackground from "@/components/space-background";
import SiteFooter from "@/components/site-footer";
import { useBackgroundMotion } from "@/hooks/use-background-motion";

const SolarSystem = lazy(() => import("@/components/explorers/solar-system"));
const SkyExplorer = lazy(() => import("@/components/explorers/sky-explorer"));
const Exoplanets = lazy(() => import("@/components/explorers/exoplanets"));
const Asteroids = lazy(() => import("@/components/explorers/asteroids"));
const Spacecraft = lazy(() => import("@/components/explorers/spacecraft"));
const Gallery = lazy(() => import("@/components/explorers/gallery"));
const ApiPlayground = lazy(
  () => import("@/components/explorers/api-playground"),
);
const Guide = lazy(() => import("@/components/explorers/guide"));

export default function Observatory({ initialTime }: { initialTime: string }) {
  const { moving, toggleMotion } = useBackgroundMotion();
  const [view, setView] = useState("solar-system");
  const [time, setTime] = useState(initialTime);
  const [location, setLocation] = useState({
    lat: 37.09,
    lon: -76.47,
    label: "Newport News, VA",
  });

  useEffect(() => {
    const sync = () => {
      const hash = window.location.hash.slice(1);
      if (navigation.some((item) => item.value === hash)) setView(hash);
      else if (!hash) setView("solar-system");
      // Other anchors, including Skip to content, leave the selected tool alone.
    };
    sync();
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, []);

  useEffect(() => {
    // Footer links and sidebar links should open the top of the selected tool.
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [view]);

  function navigate(id: string) {
    setView(id);
    window.location.hash = id;
  }

  return (
    <div className="observatory">
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <SpaceBackground moving={moving} variant="observatory" />
      <SidebarProvider>
        <ObservatoryNavigation
          view={view}
          onNavigate={navigate}
          moving={moving}
          onToggleMotion={toggleMotion}
        />
        <div className="app-shell">
          <NavigationToggle />
          <main className="workspace" id="main-content">
            <Suspense fallback={<Loading label="Loading…" />}>
              {view === "solar-system" && (
                <SolarSystem time={time} onTimeChange={setTime} />
              )}
              {view === "sky-explorer" && (
                <SkyExplorer
                  time={time}
                  onTimeChange={setTime}
                  location={location}
                  onLocationChange={setLocation}
                />
              )}
              {view === "exoplanets" && <Exoplanets />}
              {view === "asteroids" && <Asteroids time={time} />}
              {view === "spacecraft" && <Spacecraft time={time} />}
              {view === "gallery" && <Gallery />}
              {view === "api" && <ApiPlayground time={time} />}
              {view === "guide" && <Guide />}
            </Suspense>
          </main>
          <SiteFooter />
        </div>
      </SidebarProvider>
    </div>
  );
}
