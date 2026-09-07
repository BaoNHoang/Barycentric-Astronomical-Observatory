"use client";
import { useState } from "react";
import {
  MapPin,
  Download,
  ChevronLeft,
  ChevronRight,
  LocateFixed,
} from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
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
} from "@/components/shared";
import type { SkyData } from "@/lib/api/sky";
import type { moonInfo } from "@/lib/astronomy";
type Location = { lat: number; lon: number; label: string };
export default function SkyExplorer({
  time,
  onTimeChange,
  location,
  onLocationChange,
}: {
  time: string;
  onTimeChange: (time: string) => void;
  location: Location;
  onLocationChange: (location: Location) => void;
}) {
  const [lat, setLat] = useState(String(location.lat)),
    [lon, setLon] = useState(String(location.lon)),
    [formError, setFormError] = useState(""),
    [constellations, setConstellations] = useState(true),
    [magnitude, setMagnitude] = useState(5);
  const query = new URLSearchParams({
    time,
    lat: String(location.lat),
    lon: String(location.lon),
    magnitude: String(magnitude),
    constellations: String(constellations),
  });
  const remote = useRemote<SkyData>(`/v1/charts/sky?${query}`);
  const lunar = useRemote<ReturnType<typeof moonInfo>>(
    `/v1/moon?${new URLSearchParams({ time, lat: String(location.lat), lon: String(location.lon) })}`,
  );
  const sun = remote.data?.objects.find((object) => object.name === "Sun");
  function applyLocation() {
    const a = Number(lat),
      b = Number(lon);
    if (
      !lat ||
      !lon ||
      !Number.isFinite(a) ||
      !Number.isFinite(b) ||
      Math.abs(a) > 90 ||
      Math.abs(b) > 180
    ) {
      setFormError("Use latitude −90 to 90 and longitude −180 to 180.");
      return;
    }
    setFormError("");
    onLocationChange({
      lat: a,
      lon: b,
      label: `${a.toFixed(2)}°, ${b.toFixed(2)}°`,
    });
  }
  function locate() {
    if (!navigator.geolocation) {
      setFormError(
        "Location is unavailable in this browser. Enter your coordinates.",
      );
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (result) => {
        const a = Number(result.coords.latitude.toFixed(4)),
          b = Number(result.coords.longitude.toFixed(4));
        setLat(String(a));
        setLon(String(b));
        onLocationChange({ lat: a, lon: b, label: "Your location" });
        setFormError("");
      },
      () =>
        setFormError(
          "Location was not available. You can enter coordinates instead.",
        ),
      { timeout: 10000 },
    );
  }
  function shift(hours: number) {
    const next = new Date(Date.parse(time) + hours * 3600000);
    if (next.getUTCFullYear() >= 1900 && next.getUTCFullYear() <= 2100)
      onTimeChange(next.toISOString());
  }
  return (
    <div>
      <PageHeading title="Sky chart">
        <Button variant="outline" asChild>
          <a
            href={`/v1/charts/sky?${query}&format=svg&download=true`}
            download="bao-sky-chart.svg"
          >
            <Download size={16} />
            Save star chart
          </a>
        </Button>
      </PageHeading>
      <div className="sky-layout">
        <section className="panel sky-panel">
          <div className="panel-topline">
            <span>
              <MapPin size={15} />
              {location.label}
            </span>
            <span className="muted small">
              {sun && sun.altitude > -6
                ? "Daylight / twilight"
                : "Sky projection"}
            </span>
          </div>
          {remote.loading && <Loading label="Mapping your sky…" />}
          {remote.error && (
            <ErrorState message={remote.error} retry={remote.reload} />
          )}
          <img
            key={query.toString()}
            className={`sky-map ${remote.loading ? "is-loading" : ""}`}
            src={`/v1/charts/sky?${query}&format=svg`}
            alt={`Star chart above ${location.label} at ${time}, north up and east left`}
            onError={() => {}}
          />
          <div className="sky-legend">
            <span>{time.slice(0, 16).replace("T", " ")} UTC</span>
            <span>
              <i className="legend-dot warm" />
              Sun, Moon & planets
            </span>
            <span>
              <i className="legend-dot" />
              Catalog stars
            </span>
            <span>Zenith at center · horizon at edge</span>
          </div>
        </section>
        <aside className="sky-settings">
          <Disclosure title="Location, date & chart settings">
            <div className="form-row">
              <label>
                Latitude
                <Input
                  value={lat}
                  onChange={(e) => setLat(e.target.value)}
                  type="number"
                  min={-90}
                  max={90}
                  step="any"
                />
              </label>
              <label>
                Longitude
                <Input
                  value={lon}
                  onChange={(e) => setLon(e.target.value)}
                  type="number"
                  min={-180}
                  max={180}
                  step="any"
                />
              </label>
            </div>
            <p className="muted small">
              North and east are positive. Coordinates are in degrees.
            </p>
            <div className="button-row">
              <Button onClick={applyLocation}>Update chart</Button>
              <Button
                variant="outline"
                size="icon"
                aria-label="Use my location"
                onClick={locate}
              >
                <LocateFixed size={17} />
              </Button>
            </div>
            {formError && (
              <p role="alert" className="form-error">
                {formError}
              </p>
            )}
            <label className="form-label">
              Date & time · UTC
              <Input
                type="datetime-local"
                value={time.slice(0, 16)}
                min="1900-01-01T00:00"
                max="2100-12-31T23:59"
                onChange={(e) => {
                  if (e.currentTarget.validity.valid && e.target.value)
                    onTimeChange(new Date(e.target.value + "Z").toISOString());
                }}
              />
            </label>
            <div className="button-row">
              <Button variant="outline" onClick={() => shift(-1)}>
                <ChevronLeft size={15} />1 hour
              </Button>
              <Button variant="outline" onClick={() => shift(1)}>
                1 hour
                <ChevronRight size={15} />
              </Button>
            </div>
            <div className="setting-row">
              <label htmlFor="constellation-toggle">Constellation lines</label>
              <Switch
                id="constellation-toggle"
                checked={constellations}
                onCheckedChange={setConstellations}
              />
            </div>
            <label className="slider-label">
              Faintest stars <span>Magnitude {magnitude.toFixed(1)}</span>
            </label>
            <Slider
              aria-label="Faintest star magnitude"
              min={1}
              max={6}
              step={0.5}
              value={[magnitude]}
              onValueChange={(value) => setMagnitude(value[0])}
            />
            <p className="muted small">Higher magnitudes show fainter stars.</p>
          </Disclosure>
          <Disclosure
            title={
              lunar.data
                ? "Moon · " + lunar.data.phase
                : "Moon phase & rise times"
            }
            className="moon-summary"
          >
            {lunar.loading && <p className="muted">Calculating phase…</p>}
            {lunar.error && (
              <ErrorState message={lunar.error} retry={lunar.reload} />
            )}{" "}
            {lunar.data && (
              <>
                <h3>{lunar.data.phase}</h3>
                <div className="metric-grid">
                  <Stat
                    label="Illuminated"
                    value={formatNumber(lunar.data.illumination * 100, 1)}
                    unit="%"
                  />
                  <Stat
                    label="Phase angle"
                    value={formatNumber(lunar.data.phase_angle_deg, 1)}
                    unit="°"
                  />
                </div>
                <div className="rise-set">
                  <span>
                    Next moonrise{" "}
                    <b>
                      {lunar.data.next_rise
                        ? new Date(lunar.data.next_rise).toLocaleString(
                            "en-US",
                            {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                              timeZone: "UTC",
                            },
                          ) + " UTC"
                        : "None in next 48h"}
                    </b>
                  </span>
                  <span>
                    Next moonset{" "}
                    <b>
                      {lunar.data.next_set
                        ? new Date(lunar.data.next_set).toLocaleString(
                            "en-US",
                            {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                              timeZone: "UTC",
                            },
                          ) + " UTC"
                        : "None in next 48h"}
                    </b>
                  </span>
                </div>
              </>
            )}
          </Disclosure>
        </aside>
      </div>
      {remote.data && (
        <Disclosure
          title="Objects above the horizon"
          className="visibility-panel"
        >
          <p className="muted">
            Geometric visibility. Daylight, clouds, terrain, and light pollution
            affect what you can actually see.
          </p>
          <div className="visibility-grid">
            {remote.data.objects
              .filter((object) => object.altitude >= 0)
              .map((object) => (
                <div key={object.name}>
                  <span>{object.name}</span>
                  <strong>{object.altitude.toFixed(1)}°</strong>
                  <small>altitude · az {object.azimuth.toFixed(0)}°</small>
                </div>
              ))}
          </div>
        </Disclosure>
      )}
      <p className="source-note">
        J2000 stars precessed to the selected date. Proper motion is omitted;
        standard refraction is included.{" "}
        <SourceLink href="https://github.com/ofrohn/d3-celestial">
          XHIP via d3-celestial
        </SourceLink>
      </p>
    </div>
  );
}
