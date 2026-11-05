"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import * as THREE from "three";
import { BANDS, BAND_HEX, INK_HEX, REACH, WATERLINE, buildField, depthMetres, isolinePath } from "./harbour";

/**
 * The harbour relief as a stack of cut plates, one per depth band, each a
 * flat unlit colour with an ink rim where the survey crosses its level.
 * Depth comes from the plates overlapping, never from shading.
 *
 * One render covers the whole sheet: on wide screens the left part of the
 * same drawing is printed faint (contour lines only) under the text, so the
 * chart under the title and the relief at the right are one survey. The
 * soundings and the water name are projected through the same camera.
 *
 * Scroll is the only input: at the top the plates lie together in plan view;
 * as you scroll the sheet tilts, the plates lift apart, the stack turns to
 * show the channel, and it settles.
 */

const N = 256;       // survey samples per side
const SIZE = 8.8;    // plate edge, scene units (the plates run well past the frame at every pose)
const GAP = 0.1;     // full lift between plates, scene units
const DIST = 6.3;
const SPLIT = 0.45;  // the faint sheet covers this fraction of the width on wide screens
const WIDE = 900;    // px; below this the relief runs full-bleed behind the sheet

const toVec = (hex: number) =>
  new THREE.Vector3(((hex >> 16) & 255) / 255, ((hex >> 8) & 255) / 255, (hex & 255) / 255);

