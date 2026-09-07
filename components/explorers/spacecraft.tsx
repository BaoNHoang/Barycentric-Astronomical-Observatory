"use client";
import { useState } from "react";
import { Download } from "@/components/icons";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { missions } from "@/data/missions";
import {
  Choice,
  PageHeading,
  Disclosure,
  Stat,
  Loading,
  ErrorState,
  SourceLink,
  useRemote,
  formatNumber,
  downloadJson,
} from "@/components/shared";
import type { Trajectory } from "@/lib/api/horizons";
import TrajectoryPlot from "@/components/trajectory-plot";
export default function Spacecraft({ time }: { time: string }) {
  const [mission, setMission] = useState("voyager-1"),
    [start, setStart] = useState(time.slice(0, 10)),
    [end, setEnd] = useState(
      new Date(Date.parse(time) + 365 * 86400000).toISOString().slice(0, 10),
    ),
    [origin, setOrigin] = useState("sun");
  const [query, setQuery] = useState(
    new URLSearchParams({
      target: "voyager-1",
      start: time.slice(0, 10),
      end: new Date(Date.parse(time) + 365 * 86400000)
        .toISOString()
        .slice(0, 10),
      samples: "90",
      origin: "sun",
    }).toString(),
  );
  const [formError, setFormError] = useState("");
  const remote = useRemote<Trajectory>(`/v1/trajectories?${query}`),
    selected = missions.find((item) => item.id === mission)!;
  const loaded = missions.find((item) => item.id === remote.data?.target);
  function load() {
    if (!start || !end || new Date(end) <= new Date(start)) {
      setFormError("Choose an end date after the start date.");
      return;
    }
    setFormError("");
    setQuery(
      new URLSearchParams({
        target: mission,
        start,
        end,
        origin,
        samples: "90",
      }).toString(),
    );
  }
  const first = remote.data?.points[0],
    last = remote.data?.points.at(-1);
  return (
    <div>
      <PageHeading title="Spacecraft" />
      <div className="mission-selection">
        <Choice
          label="Spacecraft"
          value={mission}
          onChange={setMission}
          options={missions.map((item) => ({
            value: item.id,
            label: item.name,
          }))}
        />
        <Button onClick={load}>Plot {selected.name}</Button>
      </div>
      <Disclosure title="Dates & coordinate origin">
        <div className="catalog-toolbar panel">
          <label className="inline-field">
            From
            <Input
              type="date"
              value={start}
              min="1900-01-01"
              max="2100-12-31"
              onChange={(e) => setStart(e.target.value)}
            />
          </label>
          <label className="inline-field">
            To
            <Input
              type="date"
              value={end}
              min="1900-01-01"
              max="2100-12-31"
              onChange={(e) => setEnd(e.target.value)}
            />
          </label>
          <Choice
            label="Coordinate origin"
            value={origin}
            onChange={setOrigin}
            options={[
              { value: "sun", label: "Sun-centered" },
              { value: "earth", label: "Earth-centered" },
              { value: "barycenter", label: "Solar system barycenter" },
            ]}
          />
        </div>
      </Disclosure>
      {formError && (
        <p className="form-error" role="alert">
          {formError}
        </p>
      )}
      {remote.loading && (
        <Loading label="Calculating the journey with JPL Horizons…" />
      )}
      {remote.error && (
        <ErrorState message={remote.error} retry={remote.reload} />
      )}{" "}
      {remote.data && first && last && (
        <div className="trajectory-layout">
          <section className="panel">
            <div className="panel-topline">
              <h2>{loaded?.name ?? remote.data.target}</h2>
              <Button
                variant="ghost"
                onClick={() =>
                  downloadJson(
                    remote.data,
                    `bao-${remote.data!.target}-trajectory.json`,
                  )
                }
              >
                <Download size={15} />
                Export trajectory
              </Button>
            </div>
            <TrajectoryPlot data={remote.data} />
          </section>
          <Disclosure
            title="Mission & trajectory data"
            className="journey-details"
          >
            <h2>{loaded?.name}</h2>
            <p className="muted">{loaded?.description}</p>
            <Stat
              label="Distance at first sample"
              value={formatNumber(
                Math.hypot(...Object.values(first.position_au)),
                3,
              )}
              unit="AU"
              sub={`From ${remote.data.origin}`}
            />
            <Stat
              label="Distance at last sample"
              value={formatNumber(
                Math.hypot(...Object.values(last.position_au)),
                3,
              )}
              unit="AU"
            />
            <Stat
              label="Trajectory samples"
              value={remote.data.points.length}
            />
            <div className="data-spec">
              <span>
                Frame<b>{remote.data.frame}</b>
              </span>
              <span>
                Corrections<b>{remote.data.corrections}</b>
              </span>
              <span>
                Start<b>{first.time}</b>
              </span>
              <span>
                End<b>{last.time}</b>
              </span>
            </div>
            {loaded && (
              <SourceLink href={loaded.source}>Explore the mission</SourceLink>
            )}
          </Disclosure>
        </div>
      )}
      <p className="source-note">
        Spacecraft data depends on available trajectory coverage. Future paths
        are predictions; a mission listing does not imply it is currently
        operating. The animation interpolates sampled positions.{" "}
        <SourceLink href="https://ssd-api.jpl.nasa.gov/doc/horizons.html">
          JPL Horizons
        </SourceLink>
      </p>
    </div>
  );
}
