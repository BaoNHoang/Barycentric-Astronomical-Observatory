// Three.js draws the spheres; Astronomy Engine supplies their coordinates.
import * as THREE from "three";
export function texturePath(id: string) {
  const names: Record<string, string> = {
    earth: "earth_daymap",
    venus: "venus_atmosphere",
  };
  return `/textures/2k_${names[id] ?? id}.jpg`;
}
export function planetMesh(id: string, radius: number, color: string) {
  const group = new THREE.Group();
  const textured = [
    "sun",
    "mercury",
    "venus",
    "earth",
    "mars",
    "jupiter",
    "saturn",
    "uranus",
    "neptune",
    "moon",
  ].includes(id);
  const texture = textured
    ? new THREE.TextureLoader().load(texturePath(id))
    : null;
  if (texture) texture.colorSpace = THREE.SRGBColorSpace;
  const material =
    id === "sun"
      ? new THREE.MeshBasicMaterial({ map: texture })
      : new THREE.MeshStandardMaterial({
          map: texture,
          color: texture ? "#ffffff" : color,
          roughness: 1,
        });
  const sphere = new THREE.Mesh(
    new THREE.SphereGeometry(radius, 48, 32),
    material,
  );
  group.add(sphere);
  if (id === "saturn") {
    const ring = new THREE.Mesh(
      new THREE.RingGeometry(radius * 1.35, radius * 2.3, 100),
      new THREE.MeshStandardMaterial({
        color: "#bdaa89",
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.6,
        roughness: 1,
      }),
    );
    ring.rotation.x = Math.PI / 2;
    ring.rotation.y = 0.45;
    group.add(ring);
  }
  group.userData = { id, color };
  return group;
}
export function disposeScene(scene: THREE.Scene) {
  scene.traverse((object) => {
    const mesh = object as THREE.Mesh;
    mesh.geometry?.dispose();
    const materials = mesh.material
      ? Array.isArray(mesh.material)
        ? mesh.material
        : [mesh.material]
      : [];
    materials.forEach((material) => {
      (material as THREE.MeshStandardMaterial).map?.dispose();
      material.dispose();
    });
  });
}
