import assert from "node:assert/strict";
import { animateScene, damping } from "@/lib/animation";

// A camera must cover the same distance at 60 Hz and 120 Hz.
function remainingAfterSecond(hz: number) {
  let remaining = 1;
  for (let i = 0; i < hz; i++) remaining *= 1 - damping(1 / hz, 8);
  return remaining;
}
assert.ok(
  Math.abs(remainingAfterSecond(60) - remainingAfterSecond(120)) < 1e-10,
);

// Exercise visibility and cleanup without claiming browser/visual coverage.
const original = {
  document: globalThis.document,
  raf: globalThis.requestAnimationFrame,
  cancel: globalThis.cancelAnimationFrame,
  observer: globalThis.IntersectionObserver,
};
const frames = new Map<number, FrameRequestCallback>();
let nextId = 1;
let visible: (() => void) | undefined;
let observe: IntersectionObserverCallback;
let disconnected = false;
const documentStub = {
  hidden: false,
  addEventListener: (_: string, callback: () => void) => {
    visible = callback;
  },
  removeEventListener: () => {
    visible = undefined;
  },
};
try {
  Object.assign(globalThis, {
    document: documentStub,
    requestAnimationFrame: (fn: FrameRequestCallback) => {
      const id = nextId++;
      frames.set(id, fn);
      return id;
    },
    cancelAnimationFrame: (id: number) => frames.delete(id),
    IntersectionObserver: class {
      constructor(fn: IntersectionObserverCallback) {
        observe = fn;
      }
      observe() {}
      disconnect() {
        disconnected = true;
      }
    },
  });
  const deltas: number[] = [];
  const stop = animateScene({} as HTMLElement, (dt) => deltas.push(dt));
  const advance = (now: number) => {
    const pending = Array.from(frames.values());
    frames.clear();
    pending.forEach((fn) => fn(now));
  };
  advance(1000);
  advance(1016);
  advance(9016);
  assert.deepEqual(
    deltas,
    [0, 0.016, 0.05],
    "Long stalls must not jump the simulation clock",
  );
  documentStub.hidden = true;
  visible!();
  assert.equal(frames.size, 0, "Hidden tabs must stop rendering");
  documentStub.hidden = false;
  visible!();
  advance(100000);
  assert.equal(
    deltas.at(-1),
    0,
    "Returning to a tab must resume without a time jump",
  );
  observe!(
    [{ isIntersecting: false } as IntersectionObserverEntry],
    {} as IntersectionObserver,
  );
  assert.equal(frames.size, 0, "Offscreen canvases must stop rendering");
  observe!(
    [{ isIntersecting: true } as IntersectionObserverEntry],
    {} as IntersectionObserver,
  );
  assert.equal(frames.size, 1, "Visible scenes must resume one loop");
  stop();
  assert.equal(frames.size, 0);
  assert.equal(visible, undefined);
  assert.equal(disconnected, true);
} finally {
  Object.assign(globalThis, {
    document: original.document,
    requestAnimationFrame: original.raf,
    cancelAnimationFrame: original.cancel,
    IntersectionObserver: original.observer,
  });
}
console.log(
  "Animation checks passed: refresh-independent damping, bounded frame deltas, visibility suspension and cleanup.",
);
