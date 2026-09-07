"use client";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { planets } from "@/data/bodies";
import { eclipticVector, orbitPoints, AU_KM } from "@/lib/astronomy";
import { planetMesh, disposeScene } from "@/lib/scene";
import { Maximize2, Plus, Minus, RotateCcw } from "@/components/icons";
type Props = {
  time: string;
  selected: string;
  onSelect: (id: string) => void;
  labels: boolean;
  orbits: boolean;
  trueScale: boolean;
  topView: boolean;
};
export default function SolarScene(props: Props) {
  const host = useRef<HTMLDivElement>(null),
    current = useRef(props),
    cameraAction = useRef<(action: string) => void>(() => {}),
    [error, setError] = useState("");
  current.current = props;
  useEffect(() => {
    const container = host.current;
    if (!container) return;
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    } catch {
      setError(
        "This browser cannot open 3D. You can still select objects below and explore their data.",
      );
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    const scene = new THREE.Scene(),
      camera = new THREE.PerspectiveCamera(42, 1, 0.05, 5000);
    camera.position.set(0, 46, 68);
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.07;
    controls.minDistance = 1;
    controls.maxDistance = 1400;
    controls.maxPolarAngle = Math.PI * 0.95;
    scene.add(new THREE.AmbientLight("#a1b9df", 1.1));
    scene.add(new THREE.PointLight("#fff1dc", 80, 0, 0));
    const sun = planetMesh("sun", 1.12, "#efb477");
    scene.add(sun);
    const objects = planets.map((planet) => {
      const size =
        planet.id === "jupiter"
          ? 0.65
          : planet.id === "saturn"
            ? 0.52
            : planet.id === "uranus" || planet.id === "neptune"
              ? 0.4
              : 0.22;
      const mesh = planetMesh(planet.id, size, planet.color);
      scene.add(mesh);
      const path = new THREE.Line(
        new THREE.BufferGeometry(),
        new THREE.LineBasicMaterial({
          color: planet.color,
          transparent: true,
          opacity: 0.23,
        }),
      );
      scene.add(path);
      const label = document.createElement("button");
      label.className = "object-label";
      label.textContent = planet.name;
      label.setAttribute("aria-label", `Select ${planet.name}`);
      label.onclick = () => current.current.onSelect(planet.id);
      container.appendChild(label);
      return { planet, mesh, path, label, size };
    });
    // Background points are ambience, not a sky chart or a star catalog.
    const background = new Float32Array(1500 * 3);
    let seed = 47;
    const random = () => {
      seed = (seed * 16807) % 2147483647;
      return seed / 2147483647;
    };
    for (let i = 0; i < 1500; i++) {
      const angle = random() * Math.PI * 2,
        z = random() * 2 - 1,
        r = Math.sqrt(1 - z * z) * 500;
      background[i * 3] = r * Math.cos(angle);
      background[i * 3 + 1] = z * 500;
      background[i * 3 + 2] = r * Math.sin(angle);
    }
    const starGeometry = new THREE.BufferGeometry();
    starGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(background, 3),
    );
    scene.add(
      new THREE.Points(
        starGeometry,
        new THREE.PointsMaterial({
          color: "#a2afc1",
          size: 0.28,
          transparent: true,
          opacity: 0.65,
        }),
      ),
    );
    container.prepend(renderer.domElement);
    const resize = new ResizeObserver(() => {
      const rect = container.getBoundingClientRect();
      renderer.setSize(rect.width, rect.height);
      camera.aspect = rect.width / Math.max(1, rect.height);
      camera.updateProjectionMatrix();
    });
    resize.observe(container);
    cameraAction.current = (action) => {
      if (action === "reset") {
        camera.position.set(
          0,
          current.current.topView ? 120 : 46,
          current.current.topView ? 0.01 : 68,
        );
        camera.position.multiplyScalar(current.current.trueScale ? 8 : 1);
        controls.target.set(0, 0, 0);
      }
      if (action === "in")
        camera.position
          .sub(controls.target)
          .multiplyScalar(0.8)
          .add(controls.target);
      if (action === "out")
        camera.position
          .sub(controls.target)
          .multiplyScalar(1.25)
          .add(controls.target);
      if (action === "fullscreen") {
        if (!document.fullscreenElement)
          container.parentElement
            ?.requestFullscreen?.()
            .catch(() =>
              setError("Fullscreen is unavailable in this browser."),
            );
        else document.exitFullscreen();
      }
    };
    const raycaster = new THREE.Raycaster(),
      pointer = new THREE.Vector2();
    let downX = 0,
      downY = 0;
    const down = (event: PointerEvent) => {
      downX = event.clientX;
      downY = event.clientY;
    };
    const click = (event: PointerEvent) => {
      if (Math.hypot(event.clientX - downX, event.clientY - downY) > 5) return;
      const rect = container.getBoundingClientRect();
      pointer.set(
        ((event.clientX - rect.left) / rect.width) * 2 - 1,
        (-(event.clientY - rect.top) / rect.height) * 2 + 1,
      );
      raycaster.setFromCamera(pointer, camera);
      const hit = raycaster.intersectObjects(
        objects.map((object) => object.mesh),
        true,
      )[0];
      if (hit) {
        const object = objects.find((object) =>
          object.mesh.children.includes(hit.object),
        );
        if (object) current.current.onSelect(object.planet.id);
      }
    };
    renderer.domElement.addEventListener("pointerdown", down);
    renderer.domElement.addEventListener("pointerup", click);
    let frame = 0,
      lastTime = "",
      lastScale: boolean | null = null,
      lastTop: boolean | null = null,
      orbitYear = -1;
    const projected = new THREE.Vector3();
    function draw() {
      const settings = current.current,
        date = new Date(settings.time);
      const changedScale = settings.trueScale !== lastScale;
      if (settings.topView !== lastTop || changedScale) {
        camera.position.set(
          0,
          settings.topView ? 120 : 46,
          settings.topView ? 0.01 : 68,
        );
        camera.position.multiplyScalar(settings.trueScale ? 8 : 1);
        controls.target.set(0, 0, 0);
        lastTop = settings.topView;
        lastScale = settings.trueScale;
      }
      if (settings.time !== lastTime || changedScale) {
        for (const object of objects) {
          const vector = eclipticVector(object.planet.id, date);
          const scale = settings.trueScale
            ? 10
            : (12 * Math.log(1 + object.planet.semiMajorAu)) /
              object.planet.semiMajorAu;
          object.mesh.position.set(
            vector.x * scale,
            vector.z * scale,
            -vector.y * scale,
          );
          object.mesh.scale.setScalar(
            settings.trueScale
              ? ((object.planet.radiusKm / AU_KM) * 10) / object.size
              : 1,
          );
          if (orbitYear !== date.getUTCFullYear() || changedScale) {
            const points = orbitPoints(object.planet.id, date, 120).map(
              (v) => new THREE.Vector3(v.x * scale, v.z * scale, -v.y * scale),
            );
            object.path.geometry.dispose();
            object.path.geometry = new THREE.BufferGeometry().setFromPoints(
              points,
            );
          }
        }
        sun.scale.setScalar(
          settings.trueScale ? ((695700 / AU_KM) * 10) / 1.12 : 1,
        );
        lastTime = settings.time;
        orbitYear = date.getUTCFullYear();
      }
      controls.update();
      const width = container!.clientWidth,
        height = container!.clientHeight;
      for (const object of objects) {
        const selected = object.planet.id === settings.selected;
        (object.path.material as THREE.LineBasicMaterial).opacity = selected
          ? 0.68
          : 0.2;
        object.path.visible = settings.orbits;
        projected.copy(object.mesh.position).project(camera);
        object.label.style.display =
          settings.labels &&
          projected.z < 1 &&
          Math.abs(projected.x) < 0.96 &&
          Math.abs(projected.y) < 0.9
            ? "block"
            : "none";
        object.label.style.left = `${(projected.x * 0.5 + 0.5) * width}px`;
        object.label.style.top = `${(-projected.y * 0.5 + 0.5) * height + 12}px`;
        object.label.dataset.selected = String(selected);
        object.label.style.setProperty("--object-color", object.planet.color);
      }
      renderer.render(scene, camera);
      frame = requestAnimationFrame(draw);
    }
    frame = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(frame);
      resize.disconnect();
      controls.dispose();
      disposeScene(scene);
      renderer.dispose();
      renderer.domElement.remove();
      objects.forEach((o) => o.label.remove());
    };
  }, []);
  return (
    <div className="scene-wrap">
      <div
        ref={host}
        className="solar-canvas"
        role="group"
        aria-label="Interactive solar system. Drag to orbit, scroll to zoom, or select a labeled planet."
      />
      {error && (
        <div className="scene-error" role="status">
          {error}
        </div>
      )}
      <div className="scene-coordinate">
        <span>HELIOCENTRIC</span>
        <span>J2000 ECLIPTIC</span>
      </div>
      <div className="scene-tools">
        {[
          { id: "in", label: "Zoom in", icon: Plus },
          { id: "out", label: "Zoom out", icon: Minus },
          { id: "reset", label: "Reset camera", icon: RotateCcw },
          { id: "fullscreen", label: "Fullscreen", icon: Maximize2 },
        ].map((tool) => (
          <button
            key={tool.id}
            aria-label={tool.label}
            title={tool.label}
            onClick={() => cameraAction.current(tool.id)}
          >
            <tool.icon size={17} />
          </button>
        ))}
      </div>
      <div className="scene-hint">
        Drag to orbit <span>·</span> Scroll to zoom <span>·</span> Select a
        planet
      </div>
    </div>
  );
}
