"use client";
import { useEffect, useState } from "react";
import { ScanLine, ArrowUpRight, Download, Play } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/bao-sheet";
import {
  PageHeading,
  Disclosure,
  Stat,
  Choice,
  Loading,
  ErrorState,
  SourceLink,
  useRemote,
  formatNumber,
  downloadJson,
} from "@/components/shared";
import type { closeApproaches } from "@/lib/api/asteroids";
import type { Trajectory } from "@/lib/api/horizons";
import TrajectoryPlot from "@/components/trajectory-plot";
type Approaches = Awaited<ReturnType<typeof closeApproaches>>;
type Asteroid = Approaches["results"][number];
const AU_KM = 149597870.7;
export default function Asteroids({ time }: { time: string }) {
  const [start, setStart] = useState(time.slice(0, 10)),
    [days, setDays] = useState("30"),
    [distance, setDistance] = useState("0.1"),
    [sort, setSort] = useState("date"),
    [selected, setSelected] = useState<Asteroid | null>(null),
    [animate, setAnimate] = useState(false);
  const [page, setPage] = useState(1);
  useEffect(() => setPage(1), [start, days, distance, sort]);
  const end = new Date(Date.parse(start) + Number(days) * 86400000)
    .toISOString()
    .slice(0, 10);
  const remote = useRemote<Approaches>(
    `/v1/asteroids/close-approaches?${new URLSearchParams({ start, end, distance_au_max: distance })}`,
  );
  const details = useRemote<{ data: unknown }>(
    selected ? `/v1/asteroids/${encodeURIComponent(selected.id)}` : null,
  );
  const trajectory = useRemote<Trajectory>(
    selected && animate
      ? `/v1/trajectories?${new URLSearchParams({ target: `asteroid:${selected.id}`, start, end, origin: "earth", samples: "90" })}`
      : null,
  );
  const items = [...(remote.data?.results ?? [])].sort((a, b) =>
    sort === "distance"
      ? (a.distance_au ?? Infinity) - (b.distance_au ?? Infinity)
      : 0,
  );
  const visibleItems = items.slice((page - 1) * 20, page * 20);
  return (
    <div>
      <PageHeading
        title="Asteroids"
        description="Earth close approaches · not impact predictions"
      />
      <Disclosure title={"Search window · " + start + " to " + end}>
        <div className="catalog-toolbar">
          <label className="inline-field">
            Starting
            <Input
              type="date"
              value={start}
              min="1900-01-01"
              max="2100-01-01"
              onChange={(e) => {
                if (e.target.value) setStart(e.target.value);
              }}
            />
          </label>
          <Choice
            label="Approach window"
            value={days}
            onChange={setDays}
            options={[
              { value: "7", label: "Next 7 days" },
              { value: "30", label: "Next 30 days" },
              { value: "90", label: "Next 90 days" },
            ]}
          />
          <Choice
            label="Maximum approach distance"
            value={distance}
            onChange={setDistance}
            options={[
              { value: ".01", label: "Within 0.01 AU" },
              { value: ".05", label: "Within 0.05 AU" },
              { value: "0.1", label: "Within 0.10 AU" },
              { value: ".2", label: "Within 0.20 AU" },
            ]}
          />
          <Choice
            label="Sort close approaches"
            value={sort}
            onChange={setSort}
            options={[
              { value: "date", label: "Soonest first" },
              { value: "distance", label: "Nearest first" },
            ]}
          />
        </div>
      </Disclosure>
      {remote.loading && (
        <Loading label="Requesting close approaches from JPL…" />
      )}
      {remote.error && (
        <ErrorState message={remote.error} retry={remote.reload} />
      )}
      {remote.data && (
        <>
          <section className="panel approaches-panel">
            <div className="panel-topline">
              <h2>Upcoming encounters</h2>
              <Button
                variant="ghost"
                onClick={() =>
                  downloadJson(remote.data, "bao-close-approaches.json")
                }
              >
                <Download size={15} />
                Export
              </Button>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>OBJECT</TableHead>
                  <TableHead>CLOSEST APPROACH · TDB</TableHead>
                  <TableHead>DISTANCE</TableHead>
                  <TableHead>VELOCITY</TableHead>
                  <TableHead>DIAMETER</TableHead>
                  <TableHead>
                    <span className="sr-only">Details</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visibleItems.map((item) => (
                  <TableRow key={`${item.id}-${item.time}`}>
                    <TableCell>
                      <button
                        className="table-object"
                        onClick={() => {
                          setSelected(item);
                          setAnimate(false);
                        }}
                      >
                        {item.name}
                      </button>
                    </TableCell>
                    <TableCell className="mono">{item.time}</TableCell>
                    <TableCell>
                      {formatNumber(
                        item.distance_au === null
                          ? null
                          : (item.distance_au * AU_KM) / 384400,
                        2,
                      )}{" "}
                      LD{" "}
                      <small className="table-secondary">
                        {formatNumber(item.distance_au, 5)} AU
                      </small>
                    </TableCell>
                    <TableCell>
                      {formatNumber(item.velocity_km_s, 2)} km/s
                    </TableCell>
                    <TableCell>
                      {item.diameter_km === null ? (
                        <span className="muted">Unknown</span>
                      ) : (
                        `${formatNumber(item.diameter_km * 1000, 0)} m`
                      )}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={`Explore ${item.name}`}
                        onClick={() => {
                          setSelected(item);
                          setAnimate(false);
                        }}
                      >
                        <ArrowUpRight size={17} />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {items.length > 20 && (
              <div className="pagination-row">
                <span>
                  {items.length} approaches · page {page} of{" "}
                  {Math.ceil(items.length / 20)}
                </span>
                <div>
                  <Button
                    variant="ghost"
                    disabled={page === 1}
                    onClick={() => setPage(page - 1)}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="ghost"
                    disabled={page * 20 >= items.length}
                    onClick={() => setPage(page + 1)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
            {!items.length && (
              <div className="empty-state">
                <ScanLine size={30} />
                <h2>No close approaches in this window</h2>
                <p>Try a longer interval or a larger distance.</p>
              </div>
            )}
          </section>
          <p className="source-note">
            These are nominal close approaches, not impact predictions. 1 lunar
            distance (LD) = 384,400 km. Times are TDB, about a minute ahead of
            UTC in this era.{" "}
            <SourceLink href="https://ssd-api.jpl.nasa.gov/doc/cad.html">
              JPL data definitions
            </SourceLink>
          </p>
        </>
      )}
      <Sheet
        open={!!selected}
        onOpenChange={(open) => {
          if (!open) {
            setSelected(null);
            setAnimate(false);
          }
        }}
      >
        <SheetContent className="detail-sheet wide-sheet">
          {selected && (
            <>
              <SheetHeader>
                <SheetTitle>{selected.name}</SheetTitle>
                <SheetDescription>
                  Earth close approach · {selected.time} TDB
                </SheetDescription>
              </SheetHeader>
              <div className="sheet-body">
                <div className="metric-grid">
                  <Stat
                    label="Nominal distance"
                    value={formatNumber(selected.distance_au, 6)}
                    unit="AU"
                  />
                  <Stat
                    label="Relative velocity"
                    value={formatNumber(selected.velocity_km_s)}
                    unit="km/s"
                  />
                  <Stat
                    label="Distance lower bound"
                    value={formatNumber(selected.distance_min_au, 6)}
                    unit="AU"
                  />
                  <Stat
                    label="Distance upper bound"
                    value={formatNumber(selected.distance_max_au, 6)}
                    unit="AU"
                  />
                </div>
                <p className="muted small">
                  Distance bounds come from JPL’s uncertainty calculation. This
                  does not indicate an impact risk.
                </p>
                {!animate && (
                  <Button onClick={() => setAnimate(true)}>
                    <Play size={16} />
                    Load & animate encounter
                  </Button>
                )}
                {trajectory.loading && (
                  <Loading label="Requesting the Earth-relative path…" />
                )}
                {trajectory.error && (
                  <ErrorState
                    message={trajectory.error}
                    retry={trajectory.reload}
                  />
                )}{" "}
                {trajectory.data && <TrajectoryPlot data={trajectory.data} />}
                <h3>Orbital and physical data</h3>
                {details.loading && (
                  <p className="muted">Loading SBDB record…</p>
                )}
                {details.error && (
                  <ErrorState message={details.error} retry={details.reload} />
                )}{" "}
                {details.data && (
                  <details>
                    <summary>Inspect source record</summary>
                    <pre>{JSON.stringify(details.data.data, null, 2)}</pre>
                  </details>
                )}
                <SourceLink
                  href={`https://ssd.jpl.nasa.gov/tools/sbdb_lookup.html#/?sstr=${encodeURIComponent(selected.id)}`}
                >
                  Open JPL object record
                </SourceLink>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
