// These examples are also the API playground menu. The API itself lives in app/v1/.
export const endpoints = [
  {
    id: "bodies",
    name: "Celestial bodies",
    path: "/v1/bodies",
    description: "Search the planet and moon reference catalog.",
  },
  {
    id: "body",
    name: "Object details",
    path: "/v1/bodies/mars",
    description: "Physical properties, named units, and source references.",
  },
  {
    id: "positions",
    name: "Planet position",
    path: "/v1/positions?target=mars&origin=sun",
    description:
      "Analytical geometric coordinates and observer altitude / azimuth.",
  },
  {
    id: "precise",
    name: "Precise JPL position",
    path: "/v1/positions?target=mars&engine=horizons&origin=barycenter",
    description:
      "JPL geometric state in the J2000 ecliptic frame, relative to the solar system barycenter.",
  },
  {
    id: "moon",
    name: "Moon phase",
    path: "/v1/moon?lat=37.09&lon=-76.47",
    description: "Illumination, named phase, and next moonrise and moonset.",
  },
  {
    id: "exoplanets",
    name: "Exoplanet catalog",
    path: "/v1/exoplanets?radius_earth_max=2&sort=distance&limit=10",
    description:
      "Search the archive snapshot. Radius is in Earth radii; temperature is equilibrium temperature.",
  },
  {
    id: "stars",
    name: "Host star system",
    path: "/v1/stars/TRAPPIST-1/planets",
    description: "Exoplanets and host-star properties for a named system.",
  },
  {
    id: "asteroids",
    name: "Close approaches",
    path: "/v1/asteroids/close-approaches?distance_au_max=0.1",
    description:
      "Upcoming Earth close approaches from JPL SBDB. Dates are TDB.",
  },
  {
    id: "asteroid",
    name: "Asteroid properties",
    path: "/v1/asteroids/433",
    description:
      "Orbital and physical parameters with JPL’s original units and uncertainty fields.",
  },
  {
    id: "spacecraft",
    name: "Spacecraft catalog",
    path: "/v1/spacecraft",
    description: "Mission metadata and supported spacecraft identifiers.",
  },
  {
    id: "trajectories",
    name: "Trajectory samples",
    path: "/v1/trajectories?target=voyager-1&samples=30&origin=sun",
    description: "Sampled position and velocity vectors from JPL Horizons.",
  },
  {
    id: "images",
    name: "NASA imagery",
    path: "/v1/images?mission=curiosity",
    description:
      "NASA image search with image URLs, credits, dates, and source links.",
  },
  {
    id: "sky",
    name: "Custom sky chart",
    path: "/v1/charts/sky?lat=37.09&lon=-76.47&magnitude=5",
    description:
      "Above-horizon stars, constellation segments and solar system objects. Add format=svg for an image.",
  },
];
