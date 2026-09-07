# BAO astronomy asset credits

## Original BAO identity and backgrounds

- `public/art/bao-cosmos.webp`: original decorative cosmic artwork generated with
  the built-in image-generation tool on September 5, 2026. Invented star field;
  not a telescope observation, physical simulation, or geographically accurate
  sky chart. The full generation prompt is saved in `docs/ARTWORK.md`.
- `public/art/bao-observatory-space.webp`: original decorative star field, galaxy
  dust and two distant invented planets, generated with the built-in
  image-generation tool on September 7, 2026. It is atmosphere for the app, not
  observed imagery or a map of real positions. Prompt in `docs/ARTWORK.md`.
- `components/icons.tsx` and `public/favicon.svg`: original code-generated BAO
  vector glyphs. These are functional UI marks, not scientific illustrations.
- The website uses system fonts. No external font service is contacted.

## Scientific rendering and imagery

Planet and Moon rendering textures: Solar System Scope / INOVE, CC BY 4.0. Source: https://www.solarsystemscope.com/textures/ . License: https://creativecommons.org/licenses/by/4.0/ .

Equirectangular rendering textures derived from NASA data. Solar System Scope reports enhanced saturation and fictional terrain used where mapping has gaps. These are illustrative maps, not precision scientific datasets.

Gallery images:

- Perseverance at Falbreen — NASA/JPL-Caltech/ASU/MSSS
  Source: https://science.nasa.gov/photojournal/nasas-perseverance-rover-at-falbreen/
  Processing: Observed rover images, stitched mosaic, enhanced color

- Two faces of Jupiter — NASA, ESA, STScI, Amy Simon (NASA-GSFC); Image Processing: Joseph DePasquale (STScI)
  Source: https://science.nasa.gov/asset/hubble/jupiter-11/
  Processing: Observed Hubble images, filter-color composite

- Cosmic Cliffs in Carina — NASA, ESA, CSA, STScI
  Source: https://science.nasa.gov/asset/webb/cosmic-cliffs-in-the-carina-nebula-nircam-image/
  Processing: Observed infrared telescope data, assigned-color composite

See asset-manifest.json for exact local paths, download URLs, dates, dimensions, file hashes, descriptions and reuse policy links.

## Star and constellation data

BAO transforms the d3-celestial stars.6.json and constellations.lines.json files into compact records. Copyright (c) 2015, Olaf Frohn, BSD-3-Clause; full notice in licenses/d3-celestial.txt. Source: https://github.com/ofrohn/d3-celestial .

Star catalog: XHIP: An Extended Hipparcos Compilation, E. Anderson and C. Francis (2012), VizieR V/137D. Coordinates are J2000; proper motion is omitted in BAO. Constellation lines and naming derive from IAU data and Olaf Frohn’s modifications as documented by d3-celestial.

Astronomy Engine: Don Cross, MIT license. Three.js: three.js authors, MIT license. Their license notices are in licenses/.

## Galaxy explorer

- Andromeda: NASA, ESA, B. Williams (University of Washington)
  Local image: public/galaxies/andromeda.webp
  Source: https://esahubble.org/images/heic2501a/
  Direct download: https://cdn.esahubble.org/archives/images/publicationjpg/heic2501a.jpg
  NASA/ESA Hubble photomosaic released in January 2025.
  Processing: converted to WebP, uncropped; reduced navigation thumbnail.

- Triangulum: NASA, ESA, and M. Durbin, J. Dalcanton, and B. F. Williams (University of Washington)
  Local image: public/galaxies/triangulum.webp
  Source: https://esahubble.org/images/heic1901a/
  Direct download: https://cdn.esahubble.org/archives/images/publicationjpg/heic1901a.jpg
  Hubble mosaic of the central region and inner spiral arms.
  Processing: converted to WebP, uncropped; reduced navigation thumbnail.

- Whirlpool: NASA, ESA, S. Beckwith (STScI), and The Hubble Heritage Team (STScI/AURA)
  Local image: public/galaxies/whirlpool.webp
  Source: https://esahubble.org/images/heic0506a/
  Direct download: https://cdn.esahubble.org/archives/images/publicationjpg/heic0506a.jpg
  Hubble image of M51 and its companion NGC 5195.
  Processing: converted to WebP, uncropped; reduced navigation thumbnail.

- Sombrero: ESA/Hubble & NASA, K. Noll
  Local image: public/galaxies/sombrero.webp
  Source: https://esahubble.org/images/heic2506a/
  Direct download: https://cdn.esahubble.org/archives/images/publicationjpg/heic2506a.jpg
  Hubble mosaic with updated processing, released in April 2025.
  Processing: converted to WebP, uncropped; reduced navigation thumbnail.

- Milky Way: NASA’s Goddard Space Flight Center/Conceptual Image Lab
  Local image: public/galaxies/milky-way.webp
  Source: https://svs.gsfc.nasa.gov/14930/
  Direct download: https://svs.gsfc.nasa.gov/vis/a010000/a014900/a014930/Westerlund_1_illustration_Plan_Unlabeled.jpg
  Unlabeled top-down artist’s concept from NASA Goddard’s Conceptual Image Lab, released December 2025. This is not an external photograph of the Milky Way.
  Processing: converted to WebP, uncropped; reduced navigation thumbnail.

ESA/Hubble observations are reused under CC BY 4.0: https://esahubble.org/copyright/ .
The Milky Way is an artist’s concept, used under NASA media guidelines: https://www.nasa.gov/nasa-brand-center/images-and-media/ .
Exact provenance, source facts, dimensions and SHA-256 hashes: /galaxies/manifest.json .
