/**
 * SOUL EASE | Mochi．crystal — Oracle Sphere
 * The slowly-rotating wireframe "Oracle Eye" crystal, ported from a Google Stitch
 * (AETHERIS) Three.js scene. Only the rotating sphere — no starfield, no shader bg.
 *
 * Re-tinted to the site's lavender accent so it reads on the light oat-milk background.
 * Self-contained lifecycle: auto-cleanup, DPR-capped, ResizeObserver sizing, pauses
 * when the tab is hidden, and respects prefers-reduced-motion (renders a still frame).
 */

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

export default function OracleSphere({ className = '' }: { className?: string }) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [reduceMotion] = useState(
    () =>
      typeof window !== 'undefined' &&
      !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches,
  );

  // Gentle "materialise" entrance — nothing in the real world appears from nothing.
  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

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
    // Fine silver "thread" wireframe.
    const material = new THREE.MeshPhongMaterial({
      color: 0xcfcedd, // soft silver
      emissive: 0xbfc2d6, // cool silver glow
      emissiveIntensity: 0.22,
      wireframe: true,
      transparent: true,
      opacity: 0.55,
    });
    const crystal = new THREE.Mesh(geometry, material);
    group.add(crystal);

    // Soft round sprite for the tiny glinting highlights.
    const spriteCanvas = document.createElement('canvas');
    spriteCanvas.width = spriteCanvas.height = 64;
    const sctx = spriteCanvas.getContext('2d')!;
    const grad = sctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    grad.addColorStop(0, 'rgba(255,255,255,0.95)');
    grad.addColorStop(0.35, 'rgba(232,234,245,0.5)');
    grad.addColorStop(1, 'rgba(232,234,245,0)');
    sctx.fillStyle = grad;
    sctx.fillRect(0, 0, 64, 64);
    const sprite = new THREE.CanvasTexture(spriteCanvas);

    // Tiny silver-white glints at each vertex; they shimmer in the render loop.
    const pointsMaterial = new THREE.PointsMaterial({
      map: sprite,
      color: 0xeef0f8, // silver white
      size: 0.12,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.55,
      depthWrite: false,
    });
    const vertexGlint = new THREE.Points(geometry, pointsMaterial);
    group.add(vertexGlint);

    scene.add(group);

    const light = new THREE.PointLight(0xeaeaf2, 1.8, 10); // cool silver light
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
    // Reduced motion means no parallax follow at all — skip the listener entirely.
    if (!prefersReduced) window.addEventListener('mousemove', onMouseMove);

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

    // Frame-rate independence: scale every per-frame delta by how long the frame
    // actually took (relative to 60fps), so the crystal spins and follows the mouse
    // at the same speed on 60Hz and 120Hz displays. Clamped so a long pause (tab
    // switch) can't make it jump on the first frame back.
    const FRAME_MS = 1000 / 60;
    let lastTime = 0;
    const damp = (current: number, target: number, rate: number, dtScale: number) =>
      current + (target - current) * (1 - Math.pow(1 - rate, dtScale));

    const renderFrame = (now: number, dtScale: number) => {
      const t = now * 0.001;
      group.position.y = Math.sin(t) * 0.15;
      group.rotation.x = damp(group.rotation.x, mouseY * 0.1, 0.05, dtScale);
      group.rotation.y = damp(group.rotation.y, mouseX * 0.1, 0.05, dtScale);
      // Gentle twinkle on the glints.
      pointsMaterial.opacity = 0.4 + 0.25 * Math.sin(t * 1.6);
      renderer.render(scene, camera);
    };

    const animate = (now: number) => {
      if (!running) return;
      const dtScale = lastTime ? Math.min((now - lastTime) / FRAME_MS, 4) : 1;
      lastTime = now;
      group.rotation.y += 0.008 * dtScale;
      group.rotation.z += 0.003 * dtScale;
      renderFrame(now, dtScale);
      raf = requestAnimationFrame(animate);
    };

    if (prefersReduced) {
      renderFrame(0, 1); // single still frame
    } else {
      raf = requestAnimationFrame(animate);
    }

    const onVisibility = () => {
      if (document.hidden) {
        running = false;
        cancelAnimationFrame(raf);
      } else if (!prefersReduced) {
        running = true;
        lastTime = 0; // reset so the first frame after resuming uses a normal delta
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
      pointsMaterial.dispose();
      sprite.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === mount) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={mountRef}
      aria-hidden="true"
      className={`pointer-events-none ${className}`}
      style={{
        opacity: mounted ? 1 : 0,
        // Reduced motion: fade only, no scale (movement is what triggers motion sickness).
        transform: reduceMotion ? undefined : `scale(${mounted ? 1 : 0.95})`,
        transition: reduceMotion
          ? 'opacity 800ms cubic-bezier(0.23, 1, 0.32, 1)'
          : 'opacity 800ms cubic-bezier(0.23, 1, 0.32, 1), transform 800ms cubic-bezier(0.23, 1, 0.32, 1)',
      }}
    />
  );
}
