import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import Homepage from "@/components/homepage";
import ObservatoryNavigation, {
  navigation,
} from "@/components/observatory-navigation";
import { SidebarProvider } from "@/components/ui/sidebar";
import SpaceBackground, { MotionControl } from "@/components/space-background";
import SolarSystem from "@/components/explorers/solar-system";
import SkyExplorer from "@/components/explorers/sky-explorer";
import Exoplanets from "@/components/explorers/exoplanets";
import Asteroids from "@/components/explorers/asteroids";
import Spacecraft from "@/components/explorers/spacecraft";
import Gallery from "@/components/explorers/gallery";
import ApiPlayground from "@/components/explorers/api-playground";
import Guide from "@/components/explorers/guide";
import GalaxyExplorer from "@/components/explorers/galaxy-explorer";
import galaxies from "@/data/galaxies.json";
import { systems } from "@/data/explorer-systems";
import "./check-animation";
import RadiusComparison from "@/components/radius-comparison";
import { Disclosure } from "@/components/shared";
import { ArrowRight, Pause, Play } from "@/components/icons";

const time = "2026-09-05T00:00:00Z";
const change = () => {};
const home = renderToStaticMarkup(<Homepage />);
assert.match(home, /Barycentric<br\/>Astronomical<br\/>Observatory/);
assert.match(home, /href="\/explore"/);
assert.match(home, /href="\/explore#gallery"/);
assert.match(home, /href="\/explore#api"/);
assert.match(home, /data-motion="false"/);
assert.match(home, /aria-label="Resume background motion"/);
assert.equal((home.match(/class="home-enter"/g) ?? []).length, 1);
assert.doesNotMatch(home, /planet-card|subtle-badge|<canvas|<iframe|lucide/);
assert.ok(existsSync("app/explore/page.tsx"));
assert.ok(existsSync("public/art/bao-cosmos.webp"));
assert.ok(existsSync("public/art/bao-observatory-space.webp"));
assert.match(
  readFileSync("hooks/use-background-motion.ts", "utf8"),
  /prefers-reduced-motion/,
);
// The actual animated element must change play-state, not just the button label.
for (const moving of [false, true]) {
  const background = renderToStaticMarkup(
    <SpaceBackground moving={moving} variant="observatory" />,
  );
  assert.match(background, /bao-observatory-space.webp/);
  assert.match(
    background,
    new RegExp(`animation-play-state:${moving ? "running" : "paused"}`),
  );
  const control = renderToStaticMarkup(
    <MotionControl moving={moving} onToggle={change} />,
  );
  assert.match(control, new RegExp(`aria-pressed="${moving}"`));
  assert.match(
    control,
    new RegExp(`aria-label="${moving ? "Pause" : "Resume"} background motion"`),
  );
}
assert.match(
  readFileSync("app/globals.css", "utf8"),
  /animation: space-drift 18s linear infinite alternate/,
);

const sidebar = renderToStaticMarkup(
  <SidebarProvider>
    <ObservatoryNavigation
      view="sky-explorer"
      onNavigate={change}
      moving={false}
      onToggleMotion={change}
    />
  </SidebarProvider>,
);
assert.match(sidebar, /aria-label="Observatory tools"/);
for (const item of navigation)
  assert.ok(sidebar.includes(`href="#${item.value}"`));
assert.match(sidebar, /href="#sky-explorer" aria-current="page"/);
assert.equal((sidebar.match(/aria-current="page"/g) ?? []).length, 1);
assert.doesNotMatch(sidebar, /role="combobox"|lucide/);
assert.match(home, /<footer/);
assert.match(home, /aria-label="Resource links"/);
assert.match(home, /href="\/credits.txt"/);
assert.match(home, /href="\/explore#guide"/);

const disclosure = renderToStaticMarkup(
  <Disclosure title="Settings">
    <p>Detail</p>
  </Disclosure>,
);
assert.match(disclosure, /<details/);
assert.doesNotMatch(disclosure, /<details[^>]*\sopen(?:=|\s|>)/);
assert.match(disclosure, /<summary>Settings/);

for (const Glyph of [ArrowRight, Pause, Play]) {
  const icon = renderToStaticMarkup(<Glyph size={18} />);
  assert.match(icon, /viewBox="0 0 24 24"/);
  assert.match(icon, /aria-hidden="true"/);
  assert.doesNotMatch(icon, /lucide/);
}

const views = [
  <GalaxyExplorer />,
  <SolarSystem time={time} onTimeChange={change} />,
  <SkyExplorer
    time={time}
    onTimeChange={change}
    location={{ lat: 37.09, lon: -76.47, label: "Newport News, VA" }}
    onLocationChange={change}
  />,
  <Exoplanets />,
  <Asteroids time={time} />,
  <Spacecraft time={time} />,
  <Gallery />,
  <ApiPlayground time={time} />,
  <Guide />,
];
const atlas = renderToStaticMarkup(<GalaxyExplorer />);
assert.match(atlas, /Enter fullscreen/);
assert.match(atlas, /Choose a galaxy/);
assert.match(atlas, /Visit Milky Way systems/);
assert.match(atlas, /Scroll or pinch to zoom/);
assert.equal(galaxies.length, 5);
for (const galaxy of galaxies) {
  assert.ok(
    existsSync("public" + galaxy.image),
    galaxy.name + " image must be bundled",
  );
  assert.ok(existsSync("public" + galaxy.thumbnail));
  assert.ok(
    galaxy.credit.length > 10 &&
      galaxy.facts.every((f) => f.source.startsWith("https://")),
  );
}
assert.match(galaxies.find((g) => g.id === "milky-way")!.imageNote, /Artist/);
assert.deepEqual(
  systems.map((s) => s.planets.length),
  [8, 7, 8],
  "Catalog aliases must not omit Kepler-90 planets",
);
for (const system of systems) {
  assert.equal(
    new Set(system.planets.map((p) => p.id)).size,
    system.planets.length,
  );
  for (const planet of system.planets) {
    assert.ok(planet.periodDays > 0 && planet.semiMajorAu > 0);
    if (system.id !== "solar")
      assert.equal(
        planet.texture,
        undefined,
        "Unknown exoplanet surfaces must not inherit Solar System maps",
      );
  }
}
for (const view of views) {
  const html = renderToStaticMarkup(view);
  assert.equal((html.match(/<h1[ >]/g) ?? []).length, 1);
  assert.doesNotMatch(
    html,
    /subtle-badge|planet-card|exoplanet-card|mission-card|summary-grid/,
  );
  assert.doesNotMatch(
    html,
    /Find your place|Every world has a story|Made for the curious/,
  );
  assert.doesNotMatch(html, /<details[^>]*\sopen(?:=|\s|>)/);
}

const unknown = renderToStaticMarkup(
  <RadiusComparison radius={null} name="Unknown" />,
);
assert.doesNotMatch(unknown, /<circle/);
const known = renderToStaticMarkup(
  <RadiusComparison radius={2} name="Example" />,
);
assert.match(known, /r="18"/);
assert.match(known, /r="36"/);
console.log(
  "Interface checks passed: motion play-state, 9 sidebar destinations, footer links, homepage, 9 tools, galaxy sources/assets, 23 planets, disclosures, glyphs, radius scaling.",
);
console.log(
  "Server-rendered structural checks only; not browser or visual interaction tests.",
);
