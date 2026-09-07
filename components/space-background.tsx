import type { CSSProperties } from "react";
import { Pause, Play } from "@/components/icons";

// Pausing changes only play-state, so resuming continues at the same position.
export default function SpaceBackground({
  moving,
  variant = "home",
}: {
  moving: boolean;
  variant?: "home" | "observatory";
}) {
  const image =
    variant === "home"
      ? "/art/bao-cosmos.webp"
      : "/art/bao-observatory-space.webp";
  const style: CSSProperties = {
    backgroundImage: `url("${image}")`,
    animationPlayState: moving ? "running" : "paused",
  };
  return (
    <div
      className={`space-background space-background-${variant}`}
      aria-hidden="true"
      data-motion={moving}
    >
      <div className="space-background-art" style={style} />
      <div className="space-background-shade" />
    </div>
  );
}

export function MotionControl({
  moving,
  onToggle,
}: {
  moving: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      className="motion-control"
      aria-pressed={moving}
      aria-label={
        moving ? "Pause background motion" : "Resume background motion"
      }
      onClick={onToggle}
    >
      {moving ? <Pause size={16} /> : <Play size={16} />}
      <span>{moving ? "Pause motion" : "Resume motion"}</span>
    </button>
  );
}
