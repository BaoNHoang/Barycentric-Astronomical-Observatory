"use client";
import { useEffect, useRef, useState } from "react";
import { animateScene } from "@/lib/animation";
import { Play, Pause } from "@/components/icons";
import { Button } from "@/components/ui/button";
import type { Exoplanet } from "@/lib/api/exoplanets";
export default function SystemOrbits({
  planets,
  selected,
  onSelect,
}: {
  planets: Exoplanet[];
  selected: string;
  onSelect: (planet: Exoplanet) => void;
}) {
  const days = useRef(0);
  const surface = useRef<HTMLDivElement>(null);
  const [playing, setPlaying] = useState(false);
  const host = planets[0]?.hostname;
  useEffect(() => {
    days.current = 0;
    setPlaying(false);
    surface.current
      ?.querySelectorAll<SVGGElement>("[data-period]")
      .forEach((node) => {
        node.setAttribute(
          "transform",
          `translate(${Number(node.dataset.radius)} 0)`,
        );
      });
  }, [host]);
  useEffect(() => {
    if (!playing || !surface.current) return;
    const nodes = Array.from(
      surface.current!.querySelectorAll<SVGGElement>("[data-period]"),
    );
    return animateScene(surface.current!, (dt) => {
      days.current += dt;
      for (const node of nodes) {
        const angle =
          (days.current / Number(node.dataset.period)) * Math.PI * 2;
        const r = Number(node.dataset.radius);
        node.setAttribute(
          "transform",
          `translate(${r * Math.cos(angle)} ${r * Math.sin(angle)})`,
        );
      }
    });
  }, [playing, host]);
  const known = planets
    .filter(
      (p) =>
        p.pl_orbper !== null &&
        p.pl_orbper > 0 &&
        p.pl_orbsmax !== null &&
        p.pl_orbsmax > 0,
    )
    .sort((a, b) => a.pl_orbsmax! - b.pl_orbsmax!);
  if (!known.length)
    return (
      <p className="muted">
        There isn’t enough orbital data to draw this system.
      </p>
    );
  return (
    <div className="system-orbits" ref={surface}>
      <svg
        viewBox="0 0 360 330"
        role="img"
        aria-label={`Illustrative orbital system around ${host}. Orbital phases and spacing are illustrative.`}
      >
        <circle cx="180" cy="154" r="10" fill="#efb477" />
        {known.map((planet, i) => {
          const r = 30 + ((i + 1) * 105) / known.length,
            angle = (days.current / planet.pl_orbper!) * Math.PI * 2;
          return (
            <g key={planet.pl_name}>
              <circle
                cx="180"
                cy="154"
                r={r}
                stroke={planet.pl_name === selected ? "#a88c6d" : "#344256"}
                fill="none"
              />
              <g
                data-period={planet.pl_orbper}
                data-radius={r}
                transform={`translate(${r * Math.cos(angle)} ${r * Math.sin(angle)})`}
                role="button"
                tabIndex={0}
                aria-label={`Select ${planet.pl_name}`}
                onClick={() => onSelect(planet)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onSelect(planet);
                  }
                }}
                style={{ cursor: "pointer" }}
              >
                <circle cx={180} cy={154} r="10" fill="transparent" />
                <circle
                  cx={180}
                  cy={154}
                  r={planet.pl_name === selected ? 5 : 3.5}
                  fill={planet.pl_name === selected ? "#efb477" : "#adc5e2"}
                />
                <title>
                  {planet.pl_name}: {planet.pl_orbper} day orbit
                </title>
              </g>
            </g>
          );
        })}
        <text x="180" y="320" textAnchor="middle" fill="#8fa1bc" fontSize="12">
          {host} · {known.length} plotted planets
        </text>
      </svg>
      <div className="button-row">
        <Button variant="outline" onClick={() => setPlaying((value) => !value)}>
          {playing ? <Pause size={14} /> : <Play size={14} />}Orbital motion
        </Button>
        <span className="muted small">1 simulated day / second</span>
      </div>
      <p className="muted small">
        Periods come from the catalog. All planets start at an arbitrary common
        phase; spacing and sizes are illustrative. This is not an ephemeris.
      </p>
    </div>
  );
}
