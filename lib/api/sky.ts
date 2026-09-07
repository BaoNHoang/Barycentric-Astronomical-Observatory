import * as Astro from "astronomy-engine";
import stars from "@/data/stars.json";
import constellations from "@/data/constellations.json";
import { planets } from "@/data/bodies";
const names: Record<string, string> = {
  "32349": "Sirius",
  "30438": "Canopus",
  "69673": "Arcturus",
  "91262": "Vega",
  "24608": "Capella",
  "24436": "Rigel",
  "37279": "Procyon",
  "27989": "Betelgeuse",
  "97649": "Altair",
  "21421": "Aldebaran",
  "80763": "Antares",
  "65474": "Spica",
  "37826": "Pollux",
  "113368": "Fomalhaut",
  "11767": "Polaris",
  "102098": "Deneb",
};
export function buildSky(
  time: Date,
  latitude: number,
  longitude: number,
  magnitude = 5,
  showConstellations = true,
) {
  const observer = new Astro.Observer(latitude, longitude, 0);
  const rotation = Astro.Rotation_EQJ_EQD(time);
  function horizontal(ra: number, dec: number) {
    const vector = Astro.VectorFromSphere(
      new Astro.Spherical(dec, ra, 1),
      time,
    );
    const equatorial = Astro.EquatorFromVector(
      Astro.RotateVector(rotation, vector),
    );
    return Astro.Horizon(
      time,
      observer,
      equatorial.ra,
      equatorial.dec,
      "normal",
    );
  }
  const visibleStars = stars.records
    .filter((star) => star.magnitude <= magnitude)
    .map((star) => {
      const h = horizontal(star.ra, star.dec);
      return {
        id: star.id,
        name: names[String(star.id)] ?? null,
        magnitude: star.magnitude,
        altitude: h.altitude,
        azimuth: h.azimuth,
      };
    })
    .filter((star) => star.altitude >= 0);
  const lines = showConstellations
    ? constellations.records.flatMap((group) =>
        group.lines.flatMap((line) => {
          const points = line.map(([ra, dec]) => horizontal(ra, dec));
          return points
            .slice(1)
            .flatMap((point, i) =>
              points[i].altitude >= 0 && point.altitude >= 0
                ? [[points[i], point]]
                : [],
            );
        }),
      )
    : [];
  const objects = [
    ...planets.filter((planet) => planet.id !== "earth").map((p) => p.name),
    "Sun",
    "Moon",
  ].map((name) => {
    const eq = Astro.Equator(name as Astro.Body, time, observer, true, true);
    const h = Astro.Horizon(time, observer, eq.ra, eq.dec, "normal");
    return { name, altitude: h.altitude, azimuth: h.azimuth };
  });
  return {
    time: time.toISOString(),
    latitude,
    longitude,
    magnitude_limit: magnitude,
    stars: visibleStars,
    constellations: lines,
    objects,
    source: "https://github.com/ofrohn/d3-celestial",
    method:
      "J2000 catalog precessed to equator of date; standard atmospheric refraction. Stellar proper motion omitted. Chart is geometric visibility, not a weather forecast.",
    projection: "Azimuthal equidistant; north up, east left, looking up",
    catalog_stars: stars.records.length,
  };
}
export type SkyData = ReturnType<typeof buildSky>;
// Looking up at the sky places east on the left, unlike a ground map.
function point(altitude: number, azimuth: number) {
  const radius = ((90 - altitude) / 90) * 270,
    angle = (azimuth * Math.PI) / 180;
  return {
    x: 320 - radius * Math.sin(angle),
    y: 320 - radius * Math.cos(angle),
  };
}
function escapeText(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
export function skySvg(data: SkyData, labels = true) {
  const svg = [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" role="img"><title>Sky chart at ${data.latitude}, ${data.longitude}, ${data.time}</title><rect width="640" height="640" fill="#0b1019"/><circle cx="320" cy="320" r="270" fill="#0e1624" stroke="#344155"/>`,
  ];
  for (const radius of [90, 180])
    svg.push(
      `<circle cx="320" cy="320" r="${radius}" fill="none" stroke="#202e41" stroke-dasharray="3 7"/>`,
    );
  svg.push(
    '<path d="M50 320H590M320 50V590" stroke="#202e41" stroke-dasharray="3 7"/>',
  );
  for (const [a, b] of data.constellations) {
    const p = point(a.altitude, a.azimuth),
      q = point(b.altitude, b.azimuth);
    svg.push(
      `<path d="M${p.x.toFixed(2)} ${p.y.toFixed(2)}L${q.x.toFixed(2)} ${q.y.toFixed(2)}" stroke="#587296" opacity=".4"/>`,
    );
  }
  for (const star of data.stars) {
    const p = point(star.altitude, star.azimuth),
      r = Math.max(0.65, 2.8 - star.magnitude * 0.38);
    svg.push(
      `<circle cx="${p.x.toFixed(2)}" cy="${p.y.toFixed(2)}" r="${r}" fill="#d3e2f5"/>`,
    );
    if (labels && star.name)
      svg.push(
        `<text x="${p.x + 6}" y="${p.y - 6}" fill="#95a7c0" font-family="Arial" font-size="12">${escapeText(star.name)}</text>`,
      );
  }
  for (const object of data.objects.filter((o) => o.altitude >= 0)) {
    const p = point(object.altitude, object.azimuth);
    svg.push(
      `<circle cx="${p.x}" cy="${p.y}" r="4" fill="#efb477"/><text x="${p.x + 9}" y="${p.y + 4}" fill="#efb477" font-family="Arial" font-size="14">${object.name}</text>`,
    );
  }
  for (const [label, x, y] of [
    ["N", 320, 28],
    ["S", 320, 621],
    ["E", 24, 325],
    ["W", 616, 325],
  ])
    svg.push(
      `<text x="${x}" y="${y}" fill="#b6c2d4" text-anchor="middle" font-family="Arial" font-size="16">${label}</text>`,
    );
  svg.push("</svg>");
  return svg.join("");
}
