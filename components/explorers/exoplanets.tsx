"use client";
import { useState } from "react";
import {
  Search,
  ArrowUpRight,
  Download,
  ChevronLeft,
  ChevronRight,
  Globe2,
  Orbit,
} from "@/components/icons";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/bao-sheet";
import {
  Choice,
  PageHeading,
  Disclosure,
  Stat,
  Loading,
  ErrorState,
  SourceLink,
  useRemote,
  useDebounced,
  formatNumber,
  formatDate,
  downloadJson,
} from "@/components/shared";
import SystemOrbits from "@/components/system-orbits";
import RadiusComparison from "@/components/radius-comparison";
import type { Exoplanet } from "@/lib/api/exoplanets";
type Catalog = {
  total: number;
  catalog_total: number;
  page: number;
  limit: number;
  results: Exoplanet[];
  retrieved_at: string;
  mode: string;
};
export default function Exoplanets() {
  const [search, setSearch] = useState(""),
    [sort, setSort] = useState("distance"),
    [size, setSize] = useState("all"),
    [method, setMethod] = useState("all"),
    [page, setPage] = useState(1),
    [selected, setSelected] = useState<Exoplanet | null>(null);
  const settled = useDebounced(search),
    params = new URLSearchParams({
      q: settled,
      sort,
      page: String(page),
      limit: "12",
    });
  if (size !== "all") params.set("radius_earth_max", size);
  if (method !== "all") params.set("method", method);
  const remote = useRemote<Catalog>(`/v1/exoplanets?${params}`);
  const siblings = useRemote<Catalog>(
    selected
      ? `/v1/stars/${encodeURIComponent(selected.hostname)}/planets`
      : null,
  );
  function clear() {
    setSearch("");
    setSize("all");
    setMethod("all");
    setPage(1);
  }
  return (
    <div>
      <PageHeading title="Exoplanets" />
      <div className="catalog-toolbar panel">
        <div className="search-box">
          <Search size={18} />
          <Input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search planets or host stars…"
            aria-label="Search exoplanets"
          />
        </div>
        <Disclosure title="Filters & sort" className="filter-disclosure">
          <div className="settings-line">
            <Choice
              label="Planet radius filter"
              value={size}
              onChange={(value) => {
                setSize(value);
                setPage(1);
              }}
              options={[
                { value: "all", label: "All planet sizes" },
                { value: "1.5", label: "Radius ≤ 1.5 Earth" },
                { value: "2", label: "Radius ≤ 2 Earth" },
                { value: "4", label: "Radius ≤ 4 Earth" },
              ]}
            />
            <Choice
              label="Discovery method"
              value={method}
              onChange={(value) => {
                setMethod(value);
                setPage(1);
              }}
              options={[
                { value: "all", label: "All discoveries" },
                { value: "Transit", label: "Transit" },
                { value: "Radial Velocity", label: "Radial velocity" },
                { value: "Imaging", label: "Direct imaging" },
                { value: "Microlensing", label: "Microlensing" },
              ]}
            />
            <Choice
              label="Sort planets"
              value={sort}
              onChange={(value) => {
                setSort(value);
                setPage(1);
              }}
              options={[
                { value: "distance", label: "Nearest first" },
                { value: "name", label: "Name A–Z" },
                { value: "newest", label: "Discovery year" },
                { value: "radius", label: "Smallest first" },
              ]}
            />
          </div>
        </Disclosure>
      </div>
      {remote.loading && <Loading label="Loading exoplanets…" />}
      {remote.error && (
        <ErrorState message={remote.error} retry={remote.reload} />
      )}
      {remote.data && (
        <>
          <div className="results-bar">
            <span>
              {formatNumber(remote.data.total, 0)} worlds{" "}
              <span className="muted">
                · snapshot {formatDate(remote.data.retrieved_at)}
              </span>
            </span>
            <button className="text-button" onClick={clear}>
              Reset filters
            </button>
          </div>
          <div className="exoplanet-list">
            <div className="exoplanet-columns" aria-hidden="true">
              <span>Planet / host star</span>
              <span>Distance from Earth</span>
              <span>Radius</span>
              <span />
            </div>
            {remote.data.results.map((planet) => (
              <button
                className="exoplanet-row"
                key={planet.pl_name}
                onClick={() => setSelected(planet)}
                aria-label={"View " + planet.pl_name}
              >
                <span>
                  <strong>{planet.pl_name}</strong>
                  <small>{planet.hostname}</small>
                </span>
                <span>
                  {planet.sy_dist === null
                    ? "Unknown"
                    : formatNumber(planet.sy_dist * 3.26156, 1) + " ly"}
                </span>
                <span>
                  {planet.pl_rade === null
                    ? "Unknown"
                    : formatNumber(planet.pl_rade) + " R⊕"}
                </span>
                <ArrowUpRight size={18} />
              </button>
            ))}
          </div>
          {!remote.data.results.length && (
            <div className="empty-state">
              <Globe2 size={30} />
              <h2>No worlds found</h2>
              <p>Try another name or broaden your filters.</p>
              <Button variant="outline" onClick={clear}>
                Reset filters
              </Button>
            </div>
          )}
          <div className="pagination-row">
            <span>
              Page {page} of {Math.max(1, Math.ceil(remote.data.total / 12))}
            </span>
            <div>
              <Button
                variant="outline"
                disabled={page === 1}
                onClick={() => setPage((value) => value - 1)}
              >
                <ChevronLeft size={16} />
                Previous
              </Button>
              <Button
                variant="outline"
                disabled={page * 12 >= remote.data.total}
                onClick={() => setPage((value) => value + 1)}
              >
                Next
                <ChevronRight size={16} />
              </Button>
            </div>
          </div>
        </>
      )}
      <Disclosure title="Catalog notes & source">
        <p className="source-note">
          Equilibrium temperature is a modeled estimate, not surface
          temperature. Missing measurements stay unknown.{" "}
          <SourceLink href="https://exoplanetarchive.ipac.caltech.edu/">
            NASA Exoplanet Archive
          </SourceLink>
        </p>
      </Disclosure>
      <Sheet
        open={!!selected}
        onOpenChange={(open) => {
          if (!open) setSelected(null);
        }}
      >
        <SheetContent className="detail-sheet">
          {selected && (
            <>
              <SheetHeader>
                <SheetTitle>{selected.pl_name}</SheetTitle>
                <SheetDescription>
                  {selected.discoverymethod} · reported discovery{" "}
                  {selected.disc_year}
                </SheetDescription>
              </SheetHeader>
              <div className="sheet-body">
                <Disclosure title="Compare radius with Earth">
                  <RadiusComparison
                    radius={selected.pl_rade}
                    name={selected.pl_name}
                  />
                </Disclosure>
                <div className="metric-grid">
                  <Stat
                    label="Radius"
                    value={formatNumber(selected.pl_rade)}
                    unit={selected.pl_rade === null ? "" : "R⊕"}
                    sub={
                      selected.pl_radeerr1 !== null
                        ? `+${selected.pl_radeerr1} / ${selected.pl_radeerr2} R⊕`
                        : undefined
                    }
                  />
                  <Stat
                    label="Mass"
                    value={formatNumber(selected.pl_bmasse)}
                    unit={selected.pl_bmasse === null ? "" : "M⊕"}
                    sub={selected.pl_bmassprov ?? "No mass provenance"}
                  />
                  <Stat
                    label="Orbital period"
                    value={formatNumber(selected.pl_orbper)}
                    unit="days"
                  />
                  <Stat
                    label="Equilibrium temperature"
                    value={formatNumber(selected.pl_eqt, 0)}
                    unit={selected.pl_eqt === null ? "" : "K"}
                  />
                  <Stat
                    label="Distance from Earth"
                    value={
                      selected.sy_dist === null
                        ? "Unknown"
                        : formatNumber(selected.sy_dist * 3.26156)
                    }
                    unit={selected.sy_dist === null ? "" : "ly"}
                  />
                  <Stat
                    label="Semimajor axis"
                    value={formatNumber(selected.pl_orbsmax, 3)}
                    unit="AU"
                  />
                </div>
                <h3>Host star · {selected.hostname}</h3>
                <div className="metric-grid">
                  <Stat
                    label="Stellar mass"
                    value={formatNumber(selected.st_mass)}
                    unit="M☉"
                  />
                  <Stat
                    label="Stellar radius"
                    value={formatNumber(selected.st_rad)}
                    unit="R☉"
                  />
                  <Stat
                    label="Effective temperature"
                    value={formatNumber(selected.st_teff, 0)}
                    unit="K"
                  />
                  <Stat
                    label="Spectral type"
                    value={selected.st_spectype || "Unknown"}
                  />
                </div>
                <h3>Planets in this system</h3>
                {siblings.data && (
                  <SystemOrbits
                    planets={siblings.data.results}
                    selected={selected.pl_name}
                    onSelect={setSelected}
                  />
                )}
                {siblings.loading && (
                  <p className="muted">Loading this system…</p>
                )}
                {siblings.error && (
                  <ErrorState
                    message={siblings.error}
                    retry={siblings.reload}
                  />
                )}
                <div className="sibling-list">
                  {siblings.data?.results.map((planet) => (
                    <button
                      key={planet.pl_name}
                      onClick={() => setSelected(planet)}
                      className={
                        planet.pl_name === selected.pl_name ? "active" : ""
                      }
                    >
                      <Orbit size={20} />
                      <span>{planet.pl_name}</span>
                      <small>{formatNumber(planet.pl_orbper)} d</small>
                    </button>
                  ))}
                </div>
                <p className="muted small">
                  Mass may be an estimate or M sin i; see provenance above.
                  Archive composite parameters can combine multiple
                  publications. Radius diagrams are comparisons, not
                  photographs.
                </p>
                <Button
                  onClick={() =>
                    downloadJson(
                      selected,
                      `bao-${selected.pl_name.replaceAll(" ", "-")}.json`,
                    )
                  }
                >
                  <Download size={16} />
                  Download record
                </Button>
                <SourceLink
                  href={`https://exoplanetarchive.ipac.caltech.edu/overview/${encodeURIComponent(selected.pl_name)}`}
                >
                  Open archive references
                </SourceLink>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
