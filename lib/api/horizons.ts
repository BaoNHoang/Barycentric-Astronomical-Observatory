import { findBody } from "@/data/bodies";
import { missions } from "@/data/missions";
import { DAY_MS } from "@/lib/astronomy";
import { ApiError, fetchJson, retrievalTime } from "./http";
export type TrajectoryPoint = {
  time: string;
  position_au: { x: number; y: number; z: number };
  velocity_au_day: { x: number; y: number; z: number };
};
export type Trajectory = {
  target: string;
  origin: string;
  frame: string;
  time_scale: string;
  corrections: string;
  source: string;
  source_version: string;
  retrieved_at: string;
  points: TrajectoryPoint[];
};
export async function horizons(
  target: string,
  start: Date,
  end: Date,
  steps = 60,
  origin = "sun",
): Promise<Trajectory> {
  const asteroid = target.startsWith("asteroid:") ? target.slice(9) : null;
  if (asteroid && !/^[a-zA-Z0-9 -]{1,40}$/.test(asteroid))
    throw new ApiError("Invalid asteroid designation.");
  const id = asteroid
    ? `DES=${asteroid};`
    : (findBody(target)?.horizonsId ??
      missions.find((m) => m.id === target)?.horizonsId);
  if (!id)
    throw new ApiError("Choose a supported planet, moon, or spacecraft.");
  const center = { sun: "500@10", earth: "500@399", barycenter: "500@0" }[
    origin
  ];
  if (!center) throw new ApiError("Origin must be sun, earth, or barycenter.");
  const samples = Math.max(1, Math.min(240, Math.floor(steps)));
  const times = Array.from(
    { length: samples },
    (_, i) =>
      (start.getTime() +
        ((end.getTime() - start.getTime()) * i) / Math.max(1, samples - 1)) /
        DAY_MS +
      2440587.5,
  );
  const query = new URLSearchParams({
    format: "json",
    COMMAND: `'${id}'`,
    OBJ_DATA: "NO",
    MAKE_EPHEM: "YES",
    EPHEM_TYPE: "VECTORS",
    CENTER: `'${center}'`,
    REF_PLANE: "ECLIPTIC",
    REF_SYSTEM: "ICRF",
    OUT_UNITS: "AU-D",
    VEC_TABLE: "2",
    VEC_CORR: "NONE",
    CSV_FORMAT: "YES",
    TIME_TYPE: "UT",
    TLIST: `'${times.join(",")}'`,
  });
  const url = `https://ssd.jpl.nasa.gov/api/horizons.api?${query}`;
  const result = await fetchJson<{
    result?: string;
    error?: string;
    signature?: { version: string };
  }>(url);
  if (result.error)
    throw new ApiError(`JPL Horizons: ${result.error.slice(0, 350)}`, 422);
  const rows = result.result
    ?.split("$$SOE")[1]
    ?.split("$$EOE")[0]
    ?.trim()
    .split("\n");
  if (!rows?.length)
    throw new ApiError(
      "JPL has no trajectory for this target and date range. Try another date within the mission’s coverage.",
      422,
    );
  const points = rows.map((row) => {
    const fields = row.split(",").map((field) => field.trim());
    const values = [fields[0], ...fields.slice(2, 8)].map(Number);
    if (values.length !== 7 || values.some((v) => !Number.isFinite(v)))
      throw new ApiError("JPL returned an unexpected vector format.", 502);
    const [jd, x, y, z, vx, vy, vz] = values;
    return {
      time: new Date((jd - 2440587.5) * DAY_MS).toISOString(),
      position_au: { x, y, z },
      velocity_au_day: { x: vx, y: vy, z: vz },
    };
  });
  return {
    target,
    origin,
    frame: "J2000 ecliptic, ICRF reference system",
    time_scale:
      "UT: UTC after 1962; UT1 before 1962. Future UTC assumes currently known leap seconds.",
    corrections: "Geometric; no light-time or aberration correction",
    source: "https://ssd-api.jpl.nasa.gov/doc/horizons.html",
    source_version: result.signature?.version ?? "unknown",
    retrieved_at: retrievalTime(url),
    points,
  };
}
