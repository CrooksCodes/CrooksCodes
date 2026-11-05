"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { MeshoptDecoder } from "three/examples/jsm/libs/meshopt_decoder.module.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { DOOR, LOCKS, SCENE_SECTIONS } from "./lockSpec";

/**
 * The door: a matte clay model built in Blender (blender/build_door.py exports
 * public/models/door.glb), floating on the page with no frame of its own. It
 * sits behind the sheet and travels to whichever side the current block's text
 * is not on. Each block releases one lock; the title block opens the door.
 * Frames are only drawn while something is moving.
 */

const ease = (x: number) => { const t = Math.min(1, Math.max(0, x)); return t * t * (3 - 2 * t); };
/** Overshoots a little at the end, like a bolt clacking home. */
const back = (x: number) => { const t = Math.min(1, Math.max(0, x)); const c = 1.7; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); };
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const clamp01 = (x: number) => Math.min(1, Math.max(0, x));

/** Where the door rests: the model point (fx, fy) at screen offset sx (fraction of width), showing h units of height. */
type Shot = { fx: number; fy: number; h: number; sx: number; rx: number; ry: number };
const mixShot = (a: Shot, b: Shot, t: number): Shot => ({
  fx: lerp(a.fx, b.fx, t), fy: lerp(a.fy, b.fy, t), h: lerp(a.h, b.h, t),
  sx: lerp(a.sx, b.sx, t), rx: lerp(a.rx, b.rx, t), ry: lerp(a.ry, b.ry, t),
});

const ENTER_SECONDS = 1.7;
const ENTER: Shot = { fx: 10, fy: -3, h: 46, sx: 0.72, rx: 0.1, ry: -1.0 };

function shotsFor(phone: boolean): Shot[] {
  const [a, b, c, d, e] = LOCKS.map((l) => l.y);
  if (phone) {
    const close = (y: number, ry: number): Shot => ({ fx: 3, fy: y, h: 19, sx: 0, rx: 0.04, ry });
    return [
      { fx: 10, fy: 0, h: 52, sx: 0, rx: 0.05, ry: -0.22 },
      close(a, -0.14), close(b, 0.14), close(c, -0.14), close(d, 0.14), close(e, -0.14),
      { fx: 11, fy: -3, h: 62, sx: 0, rx: 0.08, ry: -0.12 },
    ];
  }
  // text left, door right; text right, door left. The visible half is centred on the hardware.
  const right = (y: number): Shot => ({ fx: 3.5, fy: y, h: 30, sx: 0.23, rx: 0.05, ry: -0.3 });
  const left = (y: number): Shot => ({ fx: 3.5, fy: y, h: 30, sx: -0.23, rx: 0.05, ry: 0.3 });
  return [
    { fx: 10.5, fy: 0.5, h: 80, sx: 0.225, rx: 0.05, ry: -0.3 },
    // the projects column is wider, so the door pulls back into the narrower side
    right(a), { fx: 3.5, fy: b, h: 36, sx: -0.315, rx: 0.05, ry: 0.3 }, right(c), left(d), right(e),
    // the swung leaf sits toward the viewer on the hinge side, leaving the lit opening clear
    { fx: 9, fy: -3, h: 76, sx: -0.25, rx: 0.08, ry: -0.1 },
  ];
}

