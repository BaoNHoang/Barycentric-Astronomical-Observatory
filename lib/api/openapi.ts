// A compact OpenAPI index. The playground shows concrete requests and responses.
const query = (name: string, type = "string", description = "") => ({
  name,
  in: "query",
  required: false,
  description,
  schema: { type },
});
const pathId = (name = "id") => ({
  name,
  in: "path",
  required: true,
  schema: { type: "string" },
});
const operation = (summary: string, parameters: unknown[] = []) => ({
  get: {
    summary,
    parameters,
    responses: {
      "200": { description: "Data with source and unit metadata" },
      "400": { description: "Invalid parameters" },
      "422": { description: "No ephemeris coverage" },
      "502": { description: "Upstream source unavailable" },
    },
  },
});
export const openapi = {
  openapi: "3.1.0",
  info: {
    title: "Barycentric Astronomical Observatory API",
    version: "1.0.0",
    description:
      "Private hosted API; local development access does not require authentication. Read the response metadata for units, frames, and scientific limitations.",
  },
  servers: [{ url: "/" }],
  paths: {
    "/v1/health": operation("Service health"),
    "/v1/bodies": operation("Planet and moon catalog", [query("q")]),
    "/v1/bodies/{id}": operation("Body reference properties", [pathId()]),
    "/v1/positions": operation("Position and velocity", [
      query("target"),
      query("time", "string", "ISO date or timestamp with timezone"),
      query("engine", "string", "astronomy (default) or horizons"),
      query("origin", "string", "sun, earth, barycenter"),
      query("lat", "number"),
      query("lon", "number"),
    ]),
    "/v1/moon": operation("Moon phase and rise/set", [
      query("time"),
      query("lat", "number"),
      query("lon", "number"),
    ]),
    "/v1/exoplanets": operation("Search the archive snapshot", [
      query("q"),
      query("host"),
      query("method"),
      query("radius_earth_max", "number"),
      query("distance_ly_max", "number"),
      query("sort", "string", "name, distance, radius, newest"),
      query("page", "integer"),
      query("limit", "integer"),
    ]),
    "/v1/stars/{id}/planets": operation("Host star system", [
      pathId(),
      query("page", "integer"),
      query("limit", "integer"),
    ]),
    "/v1/asteroids/close-approaches": operation("Earth close approaches", [
      query("start"),
      query("end"),
      query("distance_au_max", "number"),
    ]),
    "/v1/asteroids/{id}": operation(
      "JPL small-body orbital and physical record",
      [pathId()],
    ),
    "/v1/spacecraft": operation("Supported spacecraft"),
    "/v1/trajectories": operation("JPL trajectory samples", [
      query(
        "target",
        "string",
        "A body, mission alias, or asteroid:designation",
      ),
      query("start"),
      query("end"),
      query("samples", "integer"),
      query("origin"),
    ]),
    "/v1/images": operation("NASA image search", [
      query("q"),
      query("mission"),
      query("year"),
      query("page", "integer"),
    ]),
    "/v1/charts/sky": operation("Location and time specific star chart", [
      query("lat", "number"),
      query("lon", "number"),
      query("time"),
      query("magnitude", "number"),
      query("constellations", "boolean"),
      query("labels", "boolean"),
      query("format", "string", "json (default) or svg"),
      query("download", "boolean"),
    ]),
  },
};
