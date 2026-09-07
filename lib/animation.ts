// One display-synchronized loop per scene. Hidden scenes do no rendering work.
export function animateScene(
  element: HTMLElement,
  draw: (seconds: number, now: number) => void,
) {
  let frame = 0;
  let last = 0;
  let visible = true;
  let disposed = false;
  const tick = (now: number) => {
    if (disposed || document.hidden || !visible) {
      frame = 0;
      return;
    }
    const delta = last ? Math.min((now - last) / 1000, 0.05) : 0;
    last = now;
    draw(delta, now);
    frame = requestAnimationFrame(tick);
  };
  const resume = () => {
    if (document.hidden || !visible) {
      cancelAnimationFrame(frame);
      frame = 0;
    } else if (!frame && !disposed) {
      last = 0;
      frame = requestAnimationFrame(tick);
    }
  };
  const observer = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    resume();
  });
  observer.observe(element);
  document.addEventListener("visibilitychange", resume);
  resume();
  return () => {
    disposed = true;
    cancelAnimationFrame(frame);
    observer.disconnect();
    document.removeEventListener("visibilitychange", resume);
  };
}

export const damping = (seconds: number, rate = 12) =>
  1 - Math.exp(-rate * seconds);

export function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}
