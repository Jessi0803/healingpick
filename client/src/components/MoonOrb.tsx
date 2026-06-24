/**
 * SOUL EASE | Mochi．crystal — Moon Orb
 * The slowly-rotating moon with a soft fresnel glow, ported from a Google Stitch
 * (AETHERIS Daily Fortune) Three.js scene. Only the moon + its own animation —
 * no shader background, no other UI.
 *
 * Self-contained lifecycle: auto-cleanup, DPR-capped, ResizeObserver sizing, pauses
 * when the tab is hidden, and respects prefers-reduced-motion (renders a still frame).
 */

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

export default function MoonOrb({ className = '' }: { className?: string }) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [reduceMotion] = useState(
    () =>
      typeof window !== 'undefined' &&
      !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches,
  );

  // Gentle "rise" entrance — the moon emerges rather than blinking into existence.
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
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.z = 5;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(width, height);
    mount.appendChild(renderer.domElement);

    const moonGroup = new THREE.Group();
    scene.add(moonGroup);

    // Moon sphere.
    const geometry = new THREE.SphereGeometry(1.5, 64, 64);
    const material = new THREE.MeshPhongMaterial({
      color: 0xf8f2e6,
      emissive: 0x8f846f,
      shininess: 18,
      transparent: true,
      opacity: 0.96,
    });
    const moon = new THREE.Mesh(geometry, material);
    moonGroup.add(moon);

    // Soft fresnel glow shell.
    const glowGeo = new THREE.SphereGeometry(1.6, 64, 64);
    const glowMat = new THREE.ShaderMaterial({
      uniforms: {
        c: { value: 0.1 },
        p: { value: 4.5 },
        glowColor: { value: new THREE.Color(0xf3dfb7) },
        viewVector: { value: camera.position },
      },
      vertexShader: `
        uniform vec3 viewVector;
        uniform float c;
        uniform float p;
        varying float intensity;
        void main() {
          vec3 vNormal = normalize( normalMatrix * normal );
          vec3 vNormel = normalize( normalMatrix * viewVector );
          intensity = pow( c - dot(vNormal, vNormel), p );
          gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
        }
      `,
      fragmentShader: `
        precision mediump float;
        uniform vec3 glowColor;
        varying float intensity;
        void main() {
          vec3 glow = glowColor * intensity;
          gl_FragColor = vec4( glow, intensity );
        }
      `,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
      transparent: true,
    });
    const glow = new THREE.Mesh(glowGeo, glowMat);
    moonGroup.add(glow);

    // Lights.
    const ambientLight = new THREE.AmbientLight(0xfff7e8, 2.2);
    scene.add(ambientLight);
    const mainLight = new THREE.PointLight(0xfffbf2, 1.35);
    mainLight.position.set(5, 3, 5);
    scene.add(mainLight);
    const frontFillLight = new THREE.PointLight(0xf3dfb7, 1.1);
    frontFillLight.position.set(0, 0, 5);
    scene.add(frontFillLight);

    // Mouse tilt.
    let mouseX = 0;
    let mouseY = 0;
    const onMouseMove = (e: MouseEvent) => {
      mouseX = (e.clientX / window.innerWidth) * 2 - 1;
      mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    // Reduced motion means no tilt-follow at all — skip the listener entirely.
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
    // actually took (relative to 60fps), so the moon spins and tilts at the same
    // speed on 60Hz and 120Hz displays. Clamped so a long pause (tab switch) can't
    // make it jump on the first frame back.
    const FRAME_MS = 1000 / 60;
    let lastTime = 0;
    const damp = (current: number, target: number, rate: number, dtScale: number) =>
      current + (target - current) * (1 - Math.pow(1 - rate, dtScale));

    const renderFrame = (t: number, dtScale: number) => {
      moonGroup.rotation.x = damp(moonGroup.rotation.x, mouseY * 0.2, 0.05, dtScale);
      moonGroup.rotation.z = damp(moonGroup.rotation.z, mouseX * 0.1, 0.05, dtScale);
      glowMat.uniforms.c.value = 0.16 + Math.sin(t * 0.002) * 0.035; // pulsing glow
      renderer.render(scene, camera);
    };

    const animate = (t: number) => {
      if (!running) return;
      const dtScale = lastTime ? Math.min((t - lastTime) / FRAME_MS, 4) : 1;
      lastTime = t;
      moonGroup.rotation.y += 0.005 * dtScale; // subtle spin
      renderFrame(t, dtScale);
      raf = requestAnimationFrame(animate);
    };

    if (prefersReduced) {
      renderFrame(0, 1);
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
      glowGeo.dispose();
      glowMat.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === mount) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none relative ${className}`}
      style={{
        opacity: mounted ? 1 : 0,
        // Reduced motion: fade only, no scale (movement is what triggers motion sickness).
        transform: reduceMotion ? undefined : `scale(${mounted ? 1 : 0.95})`,
        transition: reduceMotion
          ? 'opacity 800ms cubic-bezier(0.23, 1, 0.32, 1)'
          : 'opacity 800ms cubic-bezier(0.23, 1, 0.32, 1), transform 800ms cubic-bezier(0.23, 1, 0.32, 1)',
      }}
    >
      {/* Soft warm backdrop so the moon reads cleanly on light pages. */}
      <div
        className="absolute left-1/2 top-1/2 -z-10 h-[138%] w-[138%] -translate-x-1/2 -translate-y-1/2 rounded-full blur-2xl"
        style={{
          background:
            'radial-gradient(circle, rgba(255,250,238,0.88) 0%, rgba(243,223,183,0.38) 43%, rgba(209,190,155,0.16) 63%, transparent 78%)',
        }}
      />
      <div ref={mountRef} className="h-full w-full" />
    </div>
  );
}
