import catalog from "./explorer-systems.json";
import { planets } from "./bodies";

export type ExplorerPlanet = {
  id: string;
  name: string;
  color: string;
  radiusEarth: number | null;
  semiMajorAu: number;
  periodDays: number;
  temperatureK: number | null;
  description: string;
  texture?: string;
};
export type ExplorerSystem = {
  id: string;
  name: string;
  star: string;
  color: string;
  distance: string;
  description: string;
  source: string;
  planets: ExplorerPlanet[];
};

function exoplanets(host: string): ExplorerPlanet[] {
  const colors = [
    "#bca394",
    "#d2a378",
    "#b6a79b",
    "#9ca3b9",
    "#d4beb0",
    "#9aaeb8",
    "#b1a9ce",
    "#b9c5d0",
  ];
  return catalog.records
    .filter(
      (p) => p.host === host && p.semiMajorAu !== null && p.periodDays !== null,
    )
    .sort((a, b) => a.semiMajorAu! - b.semiMajorAu!)
    .map((p, index) => ({
      id: p.name,
      name: p.name,
      color: colors[index % colors.length],
      radiusEarth: p.radiusEarth,
      semiMajorAu: p.semiMajorAu!,
      periodDays: p.periodDays!,
      temperatureK: p.temperatureK,
      description: `${p.name} was discovered through transits of its host star; its discovery was announced in ${p.discoveryYear}. Each transit reveals information about the planet’s size and orbit. Its surface appearance is unknown; this globe uses an illustrative color.`,
    }));
}

export const explorerCatalogDate = catalog.retrieved_at.slice(0, 10);
export const systems: ExplorerSystem[] = [
  {
    id: "solar",
    name: "Solar system",
    star: "Sun · G-type star",
    color: "#ffd9a5",
    distance: "Our home system",
    description:
      "Eight planets orbit our star, from the small rocky worlds of the inner Solar System to the gas and ice giants beyond the asteroid belt. Select any planet to fly closer and examine its globe.",
    source: "https://science.nasa.gov/solar-system/",
    planets: planets.map((p) => ({
      id: p.id,
      name: p.name,
      color: p.color,
      texture: p.id,
      radiusEarth: p.radiusKm / 6371,
      semiMajorAu: p.semiMajorAu,
      periodDays: p.periodDays,
      temperatureK: p.temperatureK,
      description: p.description,
    })),
  },
  {
    id: "trappist-1",
    name: "TRAPPIST-1",
    star: "Ultracool red dwarf",
    color: "#ff8f60",
    distance: "About 40 light-years away",
    description:
      "Seven Earth-sized planets crowd around an ultracool dwarf star. Their short orbital periods make this a strikingly compact system. A planet’s location in the habitable zone does not establish that it has an atmosphere, oceans or life.",
    source: "https://science.nasa.gov/exoplanets/trappist1/",
    planets: exoplanets("TRAPPIST-1"),
  },
  {
    id: "kepler-90",
    name: "Kepler-90",
    star: "G-type star",
    color: "#ffe1a1",
    distance: "In the Milky Way",
    description:
      "Like our Solar System, Kepler-90 has eight known planets. Unlike ours, its planets are packed into a region about the size of Earth’s orbit. Small inner worlds and larger outer planets make it a useful comparison with home.",
    source:
      "https://science.nasa.gov/exoplanets/other-stars-other-worlds/a-near-twin-of-our-solar-system-lets-take-a-closer-look/",
    planets: exoplanets("Kepler-90"),
  },
];
