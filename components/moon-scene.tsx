"use client";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { moons, findBody } from "@/data/bodies";
import { eclipticVector, DAY_MS } from "@/lib/astronomy";
import { planetMesh, disposeScene } from "@/lib/scene";
type Props = {
  time: string;
  selected: string;
  onSelect: (id: string) => void;
  orbits: boolean;
  labels: boolean;
  topView: boolean;
  trueScale: boolean;
};
export default function MoonScene(props: Props) {
  const host = useRef<HTMLDivElement>(null),
    current = useRef(props),
    [error, setError] = useState("");
  current.current = props;
  const parent = findBody(props.selected)!.parent.toLowerCase();
  useEffect(() => {
    const container = host.current!;
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    } catch {
      setError("3D requires WebGL. The object data remains available.");
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    const scene = new THREE.Scene(),
      camera = new THREE.PerspectiveCamera(42, 1, 0.01, 1000);
    camera.position.set(0, 10, 16);
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.minDistance = 1;
    controls.maxDistance = 60;
    scene.add(new THREE.AmbientLight("#b4c8e0", 1.4));
    const light = new THREE.DirectionalLight("#fff0da", 2.3);
    light.position.set(-8, 5, 10);
    scene.add(light);
    const planet = findBody(parent)!;
    const central = planetMesh(parent, 0.8, planet.color);
    scene.add(central);
    const system = moons.filter((moon) => moon.parent.toLowerCase() === parent),
      scale = 7 / Math.max(...system.map((m) => m.semiMajorAu));
    const objects = system.map((moon) => {
      const mesh = planetMesh(moon.id, 0.14, moon.color);
      scene.add(mesh);
      const path = new THREE.Line(
        new THREE.BufferGeometry(),
        new THREE.LineBasicMaterial({
          color: moon.color,
          transparent: true,
          opacity: 0.35,
        }),
      );
      scene.add(path);
      const label = document.createElement("button");
      label.className = "object-label";
      label.textContent = moon.name;
      label.onclick = () => current.current.onSelect(moon.id);
      container.appendChild(label);
      return { moon, mesh, path, label };
    });
    function relative(id: string, time: Date) {
      const m = eclipticVector(id, time),
        p = eclipticVector(parent, time);
      return new THREE.Vector3(
        (m.x - p.x) * scale,
        (m.z - p.z) * scale,
        -(m.y - p.y) * scale,
      );
    }
    container.prepend(renderer.domElement);
    const resize = new ResizeObserver(() => {
      const { width, height } = container.getBoundingClientRect();
      renderer.setSize(width, height);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    });
    resize.observe(container);
    let frame = 0,
      lastTime = "",
      lastMonth = "",
      lastTop: boolean | null = null;
    const projected = new THREE.Vector3();
    function draw() {
      const p = current.current,
        date = new Date(p.time);
      if (lastTop !== p.topView) {
        camera.position.set(0, p.topView ? 19 : 10, p.topView ? 0.01 : 16);
        lastTop = p.topView;
      }
      if (p.time !== lastTime) {
        for (const object of objects) {
          object.mesh.position.copy(relative(object.moon.id, date));
          if (p.time.slice(0, 7) !== lastMonth) {
            const points = Array.from({ length: 101 }, (_, i) =>
              relative(
                object.moon.id,
                new Date(
                  date.getTime() + (object.moon.periodDays * DAY_MS * i) / 100,
                ),
              ),
            );
            object.path.geometry.dispose();
            object.path.geometry = new THREE.BufferGeometry().setFromPoints(
              points,
            );
          }
        }
        lastTime = p.time;
        lastMonth = p.time.slice(0, 7);
      }
      central.scale.setScalar(
        p.trueScale ? ((planet.radiusKm / 149597870.7) * scale) / 0.8 : 1,
      );
      controls.update();
      for (const object of objects) {
        object.mesh.scale.setScalar(
          p.trueScale
            ? ((object.moon.radiusKm / 149597870.7) * scale) / 0.14
            : 1,
        );
        object.path.visible = p.orbits;
        projected.copy(object.mesh.position).project(camera);
        object.label.style.display =
          p.labels && projected.z < 1 ? "block" : "none";
        object.label.style.left = `${(projected.x * 0.5 + 0.5) * container.clientWidth}px`;
        object.label.style.top = `${(-projected.y * 0.5 + 0.5) * container.clientHeight + 12}px`;
        object.label.dataset.selected = String(object.moon.id === p.selected);
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
      objects.forEach((object) => object.label.remove());
    };
  }, [parent]);
  return (
    <div className="scene-wrap">
      <div
        className="solar-canvas"
        ref={host}
        role="group"
        aria-label={`Interactive ${parent} moon system`}
      />
      <div className="scene-coordinate">
        <span>{parent.toUpperCase()} SYSTEM</span>
        <span>J2000 ECLIPTIC</span>
      </div>
      {error && <div className="scene-error">{error}</div>}
      <div className="scene-hint">
        Calculated moon positions · drag to orbit · scroll to zoom
      </div>
    </div>
  );
}
