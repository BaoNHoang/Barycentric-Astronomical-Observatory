"use client";
import { useEffect, useRef, useState, type RefObject } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import type { ExplorerSystem } from "@/data/explorer-systems";
import { planetMesh, disposeScene } from "@/lib/scene";
import { animateScene, damping, clamp } from "@/lib/animation";
import type { ViewAction } from "@/components/galaxy-image";

type Props = {
  system: ExplorerSystem;
  selected: string | null;
  onSelect: (id: string | null) => void;
  playing: boolean;
  reduced: boolean;
  action: RefObject<((action: ViewAction) => void) | null>;
};

export default function ExplorerSystemScene(props: Props) {
  const host = useRef<HTMLDivElement>(null);
  const latest = useRef(props);
  latest.current = props;
  const [error, setError] = useState("");
  useEffect(() => {
    const container = host.current!;
    const system = latest.current.system;
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: "high-performance",
      });
    } catch {
      setError(
        "3D is unavailable in this browser. Select planets below to read their descriptions and measurements.",
      );
      return;
    }
    setError("");
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    renderer.setClearColor("#050713", 0);
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, 1, 0.01, 1400);
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.maxDistance = 140;
    controls.minDistance = 2;
    controls.zoomSpeed = 0.7;
    camera.position.set(0, 32, 43);
    scene.add(new THREE.AmbientLight("#bac8ed", 1.0));
    const light = new THREE.DirectionalLight("#fff0dc", 2.5);
    light.position.set(-15, 20, 30);
    scene.add(light);
    const star = planetMesh("sun", 1.15, system.color);
    (
      star.children[0] as THREE.Mesh<
        THREE.SphereGeometry,
        THREE.MeshBasicMaterial
      >
    ).material.color.set(system.color);
    scene.add(star);
    const objects = system.planets.map((planet, index) => {
      const radius = clamp(
        Math.sqrt(planet.radiusEarth ?? 1) * 0.25,
        0.19,
        0.85,
      );
      const distance = 4.4 + index * 2.8;
      const mesh = planetMesh(
        planet.texture ?? planet.id,
        radius,
        planet.color,
      );
      scene.add(mesh);
      const points = Array.from(
        { length: 161 },
        (_, i) =>
          new THREE.Vector3(
            Math.cos((i / 160) * Math.PI * 2) * distance,
            0,
            Math.sin((i / 160) * Math.PI * 2) * distance,
          ),
      );
      const orbit = new THREE.Line(
        new THREE.BufferGeometry().setFromPoints(points),
        new THREE.LineBasicMaterial({
          color: "#819ac9",
          transparent: true,
          opacity: 0.27,
        }),
      );
      scene.add(orbit);
      const label = document.createElement("button");
      label.className = "object-label atlas-object-label";
      label.textContent = planet.name;
      label.setAttribute("aria-label", `Focus on ${planet.name}`);
      label.onclick = () => latest.current.onSelect(planet.id);
      container.appendChild(label);
      return {
        planet,
        mesh,
        radius,
        distance,
        orbit,
        label,
        phase: index * 2.39996,
      };
    });
    let seed = 147;
    const random = () => {
      seed = (seed * 16807) % 2147483647;
      return seed / 2147483647;
    };
    const stars = new Float32Array(900 * 3);
    for (let i = 0; i < stars.length; i += 3) {
      const a = random() * Math.PI * 2,
        z = random() * 2 - 1,
        r = Math.sqrt(1 - z * z) * 250;
      stars[i] = Math.cos(a) * r;
      stars[i + 1] = z * 250;
      stars[i + 2] = Math.sin(a) * r;
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(stars, 3));
    scene.add(
      new THREE.Points(
        geometry,
        new THREE.PointsMaterial({
          color: "#bdc8e4",
          size: 0.22,
          transparent: true,
          opacity: 0.65,
        }),
      ),
    );
    container.prepend(renderer.domElement);
    let width = 1,
      height = 1;
    let selected: string | null | undefined;
    const overview = new THREE.Vector3(0, 32, 43);
    const resize = new ResizeObserver(() => {
      width = Math.max(container.clientWidth, 1);
      height = Math.max(container.clientHeight, 1);
      renderer.setSize(width, height);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      overview.set(0, 32, 43).multiplyScalar(Math.max(1, 0.9 / camera.aspect));
      selected = undefined;
    });
    resize.observe(container);
    const goalCamera = camera.position.clone(),
      goalTarget = controls.target.clone();
    let flying = false;
    const fly = (target: THREE.Vector3, destination: THREE.Vector3) => {
      goalTarget.copy(target);
      goalCamera.copy(destination);
      flying = true;
    };
    const interrupt = () => {
      flying = false;
    };
    controls.addEventListener("start", interrupt);
    const action = latest.current.action;
    action.current = (a) => {
      if (a === "reset") {
        latest.current.onSelect(null);
        controls.minDistance = 2;
        fly(new THREE.Vector3(), overview);
      } else {
        const baseTarget = flying ? goalTarget : controls.target;
        const offset = (flying ? goalCamera : camera.position)
          .clone()
          .sub(baseTarget);
        offset.setLength(
          clamp(
            offset.length() * (a === "in" ? 0.72 : 1.4),
            controls.minDistance,
            controls.maxDistance,
          ),
        );
        fly(baseTarget, baseTarget.clone().add(offset));
      }
    };
    const raycaster = new THREE.Raycaster(),
      pointer = new THREE.Vector2();
    let downX = 0,
      downY = 0,
      downId = -1;
    const down = (e: PointerEvent) => {
      downX = e.clientX;
      downY = e.clientY;
      downId = e.pointerId;
    };
    const up = (e: PointerEvent) => {
      if (
        e.pointerId !== downId ||
        Math.hypot(e.clientX - downX, e.clientY - downY) > 5
      )
        return;
      const rect = container.getBoundingClientRect();
      pointer.set(
        ((e.clientX - rect.left) / width) * 2 - 1,
        (-(e.clientY - rect.top) / height) * 2 + 1,
      );
      raycaster.setFromCamera(pointer, camera);
      const hit = raycaster.intersectObjects(
        objects.map((o) => o.mesh),
        true,
      )[0];
      const object =
        hit && objects.find((o) => o.mesh.children.includes(hit.object));
      if (object) latest.current.onSelect(object.planet.id);
    };
    const key = (event: KeyboardEvent) => {
      if (["+", "=", "-", "0"].includes(event.key)) {
        event.preventDefault();
        action.current?.(
          event.key === "0" ? "reset" : event.key === "-" ? "out" : "in",
        );
      }
    };
    renderer.domElement.addEventListener("pointerdown", down);
    renderer.domElement.addEventListener("pointerup", up);
    container.addEventListener("keydown", key);
    const lost = (e: Event) => {
      e.preventDefault();
      setError(
        "The 3D connection was interrupted. Reopen this system to restore the view.",
      );
    };
    renderer.domElement.addEventListener("webglcontextlost", lost);
    let days = 0;
    const projected = new THREE.Vector3();
    const stop = animateScene(container, (dt) => {
      const p = latest.current;
      // Pause orbital travel while inspecting a planet so it stays under the camera.
      if (p.playing && !p.selected) days += dt;
      for (const object of objects) {
        const angle =
          object.phase + (days / object.planet.periodDays) * Math.PI * 2;
        object.mesh.position.set(
          Math.cos(angle) * object.distance,
          0,
          Math.sin(angle) * object.distance,
        );
        if (p.playing) object.mesh.rotation.y += dt * 0.08;
        object.orbit.visible = !p.selected;
      }
      if (selected !== p.selected) {
        const object = objects.find((o) => o.planet.id === p.selected);
        if (object) {
          const reach =
            object.radius *
            (object.planet.id === "saturn" ? 9 : 5.4) *
            Math.max(1, 0.8 / camera.aspect);
          controls.minDistance =
            object.radius * (object.planet.id === "saturn" ? 2.6 : 1.35);
          fly(
            object.mesh.position,
            object.mesh.position
              .clone()
              .add(new THREE.Vector3(reach * 0.35, reach * 0.22, reach)),
          );
        } else {
          controls.minDistance = 2;
          fly(new THREE.Vector3(), overview);
        }
        selected = p.selected;
      }
      controls.dampingFactor = damping(dt, 9);
      if (flying) {
        const alpha = p.reduced ? 1 : damping(dt, 5.5);
        controls.target.lerp(goalTarget, alpha);
        camera.position.lerp(goalCamera, alpha);
        if (
          camera.position.distanceToSquared(goalCamera) < 0.00001 &&
          controls.target.distanceToSquared(goalTarget) < 0.00001
        )
          flying = false;
      }
      controls.update(dt);
      for (const object of objects) {
        projected.copy(object.mesh.position).project(camera);
        object.label.hidden =
          Boolean(p.selected) ||
          projected.z > 1 ||
          projected.z < -1 ||
          Math.abs(projected.x) > 0.88 ||
          Math.abs(projected.y) > 0.8;
        object.label.style.transform = `translate3d(${(projected.x * 0.5 + 0.5) * width}px,${(-projected.y * 0.5 + 0.5) * height + 14}px,0) translateX(-50%)`;
      }
      renderer.render(scene, camera);
    });
    return () => {
      stop();
      resize.disconnect();
      action.current = null;
      renderer.domElement.removeEventListener("pointerdown", down);
      renderer.domElement.removeEventListener("pointerup", up);
      renderer.domElement.removeEventListener("webglcontextlost", lost);
      container.removeEventListener("keydown", key);
      controls.removeEventListener("start", interrupt);
      controls.dispose();
      disposeScene(scene);
      renderer.dispose();
      renderer.domElement.remove();
      objects.forEach((o) => o.label.remove());
    };
  }, [props.system.id]);
  return (
    <div
      ref={host}
      className="atlas-system-canvas"
      tabIndex={0}
      role="group"
      aria-label={`${props.system.name} interactive 3D model. Drag to orbit, pinch or scroll to zoom, select a planet to fly closer.`}
    >
      {error && (
        <p role="status" className="atlas-status">
          {error}
        </p>
      )}
    </div>
  );
}
