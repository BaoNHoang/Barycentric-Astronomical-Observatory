"use client";
import { lazy, Suspense, useRef, useState } from "react";
import galaxies from "@/data/galaxies.json";
import { systems, explorerCatalogDate } from "@/data/explorer-systems";
import GalaxyImage, { type ViewAction } from "@/components/galaxy-image";
import { useFullscreen } from "@/hooks/use-fullscreen";
import { useBackgroundMotion } from "@/hooks/use-background-motion";
import {
  ArrowRight,
  ChevronLeft,
  Close,
  Info,
  Maximize2,
  Minimize,
  Minus,
  Pause,
  Play,
  Plus,
  RotateCcw,
} from "@/components/icons";
import { Disclosure, SourceLink } from "@/components/shared";

const SystemScene = lazy(() => import("@/components/explorer-system-scene"));
const number = (value: number | null, digits = 2) =>
  value === null
    ? "Unknown"
    : value.toLocaleString("en-US", { maximumFractionDigits: digits });

export default function GalaxyExplorer() {
  const [galaxyId, setGalaxyId] = useState("whirlpool");
  const [systemId, setSystemId] = useState<string | null>(null);
  const [planetId, setPlanetId] = useState<string | null>(null);
  const [details, setDetails] = useState(false);
  const [playChoice, setPlayChoice] = useState<boolean | null>(null);
  const { moving } = useBackgroundMotion();
  const { ref, fullscreen, expanded, toggle } = useFullscreen();
  const action = useRef<((action: ViewAction) => void) | null>(null);
  const galaxy = galaxies.find((g) => g.id === galaxyId)!;
  const system = systems.find((s) => s.id === systemId);
  const planet = system?.planets.find((p) => p.id === planetId);
  const playing = playChoice ?? moving;
  const title = planet?.name ?? system?.name ?? galaxy.name;
  const description =
    planet?.description ?? system?.description ?? galaxy.description;
  function selectGalaxy(id: string) {
    setGalaxyId(id);
    setSystemId(null);
    setPlanetId(null);
  }
  function selectSystem(id: string) {
    setGalaxyId("milky-way");
    setSystemId(id);
    setPlanetId(null);
  }
  function back() {
    if (planetId) setPlanetId(null);
    else setSystemId(null);
  }

  return (
    <div className="galaxy-page">
      <div className="page-heading">
        <h1>Galaxy explorer</h1>
        <a href="#solar-system" className="text-button">
          Calculated sky & orbits <ArrowRight size={16} />
        </a>
      </div>
      <div
        ref={ref}
        tabIndex={-1}
        className={`atlas${expanded ? " is-expanded" : ""}`}
        data-reduced-motion={!moving}
        role={expanded ? "dialog" : undefined}
        aria-modal={expanded || undefined}
        aria-label="Galaxy explorer"
      >
        <div className="atlas-toolbar">
          <nav className="atlas-breadcrumb" aria-label="Exploration path">
            {system ? (
              <>
                <button
                  onClick={() => {
                    setSystemId(null);
                    setPlanetId(null);
                  }}
                >
                  Milky Way
                </button>
                <span>/</span>
                {planet ? (
                  <>
                    <button onClick={() => setPlanetId(null)}>
                      {system.name}
                    </button>
                    <span>/</span>
                    <span aria-current="location">{planet.name}</span>
                  </>
                ) : (
                  <span aria-current="location">{system.name}</span>
                )}
              </>
            ) : (
              <span>
                Galaxies <span className="atlas-slash">/</span>{" "}
                {galaxy.designation}
              </span>
            )}
          </nav>
          <div className="atlas-header-actions">
            <button
              aria-expanded={details}
              aria-controls="atlas-details"
              onClick={() => setDetails((v) => !v)}
              title="Object details"
            >
              <Info size={18} />
              <span>Details</span>
            </button>
            <button
              onClick={toggle}
              aria-label={fullscreen ? "Exit fullscreen" : "Enter fullscreen"}
              title={fullscreen ? "Exit fullscreen" : "Enter fullscreen"}
            >
              {fullscreen ? <Minimize size={19} /> : <Maximize2 size={19} />}
              <span>{fullscreen ? "Exit" : "Fullscreen"}</span>
            </button>
          </div>
        </div>
        <div className={`atlas-viewport${details ? " with-details" : ""}`}>
          <div className="atlas-visual">
            {system ? (
              <Suspense
                fallback={
                  <p className="atlas-status" role="status">
                    Opening star system…
                  </p>
                }
              >
                <SystemScene
                  key={system.id}
                  system={system}
                  selected={planetId}
                  onSelect={setPlanetId}
                  playing={playing}
                  reduced={!moving}
                  action={action}
                />
              </Suspense>
            ) : (
              <GalaxyImage
                key={galaxy.id}
                src={galaxy.image}
                alt={galaxy.alt}
                reduced={!moving}
                action={action}
              />
            )}
            <div className="atlas-title" key={title}>
              {system && (
                <button className="atlas-back" onClick={back}>
                  <ChevronLeft size={16} />
                  {planet ? "System overview" : "Back to galaxy"}
                </button>
              )}
              <h2>{title}</h2>
              <p>
                {planet
                  ? "Planet close-up"
                  : system
                    ? system.star
                    : galaxy.facts.find((f) => f.label === "Type")?.value}
              </p>
            </div>
            <div className="atlas-camera" aria-label="View controls">
              <button
                onClick={() => action.current?.("in")}
                aria-label="Zoom in"
                title="Zoom in (+)"
              >
                <Plus size={18} />
              </button>
              <button
                onClick={() => action.current?.("out")}
                aria-label="Zoom out"
                title="Zoom out (-)"
              >
                <Minus size={18} />
              </button>
              <button
                onClick={() => {
                  action.current?.("reset");
                  if (system) setPlanetId(null);
                }}
                aria-label="Reset view"
                title="Reset view (0)"
              >
                <RotateCcw size={18} />
              </button>
              {system && (
                <button
                  onClick={() => setPlayChoice(!playing)}
                  aria-label={
                    playing ? "Pause system motion" : "Play system motion"
                  }
                  title={playing ? "Pause system motion" : "Play system motion"}
                >
                  {playing ? <Pause size={18} /> : <Play size={18} />}
                </button>
              )}
            </div>
            <p className="atlas-gesture">
              {system ? "Drag to orbit" : "Drag to pan"}
              <span> · </span>Scroll or pinch to zoom
            </p>
          </div>
          {details && (
            <aside
              id="atlas-details"
              className="atlas-details"
              aria-label={`${title} details`}
            >
              <div className="atlas-detail-heading">
                <h3>{title}</h3>
                <button
                  onClick={() => setDetails(false)}
                  aria-label="Close details"
                >
                  <Close size={18} />
                </button>
              </div>
              <p>{description}</p>
              <dl>
                {planet ? (
                  <>
                    <div>
                      <dt>Radius</dt>
                      <dd>
                        {number(planet.radiusEarth)}
                        {planet.radiusEarth !== null && " × Earth"}
                      </dd>
                    </div>
                    <div>
                      <dt>Orbital period</dt>
                      <dd>{number(planet.periodDays, 3)} days</dd>
                    </div>
                    <div>
                      <dt>Semimajor axis</dt>
                      <dd>{number(planet.semiMajorAu, 5)} AU</dd>
                    </div>
                    {!planet.texture && (
                      <div>
                        <dt>Equilibrium temperature</dt>
                        <dd>
                          {number(planet.temperatureK, 0)}
                          {planet.temperatureK !== null && " K"}
                        </dd>
                      </div>
                    )}
                  </>
                ) : system ? (
                  <>
                    <div>
                      <dt>Host star</dt>
                      <dd>{system.star}</dd>
                    </div>
                    <div>
                      <dt>Location</dt>
                      <dd>{system.distance}</dd>
                    </div>
                    <div>
                      <dt>Planets in this view</dt>
                      <dd>{system.planets.length}</dd>
                    </div>
                  </>
                ) : (
                  galaxy.facts
                    .filter(
                      (f) =>
                        !["Distinctive feature", "Companion"].includes(f.label),
                    )
                    .map((f) => (
                      <div key={f.label}>
                        <dt>{f.label}</dt>
                        <dd>{f.value}</dd>
                      </div>
                    ))
                )}
              </dl>
              {system ? (
                <>
                  <p className="atlas-caveat">
                    Circular orbits, starting phases, spacing, sizes and
                    rotation are illustrative. Orbital periods use reference
                    data. Playback advances one simulated day per second;
                    orbital travel pauses during a close-up.
                  </p>
                  {system.id !== "solar" && (
                    <p className="atlas-caveat">
                      Catalog snapshot: {explorerCatalogDate}. Exoplanet
                      surfaces are unknown. Equilibrium temperature is a model
                      estimate, not a measured surface temperature.
                    </p>
                  )}
                  <SourceLink href={system.source}>
                    NASA system guide
                  </SourceLink>
                  <SourceLink
                    href={
                      system.id === "solar"
                        ? "https://ssd.jpl.nasa.gov/planets/phys_par.html"
                        : "https://exoplanetarchive.ipac.caltech.edu/"
                    }
                  >
                    Reference measurements
                  </SourceLink>
                </>
              ) : (
                <>
                  <p className="atlas-caveat">
                    Distances and diameters are approximate. Image colors depend
                    on observing filters and processing. Zoom enlarges the
                    supplied image; it cannot reveal unresolved planets.
                  </p>
                  {Array.from(new Set(galaxy.facts.map((f) => f.source))).map(
                    (url, i) => (
                      <SourceLink key={url} href={url}>
                        {i === 0
                          ? "Galaxy reference"
                          : "Additional measurements"}
                      </SourceLink>
                    ),
                  )}
                </>
              )}
            </aside>
          )}
        </div>
        <div className="atlas-context">
          {system ? (
            <div
              className="atlas-planet-list"
              aria-label="Planets in this system"
            >
              <button
                onClick={() => setPlanetId(null)}
                aria-pressed={!planetId}
              >
                Whole system
              </button>
              {system.planets.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setPlanetId(p.id)}
                  aria-pressed={planetId === p.id}
                >
                  {p.name.replace(system.name + " ", "")}
                </button>
              ))}
            </div>
          ) : (
            <div className="atlas-image-caption">
              <span>{galaxy.imageNote}</span>
              <a href={galaxy.source} target="_blank" rel="noreferrer">
                {galaxy.credit}
              </a>
            </div>
          )}
          {system && (
            <p className="atlas-model-note">
              Illustrative model · distances compressed · sizes enlarged
              {system.id !== "solar" ? " · surfaces unknown" : ""}
            </p>
          )}
          {!system && (
            <div className="atlas-destination">
              <p>
                {galaxy.id === "milky-way"
                  ? "Explore a star system"
                  : galaxy.facts.find((f) => f.label === "Distance")?.value}
              </p>
              <div className="atlas-system-links">
                {galaxy.id === "milky-way" ? (
                  systems.map((s) => (
                    <button key={s.id} onClick={() => selectSystem(s.id)}>
                      {s.name}
                      <ArrowRight size={16} />
                    </button>
                  ))
                ) : (
                  <button onClick={() => selectGalaxy("milky-way")}>
                    Visit Milky Way systems <ArrowRight size={16} />
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
        <nav className="atlas-galaxy-list" aria-label="Choose a galaxy">
          {galaxies.map((g) => (
            <button
              key={g.id}
              aria-pressed={g.id === galaxy.id}
              onClick={() => selectGalaxy(g.id)}
            >
              <img
                src={g.thumbnail}
                alt=""
                loading="lazy"
                width={72}
                height={46}
              />
              <span>
                {g.name}
                <small>
                  {g.id === "milky-way"
                    ? "Our home galaxy · illustration"
                    : g.designation}
                </small>
              </span>
            </button>
          ))}
        </nav>
      </div>
      <Disclosure title="How to explore">
        <p>
          Select a galaxy below the image. Scroll or pinch to zoom up to 10×,
          then drag to inspect its structures. Double-click to zoom in or reset.
          With the image focused, use +, − and arrow keys; press 0 to reset.
        </p>
        <p>
          Choose the Milky Way to enter the Solar System, TRAPPIST-1 or
          Kepler-90. Select a planet’s label or its name below the scene to fly
          closer. Drag to rotate your view. Open Details for descriptions,
          measurements and sources. Fullscreen keeps the entire explorer and its
          controls together; Escape leaves fullscreen.
        </p>
        <p>
          The Milky Way overview is a NASA artist’s concept. Systems are
          separate illustrative models, not objects resolved inside the galaxy
          image. Use the Solar system tool for calculated positions and date
          controls.
        </p>
      </Disclosure>
    </div>
  );
}
