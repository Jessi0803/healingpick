/**
 * SOUL EASE | Mochi．crystal — Cosmic Mist
 * Inspired by a Google Stitch "Nocturne Boutique" WebGL shader, but re-tinted to the
 * site's Wabi-Sabi Luxe × Morandi Oat-Milk palette: a soft, drifting cream haze with
 * sparse twinkling glints. Light-on-light, transparent canvas so the page shows through.
 *
 * Rewritten for React: self-contained lifecycle, auto-cleanup, DPR-capped sizing,
 * respects prefers-reduced-motion, and pauses when the tab is hidden.
 * Dependency-free (raw WebGL). Drop it as an absolutely-positioned layer behind content.
 */

import { useEffect, useRef } from 'react';

const VERT = `attribute vec2 a_position;
varying vec2 v_uv;
void main() {
  v_uv = a_position * 0.5 + 0.5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}`;

const FRAG = `precision highp float;
varying vec2 v_uv;
uniform float u_time;
uniform float u_aspect;
uniform float u_intensity;

vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }
float snoise(vec2 v){
  const vec4 C = vec4(0.211324865405187, 0.366025403784439,
           -0.577350269189626, 0.024390243902439);
  vec2 i  = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod(i, 289.0);
  vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
  vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
  m = m*m; m = m*m;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
  vec3 g;
  g.x  = a0.x  * x0.x  + h.x  * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

float hash21(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

void main() {
  vec2 uv = v_uv;

  // ── Drifting mist ────────────────────────────────────────────────
  // Slow flow so the haze "breathes" rather than churns.
  float n1 = snoise(uv * 2.4 + u_time * 0.030);
  float n2 = snoise(uv * 1.7 - u_time * 0.018 + n1 * 0.5);
  float n3 = snoise(uv * 4.0 + u_time * 0.045 + n2);
  float mist = n1 * 0.5 + n2 * 0.3 + n3 * 0.2;       // ~[-1,1]
  mist = mist * 0.5 + 0.5;                            // ~[0,1]

  // Oat-Milk Morandi palette — pushed a touch deeper so the haze reads on cream.
  vec3 lilac = vec3(0.831, 0.788, 0.890); // deeper lavender
  vec3 gold   = vec3(0.878, 0.776, 0.560); // deeper milk-tea gold
  vec3 rose   = vec3(0.918, 0.769, 0.776); // #EAC4C6 hint
  vec3 tint = mix(lilac, gold, smoothstep(0.30, 0.78, mist));
  tint = mix(tint, rose, smoothstep(0.6, 0.95, mist) * 0.35);

  // Haze opacity: visible but still soft. Vignette keeps edges clean.
  float vignette = 1.0 - smoothstep(0.55, 1.35, length(uv - 0.5));
  float hazeA = smoothstep(0.25, 0.95, mist) * 0.40 * vignette;

  // ── Drifting glints (the "flowing stars") ────────────────────────
  vec2 suv = uv;
  suv.x *= u_aspect;
  suv += vec2(u_time * 0.006, u_time * 0.004); // slow drift
  float density = 9.0;
  vec2 grid = suv * density;
  vec2 id = floor(grid);
  vec2 f = fract(grid) - 0.5;
  float present = step(0.82, hash21(id));            // ~18% of cells
  vec2 jitter = (vec2(hash21(id + 7.1), hash21(id + 3.7)) - 0.5) * 0.7;
  float d = length(f - jitter);
  float core = present * smoothstep(0.045, 0.0, d);  // small, fine points
  float halo = present * smoothstep(0.14, 0.0, d) * 0.25; // faint glow
  float tw = 0.4 + 0.6 * sin(u_time * 1.8 + hash21(id) * 30.0);
  float glint = (core + halo) * tw;
  vec3 glintCol = vec3(0.93, 0.89, 0.83);            // soft warm white
  float glintA = glint * 0.5 * vignette;

  // Composite haze + glints.
  vec3 color = mix(tint, glintCol, glintA);
  float alpha = (hazeA + glintA) * u_intensity;
  gl_FragColor = vec4(color, alpha);
}`;

interface CosmicMistProps {
  className?: string;
  /** Overall strength multiplier (0–1). */
  intensity?: number;
}

function compile(gl: WebGLRenderingContext, type: number, src: string) {
  const shader = gl.createShader(type)!;
  gl.shaderSource(shader, src);
  gl.compileShader(shader);
  return shader;
}

export default function CosmicMist({ className = '', intensity = 1 }: CosmicMistProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const prefersReduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    const gl = (canvas.getContext('webgl', { alpha: true, premultipliedAlpha: false }) ||
      canvas.getContext('experimental-webgl')) as WebGLRenderingContext | null;
    if (!gl) return;

    const program = gl.createProgram()!;
    gl.attachShader(program, compile(gl, gl.VERTEX_SHADER, VERT));
    gl.attachShader(program, compile(gl, gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(program);
    gl.useProgram(program);

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const aPos = gl.getAttribLocation(program, 'a_position');
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    const uTime = gl.getUniformLocation(program, 'u_time');
    const uAspect = gl.getUniformLocation(program, 'u_aspect');
    const uIntensity = gl.getUniformLocation(program, 'u_intensity');
    gl.uniform1f(uIntensity, intensity);

    // Cap DPR — the effect is soft, so 1.5x is plenty and far cheaper on retina.
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const resize = () => {
      const w = Math.max(1, Math.floor(canvas.clientWidth * dpr));
      const h = Math.max(1, Math.floor(canvas.clientHeight * dpr));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
        gl.viewport(0, 0, w, h);
      }
      gl.uniform1f(uAspect, canvas.clientWidth / Math.max(1, canvas.clientHeight));
    };
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(resize) : null;
    ro?.observe(canvas);
    resize();

    let raf = 0;
    let running = true;
    const start = performance.now();

    const frame = (now: number) => {
      if (!running) return;
      if (!ro) resize();
      gl.uniform1f(uTime, (now - start) * 0.001);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      if (prefersReduced) return; // render a single still frame
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    const onVisibility = () => {
      if (document.hidden) {
        running = false;
        cancelAnimationFrame(raf);
      } else if (!prefersReduced) {
        running = true;
        raf = requestAnimationFrame(frame);
      }
    };
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      document.removeEventListener('visibilitychange', onVisibility);
      ro?.disconnect();
      gl.deleteProgram(program);
      gl.deleteBuffer(buffer);
      gl.getExtension('WEBGL_lose_context')?.loseContext();
    };
  }, [intensity]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 h-full w-full ${className}`}
    />
  );
}
