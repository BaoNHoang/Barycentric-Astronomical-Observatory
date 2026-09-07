import type { ReactNode } from "react";

export default function SiteFooter({ children }: { children?: ReactNode }) {
  return (
    <footer className="site-footer">
      <div className="footer-main">
        <div className="footer-identity">
          <a className="footer-wordmark" href="/">
            BAO
          </a>
          <p>Barycentric Astronomical Observatory</p>
          <span>Planetary motion, sky charts and space imagery.</span>
        </div>
        <nav aria-label="Explore links">
          <h2>Explore</h2>
          <a href="/explore#galaxies">Galaxy explorer</a>
          <a href="/explore#solar-system">Solar system</a>
          <a href="/explore#sky-explorer">Your sky</a>
          <a href="/explore#gallery">Image archive</a>
        </nav>
        <nav aria-label="Resource links">
          <h2>Resources</h2>
          <a href="/explore#api">API playground</a>
          <a href="/explore#guide">About & learning guide</a>
          <a href="/credits.txt" target="_blank" rel="noreferrer">
            Sources & image credits
          </a>
        </nav>
      </div>
      <div className="footer-bottom">
        <span>
          Data from{" "}
          <a href="https://ssd.jpl.nasa.gov/" target="_blank" rel="noreferrer">
            JPL
          </a>{" "}
          and the{" "}
          <a
            href="https://exoplanetarchive.ipac.caltech.edu/"
            target="_blank"
            rel="noreferrer"
          >
            NASA Exoplanet Archive
          </a>
        </span>
        {children}
      </div>
    </footer>
  );
}
