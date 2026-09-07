"use client";
import { useEffect, useRef, useState, useMemo } from "react";
import { animateScene } from "@/lib/animation";
import { Play, Pause } from "@/components/icons";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import type { Trajectory } from "@/lib/api/horizons";
import { formatDate, formatNumber } from "@/components/shared";
export default function TrajectoryPlot({ data }: { data: Trajectory }) {
  const host = useRef<HTMLDivElement>(null);
  const latestProgress = useRef(0);
  const [progress, setProgress] = useState(0),
    [playing, setPlaying] = useState(false);
  latestProgress.current = progress;
  useEffect(() => {
    setProgress(0);
    setPlaying(false);
  }, [data]);
  useEffect(() => {
    if (!playing) return;
    let value = latestProgress.current;
    return animateScene(host.current!, (dt) => {
      value = Math.min(1, value + dt / 12);
      setProgress(value);
      if (value >= 1) setPlaying(false);
    });
  }, [playing]);
  const positions = useMemo(
    () => data.points.map((point) => point.position_au),
    [data],
  );
  const extent =
    Math.max(
      ...positions.flatMap((p) => [Math.abs(p.x), Math.abs(p.y)]),
      0.00001,
    ) * 1.15;
  const project = (p: { x: number; y: number }) => ({
    x: 320 + (p.x / extent) * 250,
    y: 240 - (p.y / extent) * 190,
  });
  const index = progress * (positions.length - 1),
    lower = Math.floor(index),
    upper = Math.min(lower + 1, positions.length - 1),
    fraction = index - lower;
  const current = {
    x:
      positions[lower].x + (positions[upper].x - positions[lower].x) * fraction,
    y:
      positions[lower].y + (positions[upper].y - positions[lower].y) * fraction,
    z:
      positions[lower].z + (positions[upper].z - positions[lower].z) * fraction,
  };
  const dot = project(current),
    path = positions
      .map(
        (p, i) =>
          `${i ? "L" : "M"}${project(p).x.toFixed(2)},${project(p).y.toFixed(2)}`,
      )
      .join(" ");
  const currentTime = new Date(
    Date.parse(data.points[lower].time) +
      (Date.parse(data.points[upper].time) -
        Date.parse(data.points[lower].time)) *
        fraction,
  ).toISOString();
  return (
    <div className="trajectory-chart" ref={host}>
      <svg
        viewBox="0 0 640 480"
        role="img"
        aria-label={`${data.target} trajectory projected onto the J2000 ecliptic XY plane`}
      >
        <defs>
          <pattern
            id="trajectory-grid"
            width="40"
            height="40"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M40 0H0V40"
              fill="none"
              stroke="#1b2737"
              strokeWidth=".6"
            />
          </pattern>
        </defs>
        <rect width="640" height="480" fill="#0b111c" />
        <rect width="640" height="480" fill="url(#trajectory-grid)" />
        <path
          d="M60 240H580M320 40V440"
          stroke="#354356"
          strokeDasharray="4 5"
        />
        <circle
          cx="320"
          cy="240"
          r="7"
          fill={data.origin === "earth" ? "#7daee5" : "#efb477"}
        />
        <text x="334" y="245" fill="#a6b3c5" fontSize="13">
          {data.origin === "sun"
            ? "Sun"
            : data.origin === "earth"
              ? "Earth"
              : "Barycenter"}
        </text>
        <path d={path} stroke="#efb477" strokeWidth="2" fill="none" />
        {positions.map((p, i) => {
          const q = project(p);
          return <circle key={i} cx={q.x} cy={q.y} r="1.7" fill="#dcb58f" />;
        })}
        <circle cx={dot.x} cy={dot.y} r="12" fill="#efb477" fillOpacity=".12" />
        <circle cx={dot.x} cy={dot.y} r="4" fill="#fff0da" />
        <text x="20" y="26" fill="#97a6bc" fontSize="12">
          J2000 ECLIPTIC · XY PROJECTION
        </text>
        <text x="20" y="459" fill="#97a6bc" fontSize="12">
          X range ±{formatNumber(extent, 4)} AU
        </text>
      </svg>
      <div className="trajectory-playback">
        <Button
          variant="outline"
          size="icon"
          aria-label={playing ? "Pause trajectory" : "Animate trajectory"}
          onClick={() => {
            if (progress >= 1) setProgress(0);
            setPlaying((value) => !value);
          }}
        >
          {playing ? <Pause size={16} /> : <Play size={16} />}
        </Button>
        <Slider
          aria-label="Trajectory time"
          min={0}
          max={1}
          step={0.001}
          value={[progress]}
          onValueChange={(value) => {
            setPlaying(false);
            setProgress(value[0]);
          }}
        />
        <span>{formatDate(currentTime)}</span>
      </div>
      <div className="trajectory-caption">
        <span>
          {formatNumber(Math.hypot(current.x, current.y, current.z), 4)} AU from{" "}
          {data.origin}
        </span>
        <span>Interpolated between {data.points.length} JPL samples</span>
      </div>
      <p className="muted small">
        UTC: {currentTime} · Z is omitted from the plot. Origin marker is
        enlarged.
      </p>
    </div>
  );
}
