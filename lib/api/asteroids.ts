import { fetchJson, retrievalTime } from "./http";
export async function closeApproaches(
  start: string,
  end: string,
  maxDistance: number,
) {
  const params = new URLSearchParams({
    "date-min": start,
    "date-max": end,
    "dist-max": String(maxDistance),
    diameter: "true",
    fullname: "true",
    sort: "date",
    limit: "200",
  });
  const url = `https://ssd-api.jpl.nasa.gov/cad.api?${params}`;
  const response = await fetchJson<{
    fields: string[];
    data?: string[][];
    count: string;
    signature: { version: string };
  }>(url, 1800);
  const results = (response.data ?? []).map((row) => {
    const record = Object.fromEntries(
      response.fields.map((field, i) => [field, row[i]]),
    );
    const number = (key: string) =>
      record[key] == null ? null : Number(record[key]);
    return {
      id: record.des,
      name: record.fullname?.trim() ?? record.des,
      time: record.cd,
      time_scale: "TDB",
      distance_au: number("dist"),
      distance_min_au: number("dist_min"),
      distance_max_au: number("dist_max"),
      velocity_km_s: number("v_rel"),
      diameter_km: number("diameter"),
      absolute_magnitude: number("h"),
      orbit_id: record.orbit_id,
    };
  });
  return {
    results,
    total: results.length,
    limit: 200,
    start,
    end,
    max_distance_au: maxDistance,
    source: "https://ssd-api.jpl.nasa.gov/doc/cad.html",
    source_version: response.signature.version,
    retrieved_at: retrievalTime(url),
    notes:
      "Nominal Earth close approaches, not impact predictions. Diameters are null when unavailable. Times are TDB.",
  };
}
