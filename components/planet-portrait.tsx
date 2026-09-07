"use client";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { planetMesh, disposeScene } from "@/lib/scene";
import { Orbit } from "@/components/icons";
export default function PlanetPortrait({
  id,
  color,
}: {
  id: string;
  color: string;
}) {
  const host = useRef<HTMLDivElement>(null),
    [failed, setFailed] = useState(false);
  useEffect(() => {
    const container = host.current;
    if (!container) return;
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    } catch {
      setFailed(true);
      return;
    }
    setFailed(false);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    const scene = new THREE.Scene(),
      camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
    camera.position.set(0, 0.2, id === "saturn" ? 7.5 : 4.5);
    const planet = planetMesh(id, 1, color);
    planet.rotation.z = id === "earth" ? 0.41 : 0.1;
    scene.add(planet);
    scene.add(new THREE.AmbientLight("#b0c2df", 0.4));
    const light = new THREE.DirectionalLight("#fff0dd", 3);
    light.position.set(-4, 3, 5);
    scene.add(light);
    container.appendChild(renderer.domElement);
    const observer = new ResizeObserver(() => {
      const { width, height } = container.getBoundingClientRect();
      renderer.setSize(width, height);
      camera.aspect = width / Math.max(1, height);
      camera.updateProjectionMatrix();
    });
    observer.observe(container);
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    let frame = 0,
      last = 0;
    function draw(now: number) {
      if (!reduced)
        planet.rotation.y += Math.min((now - last) / 1000, 0.05) * 0.08;
      last = now;
      renderer.render(scene, camera);
      frame = requestAnimationFrame(draw);
    }
    frame = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      disposeScene(scene);
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [id, color]);
  return (
    <div
      className="planet-portrait"
      ref={host}
      role="img"
      aria-label={`Illustrative rotating rendering of ${id}`}
    >
      {failed && (
        <div className="portrait-fallback">
          <Orbit size={48} />
          <span>3D requires WebGL</span>
        </div>
      )}
    </div>
  );
}
