# BAO interface direction

## Brief

Barycentric Astronomical Observatory needs a website front door, not a dashboard
as its homepage. The experience should feel spacious, colorful, and specific to
astronomy. The owner's reference archive records the previous app; it is not a
visual template to reproduce.

## Homepage

- `/` opens with a full-height composition: wordmark, full observatory name,
  one primary action, and a few quiet navigation links. A useful footer follows.
- Use an original nebular star field, with deep cobalt, violet, magenta and warm
  dust. Leave dark negative space behind the heading. Do not recreate another
  product's proprietary artwork.
- No feature-card grid, numerical badges, fake telemetry, floating planets,
  testimonial filler, or inspirational taglines.
- Use a restrained editorial serif for the name and plain sans-serif controls.
- Motion is decorative and pausable, with a steady drift visible immediately.
  Use one 18-second linear animation; change only `animation-play-state` when
  pausing, so resuming continues from the same position. Remember the visitor's
  explicit choice across routes; otherwise honor reduced-motion preferences.

## Observatory

- `/explore` contains the tools. Following the owner's September 7 feedback,
  show the eight destinations in a left navigation bar, with original BAO icons
  and a clear active link. On small screens, a Navigation button opens a drawer
  that closes after choosing a tool. Preserve keyboard focus and Escape behavior.
- Continue the space background throughout the app: fine stars, blue-violet
  galaxy dust and small distant planets around the outer edges. This decorative
  background is separate from the calculated planet and trajectory views.
- Keep the center calm enough for scientific text, tables and controls to read
  clearly. Do not turn background planets into floating cards or data badges.
- Give the homepage and app a populated footer with exploration, API, learning,
  source and image-credit links. Do not invent social accounts or filler links.
- Let the cosmic background continue through the footer. Avoid a dark bottom fade
  or unused space below it. Page shells and the sidebar fill the current viewport
  with `dvh`; the document prevents horizontal spill and vertical overscroll.
- Use a thin violet scrollbar on an indigo track, including a WebKit fallback.
  Keep native scrolling behavior and scrollable data tables intact.
- Each view begins with its actual name, not an eyebrow plus a slogan.
- Lead with the scene, chart, table, image, or request that the person came for.
- Use whitespace, type and occasional rules to separate content. Avoid a box
  around every group. Corners are nearly square; no glassmorphism.
- Additional settings, source explanations and measurements belong behind
  explicit controls. Never hide required unit, scale or uncertainty context.
- Data lists use compact rows. Open a record to see the full measurements.
- Sources, unknown values, and scientific limitations remain truthful.

## Icons and accessibility

`components/icons.tsx` is BAO's original code-generated vector glyph set.
No stock icon library is used by the app's own components. Icons are functional
geometry, not generated representations of astronomical measurements.
Use text navigation when an icon adds no meaning. Every icon-only action needs
an accessible name. Preserve keyboard interaction, focus indication, contrast,
and reduced-motion support. Native disclosures keep the interaction code small.

## Implementation map

- `components/homepage.tsx`: website composition and motion control.
- `app/home.css`: homepage layout and responsive art treatment.
- `components/observatory.tsx`: shared observation state and app layout.
- `components/observatory-navigation.tsx`: left navigation and mobile drawer.
- `components/space-background.tsx`: background art and pause/resume button.
- `hooks/use-background-motion.ts`: reduced-motion default and saved preference.
- `components/site-footer.tsx`: shared exploration and resource links.
- `components/shared.tsx`: reusable labeled disclosures and shared controls.
- `app/globals.css`: app theme and feature layouts.
- `CREDITS.md`: original artwork, data and imagery provenance.

The Sites design skill guides composition and progressive disclosure. The
image-generation skill supplies the original background; scientific visualizations
remain calculated from data. Dedicated Product Design tooling was discovered but
is not installed. No Figma file or copied external design system is required.

The externally reviewed [Frontend Design skill](https://github.com/anthropics/skills/blob/main/skills/frontend-design/SKILL.md)
informed the typography, direct copy and removal of decorative UI. Its text was
read as design guidance; it was not installed or copied into this project.
The React Best Practices skill informed the component and accessibility review.

## Tokens

| Role                 | Value     |
| -------------------- | --------- |
| Deep-space canvas    | `#080812` |
| Main text            | `#ece5f2` |
| Secondary text       | `#ada2be` |
| Action violet        | `#b9a5ec` |
| Warm homepage action | `#f4c4ab` |
| Source-link blue     | `#a9c7f0` |

Georgia supplies the observatory's display type; Segoe UI / Arial supplies the
controls. The heading is one consistent treatment, without an accented word.
Color comes primarily from the original cosmic artwork and scientific imagery.
Layouts align left, use one main visual, and let controls wrap on narrow screens.
