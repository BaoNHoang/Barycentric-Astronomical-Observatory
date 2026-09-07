// Reference values, not live measurements. SI units except where the name says otherwise.
// Planet radii, masses and periods: https://ssd.jpl.nasa.gov/planets/phys_par.html
export type CelestialBody = {
  id: string;
  name: string;
  kind: "Planet" | "Moon";
  parent: string;
  horizonsId: string;
  color: string;
  radiusKm: number;
  massKg: number;
  periodDays: number;
  semiMajorAu: number;
  gravity: number;
  dayHours: number;
  temperatureK: number | null;
  temperatureNote: string;
  description: string;
};
export const planets: CelestialBody[] = [
  {
    id: "mercury",
    name: "Mercury",
    kind: "Planet",
    parent: "Sun",
    horizonsId: "199",
    color: "#b8a999",
    radiusKm: 2439.4,
    massKg: 3.301e23,
    periodDays: 87.969,
    semiMajorAu: 0.3871,
    gravity: 3.7,
    dayHours: 1407.6,
    temperatureK: 440,
    temperatureNote: "Reference mean surface temperature",
    description:
      "A cratered rocky world with a very thin exosphere. Mercury circles the Sun in just 88 Earth days.",
  },
  {
    id: "venus",
    name: "Venus",
    kind: "Planet",
    parent: "Sun",
    horizonsId: "299",
    color: "#d9b77d",
    radiusKm: 6051.8,
    massKg: 4.867e24,
    periodDays: 224.701,
    semiMajorAu: 0.7233,
    gravity: 8.87,
    dayHours: -5832.5,
    temperatureK: 737,
    temperatureNote: "Reference mean surface temperature",
    description:
      "Wrapped in thick clouds and a dense carbon dioxide atmosphere, Venus is the hottest planet in our solar system.",
  },
  {
    id: "earth",
    name: "Earth",
    kind: "Planet",
    parent: "Sun",
    horizonsId: "399",
    color: "#6fa4df",
    radiusKm: 6371.0084,
    massKg: 5.9722e24,
    periodDays: 365.256,
    semiMajorAu: 1,
    gravity: 9.8,
    dayHours: 23.9345,
    temperatureK: 288,
    temperatureNote:
      "Reference mean surface temperature; varies with time and location",
    description:
      "Our ocean-covered home. Earth is the only world currently known to support life, with liquid water abundant on its surface.",
  },
  {
    id: "mars",
    name: "Mars",
    kind: "Planet",
    parent: "Sun",
    horizonsId: "499",
    color: "#db8868",
    radiusKm: 3389.5,
    massKg: 6.4171e23,
    periodDays: 686.98,
    semiMajorAu: 1.5237,
    gravity: 3.71,
    dayHours: 24.6229,
    temperatureK: 208,
    temperatureNote: "Reference mean surface temperature",
    description:
      "The red planet. A cold desert world with giant volcanoes, deep canyons, polar ice, and evidence of ancient rivers.",
  },
  {
    id: "jupiter",
    name: "Jupiter",
    kind: "Planet",
    parent: "Sun",
    horizonsId: "599",
    color: "#d1ad8d",
    radiusKm: 69911,
    massKg: 1.8982e27,
    periodDays: 4332.589,
    semiMajorAu: 5.2029,
    gravity: 24.79,
    dayHours: 9.925,
    temperatureK: 163,
    temperatureNote:
      "Reference atmosphere temperature at 1 bar; no solid surface",
    description:
      "The largest planet, a gas giant with swirling cloud bands and the long-lived Great Red Spot.",
  },
  {
    id: "saturn",
    name: "Saturn",
    kind: "Planet",
    parent: "Sun",
    horizonsId: "699",
    color: "#dfc89a",
    radiusKm: 58232,
    massKg: 5.6834e26,
    periodDays: 10759.22,
    semiMajorAu: 9.5367,
    gravity: 10.44,
    dayHours: 10.656,
    temperatureK: 133,
    temperatureNote:
      "Reference atmosphere temperature at 1 bar; no solid surface",
    description:
      "A gas giant surrounded by a broad system of icy rings. Saturn is less dense than water.",
  },
  {
    id: "uranus",
    name: "Uranus",
    kind: "Planet",
    parent: "Sun",
    horizonsId: "799",
    color: "#a7d9dd",
    radiusKm: 25362,
    massKg: 8.681e25,
    periodDays: 30685.4,
    semiMajorAu: 19.189,
    gravity: 8.69,
    dayHours: -17.24,
    temperatureK: 78,
    temperatureNote:
      "Reference atmosphere temperature at 1 bar; no solid surface",
    description:
      "A pale blue ice giant that rotates on its side. Methane in its atmosphere absorbs red light.",
  },
  {
    id: "neptune",
    name: "Neptune",
    kind: "Planet",
    parent: "Sun",
    horizonsId: "899",
    color: "#6b91e3",
    radiusKm: 24622,
    massKg: 1.02413e26,
    periodDays: 60189,
    semiMajorAu: 30.0699,
    gravity: 11.15,
    dayHours: 16.11,
    temperatureK: 73,
    temperatureNote:
      "Reference atmosphere temperature at 1 bar; no solid surface",
    description:
      "Dark, cold, and swept by powerful winds. Neptune takes about 165 Earth years to orbit the Sun.",
  },
];
export const moons: CelestialBody[] = [
  {
    id: "moon",
    name: "Moon",
    kind: "Moon",
    parent: "Earth",
    horizonsId: "301",
    color: "#bdbec4",
    radiusKm: 1737.4,
    massKg: 7.346e22,
    periodDays: 27.322,
    semiMajorAu: 0.00257,
    gravity: 1.62,
    dayHours: 655.72,
    temperatureK: null,
    temperatureNote: "Strong day–night variation",
    description:
      "Earth’s natural satellite. Its familiar phases come from the changing geometry of the Sun, Earth, and Moon.",
  },
  {
    id: "io",
    name: "Io",
    kind: "Moon",
    parent: "Jupiter",
    horizonsId: "501",
    color: "#ddc47c",
    radiusKm: 1821.6,
    massKg: 8.932e22,
    periodDays: 1.769,
    semiMajorAu: 0.002819,
    gravity: 1.796,
    dayHours: 42.46,
    temperatureK: null,
    temperatureNote: "No mean temperature provided",
    description: "A volcanic moon of Jupiter, heated by strong tidal forces.",
  },
  {
    id: "europa",
    name: "Europa",
    kind: "Moon",
    parent: "Jupiter",
    horizonsId: "502",
    color: "#d4c6af",
    radiusKm: 1560.8,
    massKg: 4.8e22,
    periodDays: 3.551,
    semiMajorAu: 0.004486,
    gravity: 1.314,
    dayHours: 85.22,
    temperatureK: null,
    temperatureNote: "No mean temperature provided",
    description:
      "An icy moon with strong evidence for a global ocean beneath its frozen crust.",
  },
  {
    id: "ganymede",
    name: "Ganymede",
    kind: "Moon",
    parent: "Jupiter",
    horizonsId: "503",
    color: "#a39a90",
    radiusKm: 2634.1,
    massKg: 1.4819e23,
    periodDays: 7.155,
    semiMajorAu: 0.007155,
    gravity: 1.428,
    dayHours: 171.72,
    temperatureK: null,
    temperatureNote: "No mean temperature provided",
    description:
      "The largest moon in our solar system, larger in diameter than Mercury.",
  },
  {
    id: "callisto",
    name: "Callisto",
    kind: "Moon",
    parent: "Jupiter",
    horizonsId: "504",
    color: "#958d80",
    radiusKm: 2410.3,
    massKg: 1.0759e23,
    periodDays: 16.689,
    semiMajorAu: 0.012585,
    gravity: 1.235,
    dayHours: 400.54,
    temperatureK: null,
    temperatureNote: "No mean temperature provided",
    description:
      "A heavily cratered moon preserving a long record of impacts in the outer solar system.",
  },
];
export const bodies = [...planets, ...moons];
export const bodySource = "https://ssd.jpl.nasa.gov/planets/phys_par.html";
export const moonSource = "https://ssd.jpl.nasa.gov/sats/phys_par/";
export const temperatureSource =
  "https://nssdc.gsfc.nasa.gov/planetary/factsheet/";
export function findBody(id: string) {
  return bodies.find((body) => body.id === id.toLowerCase());
}
