"use client";
import { useEffect, useRef, useState, type RefObject } from "react";
import { animateScene, clamp, damping } from "@/lib/animation";

export type ViewAction = "in" | "out" | "reset";
export default function GalaxyImage({
  src,
  alt,
  action,
  reduced,
}: {
  src: string;
  alt: string;
  action: RefObject<((action: ViewAction) => void) | null>;
  reduced: boolean;
}) {
  const host = useRef<HTMLDivElement>(null);
  const image = useRef<HTMLImageElement>(null);
  const preference = useRef(reduced);
  preference.current = reduced;
  const [status, setStatus] = useState<"loading" | "ready" | "error">(
    "loading",
  );
  useEffect(() => {
    const element = host.current!,
      art = image.current!;
    const target = { x: 0, y: 0, scale: 1 };
    const view = { ...target };
    let width = element.clientWidth,
      height = element.clientHeight;
    const pointers = new Map<number, { x: number; y: number }>();
    let pinch = 0;
    const bounds = () => {
      target.x = clamp(
        target.x,
        (-width * (target.scale - 1)) / 2,
        (width * (target.scale - 1)) / 2,
      );
      target.y = clamp(
        target.y,
        (-height * (target.scale - 1)) / 2,
        (height * (target.scale - 1)) / 2,
      );
    };
    const zoom = (factor: number, x = 0, y = 0) => {
      const next = clamp(target.scale * factor, 1, 10);
      const ratio = next / target.scale;
      target.x = x - (x - target.x) * ratio;
      target.y = y - (y - target.y) * ratio;
      target.scale = next;
      bounds();
    };
    action.current = (a) => {
      if (a === "reset") Object.assign(target, { x: 0, y: 0, scale: 1 });
      else zoom(a === "in" ? 1.5 : 1 / 1.5);
    };
    const wheel = (event: WheelEvent) => {
      event.preventDefault();
      const rect = element.getBoundingClientRect();
      const delta =
        event.deltaY *
        (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? height : 1);
      zoom(
        Math.exp(-clamp(delta, -120, 120) * 0.003),
        event.clientX - rect.left - width / 2,
        event.clientY - rect.top - height / 2,
      );
    };
    const down = (event: PointerEvent) => {
      if (event.pointerType === "mouse" && event.button !== 0) return;
      element.setPointerCapture(event.pointerId);
      pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
      pinch = 0;
    };
    const move = (event: PointerEvent) => {
      const previous = pointers.get(event.pointerId);
      if (!previous) return;
      pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
      if (pointers.size === 1) {
        target.x += event.clientX - previous.x;
        target.y += event.clientY - previous.y;
      } else {
        const [a, b] = Array.from(pointers.values());
        const distance = Math.hypot(a.x - b.x, a.y - b.y);
        const rect = element.getBoundingClientRect();
        if (pinch > 0)
          zoom(
            distance / pinch,
            (a.x + b.x) / 2 - rect.left - width / 2,
            (a.y + b.y) / 2 - rect.top - height / 2,
          );
        pinch = distance;
      }
      bounds();
    };
    const up = (event: PointerEvent) => {
      pointers.delete(event.pointerId);
      pinch = 0;
    };
    const keys = (event: KeyboardEvent) => {
      if (
        [
          "+",
          "=",
          "-",
          "0",
          "ArrowLeft",
          "ArrowRight",
          "ArrowUp",
          "ArrowDown",
        ].includes(event.key)
      )
        event.preventDefault();
      if (event.key === "+" || event.key === "=") zoom(1.5);
      if (event.key === "-") zoom(1 / 1.5);
      if (event.key === "0") action.current?.("reset");
      if (event.key === "ArrowLeft") target.x += 60;
      if (event.key === "ArrowRight") target.x -= 60;
      if (event.key === "ArrowUp") target.y += 60;
      if (event.key === "ArrowDown") target.y -= 60;
      bounds();
    };
    const doubleClick = () =>
      target.scale > 2 ? action.current?.("reset") : zoom(3);
    const resize = new ResizeObserver(() => {
      width = element.clientWidth;
      height = element.clientHeight;
      bounds();
    });
    resize.observe(element);
    element.addEventListener("wheel", wheel, { passive: false });
    element.addEventListener("pointerdown", down);
    element.addEventListener("pointermove", move);
    element.addEventListener("pointerup", up);
    element.addEventListener("pointercancel", up);
    element.addEventListener("lostpointercapture", up);
    element.addEventListener("keydown", keys);
    element.addEventListener("dblclick", doubleClick);
    let previousTransform = "";
    const stop = animateScene(element, (dt) => {
      const alpha = preference.current
        ? 1
        : damping(dt, pointers.size ? 24 : 14);
      view.x += (target.x - view.x) * alpha;
      view.y += (target.y - view.y) * alpha;
      view.scale += (target.scale - view.scale) * alpha;
      const transform = `translate3d(${view.x.toFixed(2)}px,${view.y.toFixed(2)}px,0) scale(${view.scale.toFixed(4)})`;
      if (transform !== previousTransform) {
        art.style.transform = transform;
        previousTransform = transform;
      }
    });
    return () => {
      stop();
      resize.disconnect();
      action.current = null;
      element.removeEventListener("wheel", wheel);
      element.removeEventListener("pointerdown", down);
      element.removeEventListener("pointermove", move);
      element.removeEventListener("pointerup", up);
      element.removeEventListener("pointercancel", up);
      element.removeEventListener("lostpointercapture", up);
      element.removeEventListener("keydown", keys);
      element.removeEventListener("dblclick", doubleClick);
    };
  }, [action, src]);
  return (
    <div
      className="galaxy-image"
      ref={host}
      tabIndex={0}
      role="group"
      aria-label="Galaxy image. Drag to pan, scroll or pinch to zoom. Keyboard: plus, minus, arrows and zero to reset."
    >
      <img
        ref={image}
        src={src}
        alt={alt}
        draggable={false}
        decoding="async"
        onLoad={() => setStatus("ready")}
        onError={() => setStatus("error")}
        className={status === "ready" ? "is-ready" : ""}
      />
      {status === "loading" && (
        <p className="atlas-status" role="status">
          Opening galaxy image…
        </p>
      )}
      {status === "error" && (
        <p className="atlas-status" role="status">
          This image could not load. Select another galaxy or reload the page;
          its description is still available.
        </p>
      )}
    </div>
  );
}