const VERT = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }`;

// a plate exists wherever the seabed is at or above its level; its rim is drawn in ink.
// left of uSplit (drawing-buffer px) only the rim prints, faint, as the sheet's own contours.
const FRAG = /* glsl */ `
  uniform sampler2D uField;
  uniform float uThr, uSplit;
  uniform vec3 uCol, uInk, uFaint;
  varying vec2 vUv;
  void main() {
    float h = texture2D(uField, vUv).r;
    float d = h - uThr;
    float w = fwidth(h) + 1e-5;
    float a = smoothstep(-w, w, d);
    if (a < 0.004) discard;
    float rim = 1.0 - smoothstep(0.0, w * 1.5, d);
    if (gl_FragCoord.x < uSplit) {
      if (uThr < 0.0) discard;
      gl_FragColor = vec4(uFaint, rim * a);
      return;
    }
    vec3 col = mix(uCol, uInk, rim * 0.78);
    gl_FragColor = vec4(col, a);
  }`;

type Pose = { tilt: number; lift: number; yaw: number };

/** Everything the relief does, from one scalar: document scroll progress. */
function choreo(s: number): Pose {
  const t = (a: number, b: number) => { const x = Math.min(1, Math.max(0, (s - a) / (b - a))); return x * x * (3 - 2 * x); };
  const rise = t(0.05, 0.38);   // about to projects: tilt up, lift apart
  const turn = t(0.4, 0.72);    // skills to education: turn to show the channel
  const settle = t(0.78, 1);    // contact: back toward plan, calm
  return {
    tilt: 6 + 42 * rise - 26 * settle,
    lift: rise - 0.3 * settle,
    yaw: -0.5 + 1.45 * turn,
  };
}
const STATIC: Pose = { tilt: 44, lift: 0.9, yaw: -0.35 };

// the water name prints on the channel itself; a second point along the channel sets its angle
const NAME_AT: [number, number] = [-0.5, -0.48];
const NAME_TO: [number, number] = [0.2, 0.19];

/** Survey points for the soundings: a jittered grid, water only, clear of the water name. */
function pickSoundings(field: Float32Array) {
  const pts: { u: number; v: number; h: number; m: number }[] = [];
  const at = (u: number, v: number) => {
    const gx = (u / REACH + 1) / 2, gy = (v / REACH + 1) / 2;
    return field[Math.round(gy * (N - 1)) * N + Math.round(gx * (N - 1))];
  };
  for (let j = 0; j < 8; j++) {
    for (let i = 0; i < 8; i++) {
      const u = -1.75 + (i + 0.25 + 0.5 * (((i * 7 + j * 13) % 10) / 10)) * (3.5 / 8);
      const v = -1.75 + (j + 0.25 + 0.5 * (((i * 11 + j * 5) % 10) / 10)) * (3.5 / 8);
      const h = at(u, v);
      if (h > WATERLINE - 0.06) continue;
      if (Math.hypot(u - (NAME_AT[0] + NAME_TO[0]) / 2, v - (NAME_AT[1] + NAME_TO[1]) / 2) < 0.5) continue;
      pts.push({ u, v, h, m: depthMetres(h) });
    }
  }
  return pts;
}

export default function ChartScene({ readoutRef }: { readoutRef: RefObject<HTMLSpanElement | null> }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayRef = useRef<SVGSVGElement>(null);
  const [fallback, setFallback] = useState(false);
  const [soundings, setSoundings] = useState<{ u: number; v: number; h: number; m: number }[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const wrap = canvas.parentElement as HTMLElement;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "high-performance" });
    } catch {
      setFallback(true);
      return;
    }
    renderer.setClearColor(0x000000, 0);
    const pr = Math.min(window.devicePixelRatio || 1, 1.5);
    renderer.setPixelRatio(pr);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 60);

    // the survey, once, as a texture every plate reads
    const field = buildField(N);
    const pts = pickSoundings(field);
    setSoundings(pts);
    const half = new Uint16Array(field.length);
    for (let i = 0; i < field.length; i++) half[i] = THREE.DataUtils.toHalfFloat(field[i]);
    const tex = new THREE.DataTexture(half, N, N, THREE.RedFormat, THREE.HalfFloatType);
    tex.magFilter = THREE.LinearFilter;
    tex.minFilter = THREE.LinearFilter;
    tex.needsUpdate = true;

    const geo = new THREE.PlaneGeometry(SIZE, SIZE, 1, 1);
    const ink = toVec(INK_HEX);
    const faint = toVec(0xb6d9ec);
    const plates: THREE.Mesh[] = [];
    const mats: THREE.ShaderMaterial[] = [];
    for (let k = 0; k < BANDS; k++) {
      const mat = new THREE.ShaderMaterial({
        vertexShader: VERT,
        fragmentShader: FRAG,
        uniforms: {
          uField: { value: tex },
          uThr: { value: k === 0 ? -1 : k / BANDS },
          uSplit: { value: 0 },
          uCol: { value: toVec(BAND_HEX[k]) },
          uInk: { value: ink },
          uFaint: { value: faint },
        },
        transparent: true,
        depthTest: false,   // plate k is always above plate k-1, so paint in order
        depthWrite: false,
        side: THREE.DoubleSide,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.rotation.x = -Math.PI / 2;
      mesh.renderOrder = k;
      mesh.frustumCulled = false;
      scene.add(mesh);
      plates.push(mesh);
      mats.push(mat);
    }

    let W = 1, H = 1, splitCss = 0;
    const resize = () => {
      W = wrap.clientWidth || 1; H = wrap.clientHeight || 1;
      renderer.setSize(W, H, false);
      camera.aspect = W / H;
      camera.updateProjectionMatrix();
      splitCss = window.innerWidth >= WIDE ? SPLIT * W : 0;
      mats.forEach((m) => { m.uniforms.uSplit.value = splitCss * pr; });
      overlayRef.current?.setAttribute("viewBox", `0 0 ${W} ${H}`);
    };

    let target = 0, s = 0;
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      target = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
    };

    // field (u, v) in authoring units → world, on the plate of its own band
    const world = (u: number, v: number, h: number, gap: number) =>
      new THREE.Vector3((u / REACH) * SIZE * 0.5, Math.min(BANDS - 1, Math.floor(h * BANDS)) * gap, -(v / REACH) * SIZE * 0.5);
    const toPx = (p: THREE.Vector3) => { p.project(camera); return [((p.x + 1) / 2) * W, ((1 - p.y) / 2) * H] as const; };

    const placeOverlay = (c: Pose, gap: number) => {
      const svg = overlayRef.current;
      if (!svg || !splitCss) return;
      const fade = 1 - Math.min(1, Math.max(0, (c.lift - 0.1) / 0.3));
      svg.style.opacity = fade.toFixed(3);
      if (fade <= 0) return;
      // soundings never print over the title block's copy
      const block = document.querySelector(".chart-title-block")?.getBoundingClientRect();
      const inBlock = (x: number, y: number) =>
        !!block && x > block.left - 14 && x < block.right + 14 && y > block.top - 14 && y < block.bottom + 14;
      const texts = svg.querySelectorAll<SVGTextElement>("text[data-u]");
      texts.forEach((el) => {
        const u = Number(el.dataset.u), v = Number(el.dataset.v), h = Number(el.dataset.h);
        const [x, y] = toPx(world(u, v, h, gap));
        const show = x > 24 && x < splitCss - 16 && y > 80 && y < H - 24 && !inBlock(x, y);
        el.setAttribute("x", x.toFixed(1));
        el.setAttribute("y", y.toFixed(1));
        el.style.display = show ? "" : "none";
      });
      const name = svg.querySelector<SVGTextElement>(".chart-water-name");
      if (name) {
        const hA = field[Math.round(((NAME_AT[1] / REACH + 1) / 2) * (N - 1)) * N + Math.round(((NAME_AT[0] / REACH + 1) / 2) * (N - 1))];
        let [ax, ay] = toPx(world(NAME_AT[0], NAME_AT[1], hA, gap));
        let [bx, by] = toPx(world(NAME_TO[0], NAME_TO[1], hA, gap));
        let ang = (Math.atan2(by - ay, bx - ax) * 180) / Math.PI;
        if (ang > 90 || ang < -90) { [ax, ay, bx, by] = [bx, by, ax, ay]; ang = (Math.atan2(by - ay, bx - ax) * 180) / Math.PI; }
        name.setAttribute("x", ax.toFixed(1));
        name.setAttribute("y", ay.toFixed(1));
        name.setAttribute("transform", `rotate(${ang.toFixed(1)} ${ax.toFixed(1)} ${ay.toFixed(1)})`);
        name.style.display = ax > 0 && ax < W && ay > 80 && ay < H ? "" : "none";
      }
    };

    const draw = (c: Pose, drift: number) => {
      const tilt = THREE.MathUtils.degToRad(c.tilt);
      const yaw = c.yaw + drift;
      const gap = GAP * Math.max(0, c.lift);
      for (let k = 0; k < BANDS; k++) plates[k].position.y = k * gap;
      camera.position.set(Math.sin(tilt) * Math.sin(yaw) * DIST, Math.cos(tilt) * DIST, Math.sin(tilt) * Math.cos(yaw) * DIST);
      camera.lookAt(0, (BANDS - 1) * gap * 0.5, 0);
      camera.updateMatrixWorld();
      renderer.render(scene, camera);
      placeOverlay(c, gap);
    };
    const readout = (c: Pose) => {
      if (readoutRef.current)
        readoutRef.current.textContent = `Tilt ${String(Math.round(c.tilt)).padStart(2, "0")}° · Lift ${Math.max(0, c.lift).toFixed(2)}`;
    };

    let raf = 0, frame = 0;
    const t0 = performance.now();
    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      s += (target - s) * 0.085;
      const c = choreo(s);
      const drift = 0.08 * Math.sin(((now - t0) / 1000) * 0.21) * (1 - 0.6 * Math.max(0, c.lift));
      draw(c, drift);
      if (++frame % 6 === 0) readout(c);
    };
    const start = () => { if (!raf && !reduced) raf = requestAnimationFrame(tick); };
    const stop = () => { cancelAnimationFrame(raf); raf = 0; };
    const onVisibility = () => (document.hidden ? stop() : start());
    const onResize = () => { resize(); onScroll(); if (reduced) draw(STATIC, 0); };

    resize();
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    document.addEventListener("visibilitychange", onVisibility);

    // the overlay's text nodes mount on the next render; place them once they exist
    const firstPlace = requestAnimationFrame(() => { if (reduced) { draw(STATIC, 0); readout(STATIC); } });
    if (reduced) { draw(STATIC, 0); readout(STATIC); } else start();

    return () => {
      stop();
      cancelAnimationFrame(firstPlace);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVisibility);
      geo.dispose();
      mats.forEach((m) => m.dispose());
      tex.dispose();
      renderer.dispose();
    };
  }, [readoutRef]);

  return (
    <div className="chart-scene" aria-hidden="true">
      {fallback ? <ContourFallback /> : <canvas ref={canvasRef} />}
      {!fallback && (
        <svg className="chart-overlay" ref={overlayRef} viewBox="0 0 1440 900" preserveAspectRatio="none">
          {soundings.map((p) => (
            <text key={`${p.u}-${p.v}`} data-u={p.u} data-v={p.v} data-h={p.h} style={{ display: "none" }}>{p.m}</text>
          ))}
          <text className="chart-water-name" style={{ display: "none" }}>Halifax Harbour</text>
        </svg>
      )}
    </div>
  );
}

/** No WebGL: the same survey as ink contour lines over the band colours. */
function ContourFallback() {
  const n = 96;
  const field = buildField(n);
  const map = (x: number, y: number): [number, number] => [x * 900, (1 - y) * 900];
  const levels = Array.from({ length: BANDS - 1 }, (_, i) => (i + 1) / BANDS);
  return (
    <svg className="chart-contours-fallback" viewBox="0 0 900 900" preserveAspectRatio="xMidYMid slice">
      <rect width="900" height="900" fill={`#${BAND_HEX[0].toString(16).padStart(6, "0")}`} />
      {levels.map((lv) => <path key={lv} d={isolinePath(field, n, lv, map)} fill="none" stroke="#111418" strokeWidth="0.9" />)}
    </svg>
  );
}
