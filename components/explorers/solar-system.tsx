"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { animateScene } from "@/lib/animation";
import {
  Pause,
  Play,
  SkipBack,
  SkipForward,
  Download,
} from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/bao-sheet";
import SolarScene from "@/components/solar-scene";
import MoonScene from "@/components/moon-scene";
import PlanetPortrait from "@/components/planet-portrait";
import {
  planets,
  moons,
  findBody,
  bodySource,
  moonSource,
} from "@/data/bodies";
import { DAY_MS, position } from "@/lib/astronomy";
import {
  Choice,
  PageHeading,
  Disclosure,
  Stat,
  SourceLink,
  formatNumber,
  downloadJson,
} from "@/components/shared";

export default function SolarSystem({
  time,
  onTimeChange,
}: {
  time: string;
  onTimeChange: (time: string) => void;
}) {
  const host = useRef<HTMLDivElement>(null);
  const [selected, setSelected] = useState("mars");
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState("10");
  const [labels, setLabels] = useState(true);
  const [orbits, setOrbits] = useState(true);
  const [trueScale, setTrueScale] = useState(false);
  const [topView, setTopView] = useState(false);
  const [details, setDetails] = useState(false);
  const body = findBody(selected)!;
  const Scene = body.kind === "Moon" ? MoonScene : SolarScene;
  const date = useMemo(() => new Date(time), [time]);
  const data = useMemo(() => position(selected, date), [selected, date]);

  useEffect(() => {
    if (!playing) return;
    let elapsed = Date.parse(time);
    let pending = 0;
    return animateScene(host.current!, (dt) => {
      elapsed += dt * Number(speed) * DAY_MS;
      pending += dt;
      if (pending < 0.1) return;
      pending = 0;
      const next = new Date(elapsed);
      if (next.getUTCFullYear() < 1900 || next.getUTCFullYear() > 2100) {
        setPlaying(false);
        return;
      }
      onTimeChange(next.toISOString());
    });
    // The running clock owns its time until paused; external edits pause it.
  }, [playing, speed, onTimeChange]);

  function changeTime(next: Date) {
    if (next.getUTCFullYear() < 1900 || next.getUTCFullYear() > 2100) return;
    setPlaying(false);
    onTimeChange(next.toISOString());
  }
  const yearStart = Date.UTC(date.getUTCFullYear(), 0, 1);
  const yearEnd = Date.UTC(date.getUTCFullYear() + 1, 0, 1);

  return (
    <div className="solar-page" ref={host}>
      <PageHeading title="Solar system" />
      <div className="scene-selection">
        <Choice
          label="Select a planet or moon"
          value={selected}
          onChange={setSelected}
          options={[...planets, ...moons].map((item) => ({
            value: item.id,
            label: item.kind === "Moon" ? item.name + " · moon" : item.name,
          }))}
        />
        <button className="text-button" onClick={() => setDetails(true)}>
          {body.name} details
        </button>
      </div>
      <div className="visual-panel">
        <Scene
          time={time}
          selected={selected}
          onSelect={setSelected}
          labels={labels}
          orbits={orbits}
          trueScale={trueScale}
          topView={topView}
        />
        <div className="scene-footnote">
          {trueScale
            ? "True scale · small bodies may be invisible"
            : body.kind === "Moon"
              ? "Parent-centered · distances to scale · sizes enlarged"
              : "Sun-centered · distances compressed · sizes enlarged"}
        </div>
        <div className="timeline-controls">
          <div className="playback">
            <button
              aria-label="Back one day"
              onClick={() => changeTime(new Date(date.getTime() - DAY_MS))}
            >
              <SkipBack size={18} />
            </button>
            <button
              className="play-button"
              aria-label={playing ? "Pause simulation" : "Play simulation"}
              onClick={() => setPlaying(!playing)}
            >
              {playing ? <Pause size={18} /> : <Play size={18} />}
            </button>
            <button
              aria-label="Forward one day"
              onClick={() => changeTime(new Date(date.getTime() + DAY_MS))}
            >
              <SkipForward size={18} />
            </button>
          </div>
          <label className="date-control">
            <input
              aria-label="Simulation time in UTC"
              type="datetime-local"
              min="1900-01-01T00:00"
              max="2100-12-31T23:59"
              value={time.slice(0, 16)}
              onChange={(event) => {
                if (event.currentTarget.validity.valid && event.target.value)
                  changeTime(new Date(event.target.value + "Z"));
              }}
            />
            <span>UTC</span>
          </label>
          <button
            className="text-button"
            onClick={() => changeTime(new Date())}
          >
            Now
          </button>
        </div>
      </div>
      <Disclosure title="View & playback settings">
        <div className="settings-line">
          <Choice
            label="View angle"
            value={topView ? "top" : "3d"}
            onChange={(value) => setTopView(value === "top")}
            options={[
              { value: "3d", label: "3D view" },
              { value: "top", label: "Top view" },
            ]}
          />
          <Choice
            label="Visualization scale"
            value={trueScale ? "true" : "illustrative"}
            onChange={(value) => setTrueScale(value === "true")}
            options={[
              { value: "illustrative", label: "Illustrative scale" },
              { value: "true", label: "True scale" },
            ]}
          />
          <Choice
            label="Playback speed"
            value={speed}
            onChange={setSpeed}
            options={[
              { value: "1", label: "1 day / second" },
              { value: "10", label: "10 days / second" },
              { value: "50", label: "50 days / second" },
              { value: "-10", label: "Reverse · 10 days / second" },
            ]}
          />
          <label>
            Orbits{" "}
            <Switch
              checked={orbits}
              onCheckedChange={setOrbits}
              aria-label="Show orbits"
            />
          </label>
          <label>
            Labels{" "}
            <Switch
              checked={labels}
              onCheckedChange={setLabels}
              aria-label="Show labels"
            />
          </label>
        </div>
        <Slider
          aria-label="Day of the year"
          value={[((date.getTime() - yearStart) / (yearEnd - yearStart)) * 100]}
          min={0}
          max={99.99}
          step={0.05}
          onValueChange={(value) =>
            changeTime(
              new Date(yearStart + ((yearEnd - yearStart) * value[0]) / 100),
            )
          }
        />
        <p className="muted small">
          Drag the year slider to change the date. Positions are calculated with
          Astronomy Engine. Surface textures and rotation are illustrative.
        </p>
      </Disclosure>
      <Sheet open={details} onOpenChange={setDetails}>
        <SheetContent className="detail-sheet">
          <SheetHeader>
            <SheetTitle>{body.name}</SheetTitle>
            <SheetDescription>
              Properties and calculated position
            </SheetDescription>
          </SheetHeader>
          <div className="sheet-body">
            <PlanetPortrait id={body.id} color={body.color} />
            <p>{body.description}</p>
            <div className="metric-grid">
              <Stat
                label="Mean radius"
                value={formatNumber(body.radiusKm, 0)}
                unit="km"
              />
              <Stat
                label="Orbital period"
                value={formatNumber(body.periodDays)}
                unit="days"
              />
              <Stat
                label="From Earth"
                value={formatNumber(data.distance_from_earth_au, 3)}
                unit="AU"
              />
              <Stat
                label="Temperature"
                value={
                  body.temperatureK === null
                    ? "Unknown"
                    : formatNumber(body.temperatureK - 273.15, 0)
                }
                unit={body.temperatureK === null ? "" : "°C"}
              />
              <Stat
                label="Mass"
                value={body.massKg.toExponential(4)}
                unit="kg"
              />
              <Stat label="Surface gravity" value={body.gravity} unit="m/s²" />
              <Stat
                label="Sidereal rotation"
                value={Math.abs(body.dayHours)}
                unit="hours"
                sub={body.dayHours < 0 ? "Retrograde" : "Prograde"}
              />
              <Stat
                label="Semimajor axis"
                value={body.semiMajorAu}
                unit="AU"
                sub={"Relative to " + body.parent}
              />
            </div>
            <p className="muted small">
              {body.temperatureNote}. Texture orientation and rotation are
              illustrative; Galilean moons use untextured spheres.
            </p>
            <Disclosure title="Coordinates">
              <p className="muted small">
                {time} · geometric, Sun-centered, J2000 equatorial · AU
              </p>
              <pre>{JSON.stringify(data.position_au, null, 2)}</pre>
            </Disclosure>
            <Button
              onClick={() =>
                downloadJson(
                  { ...body, ephemeris: data },
                  "bao-" + body.id + ".json",
                )
              }
            >
              <Download size={16} /> Download data
            </Button>
            <SourceLink href={body.kind === "Moon" ? moonSource : bodySource}>
              NASA / JPL reference data
            </SourceLink>
            <SourceLink
              href={
                "/v1/positions?target=" +
                body.id +
                "&engine=horizons&time=" +
                encodeURIComponent(time)
              }
            >
              Request precise JPL position
            </SourceLink>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
