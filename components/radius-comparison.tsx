// Both circles use the same linear scale. Unknown radii are never invented.
export default function RadiusComparison({
  radius,
  name,
}: {
  radius: number | null;
  name: string;
}) {
  if (radius === null || radius <= 0)
    return <p className="muted">No measured radius is available.</p>;
  const pixelsPerEarthRadius = Math.min(18, 54 / radius);
  return (
    <svg
      className="radius-comparison"
      viewBox="0 0 320 160"
      role="img"
      aria-label={`${name} has ${radius} times Earth's radius. Both circles use the same scale.`}
    >
      <circle
        cx="75"
        cy="70"
        r={pixelsPerEarthRadius}
        stroke="#a9c7f0"
        fill="none"
        strokeWidth="1.5"
      />
      <circle
        cx="235"
        cy="70"
        r={radius * pixelsPerEarthRadius}
        stroke="#cfb4ef"
        fill="#b9a5ec15"
        strokeWidth="1.5"
      />
      <text x="75" y="145" textAnchor="middle" fill="#c4bad2" fontSize="13">
        Earth
      </text>
      <text x="235" y="145" textAnchor="middle" fill="#c4bad2" fontSize="13">
        {radius} × Earth
      </text>
    </svg>
  );
}
