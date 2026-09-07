// Run with: node scripts/refresh-catalog.mjs
// These public snapshots make browsing reliable without a database or API key.
import { writeFile, mkdir } from "node:fs/promises";
await mkdir("data", { recursive: true });
async function save(name, url, transform = (data) => data) {
  const response = await fetch(url, { signal: AbortSignal.timeout(120000) });
  if (!response.ok) throw new Error(`${name}: HTTP ${response.status}`);
  const records = transform(await response.json());
  const snapshot = {
    source: url,
    retrieved_at: new Date().toISOString(),
    records,
  };
  await writeFile(`data/${name}.json`, JSON.stringify(snapshot));
  console.log(`${name}: ${records.length} records`);
}
const columns = [
  "pl_name",
  "hostname",
  "discoverymethod",
  "disc_year",
  "pl_orbper",
  "pl_orbsmax",
  "pl_rade",
  "pl_bmasse",
  "pl_bmassprov",
  "pl_eqt",
  "sy_dist",
  "st_teff",
  "st_rad",
  "st_mass",
  "st_spectype",
  "pl_radeerr1",
  "pl_radeerr2",
  "pl_bmasseerr1",
  "pl_bmasseerr2",
  "pl_orbeccen",
  "sy_pnum",
  "ra",
  "dec",
];
const query = `select ${columns.join(",")} from pscomppars order by pl_name`;
await save(
  "exoplanets",
  `https://exoplanetarchive.ipac.caltech.edu/TAP/sync?query=${encodeURIComponent(query)}&format=json`,
);
await save(
  "stars",
  "https://raw.githubusercontent.com/ofrohn/d3-celestial/master/data/stars.6.json",
  (data) =>
    data.features.map((star) => ({
      id: star.id,
      ra: star.geometry.coordinates[0],
      dec: star.geometry.coordinates[1],
      magnitude: star.properties.mag,
      color: star.properties.bv,
    })),
);
await save(
  "constellations",
  "https://raw.githubusercontent.com/ofrohn/d3-celestial/master/data/constellations.lines.json",
  (data) =>
    data.features.map((line) => ({
      name: line.properties.name,
      lines: line.geometry.coordinates,
    })),
);
