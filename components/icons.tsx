import type { ReactNode, SVGProps } from "react";

// Original BAO glyphs: a 24-unit grid, square line ends, and open corners.
// The helper only supplies the shared SVG attributes. Each drawing is below.
type IconProps = SVGProps<SVGSVGElement> & { size?: number | string };
function glyph(drawing: ReactNode) {
  return function BaoIcon({ size = 24, ...props }: IconProps) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="square"
        strokeLinejoin="miter"
        aria-hidden="true"
        focusable="false"
        {...props}
      >
        {drawing}
      </svg>
    );
  };
}

export const ArrowRight = glyph(<path d="M3 12h17m-6-5 6 5-6 5" />);
export const ArrowUpRight = glyph(<path d="M6 18 19 5M9 5h10v10" />);
export const ChevronRight = glyph(<path d="m9 5 7 7-7 7" />);
export const ChevronLeft = glyph(<path d="m15 5-7 7 7 7" />);
export const ChevronDown = glyph(<path d="m5 9 7 7 7-7" />);
export const Plus = glyph(<path d="M3 12h18M12 3v18" />);
export const Minus = glyph(<path d="M3 12h18" />);
export const Close = glyph(<path d="m5 5 14 14M19 5 5 19" />);
export const Menu = glyph(<path d="M3 6h18M3 12h13M3 18h18" />);
export const Check = glyph(<path d="m4 12 5 6L20 5" />);
export const Play = glyph(<path d="M7 4v16l13-8Z" />);
export const Pause = glyph(<path d="M7 4h2v16H7zm8 0h2v16h-2z" />);
export const SkipBack = glyph(<path d="M5 4v16M19 5 8 12l11 7Z" />);
export const SkipForward = glyph(<path d="M19 4v16M5 5l11 7-11 7Z" />);
export const Download = glyph(<path d="M12 2v14m-5-5 5 5 5-5M4 17v4h16v-4" />);
export const Search = glyph(
  <>
    <circle cx="10" cy="10" r="6.5" />
    <path d="m15 15 6 6" />
  </>,
);
export const Copy = glyph(<path d="M8 7h12v14H8zM4 17H2V2h13v2" />);
export const Clock3 = glyph(
  <>
    <path d="M12 3a9 9 0 1 1-9 9M12 6v6h6" />
    <path d="M3 5v3h3" />
  </>,
);
export const RefreshCw = glyph(
  <path d="M20 9A8 8 0 0 0 6 6L3 9m0-6v6h6M4 15a8 8 0 0 0 14 3l3-3m0 6v-6h-6" />,
);
export const RotateCcw = glyph(<path d="M4 8a9 9 0 1 1-1 8M4 2v6h6" />);
export const Maximize2 = glyph(
  <path d="M3 9V3h6m6 0h6v6m0 6v6h-6m-6 0H3v-6" />,
);
export const Orbit = glyph(
  <>
    <ellipse cx="12" cy="12" rx="10" ry="5" transform="rotate(-35 12 12)" />
    <circle cx="12" cy="12" r="2" />
    <path d="M18 3v4m-2-2h4" />
  </>,
);
export const Star = glyph(
  <path d="m12 2 2.5 7.5L22 12l-7.5 2.5L12 22l-2.5-7.5L2 12l7.5-2.5Z" />,
);
export const Globe2 = glyph(
  <>
    <circle cx="12" cy="12" r="9" />
    <path d="M3 12h18M12 3c-7 6-7 12 0 18 7-6 7-12 0-18Z" />
  </>,
);
export const MapPin = glyph(
  <>
    <path d="M12 22 5 11a8 8 0 1 1 14 0Z" />
    <circle cx="12" cy="8" r="2.5" />
  </>,
);
export const LocateFixed = glyph(
  <>
    <circle cx="12" cy="12" r="6" />
    <path d="M12 1v5m0 12v5M1 12h5m12 0h5M10 12h4m-2-2v4" />
  </>,
);
export const Moon = glyph(<path d="M19 17A10 10 0 0 1 10 3a9 9 0 1 0 9 14Z" />);
export const Sun = glyph(
  <>
    <circle cx="12" cy="12" r="5" />
    <path d="M12 1v3m0 16v3M1 12h3m16 0h3M4 4l2 2m12 12 2 2M4 20l2-2M18 6l2-2" />
  </>,
);
export const Satellite = glyph(
  <>
    <path d="m9 7 8 8-4 4-8-8Zm-2-2 2 2-5 5-2-2Zm10 10 2 2 3-3-2-2ZM15 3a6 6 0 0 1 6 6M15 6a3 3 0 0 1 3 3" />
  </>,
);
export const Images = glyph(
  <>
    <path d="M3 3h18v16H3zM6 22h15M3 16l6-7 6 7 3-3 3 3" />
    <circle cx="17" cy="7" r="1" />
  </>,
);
export const ScanLine = glyph(
  <>
    <path d="M3 8V3h5m8 0h5v5M3 16v5h5m8 0h5v-5M1 12h22" />
    <circle cx="12" cy="12" r="4" />
  </>,
);
export const Code2 = glyph(<path d="m7 5-6 7 6 7m10-14 6 7-6 7M14 2l-4 20" />);
export const Braces = glyph(
  <path d="M8 2H5v7l-3 3 3 3v7h3m8-20h3v7l3 3-3 3v7h-3" />,
);
export const BookOpen = glyph(
  <path d="M12 6 3 3v15l9 3 9-3V3Zm0 0v15M6 8l3 1m-3 4 3 1m6-5 3-1m-3 6 3-1" />,
);
