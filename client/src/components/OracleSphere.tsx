/**
 * SOUL EASE | Mochi．crystal — Oracle Sphere
 * The slowly-rotating wireframe "Oracle Eye" crystal, ported from a Google Stitch
 * (AETHERIS) Three.js scene. Only the rotating sphere — no starfield, no shader bg.
 *
 * Re-tinted to the site's lavender accent so it reads on the light oat-milk background.
 * Self-contained lifecycle: auto-cleanup, DPR-capped, ResizeObserver sizing, pauses
 * when the tab is hidden, and respects prefers-reduced-motion (renders a still frame).
 */

import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function OracleSphere({ className = '' }: { className?: string }) {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const prefersReduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    let width = mount.clientWidth || 1;
    let height = mount.clientHeight || 1;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.z = 5;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(width, height);
    mount.appendChild(renderer.domElement);

    // The rotating crystal (icosahedron wireframe), self-illuminated so it glows.
    const group = new THREE.Group();
    const geometry = new THREE.IcosahedronGeometry(1.4, 1);
    const material = new THREE.MeshPhongMaterial({
      color: 0x9b8dc0, // site lavender accent
      emissive: 0xb7a8e0, // glow tint
      emissiveIntensity: 0.28,
      wireframe: true,
      transparent: true,
      opacity: 0.62,
    });
    const crystal = new THREE.Mesh(geometry, material);
    group.add(crystal);

    scene.add(group);

    const light = new THREE.PointLight(0xd2bfea, 1.8, 10);
    light.position.set(0, 0, 2);
    scene.add(light);
    scene.add(new THREE.AmbientLight(0xffffff, 0.6));

    // Mouse parallax (subtle).
    let mouseX = 0;
    let mouseY = 0;
    const onMouseMove = (e: MouseEvent) => {
      mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
      mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener('mousemove', onMouseMove);

    const resize = () => {
      width = mount.clientWidth || 1;
      height = mount.clientHeight || 1;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(resize) : null;
    ro?.observe(mount);

    let raf = 0;
    let running = true;

    const renderFrame = () => {
      group.position.y = Math.sin(Date.now() * 0.001) * 0.15;
      group.rotation.x += (mouseY * 0.1 - group.rotation.x) * 0.05;
      group.rotation.y += (mouseX * 0.1 - group.rotation.y) * 0.05;
      renderer.render(scene, camera);
    };

    const animate = () => {
      if (!running) return;
      group.rotation.y += 0.008;
      group.rotation.z += 0.003;
      renderFrame();
      raf = requestAnimationFrame(animate);
    };

    if (prefersReduced) {
      renderFrame(); // single still frame
    } else {
      raf = requestAnimationFrame(animate);
    }

    const onVisibility = () => {
      if (document.hidden) {
        running = false;
        cancelAnimationFrame(raf);
      } else if (!prefersReduced) {
        running = true;
        raf = requestAnimationFrame(animate);
      }
    };
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('visibilitychange', onVisibility);
      ro?.disconnect();
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === mount) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div ref={mountRef} aria-hidden="true" className={`pointer-events-none ${className}`} />
  );
}