/** Paints a small canvas once, for the soft light and shadow the model doesn't carry. */
function painted(w: number, h: number, paint: (c: CanvasRenderingContext2D) => void) {
  const canvas = document.createElement("canvas");
  canvas.width = w; canvas.height = h;
  paint(canvas.getContext("2d")!);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export default function LockScene() {
  const hostRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const readoutRef = useRef<HTMLSpanElement>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const host = hostRef.current, canvas = canvasRef.current, readout = readoutRef.current;
    if (!host || !canvas || !readout) return;
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    } catch {
      // the sheet reads fine without its figure: shutters stay open unless the scene closes them
      const id = requestAnimationFrame(() => setFailed(true));
      return () => cancelAnimationFrame(id);
    }
    renderer.setClearColor(0x000000, 0);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    renderer.shadowMap.autoUpdate = false;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const phone = matchMedia("(max-width: 900px), (max-aspect-ratio: 1/1)");
    const keepQuality = new URLSearchParams(location.search).has("hq");

    // ── scene: clay under one warm key and a cool rim ─────────────
    const scene = new THREE.Scene();
    const pmrem = new THREE.PMREMGenerator(renderer);
    scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environmentIntensity = 0.5;
    pmrem.dispose();
    const camera = new THREE.PerspectiveCamera(26, 1, 10, 500);
    const keyLight = new THREE.DirectionalLight(0xffebd2, 3.0);
    keyLight.position.set(-24, 34, 50);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.set(1024, 1024);
    Object.assign(keyLight.shadow.camera, { left: -38, right: 38, top: 38, bottom: -38, near: 1, far: 140 });
    keyLight.shadow.bias = -0.0006; keyLight.shadow.normalBias = 0.08; keyLight.shadow.radius = 5;
    const rimLight = new THREE.DirectionalLight(0x9fb4c8, 1.1);
    rimLight.position.set(34, 6, -24);
    const rig = new THREE.Group();       // holds the pose: turn and screen position
    const content = new THREE.Group();   // offsets the model so the pose turns about its focus
    rig.add(content, keyLight, keyLight.target, rimLight);
    keyLight.target.position.set(10, 0, 0);
    scene.add(rig, new THREE.AmbientLight(0xb8c2cc, 0.18));

    const jamb = new THREE.Group();
    const door = new THREE.Group();
    door.position.x = DOOR.hinge;
    const leaf = new THREE.Group();
    leaf.position.x = -DOOR.hinge;
    door.add(leaf);
    content.add(jamb, door);

    // ── what the model doesn't carry: the lit room behind the door, the light it lets out, its shadow on the paper ──
    const flat = (w: number, h: number, material: THREE.Material, x: number, y: number, z: number) => {
      const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), material);
      m.position.set(x, y, z);
      return m;
    };
    const room = new THREE.MeshBasicMaterial({
      toneMapped: false,
      map: painted(128, 180, (c) => {
        const g = c.createRadialGradient(64, 110, 6, 64, 96, 130);
        g.addColorStop(0, "#ffe2b4"); g.addColorStop(0.4, "#f3ab62"); g.addColorStop(0.8, "#a9591f"); g.addColorStop(1, "#5c2c10");
        c.fillStyle = g; c.fillRect(0, 0, 128, 180);
      }),
    });
    const ROOM_DARK = new THREE.Color(0x0d0f12), ROOM_LIT = new THREE.Color(0xffffff);
    room.color.copy(ROOM_DARK);
    jamb.add(flat(32, 47, room, 15.3, 0, -4.4));
    const spill = new THREE.MeshBasicMaterial({
      transparent: true, depthWrite: false, toneMapped: false, opacity: 0,
      map: painted(128, 128, (c) => {
        // per pixel, so the pool's edge and falloff stay smooth: narrow at the sill, widening and fading out
        const img = c.createImageData(128, 128);
        for (let y = 0; y < 128; y++) {
          const t = y / 127;
          const half = lerp(0.2, 0.38, t), edge = 0.05 + 0.1 * t;
          for (let x = 0; x < 128; x++) {
            const side = clamp01((half + edge - Math.abs(x / 127 - 0.5)) / (2 * edge));
            const i = (y * 128 + x) * 4;
            img.data.set([240, 165, 90, 255 * 0.72 * Math.pow(1 - t, 1.7) * side * side * (3 - 2 * side)], i);
          }
        }
        c.putImageData(img, 0, 0);
      }),
    });
    const spillMesh = flat(56, 44, spill, 15.3, DOOR.bottom - 2.4, 22.6);
    spillMesh.rotation.x = -Math.PI / 2;
    const shade = new THREE.MeshBasicMaterial({
      transparent: true, depthWrite: false, toneMapped: false,
      map: painted(128, 128, (c) => {
        // the rectangle is drawn off the canvas; only its blurred shadow lands on it
        c.shadowColor = "rgba(26,28,31,0.38)"; c.shadowBlur = 16; c.shadowOffsetX = 256;
        c.fillStyle = "#000"; c.fillRect(22 - 256, 20, 84, 88);
      }),
    });
    const shadeMesh = flat(70, 62, shade, 11, -3.4, -6);
    shadeMesh.renderOrder = -1;
    const roomLight = new THREE.PointLight(0xffb36b, 0, 70, 1.4);
    roomLight.position.set(15, 0, -1);
    content.add(spillMesh, shadeMesh, roomLight);

    const [L1, L2, L3, L4, L5] = LOCKS;
    const Z = 0.6; // the leaf's front plane; hardware sits on it
    const at = (x: number, y: number, z: number, parent: THREE.Object3D) => {
      const g = new THREE.Group();
      g.position.set(x, y, z);
      parent.add(g);
      return g;
    };
    const barrel = at(1, L1.y, Z + 1.4, leaf);
    const bolt = at(-2, L2.y, 0.2, leaf);
    const thumb = at(8, L2.y, Z + 1.9, leaf);
    const slider = at(2.6, L3.y, Z + 1.3, leaf);
    const anchorRing = at(-2, L3.y, 1.1, jamb);
    const hasp = at(10, L4.y, Z + 0.9, leaf);
    const padlock = at(-2.5, L4.y, 1, jamb);
    const shackle = at(0, -1.6, 0, padlock);
    const hook = at(8, L5.y, Z + 0.6, leaf);
    const links: THREE.Mesh[] = [];
    for (let i = 0; i < 12; i++) { const l = new THREE.Mesh(); l.castShadow = true; l.visible = false; content.add(l); links.push(l); }

    // ── sizing ────────────────────────────────────────────────────
    let W = 1, H = 1, shots = shotsFor(phone.matches);
    let quality = 0;   // 0 full, 1 lower resolution, 2 no shadows too
    const applyPixelRatio = () => {
      const cap = quality > 0 ? 1 : 1.5;
      renderer.setPixelRatio(Math.min(devicePixelRatio || 1, cap));
      renderer.setSize(W, H, false);
    };
    const layout = () => {
      W = host.clientWidth || 1; H = host.clientHeight || 1;
      shots = shotsFor(phone.matches);
      camera.aspect = W / H;
      applyPixelRatio();
    };

    // ── scroll → one release per lock, one for the door, one position along the shots ──
    // block positions are cached so scrolling never forces a layout read
    const sectionEls = SCENE_SECTIONS.map((id) => document.getElementById(id));
    let tops: number[] = [];
    let viewH = 1;
    const measure = () => {
      viewH = innerHeight;
      tops = sectionEls.map((el) => (el ? el.getBoundingClientRect().top + scrollY : Infinity));
    };
    const target = { r: [0, 0, 0, 0, 0], door: 0, u: -1, gate: [0, 0, 0, 0, 0, 0] };
    const cur = { r: [0, 0, 0, 0, 0], door: 0, u: -1, gate: [0, 0, 0, 0, 0, 0] };
    const readScroll = () => {
      const ref = scrollY + viewH * 0.62;
      const last = tops.findLastIndex((t) => ref >= t);   // -1 while on the hero
      const r = [0, 0, 0, 0, 0];
      // each lock runs as its block climbs from 72% of the way down the screen to 30%
      const release = scrollY + viewH * 0.72;
      for (let i = 0; i < 5; i++) r[i] = clamp01((release - tops[i]) / (viewH * 0.42));
      target.r = r;
      target.door = clamp01((release - tops[5]) / (viewH * 0.42));
      // the lid is gone before the block is high enough to read: fully open by 68% down the screen
      target.gate = tops.map((t) => clamp01((scrollY + viewH * 0.98 - t) / (viewH * 0.3)));
      // reduced motion: the same story in stills. Each state cuts to the next, nothing travels
      if (reduced) {
        target.r = r.map((v) => (v > 0 ? 1 : 0));
        target.door = target.door > 0 ? 1 : 0;
        target.gate.fill(1);
      }
      // the door arrives at the next lock just before its block starts releasing it
      const next = tops[last + 1];
      const travel = next === undefined ? 0 : clamp01((ref - (next - viewH * 0.5)) / (viewH * 0.5));
      target.u = reduced ? last : last + travel;
    };

    // each lid retracts just ahead of its lock; written straight to the one element that moves
    const gates = sectionEls.map((el) => ({
      shutter: el?.querySelector<HTMLElement>(".block-shutter") ?? null,
      value: -1,
    }));
    const publish = (i: number, v: number) => {
      const g = gates[i];
      const q = Math.round(clamp01(v) * 50) / 50;
      if (!g.shutter || g.value === q) return;
      g.value = q;
      g.shutter.style.clipPath = `inset(${q * 100}% 0 0 0)`;
    };

    // ── frame loop: runs only until everything has settled ────────
    const shot: Shot = { ...shots[0] };
    const tmpA = new THREE.Vector3(), tmpB = new THREE.Vector3(), tmpP = new THREE.Vector3();
    let raf = 0, last = 0, lastText = "", ready = false, enter = reduced ? 1 : 0;
    let slowFrames = 0, frameCount = 0;
    const wake = () => { if (!raf && ready) { last = performance.now(); raf = requestAnimationFrame(tick); } };

    const tick = (now: number) => {
      raf = 0;
      if (document.hidden) return;
      const dt = Math.min(0.05, (now - last) / 1000); last = now;

      // heavy device: step resolution down, then shadows, once
      if (!keepQuality && quality < 2) {
        frameCount++;
        if (dt > 0.03) slowFrames++;
        if (frameCount >= 24) {
          if (slowFrames > 12) {
            quality++;
            applyPixelRatio();
            if (quality === 2) { keyLight.castShadow = false; renderer.shadowMap.enabled = false; scene.traverse((o) => { const m = (o as THREE.Mesh).material as THREE.Material | undefined; if (m) m.needsUpdate = true; }); }
          }
          frameCount = 0; slowFrames = 0;
        }
      }

      const k = reduced ? 1 : 1 - Math.exp(-dt * 8), kd = reduced ? 1 : 1 - Math.exp(-dt * 4.5), ku = reduced ? 1 : 1 - Math.exp(-dt * 4);
      let moving = false;
      const step = (from: number, to: number, f: number) => {
        const d = to - from;
        if (Math.abs(d) < 0.0008) return to;
        moving = true;
        return from + d * f;
      };
      for (let i = 0; i < 5; i++) cur.r[i] = step(cur.r[i], target.r[i], k);
      cur.door = step(cur.door, target.door, kd);
      cur.u = step(cur.u, target.u, ku);
      if (enter < 1) { enter = Math.min(1, enter + dt / ENTER_SECONDS); moving = true; }

      for (let i = 0; i < 6; i++) { cur.gate[i] = step(cur.gate[i], target.gate[i], k); publish(i, cur.gate[i]); }

      // load-in: the door swings in from the right and its locks throw shut, top to bottom
      const engaged = (i: number) => reduced ? 1 : ease((enter - 0.34 - i * 0.11) / 0.14);
      const rel = (i: number) => Math.max(cur.r[i], 1 - engaged(i));
      const [r1, r2, r3, r4, r5] = [rel(0), rel(1), rel(2), rel(3), rel(4)];
      const open = ease(cur.door);

      // pose: along the shots by scroll, with a pull-back in the middle of each move
      const n = Math.max(0, Math.min(5, Math.floor(cur.u + 1)));
      const f = ease(cur.u + 1 - n);
      const live = mixShot(shots[n], shots[Math.min(6, n + 1)], f);
      live.h *= 1 + 0.22 * Math.sin(f * Math.PI) * (n >= 1 && n <= 4 ? 1 : 0);
      const arrive = 1 - Math.pow(1 - enter, 3.2);
      Object.assign(shot, phone.matches || reduced ? live : mixShot(ENTER, live, arrive));

      const dist = shot.h / (2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)));
      camera.position.set(0, 0, dist);
      camera.updateProjectionMatrix();
      rig.position.set(shot.sx * shot.h * camera.aspect, 0, 0);
      rig.rotation.set(shot.rx, shot.ry, 0);
      content.position.set(-shot.fx, -shot.fy, 0);
      door.rotation.y = open * (DOOR.openDeg * Math.PI) / 180;
      room.color.lerpColors(ROOM_DARK, ROOM_LIT, open);
      spill.opacity = open;
      spillMesh.visible = open > 0.01;
      roomLight.intensity = 90 * open;
      rimLight.intensity = lerp(1.1, 0.35, open);   // a raking rim would exaggerate the dents on the swung leaf

      // 1 · barrel slides clear of the keep and clacks against its stop
      barrel.position.x = 1 + 7 * back(r1);
      // 2 · thumbturn, then the bolt snaps back into the case
      thumb.rotation.z = -(Math.PI / 2) * back(r2 / 0.5);
      bolt.position.x = -2 + 7 * back((r2 - 0.3) / 0.7);
      // 3 · the slider runs to the wide end of the slot, then the chain drops
      const slide = ease(r3 / 0.6), drop = ease((r3 - 0.6) / 0.4);
      slider.position.x = 2.6 + 6.8 * slide;
      slider.visible = drop < 0.5;
      scene.updateMatrixWorld();
      content.worldToLocal(anchorRing.getWorldPosition(tmpA));
      if (drop < 0.5) content.worldToLocal(slider.getWorldPosition(tmpB));
      else { tmpB.copy(tmpA); tmpB.y -= 6.5; tmpB.x += 0.4; }
      const sag = 1.2 * (1 - drop);
      const run = tmpA.distanceTo(tmpB) + sag * 1.2;
      const nLinks = Math.max(3, Math.min(links.length, Math.round(run / 1.1)));
      links.forEach((l, i) => {
        l.visible = i < nLinks;
        if (i >= nLinks) return;
        const u = (i + 0.5) / nLinks;
        tmpP.lerpVectors(tmpA, tmpB, u);
        tmpP.y -= sag * 4 * u * (1 - u);
        l.position.copy(tmpP);
        l.rotation.set(0, (i % 2) * Math.PI / 2, Math.atan2(tmpB.y - tmpA.y, tmpB.x - tmpA.x));
      });
      // 4 · shackle lifts, the padlock drops away, the hasp swings off the staple
      shackle.position.y = -1.6 + 1.8 * ease(r4 / 0.3);
      const fall = clamp01((r4 - 0.3) / 0.4);
      padlock.position.y = lerp(L4.y, DOOR.bottom + 2.4, fall * fall) + 1.2 * Math.sin(fall * Math.PI) * (1 - fall);
      padlock.position.x = -2.5 - 4.5 * fall;
      padlock.rotation.z = 1.25 * fall;
      hasp.rotation.z = (100 * Math.PI / 180) * back((r4 - 0.55) / 0.45);
      // 5 · the hook swings off its eye
      hook.rotation.z = (30 * Math.PI / 180) * back(r5);

      renderer.shadowMap.needsUpdate = true;
      renderer.render(scene, camera);

      const released = cur.r.filter((v) => v > 0.95).length;
      const text = open > 0.02 ? `DOOR OPEN ${Math.round(open * DOOR.openDeg)}°` : `LOCKS ${released}/5 · DOOR CLOSED`;
      if (text !== lastText) { readout.textContent = text; lastText = text; }

      if (moving) raf = requestAnimationFrame(tick);
    };

    // ── wiring ────────────────────────────────────────────────────
    const onScroll = () => { readScroll(); wake(); };
    const onResize = () => { layout(); measure(); readScroll(); wake(); };
    const onVis = () => { wake(); };
    const ro = new ResizeObserver(onResize);
    const contentEl = document.querySelector(".content");
    layout(); measure(); readScroll();
    Object.assign(cur, { r: [...target.r], door: target.door, u: target.u, gate: [...target.gate] });

    let disposed = false;
    new GLTFLoader().setMeshoptDecoder(MeshoptDecoder).load("/models/door.glb", (gltf) => {
      if (disposed) return;
      const model = gltf.scene;
      const link = model.getObjectByName("link") as THREE.Mesh | undefined;
      const mounts: [string, THREE.Object3D][] = [["jamb", jamb], ["leaf", leaf], ["barrel", barrel], ["bolt", bolt], ["thumb", thumb], ["slider", slider], ["anchorRing", anchorRing], ["hasp", hasp], ["padlock", padlock], ["shackle", shackle], ["hook", hook]];
      if (!link?.isMesh || mounts.some(([name]) => !model.getObjectByName(name))) { setFailed(true); return; }
      links.forEach((l) => { l.geometry = link.geometry; l.material = link.material; });
      for (const [name, into] of mounts) {
        const node = model.getObjectByName(name)!;
        node.position.set(0, 0, 0);
        node.traverse((o) => { if ((o as THREE.Mesh).isMesh) { o.castShadow = true; o.receiveShadow = true; } });
        into.add(node);
      }
      // past the hero on arrival (a reload, an anchor): skip the entrance
      if (scrollY > viewH * 0.3) enter = 1;
      ready = true;
      canvas.classList.add("is-ready");
      if (contentEl) ro.observe(contentEl);
      addEventListener("scroll", onScroll, { passive: true });
      wake();
    }, undefined, () => { if (!disposed) setFailed(true); });

    addEventListener("resize", onResize);
    document.addEventListener("visibilitychange", onVis);
    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      ro.disconnect();
      removeEventListener("scroll", onScroll);
      removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVis);
      scene.traverse((o) => {
        const m = o as THREE.Mesh;
        m.geometry?.dispose?.();
        const mat = m.material as THREE.Material | THREE.Material[] | undefined;
        for (const x of Array.isArray(mat) ? mat : mat ? [mat] : []) {
          for (const v of Object.values(x)) if ((v as THREE.Texture | null)?.isTexture) (v as THREE.Texture).dispose();
          x.dispose();
        }
      });
      scene.environment?.dispose();
      renderer.dispose();
      gates.forEach((g) => { g.shutter?.style.removeProperty("clip-path"); });
    };
  }, []);

  // without the figure, the phone layout gives back the space it reserved for the door
  useEffect(() => {
    document.documentElement.classList.toggle("no-figure", failed);
  }, [failed]);

  if (failed) return null;
  return (
    <div className="lock-stage" ref={hostRef} aria-hidden="true">
      <canvas ref={canvasRef} className="lock-canvas" />
      <span className="lock-readout" ref={readoutRef}>LOCKS 0/5 · DOOR CLOSED</span>
    </div>
  );
}
