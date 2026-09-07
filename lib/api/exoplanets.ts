import snapshot from "@/data/exoplanets.json";
import { numberParam } from "@/lib/astronomy";
export type Exoplanet = {
  pl_name: string;
  hostname: string;
  discoverymethod: string;
  disc_year: number;
  pl_orbper: number | null;
  pl_orbsmax: number | null;
  pl_rade: number | null;
  pl_bmasse: number | null;
  pl_bmassprov: string | null;
  pl_eqt: number | null;
  sy_dist: number | null;
  st_teff: number | null;
  st_rad: number | null;
  st_mass: number | null;
  st_spectype: string | null;
  pl_radeerr1: number | null;
  pl_radeerr2: number | null;
  pl_bmasseerr1: number | null;
  pl_bmasseerr2: number | null;
  pl_orbeccen: number | null;
  sy_pnum: number | null;
  ra: number;
  dec: number;
};
export function searchExoplanets(params: URLSearchParams) {
  const search = (params.get("q") ?? "").trim().toLowerCase();
  const host = (params.get("host") ?? "").trim().toLowerCase();
  const method = params.get("method") ?? "";
  const maxRadius = numberParam(params.get("radius_earth_max"), 1000, 0, 1000);
  const maxDistance = numberParam(params.get("distance_ly_max"), 1e9, 0, 1e9);
  const page = Math.floor(numberParam(params.get("page"), 1, 1, 10000));
  const limit = Math.floor(numberParam(params.get("limit"), 24, 1, 100));
  const records = (snapshot.records as Exoplanet[]).filter(
    (planet) =>
      (!search ||
        `${planet.pl_name} ${planet.hostname}`
          .toLowerCase()
          .includes(search)) &&
      (!host || planet.hostname.toLowerCase() === host) &&
      (!method || planet.discoverymethod === method) &&
      (!params.has("radius_earth_max") ||
        (planet.pl_rade !== null && planet.pl_rade <= maxRadius)) &&
      (!params.has("distance_ly_max") ||
        (planet.sy_dist !== null && planet.sy_dist * 3.26156 <= maxDistance)),
  );
  const sort = params.get("sort") ?? "name";
  records.sort((a, b) =>
    sort === "distance"
      ? (a.sy_dist ?? Infinity) - (b.sy_dist ?? Infinity)
      : sort === "radius"
        ? (a.pl_rade ?? Infinity) - (b.pl_rade ?? Infinity)
        : sort === "newest"
          ? b.disc_year - a.disc_year
          : a.pl_name.localeCompare(b.pl_name),
  );
  return {
    total: records.length,
    catalog_total: snapshot.records.length,
    page,
    limit,
    results: records.slice((page - 1) * limit, page * limit),
    retrieved_at: snapshot.retrieved_at,
    source: "https://exoplanetarchive.ipac.caltech.edu/",
    table: "pscomppars",
    mode: "Bundled archive snapshot",
    units: {
      pl_rade: "Earth radii",
      pl_bmasse: "Earth masses; see pl_bmassprov",
      pl_orbper: "days",
      pl_orbsmax: "AU",
      pl_eqt: "K (modeled equilibrium temperature, not surface temperature)",
      sy_dist: "parsecs",
      st_teff: "K",
      st_rad: "Solar radii",
      st_mass: "Solar masses",
    },
    notes:
      "Missing measurements remain null. Composite parameters can combine publications. Error suffixes err1/err2 give upper/lower offsets.",
  };
}
