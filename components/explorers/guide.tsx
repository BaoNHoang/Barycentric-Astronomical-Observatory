"use client";
import { useEffect, useState } from "react";
import { Download } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { PageHeading, Disclosure, SourceLink } from "@/components/shared";
export default function Guide() {
  const [sourceAvailable, setSourceAvailable] = useState(false);
  useEffect(() => {
    const controller = new AbortController();
    fetch("/bao-source.zip", { method: "HEAD", signal: controller.signal })
      .then((response) => setSourceAvailable(response.ok))
      .catch(() => {});
    return () => controller.abort();
  }, []);
  return (
    <div className="guide-page">
      <PageHeading title="About BAO">
        {sourceAvailable && (
          <Button asChild>
            <a href="/bao-source.zip" download>
              <Download size={16} />
              Download source
            </a>
          </Button>
        )}
      </PageHeading>
      <div className="guide-intro panel">
        <div>
          <h2>Barycentric Astronomical Observatory</h2>
          <p>
            Planetary motion, sky charts, space imagery and astronomical data. A
            website and API built in one readable TypeScript project.
          </p>
        </div>
      </div>
      <div className="guide-grid">
        <Disclosure title="Reading the code">
          <ol className="learning-list">
            <li>
              <strong>app/page.tsx and app/explore/page.tsx</strong>
              <p>The homepage and the separate observatory entry point.</p>
            </li>
            <li>
              <strong>components/observatory.tsx</strong>
              <p>Holds navigation, the selected time, and observer location.</p>
            </li>
            <li>
              <strong>components/explorers/</strong>
              <p>
                One file per feature: planets, sky, exoplanets, asteroids,
                spacecraft, gallery, API.
              </p>
            </li>
            <li>
              <strong>app/v1/</strong>
              <p>Small GET handlers read query parameters and return JSON.</p>
            </li>
            <li>
              <strong>lib/api/ and lib/astronomy.ts</strong>
              <p>Source adapters, validation, and calls to Astronomy Engine.</p>
            </li>
            <li>
              <strong>README.md</strong>
              <p>
                PowerShell setup, API examples, data refresh, limitations, and a
                suggested learning order.
              </p>
            </li>
          </ol>
        </Disclosure>
        <Disclosure title="Understanding coordinates">
          <div className="definition-list">
            <div>
              <strong>Time</strong>
              <p>
                When the coordinate applies. BAO takes ISO timestamps with a UTC
                offset.
              </p>
            </div>
            <div>
              <strong>Origin</strong>
              <p>
                The point measured from: the Sun, Earth, or the solar system’s
                center of mass (barycenter).
              </p>
            </div>
            <div>
              <strong>Frame</strong>
              <p>
                The orientation of the axes. Analytical results use J2000
                equatorial; JPL vectors use J2000 ecliptic.
              </p>
            </div>
            <div>
              <strong>Geometric vs. apparent</strong>
              <p>
                Geometric vectors describe where an object is. Apparent sky
                positions also account for effects such as light travel and
                aberration.
              </p>
            </div>
            <div>
              <strong>Scale</strong>
              <p>
                The illustrative Solar System compresses orbital distances and
                enlarges bodies. True scale preserves physical proportions.
                Surface maps and spin are illustrative.
              </p>
            </div>
          </div>
        </Disclosure>
      </div>
      <Disclosure
        title="Sources & scientific methods"
        className="sources-panel"
      >
        <div className="sources-grid">
          <article>
            <h3>Positions and motion</h3>
            <p>
              Astronomy Engine provides analytical planet and moon positions.
              Use JPL Horizons for geometric ephemerides, spacecraft, and
              asteroid trajectories. These are educational tools, not navigation
              software.
            </p>
            <SourceLink href="https://github.com/cosinekitty/astronomy">
              Astronomy Engine · MIT
            </SourceLink>
            <SourceLink href="https://ssd-api.jpl.nasa.gov/doc/horizons.html">
              JPL Horizons
            </SourceLink>
          </article>
          <article>
            <h3>Planet and moon properties</h3>
            <p>
              Reference radii, masses, and periods come from JPL. Temperatures
              are reference means; gas-giant values describe the atmosphere at 1
              bar.
            </p>
            <SourceLink href="https://ssd.jpl.nasa.gov/planets/phys_par.html">
              Planetary physical parameters
            </SourceLink>
            <SourceLink href="https://ssd.jpl.nasa.gov/sats/phys_par/">
              Satellite physical parameters
            </SourceLink>
            <SourceLink href="https://nssdc.gsfc.nasa.gov/planetary/factsheet/">
              NASA fact sheets
            </SourceLink>
          </article>
          <article>
            <h3>Exoplanet catalog</h3>
            <p>
              The included pscomppars snapshot supports fast searches across
              thousands of confirmed planets. Dates appear in the explorer.
              Temperature is modeled equilibrium temperature; mass may be
              inferred or M sin i. Missing values remain null.
            </p>
            <SourceLink href="https://exoplanetarchive.ipac.caltech.edu/">
              NASA Exoplanet Archive
            </SourceLink>
            <SourceLink href="https://exoplanetarchive.ipac.caltech.edu/docs/API_PS_columns.html">
              Column definitions
            </SourceLink>
          </article>
          <article>
            <h3>Star charts</h3>
            <p>
              XHIP / Extended Hipparcos stars through magnitude 6 and
              constellation lines are distributed by d3-celestial. Coordinates
              are precessed to the selected date; stellar proper motion is
              omitted. Charts include standard refraction, not weather or
              terrain.
            </p>
            <SourceLink href="https://github.com/ofrohn/d3-celestial">
              d3-celestial · BSD-3-Clause
            </SourceLink>
            <SourceLink href="https://cdsarc.cds.unistra.fr/viz-bin/cat/V/137D">
              XHIP catalog · Anderson & Francis
            </SourceLink>
          </article>
          <article>
            <h3>Close approaches</h3>
            <p>
              JPL SBDB provides Earth encounters, relative speeds, physical
              parameters, and distance uncertainties. TDB timestamps differ from
              UTC. A close approach is not an impact prediction.
            </p>
            <SourceLink href="https://ssd-api.jpl.nasa.gov/doc/cad.html">
              JPL close approach data
            </SourceLink>
          </article>
          <article>
            <h3>Images and rendering maps</h3>
            <p>
              NASA observations retain image credits and processing
              descriptions. Surface maps by Solar System Scope / INOVE use
              enhanced colors and may fill mapping gaps. BAO uses them for
              illustrative renderings. The homepage star field is original
              generated artwork, not a telescope observation or sky chart.
            </p>
            <SourceLink href="https://www.solarsystemscope.com/textures/">
              Solar System Scope · CC BY 4.0
            </SourceLink>
            <SourceLink href="https://images.nasa.gov/">
              NASA Image and Video Library
            </SourceLink>
            <SourceLink href="/credits.txt">Full image credits</SourceLink>
          </article>
        </div>
      </Disclosure>
      <Disclosure title="Run BAO on your computer" className="guide-running">
        <p className="muted">
          Download and extract the source, install Node.js 22.13 or later, then
          open PowerShell in the project folder.
        </p>
        <pre>npm install{"\n"}npm run dev</pre>
        <p>
          Open <code>http://localhost:3000</code>. No database or API key is
          required. The README explains how to refresh the exoplanet and star
          snapshots.
        </p>
      </Disclosure>
    </div>
  );
}
