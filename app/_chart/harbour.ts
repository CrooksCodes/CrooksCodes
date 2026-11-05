/**
 * The one survey. Every drawing of the harbour on this sheet (the 3D relief,
 * the backdrop contours, the soundings, the no-WebGL fallback) reads from this
 * field, so the chart and the relief are the same harbour.
 *
 * Coordinates: u, v in [-REACH, REACH] scene units; height h in [0, 1] where
 * 0 is the channel floor, WATERLINE is the shore, 1 the high ground.
 */

export const REACH = 2.1;
export const WATERLINE = 0.75;
export const BANDS = 8; // 0..5 water, 6..7 land
export const BAND_HEX = [0x6fafd3, 0x86bcdb, 0x9cc9e3, 0xb6d9ec, 0xcfe6f2, 0xe3f0f7, 0xf1e3b3, 0xe6d59f];
export const INK_HEX = 0x111418;

/** Metres, for soundings: channel floor is about 32 m, the shore 0. */
export const depthMetres = (h: number) => Math.max(0, Math.round(((WATERLINE - h) / WATERLINE) * 32));

// deterministic value noise, so the harbour is the same on every visit
function hash2(ix: number, iy: number) {
  let n = Math.imul(ix, 374761393) + Math.imul(iy, 668265263) + 0x1b873593;
  n = Math.imul(n ^ (n >>> 13), 1274126177);
  n ^= n >>> 16;
  return (n >>> 0) / 4294967296;
}
function vnoise(x: number, y: number) {
  const ix = Math.floor(x), iy = Math.floor(y);
  const fx = x - ix, fy = y - iy;
  const u = fx * fx * (3 - 2 * fx), v = fy * fy * (3 - 2 * fy);
  const a = hash2(ix, iy), b = hash2(ix + 1, iy), c = hash2(ix, iy + 1), d = hash2(ix + 1, iy + 1);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}
// three octaves only: a surveyed seabed is smooth at chart scale
function fbm(x: number, y: number) {
  let sum = 0, amp = 0.5, f = 1, norm = 0;
  for (let i = 0; i < 3; i++) { sum += amp * vnoise(x * f, y * f); norm += amp; amp *= 0.5; f *= 2.07; }
  return sum / norm;
}
const sm = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

/** Seabed height at (u, v), both in [-1, 1] authoring space. */
export function harbour(u: number, v: number) {
  // the channel runs corner to corner with a lazy bend; a basin opens near the far end
  const ax = 0.72, ay = 0.69;
  const t = u * ax + v * ay;
  const perp = -u * ay + v * ax;
  const d = Math.abs(perp - 0.16 * Math.sin(t * 2.6 + 0.8));
  const n = fbm(u * 1.7 + 3.1, v * 1.7 + 7.7);
  const channel = Math.exp(-(d * d) / (0.26 * 0.26));
  const basin = Math.exp(-((u - 0.5) ** 2 + (v - 0.6) ** 2) / (0.42 * 0.42));
  const water = Math.max(channel, basin * 0.95);
  const shore = sm(0.34, 0.86, d + (n - 0.5) * 0.55) * (1 - basin);
  const waterH = 0.64 - 0.58 * water + 0.16 * (n - 0.5);
  const landH = 0.78 + 0.2 * n + 0.06 * shore;
  return Math.min(1, Math.max(0, waterH * (1 - shore) + landH * shore));
}

/** Sample the field on an n×n grid over [-reach, reach]². Row-major, v up. */
export function buildField(n: number, reach = REACH) {
  const f = new Float32Array(n * n);
  for (let j = 0; j < n; j++) {
    const v = ((j / (n - 1)) * 2 - 1) * reach;
    for (let i = 0; i < n; i++) {
      const u = ((i / (n - 1)) * 2 - 1) * reach;
      f[j * n + i] = harbour(u, v);
    }
  }
  return f;
}

/**
 * Marching squares. Returns the isoline at `level` as line segments
 * [x1, y1, x2, y2] in grid space [0, 1]² (y up, matching the field).
 */
export function isoline(field: Float32Array, n: number, level: number) {
  const segs: number[] = [];
  const at = (i: number, j: number) => field[j * n + i];
  const lerp = (a: number, b: number) => (level - a) / (b - a || 1e-6);
  for (let j = 0; j < n - 1; j++) {
    for (let i = 0; i < n - 1; i++) {
      const a = at(i, j), b = at(i + 1, j), c = at(i + 1, j + 1), d = at(i, j + 1);
      const code = (a >= level ? 1 : 0) | (b >= level ? 2 : 0) | (c >= level ? 4 : 0) | (d >= level ? 8 : 0);
      if (code === 0 || code === 15) continue;
      const x0 = i / (n - 1), y0 = j / (n - 1), s = 1 / (n - 1);
      // edge midpoints: bottom (a-b), right (b-c), top (d-c), left (a-d)
      const B = [x0 + s * lerp(a, b), y0], R = [x0 + s, y0 + s * lerp(b, c)];
      const T = [x0 + s * lerp(d, c), y0 + s], L = [x0, y0 + s * lerp(a, d)];
      const push = (p: number[], q: number[]) => segs.push(p[0], p[1], q[0], q[1]);
      switch (code) {
        case 1: case 14: push(L, B); break;
        case 2: case 13: push(B, R); break;
        case 3: case 12: push(L, R); break;
        case 4: case 11: push(R, T); break;
        case 5: push(L, T); push(B, R); break;
        case 6: case 9: push(B, T); break;
        case 7: case 8: push(L, T); break;
        case 10: push(L, B); push(R, T); break;
      }
    }
  }
  return segs;
}

/** An SVG path `d` for one isoline, mapped through `map` (grid [0,1]² → page). */
export function isolinePath(field: Float32Array, n: number, level: number, map: (x: number, y: number) => [number, number]) {
  const segs = isoline(field, n, level);
  let d = "";
  for (let k = 0; k < segs.length; k += 4) {
    const [x1, y1] = map(segs[k], segs[k + 1]);
    const [x2, y2] = map(segs[k + 2], segs[k + 3]);
    d += `M${x1.toFixed(1)} ${y1.toFixed(1)}L${x2.toFixed(1)} ${y2.toFixed(1)}`;
  }
  return d;
}
